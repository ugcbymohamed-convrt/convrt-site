import { useEffect, useMemo, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import {
  buildFacets, matchesFilters, posterUrl, creatorLabel, languageLabel, industryLabel, captionOf,
} from '../../content/portfolio.js'
import { Section, Head, Reveal, RoadmapCta, TextLink } from './shared.jsx'
import { useAttachSource, PlayGlyph } from './creatorVideo.jsx'
import { tr } from '../../i18n/tr.js'

/* SECTION 2: our best UGC work. A data-driven portfolio of approved vertical creator videos (src/content/portfolio.js).

   • Only videos with approval, portfolio permission and creator consent ever render. With none, this whole section is absent
     (it returns null): no placeholder, no stock footage, no "coming soon" message. The hero and the page work without it.
   • Browsing: a grid of large portrait cards (a swipe row on phones), category toggles (SaaS, E-commerce, Apps, Other: only those
     with approved videos), an optional language filter, a language badge and a short caption on every card, and "Show more"
     beyond PAGE videos so a large library never renders all at once.
   • Playback: poster-first. A <video> element (and its stream or download) exists only after a tap, one at a time, with sound. */

const PAGE = 6
const TONES = ['rgba(213,255,64,0.35)', 'rgba(139,92,246,0.38)', 'rgba(255,106,77,0.34)']

export function Player({ item }) {
  const ref = useRef(null)
  useAttachSource(ref, item)
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    const play = () => { v.play().catch(() => {}) }
    play()
    v.addEventListener('canplay', play, { once: true })
    /* pause when the card scrolls off screen */
    const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([e]) => { if (!e.isIntersecting) v.pause() }, { threshold: 0.1 })
    io?.observe(v)
    return () => { v.removeEventListener('canplay', play); io?.disconnect() }
  }, [item])
  return (
    <video
      ref={ref}
      controls
      playsInline
      preload="none"
      poster={posterUrl(item)}
      aria-label={captionOf(item)}
      className="absolute inset-0 h-full w-full bg-black object-cover"
    />
  )
}

function Card({ item, tone, playing, onPlay }) {
  const name = creatorLabel(item)
  const langs = (item.languages ?? []).map(languageLabel).join(' · ')
  const meta = [item.brand, item.category].filter(Boolean).join(' · ')
  return (
    <figure className="group flex h-full flex-col">
      <div
        className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-hairline-strong bg-surface-1 transition-[transform,box-shadow] duration-500 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        style={{ boxShadow: `0 30px 60px -30px rgba(0,0,0,0.9), 0 0 50px -22px ${tone}` }}
      >
        {playing ? (
          <Player item={item} />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`${tr('Play video:')} ${captionOf(item)}`}
            className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime"
          >
            <img src={posterUrl(item)} alt="" width="405" height="720" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span aria-hidden="true" className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink backdrop-blur">
              {(item.languages ?? []).map((l) => l.toUpperCase()).join(' · ')}
            </span>
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-ink backdrop-blur transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none">
              <PlayGlyph />
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 px-1">
        {meta && <p className="text-sm font-semibold text-ink">{meta}</p>}
        <p className="text-[15px] leading-snug text-ink-muted">{captionOf(item)}</p>
        <p className="mt-1 text-[13px] text-ink-muted">{[industryLabel(item.industry), langs, name].filter(Boolean).join(' · ')}</p>
        {item.caseStudyHref && (
          <p className="mt-1.5 text-[13px]"><TextLink href={item.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'portfolio' })}>{tr('Related case study')}</TextLink></p>
        )}
      </figcaption>
    </figure>
  )
}

function FilterGroup({ label, name, options, value, onChange }) {
  if (!options.length) return null
  const chip = (active) =>
    `rounded-full px-4 py-2 min-h-[40px] text-[14px] font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 motion-reduce:transition-none ${active ? 'bg-lime text-canvas shadow-[0_0_22px_rgba(213,255,64,0.35)]' : 'border border-hairline bg-surface-1 text-ink-muted hover:border-hairline-strong hover:text-ink'}`
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center justify-center gap-2">
      <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</span>
      <button type="button" aria-pressed={value === null} onClick={() => onChange(name, null)} className={chip(value === null)}>{tr('All')}</button>
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
  const [filters, setFilters] = useState({ language: null, category: null })
  const [activeId, setActiveId] = useState(null)
  const [limit, setLimit] = useState(pageSize)
  const facets = useMemo(() => buildFacets(items), [items])
  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setActiveId(null); setLimit(pageSize) }
  const matching = items.filter((i) => matchesFilters(i, filters))
  const shown = matching.slice(0, limit)
  const filterable = facets.language.length > 0 || facets.category.length > 0

  return (
    <div>
      {filterable && (
        <div className="mb-7 flex flex-col items-center gap-3">
          <FilterGroup label="Category" name="category" options={facets.category} value={filters.category} onChange={set} />
          <FilterGroup label="Language" name="language" options={facets.language} value={filters.language} onChange={set} />
          <p className="text-sm text-ink-muted" aria-live="polite">{matching.length} {matching.length === 1 ? 'video' : 'videos'}</p>
        </div>
      )}
      {/* keyed by the active filters, so the cards re-enter (staggered fade-rise) whenever a category or language changes */}
      <ul key={`${filters.category}-${filters.language}`} className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:gap-8">
        {shown.map((item, i) => (
          <li key={item.id} className="w-[72%] shrink-0 snap-center sm:w-[44%] md:w-auto">
            <div className="cs-card-in h-full" style={{ animationDelay: `${(i % PAGE) * 70}ms` }}>
              <Card
                item={item}
                tone={TONES[i % TONES.length]}
                playing={activeId === item.id}
                onPlay={() => { setActiveId(item.id); trackEvent('ugc_portfolio_play', { language: item.languages?.join(','), industry: item.industry }) }}
              />
            </div>
          </li>
        ))}
      </ul>
      {matching.length > limit && (
        <div className="mt-7 flex justify-center">
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

export default function UgcWork({ items }) {
  if (!items.length) return null
  return (
    <Section id="work" label="ugc-work-heading" glow>
      <Reveal>
        <Head id="ugc-work-heading" eyebrow="Our best UGC work" title={tr('Creator-led ads, made for paid social.')} intro="Real creators, made to stop the scroll. Watch the work." />
      </Reveal>
      <div className="mt-8 md:mt-10"><PortfolioGrid items={items} /></div>
      <div className="mt-9 flex justify-center">
        <RoadmapCta location="work" />
      </div>
    </Section>
  )
}
