/* ─────────────────────────────────────────────
   CONTENT SHOWCASE
   Real Graspo creative — the same three Cloudflare
   Stream assets featured in the homepage Case Studies
   carousel. Shown here as static thumbnails (no
   playback) so the page doesn't duplicate that
   component's interaction model.
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

const VIDEOS = [
  { id: '15dd5505109f6821ccdcb13fc3cdc1fd', views: '295K' },
  { id: '3616606e3ca6d1a85c8a57d7cc2f656f', views: '1.2M' },
  { id: 'c1379ace38f2fa19ef2a45de1bb5d4b1', views: '7.5M' },
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
      </div>
    </section>
  )
}

function ShowcasePhone({ video }) {
  return (
    <div className="w-full mx-auto" style={{ maxWidth: '220px' }}>
      <div
        className="relative"
        style={{
          width: '100%', aspectRatio: '9 / 19.5',
          borderRadius: '40px', background: '#0a0a0a', padding: '10px',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', borderRadius: '30px', background: '#000' }}>
          <img
            src={`https://videodelivery.net/${video.id}/thumbnails/thumbnail.jpg?time=0s&height=600`}
            alt="Graspo organic content still"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div
            aria-hidden="true"
            style={{ position: 'absolute', top: '7px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, height: '20px', width: '76px', borderRadius: '9999px', background: '#000' }}
          />

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
