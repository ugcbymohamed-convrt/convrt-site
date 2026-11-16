// Local stand-in for Cloudflare Stream, for driving the real UI in a browser during development:
//   node tests/helpers/mockCloudflareStream.mjs   (listens on :8788)
// with CLOUDFLARE_API_BASE=http://localhost:8788/client/v4 and CLOUDFLARE_PLAYBACK_BASE=http://localhost:8788
// It accepts uploads of any file, reports them "ready" after a short processing time, and serves a placeholder
// thumbnail. NOT Cloudflare: it proves our integration's contract, not Cloudflare's behaviour.
import http from 'node:http'

const PORT = Number(process.env.MOCK_CF_PORT || 8788)
const videos = new Map()
let n = 0
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS' }
const json = (res, status, body) => { res.writeHead(status, { ...CORS, 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
const body = (req) => new Promise((r) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => r(Buffer.concat(c))) })

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end() }
  let m
  if (req.method === 'POST' && url.pathname.endsWith('/stream/direct_upload')) {
    const b = JSON.parse((await body(req)).toString())
    const uid = `mock${++n}${Date.now().toString(36)}`
    videos.set(uid, { uid, requireSignedURLs: b.requireSignedURLs, meta: b.meta, creator: b.creator, uploadedAt: null, size: 0 })
    return json(res, 200, { success: true, result: { uid, uploadURL: `http://localhost:${PORT}/upload/${uid}` } })
  }
  if ((m = url.pathname.match(/^\/upload\/([^/]+)$/)) && req.method === 'POST') {
    const v = videos.get(m[1])
    if (!v) return json(res, 404, { success: false })
    const buf = await body(req)
    v.size = buf.length
    v.uploadedAt = Date.now()
    res.writeHead(200, CORS); return res.end()
  }
  if ((m = url.pathname.match(/\/stream\/([^/]+)\/token$/)) && req.method === 'POST') {
    return videos.has(m[1]) ? json(res, 200, { success: true, result: { token: `tok.${m[1]}` } }) : json(res, 404, { success: false })
  }
  if ((m = url.pathname.match(/\/stream\/([^/]+)$/))) {
    const v = videos.get(m[1])
    if (!v) return json(res, 404, { success: false, errors: [{ code: 10003 }] })
    if (req.method === 'DELETE') { videos.delete(m[1]); return json(res, 200, { success: true, result: '' }) }
    const age = v.uploadedAt ? Date.now() - v.uploadedAt : -1
    const state = age < 0 ? 'pendingupload' : age < 3000 ? 'inprogress' : 'ready'
    return json(res, 200, { success: true, result: {
      uid: v.uid, requireSignedURLs: v.requireSignedURLs, meta: v.meta, creator: v.creator,
      status: { state, pctComplete: String(Math.min(99, Math.round(age / 30))) }, readyToStream: state === 'ready',
      duration: state === 'ready' ? 24.5 : -1, size: v.size,
    } })
  }
  if ((m = url.pathname.match(/^\/tok\.([^/]+)\/thumbnails\/thumbnail\.jpg$/))) {
    res.writeHead(200, { ...CORS, 'Content-Type': 'image/svg+xml' })
    return res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="270" height="480" viewBox="0 0 270 480"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b2f6b"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="270" height="480" fill="url(#g)"/><circle cx="135" cy="200" r="52" fill="#fff" opacity=".85"/><rect x="75" y="280" width="120" height="120" rx="60" fill="#fff" opacity=".6"/></svg>`)
  }
  json(res, 404, { success: false })
}).listen(PORT, () => console.log(`mock Cloudflare Stream on :${PORT}`))
