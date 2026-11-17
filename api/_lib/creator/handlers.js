/* HTTP layer for creator onboarding (plain Node req/res, so it also runs in the Vite dev middleware).

   Creator API  /api/creator/<op>        authorised by the invitation token in `Authorization: Bearer <token>`
                                         (never in a URL, so it cannot end up in access logs or Referer headers).
   Owner API    /api/creator-admin/<op>  authorised by an HttpOnly, SameSite=Strict, HMAC-signed session cookie
                                         obtained by POST /login with CREATOR_ADMIN_PASSWORD (checked on the server,
                                         constant time, rate limited).

   Both: same-origin only for anything that changes state, no caching, noindex, no referrer. */

import { waitUntil } from '@vercel/functions'
import { creatorConfig, MIN_ADMIN_PASSWORD, MIN_SESSION_SECRET } from './config.js'
import { storeFromConfig } from './store.js'
import { cloudflare } from './cloudflare.js'
import { createService, CreatorError } from './service.js'
import { allow, clientIp } from './ratelimit.js'
import { safeEqual, signSession, verifySession } from './crypto.js'
import { PHOTO_MAX_BYTES } from '../../../src/lib/creator/constants.js'
import { isSameOrigin } from '../subscribe.js'
import { readJson } from '../http.js'
import { sendOwnerAlert } from '../notify.js'
import { SITE_URL } from '../../../src/config.js'

const MAX_JSON_BYTES = 32 * 1024
const ADMIN_SESSION_MS = 8 * 3600_000
const COOKIE = 'convrt_creator_admin'

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
}

function reply(res, status, body, headers = {}) {
  res.statusCode = status
  for (const [k, v] of Object.entries({ ...SECURITY_HEADERS, ...headers })) res.setHeader(k, v)
  if (Buffer.isBuffer(body)) return res.end(body)
  if (typeof body === 'string') return res.end(body)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.end(JSON.stringify(body))
}

/* Builds everything the handlers need from the environment. Tests pass their own deps instead. */
export function buildDeps(env = process.env, { fetchImpl = globalThis.fetch, now, store: storeOverride } = {}) {
  const cfg = creatorConfig(env)
  const store = storeOverride || storeFromConfig(cfg, fetchImpl)
  const cf = cloudflare(cfg, fetchImpl)
  const log = (kind, detail) => console.error(`[creator] ${kind}`, detail || '') // eslint-disable-line no-console
  const notify = (alert) => sendOwnerAlert(alert, { env, fetchImpl, log })
  const service = store ? createService({ store, cf, cfg, notify, log, now, env, waitUntil }) : null
  return { cfg, store, cf, service, log, env, now: now || (() => Date.now()) }
}

const opOf = (req) => new URL(req.url || '/', 'http://x').pathname.replace(/\/+$/, '').split('/').pop()

async function readRaw(req, maxBytes) {
  if (Buffer.isBuffer(req.body)) return req.body.length <= maxBytes ? req.body : null
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) return null
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/* A signed agreement download: a PDF, or (legacy records / unsupported scripts) a printable HTML copy. */
function sendAgreement(res, r) {
  return reply(res, 200, r.body, {
    'Content-Type': r.contentType,
    'Content-Disposition': `attachment; filename="${r.filename}"`,
    ...(r.contentType.startsWith('text/html') ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
  })
}

function guardMethod(req, res, allowed) {
  if (req.method === allowed) return true
  reply(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: allowed })
  return false
}

function guardOrigin(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (req.method !== 'GET' && !isSameOrigin(req.headers.origin, host)) {
    reply(res, 403, { ok: false, error: 'forbidden' })
    return false
  }
  return true
}

function failure(res, err, deps) {
  if (err instanceof CreatorError) return reply(res, err.status, { ok: false, error: err.code, ...err.extra })
  deps.log('unexpected', { name: err?.name, message: err?.message })
  return reply(res, 500, { ok: false, error: 'unavailable' })
}

const baseUrl = (req, deps) =>
  deps.cfg.isProduction ? SITE_URL : `https://${req.headers['x-forwarded-host'] || req.headers.host}`

