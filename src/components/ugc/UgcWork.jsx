import { useEffect, useMemo, useRef, useState } from 'react'
import { attachHls } from '../../lib/hls.js'
import { trackEvent } from '../../lib/analytics.js'
import {
  buildFacets, matchesFilters, posterUrl, hlsUrl, creatorLabel, languageLabel, industryLabel,
} from '../../content/ugcPortfolio.js'
import { ELYON_PROOF, UGC_TESTIMONIALS } from '../../content/ugcProof.js'
import { Section, Head, Reveal, RoadmapCta, TextLink } from './shared.jsx'

/* SECTION 3: selected work.
   • The creator portfolio is data-driven (src/content/ugcPortfolio.js). Only approved videos with portfolio permission and creator
     consent ever render. With none, the portfolio block is simply absent and the section leads with results and client feedback.
     Nothing is invented, and no "coming soon" message is shown.
   • Browsing: a responsive grid of large portrait cards (swipe row on phones), a language chip on every card, language and industry
     filters once there are two or more values to filter by, and "Show more" beyond PAGE videos.
   • Playback: poster-first. A video element (and any download) exists only after a tap, and only one plays at a time.
   • Results and testimonials sit in their own blocks, clearly separate from the portfolio videos. */

const PAGE = 6

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
            <img src={posterUrl(item)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span aria-hidden="true" className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink backdrop-blur">
              {item.languages.map((l) => l.toUpperCase()).join(' · ')}
            </span>
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none">
              <svg viewBox="0 0 12 12" className="ml-0.5 h-5 w-5 text-ink" fill="currentColor"><path d="M3 1.8v8.4L10 6z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 px-1">
        {meta && <p className="text-sm font-semibold text-ink">{meta}</p>}
        <p className="text-[14px] leading-snug text-ink-muted">{item.caption}</p>
        <p className="mt-1 text-[13px] text-ink-muted">{[industryLabel(item.industry), langs, name].filter(Boolean).join(' · ')}</p>
        {item.caseStudyHref && (
          <p className="mt-1.5 text-[13px]"><TextLink href={item.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'portfolio' })}>Related case study</TextLink></p>
        )}
      </figcaption>
    </figure>
  )
}

function FilterGroup({ label, name, options, value, onChange }) {
  if (!options.length) return null
  const chip = (active) =>
    `rounded-full px-4 py-2 text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 ${active ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-1 text-ink-muted hover:text-ink'}`
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</span>
      <button type="button" aria-pressed={value === null} onClick={() => onChange(name, null)} className={chip(value === null)}>All</button>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(name, o.value)} className={chip(value === o.value)}>
          {o.label} <span className="opacity-70">{o.count}</span>
        </button>
      ))}
    </div>
  )
}

/* Exported so the structure can be rendered and tested with sample data. */
export function PortfolioGrid({ items, pageSize = PAGE }) {
  const [filters, setFilters] = useState({ language: null, industry: null })
  const [activeId, setActiveId] = useState(null)
  const [limit, setLimit] = useState(pageSize)
  const facets = useMemo(() => buildFacets(items), [items])
  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setActiveId(null); setLimit(pageSize) }
  const matching = items.filter((i) => matchesFilters(i, filters))
  const shown = matching.slice(0, limit)
  const filterable = facets.language.length > 0 || facets.industry.length > 0

  return (
    <div>
      {filterable && (
        <div className="mb-6 flex flex-col items-center gap-3">
          <FilterGroup label="Language" name="language" options={facets.language} value={filters.language} onChange={set} />
          <FilterGroup label="Industry" name="industry" options={facets.industry} value={filters.industry} onChange={set} />
          <p className="text-sm text-ink-muted" aria-live="polite">{matching.length} {matching.length === 1 ? 'video' : 'videos'}</p>
        </div>
      )}
      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:gap-8">
        {shown.map((item) => (
          <li key={item.id} className="w-[72%] shrink-0 snap-center sm:w-[44%] md:w-auto">
            <Card
              item={item}
              playing={activeId === item.id}
              onPlay={() => { setActiveId(item.id); trackEvent('ugc_portfolio_play', { language: item.languages.join(','), industry: item.industry }) }}
            />
          </li>
        ))}
      </ul>
      {matching.length > limit && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((n) => n + pageSize)}
            className="rounded-full border border-hairline-strong bg-surface-2 px-6 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-ink-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60"
          >
            Show more ({matching.length - limit} more)
          </button>
        </div>
      )}
    </div>
  )
}

function ElyonResult() {
  const e = ELYON_PROOF
  return (
    <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1 p-6 md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">One creative, in context</p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        {e.brand}, a luxury fragrance brand, has had {e.creativesProduced} creatives produced since launch across batches, formats and variations.
        In one client-reported Meta Ads Manager snapshot, a single creator-led UGC video reached{' '}
        <span className="font-semibold text-ink">{e.roas} ROAS</span>, with {e.purchases} purchases and {e.revenue} in reported revenue.
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[[e.roas, 'ROAS, one video'], [String(e.purchases), 'Purchases'], [e.revenue, 'Reported revenue']].map(([v, l]) => (
          <div key={l} className="flex flex-col rounded-2xl border border-hairline bg-canvas/40 p-3 text-center">
            <dt className="order-2 mt-1 text-xs leading-tight text-ink-muted">{l}</dt>
            <dd className="order-1 font-display text-lg font-bold tabular-nums text-ink md:text-xl">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        This is the result of one individual creative, reported by the client during an early learning phase. It is not typical, not
        a guarantee and not representative of all campaigns. Results depend on the brand, offer, audience and budget.
      </p>
      <p className="mt-3 text-sm">
        <TextLink href={e.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'results' })}>
          See both performance snapshots in the Elyon case study
        </TextLink>
      </p>
    </div>
  )
}

function Testimonials() {
  return (
    <div className="grid h-full gap-4">
      {UGC_TESTIMONIALS.map((t) => (
        <figure key={t.id} className="rounded-3xl border border-hairline bg-surface-2/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Client testimonial</p>
          <blockquote className="mt-2 text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">{t.brand}</span> · {t.category}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export default function UgcWork({ items }) {
  const hasVideos = items.length > 0
  return (
    <Section id="work" label="ugc-work-heading">
      <Reveal>
        {hasVideos ? (
          <Head id="ugc-work-heading" eyebrow="Selected work" title="Creator-led ads, made for paid social." intro="Watch the work, then decide." />
        ) : (
          <Head id="ugc-work-heading" eyebrow="Selected work" title="Results and client feedback." intro="A creator-led result, and what clients say about working with us." />
        )}
      </Reveal>

      {hasVideos && <div className="mt-8 md:mt-10"><PortfolioGrid items={items} /></div>}

      <div className={`grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6 ${hasVideos ? 'mt-12 md:mt-14' : 'mt-8 md:mt-10'}`}>
        <Reveal className="h-full">
          <h3 className="sr-only">Results</h3>
          <ElyonResult />
        </Reveal>
        <Reveal delay={100} className="h-full">
          <h3 className="sr-only">Client feedback</h3>
          <Testimonials />
        </Reveal>
      </div>

      <div className="mt-8 flex justify-center">
        <RoadmapCta location="work" />
      </div>
    </Section>
  )
}
