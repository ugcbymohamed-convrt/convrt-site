/* Vercel serverless function: POST /api/free-hooks-subscribe
   Adds the visitor to the MailerLite group for their chosen industry.
   Logic lives in ./_lib/subscribe.js (see the notes there).
   Uses only plain Node req/res so it also runs in the Vite dev middleware. */

import { processSignup, isSameOrigin } from './_lib/subscribe.js'

const MAX_BODY_BYTES = 4 * 1024

function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

async function readJson(req) {
  if (req.body !== undefined && req.body !== null) {
    // Vercel pre-parses JSON; if the content-type was wrong it may be a string/Buffer.
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body
    try {
      return JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body))
    } catch {
      return null
    }
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) return null
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return send(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' })
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (!isSameOrigin(req.headers.origin, host)) {
    return send(res, 403, { ok: false, error: 'forbidden' })
  }

  const body = await readJson(req)
  if (body === null) return send(res, 400, { ok: false, error: 'invalid_request' })

  try {
    const { status, body: out, headers } = await processSignup({ body })
    return send(res, status, out, headers)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[free-hooks] unexpected', err?.name)
    return send(res, 500, { ok: false, error: 'unavailable' })
  }
}
