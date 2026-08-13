import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

/* ─────────────────────────────────────────────
   CONTENT SHOWCASE
   Real Graspo creative — the same three Cloudflare
   Stream assets featured in the homepage Case Studies
   carousel, presented here as a static trio so the
   page doesn't duplicate that component's interaction
   model.
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

const VIDEOS = [
  { id: '15dd5505109f6821ccdcb13fc3cdc1fd', views: '295K' },
  { id: '3616606e3ca6d1a85c8a57d7cc2f656f', views: '1.2M' },
  { id: 'c1379ace38f2fa19ef2a45de1bb5d4b1', views: '7.5M' },
]

/* Real post captions and view counts, pulled directly from the Graspo
   Instagram Reels grid. Photos aren't available as site assets, so each
   tile shows the real caption (Arabic, as posted) with an English gloss
   and the real view count, rather than a fabricated thumbnail. */
const GRID_POSTS = [
  { views: '7.5M', caption: 'خطأ فادح', gloss: 'A major mistake', accent: '#d5ff40' },
  { views: '1.9M', caption: 'ماكينة', gloss: 'One machine', accent: '#8b5cf6' },
  { views: '1.2M', caption: 'قطعة مهمة', gloss: 'The key part', accent: '#ff6a4d' },
  { views: '84.2K', caption: 'معاييرنا', gloss: 'Our standards', accent: '#ec4899' },
  { views: '31.3K', caption: 'خطأ لا يغفر', gloss: 'An unforgivable mistake', accent: '#3b82f6' },
  { views: '15.2K', caption: 'تستهبلون؟', gloss: 'Think we\'re joking?', accent: '#ffb547' },
  { views: '15.1K', caption: 'أهم شي', gloss: 'The most important thing', accent: '#d5ff40' },
  { views: '5.3K', caption: 'شحن؟', gloss: 'Shipping?', accent: '#8b5cf6' },
  { views: '3.8K', caption: 'الفرق', gloss: 'The difference', accent: '#ff6a4d' },
]

export default function GraspoShowcase() {
  return (
    <section id="showcase" className="relative py-16 md:py-24 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full opacity-[0.05] blur-[120px]"
        style={{ background: ACCENT }}
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-14 text-center mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">The Content</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            What actually ran on the feed.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            Native, platform-ready short-form video, built to stop the scroll of someone who
            might genuinely need a print run, not just to look good in a portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {VIDEOS.map((v) => (
            <ShowcasePhone key={v.id} video={v} />
          ))}
        </div>

        <p className="mt-16 mb-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-subtle">
          More from the same feed
        </p>

        <div className="grid grid-cols-3 gap-2.5 md:gap-3 max-w-3xl mx-auto">
          {GRID_POSTS.map((post) => (
            <GridTile key={post.caption} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

function GridTile({ post }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center px-2 py-4 md:px-3 md:py-6"
      style={{ aspectRatio: '3 / 4', background: '#0c0c0f', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{ background: `radial-gradient(120% 90% at 50% 0%, ${post.accent}, transparent 70%)` }}
      />
      <p dir="rtl" lang="ar" className="relative font-display font-bold text-ink leading-tight text-[13px] md:text-base">
        {post.caption}
      </p>
      <p className="relative mt-1.5 text-[9px] md:text-[10.5px] text-ink-subtle leading-snug">
        {post.gloss}
      </p>
      <div className="relative mt-auto pt-3 flex items-center gap-1 md:gap-1.5">
        <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 md:h-3 md:w-3" fill="none" aria-hidden="true">
          <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" stroke={post.accent} strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.8" stroke={post.accent} strokeWidth="1.2" />
        </svg>
        <span className="font-display font-bold text-[11px] md:text-[13px] tabular-nums" style={{ color: post.accent }}>
          {post.views}
        </span>
      </div>
    </div>
  )
}

function ShowcasePhone({ video }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const src = `https://videodelivery.net/${video.id}/manifest/video.m3u8`
    let hls
    if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src
    } else if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(el)
    }
    return () => hls && hls.destroy()
  }, [video.id])

  useEffect(() => { if (ref.current) ref.current.muted = muted }, [muted])

  const togglePlay = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.paused ? el.play().catch(() => {}) : el.pause()
  }, [])
  const toggleMute = useCallback((e) => { e.stopPropagation(); setMuted((m) => !m) }, [])

  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: '220px', aspectRatio: '9 / 19.5' }}>
      <div
        style={{
          position: 'relative', width: '100%', height: '100%',
          borderRadius: '40px', background: '#0a0a0a', padding: '10px',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', borderRadius: '30px', background: '#000' }}>
          <video
            ref={ref}
            className="absolute inset-0 w-full h-full object-cover"
            poster={`https://videodelivery.net/${video.id}/thumbnails/thumbnail.jpg?time=0s&height=600`}
            loop muted playsInline preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onCanPlay={() => setLoaded(true)}
            onClick={togglePlay}
            style={{ cursor: 'pointer' }}
          />
          {!loaded && <div className="absolute inset-0 animate-pulse" style={{ background: '#111114' }} />}

          <div
            aria-hidden="true"
            style={{ position: 'absolute', top: '7px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, height: '20px', width: '76px', borderRadius: '9999px', background: '#000' }}
          />

          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="absolute top-9 right-2.5 z-30 h-8 w-8 rounded-full flex items-center justify-center bg-black/55 backdrop-blur-md text-white hover:bg-black/75 active:scale-95 transition-colors"
          >
            {muted
              ? <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14.5 7.5l4 4M18.5 7.5l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              : <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14 8c.8.6 1.3 1.3 1.3 2s-.5 1.4-1.3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
          </button>

          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200 ${playing ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
          >
            <span className="h-11 w-11 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {playing
                ? <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></svg>
                : <svg viewBox="0 0 16 16" className="h-4 w-4 ml-0.5" fill="currentColor"><path d="M4 3l9 5-9 5V3z" /></svg>}
            </span>
          </button>

          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, borderRadius: '30px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)', pointerEvents: 'none', zIndex: 10 }}
          />
        </div>
      </div>
      <p className="mt-4 text-center">
        <span className="block font-display font-bold leading-none text-2xl md:text-[28px] tabular-nums" style={{ color: ACCENT }}>
          {video.views}
        </span>
        <span className="mt-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          views
        </span>
      </p>
    </div>
  )
}
