import { PARTNERSHIP_TERMS, ORGANIC_COMMITMENT, CUSTOM_TERMS, TURNAROUND, TAX } from '../../seo/businessKnowledge.js'

/* Compact terms directly under each card group. Paid: monthly + one-off wording. Organic: the six-month initial
   commitment (the Paid three-month terms do NOT apply) and a pointer to the agreement for later terms. */
export function PaidTerms() {
  return (
    <div className="mx-auto mt-6 max-w-3xl space-y-1.5 text-center text-[13px] leading-relaxed text-ink-muted">
      <p>
        <span className="font-semibold text-ink">Monthly:</span> {PARTNERSHIP_TERMS.monthly}{' '}
        <span className="font-semibold text-ink">One-off:</span> {PARTNERSHIP_TERMS.oneOff}
      </p>
      <p>Turnaround begins {TURNAROUND.startsAt}. {CUSTOM_TERMS} {TAX.statement}</p>
    </div>
  )
}

export function OrganicTerms() {
  return (
    <div className="mx-auto mt-6 max-w-3xl space-y-1.5 text-center text-[13px] leading-relaxed text-ink-muted">
      <p>
        <span className="font-semibold text-ink">Organic partnerships:</span> {ORGANIC_COMMITMENT.rationale}{' '}
        {ORGANIC_COMMITMENT.afterInitial}
      </p>
      <p>{CUSTOM_TERMS} {TAX.statement}</p>
    </div>
  )
}
