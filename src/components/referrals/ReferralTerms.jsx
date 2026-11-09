import { useEffect, useId, useState } from 'react'
import { Reveal } from '../roadmap/shared.jsx'
import { TERMS_OPEN_EVENT } from './shared.jsx'

/* ─────────────────────────────────────────────
   PROGRAM TERMS — a compact summary, with the FULL terms one click away in an accordion
   (the simplest pattern already used by the FAQ). Every other "full terms" link on the page
   calls openTerms() (shared.jsx), which opens this accordion and scrolls to it.

   The list below is the complete set of conditions: nothing was dropped when the visible
   section was shortened. It is a plain-language summary, NOT a legal agreement, and invents
   no attribution window, payout deadline or minimum project size (those are agreed with each
   partner). ⚠ Needs legal review and owner sign-off on the open points listed in
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
  'The 10% commission is capped at $500 per referred client and excludes taxes, refunds, and third-party pass-through costs.',
  'Refunded or cancelled projects may not qualify for a reward.',
  'Production credit applies to eligible CONVRT services only. Its conditions are confirmed with the partner.',
  'The FREE Creative Upgrade applies to the first qualifying paid video project: two additional edit-based variations made from approved project assets, not exchangeable for cash. It is separate from the Free Creative Growth Roadmap, Free Video Production Trial and 10 Free Ad Hooks, and doesn’t automatically combine with the free production trial. Eligibility and specifications are confirmed before purchase.',
  'Partners should disclose their financial incentive when making a referral, where required.',
  'CONVRT may change or end the program going forward. Rewards already earned under confirmed terms are not removed retroactively.',
]

export default function ReferralTerms() {
  const [open, setOpen] = useState(false)
  const uid = useId()
  const buttonId = `${uid}-btn`
  const panelId = `${uid}-panel`

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(TERMS_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(TERMS_OPEN_EVENT, onOpen)
  }, [])

  return (
    <section
      id="terms"
      tabIndex={-1}
      aria-labelledby="terms-heading"
      className="relative scroll-mt-20 py-10 outline-none md:scroll-mt-24 md:py-14"
    >
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <Reveal>
          <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Program terms</p>
                <h2 id="terms-heading" className="mt-2 font-display text-2xl font-bold leading-tight tracking-display text-ink sm:text-3xl">
                  Simple, Transparent Rewards.
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                  Rewards apply to eligible new clients once their first qualifying payment clears. All referrals are
                  reviewed and confirmed by CONVRT.
                </p>
              </div>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((v) => !v)}
                className="group inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                {open ? 'Hide Full Program Terms' : 'Read Full Program Terms'}
                <svg
                  viewBox="0 0 16 16"
                  className={`h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M3.5 6l4.5 4.5L12.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={open}
              className={`ref-faq-panel grid ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div className="mt-6 border-t border-hairline pt-6">
                  <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
                    {TERMS.map((term) => (
                      <li key={term} className="flex gap-3 text-sm leading-snug text-ink-muted">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
                        <span>{term}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm leading-relaxed text-ink-muted">
                    A plain-language summary, not a legal agreement. Final conditions are confirmed with each partner
                    before they start referring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
