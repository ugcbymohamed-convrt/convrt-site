import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { usePressFeedback } from '../../lib/usePressFeedback.js'
import { scrollToElement } from '../../lib/scroll.js'
import { usePreviewHost } from '../../lib/previewHost.js'
import { OFFER_PATHS, CREATOR_SHOWCASE_PATH } from '../../config.js'
import { SECONDARY_OFFERS, SecondaryOffer } from '../Hero.jsx'
import CreatorVideoStage, { PhoneShowcaseFallback } from './CreatorVideoStage.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'

/* SECTION 1: hero. The homepage hero's system: the left column has the same structure, type scale, CTA styles and the two free-offer
   cards (reused from components/Hero.jsx); the right column is the three-phone stage.

   THE PHONES. With approved creator videos (selectDisplayable) the right side is the interactive CreatorVideoStage (one large
   active video, two smaller phones behind it, click a side phone to bring it to the centre). With none it is the same three
   frames, empty (PhoneShowcaseFallback): no stand-in footage and no play button. Adding the first approved videos to
   src/content/portfolio.js swaps the fallback for the stage with no other change.

   THE HEADLINE. "Human-led UGC ads. / Built for paid social. / to convrt." Each word slides up from behind a mask once on load; then
   only the last word changes, like a slot reel: the current word rolls up and out while the next rolls up in from below
   (convrt, resonate, sell, connect, back to convrt; it rests longer on "convrt"). The reel's width and height are reserved for the
   longest word, so nothing around it ever moves. The server HTML contains exactly "to convrt." (the other words are rendered only
   while a roll is in progress), so the indexable H1 is stable. Nothing rotates for prefers-reduced-motion or data-saver visitors,
   or while the tab is hidden.

   MOBILE ORDER (as on the homepage): headline and description, the phones, then the CTAs. */

/* THE HERO IS CONFIGURATION-DRIVEN. UGC_HERO is this page's content and the default; /spokesperson-video-production passes its own (src/content/spokespersonPage.js)
   and gets the same layout, headline animation, CTA styles, offer cards and phone stage. A config supplies:
     id, lines, lead, words, sizer          the H1: fixed lines, the words before the rolling word, the rolling words and the width-reserving word
     description                           the paragraph under the headline
     primary / secondary                   the two CTAs ({ label, href }); secondary may also name an element id to scroll to when the page has it
     track                                 analytics event names
     stageLabel / stagePrefix              the phone stage's accessible name and analytics prefix
     previewPortraits                      whether preview hosts show stand-in portraits in the empty phones (UGC: yes) */
export const UGC_HERO = {
  id: 'ugc-h1',
  lines: [
    ['Human-led', 'UGC', 'ads.'],
    ['Built', 'for', 'paid', 'social.'],
  ],
  lead: ['to'],
  words: ['convrt', 'resonate', 'sell', 'connect'],
  sizer: 'resonate.',
  description: 'CONVRT is an international, multilingual UGC agency and creative production studio. We script, film and edit human-created UGC ads with real creators, built for paid social.',
  primary: { label: 'Get 5 Free Ad Concepts', href: OFFER_PATHS.roadmap },
  secondary: { label: 'See Our Work', href: CREATOR_SHOWCASE_PATH, scrollTo: 'ugc-videos' },
  track: { cta: 'ugc_page_cta_click', work: 'ugc_see_our_work_click' },
  stageLabel: 'Creator UGC videos',
  stagePrefix: 'ugc',
  previewPortraits: true,
}
const ROLL_MS = 640
const HOLD_MS = 2300
const HOLD_BRAND_MS = 3400

