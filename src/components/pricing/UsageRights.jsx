import { SPRINT, SPRINT_PLUS, USAGE_RIGHTS, TAX, formatMoney } from '../../seo/businessKnowledge.js'
import { SectionHeader, Card, CardTitle, CardLabel, Check, Cross, Small } from './shared.jsx'

/* "Your creative. Flexible usage rights." Everything a buyer needs on one screen: what is included, what happens
   after the licence period, and extension prices per package. The table is a real <table> (3 narrow columns, no
   horizontal scroll on phones), so every figure is in the prerendered HTML. Prices come from businessKnowledge.js. */
export default function UsageRights() {
  return (
    <section id="usage-rights" aria-labelledby="usage-heading" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader
          id="usage-heading"
          eyebrow="Usage rights"
          title={<>Your creative. <span className="text-lime">Flexible usage rights.</span></>}
          intro={`Creative Testing packages include ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights, starting on ${USAGE_RIGHTS.startsOn}.`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          <div className="flex flex-col gap-4 md:gap-5">
            <Card>
              <CardLabel>Included</CardLabel>
              <CardTitle>{USAGE_RIGHTS.includedMonths} months, worldwide</CardTitle>
              <ul className="mt-3 space-y-2">
                {USAGE_RIGHTS.includedUses.map((use) => (
                  <li key={use} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <Check />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardLabel>After the initial period</CardLabel>
              <CardTitle>What stays up, what stops</CardTitle>
              <ul className="mt-3 space-y-2">
                {USAGE_RIGHTS.afterExpiry.mayRemain.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <Check />
                    <span>{t}</span>
                  </li>
                ))}
                {USAGE_RIGHTS.afterExpiry.mustStop.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-ink-muted">
                    <Cross />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="flex flex-col">
            <CardLabel>Extensions</CardLabel>
            <CardTitle>Extend the whole creative batch</CardTitle>
            <div className="mt-4 overflow-hidden rounded-2xl border border-hairline">
              <table className="w-full text-left text-[13px] md:text-sm">
                <caption className="sr-only">
                  Usage rights extension prices per package, for the entire creative batch, excluding VAT
                </caption>
                <thead className="bg-surface-2 text-ink">
                  <tr>
                    <th scope="col" className="px-3 md:px-4 py-3 font-semibold">Usage period</th>
                    <th scope="col" className="px-3 md:px-4 py-3 font-semibold">{SPRINT.name}</th>
                    <th scope="col" className="px-3 md:px-4 py-3 font-semibold">{SPRINT_PLUS.name}</th>
                  </tr>
                </thead>
                <tbody className="text-ink-muted">
                  <tr className="border-t border-hairline">
                    <th scope="row" className="px-3 md:px-4 py-3 font-medium text-ink">Included</th>
                    <td className="px-3 md:px-4 py-3 text-lime font-semibold">{USAGE_RIGHTS.includedMonths} months</td>
                    <td className="px-3 md:px-4 py-3 text-lime font-semibold">{USAGE_RIGHTS.includedMonths} months</td>
                  </tr>
                  {SPRINT.usageExtensions.map((e, i) => (
                    <tr key={e.months} className="border-t border-hairline">
                      <th scope="row" className="px-3 md:px-4 py-3 font-medium text-ink">Additional {e.months} months</th>
                      <td className="px-3 md:px-4 py-3 tabular-nums">{formatMoney(e.price)}</td>
                      <td className="px-3 md:px-4 py-3 tabular-nums">{formatMoney(SPRINT_PLUS.usageExtensions[i].price)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-hairline">
                    <th scope="row" className="px-3 md:px-4 py-3 font-medium text-ink">Perpetual usage</th>
                    <td className="px-3 md:px-4 py-3" colSpan={2}>Custom pricing, subject to agreement with the featured creator(s)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Small className="mt-3">
              Extension prices apply to the entire relevant creative batch. {TAX.pricesExcludeVat ? 'Prices exclude VAT.' : ''}
            </Small>
            <Small className="mt-3">{USAGE_RIGHTS.notOwnership}</Small>
          </Card>
        </div>

        <Card className="mt-4 md:mt-5">
          <div className="md:flex md:items-start md:gap-8">
            <div className="md:w-1/3">
              <CardLabel>Separate from usage rights</CardLabel>
              <CardTitle>{USAGE_RIGHTS.creatorAccountAds.title}</CardTitle>
            </div>
            <div className="mt-3 md:mt-0 md:flex-1 space-y-3">
              <Small>{USAGE_RIGHTS.creatorAccountAds.summary}</Small>
              <Small>{USAGE_RIGHTS.creatorAccountAds.notIncluded}</Small>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
