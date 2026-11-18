import { trackEvent } from '../../lib/analytics.js'
import { formatMoney, USAGE_RIGHTS, SPRINT, SPRINT_PLUS, RAW_FOOTAGE } from '../../seo/businessKnowledge.js'
import { Section, Head, Reveal, TextLink } from './shared.jsx'

/* SECTION 8: usage rights, in plain language. Mirrors the published policy (USAGE_RIGHTS, extension prices, RAW_FOOTAGE) and adds
   nothing: six months included from delivery, an option to extend for the whole creative batch, the rest on demand. */

const tiers = (pkg) => pkg.usageExtensions.map((e) => `${e.months} months ${formatMoney(e.price)}`).join(', ')

export default function UgcRights() {
  return (
    <Section id="usage-rights" label="ugc-rights-heading">
      <Reveal>
        <Head
          id="ugc-rights-heading"
          eyebrow="Usage rights"
          title="Usage rights, simply explained."
          intro={`Every package includes ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights, starting from the date each video is delivered.`}
        />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-3">
        <Reveal className="h-full">
          <div className="h-full rounded-3xl border border-lime/30 bg-lime/[0.04] p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Included for {USAGE_RIGHTS.includedMonths} months</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Paid advertising, organic social posts and your website, worldwide.
            </p>
          </div>
        </Reveal>
        <Reveal delay={90} className="h-full">
          <div className="h-full rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">After {USAGE_RIGHTS.includedMonths} months</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Existing organic posts and website placements can stay live. Paid advertising stops unless you extend, and the videos can&rsquo;t be
              reshared or republished without an extension.
            </p>
          </div>
        </Reveal>
        <Reveal delay={180} className="h-full">
          <div className="h-full rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Need longer? Extend it.</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Extend usage for the whole creative batch.
            </p>
            <dl className="mt-3 space-y-2 text-[14px] text-ink-muted">
              <div><dt className="font-semibold text-ink">{SPRINT.name}</dt><dd>{tiers(SPRINT)}</dd></div>
              <div><dt className="font-semibold text-ink">{SPRINT_PLUS.name}</dt><dd>{tiers(SPRINT_PLUS)}</dd></div>
            </dl>
            <p className="mt-3 text-[12px] text-ink-subtle">Prices exclude VAT.</p>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <details className="group rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:p-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 [&::-webkit-details-marker]:hidden">
            More on usage rights
            <span aria-hidden="true" className="text-lime transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">+</span>
          </summary>
          <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-muted">
            <li>{USAGE_RIGHTS.perpetual}</li>
            <li>{USAGE_RIGHTS.creatorAccountAds.summary} {USAGE_RIGHTS.creatorAccountAds.notIncluded}</li>
            <li>Raw footage is available only as an optional add-on at {formatMoney(RAW_FOOTAGE.price)} per {RAW_FOOTAGE.per}, alongside your finished, edited videos.</li>
            <li>{USAGE_RIGHTS.notOwnership}</li>
          </ul>
        </details>
      </Reveal>

      <p className="mt-6 text-center text-sm text-ink-muted">
        <TextLink href="/pricing#package-info" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'rights' })}>Full usage-rights details on the Pricing page</TextLink>
      </p>
    </Section>
  )
}
