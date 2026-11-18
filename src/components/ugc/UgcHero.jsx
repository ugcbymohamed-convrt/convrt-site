import { trackEvent } from '../../lib/analytics.js'
import { formatMoney, SPRINT, USAGE_RIGHTS, PRODUCTION_LANGUAGES } from '../../seo/businessKnowledge.js'
import { RoadmapCta, GhostCta } from './shared.jsx'
import CreatorVideoStage from './CreatorVideoStage.jsx'

/* SECTION 1: hero. Primary CTA: the Free Creative Growth Roadmap ("Get 5 Free Ad Concepts"). Secondary: pricing.

   THE VIDEO SHOWCASE. `items` are the approved creator videos (selectDisplayable). With at least one, the right-hand side is the
   interactive CreatorVideoStage (active video prominent, up to two more beside it, switchable by tap, swipe or keyboard).
   With none, the hero is a centred, text-led hero: no illustration, no placeholder footage and no stand-in content. Nothing here
   needs editing when the first approved videos are added to src/content/ugcPortfolio.js. */

const facts = () => [
  `From ${formatMoney(SPRINT.monthly)}/month, excl. VAT`,
  `${SPRINT.turnaroundBusinessDays} business days from script approval`,
  `${USAGE_RIGHTS.includedMonths} months worldwide usage rights`,
  PRODUCTION_LANGUAGES.core.join(' · '),
]

const rise = (ms) => ({ animationDelay: `${ms}ms` })

export default function UgcHero({ items }) {
  const hasWork = items.length > 0
  const centre = !hasWork
  return (
    <section aria-labelledby="ugc-h1" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-10 right-[-10%] h-[420px] w-[520px] rounded-full bg-violet/[0.10] blur-[150px]" />

      <div className={`relative mx-auto max-w-7xl px-5 pt-5 pb-10 md:px-8 md:pt-8 ${hasWork ? 'md:pb-14' : 'md:pb-16'}`}>
        {/* Grid areas: on phones the order is copy, CTAs, video stage, then the fact pills (so the stage is the first thing after the
            CTAs). From lg up the copy and pills stack on the left and the stage sits on the right. */}
        <div className={hasWork ? 'grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-12 lg:items-center' : ''}>
          <div className={`min-w-0 ${hasWork ? 'lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-end' : 'mx-auto max-w-4xl text-center'}`}>
            <div className="cs-fade-up inline-flex max-w-full items-center gap-2 rounded-2xl border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur sm:rounded-full">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted sm:text-xs sm:tracking-[0.18em]">
                UGC Video Agency · International &amp; Multilingual
              </span>
            </div>

            <h1
              id="ugc-h1"
              className={`mt-5 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.2rem] min-[400px]:text-[2.75rem] sm:text-[3rem] md:text-[3.5rem] ${hasWork ? 'lg:text-[2.75rem] xl:text-[3.6rem]' : 'lg:text-[4.25rem]'}`}
            >
              <span className="cs-fade-up block" style={rise(60)}>Human-led UGC ads.</span>
              <span className="cs-fade-up block" style={rise(150)}>Built for paid social.</span>
              <span className="cs-fade-up block text-lime" style={rise(240)}>Made to be tested.</span>
            </h1>

            <p className={`cs-fade-up mt-5 text-base leading-relaxed text-ink-muted md:text-lg ${centre ? 'mx-auto max-w-2xl' : 'max-w-xl'}`} style={rise(320)}>
              CONVRT is an international, multilingual UGC agency and creative production studio. We handle concepts, scripts, creator
              casting, filming and editing, and deliver finished, human-created UGC ads for paid social, with pricing and usage rights
              stated up front.
            </p>

            <div className={`cs-fade-up mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center ${centre ? 'sm:justify-center' : ''}`} style={rise(400)}>
              <RoadmapCta hero location="hero" className="w-full sm:w-auto" />
              <GhostCta href="/pricing#packages" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'hero' })} className="w-full sm:w-auto">
                See Pricing
              </GhostCta>
            </div>
            <p className={`cs-fade-up mt-4 text-[15px] leading-relaxed text-ink-muted ${centre ? 'mx-auto max-w-xl' : 'max-w-xl'}`} style={rise(470)}>
              Share a few brand details, then book a free strategy session where we present five personalized ad concepts. Brands in
              every industry are welcome, subject to a short fit check. No obligation.
            </p>
          </div>

          {hasWork && (
            <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
              <CreatorVideoStage items={items} />
            </div>
          )}

          <ul
            aria-label="At a glance"
            className={`cs-fade-up flex flex-wrap gap-2 ${hasWork ? 'lg:col-span-7 lg:col-start-1 lg:row-start-2 lg:self-start' : 'mt-6 justify-center'}`}
            style={rise(540)}
          >
            {facts().map((f) => (
              <li key={f} className="rounded-full border border-hairline bg-surface-1/60 px-3.5 py-1.5 text-[13px] font-medium text-ink backdrop-blur">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
