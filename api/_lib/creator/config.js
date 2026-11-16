/* Environment for the creator onboarding API. Nothing here is ever sent to the browser. */

export function creatorConfig(env = process.env) {
  const s = (k) => String(env[k] || '').trim()
  return {
    accountId: s('CLOUDFLARE_ACCOUNT_ID'),
    streamToken: s('CLOUDFLARE_STREAM_API_TOKEN'),
    // Overridable so tests / local dev can point at a mock. Production uses Cloudflare's real endpoints.
    apiBase: s('CLOUDFLARE_API_BASE') || 'https://api.cloudflare.com/client/v4',
    playbackBase: s('CLOUDFLARE_PLAYBACK_BASE') || 'https://videodelivery.net',
    redisUrl: s('UPSTASH_REDIS_REST_URL') || s('KV_REST_API_URL'),
    redisToken: s('UPSTASH_REDIS_REST_TOKEN') || s('KV_REST_API_TOKEN'),
    useMemoryStore: s('CREATOR_STORE') === 'memory', // local development / tests only
    adminPassword: s('CREATOR_ADMIN_PASSWORD'),
    sessionSecret: s('CREATOR_ADMIN_SESSION_SECRET'),
    isProduction: s('VERCEL_ENV') === 'production',
  }
}

export const MIN_ADMIN_PASSWORD = 16
export const MIN_SESSION_SECRET = 32
