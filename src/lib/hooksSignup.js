/* Client side of the /free-hooks signup. Talks only to our own serverless
   function (/api/free-hooks-subscribe); the MailerLite token never reaches the
   browser. Resolves `{ confirmation }` on success; rejects with an Error whose
   `.kind` is one of:
     invalid_email · rate_limited · cannot_subscribe · unavailable · network */

const ENDPOINT = '/api/free-hooks-subscribe'
const TIMEOUT_MS = 15000

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const fail = (kind) => Object.assign(new Error(kind), { kind })

export async function submitSignup({ industry, email, marketingConsent, company }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ industry, email: email.trim(), marketingConsent: Boolean(marketingConsent), company }),
      signal: controller.signal,
    })
  } catch {
    throw fail('network')
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON (e.g. the dev server or a proxy error page) */
  }

  if (res.ok && data?.ok === true) return { confirmation: data.confirmation === true }

  const kind = data?.error
  if (kind === 'invalid_email' || res.status === 422) throw fail('invalid_email')
  if (kind === 'rate_limited' || res.status === 429) throw fail('rate_limited')
  if (kind === 'cannot_subscribe') throw fail('cannot_subscribe')
  throw fail('unavailable')
}
