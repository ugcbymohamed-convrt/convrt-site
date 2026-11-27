import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'
import { streamPoster } from '../../content/posterFrames.js'
import { streamHls } from '../../lib/streamHost.js'
import { useTr } from '../../i18n/tr.js'
import { ELYON_VIDEOS as VIDEOS } from '../../caseStudies/data.js'
import { isEnglish } from '../caseStudies/format.js'
import { elyonAr } from '../../i18n/ar/elyonScoped.js'

/* Real Elyon creative — the same three Cloudflare Stream assets featured
   in the homepage Case Studies carousel, reused here so the case study
   plays actual campaign content, not stand-ins. */

export default function ElyonShowcase() {
  const tr = useTr()
  return (
    <section id="elyon-videos" className="relative scroll-mt-20 py-14 md:scroll-mt-24 md:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: ACCENT }}
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-14 text-center mx-auto">
          <Eyebrow label={tr('The Creative')} accent={ACCENT} className="mb-6" />
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            {tr('What actually ran on paid social.')}
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            {tr('Real campaign creative from the Elyon library, built to earn attention and still look like it belongs to a luxury fragrance brand.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {VIDEOS.map((v, i) => (
            <VideoPhone key={v.id} video={v} ordinal={elyonAr(`showcase|Video ${i + 1}`)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoPhone({ video, ordinal }) {
  const tr = useTr()
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
    const src = streamHls(video.id)
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
              poster={streamPoster(video.id, { height: 600 })}
              loop muted playsInline preload="metadata"
            />
          ) : (
            <img
              src={streamPoster(video.id, { height: 600 })}
              alt={isEnglish() ? `Elyon ${video.label} still` : `${tr('Elyon still')}: ${tr(video.label)}`}
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
            aria-label={muted ? tr('Unmute') : tr('Mute')}
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
        {/* Arabic only (owner copy): "الفيديو الأول / الثاني / الثالث" above the label; the other languages show the label alone, as before. */}
        {ordinal && <span className="mb-1 block text-[11px] font-medium text-ink-subtle">{ordinal}</span>}
        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: ACCENT }}>
          {tr(video.label)}
        </span>
      </p>
    </div>
  )
}
