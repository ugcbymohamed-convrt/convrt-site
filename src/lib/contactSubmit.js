/* Client side of the general contact inquiry. Talks only to our own serverless function (/api/contact). Resolves on success; rejects with an Error whose `.kind` is one of:
     invalid · unavailable · network
   (`.fields` lists the fields the server rejected when kind is "invalid"). */

const ENDPOINT = '/api/contact'
const TIMEOUT_MS = 15000

const fail = (kind, extra) => Object.assign(new Error(kind), { kind, ...extra })

export async function submitInquiry(values, honeypot, locale) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...values, hpCheck: honeypot, locale }),
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
    /* non-JSON (the dev server or a proxy error page) */
  }

  if (res.ok && data?.ok === true) return
  if (data?.error === 'invalid_inquiry' || res.status === 422) throw fail('invalid', { fields: data?.fields || [] })
  throw fail('unavailable')
}
