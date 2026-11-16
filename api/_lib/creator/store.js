/* Persistent storage for creator onboarding.

   Production: Upstash Redis over its REST API (Vercel Marketplace → Storage → Upstash Redis injects
   KV_REST_API_URL / KV_REST_API_TOKEN, or set UPSTASH_REDIS_REST_*). Plain fetch, no dependency.
   Tests / local dev: an in-memory store with the same interface (CREATOR_STORE=memory). It is never used
   implicitly: without credentials the API answers 503 "not configured" instead of silently losing data. */

export function memoryStore(nowFn = () => Date.now()) {
  const kv = new Map() // key -> { v: string, exp: number|null }
  const sets = new Map()
  const live = (key) => {
    const e = kv.get(key)
    if (!e) return null
    if (e.exp !== null && e.exp <= nowFn()) {
      kv.delete(key)
      return null
    }
    return e
  }
  return {
    kind: 'memory',
    async get(key) {
      const e = live(key)
      return e ? JSON.parse(e.v) : null
    },
    async set(key, value, { ttl, nx } = {}) {
      if (nx && live(key)) return false
      kv.set(key, { v: JSON.stringify(value), exp: ttl ? nowFn() + ttl * 1000 : null })
      return true
    },
    async del(key) {
      kv.delete(key)
    },
    async incr(key, ttl) {
      const e = live(key)
      const n = (e ? Number(JSON.parse(e.v)) : 0) + 1
      kv.set(key, { v: JSON.stringify(n), exp: e ? e.exp : ttl ? nowFn() + ttl * 1000 : null })
      return n
    },
    async sadd(set, member) {
      if (!sets.has(set)) sets.set(set, new Set())
      sets.get(set).add(member)
    },
    async smembers(set) {
      return [...(sets.get(set) || [])]
    },
    async mget(keys) {
      return keys.map((k) => {
        const e = live(k)
        return e ? JSON.parse(e.v) : null
      })
    },
  }
}

export function upstashStore({ url, token, fetchImpl = globalThis.fetch }) {
  async function cmd(args) {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json || json.error) throw new Error(`store_error_${res.status}`)
    return json.result
  }
  /* Several commands in ONE round trip (Upstash REST /pipeline). */
  async function pipeline(cmds) {
    const res = await fetchImpl(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cmds),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !Array.isArray(json) || json.some((r) => r.error)) throw new Error(`store_error_${res.status}`)
    return json.map((r) => r.result)
  }
  const parse = (s) => (s === null || s === undefined ? null : JSON.parse(s))
  return {
    kind: 'upstash',
    async get(key) {
      return parse(await cmd(['GET', key]))
    },
    async set(key, value, { ttl, nx } = {}) {
      const args = ['SET', key, JSON.stringify(value)]
      if (ttl) args.push('EX', String(ttl))
      if (nx) args.push('NX')
      return (await cmd(args)) === 'OK'
    },
    async del(key) {
      await cmd(['DEL', key])
    },
    async incr(key, ttl) {
      // INCR and "set the expiry only if there is none" in one request (a fixed window starting at the first hit).
      try {
        const out = await pipeline([['INCR', key], ...(ttl ? [['EXPIRE', key, String(ttl), 'NX']] : [])])
        return Number(out[0])
      } catch {
        // A server without EXPIRE ... NX: fall back to the classic two-step form.
        const n = Number(await cmd(['INCR', key]))
        if (n === 1 && ttl) await cmd(['EXPIRE', key, String(ttl)])
        return n
      }
    },
    async sadd(set, member) {
      await cmd(['SADD', set, member])
    },
    async smembers(set) {
      return (await cmd(['SMEMBERS', set])) || []
    },
    async mget(keys) {
      if (!keys.length) return []
      return ((await cmd(['MGET', ...keys])) || []).map(parse)
    },
  }
}

let memorySingleton
/* @returns the configured store, or null when nothing is configured (the API then answers 503). */
export function storeFromConfig(cfg, fetchImpl) {
  if (cfg.redisUrl && cfg.redisToken) return upstashStore({ url: cfg.redisUrl, token: cfg.redisToken, fetchImpl })
  if (cfg.useMemoryStore && !cfg.isProduction) return (memorySingleton ||= memoryStore())
  return null
}