/* ───────────── creator API ───────────── */

const CREATOR_OPS = {
  session: 'GET',
  draft: 'POST',
  'video-upload': 'POST',
  'video-status': 'POST',
  'video-preview': 'GET',
  'video-remove': 'POST',
  photo: ['GET', 'POST', 'DELETE'],
  submit: 'POST',
  agreement: 'GET',
}

export async function creatorHandler(req, res, deps = buildDeps()) {
  try {
    const op = opOf(req)
    const allowed = CREATOR_OPS[op]
    if (!allowed) return reply(res, 404, { ok: false, error: 'not_found' })
    if (![].concat(allowed).includes(req.method)) return reply(res, 405, { ok: false, error: 'method_not_allowed' })
    if (!guardOrigin(req, res)) return
    if (!deps.service) return reply(res, 503, { ok: false, error: 'not_configured' })
    const { service, store } = deps

    // Throttle by caller before touching anything (invite guessing, upload abuse). Generous for real people.
    const ip = clientIp(req)
    if (!(await allow(store, { bucket: 'creator', id: ip, max: 300, windowSec: 3600 }))) {
      return reply(res, 429, { ok: false, error: 'rate_limited' })
    }

    const auth = String(req.headers.authorization || '')
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
    const url = new URL(req.url || '/', 'http://x')
    const writes = !['session', 'video-preview', 'agreement'].includes(op) && !(op === 'photo' && req.method === 'GET')

    // Bad tokens are throttled hard, separately: a random token is ~256 bits, but there is no reason to allow guessing.
    let inv
    try {
      inv = await service.resolve(token, { write: writes })
    } catch (err) {
      if (err instanceof CreatorError && err.status === 401 && !(await allow(store, { bucket: 'badtoken', id: ip, max: 20, windowSec: 900 }))) {
        return reply(res, 429, { ok: false, error: 'rate_limited' })
      }
      throw err
    }

    switch (op) {
      case 'session':
        return reply(res, 200, { ok: true, ...(await service.session(inv)) })
      case 'draft': {
        const body = await readJson(req, MAX_JSON_BYTES)
        if (!body) return reply(res, 400, { ok: false, error: 'invalid_request' })
        return reply(res, 200, await service.saveDraft(inv, body))
      }
      case 'video-upload': {
        if (!(await allow(store, { bucket: 'video-upload', id: ip, max: 30, windowSec: 3600 }))) return reply(res, 429, { ok: false, error: 'rate_limited' })
        const body = await readJson(req, MAX_JSON_BYTES)
        if (!body) return reply(res, 400, { ok: false, error: 'invalid_request' })
        return reply(res, 200, { ok: true, ...(await service.videoUpload(inv, body)) })
      }
      case 'video-status': {
        const body = await readJson(req, MAX_JSON_BYTES)
        if (!body) return reply(res, 400, { ok: false, error: 'invalid_request' })
        return reply(res, 200, { ok: true, video: await service.videoStatus(inv, body) })
      }
      case 'video-preview':
        return reply(res, 200, { ok: true, ...(await service.videoPreview(inv, url.searchParams.get('slot'))) })
      case 'video-remove': {
        const body = await readJson(req, MAX_JSON_BYTES)
        if (!body) return reply(res, 400, { ok: false, error: 'invalid_request' })
        return reply(res, 200, await service.videoRemove(inv, body))
      }
      case 'photo': {
        if (req.method === 'GET') {
          const p = await service.photoGet(inv.id)
          return reply(res, 200, p.bytes, { 'Content-Type': p.type })
        }
        if (req.method === 'DELETE') return reply(res, 200, await service.photoRemove(inv))
        if (!(await allow(store, { bucket: 'photo', id: ip, max: 20, windowSec: 3600 }))) return reply(res, 429, { ok: false, error: 'rate_limited' })
        const raw = await readRaw(req, PHOTO_MAX_BYTES)
        if (raw === null) return reply(res, 413, { ok: false, error: 'photo_too_large' })
        return reply(res, 200, await service.photoPut(inv, raw))
      }
      case 'submit': {
        if (!(await allow(store, { bucket: 'submit', id: ip, max: 15, windowSec: 3600 }))) return reply(res, 429, { ok: false, error: 'rate_limited' })
        const body = await readJson(req, MAX_JSON_BYTES)
        if (!body) return reply(res, 400, { ok: false, error: 'invalid_request' })
        return reply(res, 200, await service.submit(inv, body, { reviewBaseUrl: baseUrl(req, deps) }))
      }
      case 'agreement': {
        return sendAgreement(res, await service.receipt(inv))
      }
      default:
        return reply(res, 404, { ok: false, error: 'not_found' })
    }
  } catch (err) {
    return failure(res, err, deps)
  }
}

