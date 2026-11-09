import { useState } from 'react'
import { Reveal, SectionHeader } from './shared.jsx'

/* Accessible accordion: each question is a <button aria-expanded aria-controls>
   inside a heading; each answer is a labelled region. Collapsed answers are
   visibility:hidden so they leave the tab order and accessibility tree. */

const FAQS = [
  {
    q: 'Is the Creative Growth Roadmap really free?',
    a: 'Yes. For qualifying brands, we develop five tailored advertising concepts and present them during a complimentary creative strategy session. There’s no obligation to hire CONVRT.',
  },
  {
    q: 'What exactly do I get?',
    a: 'Five ad concepts tailored to your brand, each with a suggested creative angle, opening hooks, and a recommended direction, walked through live in a strategy session with CONVRT. Concepts are ideas worth testing, not a guarantee of how any ad will perform.',
  },
  {
    q: 'How long is the strategy session?',
    a: 'It is a 20-minute strategy call, booked through Calendly.',
  },
  {
    q: 'Will you produce the five ads for free?',
    a: 'No. The roadmap covers creative concepts, suggested angles, hooks, and recommended directions. Video production is a separate service.',
  },
  {
    q: 'Who qualifies?',
    a: 'The Roadmap is built for SaaS and e-commerce brands that are preparing to produce and test new video ads. Answer five quick questions and you’ll see straight away whether you can book your session. If the timing isn’t right yet, we’ll point you to something more useful, like our free library of 10 ad hooks.',
  },
  {
    q: 'Do I need to share access to my advertising accounts?',
    a: 'No. Account access is not required to apply. We start with your website and the information you choose to provide.',
  },
  {
    q: 'What happens after I apply?',
    a: 'If your brand fits what we look for, you can pick a time for your strategy session straight away and Calendly confirms your booking. Your concepts are prepared for confirmed bookings and presented in the session.',
  },
]

/* Reusable: the Free Video page passes its own questions (same accessible accordion). */
export default function RoadmapFAQ({ faqs = FAQS, idPrefix = 'roadmap-faq' }) {
  const [open, setOpen] = useState(() => new Set())
  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <section aria-labelledby="faq-heading" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="faq-heading" eyebrow="FAQ" title="Questions, answered." />
        </Reveal>

        <Reveal className="mt-10 md:mt-12">
          <div className="border-t border-hairline">
            {faqs.map((item, i) => {
              const isOpen = open.has(i)
              const btnId = `${idPrefix}-q-${i}`
              const panelId = `${idPrefix}-a-${i}`
              return (
                <div key={item.q} className="border-b border-hairline">
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                      className="flex min-h-[56px] w-full items-center justify-between gap-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                    >
                      <span className={`text-base font-semibold leading-snug transition-colors motion-reduce:transition-none md:text-lg ${isOpen ? 'text-ink' : 'text-ink/80'}`}>
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-45' : ''}`}
                      >
                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                          <path d="M8 2v12M2 8h12" stroke={isOpen ? '#d5ff40' : 'rgba(255,255,255,0.45)'} strokeWidth="1.75" strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 pr-8 text-[15px] leading-[1.75] text-ink-muted">{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
