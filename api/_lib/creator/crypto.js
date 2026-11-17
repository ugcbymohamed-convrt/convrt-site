/* Small crypto helpers for the creator onboarding API (Node's built-in crypto only). */
import crypto from 'node:crypto'

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url')
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

/* Constant-time string comparison (hashes first, so lengths never leak). */
export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

const B32 = 'ABCDEFGHJKMNPQRSTVWXYZ23456789' // no 0/O/1/I/L
/* Human-friendly submission reference, e.g. CRX-7K3M9QWB. 8 chars ≈ 39 bits; uniqueness is also enforced by the store. */
export function newReference() {
  const bytes = crypto.randomBytes(8)
  let s = ''
  for (const b of bytes) s += B32[b % B32.length]
  return `CRX-${s}`
}

const b64 = (s) => Buffer.from(s).toString('base64url')
const mac = (body, secret) => crypto.createHmac('sha256', secret).update(body).digest('base64url')

/* Signed, expiring session value for the owner cookie: base64url(json).hmac */
export function signSession(payload, secret) {
  const body = b64(JSON.stringify(payload))
  return `${body}.${mac(body, secret)}`
}

export function verifySession(value, secret, nowMs = Date.now()) {
  if (!value || !secret || typeof value !== 'string') return null
  const [body, sig, extra] = value.split('.')
  if (!body || !sig || extra !== undefined) return null
  if (!safeEqual(sig, mac(body, secret))) return null
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    return typeof p.exp === 'number' && p.exp > nowMs ? p : null
  } catch {
    return null
  }
}
