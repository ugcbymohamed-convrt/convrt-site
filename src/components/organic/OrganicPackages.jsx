import { trackEvent } from '../../lib/analytics.js'
import { formatMoney, ORGANIC, ORGANIC_COMMITMENT, CARD_NOTES, CUSTOM_PACKAGES } from '../../seo/businessKnowledge.js'
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

const list = (items) => `${items.slice(0, -1).join(', ')} ${tr('and')} ${items.at(-1)}`

function PackageCard({ pkg }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:p-7">
      <h3 className="font-display text-xl font-semibold tracking-snug text-ink">{pkg.name}</h3>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-[2.6rem] font-bold leading-none tracking-display text-ink">{money(pkg.monthly)}</span>
        <span className="text-[15px] text-ink-muted">{tr('/month')}</span>
      </p>
      <p className="mt-3 flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-muted"><Tick />{tr(pkg.cadence)}</p>
    </div>
  )
}

/* ARABIC PRICING TREATMENT (owner, 2026-11-25): the two cards get their own brand accents (Organic Light lime, Organic Growth magenta) on the same dark surface, and the small print under the cards is
   three compact lines. Every figure still comes from the business data (price, post cadence, commitment months, platforms); the three lines are the owner's Arabic wording. The full conditions
   (VAT, community-management scope, customer-support exclusion) stay on /pricing, behind the link, and in the FAQ. */
const AR_ACCENT = {
  [ORGANIC.light.id]: { ring: 'border-lime/40 hover:border-lime/70', glow: 'rgba(213,255,64,0.20)', text: 'text-lime', tick: 'text-lime' },
  [ORGANIC.growth.id]: { ring: 'border-magenta/45 hover:border-magenta/75', glow: 'rgba(236,72,153,0.24)', text: 'text-magenta', tick: 'text-magenta' },
}
function PackageCardAr({ pkg }) {
  const a = AR_ACCENT[pkg.id]
  return (
    <div className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-surface-1/70 p-6 backdrop-blur-md transition-colors md:p-7 ${a.ring}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -left-10 h-48 w-48 rounded-full blur-[70px]" style={{ background: a.glow }} />
      <div className="relative flex items-center justify-between gap-3">
        <h3 className={`font-display text-xl font-semibold tracking-snug ${a.text}`}>{pkg.name}</h3>
        {pkg.id === ORGANIC.growth.id && <span className="rounded-full border border-magenta/45 bg-magenta/10 px-2.5 py-0.5 text-[11px] font-semibold text-magenta">{tr('Recommended')}</span>}
      </div>
      <p className="relative mt-3 flex items-baseline gap-2">
        <span dir="ltr" className="font-display text-[2.6rem] font-bold leading-none tracking-display text-ink">{money(pkg.monthly)}</span>
        <span className="text-[15px] text-ink-muted">شهريًا</span>
      </p>
      <p className="relative mt-3 flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-muted"><span className={a.tick}><Tick /></span>{tr(pkg.cadence)}</p>
    </div>
  )
}

export default function OrganicPackages() {
  const COPY = localizeConfig(COPY_EN, currentLocale())
  if (currentLocale() === 'ar') {
    return (
      <Section id={COPY.id} label={COPY.headingId} className="!py-8 md:!py-10">
        <Reveal>
          <Head id={COPY.headingId} eyebrow={COPY.eyebrow} title={COPY.title} intro={COPY.intro} />
        </Reveal>
        <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10">
          {[ORGANIC.light, ORGANIC.growth].map((pkg, i) => (
            <li key={pkg.id} className="list-none">
              <Reveal delay={i * 90} className="h-full"><PackageCardAr pkg={pkg} /></Reveal>
            </li>
          ))}
        </ul>
        <Reveal className="mx-auto mt-5 max-w-3xl text-center">
          <p className="text-[15px] leading-relaxed text-ink">تشمل الباقتان جدولة المحتوى والنشر وإدارة التفاعل على {ORGANIC.platforms.join(' و')}.</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">الالتزام الأولي {ORGANIC_COMMITMENT.initialMonths} أشهر. الأسعار قبل الضريبة، ولا تشمل الخدمة دعم العملاء.</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">تحتاج خطة مختلفة؟ خلنا نجهّز لك باقة تناسب علامتك.</p>
          <p className="mt-4 text-[15px]">
            <TextLink href={COPY.link.href} onClick={() => trackEvent(COPY.track, { location: 'packages' })}>{COPY.link.label} <span aria-hidden="true">←</span></TextLink>
          </p>
        </Reveal>
      </Section>
    )
  }
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
      <Reveal className="mx-auto mt-5 max-w-3xl text-center">
        <p className="text-[15px] leading-relaxed text-ink">
          {tr('Both include')} {ORGANIC.includedInBoth.map((x) => tr(x).toLowerCase()).join(`, ${tr('plus')} `)}, {tr('across')} {list(ORGANIC.platforms)}.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
          {tr(CARD_NOTES.organic)} {tr(ORGANIC.customerSupportNote)}
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{tr(CUSTOM_PACKAGES.organic.description)}</p>
        <p className="mt-4 text-[15px]">
          <TextLink href={COPY.link.href} onClick={() => trackEvent(COPY.track, { location: 'packages' })}>{COPY.link.label} <span aria-hidden="true">→</span></TextLink>
        </p>
      </Reveal>
    </Section>
  )
}
