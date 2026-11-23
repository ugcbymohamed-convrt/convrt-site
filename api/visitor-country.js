/* Vercel serverless function: GET /api/visitor-country → { "spain": true | false }.
   Used by the language suggestion on English pages (src/lib/languageSuggestion.js). The answer depends on WHO is asking, so it is never cacheable by a shared cache:
   `Cache-Control: private, no-store` (set by send()) and `Vary: x-vercel-ip-country`. Anything unexpected answers { spain: false }. */
import { send } from './_lib/http.js'
import { isSpain } from './_lib/geo.js'

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method_not_allowed' }, { Allow: 'GET, HEAD' })
  return send(res, 200, { spain: isSpain(req.headers) }, { 'Cache-Control': 'private, no-store, max-age=0', Vary: 'x-vercel-ip-country' })
}
