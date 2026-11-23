import { ApplyButton } from './shared.jsx'
import ConceptCardsVisual from './ConceptCardsVisual.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'

/* ─────────────────────────────────────────────
   HERO — the offer, one CTA, and a stack of five colour-coded concept cards
   that fans apart on scroll (see ConceptCardsVisual.jsx).
───────────────────────────────────────────── */

export default function RoadmapHero() {
  return (
    <section aria-labelledby="roadmap-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
        // The video now sits above this section, so fade the glow in instead of letting the section edge cut it.
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 150px, #000 330px)', maskImage: 'linear-gradient(to bottom, transparent 150px, #000 330px)' }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur sm:rounded-full">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted min-[400px]:text-[11px] min-[400px]:tracking-[0.16em] sm:text-xs sm:tracking-[0.18em]">{tr('Free Creative Strategy · By Application')}</span>
            </div>

            <h1 className={`mt-6 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.2rem] min-[400px]:text-[2.75rem] sm:text-[3rem] md:text-[3.5rem] ${currentLocale() === 'en' ? 'lg:text-[2.75rem] xl:text-[3.6rem]' : 'lg:text-[2.55rem] xl:text-[3.35rem]'}`}>
              <span className="block">{tr('Your Next 5 Ad Concepts.')}</span>
              <span className="block">{tr('Built for Your Brand.')}</span>
              <span className="block text-lime">{tr('On Us.')}</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              <span className="font-semibold text-ink">{tr('Stop guessing what ad to create next.')}</span>
              <br />
              {tr('Get five personalized advertising concepts built around your brand, audience, and growth goals, presented in a free creative strategy session with CONVRT.')}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-start">
              <ApplyButton location="hero" className="w-full sm:w-auto" />
              <div className="text-sm leading-relaxed text-ink-subtle">
                <p>{tr('For brands in every industry. No obligation.')}</p>
                <p>{tr('Takes about a minute. Qualifying brands can book right away.')}</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="min-w-0 lg:col-span-5">
            <ConceptCardsVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
