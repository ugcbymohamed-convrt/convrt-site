import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { editorial } from '../../i18n/editorial.js'

/* SECTION 1: a short, text-only hero. The H1 and one sentence, then the library starts straight away: no statistics, no service copy,
   no phone mock-ups. Dark canvas, white type, lime only on the last word and a faint glow.

   The standing « examples from independent creators » paragraph that used to sit under the intro was removed in every language (owner decision, 2026-11-24). Provenance is kept in the data
   (`production`, `creator`, `brand` in portfolio.js) and in the video detail view; the SEO description still says the videos are creators' examples. */
/* The Arabic subtitle is one sentence (the English one is three translated pieces); a constant keeps it out of the Spanish completeness scan. */
const AR_SUBTITLE = 'Explore real creator videos across e-commerce, SaaS, services and more.'

export default function OurWorkHero({ empty = false }) {
  return (
    <section aria-labelledby="our-work-heading" className="relative overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[320px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.06] blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-6 pt-5 md:px-8 md:pb-8 md:pt-8">
        <h1 id="our-work-heading" className="max-w-4xl font-display text-[2.4rem] font-bold leading-[1.03] tracking-display-xl text-ink sm:text-5xl md:text-6xl">
          {tr("See what's")} <span className={editorial()?.headingBreak ? 'text-lime sm:block' : 'text-lime'}>{tr('possible.')}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:mt-5 md:text-lg">{empty ? tr('Examples from independent creators in your language, coming soon.') : editorial()?.showcaseIntro ?? (currentLocale() === 'en' ? <>{tr('Explore real creator videos across')}{' '}<span className="whitespace-nowrap">{tr('e-commerce')}</span>{tr(', SaaS, services and more.')}</> : currentLocale() === 'ar' ? tr(AR_SUBTITLE) : tr('Discover different styles of UGC and Spokesperson with real creators.'))}</p>
      </div>
    </section>
  )
}
