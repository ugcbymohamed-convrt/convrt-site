import { useEffect, useRef, useState } from 'react'
import { primaryAction } from '../../i18n/cta.js'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../../lib/siteStats.js'
import { selectShowcase } from '../../content/portfolio.js'
import { SHOWCASE_INDUSTRIES } from '../../content/homeShowcase.js'
import RotaryStage from './RotaryStage.jsx'
import StudioEnvironment from './StudioEnvironment.jsx'

/* THE ENGLISH HOMEPAGE'S FOUNDER EXPERIENCE + CLIENT WORK: one cinematic studio scene, built to the approved reference and then enlarged so the videos are comfortable to watch.

   THE SCENE   is drawn on a fixed 1436 x 896 design grid (the featured video is 320 px wide on it, the side videos about 250 px) and scales as a whole (everything inside is positioned in percentages of it, text in container-query units), so the composition keeps the reference's
               proportions at any desktop width: the founder text at the left, three floating videos above a raised two-tier podium in a curved studio (StudioEnvironment), the client selector overlapping the podium's
               front, the two CTAs under it. From `xl` (1280 px) up the text, selector and buttons are placed ON the scene; below `xl` the scene is shown at a large scale (the videos stay about 230-310 px wide; on a phone the side videos peek in at the edges, and swipe or tap brings one forward)
               with the text above it and the selector and buttons below.
   THE VIDEOS  are the active client's three `showcase` portfolio entries (RotaryStage: a click, swipe or arrow key on a side video orbits it into the centre; nothing plays by itself).
   THE TEXT    is deliberately short: eyebrow, "Worked with" plus the clients figure (it comes from siteStats.js) and the owner-approved disclosure that this is the FOUNDER's combined experience.
   CRAWLABLE   the destinations of the three clients (Adscale -> the SaaS page, Elyon Dubai and Graspo -> their case studies) stay in the HTML as a visually hidden list that appears when a keyboard user focuses it;
               the descriptions in src/content/homeShowcase.js are kept for the other pages and tests, not drawn here.
   Switching client fades the stage out and in (190 ms, immediate for prefers-reduced-motion) and re-mounts it on the new client's first video, so nothing of the previous client keeps playing.
   The Spanish homepage keeps the older CaseStudies section (see App.jsx). */

