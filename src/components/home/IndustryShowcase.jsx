import { useEffect, useRef, useState } from 'react'
import { primaryAction } from '../../i18n/cta.js'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../../lib/siteStats.js'
import { selectShowcase } from '../../content/portfolio.js'
import { showcaseIndustriesFor, SHOWCASE_COPY_ES, SHOWCASE_EXTRA_LINKS_AR } from '../../content/homeShowcase.js'
import { currentLocale } from '../../i18n/locale.js'
import { FR_SHOWCASE } from '../../i18n/fr/showcase.js'
import { tr, hrefFor } from '../../i18n/tr.js'
import { stepOfArrow, forward } from '../../lib/rtl.js'
import RotaryStage from './RotaryStage.jsx'
import StudioEnvironment from './StudioEnvironment.jsx'

/* THE ENGLISH HOMEPAGE'S FOUNDER EXPERIENCE + CLIENT WORK: one centred, symmetrical composition on a single vertical axis.

   ORDER   1 eyebrow "FOUNDER EXPERIENCE"  2 headline "Worked with" + the clients figure (it comes from siteStats.js)  3 the owner-approved disclosure (this is the FOUNDER's combined experience, not CONVRT-only)
           4 the studio scene: three true 9:16 videos on a lit podium (the featured one 320 px wide in a lime halo, the sides about 250 px, tucked slightly behind it)  5 the client selector, overlapping the front of the podium  6 the two main CTAs.
   SCENE   is drawn on a fixed 1280 x 740 design grid (StudioEnvironment + RotaryStage) and scales as a whole; the videos stay 185-310 px wide from a phone to a desktop (below 640 px the scene is shown larger than the
           screen and centred on the featured video, the side videos peeking in at the edges; swipe, tap or the arrow keys bring one forward).
   THE VIDEOS are the active client's three `showcase` portfolio entries (a click, swipe or arrow key on a side video orbits it into the centre). The FRONT video of the first client (Adscale, the "ROAS jail" video) plays by itself, muted, as soon
               as the visitor scrolls the stage into view (RotaryStage, `autoPlayOnView`); nothing else ever starts by itself.
   CRAWLABLE   the destinations of the clients (Adscale -> the SaaS page, Elyon Dubai -> its case study) stay in the HTML as a visually hidden list that appears when a keyboard user focuses it;
               the descriptions in src/content/homeShowcase.js are kept for the other pages and tests, not drawn here.
   Switching client fades the stage out and in (190 ms, immediate for prefers-reduced-motion) and re-mounts it on the new client's first video, so nothing of the previous client keeps playing.
   The Spanish homepage keeps the older CaseStudies section (see App.jsx). */

