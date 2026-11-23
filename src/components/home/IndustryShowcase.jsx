import { useCallback, useEffect, useRef, useState } from 'react'
import { OFFER_PATHS } from '../../config.js'
import { primaryAction } from '../../i18n/cta.js'
import { selectShowcase, posterUrl, captionOf } from '../../content/portfolio.js'
import { SHOWCASE_INDUSTRIES, SHOWCASE_CASE_STUDY_LINKS } from '../../content/homeShowcase.js'
import { Player } from '../ugc/UgcWork.jsx'
import { PlayGlyph } from '../ugc/creatorVideo.jsx'

/* THE ENGLISH HOMEPAGE'S CLIENT-WORK SHOWCASE: one connected block that continues the founder statement above it (logos → statement → this → the two main CTAs).

   LEFT  the industry navigation (SaaS · E-commerce · Printing, fixed order; a vertical tab list from lg, three equal tabs on mobile) and the active client: logo, one headline, one or two sentences,
         the link to the full case study (or, for SaaS, the SaaS service page: there is no Adscale case study).
   RIGHT a large portrait-video carousel of that client's videos (src/content/portfolio.js entries tagged `showcase`). Native horizontal scroll-snap, so touch swipe, trackpad, keyboard arrows and the
         arrow buttons all work; thumbnails and a counter show where you are, and the next video always peeks in.

   CRAWLABLE: all three industries' text and links are in the page HTML (inactive panels are `hidden`, not absent), the two case-study links are also always visible under the navigation, and the
   server render shows the first industry's carousel. PLAYBACK: poster first; nothing downloads until a visitor presses play, one video at a time (the shared Player), so the section never competes
   with the hero for bandwidth. MOTION: a short fade for the panel swap, disabled for prefers-reduced-motion. The Spanish homepage keeps the older CaseStudies section (see App.jsx). */

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d={dir < 0 ? 'M8 2L4 6l4 4' : 'M4 2l4 4-4 4'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const Arrow = () => (
  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

function MediaCarousel({ items, industry }) {
  const track = useRef(null)
  const [index, setIndex] = useState(0)
  const [edge, setEdge] = useState({ prev: false, next: items.length > 1 })
  const [playingId, setPlayingId] = useState(null)
  const n = items.length

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const p = max > 0 ? el.scrollLeft / max : 0
    setIndex(Math.min(n - 1, Math.max(0, Math.round(p * (n - 1)))))
    setEdge({ prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4 })
  }, [n])
  useEffect(() => {
    const el = track.current
    if (!el) return undefined
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure) }
    measure()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [measure])

  const go = (i) => {
    const el = track.current
    if (!el) return
    const target = Math.min(n - 1, Math.max(0, i))
    const card = el.children[target]
    const max = el.scrollWidth - el.clientWidth
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: Math.min(max, card.offsetLeft - el.children[0].offsetLeft), behavior: reduce ? 'auto' : 'smooth' })
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1) }
  }
  const pad = (v) => String(v).padStart(2, '0')

  return (
    <div className="min-w-0">
      <div className="relative">
        <ul
          ref={track}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${industry.client} videos. Scroll sideways or use the arrows to see more.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
        >
          {items.map((item, i) => (
            <li key={item.id} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} className="w-[72%] shrink-0 snap-start min-[480px]:w-[52%] lg:w-[calc((100%-1rem)/2.15)]">
              <figure
                className="relative aspect-[9/16] overflow-hidden rounded-[28px] border border-white/10 bg-surface-1"
                style={{ boxShadow: `0 34px 70px -34px rgba(0,0,0,0.95), 0 0 60px -30px ${industry.accent}` }}
              >
                {playingId === item.id ? (
                  <Player item={item} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlayingId(item.id)}
                    aria-label={`Play video ${i + 1} of ${n} for ${industry.client}`}
                    className="group absolute inset-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime"
                  >
                    <img src={posterUrl(item)} alt={captionOf(item)} width="405" height="720" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
                    <span aria-hidden="true" className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink backdrop-blur">{industry.client}</span>
                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-lime/60 bg-lime/20 text-ink backdrop-blur transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none">
                      <PlayGlyph className="h-6 w-6" />
                    </span>
                  </button>
                )}
              </figure>
            </li>
          ))}
          {/* End spacer: lets the LAST video also snap to the start edge, so every arrow press / thumbnail lands on exactly one video (card widths above: 72% / 52% / 1 of 2.15). */}
          <li aria-hidden="true" className="w-[calc(28%-1rem)] shrink-0 min-[480px]:w-[calc(48%-1rem)] lg:w-[calc((100%-1rem)*0.5349)]" />
        </ul>
        <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300 md:block ${edge.next ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {n > 1 && (
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5" role="group" aria-label="Choose a video">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show video ${i + 1} of ${n}`}
                aria-current={i === index ? 'true' : undefined}
                className={`relative h-14 w-8 overflow-hidden rounded-lg border transition-[border-color,opacity,transform] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${i === index ? 'border-lime opacity-100' : 'border-white/10 opacity-55 hover:opacity-90'}`}
              >
                <img src={posterUrl(item)} alt="" width="64" height="112" loading="lazy" decoding="async" draggable="false" className="h-full w-full object-cover" />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold tabular-nums text-ink-muted" aria-live="polite"><span className="text-ink">{pad(index + 1)}</span> / {pad(n)}</span>
          </div>
          <div className="flex items-center gap-2">
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(index + dir)}
                disabled={dir < 0 ? !edge.prev : !edge.next}
                aria-label={dir < 0 ? 'Previous video' : 'Next video'}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-lime/40 bg-surface-2 text-lime transition-colors hover:bg-lime hover:text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime disabled:cursor-default disabled:border-hairline disabled:text-ink-muted disabled:hover:bg-surface-2 disabled:hover:text-ink-muted"
              >
                <Chevron dir={dir} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* The two main conversion buttons, now closing the showcase. Same destinations as before (the Roadmap, or the booking link where the Roadmap is unavailable; the creator application form). */
export function ShowcaseCtas() {
  const action = primaryAction('en')
  return (
    <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4 md:mt-16">
      <a
        href={action.href}
        {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="cta-gradient group inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-full px-9 py-4 text-base font-bold text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime sm:min-w-[250px]"
      >
        Become our next client
        <svg viewBox="0 0 12 12" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
      <a
        href="https://forms.gle/Bg8ubU2tnmMj88m7A"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-full bg-ink px-9 py-4 text-base font-bold text-canvas transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none sm:min-w-[250px]"
      >
        I'm a creator
        <svg viewBox="0 0 12 12" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </div>
  )
}

export default function IndustryShowcase() {
  const [activeId, setActiveId] = useState(SHOWCASE_INDUSTRIES[0].id)
  const tabRefs = useRef({})
  // An industry is offered only with its three videos (as the older section did): never a half-empty carousel.
  const industries = SHOWCASE_INDUSTRIES.map((c) => ({ ...c, items: selectShowcase(c.clientId).slice(0, 3) })).filter((c) => c.items.length === 3)
  if (!industries.length) return null
  const active = industries.find((c) => c.id === activeId) ?? industries[0]

  const select = (id, focus = false) => {
    setActiveId(id)
    if (focus) tabRefs.current[id]?.focus()
  }
  const onTabKeyDown = (e, i) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? industries.length - 1 : (i + step + industries.length) % industries.length
    select(industries[next].id, true)
  }

  return (
    <section id="showcase" tabIndex={-1} aria-labelledby="showcase-heading" className="relative overflow-hidden pb-16 pt-6 md:pb-24 md:pt-10 scroll-mt-[72px] md:scroll-mt-24 focus:outline-none">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-lime/[0.035] blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <h2 id="showcase-heading" className="sr-only">Client work by industry</h2>

        <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-12 lg:gap-14">
          {/* LEFT: industry navigation + the active client */}
          <div className="lg:col-span-5">
            <div role="tablist" aria-label="Client work by industry" aria-orientation="vertical" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-1">
              {industries.map((c, i) => {
                const on = c.id === active.id
                return (
                  <button
                    key={c.id}
                    ref={(el) => { tabRefs.current[c.id] = el }}
                    type="button"
                    role="tab"
                    id={`showcase-tab-${c.id}`}
                    aria-selected={on}
                    aria-controls={`showcase-panel-${c.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(c.id)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={`group relative flex flex-col items-start rounded-2xl px-3 py-3 text-left transition-[background-color,color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none lg:flex-row lg:items-baseline lg:gap-4 lg:rounded-none lg:bg-transparent lg:px-0 lg:py-1.5 ${on ? 'bg-white/[0.06]' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}
                  >
                    <span aria-hidden="true" className={`absolute bottom-2 left-0 top-2 hidden w-[3px] rounded-full bg-lime transition-opacity duration-300 lg:block motion-reduce:transition-none ${on ? 'opacity-100' : 'opacity-0'}`} />
                    <span className={`text-xs font-semibold tabular-nums tracking-[0.18em] transition-colors duration-300 lg:w-9 lg:pl-5 ${on ? 'text-lime' : 'text-ink-subtle group-hover:text-ink-muted'}`}>{c.number}</span>
                    <span className={`font-display font-bold tracking-display transition-[color,font-size] duration-300 motion-reduce:transition-none ${on ? 'whitespace-nowrap text-base text-ink sm:text-xl lg:text-[3.4rem] lg:leading-[1.02]' : 'whitespace-nowrap text-base text-ink-muted group-hover:text-ink sm:text-xl lg:text-[1.7rem] lg:leading-[1.15]'}`}>{c.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="relative mt-7 lg:mt-9 lg:pl-5">
              {SHOWCASE_INDUSTRIES.map((c) => {
                const on = c.id === active.id
                return (
                  <div
                    key={c.id}
                    role="tabpanel"
                    id={`showcase-panel-${c.id}`}
                    aria-labelledby={`showcase-tab-${c.id}`}
                    hidden={!on}
                    className="sc-panel-in"
                  >
                    <img src={c.logo.src} alt={c.logo.alt} width={c.logo.w} height={c.logo.h} loading="lazy" decoding="async" draggable="false" style={{ height: `${c.logo.height}px`, width: 'auto', maxWidth: '240px', filter: 'brightness(0) invert(1)' }} className="object-contain object-left" />
                    <h3 className="mt-5 font-display text-[1.6rem] font-bold leading-[1.1] tracking-display text-ink md:text-[1.9rem]">{c.headline}</h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">{c.text}</p>
                    <a href={c.link.href} className="group mt-5 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-lime underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
                      {c.link.label}
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Arrow /></span>
                    </a>
                  </div>
                )
              })}
              <p className="mt-4 text-xs text-ink-subtle">
                Full case studies:{' '}
                {SHOWCASE_CASE_STUDY_LINKS.map((l, i) => (
                  <span key={l.href}>{i > 0 && ' · '}<a href={l.href} className="underline underline-offset-2 transition-colors hover:text-lime">{l.label}</a></span>
                ))}
              </p>
            </div>
          </div>

          {/* RIGHT: the active client's videos (re-mounted per industry so the carousel starts at its first video) */}
          <div className="sc-panel-in lg:col-span-7" key={active.id}>
            <MediaCarousel items={active.items} industry={active} />
          </div>
        </div>

        <ShowcaseCtas />
      </div>
    </section>
  )
}
