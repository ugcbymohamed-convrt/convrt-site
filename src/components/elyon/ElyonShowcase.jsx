import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'

/* Real Elyon creative — the same three Cloudflare Stream assets featured
   in the homepage Case Studies carousel, reused here so the case study
   plays actual campaign content, not stand-ins. */
const VIDEOS = [
  { id: 'fa02007b36fae2b3bb68c97cdd00e9fc', label: 'Creator-Led Ad' },
  { id: '0905b814e2ba3950197b5bfe1cefae38', label: 'Street Interview' },
  { id: '9e6cb8438c9b0c1ab8b55953718eddde', label: 'Performance Concept' },
]

export default function ElyonShowcase() {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: ACCENT }}
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-14 text-center mx-auto">
          <Eyebrow label="The Creative" accent={ACCENT} className="mb-6" />
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            What actually ran on paid social.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            Real campaign creative from the Elyon library, built to earn attention and still look
            like it belongs to a luxury fragrance brand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {VIDEOS.map((v) => (
            <VideoPhone key={v.id} video={v} />
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoPhone({ video }) {
  const wrapperRef = useRef(null)
  const videoRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [muted, setMuted] = useState(true)

  // Lazy-attach the HLS source only once the card nears the viewport.
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting) setShouldLoad(true)
      },
      { threshold: 0.4, rootMargin: '200px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldLoad) return
    const el = videoRef.current
    if (!el) return
    const src = `https://videodelivery.net/${video.id}/manifest/video.m3u8`
    let hls
    // Prefer hls.js's JS demuxer whenever MSE is available — it's what actually
    // gets exercised and error-tested across Chrome/Firefox/Edge. Some Chromium
    // builds report canPlayType('application/vnd.apple.mpegurl') as truthy but
    // then fail to demux the stream natively (DEMUXER_ERROR_COULD_NOT_PARSE),
    // which is what caused the frozen-video bug. Native <video src> is now only
    // used as the last-resort fallback for browsers hls.js can't run on at all.
    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(el)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad()
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError()
        else hls.destroy()
      })
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src
    }
    return () => hls && hls.destroy()
  }, [shouldLoad, video.id])

  // Play only while visible; pause the moment it scrolls offscreen.
  useEffect(() => {
    const el = videoRef.current
    if (!el || !shouldLoad) return
    if (inView) el.play().catch(() => {})
    else el.pause()
  }, [inView, shouldLoad])

  useEffect(() => {
    const el = videoRef.current
    if (el) el.muted = muted
  }, [muted])

  return (
    <div ref={wrapperRef} className="w-full mx-auto" style={{ maxWidth: '220px' }}>
      <div
        className="relative"
        style={{
          width: '100%', aspectRatio: '9 / 19.5',
          borderRadius: '40px', background: '#0a0a0a', padding: '10px',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', borderRadius: '30px', background: '#000' }}>
          {shouldLoad ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              poster={`https://videodelivery.net/${video.id}/thumbnails/thumbnail.jpg?time=0s&height=600`}
              loop muted playsInline preload="metadata"
            />
          ) : (
            <img
              src={`https://videodelivery.net/${video.id}/thumbnails/thumbnail.jpg?time=0s&height=600`}
              alt={`Elyon ${video.label} still`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div
            aria-hidden="true"
            style={{ position: 'absolute', top: '7px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, height: '20px', width: '76px', borderRadius: '9999px', background: '#000' }}
          />

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="absolute bottom-3 right-3 z-30 h-8 w-8 rounded-full flex items-center justify-center bg-black/55 backdrop-blur-md text-white transition-colors hover:bg-black/75 active:scale-95"
          >
            {muted
              ? <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14.5 7.5l4 4M18.5 7.5l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              : <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14 8c.8.6 1.3 1.3 1.3 2s-.5 1.4-1.3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
          </button>

          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, borderRadius: '30px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)', pointerEvents: 'none', zIndex: 10 }}
          />
        </div>
      </div>
      <p className="mt-4 text-center">
        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
          {video.label}
        </span>
      </p>
    </div>
  )
}
