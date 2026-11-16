// Shared test harness for creator onboarding: in-memory store, a fake Cloudflare Stream API, a fake Resend,
// and a minimal req/res to drive the real Vercel handlers. No network, no real credentials, no real creators.
import { Readable } from 'node:stream'
import { buildDeps, creatorHandler, adminHandler } from '../../api/_lib/creator/handlers.js'
import { memoryStore } from '../../api/_lib/creator/store.js'

export const ENV = {
  CLOUDFLARE_ACCOUNT_ID: 'acct123',
  CLOUDFLARE_STREAM_API_TOKEN: 'cf-token-secret',
  CREATOR_ADMIN_PASSWORD: 'correct horse battery staple 42',
  CREATOR_ADMIN_SESSION_SECRET: 'x'.repeat(48),
  CREATOR_STORE: 'memory',
  RESEND_API_KEY: 're_test_key',
}

export function fakeCloudflare() {
  const videos = new Map()
  const calls = []
  let n = 0
  const fetchImpl = async (url, init = {}) => {
    const method = init.method || 'GET'
    const body = init.body ? JSON.parse(init.body) : undefined
    const u = new URL(url)
    calls.push({ method, path: u.pathname, body, auth: init.headers?.Authorization })
    const ok = (result) => ({ ok: true, status: 200, json: async () => ({ success: true, result }) })
    const fail = (status) => ({ ok: false, status, json: async () => ({ success: false, errors: [{ code: 10003 }] }) })
    const m = u.pathname.match(/\/stream(?:\/([^/]+))?(?:\/(token))?$/)
    if (u.pathname.endsWith('/stream/direct_upload')) {
      const uid = `vid${++n}`
      videos.set(uid, { uid, requireSignedURLs: body.requireSignedURLs, meta: body.meta, creator: body.creator, maxDurationSeconds: body.maxDurationSeconds, status: { state: 'pendingupload' }, readyToStream: false, duration: -1, size: 0 })
      return ok({ uploadURL: `https://upload.example.test/${uid}`, uid })
    }
    if (u.pathname.endsWith('/stream/storage-usage') && method === 'GET') return ok({ totalStorageMinutes: 0, videoCount: videos.size })
    if (m?.[2] === 'token' && method === 'POST') {
      if (!videos.has(m[1])) return fail(404)
      return ok({ token: `signed-${m[1]}-${body.exp}` })
    }
    if (m?.[1] && method === 'GET') return videos.has(m[1]) ? ok(videos.get(m[1])) : fail(404)
    if (m?.[1] && method === 'DELETE') {
      if (!videos.has(m[1])) return fail(404)
      videos.delete(m[1])
      return ok('')
    }
    return fail(400)
  }
  /* Simulates the creator's browser finishing the upload + Cloudflare processing. */
  const finish = (uid, over = {}) => Object.assign(videos.get(uid), { status: { state: 'ready' }, readyToStream: true, duration: 20, size: 5_000_000 }, over)
  return { fetchImpl, videos, calls, finish }
}

export function makeHarness({ env = {}, now = () => Date.now() } = {}) {
  const cfake = fakeCloudflare()
  const emails = []
  const store = memoryStore(now)
  const fetchImpl = async (url, init) => {
    if (String(url).includes('api.resend.com')) {
      emails.push(JSON.parse(init.body))
      return { status: 200, json: async () => ({ id: 'e1' }) }
    }
    return cfake.fetchImpl(url, init)
  }
  const e = { ...ENV, ...env }
  const deps = buildDeps(e, { fetchImpl, now, store })
  return { deps, cfake, emails, store, env: e, now }
}

/* Fake req/res. Resolves with { status, headers, json, text }. */
export async function call(handler, deps, { method = 'GET', path, headers = {}, body, raw, ip = '203.0.113.7' } = {}) {
  const h = { host: 'www.convrt.studio', 'x-real-ip': ip, ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])) }
  if (method !== 'GET' && !h.origin) h.origin = 'https://www.convrt.studio'
  const payload = raw !== undefined ? raw : body !== undefined ? Buffer.from(JSON.stringify(body)) : null
  const req = Readable.from(payload ? [payload] : [])
  Object.assign(req, { method, url: path, headers: h })
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k.toLowerCase()] = v },
    end(chunk) { this.body = chunk; this.done() },
  }
  const finished = new Promise((r) => (res.done = r))
  await handler(req, res, deps)
  await finished
  const text = Buffer.isBuffer(res.body) ? null : String(res.body ?? '')
  let json = null
  if (text && (res.headers['content-type'] || '').includes('json')) json = JSON.parse(text)
  return { status: res.statusCode, headers: res.headers, json, text, buffer: Buffer.isBuffer(res.body) ? res.body : null }
}

export const creator = (deps, token) => (path, opts = {}) =>
  call(creatorHandler, deps, { ...opts, path: `/api/creator/${path}`, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) } })

export async function adminLogin(deps, password = ENV.CREATOR_ADMIN_PASSWORD) {
  const r = await call(adminHandler, deps, { method: 'POST', path: '/api/creator-admin/login', body: { password } })
  const cookie = (r.headers['set-cookie'] || '').split(';')[0]
  return { r, cookie }
}
export const admin = (deps, cookie) => (path, opts = {}) =>
  call(adminHandler, deps, { ...opts, path: `/api/creator-admin/${path}`, headers: { ...(cookie ? { cookie } : {}), ...(opts.headers || {}) } })

export const validProfile = (over = {}) => ({
  legalName: 'Test Creator Dummy',
  displayName: 'Testy',
  fiverrUrl: 'https://www.fiverr.com/testcreator',
  languages: ['English', 'Arabic'],
  languagesOther: '',
  specializations: ['UGC videos'],
  specializationOther: '',
  ...over,
})

// A real (tiny) JPEG header + padding: enough for magic-byte checks. Dummy data only.
export const dummyJpeg = (size = 2000) => Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(size, 7)])
