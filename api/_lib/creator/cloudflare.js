/* Cloudflare Stream: private direct creator uploads, status checks, signed playback tokens, deletion.
   Docs: https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/

   • The browser uploads straight to Cloudflare with a one-time URL we create here, so video bytes never pass
     through a Vercel function.
   • Every video is created with requireSignedURLs: true, so it is NOT playable without a signed token that
     only our server (after an authorisation check) can mint. Nothing becomes public automatically.
   • The API token (CLOUDFLARE_STREAM_API_TOKEN, scope "Stream: Edit") stays on the server. */

export class CloudflareError extends Error {
  constructor(status, code) {
    super(`cloudflare_${status}`)
    this.name = 'CloudflareError'
    this.status = status
    this.code = code
  }
}

const UPLOAD_WINDOW_MIN = 30

export function cloudflare(cfg, fetchImpl = globalThis.fetch) {
  const configured = Boolean(cfg.accountId && cfg.streamToken)
  const base = `${cfg.apiBase}/accounts/${cfg.accountId}/stream`

  async function call(method, path, body) {
    const res = await fetchImpl(`${base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${cfg.streamToken}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json || json.success === false) throw new CloudflareError(res.status, json?.errors?.[0]?.code)
    return json.result
  }

  return {
    configured,
    playbackBase: cfg.playbackBase,

    /* @returns {{ uploadURL: string, uid: string }} one-time upload URL scoped to this submission + slot */
    async createDirectUpload({ submissionId, slot, maxDurationSeconds, nowMs = Date.now() }) {
      const result = await call('POST', '/direct_upload', {
        maxDurationSeconds,
        expiry: new Date(nowMs + UPLOAD_WINDOW_MIN * 60_000).toISOString(),
        requireSignedURLs: true,
        creator: submissionId,
        meta: { name: `${submissionId}-video-${slot}`, submissionId, slot: String(slot), source: 'creator-onboarding' },
      })
      return { uploadURL: result.uploadURL, uid: result.uid }
    },

    getVideo: (uid) => call('GET', `/${encodeURIComponent(uid)}`),

    async deleteVideo(uid) {
      try {
        await call('DELETE', `/${encodeURIComponent(uid)}`)
      } catch (err) {
        if (err instanceof CloudflareError && err.status === 404) return // already gone
        throw err
      }
    },

    /* Short-lived playback token for a requireSignedURLs video. */
    async signToken(uid, ttlSeconds = 3600, nowMs = Date.now()) {
      const exp = Math.floor(nowMs / 1000) + ttlSeconds
      const result = await call('POST', `/${encodeURIComponent(uid)}/token`, { exp })
      return { token: result.token, expiresAt: exp * 1000 }
    },

    playbackUrls(token) {
      return {
        playbackUrl: `${cfg.playbackBase}/${token}/manifest/video.m3u8`,
        thumbnailUrl: `${cfg.playbackBase}/${token}/thumbnails/thumbnail.jpg?time=1s&height=480`,
      }
    },
  }
}
