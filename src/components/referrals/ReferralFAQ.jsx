import { useId, useState } from 'react'
import { Reveal, SectionHeader } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   FAQ — accessible accordion (button + aria-expanded + aria-controls, answer is a
   labelled region that is removed from the tab order while closed). Height animates
   with the grid-rows technique, so there is no measuring and no JS animation; reduced
   motion turns the transition off.

   Answers restate the program terms only. They deliberately give NO payout timeline,
   minimum project size or attribution window: those are agreed with each partner.
   The same array feeds the FAQPage structured data in ReferralsPage.jsx.
───────────────────────────────────────────── */

export const FAQS = [
  {
    q: 'Who can join the referral program?',
    a: 'Existing clients, founders, creators, consultants, agencies, and relevant professionals can apply. Participation is subject to approval and eligibility.',
  },
  {
    q: 'How much do I earn?',
    a: 'Standard partners earn $150 for an eligible successful referral, as cash or as production credit. Approved agencies earn 10% of the first qualifying project payment, up to a maximum of $500 per referred client.',
  },
  {
    q: 'What does the referred brand receive?',
    a: 'Two additional ready-to-test video ad variations on its first qualifying paid video project. They are edit-based variations of the approved project assets, in addition to the package’s standard deliverables, and can’t be exchanged for cash.',
  },
  {
    q: 'When do I get paid?',
    a: 'After the referred client completes its first qualifying payment, the payment clears and remains non-refundable, and CONVRT confirms eligibility. Payment method and payout timing are agreed with the partner.',
  },
  {
    q: 'Can I refer multiple brands?',
    a: 'Yes. Each eligible new client can generate a separate reward.',
  },
  {
    q: 'Does the brand need to purchase a service?',
    a: 'Yes. Registration, introductions, and free consultations alone do not trigger rewards.',
  },
  {
    q: 'Can I become a strategic partner?',
    a: 'Yes. Agencies and consultants may apply for the strategic partnership program. It requires approval by CONVRT before participation.',
  },
  {
    q: 'What if the company already contacted CONVRT?',
    a: 'Previously active prospects may be excluded. CONVRT must confirm referral attribution.',
  },
  {
    q: 'Do I need to sell CONVRT’s services?',
    a: 'No. Make the introduction and CONVRT handles the conversation.',
  },
  {
    q: 'Can I track my referrals?',
    a: 'Partners can request a status update from CONVRT. A self-service dashboard is not available at launch.',
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
