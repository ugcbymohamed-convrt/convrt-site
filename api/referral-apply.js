/* Vercel serverless function: POST /api/referral-apply
   Saves a Referral Partner Program application to MailerLite for manual review
   and emails the owner. Logic lives in ./_lib/referral.js. Uses only plain Node
   req/res so it also runs in the Vite dev middleware. */

import { processReferral } from './_lib/referral.js'
import { isSameOrigin } from './_lib/subscribe.js'
import { send, readJson } from './_lib/http.js'

const MAX_BODY_BYTES = 16 * 1024

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' })
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (!isSameOrigin(req.headers.origin, host)) {
    return send(res, 403, { ok: false, error: 'forbidden' })
  }

  const body = await readJson(req, MAX_BODY_BYTES)
  if (body === null) return send(res, 400, { ok: false, error: 'invalid_request' })

  try {
    const { status, body: out, headers } = await processReferral({ body })
    return send(res, status, out, headers)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[referrals] unexpected', err?.name)
    return send(res, 500, { ok: false, error: 'unavailable' })
  }
}
