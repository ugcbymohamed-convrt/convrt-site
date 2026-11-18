import { useEffect, useMemo, useRef, useState } from 'react'
import { attachHls } from '../../lib/hls.js'
import { trackEvent } from '../../lib/analytics.js'
import {
  buildFacets, matchesFilters, posterUrl, hlsUrl, creatorLabel, languageLabel, industryLabel,
} from '../../content/ugcPortfolio.js'
import { ELYON_PROOF, UGC_TESTIMONIALS } from '../../content/ugcProof.js'
import { Section, Head, Reveal, RoadmapCta, TextLink } from './shared.jsx'

/* SECTION 3: selected work.
   • The creator portfolio is data-driven (src/content/ugcPortfolio.js). Only approved videos with portfolio permission ever
     render. With none, a clean fallback is shown instead; nothing is invented.
   • Playback: poster-first. A video element (and any download) exists only after a tap, and only one plays at a time.
   • Results and testimonials sit in their own blocks, clearly separate from the portfolio videos. */

/* ── a single playing video (mounted only after a tap) ───────────────────────────────── */
function Player({ item }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    const play = () => { v.play().catch(() => {}) }
    if (item.source.cloudflareId) {
      const hls = attachHls(v, hlsUrl(item), { onReady: play })
      v.addEventListener('canplay', play, { once: true })
      return () => hls.destroy()
    }
    v.src = item.source.mp4
    v.addEventListener('canplay', play, { once: true })
    return undefined
  }, [item])
  return (
    <video
      ref={ref}
      controls
      playsInline
      preload="metadata"
      poster={posterUrl(item)}
      aria-label={item.caption}
      className="absolute inset-0 h-full w-full bg-black object-cover"
    />
  )
}

