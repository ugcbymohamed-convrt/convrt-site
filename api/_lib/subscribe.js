/* ─────────────────────────────────────────────
   /free-hooks → MailerLite signup logic (server only).

   Pure function: `processSignup()` takes the request body + env and returns
   `{ status, body }`. It has no Vercel/Node request dependencies, so it is
   unit-tested directly (tests/free-hooks-subscribe.test.mjs) and reused by the
   Vercel function (api/free-hooks-subscribe.js) and the Vite dev middleware.

   Files in api/ whose name starts with "_" are NOT deployed as routes.

   MailerLite API used (docs: https://developers.mailerlite.com/docs/subscribers.html):
     POST https://connect.mailerlite.com/api/subscribers
       201 = subscriber created, 200 = already existed and was updated.
       `groups` is ADDITIVE for this endpoint (never removes existing groups).
       Omitting `status` lets MailerLite's account-level "Double opt-in for API
       and integrations" setting decide: unconfirmed (confirmation email) vs active.
       We never send `status` or `resubscribe` — unsubscribed / bounced / junk
       contacts must not be re-added by a website form.

   The API token only ever lives in process.env (Vercel project settings).
───────────────────────────────────────────── */

import { sendOwnerAlert } from './notify.js'
import { MARKETING_GROUP_ENV, consentAlertRow, readConsent, saveSubscriber, unsavedConsent } from './marketing.js'

export const MAILERLITE_ENDPOINT = 'https://connect.mailerlite.com/api/subscribers'

/* industry key → env var holding that MailerLite group's numeric ID */
export const INDUSTRY_GROUP_ENV = {
  saas: 'MAILERLITE_GROUP_SAAS_ID',
  ecommerce: 'MAILERLITE_GROUP_ECOMMERCE_ID',
}

const INDUSTRY_LABEL = { saas: 'SaaS / Software', ecommerce: 'E-commerce / DTC' }

/* The promotional audience: a separate group that only contacts who ticked the optional box are
   added to (see ./marketing.js). The two groups above are for DELIVERY of the hooks only. */
export { MARKETING_GROUP_ENV }

const MAX_EMAIL_LENGTH = 254
// Pragmatic check — MailerLite performs the authoritative validation (422).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const GROUP_ID_RE = /^\d{1,30}$/

const json = (status, body, headers) => ({ status, body, headers })

/* Never log the email address or token. */
function logUpstream(kind, detail) {
  // eslint-disable-next-line no-console
  console.error(`[free-hooks] ${kind}`, detail)
}

export function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'invalid_request' }

  const industry = typeof body.industry === 'string' ? body.industry : ''
  if (!Object.hasOwn(INDUSTRY_GROUP_ENV, industry)) return { error: 'invalid_industry' }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return { error: 'invalid_email' }

  return {
    industry,
    email,
    marketingConsent: body.marketingConsent === true,
    marketingConsentVersion: typeof body.marketingConsentVersion === 'string' ? body.marketingConsentVersion : undefined,
    // Honeypot: real visitors never see or fill this field.
    isBot: typeof body.company === 'string' && body.company.trim() !== '',
  }
}

export async function processSignup({ body, env = process.env, fetchImpl = globalThis.fetch, now = () => new Date() }) {
  const parsed = validateBody(body)
  if (parsed.error) return json(parsed.error === 'invalid_email' ? 422 : 400, { ok: false, error: parsed.error })

  // Bots get a convincing success and nothing is sent anywhere.
  if (parsed.isBot) return json(200, { ok: true, confirmation: false })

  // Marketing consent is independent of delivery: declining (or an unknown wording) changes nothing below
  // except that the contact is not put on the marketing list.
  const consent = readConsent(parsed, `free-hooks-${parsed.industry}`, { now, legacyVersion: 'v1' })
  const result = await saveSignup(parsed, consent, { env, fetchImpl })
  // Every genuine signup alerts the owner, even when it could not be saved,
  // so no email address that was typed into the form is ever lost.
  await sendOwnerAlert(
    {
      subject: `${result.status === 200 ? '' : '[NOT SAVED] '}New free hooks signup: ${INDUSTRY_LABEL[parsed.industry]}`,
      title: 'Someone just requested the 10 FREE ad hooks.',
      rows: [
        ['Email', parsed.email],
        ['Industry', INDUSTRY_LABEL[parsed.industry]],
        ['New or repeat', result.created ? 'New subscriber' : 'Already on the list, or not saved'],
        consentAlertRow(result.consent),
        result.status === 200
          ? ['Saved to MailerLite', result.body.confirmation ? 'Yes (waiting on their confirmation email)' : 'Yes']
          : ['Saved to MailerLite', `NO (${result.body?.error || 'error'}): follow up with them by email`],
      ],
      footer: 'Reply to this email to reach them.',
      replyTo: parsed.email,
    },
    { env, fetchImpl, log: logUpstream },
  )
  return result
}