/* ───────────── owner API ───────────── */

const ADMIN_OPS = {
  login: 'POST',
  logout: 'POST',
  me: 'GET',
  overview: 'GET',
  health: 'GET',
  'invite-create': 'POST',
  'invite-rotate': 'POST',
  'invite-revoke': 'POST',
  submission: 'GET',
  'video-token': 'GET',
  'video-download': 'GET',
  photo: 'GET',
  agreement: 'GET',
  'set-status': 'POST',
  withdraw: 'POST',
}

const parseCookies = (h) => Object.fromEntries(String(h || '').split(';').map((p) => p.trim().split(/=(.*)/s).slice(0, 2)).filter(([k]) => k))
const isHttps = (req) => (req.headers['x-forwarded-proto'] || 'http').split(',')[0] === 'https'
const cookieAttrs = (req) => `Path=/; HttpOnly; SameSite=Strict${isHttps(req) ? '; Secure' : ''}`

export async function adminHandler(req, res, deps = buildDeps()) {
  try {
    const op = opOf(req)
    const method = ADMIN_OPS[op]
    if (!method) return reply(res, 404, { ok: false, error: 'not_found' })
    if (req.method !== method) return reply(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: method })
    if (!guardOrigin(req, res)) return
    const { cfg, service, store } = deps
    if (!service) return reply(res, 503, { ok: false, error: 'not_configured' })
    if (cfg.adminPassword.length < MIN_ADMIN_PASSWORD || cfg.sessionSecret.length < MIN_SESSION_SECRET) {
      return reply(res, 503, { ok: false, error: 'admin_not_configured' })
    }
    const ip = clientIp(req)
    const url = new URL(req.url || '/', 'http://x')

    if (op === 'login') {
      if (!(await allow(store, { bucket: 'admin-login', id: ip, max: 5, windowSec: 900 })) ||
          !(await allow(store, { bucket: 'admin-login-all', id: 'all', max: 40, windowSec: 3600 }))) {
        return reply(res, 429, { ok: false, error: 'rate_limited' })
      }
      const body = await readJson(req, 2048)
      // Surrounding whitespace is ignored (it is a common copy/paste artefact); the stored password is trimmed the same way.
      if (!body || typeof body.password !== 'string' || !safeEqual(body.password.trim(), cfg.adminPassword)) {
        return reply(res, 401, { ok: false, error: 'invalid_credentials' })
      }
      const value = signSession({ role: 'owner', exp: deps.now() + ADMIN_SESSION_MS }, cfg.sessionSecret)
      return reply(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=${value}; Max-Age=${ADMIN_SESSION_MS / 1000}; ${cookieAttrs(req)}` })
    }
    if (op === 'logout') return reply(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; Max-Age=0; ${cookieAttrs(req)}` })

    const session = verifySession(parseCookies(req.headers.cookie)[COOKIE], cfg.sessionSecret, deps.now())
    if (!session) return reply(res, 401, { ok: false, error: 'unauthorized' })
    if (op === 'me') return reply(res, 200, { ok: true })

    const readBody = async () => {
      const b = await readJson(req, MAX_JSON_BYTES)
      if (!b) throw new CreatorError('invalid_request')
      return b
    }
    const id = String(url.searchParams.get('id') || '').slice(0, 20)

    switch (op) {
      case 'overview':
        return reply(res, 200, { ok: true, ...(await service.adminOverview()) })
      case 'health': {
        // Owner-only setup check. Reports presence (yes/no) of settings, never their values.
        let cloudflare = 'not_configured'
        if (deps.cf.configured) {
          try {
            await deps.cf.ping()
            cloudflare = 'ok'
          } catch (err) {
            cloudflare = `rejected_${err?.status ?? 'unreachable'}`
          }
        }
        return reply(res, 200, {
          ok: true,
          checks: {
            database: deps.store.kind,
            cloudflareAccountId: Boolean(cfg.accountId),
            cloudflareToken: Boolean(cfg.streamToken),
            cloudflare,
            ownerEmail: cfg.resendConfigured,
            // The region this very function is running in (Vercel sets VERCEL_REGION at runtime), e.g. "fra1".
            functionRegion: process.env.VERCEL_REGION || null,
            environment: cfg.isProduction ? 'production' : 'preview/development',
          },
        })
      }
      case 'invite-create': {
        const b = await readBody()
        const r = await service.createInvite({ label: b.label, source: b.source, expiresInDays: b.expiresInDays })
        return reply(res, 200, { ok: true, invite: r.invite, url: `${baseUrl(req, deps)}/creator-onboarding?invite=${r.token}` })
      }
      case 'invite-rotate': {
        const b = await readBody()
        const r = await service.rotateInvite(String(b.id))
        return reply(res, 200, { ok: true, invite: r.invite, url: `${baseUrl(req, deps)}/creator-onboarding?invite=${r.token}` })
      }
      case 'invite-revoke': {
        const b = await readBody()
        return reply(res, 200, { ok: true, invite: await service.revokeInvite(String(b.id)) })
      }
      case 'submission':
        return reply(res, 200, { ok: true, submission: await service.adminSubmission(id) })
      case 'video-token':
        return reply(res, 200, { ok: true, ...(await service.adminVideoToken(id, url.searchParams.get('slot'))) })
      case 'video-download':
        return reply(res, 200, { ok: true, ...(await service.adminVideoDownload(id, url.searchParams.get('slot'))) })
      case 'photo': {
        const p = await service.adminPhoto(id)
        return reply(res, 200, p.bytes, { 'Content-Type': p.type })
      }
      case 'agreement': {
        return sendAgreement(res, await service.adminReceipt(id))
      }
      case 'set-status': {
        const b = await readBody()
        return reply(res, 200, { ok: true, submission: await service.adminSetStatus(String(b.id), b.status, b.note) })
      }
      case 'withdraw': {
        const b = await readBody()
        return reply(res, 200, { ok: true, submission: await service.adminWithdraw(String(b.id), { requestedVia: b.requestedVia, note: b.note, deleteFiles: b.deleteFiles !== false }) })
      }
      default:
        return reply(res, 404, { ok: false, error: 'not_found' })
    }
  } catch (err) {
    return failure(res, err, deps)
  }
}

/* ───────────── daily retention job ───────────── */

/* GET /api/creator-cron, called once a day by Vercel Cron (vercel.json "crons"). Vercel sends
   "Authorization: Bearer $CRON_SECRET" when the CRON_SECRET environment variable is set; without it the job refuses to run. */
export async function cronHandler(req, res, deps = buildDeps()) {
  try {
    if (req.method !== 'GET') return reply(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'GET' })
    const secret = String(process.env.CRON_SECRET || (deps.env && deps.env.CRON_SECRET) || '')
    if (secret.length < 16) return reply(res, 503, { ok: false, error: 'cron_not_configured' })
    if (!safeEqual(String(req.headers.authorization || ''), `Bearer ${secret}`)) return reply(res, 401, { ok: false, error: 'unauthorized' })
    if (!deps.service) return reply(res, 503, { ok: false, error: 'not_configured' })
    return reply(res, 200, { ok: true, report: await deps.service.runRetention() })
  } catch (err) {
    return failure(res, err, deps)
  }
}
