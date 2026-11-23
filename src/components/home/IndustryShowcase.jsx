import { useEffect, useRef, useState } from 'react'
import { primaryAction } from '../../i18n/cta.js'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../../lib/siteStats.js'
import { selectShowcase } from '../../content/portfolio.js'
import { SHOWCASE_INDUSTRIES, SHOWCASE_CASE_STUDY_LINKS } from '../../content/homeShowcase.js'
import RotaryStage from './RotaryStage.jsx'

/* THE ENGLISH HOMEPAGE'S FOUNDER EXPERIENCE + CLIENT WORK (cinematic studio).

   LEFT   the founder statement: "Worked with" plus the clients figure (it comes from siteStats.js) with the owner-approved disclosure under it (this is the FOUNDER's combined experience, not CONVRT-only),
          then the active client's short description and link.
   STAGE  three of that client's videos on a lit circular platform (RotaryStage): the centre one is featured, a click on either side video rotates it into the centre along a curved path.
   BELOW  the client selector (Adscale · SaaS, Elyon Dubai · E-commerce, Graspo · Printing, in this fixed order) and the two main conversion buttons.

   CRAWLABLE: all three clients' descriptions and links are in the page HTML (inactive panels are `hidden`), both case-study links are always visible, and the server render shows the first client's
   posters. Switching client re-mounts the stage with a short fade (immediate for prefers-reduced-motion), so no video of the previous client keeps playing. Copy: src/content/homeShowcase.js; videos: the
   `showcase` portfolio entries. The Spanish homepage keeps the older CaseStudies section (see App.jsx). */

const Arrow = () => (
  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/* The two main conversion buttons, closing the section. Same destinations as before (the Roadmap, or the booking link where the Roadmap is unavailable; the creator application form). */
export function ShowcaseCtas() {
  const action = primaryAction('en')
  return (
    <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
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
  // A client is offered only with its three videos (never a half-empty stage).
  const industries = SHOWCASE_INDUSTRIES.map((c) => ({ ...c, items: selectShowcase(c.clientId).slice(0, 3) })).filter((c) => c.items.length === 3)
  const [shownId, setShownId] = useState(industries[0]?.id) // the client whose videos are on the stage
  const [pickedId, setPickedId] = useState(industries[0]?.id) // the client the visitor just chose (the stage fades to it)
  const [fading, setFading] = useState(false)
  const timer = useRef(0)
  const tabRefs = useRef({})
  useEffect(() => () => window.clearTimeout(timer.current), [])
  if (!industries.length) return null
  const shown = industries.find((c) => c.id === shownId) ?? industries[0]

  const select = (id, focus = false) => {
    setPickedId(id)
    if (focus) tabRefs.current[id]?.focus()
    window.clearTimeout(timer.current)
    if (id === shownId) { setFading(false); return }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShownId(id); setFading(false); return }
    setFading(true)
    timer.current = window.setTimeout(() => { setShownId(id); setFading(false) }, 190)
  }
  const onTabKeyDown = (e, i) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? industries.length - 1 : (i + step + industries.length) % industries.length
    select(industries[next].id, true)
  }

  return (
    <section id="showcase" tabIndex={-1} aria-labelledby="showcase-heading" className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-14 scroll-mt-[72px] md:scroll-mt-24 focus:outline-none">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[30%] h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/[0.035] blur-[150px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-12 lg:gap-y-0">
          {/* founder statement */}
          <div className="text-center lg:col-span-4 lg:row-start-1 lg:self-end lg:pb-8 lg:text-left">
            <div className="inline-flex items-center gap-2.5">
              <span className="h-px w-7 bg-lime" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lime">Founder experience</span>
            </div>
            <h2 id="showcase-heading" className="mt-5 font-display text-[2.6rem] font-bold leading-[1.02] tracking-display-xl text-ink min-[420px]:text-5xl md:text-[3.4rem] lg:text-[3.2rem] xl:text-[4rem]">
              Worked with{' '}<span className="block text-lime">{CONVRT_STATS.clients} clients</span>
            </h2>
            <p className="mx-auto mt-5 max-w-sm text-[15px] leading-relaxed text-ink-muted md:text-base lg:mx-0">{FOUNDER_EXPERIENCE.captionShort}</p>
            <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-ink-subtle lg:mx-0">Across ecommerce, SaaS, apps and consumer markets.</p>
          </div>

          {/* the stage */}
          <div className={`order-2 transition-opacity duration-[190ms] motion-reduce:transition-none lg:order-none lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <RotaryStage key={shown.id} items={shown.items} label={`${shown.client} videos. Choose a side video to bring it to the front.`} />
          </div>

          {/* the active client */}
          <div className="order-4 lg:order-none lg:col-span-4 lg:row-start-2 lg:self-start">
            <div className="relative mx-auto max-w-md border-l-2 border-lime/70 pl-5 text-left lg:mx-0">
              {SHOWCASE_INDUSTRIES.map((c) => {
                const on = c.id === pickedId
                return (
                  <div key={c.id} role="tabpanel" id={`showcase-panel-${c.id}`} aria-labelledby={`showcase-tab-${c.id}`} hidden={!on} className="sc-panel-in">
                    <h3 className="font-display text-xl font-bold leading-tight tracking-display text-ink md:text-[1.4rem]">{c.headline}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{c.text}</p>
                    <a href={c.link.href} className="group mt-3 inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-lime underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
                      {c.link.label}
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Arrow /></span>
                    </a>
                  </div>
                )
              })}
              <p className="mt-1 text-xs text-ink-subtle">
                Full case studies:{' '}
                {SHOWCASE_CASE_STUDY_LINKS.map((l, i) => (
                  <span key={l.href}>{i > 0 && ' · '}<a href={l.href} className="underline underline-offset-2 transition-colors hover:text-lime">{l.label}</a></span>
                ))}
              </p>
            </div>
          </div>

          {/* the client selector, under the stage */}
          <div className="relative z-10 order-3 lg:order-none lg:col-span-8 lg:col-start-5 lg:row-start-3 lg:-mt-14">
            <div role="tablist" aria-label="Client work by industry" className="mx-auto grid max-w-xl grid-cols-3 gap-1.5 rounded-[22px] border border-white/10 bg-black/45 p-1.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md">
              {industries.map((c, i) => {
                const on = c.id === pickedId
                return (
                  <button
                    key={c.id}
                    ref={(el) => { tabRefs.current[c.id] = el }}
                    type="button"
                    role="tab"
                    id={`showcase-tab-${c.id}`}
                    aria-selected={on}
                    aria-controls={`showcase-panel-${c.id}`}
                    aria-label={`${c.client}, ${c.label}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(c.id)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 transition-[background-color,border-color] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${on ? 'border-lime/70 bg-lime/[0.07]' : 'border-transparent hover:bg-white/[0.05]'}`}
                  >
                    <img src={c.logo.src} alt={c.logo.alt} width={c.logo.w} height={c.logo.h} loading="lazy" decoding="async" draggable="false" style={{ height: `${c.selectorHeight}px`, width: 'auto', maxWidth: '100%', filter: 'brightness(0) invert(1)', opacity: on ? 1 : 0.6 }} className="object-contain transition-opacity duration-300 motion-reduce:transition-none" />
                    <span className={`text-[11px] font-medium leading-none transition-colors duration-300 motion-reduce:transition-none ${on ? 'text-lime' : 'text-ink-muted'}`}>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="order-5 mt-4 lg:order-none lg:col-span-12 lg:row-start-4 lg:mt-12">
            <ShowcaseCtas />
          </div>
        </div>
      </div>
    </section>
  )
}
