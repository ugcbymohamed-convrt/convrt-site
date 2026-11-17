import { sha256 } from './crypto.js'

/* Fixed-window counter in the store. `id` (usually an IP) is hashed before it becomes a key, so no raw
   IP address is ever stored. @returns {Promise<boolean>} true = allowed */
export async function allow(store, { bucket, id, max, windowSec }) {
  const key = `cr:rl:${bucket}:${sha256(String(id)).slice(0, 24)}`
  const n = await store.incr(key, windowSec)
  return n <= max
}

export function clientIp(req) {
  const h = req.headers || {}
  const fwd = String(h['x-forwarded-for'] || '').split(',')[0].trim()
  return String(h['x-real-ip'] || fwd || req.socket?.remoteAddress || 'unknown')
}
