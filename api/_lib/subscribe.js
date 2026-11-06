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

export const MAILERLITE_ENDPOINT = 'https://connect.mailerlite.com/api/subscribers'

/* industry key → env var holding that MailerLite group's numeric ID */
export const INDUSTRY_GROUP_ENV = {
  saas: 'MAILERLITE_GROUP_SAAS_ID',
  ecommerce: 'MAILERLITE_GROUP_ECOMMERCE_ID',
}

/* Optional: a third group that only consenting contacts are added to, so
   marketing/nurture emails can be limited to people who ticked the box. */
export const MARKETING_GROUP_ENV = 'MAILERLITE_GROUP_MARKETING_ID'

const UPSTREAM_TIMEOUT_MS = 8000
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
    // Honeypot: real visitors never see or fill this field.
    isBot: typeof body.company === 'string' && body.company.trim() !== '',
  }
}

export async function processSignup({ body, env = process.env, fetchImpl = globalThis.fetch }) {
  const parsed = validateBody(body)
  if (parsed.error) return json(parsed.error === 'invalid_email' ? 422 : 400, { ok: false, error: parsed.error })

  // Bots get a convincing success and nothing is sent anywhere.
  if (parsed.isBot) return json(200, { ok: true, confirmation: false })

  const token = env.MAILERLITE_API_TOKEN
  const groupId = env[INDUSTRY_GROUP_ENV[parsed.industry]]
  const marketingGroupId = env[MARKETING_GROUP_ENV]

  if (!token || !GROUP_ID_RE.test(String(groupId || '').trim())) {
    logUpstream('not_configured', {
      industry: parsed.industry,
      hasToken: Boolean(token),
      hasGroupId: GROUP_ID_RE.test(String(groupId || '').trim()),
    })
    return json(503, { ok: false, error: 'unavailable' })
  }

  const groups = [String(groupId).trim()]
  if (parsed.marketingConsent && GROUP_ID_RE.test(String(marketingGroupId || '').trim())) {
    groups.push(String(marketingGroupId).trim())
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
      body: JSON.stringify({ email: parsed.email, groups }),
      signal: controller.signal,
    })
  } catch (err) {
    logUpstream('network_error', { name: err?.name })
    return json(502, { ok: false, error: 'unavailable' })
  } finally {
    clearTimeout(timer)
  }

  let payload = null
  try {
    payload = await res.json()
  } catch {
    /* non-JSON body */
  }

  // 201 created · 200 already existed (duplicate) — both are idempotent successes.
  if (res.status === 200 || res.status === 201) {
    const status = payload?.data?.status
    if (status === 'unsubscribed' || status === 'bounced' || status === 'junk') {
      // MailerLite refuses to reactivate these via API, so the automation will not run.
      logUpstream('cannot_resubscribe', { status })
      return json(409, { ok: false, error: 'cannot_subscribe' })
    }
    return json(200, { ok: true, confirmation: status === 'unconfirmed' })
  }

  if (res.status === 422) {
    if (payload?.errors?.email) return json(422, { ok: false, error: 'invalid_email' })
    logUpstream('validation_error', { message: payload?.message, fields: Object.keys(payload?.errors || {}) })
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

  logUpstream('upstream_error', { status: res.status, message: payload?.message })
  return json(502, { ok: false, error: 'unavailable' })
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
