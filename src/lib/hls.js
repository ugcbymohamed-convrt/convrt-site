/* ─────────────────────────────────────────────
   HLS helper for the homepage videos (Cloudflare Stream, videodelivery.net).

   • hls.js is ~540 kB (164 kB gzip). It is imported on demand — never in the
     initial bundle — and not at all on Safari / iOS, which play HLS natively.
   • capLevelToPlayerSize: a ~300 px-wide phone mock no longer pulls the 1080×1920
     rendition on non-retina screens.
   • Short forward buffer (10 s, hard cap 20 s) instead of the 30 s default, so
     looping clips don't pre-download everything.
   • `autoStartLoad: false` attaches the stream without downloading segments until
     `startLoad()` — used for phones that only show their poster.
───────────────────────────────────────────── */

const NATIVE_HLS = 'application/vnd.apple.mpegurl'

let libPromise
const loadHls = () => (libPromise ||= import('hls.js').then((m) => m.default))

/* @param {HTMLVideoElement} video
   @param {string} src  .m3u8 URL
   @param {{ autoStartLoad?: boolean, onReady?: () => void }} [opts]
   @returns {{ startLoad: () => void, destroy: () => void }} */
export function attachHls(video, src, { autoStartLoad = true, onReady } = {}) {
  let hls = null
  let cancelled = false
  let wantLoad = autoStartLoad

  if (video.canPlayType(NATIVE_HLS)) {
    // Safari / iOS: native HLS. Setting src is what starts the download, so defer it.
    const begin = () => {
      if (cancelled || video.src === src) return
      if (onReady) video.addEventListener('loadedmetadata', onReady, { once: true })
      video.src = src
    }
    if (wantLoad) begin()
    return {
      startLoad: () => { wantLoad = true; begin() },
      destroy: () => { cancelled = true },
    }
  }

  loadHls().then((Hls) => {
    if (cancelled || !Hls.isSupported()) return
    hls = new Hls({
      capLevelToPlayerSize: true,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      autoStartLoad: wantLoad,
    })
    hls.loadSource(src)
    hls.attachMedia(video)
    if (onReady) hls.on(Hls.Events.MANIFEST_PARSED, onReady)
  })

  return {
    startLoad: () => { wantLoad = true; hls?.startLoad(-1) },
    destroy: () => { cancelled = true; hls?.destroy(); hls = null },
  }
}
