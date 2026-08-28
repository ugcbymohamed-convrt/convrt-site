import { useRef, useState } from 'react'
import { useInView } from '../caseStudies/shared/useInView.js'
import { trackEvent } from '../../lib/analytics.js'

/* ─────────────────────────────────────────────
   Real creative, not a portfolio grid. Sources are the actual project
   assets in public/videos/.

   Only elyon-3.mp4 (13.5MB) and the three graspo-*.mp4 files (2.3–
   6.5MB) are web-sized. adscale-1/2/3.mp4 and elyon-1/2.mp4 are
   442MB–810MB masters — unusable for a paid-traffic page — so the
   Adscale slot below is an honest placeholder rather than a 500MB+
   download. NEEDS FROM YOU: web-optimized re-exports (ideally under
   ~15MB, or a Cloudflare Stream/Mux ID like the homepage hero uses)
   for adscale-1/2/3.mp4 and elyon-1/2.mp4 before they can go live.

   preload="metadata" renders each clip's real first frame as its own
   poster at near-zero bandwidth cost; nothing else downloads until
   the visitor taps play.
───────────────────────────────────────────── */

const CREATIVES = [
  {
    id: 'elyon-3',
    src: '/videos/elyon-3.mp4',
    client: 'Elyon Dubai',
    category: 'Luxury Fragrance · Paid Social',
    format: 'Street-interview format',
  },
  {
    id: 'graspo-1',
    src: '/videos/graspo-1.mp4',
    client: 'Graspo',
    category: 'Printing & Manufacturing · Organic',
    format: 'Arabic-first social content',
  },
  {
    id: 'graspo-2',
    src: '/videos/graspo-2.mp4',
    client: 'Graspo',
    category: 'Printing & Manufacturing · Organic',
    format: 'Arabic-first social content',
  },
  {
    id: 'graspo-3',
    src: '/videos/graspo-3.mp4',
    client: 'Graspo',
    category: 'Printing & Manufacturing · Organic',
    format: 'Arabic-first social content',
  },
]

const PLACEHOLDER = {
  id: 'adscale-placeholder',
  client: 'Adscale',
  category: 'SaaS · Paid Social',
}

export default function ScaleCreativeShowcase() {
  const [ref, visible] = useInView(0.08)

  return (
    <section className="relative py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeUp show={visible} delay={0} className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">The Work</span>
            <span className="h-px w-8 bg-lime" />
          </div>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.1] text-3xl md:text-[42px]">
            The work behind the numbers.
          </h2>
        </FadeUp>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible pb-2 md:pb-0">
          {CREATIVES.map((item, i) => (
            <FadeUp key={item.id} show={visible} delay={100 + i * 70} className="shrink-0 w-[62%] xs:w-[52%] sm:w-[38%] md:w-auto snap-start">
              <CreativeCard item={item} />
            </FadeUp>
          ))}
          <FadeUp show={visible} delay={100 + CREATIVES.length * 70} className="shrink-0 w-[62%] xs:w-[52%] sm:w-[38%] md:w-auto snap-start">
            <PlaceholderCard />
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

function CreativeCard({ item }) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef(null)

  const handlePlay = () => {
    trackEvent('creative_preview_play', { page: 'scale', client: item.client, id: item.id })
    setPlaying(true)
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}))
  }

  return (
    <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-[22px] border border-hairline bg-black">
      <video
        ref={videoRef}
        src={item.src}
        preload="metadata"
        playsInline
        loop
        muted={muted}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={() => { if (playing) videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause() }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.85) 0%, rgba(10,10,11,0.05) 42%, rgba(10,10,11,0.3) 100%)' }}
      />

      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play ${item.client} creative preview`}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 translate-x-0.5 fill-white">
              <path d="M7 4l14 8-14 8V4z" />
            </svg>
          </span>
        </button>
      )}

      {playing && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute preview' : 'Mute preview'}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 backdrop-blur-md text-white"
        >
          {muted ? (
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14.5 7.5l4 4M18.5 7.5l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none"><path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" /><path d="M14 8c.8.6 1.3 1.3 1.3 2s-.5 1.4-1.3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          )}
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime">{item.format}</p>
        <p className="mt-1 text-sm font-semibold text-white">{item.client}</p>
        <p className="text-[11px] text-white/60">{item.category}</p>
      </div>
    </div>
  )
}

function PlaceholderCard() {
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[22px] border border-dashed border-hairline-strong bg-surface-1/40 flex flex-col items-center justify-center text-center px-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink-subtle mb-3">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">Preview being optimized</p>
      <p className="mt-2 text-sm font-semibold text-ink">{PLACEHOLDER.client}</p>
      <p className="text-[11px] text-ink-muted">{PLACEHOLDER.category}</p>
    </div>
  )
}

function FadeUp({ children, show, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
