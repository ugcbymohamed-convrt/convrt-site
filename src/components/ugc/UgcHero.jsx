import { useEffect, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { formatMoney, SPRINT, USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { RoadmapCta, GhostCta } from './shared.jsx'
import CreatorVideoStage, { PhoneShowcaseFallback } from './CreatorVideoStage.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'

/* SECTION 1: hero. The homepage's split layout: copy on the left, three overlapping smartphone frames on the right.

   THE PHONES. With approved creator videos (selectDisplayable) the right side is the interactive CreatorVideoStage (one large
   active video, two smaller phones behind it, click a side phone to bring it to the centre). With none it is the same three
   frames, empty (PhoneShowcaseFallback): no stand-in footage and no play button. Adding the first approved videos to
   src/content/ugcPortfolio.js swaps the fallback for the stage with no other change.

   THE HEADLINE. "Human-led UGC ads. / Built for paid social. / to convrt." Each word slides up from behind a mask once on load; then
   only the last word changes, like a slot reel: the current word rolls up and out while the next rolls up in from below
   (convrt, resonate, sell, connect, back to convrt; it rests longer on "convrt"). The reel's width and height are reserved for the
   longest word, so nothing around it ever moves. The server HTML contains exactly "to convrt." (the other words are rendered only
   while a roll is in progress), so the indexable H1 is stable. Nothing rotates for prefers-reduced-motion or data-saver visitors,
   or while the tab is hidden.

   MOBILE ORDER (as on the homepage): headline and description, the phones, then the CTAs. */

const LINES = [
  ['Human-led', 'UGC', 'ads.'],
  ['Built', 'for', 'paid', 'social.'],
]
const ROTATING = ['convrt', 'resonate', 'sell', 'connect']
const ROLL_MS = 640
const HOLD_MS = 2300
const HOLD_BRAND_MS = 3400

/* The last word of the H1. Until it first rolls, it is plain text. */
function ReelWord() {
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
    <span className="ugc-reel text-lime" data-sizer="resonate.">
      <span className={`ugc-reel-track ${rolling ? 'is-rolling' : ''}`}>
        <span>{`${ROTATING[cur]}.`}</span>
        {rolling && <span aria-hidden="true">{`${ROTATING[next]}.`}</span>}
      </span>
    </span>
  )
}

function Headline() {
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
      id="ugc-h1"
      className="font-display font-bold text-ink tracking-display-xl leading-[1.05] text-[2rem] min-[400px]:text-[2.5rem] sm:text-[3rem] md:text-[3.4rem] lg:text-[2.4rem] xl:text-[3.35rem]"
    >
      {LINES.map((words) => (
        <span key={words[0]} className="block">
          {words.map((w, wi) => (
            <span key={w}>{word(w, w)}{wi < words.length - 1 ? ' ' : null}</span>
          ))}
        </span>
      ))}
      <span className="block">
        {word('to', 'to')}{' '}
        <span className="ugc-mask"><span className="ugc-word" style={{ animationDelay: `${80 + i * 55}ms` }}><ReelWord /></span></span>
      </span>
    </h1>
  )
}

const FACT_ICONS = {
  price: <path d="M12 3v18M16.5 7.5c-.8-1.3-2.4-2-4.5-2-2.6 0-4.3 1.2-4.3 3.1 0 4.3 8.8 2.2 8.8 6.5 0 1.9-1.9 3.2-4.5 3.2-2.2 0-3.9-.8-4.8-2.2" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  rights: <><path d="M12 3l7 3v5.5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6z" /><path d="M8.8 12.2l2.2 2.2 4.2-4.4" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.3-3.8-8.5S9.4 5.9 12 3.5z" /></>,
}

/* Four compact facts, from the business data. Pills, so the line scans instead of reading as a sentence. */
function Facts({ facts }) {
  return (
    <ul aria-label="At a glance" className="cs-fade-up mt-5 flex flex-wrap justify-center gap-2 lg:justify-start" style={{ animationDelay: '720ms' }}>
      {facts.map(([icon, text]) => (
        <li key={text} className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/70 px-3 py-1.5 text-[13px] font-medium leading-none text-ink-muted backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-lime" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{FACT_ICONS[icon]}</svg>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}

export default function UgcHero({ items }) {
  const hasWork = items.length > 0
  const facts = [
    ['price', `From ${formatMoney(SPRINT.monthly)}/month`],
    ['clock', `${SPRINT.turnaroundBusinessDays}-day production`],
    ['rights', `${USAGE_RIGHTS.includedMonths} months usage rights`],
    ['globe', 'English · Spanish · French · Arabic'],
  ]
  return (
    <section aria-labelledby="ugc-h1" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[38%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-violet/[0.08] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-4 pb-10 md:px-8 md:pt-6 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-4 lg:grid-cols-12 lg:gap-x-10">
          {/* Left column. Below lg its wrapper is `display: contents`, so the two groups can be ordered around the phones. */}
          <div className="contents text-center lg:col-span-6 lg:block lg:text-left">
            <div className="order-1 lg:order-none">
              <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur sm:rounded-full">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted sm:text-xs sm:tracking-[0.18em]">UGC Video Agency · International &amp; Multilingual</span>
              </div>
              <div className="mt-4 lg:mt-5"><Headline /></div>
              <p className="cs-fade-up mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg lg:mx-0 lg:mt-5" style={{ animationDelay: '520ms' }}>
                CONVRT is an international, multilingual UGC agency and creative production studio. We script, film and edit human-created UGC ads
                with real creators, built for paid social.
              </p>
            </div>

            <div className="order-3 lg:order-none">
              <div className="cs-fade-up mt-1 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:mt-7 lg:justify-start" style={{ animationDelay: '600ms' }}>
                <RoadmapCta hero location="hero" className="w-full sm:w-auto" />
                <GhostCta href="/pricing#packages" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'hero' })} className="w-full sm:w-auto">
                  See Pricing
                </GhostCta>
              </div>
              <p className="cs-fade-up mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted lg:mx-0" style={{ animationDelay: '660ms' }}>
                Share a few brand details and book a free strategy session where we present five personalized ad concepts. Every industry welcome,
                subject to a short fit check.
              </p>
              <Facts facts={facts} />
            </div>
          </div>

          <div className="order-2 min-w-0 lg:order-none lg:col-span-6">
            {hasWork ? <CreatorVideoStage items={items} /> : <PhoneShowcaseFallback />}
          </div>
        </div>
      </div>
    </section>
  )
}
