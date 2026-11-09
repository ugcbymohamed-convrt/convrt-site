import { Reveal } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   PROGRAM TERMS & ELIGIBILITY — a plain-language summary, NOT a legal agreement.
   ⚠ Needs formal legal review before launch (see docs/referral-program-setup.md).
───────────────────────────────────────────── */

export const TERMS = [
  'Rewards apply only to eligible new clients.',
  'CONVRT must confirm referral attribution and eligibility.',
  'Existing opportunities or previously active sales conversations may be excluded.',
  'Self-referrals and fraudulent submissions are excluded.',
  'Rewards are payable only after the qualifying client payment clears and remains non-refundable.',
  'Taxes, refunds, and third-party pass-through costs are excluded from percentage-based rewards.',
  'Agency commissions require approval.',
  'The two reward structures cannot automatically be combined.',
  'Participation does not guarantee acceptance or payment.',
  'Payment method and final payout conditions must be agreed upon with the partner.',
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
                  A short summary of how the program works. The final conditions are communicated and confirmed with
                  you before you start referring clients.
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
