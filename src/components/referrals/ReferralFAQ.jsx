import { useId, useState } from 'react'
import { Reveal, SectionHeader } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   FAQ — accessible accordion (button + aria-expanded + aria-controls, answer is a
   labelled region that is removed from the tab order while closed). Height animates
   with the grid-rows technique, so there is no measuring and no JS animation; reduced
   motion turns the transition off.

   Answers restate the program terms only. They deliberately give NO payout timeline,
   minimum project size or attribution window: those are confirmed with each partner.
   The same array feeds the FAQPage structured data in ReferralsPage.jsx.
───────────────────────────────────────────── */

export const FAQS = [
  {
    q: 'Who can join the CONVRT Referral Partner Program?',
    a: 'Existing CONVRT clients, marketing agencies, growth consultants, UGC creators and video professionals, founders, and marketing professionals with relevant networks. Every application is reviewed by CONVRT, and agencies and strategic partners need approval before participating.',
  },
  {
    q: 'How much can I earn for a successful referral?',
    a: 'Standard referrals earn a one-time $150 reward per qualifying new client. Approved agency and strategic partners earn a one-time 10% of the first eligible project payment, excluding taxes, refunds, and third-party pass-through costs. Neither option is recurring, and the two can’t automatically be combined.',
  },
  {
    q: 'What counts as a successful referral?',
    a: 'A new brand you introduced that CONVRT confirms as eligible, that becomes a paying client, and whose first qualifying payment clears. CONVRT confirms attribution and eligibility. Self-referrals and fraudulent submissions are excluded, and existing opportunities may be too.',
  },
  {
    q: 'When will I receive my reward?',
    a: 'Only after the referred client’s first qualifying payment has cleared and remains non-refundable. The payment method and final payout conditions, including timing, are agreed with you before you start referring clients.',
  },
  {
    q: 'Can I refer multiple clients?',
    a: 'Yes. There’s no limit on the number of eligible referrals under the Standard Referral program. Each introduction is assessed on its own, so please send relevant, genuine introductions rather than lists.',
  },
  {
    q: 'Do I need to be a CONVRT client to participate?',
    a: 'No. Clients are welcome, but so are agencies, consultants, creators, founders, and other professionals whose networks include brands that need video ads.',
  },
  {
    q: 'Can marketing agencies become referral partners?',
    a: 'Yes. Agencies can apply to the Agency / Strategic Partner program. It requires approval by CONVRT before participation, and the final conditions are confirmed with you before you start referring.',
  },
  {
    q: 'What happens if the company has already contacted CONVRT?',
    a: 'Let us know in your submission. Existing opportunities or previously active sales conversations may be excluded, and CONVRT confirms attribution and eligibility on a case-by-case basis.',
  },
  {
    q: 'How do I know whether my referral was accepted?',
    a: 'Our team reviews every submission and replies by email. Joining or submitting a referral doesn’t guarantee acceptance or a reward, and nothing is approved automatically.',
  },
]

function FAQItem({ item, open, onToggle }) {
  const uid = useId()
  const buttonId = `${uid}-q`
  const panelId = `${uid}-a`
  return (
    <div className={`border-b border-hairline transition-colors motion-reduce:transition-none ${open ? 'border-lime/30' : ''}`}>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full items-start justify-between gap-5 py-5 text-left transition-colors hover:text-ink focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime sm:py-6"
        >
          <span className={`text-base font-semibold leading-snug sm:text-lg ${open ? 'text-ink' : 'text-ink/80 group-hover:text-ink'}`}>{item.q}</span>
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,color] duration-300 motion-reduce:transition-none ${
              open ? 'rotate-45 border-lime/60 text-lime' : 'border-hairline-strong text-ink-muted group-hover:border-ink-subtle'
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        data-open={open}
        className={`ref-faq-panel grid ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="pb-6 pr-10 text-[15px] leading-[1.75] text-ink-muted">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function ReferralFAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative scroll-mt-20 pb-20 md:scroll-mt-24 md:pb-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="faq-heading" eyebrow="FAQ" title="Referral program questions." />
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-10 border-t border-hairline">
            {FAQS.map((item, i) => (
              <FAQItem key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