function Card({ item, playing, onPlay }) {
  const name = creatorLabel(item)
  const langs = item.languages.map(languageLabel).join(' · ')
  const meta = [item.brand, item.category].filter(Boolean).join(' · ')
  return (
    <figure className="flex h-full flex-col">
      <div className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-hairline-strong bg-surface-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
        {playing ? (
          <Player item={item} />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play video: ${item.caption}`}
            className="group absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime"
          >
            <img src={posterUrl(item)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
              <svg viewBox="0 0 12 12" className="ml-0.5 h-5 w-5 text-ink" fill="currentColor"><path d="M3 1.8v8.4L10 6z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 px-1">
        {meta && <p className="text-sm font-semibold text-ink">{meta}</p>}
        <p className="text-[13px] leading-snug text-ink-muted">{item.caption}</p>
        <p className="mt-1 text-[12px] text-ink-subtle">
          {[industryLabel(item.industry), langs, name].filter(Boolean).join(' · ')}
        </p>
        {item.caseStudyHref && (
          <p className="mt-1.5 text-[12px]"><TextLink href={item.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'portfolio' })}>Related case study</TextLink></p>
        )}
      </figcaption>
    </figure>
  )
}

function FilterGroup({ label, name, options, value, onChange }) {
  if (!options.length) return null
  const chip = (active) =>
    `rounded-full px-4 py-2 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 ${active ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-1 text-ink-muted hover:text-ink'}`
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">{label}</span>
      <button type="button" aria-pressed={value === null} onClick={() => onChange(name, null)} className={chip(value === null)}>All</button>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(name, o.value)} className={chip(value === o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* Exported so the structure can be rendered and tested with sample data. */
export function PortfolioGrid({ items }) {
  const [filters, setFilters] = useState({ language: null, industry: null })
  const [activeId, setActiveId] = useState(null)
  const facets = useMemo(() => buildFacets(items), [items])
  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setActiveId(null) }
  const visible = items.filter((i) => matchesFilters(i, filters)).length

  return (
    <div>
      {(facets.language.length > 0 || facets.industry.length > 0) && (
        <div className="mb-8 flex flex-col items-center gap-3">
          <FilterGroup label="Language" name="language" options={facets.language} value={filters.language} onChange={set} />
          <FilterGroup label="Industry" name="industry" options={facets.industry} value={filters.industry} onChange={set} />
          <p className="sr-only" aria-live="polite">{visible} videos shown</p>
        </div>
      )}
      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:gap-8">
        {items.map((item) => (
          <li key={item.id} hidden={!matchesFilters(item, filters)} className="w-[72%] shrink-0 snap-center sm:w-[44%] md:w-auto">
            <Card
              item={item}
              playing={activeId === item.id}
              onPlay={() => { setActiveId(item.id); trackEvent('ugc_portfolio_play', { language: item.languages.join(','), industry: item.industry }) }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Shown only when there are no approved videos. Honest, branded, no invented content. */
function Fallback() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-hairline-strong bg-surface-1/70 p-8 text-center backdrop-blur-md md:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-[#c4b5fd]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M10.5 10.2v3.6L14 12z" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold tracking-display text-ink">Our creator portfolio is being updated.</h3>
      <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
        We add creator videos here once the creators and brands involved have approved them for display. Until then, you can see a
        client result and client feedback below.
      </p>
    </div>
  )
}

function ElyonResult() {
  const e = ELYON_PROOF
  return (
    <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">One creative, in context</p>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        {e.brand}, a luxury fragrance brand, has had {e.creativesProduced} creatives produced since launch across batches, formats and variations.
        In one client-reported Meta Ads Manager snapshot, a single creator-led UGC video reached{' '}
        <span className="font-semibold text-ink">{e.roas} ROAS</span>, with {e.purchases} purchases and {e.revenue} in reported revenue.
      </p>
      <dl className="mt-5 grid grid-cols-3 gap-3">
        {[[e.roas, 'ROAS, one video'], [String(e.purchases), 'Purchases'], [e.revenue, 'Reported revenue']].map(([v, l]) => (
          <div key={l} className="flex flex-col rounded-2xl border border-hairline bg-canvas/40 p-3 text-center">
            <dt className="order-2 mt-1 text-[11px] leading-tight text-ink-subtle">{l}</dt>
            <dd className="order-1 font-display text-lg font-bold tabular-nums text-ink md:text-xl">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[13px] leading-relaxed text-ink-subtle">
        This is the result of one individual creative, reported by the client during an early learning phase. It is not typical, not
        a guarantee and not representative of all campaigns. Results depend on the brand, offer, audience and budget.
      </p>
      <p className="mt-4 text-sm">
        <TextLink href={e.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'results' })}>
          See both performance snapshots in the Elyon case study
        </TextLink>
      </p>
    </div>
  )
}

function Testimonials() {
  return (
    <div className="grid gap-4 md:gap-5">
      {UGC_TESTIMONIALS.map((t) => (
        <figure key={t.id} className="rounded-3xl border border-hairline bg-surface-2/50 p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">Client testimonial</p>
          <blockquote className="mt-3 text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-4 text-sm text-ink-muted">
            <span className="font-semibold text-ink">{t.brand}</span> · {t.category}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export default function UgcWork({ items }) {
  return (
    <Section id="work" label="ugc-work-heading">
      <Reveal>
        <Head id="ugc-work-heading" eyebrow="Selected work" title="Creator-led ads, made for paid social." intro={items.length ? 'Watch the work, then decide.' : undefined} />
      </Reveal>

      <div className="mt-10 md:mt-12">{items.length ? <PortfolioGrid items={items} /> : <Fallback />}</div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-2 lg:gap-8">
        <Reveal>
          <h3 className="sr-only">Results</h3>
          <ElyonResult />
        </Reveal>
        <Reveal delay={100}>
          <h3 className="sr-only">Client feedback</h3>
          <Testimonials />
        </Reveal>
      </div>

      <div className="mt-10 flex justify-center">
        <RoadmapCta location="work" />
      </div>
    </Section>
  )
}
