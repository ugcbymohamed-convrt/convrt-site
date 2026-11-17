/* Browser client for /api/creator/*. The invitation token travels ONLY in the Authorization header: never in a
   URL, query string, analytics event or log. It is read once from ?invite=, removed from the address bar
   immediately, and kept in sessionStorage (this tab only) so a refresh or an interrupted session can resume. */

const KEY = 'convrt_creator_invite'
let memoryToken = null

export function readInviteToken() {
  if (typeof window === 'undefined') return null
  const fromUrl = new URLSearchParams(window.location.search).get('invite')
  if (fromUrl) {
    memoryToken = fromUrl.trim()
    try { window.sessionStorage.setItem(KEY, memoryToken) } catch { /* private mode: memory only */ }
    // Strip the token from the address bar and history entry so it cannot leak via copy/paste, screenshots or Referer.
    window.history.replaceState(null, '', window.location.pathname)
    return memoryToken
  }
  if (memoryToken) return memoryToken
  try { memoryToken = window.sessionStorage.getItem(KEY) } catch { /* ignore */ }
  return memoryToken
}

async function request(token, path, { method = 'GET', body, raw, headers = {} } = {}) {
  const init = { method, headers: { Authorization: `Bearer ${token}`, ...headers }, cache: 'no-store', credentials: 'same-origin' }  // same-origin cookies are harmless (the API only reads the Authorization header) and let Vercel Preview protection pass
  if (raw !== undefined) init.body = raw
  else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(`/api/creator/${path}`, init)
  } catch {
    return { ok: false, status: 0, error: 'network' }
  }
  const type = res.headers.get('content-type') || ''
  const data = type.includes('json') ? await res.json().catch(() => ({})) : null
  return { ok: res.ok, status: res.status, error: data?.error, data, res }
}

export const creatorApi = (token) => ({
  session: () => request(token, 'session'),
  saveDraft: (profile) => request(token, 'draft', { method: 'POST', body: profile }),
  videoUpload: (slot, file) => request(token, 'video-upload', { method: 'POST', body: { slot, filename: file.name, type: file.type, size: file.size } }),
  videoStatus: (slot) => request(token, 'video-status', { method: 'POST', body: { slot } }),
  videoPreview: (slot) => request(token, `video-preview?slot=${slot}`),
  videoRemove: (slot) => request(token, 'video-remove', { method: 'POST', body: { slot } }),
  photoUpload: (blob) => request(token, 'photo', { method: 'POST', raw: blob, headers: { 'Content-Type': blob.type } }),
  photoRemove: () => request(token, 'photo', { method: 'DELETE' }),
  photoBlobUrl: async () => {
    const r = await request(token, 'photo')
    return r.ok ? URL.createObjectURL(await r.res.blob()) : null
  },
  submit: (payload) => request(token, 'submit', { method: 'POST', body: payload }),
  downloadAgreement: async () => {
    const r = await request(token, 'agreement')
    if (!r.ok) return false
    // The server names the file (a PDF; a printable HTML copy in the rare case the PDF fonts cannot draw a name).
    const filename = /filename="([^"]+)"/.exec(r.res.headers.get('content-disposition') || '')?.[1] || 'Creator-Portfolio-Agreement.pdf'
    const url = URL.createObjectURL(await r.res.blob())
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
    return true
  },
})

/* Direct-to-Cloudflare upload with real progress (fetch cannot report upload progress, XHR can). */
export function uploadToCloudflare(uploadURL, file, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const form = new FormData()
    form.append('file', file)
    xhr.open('POST', uploadURL)
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total) }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`upload_${xhr.status}`)))
    xhr.onerror = () => reject(new Error('network'))
    xhr.onabort = () => reject(new Error('aborted'))
    if (signal) signal.addEventListener('abort', () => xhr.abort(), { once: true })
    xhr.send(form)
  })
}

/* Reads a video's duration in the browser before uploading (null if the browser cannot decode it). */
export function readVideoDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    const done = (d) => { URL.revokeObjectURL(url); resolve(Number.isFinite(d) ? d : null) }
    v.preload = 'metadata'
    v.onloadedmetadata = () => done(v.duration)
    v.onerror = () => done(null)
    setTimeout(() => done(null), 8000)
    v.src = url
  })
}

/* Resizes a chosen photo in the browser (max 1200 px, JPEG) so it fits the server's small limit. */
export async function prepareProfilePhoto(file, maxBytes) {
  if (!/^image\/(jpeg|png)$/.test(file.type)) throw new Error('type')
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('decode')
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  for (const q of [0.88, 0.8, 0.7, 0.6, 0.5, 0.4]) {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', q))
    if (blob && blob.size <= maxBytes) return blob
  }
  throw new Error('too_large')
}
