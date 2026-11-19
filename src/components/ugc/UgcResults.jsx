import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { ELYON_PROOF, UGC_TESTIMONIALS } from '../../content/ugcProof.js'
import { Section, Head, Reveal, RoadmapCta, TextLink } from './shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'

/* SECTION 4: results and client feedback, in one compact block.
   • Elyon 5.28x: ONE individual creator-led UGC video, client-reported, early learning phase, never typical or guaranteed (wording
     and figures: src/content/ugcProof.js, tested). The two client messages that source those figures are shown as clean message cards
     (the text is the client's own, verbatim), not as screenshots.
   • Testimonials: verbatim, attributed exactly as on the homepage; logos are the ones the homepage already shows.
   • No stars, ratings, repeat-order counts or other derived statistics. The left card is kept short on purpose. */

const LOGOS = {
  adscale: { src: '/clients/adscale.png', alt: 'Adscale', w: 531, h: 149 },
  elyon: { src: '/clients/elyon.png', alt: 'Elyon Dubai', w: 600, h: 226 },
}
/* The client's own messages, word for word (as published in the Elyon case study). */
const CLIENT_MESSAGES = ['It has 9 sales with an revenue of 3421.25$', 'Roas 5.28']

/* One-time number reveal: the page text is always the final figure ("5.28x"); when it scrolls into view it counts up once, over about
   a second, and settles on the same text. Skipped for reduced-motion visitors. */
function RoasNumber({ value }) {
  const [shown, setShown] = useState(null)
  const ref = useRef(null)
  const autoplay = useAutoplayAllowed()
  useEffect(() => {
    const el = ref.current
    if (!autoplay || !el || typeof IntersectionObserver === 'undefined') return undefined
    const target = parseFloat(value)
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min((now - t0) / 1100, 1)
        setShown(target * (1 - (1 - p) ** 3))
        if (p < 1) raf = requestAnimationFrame(tick); else setShown(null)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [autoplay, value])
  return <span ref={ref} className="tabular-nums">{shown == null ? value : `${shown.toFixed(2)}x`}</span>
}

export default function UgcResults() {
  const e = ELYON_PROOF
  return (
    <Section id="results" label="ugc-results-heading" glow>
      <Reveal>
        <Head id="ugc-results-heading" eyebrow="Results & client feedback" title="What clients see. What clients say." />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-7">
          <div className="relative h-full overflow-hidden rounded-[28px] border border-lime/25 bg-surface-1 p-6 md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-lime/[0.12] blur-[90px]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{e.brand} · {e.category}</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-[4.25rem] font-bold leading-none tracking-display-xl text-lime sm:text-[5.5rem]"><RoasNumber value={e.roas} /></span>
                <span className="font-display text-xl font-semibold text-ink md:text-2xl">ROAS, one UGC video</span>
              </p>
              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                {[[String(e.purchases), 'Purchases'], [e.revenue, 'Reported revenue']].map(([v, l]) => (
                  <div key={l} className="flex flex-col">
                    <dd className="order-1 font-display text-2xl font-bold tabular-nums text-ink">{v}</dd>
                    <dt className="order-2 text-sm text-ink-muted">{l}</dt>
                  </div>
                ))}
              </dl>

              {/* the client's own words, as two message cards */}
              <figure className="mt-6 max-w-md">
                <figcaption className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime" />Client messages
                </figcaption>
                <div className="space-y-2.5">
                  <p className="relative max-w-[92%] rounded-2xl rounded-bl-md bg-lime px-4 py-3 font-display text-[15px] font-semibold leading-snug text-canvas shadow-[0_18px_40px_-22px_rgba(213,255,64,0.7)]">
                    {CLIENT_MESSAGES[0]}
                  </p>
                  <p className="ml-auto w-fit max-w-[70%] rounded-2xl rounded-br-md border border-lime/45 bg-lime/[0.08] px-4 py-3 font-display text-[15px] font-semibold leading-snug text-lime">
                    {CLIENT_MESSAGES[1]}
                  </p>
                </div>
              </figure>

              <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-ink-muted">
                One individual creative, client-reported during an early learning phase. Not typical, not a guarantee. Results depend on brand, offer, audience and budget.
              </p>
              <p className="mt-2.5 text-[15px]">
                <TextLink href={e.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'results' })}>
                  Read the full Elyon case study <span aria-hidden="true">→</span>
                </TextLink>
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:col-span-5">
          {UGC_TESTIMONIALS.map((t, i) => {
            const logo = LOGOS[t.id]
            return (
              <Reveal key={t.id} delay={120 + i * 120} className="h-full">
                <figure className="relative flex h-full flex-col rounded-[28px] border border-hairline bg-surface-1/70 p-6 backdrop-blur-md md:p-7">
                  <span aria-hidden="true" className="absolute right-6 top-3 font-display text-6xl leading-none text-lime/25">&ldquo;</span>
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.w}
                    height={logo.h}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="h-7 w-auto max-w-[140px] object-contain object-left"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-sm text-ink-muted">
                    <span className="font-semibold text-ink">{t.brand}</span> · {t.category}
                  </figcaption>
                </figure>
              </Reveal>
            )
          })}
        </div>
      </div>

      <Reveal className="mt-8 flex justify-center">
        <RoadmapCta location="results" />
      </Reveal>
    </Section>
  )
}