/* The last word of the H1. Until it first rolls, it is plain text. */
function ReelWord({ words: ROTATING, sizer }) {
  const allowed = useAutoplayAllowed()
  const [cur, setCur] = useState(0)
  const [rolling, setRolling] = useState(false)
  const next = (cur + 1) % ROTATING.length

  useEffect(() => {
    if (!allowed) return undefined
    let t1 = 0
    let t2 = 0
    const schedule = (from) => {
      t1 = window.setTimeout(() => {
        if (document.hidden) { schedule(from); return }
        setRolling(true)
        t2 = window.setTimeout(() => {
          setCur((from + 1) % ROTATING.length)
          setRolling(false)
          schedule((from + 1) % ROTATING.length)
        }, ROLL_MS + 40)
      }, from === 0 ? HOLD_BRAND_MS : HOLD_MS)
    }
    schedule(0)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [allowed])

  return (
    <span className="ugc-reel text-lime" data-sizer={sizer}>
      <span className={`ugc-reel-track ${rolling ? 'is-rolling' : ''}`}>
        <span>{`${ROTATING[cur]}.`}</span>
        {rolling && <span aria-hidden="true">{`${ROTATING[next]}.`}</span>}
      </span>
    </span>
  )
}

function Headline({ config }) {
  const { id, lines: LINES, lead, words, sizer } = config
  let i = 0
  const word = (w, key) => {
    const delay = 80 + i++ * 55
    return (
      <span key={key}>
        <span className="ugc-mask"><span className="ugc-word" style={{ animationDelay: `${delay}ms` }}>{w}</span></span>
      </span>
    )
  }
  return (
    <h1
      id={id}
      className="font-display font-semibold text-ink tracking-display-xl leading-[1.05] text-[2rem] min-[400px]:text-[2.5rem] sm:text-[3rem] md:text-[3.4rem] lg:text-[2.4rem] xl:text-[3.35rem]"
    >
      {LINES.map((words) => (
        <span key={words[0]} className="block">
          {words.map((w, wi) => (
            <span key={w}>{word(w, w)}{wi < words.length - 1 ? ' ' : null}</span>
          ))}
        </span>
      ))}
      <span className="block">
        {lead.flatMap((w) => [word(w, w), ' '])}
        <span className="ugc-mask"><span className="ugc-word" style={{ animationDelay: `${80 + i * 55}ms` }}><ReelWord words={words} sizer={sizer} /></span></span>
      </span>
    </h1>
  )
}

const PRIMARY_CTA = `cta-gradient hero-cta group inline-flex w-full sm:w-auto min-h-[64px] md:min-h-[68px] items-center justify-center gap-2.5
                             rounded-full px-6 md:px-7 lg:px-6 xl:px-7 py-4 text-base md:text-[17px] font-bold tracking-snug text-canvas
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime`
const GHOST_CTA = `hero-cta-ghost group inline-flex w-full sm:w-auto min-h-[48px] sm:min-h-[64px] md:min-h-[68px] items-center justify-center gap-2
                             rounded-full border border-hairline-strong bg-surface-2 px-6 md:px-7 lg:px-5 xl:px-7 py-3 sm:py-4 text-base md:text-[17px] font-semibold tracking-snug text-ink
                             hover:border-ink-muted
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink`
const Arrow = ({ cls }) => (
  <svg viewBox="0 0 12 12" className={`${cls} transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0`} fill="none" aria-hidden="true">
    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function UgcHero({ items, config = UGC_HERO }) {
  const hasWork = items.length > 0
  const primaryPress = usePressFeedback()
  const ghostPress = usePressFeedback()
  const preview = usePreviewHost()
  return (
    <section aria-labelledby={config.id} className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[40%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-6 pb-14 md:px-8 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left column: the homepage hero's structure (headline, description, one value line, two CTAs, two free offers).
              Below lg its wrapper is `display: contents`, so the two groups can be ordered around the phones. */}
          <div className="contents text-center lg:col-span-6 lg:block lg:text-left">
            <div className="order-1 lg:order-none">
              <Headline config={config} />
              <p className="cs-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:mt-8 md:text-lg lg:mx-0" style={{ animationDelay: '520ms' }}>
                {config.description}
              </p>
            </div>

            <div className="order-3 lg:order-none">
              <div className="cs-fade-up lg:mt-6" style={{ animationDelay: '600ms' }}>
                <p className="mb-3 text-balance text-[15px] font-medium leading-snug text-ink md:text-base">
                  Your next 5 ad concepts. Tailored to your brand. <span className="text-lime">On us.</span>
                </p>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                  <a href={config.primary.href} onClick={() => trackEvent(config.track.cta, { location: 'hero' })} {...primaryPress} className={PRIMARY_CTA}>
                    {config.primary.label}
                    <Arrow cls="h-4 w-4 md:h-[18px] md:w-[18px]" />
                  </a>
                  <a
                    href={config.secondary.href}
                    onClick={(e) => {
                      trackEvent(config.track.work, { location: 'hero' })
                      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                      const target = config.secondary.scrollTo ? document.getElementById(config.secondary.scrollTo) : null
                      if (!target) return // no gallery on this page yet: follow the link
                      e.preventDefault()
                      scrollToElement(target)
                    }}
                    {...ghostPress}
                    className={GHOST_CTA}
                  >
                    {config.secondary.label}
                    <Arrow cls="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </a>
                </div>
              </div>

              <div className="cs-fade-up mx-auto mt-8 max-w-xl md:mt-10 lg:mx-0" style={{ animationDelay: '680ms' }}>
                <p className="text-left text-[13px] text-ink-muted">{"Not ready yet? We've got two more FREE ways to start."}</p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
                  {SECONDARY_OFFERS.map((offer) => <SecondaryOffer key={offer.id} offer={offer} />)}
                </div>
              </div>
            </div>
          </div>

          <div className="order-2 min-w-0 lg:order-none lg:col-span-6">
            {hasWork ? <CreatorVideoStage items={items} label={config.stageLabel} trackPrefix={config.stagePrefix} /> : <PhoneShowcaseFallback portraits={config.previewPortraits && preview} />}
          </div>
        </div>
      </div>
    </section>
  )
}
