import { Reveal } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   PROGRAM TERMS & ELIGIBILITY — a plain-language summary, NOT a legal agreement.
   It invents no attribution window, payout deadline or minimum project size: those are left to
   each partner agreement. ⚠ Needs legal review and owner sign-off on the open points listed in
   docs/referral-program-setup.md before the page is made public.
───────────────────────────────────────────── */

export const TERMS = [
  'Rewards apply only to eligible new clients.',
  'Participation requires CONVRT’s approval. Agency & Strategic Partners always need explicit approval.',
  'CONVRT must confirm referral attribution and eligibility.',
  'Prospects who were already active with CONVRT may be excluded.',
  'No self-referrals.',
  'No fraudulent or misleading submissions.',
  'No unsolicited bulk outreach on CONVRT’s behalf.',
  'One reward structure per qualifying referral. The $150 reward and the 10% commission can’t be combined.',
  'Rewards are payable only after the referred client’s first qualifying payment clears and remains non-refundable. Payment method and timing are agreed with the partner.',
  'The 10% commission excludes taxes, refunds, and third-party pass-through costs.',
  'Refunded or cancelled projects may not qualify for a reward.',
  'Production credit applies to eligible CONVRT services only. Its conditions are confirmed with the partner.',
  'The FREE Creative Upgrade applies to the first qualifying paid video project: two additional edit-based variations made from approved project assets, not exchangeable for cash. Eligibility and specifications are confirmed before purchase.',
  'Partners should disclose their financial incentive when making a referral, where required.',
  'CONVRT may change or end the program going forward. Rewards already earned under confirmed terms are not removed retroactively.',
]

export default function ReferralTerms() {
  return (
    <section
      id="terms"
      tabIndex={-1}
      aria-labelledby="terms-heading"
      className="relative scroll-mt-20 pb-16 outline-none md:scroll-mt-24 md:pb-24"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Program terms</p>
                <h2 id="terms-heading" className="mt-3 font-display text-2xl font-bold leading-tight tracking-display text-ink sm:text-3xl">
                  Terms &amp; eligibility
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  A plain-language summary of how the program works, not a legal agreement. Final conditions are
                  confirmed with each partner before they start referring clients.
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2 lg:col-span-8">
                {TERMS.map((term) => (
                  <li key={term} className="flex gap-3 text-sm leading-snug text-ink-muted">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
