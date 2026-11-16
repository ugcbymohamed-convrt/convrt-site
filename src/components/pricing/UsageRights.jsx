import { SPRINT, SPRINT_PLUS, USAGE_RIGHTS, TAX, formatMoney } from '../../seo/businessKnowledge.js'
import { SectionHeader } from './shared.jsx'

/* "Your videos. Worldwide usage." Compact and benefit-first: three use cases, then one comparison table of extension
   prices for BOTH packages (always in the HTML), then the longer policy in a native <details> (its text is in the
   prerendered HTML too, and it is repeated in the FAQ). Paid Sprint packages only. Prices come from businessKnowledge.js. */
const USES = [
  { label: USAGE_RIGHTS.includedUses[0], icon: <><path d="M3 11v3a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z" /><path d="M15 9a4 4 0 010 6M18 6.5a8 8 0 010 11" /></> },
  { label: USAGE_RIGHTS.includedUses[1], icon: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></> },
  { label: USAGE_RIGHTS.includedUses[2], icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8.5h18M8 21h8" /></> },
]

const Icon = ({ children }) => (
  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-hairline-strong bg-surface-2 text-lime">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  </span>
)

export default function UsageRights() {
  const total = (m) => `${USAGE_RIGHTS.includedMonths + m} months in total`
  return (
    <section id="usage-rights" aria-labelledby="usage-heading" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-4xl px-5 md:px-8">
        <SectionHeader
          id="usage-heading"
          title={<>Your videos. <span className="text-lime">Worldwide usage.</span></>}
          intro="Every Creative Testing package includes six months of worldwide usage rights from delivery."
        />

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {USES.map((u) => (
            <li key={u.label} className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-1/60 px-4 py-3.5">
              <Icon>{u.icon}</Icon>
              <span className="text-[14px] font-medium leading-snug text-ink">{u.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-[12.5px] text-ink-subtle">
          Usage rights run for {USAGE_RIGHTS.includedMonths} months from the date each video is delivered. Existing organic posts and website placements may stay
          up afterwards; paid advertising must stop unless you extend.
        </p>

        <div className="mt-9 md:mt-11 rounded-[26px] border border-hairline bg-surface-1/50 p-5 md:p-7">
          <div className="text-center">
            <h3 className="font-display text-xl font-bold tracking-display text-ink md:text-2xl">Need more time?</h3>
            <p className="mt-1.5 text-sm text-ink-muted">Extend the usage rights for your entire creative batch.</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-hairline">
            <table className="w-full text-left text-[13px] md:text-sm">
              <caption className="sr-only">
                Usage rights extension prices per package, for the entire creative batch, excluding VAT
              </caption>
              <thead className="bg-surface-2 text-ink">
                <tr>
                  <th scope="col" className="px-3 py-3 font-semibold md:px-4">Add to your included {USAGE_RIGHTS.includedMonths} months</th>
                  <th scope="col" className="px-3 py-3 font-semibold md:px-4">{SPRINT.name}</th>
                  <th scope="col" className="px-3 py-3 font-semibold md:px-4">{SPRINT_PLUS.name}</th>
                </tr>
              </thead>
              <tbody className="text-ink-muted">
                {SPRINT.usageExtensions.map((e, i) => (
                  <tr key={e.months} className="border-t border-hairline">
                    <th scope="row" className="px-3 py-3 font-medium text-ink md:px-4">
                      Additional {e.months} months
                      <span className="block text-[11.5px] font-normal text-ink-subtle">{total(e.months)}</span>
                    </th>
                    <td className="px-3 py-3 font-display font-bold tabular-nums text-ink md:px-4">{formatMoney(e.price)}</td>
                    <td className="px-3 py-3 font-display font-bold tabular-nums text-ink md:px-4">{formatMoney(SPRINT_PLUS.usageExtensions[i].price)}</td>
                  </tr>
                ))}
                <tr className="border-t border-hairline">
                  <th scope="row" className="px-3 py-3 font-medium text-ink md:px-4">Perpetual usage</th>
                  <td className="px-3 py-3 md:px-4" colSpan={2}>Custom quote, subject to agreement with the featured creators</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-[12.5px] text-ink-subtle">
            Extension prices are for the entire creative batch, not per video. {TAX.pricesExcludeVat ? 'All prices exclude VAT.' : ''}{' '}
            Creator-account advertising (TikTok Spark Ads, Meta partnership ads) is arranged separately and priced individually.
          </p>

          <details className="group mt-4 rounded-2xl border border-hairline bg-black/20">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 [&::-webkit-details-marker]:hidden">
              Full usage-rights terms
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-lime transition-transform duration-300 group-open:rotate-45" fill="none" aria-hidden="true">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="space-y-2.5 px-4 pb-4 text-[13.5px] leading-relaxed text-ink-muted">
              {USAGE_RIGHTS.afterExpiry.mayRemain.map((t) => <p key={t}>{t}</p>)}
              {USAGE_RIGHTS.afterExpiry.mustStop.map((t) => <p key={t}>{t}</p>)}
              <p>{USAGE_RIGHTS.notOwnership}</p>
              <p>{USAGE_RIGHTS.creatorAccountAds.summary} {USAGE_RIGHTS.creatorAccountAds.notIncluded}</p>
              <p>{USAGE_RIGHTS.perpetual}</p>
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}
