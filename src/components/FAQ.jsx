import { useRef, useEffect, useState, useCallback } from 'react'

/* ─────────────────────────────────────────────
   SECTION — FAQ
   Place after Testimonials in App.jsx
───────────────────────────────────────────── */

const FAQS = [
  {
    q: 'What does the process of working with you look like?',
    a: 'Every project starts with understanding the brand, audience, and goals first. From there, we handle concepts, hooks, scripting, filming, editing, and revisions. Once we identify what works, we double down and iterate based on performance.',
  },
  {
    q: 'Can you create content in multiple languages?',
    a: 'Yes. We create content in English, Spanish, French, and Arabic, including Gulf and Moroccan dialects. We can also source creators for additional languages depending on the project.',
  },
  {
    q: 'Do you focus on paid ads or organic content?',
    a: 'Both. Some brands come to us for high-performing paid social creatives, while others need organic content that builds trust and attention over time. In many cases, the best strategy combines both.',
  },
  {
    q: 'What types of brands do you work best with?',
    a: 'We work especially well with ecommerce brands, apps, SaaS companies, AI tools, premium consumer products, and brands that understand the importance of modern attention and creative testing.',
  },
  {
    q: 'Do you help with concepts and scripting?',
    a: "Absolutely, and we strongly recommend it. Creative direction, hooks, and scripting are a huge part of performance. After producing hundreds of creatives, we've developed a strong understanding of what captures attention and what people instantly scroll past.",
  },
  {
    q: 'How fast is delivery?',
    a: 'It depends on the scope and production style of the project. However, once concepts are approved, production time for up to 5 videos is usually around 10 days.',
  },
  {
    q: 'Do you offer monthly retainers?',
    a: "Yes, that's actually our specialty. We've noticed significantly better results with brands that work with us long-term because it gives us enough testing, data, and iteration time to figure out what truly works for the brand.",
  },
  {
    q: 'What makes CONVRT different?',
    a: "We're not just another marketing agency trying to pump out content. CONVRT is led by a prolific creator who has personally produced hundreds of videos and deeply understands modern attention, retention, hooks, and paid social creative. Everything that comes out of CONVRT is either worked on or personally approved by the founder to ensure quality stays consistently high.",
  },
  {
    q: "What's the difference between influencers and UGC creators?",
    a: [
      'Influencers get paid for access to their audience. UGC creators get paid for the content itself.',
      'Influencers sell through credibility and reach. UGC creators sell through performance and psychology.',
      "A brand doesn't always need more views, it needs content that actually converts.",
      "That's why UGC creators don't need massive followings. They need to understand hooks, buyer psychology, retention, and what makes people click, trust, and buy.",
      "The best UGC creators aren't trying to go viral. They're trying to make the brand money.",
    ],
  },
]

/* ── Single accordion item ── */
function FAQItem({ item, isOpen, onToggle }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!bodyRef.current) return
    setHeight(isOpen ? bodyRef.current.scrollHeight : 0)
  }, [isOpen])

  const answer = Array.isArray(item.a) ? item.a : [item.a]

  return (
    <div
      className="group relative"
      style={{
        borderLeft: isOpen ? '2px solid #d5ff40' : '2px solid transparent',
        transition: 'border-color 0.35s ease',
        boxShadow: isOpen ? '-2px 0 18px -4px rgba(213,255,64,0.35)' : 'none',
      }}
    >
      {/* Question row */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-5 py-7 pl-6 pr-2 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        {/* Question text */}
        <span
          className="flex-1 font-semibold leading-snug"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.175rem)',
            color: isOpen ? '#fafafa' : 'rgba(250,250,250,0.75)',
            transition: 'color 0.3s ease',
          }}
        >
          {item.q}
        </span>

        {/* Plus / minus icon */}
        <span
          className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center"
          style={{
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M8 2v12M2 8h12"
              stroke={isOpen ? '#d5ff40' : 'rgba(255,255,255,0.35)'}
              strokeWidth="1.75"
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s ease' }}
            />
          </svg>
        </span>
      </button>

      {/* Collapsible answer body */}
      <div
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          transition: 'height 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          ref={bodyRef}
          className="pl-6 pr-8 pb-7"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s',
          }}
        >
          {/* Subtle lime line above answer */}
          <div
            className="mb-5"
            style={{
              height: '1px',
              background: 'linear-gradient(to right, rgba(213,255,64,0.25) 0%, transparent 60%)',
            }}
          />

          <div className="flex flex-col gap-3.5">
            {answer.map((para, i) => (
              <p key={i} className="text-[15px] leading-[1.8] text-ink-muted">
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom separator */}
      <div
        className="ml-6"
        style={{
          height: '1px',
          background: isOpen
            ? 'linear-gradient(to right, rgba(213,255,64,0.12) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)'
            : 'rgba(255,255,255,0.06)',
          transition: 'background 0.35s ease',
        }}
      />
    </div>
  )
}

/* ── Staggered fade-up ── */
function FadeUp({ children, inView, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms,
                     transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function FAQ() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.08 },
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const toggle = useCallback((i) => {
    setOpenIndex(prev => (prev === i ? null : i))
  }, [])

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative overflow-hidden py-16 md:py-24"
    >
      {/* ── Ambient lime radial glows ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.055) 0%, transparent 65%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.035) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-1/4 h-[400px] w-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.03) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-3xl px-5 md:px-8">

        {/* ── Section header — centered ── */}
        <div className="mb-10 md:mb-14 text-center">
          <FadeUp inView={inView} delay={0}>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="h-px w-8 bg-lime" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                FAQ
              </span>
              <span className="h-px w-8 bg-lime" />
            </div>
          </FadeUp>

          <FadeUp inView={inView} delay={80}>
            <h2
              className="font-display font-bold text-ink tracking-display leading-[1.05] mb-5 whitespace-nowrap"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}
            >
              Things brands{' '}
              <span className="text-lime">usually ask.</span>
            </h2>
          </FadeUp>

          <FadeUp inView={inView} delay={160}>
            <p className="text-ink-muted text-base leading-relaxed">
              We believe good creative partnerships start with clarity.
            </p>
          </FadeUp>
        </div>

        {/* ── Accordion list ── */}
        <FadeUp inView={inView} delay={260}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div>
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </FadeUp>

        {/* ── Bottom CTA nudge ── */}
        <FadeUp inView={inView} delay={400}>
          <div
            className="mt-16 rounded-2xl px-8 py-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
            style={{
              background: 'rgba(213,255,64,0.05)',
              border: '1px solid rgba(213,255,64,0.15)',
            }}
          >
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ink leading-snug mb-1">
                Still have questions?
              </p>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                Reach us directly, we're happy to answer anything before you commit to anything.
              </p>
            </div>
            <a
              href="mailto:hello@convrt.studio"
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas cta-gradient whitespace-nowrap"
            >
              Get in touch
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </FadeUp>

      </div>
    </section>
  )
}
