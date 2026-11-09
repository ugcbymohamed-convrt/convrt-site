/* ─────────────────────────────────────────────
   /risk-free-trial → application intake (server only).

   Every valid application is saved to a MailerLite group for MANUAL REVIEW.
   Nothing is auto-approved and no booking link is returned — CONVRT decides
   who gets the free production and invites suitable brands to a call.

   Pure function like api/_lib/subscribe.js: `processApplication()` takes the
   request body + env and returns `{ status, body }`, so it is unit-tested
   directly (tests/risk-free-apply.test.mjs).

   MailerLite: POST https://connect.mailerlite.com/api/subscribers
     • standard field `name`
     • custom fields (must exist in MailerLite → Subscribers → Fields, using
       exactly these keys): website, business_type, ad_spend, videos_per_month,
       video_type, timeline, ongoing_interest, brief
     • `groups` = [MAILERLITE_GROUP_RISK_FREE_ID]
   No `status` is sent (same policy as the hooks signup): unsubscribed /
   bounced / junk contacts cannot be re-added by a website form.
   A repeat application from the same email updates the saved answers.

   The API token only ever lives in process.env (Vercel project settings).
───────────────────────────────────────────── */

import { MAILERLITE_ENDPOINT } from './subscribe.js'
import { normalizeApplication, validateApplication } from '../../src/lib/riskFreeQuestions.js'

export const RISK_FREE_GROUP_ENV = 'MAILERLITE_GROUP_RISK_FREE_ID'

const UPSTREAM_TIMEOUT_MS = 8000
const GROUP_ID_RE = /^\d{1,30}$/

const json = (status, body, headers) => ({ status, body, headers })

/* Never log answers, names or emails. */
function logUpstream(kind, detail) {
  // eslint-disable-next-line no-console
  console.error(`[risk-free] ${kind}`, detail)
}

/* ─────────────────────────────────────────────
   Owner alert: one email per saved application, sent through Resend
   (POST https://api.resend.com/emails).

   • Entirely optional: with no RESEND_API_KEY nothing is sent and nothing changes.
   • Best-effort: the application is already safe in MailerLite by the time this
     runs, so a failure here is logged (no personal data) and never shown to the
     applicant or turned into an error.
   • Awaited with a short timeout (serverless functions are frozen once they
     respond, so a fire-and-forget request could be dropped).
   • Reply-To is the applicant, so "Reply" in the inbox goes straight to them.
───────────────────────────────────────────── */

export const RESEND_ENDPOINT = 'https://api.resend.com/emails'
export const DEFAULT_NOTIFY_TO = 'mohamed@convrt.studio'
// Resend's shared test sender: it only delivers to the Resend account owner's own
// address. Set NOTIFY_EMAIL_FROM to an address on a verified domain to lift that.
export const DEFAULT_NOTIFY_FROM = 'CONVRT Site <onboarding@resend.dev>'
const NOTIFY_TIMEOUT_MS = 4000

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim()

export function buildNotification(app, env = process.env) {
  const rows = [
    ['Name', app.fullName],
    ['Email', app.email],
    ['Website', app.website],
    ['Business', app.businessType],
    ['Monthly ad spend', app.adSpend],
    ['Video ads per month', app.videosPerMonth],
    ['Video type to test', app.videoType],
    ['Timeline', app.timeline],
    ['Ongoing interest', app.ongoing],
    ['Brief', app.brief || '(none)'],
  ]
  const text = [
    'New application for the 1 FREE video production.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Saved in MailerLite (group: Free Video Applications). Reply to this email to reach the applicant.',
  ].join('\n')
  const html =
    '<p><strong>New application for the 1 FREE video production.</strong></p>' +
    '<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">' +
    rows.map(([k, v]) => `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('') +
    '</table>' +
    '<p style="color:#666;font-size:12px">Saved in MailerLite. Reply to this email to reach the applicant.</p>'

  return {
    from: String(env.NOTIFY_EMAIL_FROM || '').trim() || DEFAULT_NOTIFY_FROM,
    to: [String(env.NOTIFY_EMAIL_TO || '').trim() || DEFAULT_NOTIFY_TO],
    reply_to: app.email,
    subject: oneLine(`New free video application: ${app.fullName}`).slice(0, 150),
    text,
    html,
  }
}

export async function notifyOwner(app, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const key = String(env.RESEND_API_KEY || '').trim()
  if (!key) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), NOTIFY_TIMEOUT_MS)
  try {
    const res = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildNotification(app, env)),
      signal: controller.signal,
    })
    if (res.status >= 200 && res.status < 300) return true
    logUpstream('notify_failed', { status: res.status })
  } catch (err) {
    logUpstream('notify_error', { name: err?.name })
  } finally {
    clearTimeout(timer)
  }
  return false
}

export async function processApplication({ body, env = process.env, fetchImpl = globalThis.fetch }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(400, { ok: false, error: 'invalid_request' })
  }

  // Honeypot: real visitors never see or fill this field. Bots get a convincing
  // success and nothing is saved anywhere.
  if (typeof body.company === 'string' && body.company.trim() !== '') return json(200, { ok: true })

  const errors = validateApplication(body)
  if (Object.keys(errors).length) return json(422, { ok: false, error: 'invalid_application', fields: Object.keys(errors) })

  const app = normalizeApplication(body)
  const token = env.MAILERLITE_API_TOKEN
  const groupId = String(env[RISK_FREE_GROUP_ENV] || '').trim()

  if (!token || !GROUP_ID_RE.test(groupId)) {
    logUpstream('not_configured', { hasToken: Boolean(token), hasGroupId: GROUP_ID_RE.test(groupId) })
    return json(503, { ok: false, error: 'unavailable' })
  }

  const payload = {
    email: app.email,
    fields: {
      name: app.fullName,
      website: app.website,
      business_type: app.businessType,
      ad_spend: app.adSpend,
      videos_per_month: app.videosPerMonth,
      video_type: app.videoType,
      timeline: app.timeline,
      ongoing_interest: app.ongoing,
      brief: app.brief,
    },
    groups: [groupId],
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  let res
  try {
    res = await fetchImpl(MAILERLITE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err) {
    logUpstream('network_error', { name: err?.name })
    return json(502, { ok: false, error: 'unavailable' })
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body */
  }

  // 201 created · 200 already existed and was updated — both are saved applications.
  if (res.status === 200 || res.status === 201) {
    const status = data?.data?.status
    if (status === 'unsubscribed' || status === 'bounced' || status === 'junk') {
      logUpstream('cannot_resubscribe', { status })
      return json(409, { ok: false, error: 'cannot_subscribe' })
    }
    await notifyOwner(app, { env, fetchImpl })
    return json(200, { ok: true })
  }

  if (res.status === 422) {
    if (data?.errors?.email) return json(422, { ok: false, error: 'invalid_application', fields: ['email'] })
    // Most likely a custom field key that doesn't exist in MailerLite yet.
    logUpstream('validation_error', { message: data?.message, fields: Object.keys(data?.errors || {}) })
    return json(502, { ok: false, error: 'unavailable' })
  }

  if (res.status === 429) {
    const retryAfter = res.headers?.get?.('retry-after')
    return json(429, { ok: false, error: 'rate_limited' }, retryAfter ? { 'Retry-After': retryAfter } : undefined)
  }

  if (res.status === 401 || res.status === 403) {
    logUpstream('auth_error', { status: res.status }) // bad / revoked token
    return json(503, { ok: false, error: 'unavailable' })
  }

  logUpstream('upstream_error', { status: res.status, message: data?.message })
  return json(502, { ok: false, error: 'unavailable' })
}
