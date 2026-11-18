import { trackEvent } from '../../lib/analytics.js'
import { formatMoney, SPRINT, USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { RoadmapCta, GhostCta } from './shared.jsx'
import CreatorVideoStage, { PhoneShowcaseFallback } from './CreatorVideoStage.jsx'

/* SECTION 1: hero. The homepage's split layout: copy on the left, three overlapping smartphone frames on the right.

   THE PHONES. With approved creator videos (selectDisplayable) the right side is the interactive CreatorVideoStage (one large
   active video, two smaller phones behind it, click a side phone to bring it to the centre). With none it is the same three
   frames, empty (PhoneShowcaseFallback): no stand-in footage and no play button. Adding the first approved videos to
   src/content/ugcPortfolio.js swaps the fallback for the stage with no other change.

   THE HEADLINE (animation option B, "keyword emphasis"). The H1 keeps its exact, indexable text. Each word slides up from behind
   a mask once on load, in order; "tested." then gets a lime underline drawn under it. Nothing loops and nothing changes the text
   or the layout (the words are always in the HTML at their final size), and it is switched off for prefers-reduced-motion.

   MOBILE ORDER (as on the homepage): headline and description, the phones, then the CTAs. */

const LINES = [
  { words: ['Human-led', 'UGC', 'ads.'] },
  { words: ['Built', 'for', 'paid', 'social.'] },
  { words: ['Made', 'to', 'be', 'tested.'], accent: true },
]

function Headline() {
  let i = 0
  return (
    <h1
      id="ugc-h1"
      className="font-display font-bold text-ink tracking-display-xl leading-[1.05] text-[2rem] min-[400px]:text-[2.5rem] sm:text-[3rem] md:text-[3.4rem] lg:text-[2.4rem] xl:text-[3.35rem]"
    >
      {LINES.map((line) => (
        <span key={line.words[0]} className={`block ${line.accent ? 'text-lime' : ''}`}>
          {line.words.map((w, wi) => {
            const delay = 80 + i++ * 55
            const last = line.accent && wi === line.words.length - 1
            return (
              <span key={w}>
                <span className="ugc-mask">
                  <span className="ugc-word" style={{ animationDelay: `${delay}ms` }}>
                    {w}
                    {last && <span aria-hidden="true" className="ugc-underline" style={{ animationDelay: `${delay + 420}ms` }} />}
                  </span>
                </span>
                {wi < line.words.length - 1 ? ' ' : null}
              </span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

export default function UgcHero({ items }) {
  const hasWork = items.length > 0
  const facts = [
    `From ${formatMoney(SPRINT.monthly)}/month`,
    `${SPRINT.turnaroundBusinessDays}-day production`,
    `${USAGE_RIGHTS.includedMonths} months usage rights`,
    'English · Spanish · French · Arabic',
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
              <p className="cs-fade-up mt-4 text-[13px] leading-relaxed text-ink-muted" style={{ animationDelay: '720ms' }}>
                <span className="sr-only">At a glance: </span>
                {facts.join(' · ')}
              </p>
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
