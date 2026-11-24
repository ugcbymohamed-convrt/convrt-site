import { trackEvent } from '../../lib/analytics.js'
import { ORGANIC, ORGANIC_COMMITMENT } from '../../seo/businessKnowledge.js'
import { ORGANIC_PACKAGES_LINES } from '../../i18n/organicPackagesCopy.js'
import { ORGANIC_PACKAGES_COPY as COPY_EN } from '../../content/organicSocialPage.js'
import { Section, Head, Reveal, TextLink, Tick } from '../ugc/shared.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeConfig } from '../../i18n/content.js'
import { money } from '../../i18n/money.js'

/* "Consistent content. Flexible support." A deliberately LIGHT commercial section: the two published organic packages side by side, a line of what both include and a link to the
   full Pricing page. It is not a second Pricing page: no billing switch, no feature matrix, no FAQ, no usage-rights panel.

   Every figure comes from src/seo/businessKnowledge.js at render time (ORGANIC, ORGANIC_COMMITMENT, CARD_NOTES, CUSTOM_PACKAGES); nothing is typed here, so this section can never disagree with
   /pricing. It states only what the pricing page already states: the monthly price, the published post cadence, what both packages include, the platforms, the six-month initial commitment
   and that community management excludes customer support. No video counts, turnaround times or response times exist for organic, so none are shown. */

/* One card design for every language: dark, with a thin accent border, a soft accent glow, accent ticks and an accent price. Organic Light = CONVRT lime, Organic Growth = the secondary magenta
   (the brand tokens `lime` and `magenta`). Same height and structure as before; no solid fills. */
const ACCENTS = {
  light: { border: 'border-lime/35 hover:border-lime/60', glow: 'bg-lime/[0.08]', price: 'text-lime', tick: 'text-lime', chip: 'border-lime/40 bg-lime/10 text-lime' },
  growth: { border: 'border-magenta/35 hover:border-magenta/60', glow: 'bg-magenta/[0.08]', price: 'text-magenta', tick: 'text-magenta', chip: 'border-magenta/40 bg-magenta/10 text-magenta' },
}

function PackageCard({ pkg }) {
  const a = ACCENTS[pkg.id === ORGANIC.growth.id ? 'growth' : 'light']
  return (
    <div className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-surface-1/60 p-6 backdrop-blur-md transition-colors duration-300 md:p-7 ${a.border}`}>
      <div aria-hidden="true" className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-[70px] ${a.glow}`} />
      <div className="relative flex h-full flex-col">
        <h3 className="font-display text-xl font-semibold tracking-snug text-ink">{pkg.name}</h3>
        <p className="mt-3 flex items-baseline gap-1.5">
          <span className={`font-display text-[2.6rem] font-bold leading-none tracking-display ${a.price}`}>{money(pkg.monthly)}</span>
          <span className="text-[15px] text-ink-muted">{tr('/month')}</span>
        </p>
        <p className="mt-3 flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-muted"><Tick className={a.tick} />{tr(pkg.cadence)}</p>
      </div>
    </div>
  )
}

export default function OrganicPackages() {
  const locale = currentLocale()
  const COPY = localizeConfig(COPY_EN, locale)
  const text = ORGANIC_PACKAGES_LINES[locale] ?? ORGANIC_PACKAGES_LINES.en
  const lines = text.lines.map((l) => l.replace('{months}', String(ORGANIC_COMMITMENT.initialMonths)))
  return (
    <Section id={COPY.id} label={COPY.headingId} className="!py-8 md:!py-10">
      <Reveal>
        <Head id={COPY.headingId} eyebrow={COPY.eyebrow} title={COPY.title} intro={COPY.intro} />
      </Reveal>
      <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10">
        {[ORGANIC.light, ORGANIC.growth].map((pkg, i) => (
          <li key={pkg.id} className="list-none">
            <Reveal delay={i * 90} className="h-full"><PackageCard pkg={pkg} /></Reveal>
          </li>
        ))}
      </ul>
      {/* three compact lines (no stacked small paragraphs), then the link to the full pricing page */}
      <Reveal className="mx-auto mt-5 max-w-4xl text-center">
        <p className="text-[15px] leading-relaxed text-ink">{lines[0]}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{lines[1]}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{lines[2]}</p>
        <p className="mt-3 text-[15px]">
          <TextLink href={COPY.link.href} onClick={() => trackEvent(COPY.track, { location: 'packages' })}>{text.link} <span aria-hidden="true">→</span></TextLink>
        </p>
      </Reveal>
    </Section>
  )
}