async function saveSignup(parsed, consent, { env, fetchImpl }) {
  const token = env.MAILERLITE_API_TOKEN
  const groupId = env[INDUSTRY_GROUP_ENV[parsed.industry]]

  if (!token || !GROUP_ID_RE.test(String(groupId || '').trim())) {
    logUpstream('not_configured', {
      industry: parsed.industry,
      hasToken: Boolean(token),
      hasGroupId: GROUP_ID_RE.test(String(groupId || '').trim()),
    })
    return { ...json(503, { ok: false, error: 'unavailable' }), consent: unsavedConsent(consent) }
  }

  // Delivery group only. The marketing group and consent record are added by saveSubscriber, and only for an opt-in.
  const saved = await saveSubscriber({
    endpoint: MAILERLITE_ENDPOINT,
    token,
    base: { email: parsed.email, groups: [String(groupId).trim()] },
    consent,
    env,
    fetchImpl,
    log: logUpstream,
  })
  const withConsent = (r) => ({ ...r, consent: saved.consent })

  if (saved.networkError) {
    logUpstream('network_error', { name: saved.networkError })
    return withConsent(json(502, { ok: false, error: 'unavailable' }))
  }
  const { res, data: payload } = saved

  // 201 created · 200 already existed (duplicate) — both are idempotent successes.
  if (res.status === 200 || res.status === 201) {
    const status = payload?.data?.status
    if (status === 'unsubscribed' || status === 'bounced' || status === 'junk') {
      // MailerLite refuses to reactivate these via API, so the automation will not run.
      logUpstream('cannot_resubscribe', { status })
      saved.consent.blocked = status
      return withConsent(json(409, { ok: false, error: 'cannot_subscribe' }))
    }
    return withConsent({ ...json(200, { ok: true, confirmation: status === 'unconfirmed' }), created: res.status === 201 })
  }

  if (res.status === 422) {
    if (payload?.errors?.email) return withConsent(json(422, { ok: false, error: 'invalid_email' }))
    logUpstream('validation_error', { message: payload?.message, fields: Object.keys(payload?.errors || {}) })
    return withConsent(json(502, { ok: false, error: 'unavailable' }))
  }

  if (res.status === 429) {
    const retryAfter = res.headers?.get?.('retry-after')
    return withConsent(json(429, { ok: false, error: 'rate_limited' }, retryAfter ? { 'Retry-After': retryAfter } : undefined))
  }

  if (res.status === 401 || res.status === 403) {
    logUpstream('auth_error', { status: res.status }) // bad / revoked token
    return withConsent(json(503, { ok: false, error: 'unavailable' }))
  }

  logUpstream('upstream_error', { status: res.status, message: payload?.message })
  return withConsent(json(502, { ok: false, error: 'unavailable' }))
}

/* Same-origin guard: a browser POST from another site is rejected. Requests
   with no Origin header (curl, server-to-server) are not browser-driven CSRF,
   and the endpoint is public-by-design anyway, so they are allowed. */
export function isSameOrigin(originHeader, hostHeader) {
  if (!originHeader) return true
  try {
    return new URL(originHeader).host === hostHeader
  } catch {
    return false
  }
}
