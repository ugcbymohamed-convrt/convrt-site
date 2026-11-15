import { SPRINT, SPRINT_PLUS, COMMITMENT, SINGLE_VIDEOS, TAX, formatMoney } from '../../seo/businessKnowledge.js'
import { Card, CardTitle, CardLabel, Small } from './shared.jsx'

/* Directly under the paid packages: how the monthly price is committed to, what a one-off costs, and VAT.
   Currencies are shown exactly as supplied (monthly in EUR, one-off in USD). Nothing is converted. */
export default function CommercialTerms() {
  return (
    <div className="mt-5 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      <Card>
        <CardLabel>Monthly partnership</CardLabel>
        <CardTitle>
          {COMMITMENT.initialMonths}-month start, then month-to-month
        </CardTitle>
        <Small className="mt-3">{COMMITMENT.summary}</Small>
        <Small className="mt-3">{COMMITMENT.rationale}</Small>
      </Card>

      <Card>
        <CardLabel>One-off packages</CardLabel>
        <CardTitle>Prefer a single batch?</CardTitle>
        <dl className="mt-3 space-y-2 text-[13px]">
          <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
            <dt className="text-ink-muted">{SPRINT.name}</dt>
            <dd className="font-display font-bold text-ink tabular-nums text-right">
              {formatMoney(SPRINT.oneOff)} <span className="text-ink-subtle font-medium whitespace-nowrap">one-off</span>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">{SPRINT_PLUS.name}</dt>
            <dd className="font-display font-bold text-ink tabular-nums text-right">
              {formatMoney(SPRINT_PLUS.oneOff)} <span className="text-ink-subtle font-medium whitespace-nowrap">one-off</span>
            </dd>
          </div>
        </dl>
        <Small className="mt-3">One-off prices are in US dollars; monthly prices are in euros. {SINGLE_VIDEOS.statement}</Small>
      </Card>

      <Card>
        <CardLabel>Taxes</CardLabel>
        <CardTitle>Prices exclude VAT</CardTitle>
        <Small className="mt-3">{TAX.statement}</Small>
      </Card>
    </div>
  )
}
