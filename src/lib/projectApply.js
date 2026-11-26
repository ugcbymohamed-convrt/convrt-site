/* Client side of /project-application. Talks only to our own serverless function (/api/project-apply). Resolves on success; rejects with an Error whose `.kind` is one of:
     invalid · rate_limited · unavailable · network
   (`.fields` lists the fields the server rejected when kind is "invalid"). The request carries identifiers and answers, never a price: the server looks the price up itself. */

const ENDPOINT = '/api/project-apply'
const TIMEOUT_MS = 15000
const fail = (kind, extra) => Object.assign(new Error(kind), { kind, ...extra })

/* A per-form id: the server uses it to deliver the application once however many times the request is repeated. */
export function newSubmissionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch { /* fall through */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export async function submitProjectApplication(payload, honeypot) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, nickname: honeypot }),
      signal: controller.signal,
    })
  } catch {
    throw fail('network')
  } finally {
    clearTimeout(timer)
  }
  let data = null
  try { data = await res.json() } catch { /* non-JSON (dev server or proxy error page) */ }
  if (res.ok && data?.ok === true) return
  if (data?.error === 'invalid_application' || res.status === 422) throw fail('invalid', { fields: data?.fields || [] })
  if (data?.error === 'rate_limited' || res.status === 429) throw fail('rate_limited')
  throw fail('unavailable')
}
