/* Client side of the /referrals application. Talks only to our own serverless
   function (/api/referral-apply). Resolves on success; rejects with an Error whose
   `.kind` is one of:
     invalid · rate_limited · cannot_subscribe · unavailable · network
   (`.fields` lists the fields the server rejected when kind is "invalid"). */

import { CURRENT_MARKETING_CONSENT_VERSION } from '../content/marketingConsent.js'

const ENDPOINT = '/api/referral-apply'
const TIMEOUT_MS = 15000

const fail = (kind, extra) => Object.assign(new Error(kind), { kind, ...extra })

export async function submitReferral(values, honeypot, marketingConsent = false) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // Optional, separate from the application itself: false (the default) never blocks or changes it.
      body: JSON.stringify({
        ...values,
        hpCheck: honeypot,
        marketingConsent: marketingConsent === true,
        ...(marketingConsent === true ? { marketingConsentVersion: CURRENT_MARKETING_CONSENT_VERSION } : {}),
      }),
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

  if (res.ok && data?.ok === true) return

  const kind = data?.error
  if (kind === 'invalid_application' || res.status === 422) throw fail('invalid', { fields: data?.fields || [] })
  if (kind === 'rate_limited' || res.status === 429) throw fail('rate_limited')
  if (kind === 'cannot_subscribe') throw fail('cannot_subscribe')
  throw fail('unavailable')
}
