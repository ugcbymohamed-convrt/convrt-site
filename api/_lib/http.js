/* Tiny helpers shared by the serverless handlers (plain Node req/res, so they
   also run in the Vite dev middleware). Files starting with "_" are not
   deployed as routes. */

export function send(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(body))
}

/* Parses a JSON request body; resolves null when it is missing, too large or invalid. */
export async function readJson(req, maxBytes) {
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
    if (size > maxBytes) return null
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}
