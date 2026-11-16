import { PARTNERSHIP_TERMS, TURNAROUND, TAX } from '../../seo/businessKnowledge.js'

/* Compact terms directly under the pricing cards (replaces the three large explanation cards). The full policies live
   in the usage-rights, production-terms and FAQ sections. */
export default function PartnershipTerms() {
  return (
    <div className="mx-auto mt-7 md:mt-9 max-w-3xl space-y-2 text-center text-[13px] leading-relaxed text-ink-muted">
      <p>
        <span className="font-semibold text-ink">Monthly:</span> {PARTNERSHIP_TERMS.monthly}{' '}
        <span className="font-semibold text-ink">One-off:</span> {PARTNERSHIP_TERMS.oneOff}
      </p>
      <p>Turnaround begins {TURNAROUND.startsAt}. {TAX.statement}</p>
    </div>
  )
}