const Arrow = () => (
  <svg viewBox="0 0 12 12" className="h-[1em] w-[1em]" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/* The two main conversion buttons. Same destinations as before (the Roadmap, or the booking link where the Roadmap is unavailable; the creator application form). Below `lg` they stack on a phone; on the
   scene they are the reference's two equal-height pills (sizes follow the scene). */
export function ShowcaseCtas() {
  const action = primaryAction('en')
  const base = 'group inline-flex items-center justify-center gap-[0.5em] rounded-full font-bold whitespace-nowrap min-h-[56px] px-8 text-base xl:min-h-[max(52px,4.1cqw)] xl:px-[max(24px,2.9cqw)] xl:text-[max(15px,1.2cqw)]'
  return (
    <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center xl:gap-[max(14px,1.4cqw)]">
      <a
        href={action.href}
        {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={`cta-gradient ${base} text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime`}
      >
        Become our next client
        <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Arrow /></span>
      </a>
      <a
        href="https://forms.gle/Bg8ubU2tnmMj88m7A"
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-ink text-canvas transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none`}
      >
        I'm a creator
        <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Arrow /></span>
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
    <section id="showcase" tabIndex={-1} aria-labelledby="showcase-heading" className="relative overflow-hidden pb-12 pt-8 md:pb-16 md:pt-12 scroll-mt-[72px] md:scroll-mt-24 focus:outline-none">
      <div className="relative mx-auto w-full max-w-[1500px] [container-type:inline-size] xl:aspect-[1436/896]">
        {/* founder statement: stacked above the scene below lg, placed on it from lg */}
        <div className="relative z-10 px-5 text-center md:px-8 xl:absolute xl:left-[7.66%] xl:top-[20.5%] xl:w-[17%] xl:px-0 xl:text-left">
          <div className="inline-flex items-center gap-[0.9em] text-[11px] xl:text-[max(9.5px,0.74cqw)]">
            <span className="h-px w-[1.8em] bg-lime" aria-hidden="true" />
            <span className="font-semibold uppercase tracking-[0.22em] text-lime">Founder experience</span>
          </div>
          <h2 id="showcase-heading" className="mt-4 font-display text-[2.6rem] font-bold leading-[1.02] tracking-display-xl text-ink min-[420px]:text-5xl md:text-[3.4rem] xl:mt-[1.1cqw] xl:text-[max(30px,2.6cqw)] xl:leading-[1.04]">
            Worked with{' '}<span className="block text-lime">{CONVRT_STATS.clients} clients</span>
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted xl:mx-0 xl:mt-[1.1cqw] xl:max-w-[15.5cqw] xl:text-[max(12px,0.94cqw)] xl:leading-[1.5]">{FOUNDER_EXPERIENCE.captionShort}</p>
        </div>

        {/* the scene: environment + the rotary videos */}
        <div className="relative mt-3 overflow-hidden xl:absolute xl:inset-0 xl:mt-0 xl:overflow-visible">
          {/* below xl the scene is shifted so the stage (at 59.19 % of the scene's width) sits exactly in the middle of the screen */}
          <div className={`relative left-1/2 aspect-[1436/896] w-[250vw] sm:w-[min(160vw,1400px)] -translate-x-[59.19%] transition-opacity duration-[190ms] motion-reduce:transition-none xl:left-0 xl:w-full xl:translate-x-0 ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <StudioEnvironment />
            <div id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${pickedId}`} className="absolute inset-0">
              <RotaryStage key={shown.id} items={shown.items} label={`${shown.client} videos. Choose a side video to bring it to the front.`} />
            </div>
          </div>
        </div>

        {/* the client selector, overlapping the front of the podium */}
        <div className="relative z-20 mx-auto -mt-[56.6vw] sm:-mt-[min(36.2vw,317px)] w-full max-w-[30rem] px-5 md:px-0 xl:absolute xl:left-[35.5%] xl:top-[63.7%] xl:mx-0 xl:mt-0 xl:w-[44.6%] xl:max-w-none">
          <div role="tablist" aria-label="Client work by industry" className="grid grid-cols-3 gap-[0.35rem] rounded-[22px] border border-white/[0.09] bg-[rgba(8,9,6,0.7)] p-[0.35rem] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)] backdrop-blur-md xl:gap-[0.55cqw] xl:rounded-[1.8cqw] xl:p-[0.5cqw]">
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
                  aria-controls="showcase-panel"
                  aria-label={`${c.client}, ${c.label}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(c.id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-[0.3rem] rounded-[17px] border px-2 py-2 transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none xl:min-h-0 xl:gap-[0.4cqw] xl:rounded-[1.4cqw] xl:py-[1cqw] ${on ? 'border-lime/80 bg-black/30 shadow-[0_0_24px_-5px_rgba(213,255,64,0.6),inset_0_0_14px_rgba(213,255,64,0.12)]' : 'border-transparent hover:bg-white/[0.05]'}`}
                >
                  <img
                    src={c.logo.src}
                    alt={c.logo.alt}
                    width={c.logo.w}
                    height={c.logo.h}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    style={{ '--lh': `${c.selectorHeight}px`, '--lhc': `${((c.selectorHeight * 1.3) / 14.36).toFixed(3)}cqw`, width: 'auto', maxWidth: '100%', filter: 'brightness(0) invert(1)', opacity: on ? 1 : 0.66 }}
                    className="h-[var(--lh)] object-contain transition-opacity duration-300 motion-reduce:transition-none xl:h-[var(--lhc)]"
                  />
                  <span className={`font-medium leading-none transition-colors duration-300 motion-reduce:transition-none text-[11px] xl:text-[max(11px,0.95cqw)] ${on ? 'text-lime' : 'text-ink-muted'}`}>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* the buttons: centred under the composition */}
        <div className="relative z-20 mt-6 px-5 md:px-8 xl:absolute xl:left-[57.8%] xl:top-[85.6%] xl:mt-0 xl:-translate-x-1/2 xl:px-0">
          <ShowcaseCtas />
        </div>

        {/* destinations of the three clients: in the HTML for search engines and screen readers, drawn only when a keyboard user focuses them */}
        <nav aria-label="Client case studies and service page" className="sr-only">
          <ul>
            {SHOWCASE_INDUSTRIES.map((c) => (
              <li key={c.id}>
                <a href={c.link.href} className="focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-2 focus-visible:left-2 focus-visible:z-30 focus-visible:rounded-full focus-visible:bg-black focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-lime">{c.link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