const Arrow = () => (
  <svg viewBox="0 0 12 12" className="h-[1em] w-[1em]" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/* The two main conversion buttons. Same destinations as before (the Roadmap, or the booking link where the Roadmap is unavailable; the creator application form). Below `lg` they stack on a phone; on the
   scene they are the reference's two equal-height pills (sizes follow the scene). */
export function ShowcaseCtas() {
  const locale = currentLocale()
  const en = locale === 'en'
  const fr = locale === 'fr'
  const action = primaryAction(locale)
  const base = 'group inline-flex items-center justify-center gap-[0.5em] rounded-full font-bold whitespace-nowrap min-h-[58px] px-9 text-base'
  return (
    <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
      <a
        href={action.href}
        {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={`cta-gradient ${base} text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime`}
      >
        {en ? 'Become our next client' : tr('Become our next client')}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Arrow /></span>
      </a>
      {/* Creator recruitment is an English-only Google Form (creator-side flow): not offered from the Spanish or Arabic sites. */}
      {/* French: the creator form is English-only, so the second button goes to the French Creator Showcase. */}
      {(en || fr) && <a
        href={fr ? hrefFor('/creator-showcase') : 'https://forms.gle/Bg8ubU2tnmMj88m7A'}
        {...(fr ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        className={`${base} bg-ink text-canvas transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:transition-none`}
      >
        {fr ? tr('Explore All Creators') : "I'm a creator"}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"><Arrow /></span>
      </a>}
    </div>
  )
}

export default function IndustryShowcase() {
  // A client is offered only with its three videos (never a half-empty stage).
  const es = currentLocale() === 'es'
  // French: ONE client on three landscape videos (src/i18n/fr/showcase.js), a still plate instead of the selector.
  const fr = currentLocale() === 'fr' ? FR_SHOWCASE : null
  const landscape = fr?.orientation === 'landscape'
  const locale = currentLocale()
  const en = locale === 'en'
  const SHOWCASE_INDUSTRIES = showcaseIndustriesFor(locale) // English: its clients; Spanish: its two groups; Arabic: Graspo + One Royal
  const list = fr ? [{ id: fr.clientId, clientId: fr.clientId, client: fr.client, label: fr.plateLabel, logo: fr.logo, selectorHeight: fr.selectorHeight, link: null }] : SHOWCASE_INDUSTRIES
  const industries = list.map((c) => ({ ...c, items: selectShowcase(c.clientId).slice(0, 3) })).filter((c) => c.items.length === 3)
  const [shownId, setShownId] = useState(industries[0]?.id) // the client whose videos are on the stage
  const [pickedId, setPickedId] = useState(industries[0]?.id) // the client the visitor just chose (the stage fades to it)
  const [fading, setFading] = useState(false)
  const [visitorChose, setVisitorChose] = useState(false) // the visitor picked a client themselves: nothing starts by itself any more
  const timer = useRef(0)
  const tabRefs = useRef({})
  useEffect(() => () => window.clearTimeout(timer.current), [])
  if (!industries.length) return null
  const shown = industries.find((c) => c.id === shownId) ?? industries[0]
  const single = industries.length === 1 // one client: no selector, no tabs, nothing that suggests another case exists

  const select = (id, focus = false) => {
    setPickedId(id)
    if (id !== shownId) setVisitorChose(true)
    if (focus) tabRefs.current[id]?.focus()
    window.clearTimeout(timer.current)
    if (id === shownId) { setFading(false); return }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setShownId(id); setFading(false); return }
    setFading(true)
    timer.current = window.setTimeout(() => { setShownId(id); setFading(false) }, 190)
  }
  const onTabKeyDown = (e, i) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key] ?? (stepOfArrow(e.key) || undefined)
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? industries.length - 1 : (i + step + industries.length) % industries.length
    select(industries[next].id, true)
  }

  return (
    <section id="showcase" tabIndex={-1} aria-labelledby="showcase-heading" className="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-14 scroll-mt-[72px] md:scroll-mt-24 focus:outline-none">
      <div className="relative mx-auto w-full max-w-[1280px]">
        {/* 1-3: eyebrow, headline, disclosure, centred above everything */}
        <div className="relative z-10 px-5 text-center md:px-8">
          <div className="inline-flex items-center gap-3 text-[11px] md:text-xs">
            <span className="h-px w-8 bg-lime" aria-hidden="true" />
            <span className="font-semibold uppercase tracking-[0.22em] text-lime">{fr ? fr.eyebrow : es ? SHOWCASE_COPY_ES.eyebrow : en ? 'Founder experience' : tr('Founder experience')}</span>
            <span className="h-px w-8 bg-lime" aria-hidden="true" />
          </div>
          {fr ? (
            <h2 id="showcase-heading" className="mx-auto mt-4 font-display text-[2.4rem] font-bold leading-[1.04] tracking-display-xl text-ink min-[420px]:text-[2.9rem] md:text-[3.5rem] lg:text-[4rem]">
              {fr.headline[0]}{' '}<span className="block text-lime sm:inline">{fr.headline[1]}</span>
            </h2>
          ) : es ? (
            /* Spanish: the owner's two-sentence headline ("Más de 500 clientes. Una experiencia que marca la diferencia."); the second sentence is the lime one. Sized down a little so it sets on two balanced lines. */
            <h2 id="showcase-heading" className="mx-auto mt-4 max-w-5xl font-display text-[2.1rem] font-bold leading-[1.06] tracking-display-xl text-ink [text-wrap:balance] min-[420px]:text-[2.45rem] md:text-[3rem] lg:text-[3.4rem]">
              {tr('more than')[0].toUpperCase() + tr('more than').slice(1)} {CONVRT_STATS.clients.replace('+', '')} {tr('clients')}.{' '}<span className="block text-lime">{tr('An experience that makes the difference.')}</span>
            </h2>
          ) : (
            <h2 id="showcase-heading" className="mx-auto mt-4 font-display text-[2.4rem] font-bold leading-[1.04] tracking-display-xl text-ink min-[420px]:text-[2.9rem] md:text-[3.5rem] lg:text-[4rem]">
              {en ? <>Worked with{' '}<span className="block text-lime sm:inline">{CONVRT_STATS.clients} clients</span></> : <>{tr('Worked with')}{' '}<span className="block text-lime sm:inline">{tr('more than')} {CONVRT_STATS.clients.replace('+', '')} {tr('clients')}</span></>}
            </h2>
          )}
          <p className="mx-auto mt-4 max-w-md text-balance text-[15px] leading-relaxed text-ink-muted md:max-w-xl md:text-base">{fr ? fr.text : en ? FOUNDER_EXPERIENCE.captionShort : tr(FOUNDER_EXPERIENCE.captionShort)}</p>
          <p className="mt-3 text-sm md:text-[15px]">
            <a href={hrefFor('/about')} className="font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">{tr('About CONVRT and its founder')} <span aria-hidden="true">{forward()}</span></a>
          </p>
        </div>

        {/* 4: the scene (environment + the rotary videos). Below 640 px it is wider than the screen and centred on the featured video. The wrapper's top padding is headroom so the featured card's halo is never cut off at the top. */}
        <div className="relative -mt-3 overflow-hidden pt-10">
          <div className={`relative left-1/2 aspect-[1280/740] ${landscape ? 'w-[165vw]' : 'w-[230vw]'} -translate-x-1/2 transition-opacity duration-[190ms] motion-reduce:transition-none sm:w-[max(100%,900px)] ${fading ? 'opacity-0' : 'opacity-100'}`}>
            <StudioEnvironment />
            <div id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${pickedId}`} className="absolute inset-0">
              <RotaryStage key={shown.id} autoPlayOnView={es || !visitorChose} autoAll={es} landscape={landscape} items={shown.items} label={fr ? fr.stageLabel : es ? shown.stageLabel : en ? `${shown.client} videos. Choose a side video to bring it to the front.` : `${tr('Videos of')} ${shown.client}. ${tr('Choose a side video to bring it to the front.')}`} />
            </div>
          </div>
        </div>

        {/* 5: the client selector, overlapping the front of the podium and centred on the same axis */}
        <div className={`relative z-20 mx-auto -mt-[27vw] w-full ${single ? 'max-w-[15rem]' : 'max-w-[42rem]'} px-5 sm:-mt-[min(max(11.7vw,105px),150px)] md:px-0`}>
          <div role={single ? undefined : 'tablist'} aria-label={single ? undefined : es ? SHOWCASE_COPY_ES.tablistLabel : en ? 'Client work by industry' : tr('Client work by industry')} className={`grid ${single ? 'grid-cols-1' : 'grid-cols-2'} gap-[0.4rem] ${es || single ? '' : 'mx-auto max-w-[29rem]'} rounded-[26px] border border-white/[0.09] bg-[rgba(8,9,6,0.74)] p-[0.45rem] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)] backdrop-blur-md`}>
            {industries.map((c, i) => {
              const on = c.id === pickedId
              const Wrap = single ? 'div' : 'button'
              return (
                <Wrap
                  key={c.id}
                  {...(single ? {} : {
                    ref: (el) => { tabRefs.current[c.id] = el },
                    type: 'button',
                    role: 'tab',
                    id: `showcase-tab-${c.id}`,
                    'aria-selected': on,
                    'aria-controls': 'showcase-panel',
                    'aria-label': c.client ? `${c.client}, ${c.label}` : c.label,
                    tabIndex: on ? 0 : -1,
                    onClick: () => select(c.id),
                    onKeyDown: (e) => onTabKeyDown(e, i),
                  })}
                  className={`flex min-h-[96px] flex-col items-center justify-center gap-[0.55rem] rounded-[20px] border px-2 py-3 sm:min-h-[122px] sm:gap-[0.7rem] sm:py-4 transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${on ? 'border-lime/80 bg-black/30 shadow-[0_0_24px_-5px_rgba(213,255,64,0.6),inset_0_0_14px_rgba(213,255,64,0.12)]' : 'border-transparent hover:bg-white/[0.05]'}`}
                >
                  {c.logo ? (
                    <img
                      src={c.logo.src}
                      alt={c.logo.alt}
                      width={c.logo.w}
                      height={c.logo.h}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      style={{ '--lh': `${c.selectorHeight}px`, width: 'auto', maxWidth: '100%', filter: 'brightness(0) invert(1)', opacity: on ? 1 : 0.7 }}
                      className="h-[calc(var(--lh)*1.3)] object-contain transition-opacity duration-300 motion-reduce:transition-none sm:h-[calc(var(--lh)*1.65)]"
                    />
                  ) : c.kind !== 'portfolio' ? (
                    /* a client without a logo file yet: its NAME, set as a wordmark (never a substitute logo) */
                    <span dir="ltr" lang="en" className="flex items-center font-display text-[17px] font-bold leading-none tracking-tight text-ink transition-opacity duration-300 motion-reduce:transition-none sm:text-[22px]" style={{ height: `calc(var(--lh) * 1.3)`, '--lh': `${c.selectorHeight}px`, opacity: on ? 1 : 0.7 }}>{c.client}</span>
                  ) : (
                    /* a portfolio group has no client logo: a play-frame glyph and a "Portfolio" tag stand in, at the same height as a logo, so the two tabs stay balanced */
                    <span
                      aria-hidden="true"
                      style={{ '--lh': `${c.selectorHeight}px`, opacity: on ? 1 : 0.7 }}
                      className="flex h-[calc(var(--lh)*1.3)] items-center gap-2 text-ink transition-opacity duration-300 motion-reduce:transition-none sm:h-[calc(var(--lh)*1.65)]"
                    >
                      <svg viewBox="0 0 28 40" className="h-[78%] w-auto" fill="none"><rect x="1.5" y="1.5" width="25" height="37" rx="5" stroke="currentColor" strokeWidth="2" /><path d="M11 14.5v11l9-5.5z" fill="currentColor" /></svg>
                      <span className="rounded-full border border-current px-2 py-[1px] text-[9px] font-semibold uppercase leading-[1.5] tracking-[0.16em] sm:text-[10px]">{SHOWCASE_COPY_ES.portfolioTag}</span>
                    </span>
                  )}
                  <span className={`text-[13px] font-semibold leading-none transition-colors duration-300 motion-reduce:transition-none sm:text-[15px] ${on ? 'text-lime' : 'text-ink-muted'}`}>{c.label}</span>
                </Wrap>
              )
            })}
          </div>
          {es && <p aria-live="polite" className="mt-3 px-2 text-center text-[13px] leading-snug text-ink-muted">{shown.caption}</p>}
        </div>

        {/* 6: the buttons, close under the selector so they read as part of the same composition */}
        <div className="relative z-20 mt-12 px-5 md:mt-16 md:px-8">
          <ShowcaseCtas />
        </div>

        {/* destinations of the three clients: in the HTML for search engines and screen readers, drawn only when a keyboard user focuses them */}
        {!fr && <nav aria-label={es ? SHOWCASE_COPY_ES.navLabel : en ? 'Client case studies and service page' : tr('Client case studies and service page')} className="sr-only">
          <ul>
            {SHOWCASE_INDUSTRIES.map((c) => (
              <li key={c.id}>
                <a href={en ? c.link.href : hrefFor(c.link.href)} className="focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-2 focus-visible:left-2 focus-visible:z-30 focus-visible:rounded-full focus-visible:bg-black focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-lime">{c.link.label}</a>
              </li>
            ))}
            {/* Arabic: the Elyon Dubai study (paid-advertising proof) stays one crawlable click away although the Arabic stage shows two other clients. */}
            {locale === 'ar' && SHOWCASE_EXTRA_LINKS_AR.map((c) => (
              <li key={c.id}>
                <a href={hrefFor(c.link.href)} className="focus-visible:not-sr-only focus-visible:absolute focus-visible:bottom-2 focus-visible:left-2 focus-visible:z-30 focus-visible:rounded-full focus-visible:bg-black focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:text-lime">{c.link.label}</a>
              </li>
            ))}
          </ul>
        </nav>}
      </div>
    </section>
  )
}
