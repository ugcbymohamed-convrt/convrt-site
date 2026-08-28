import { useCallback, useEffect, useRef, useState } from 'react'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'

/* Reduced from 12 to the 8 objections a serious growth buyer actually
   needs resolved. Procurement-style questions ("who actually creates
   the content?") and anything already covered by ScaleFirstEngagement
   were cut rather than repeated in different words. */

const FAQS = [
  {
    q: 'How does CONVRT work with our existing media buyers or growth team?',
    a: 'We don’t replace them. CONVRT owns creative strategy and production, the concepts, hooks and executions that get tested, and hands them to your media buyers or in-house team to launch. We’re the creative engine feeding their testing pipeline, not a replacement for it.',
  },
  {
    q: 'How do you decide which creative ideas to test?',
    a: 'We start from your product, audience and what’s already been tried, then build distinct angles and hooks around different customer problems and promises, not variations on one idea. The goal is genuinely new hypotheses, not a creator reading a script.',
  },
  {
    q: 'What does the first engagement look like?',
    a: 'Most relationships start with a focused Creative Testing Sprint, a defined batch of concepts, scripts and production, rather than an open-ended retainer. It’s a way to evaluate the working relationship before deciding how far to scale it.',
  },
  {
    q: 'How is pricing structured?',
    a: 'It depends on creative volume, scope and production requirements, so we won’t quote a flat number here. Our general package structure is on the pricing page; the discovery call is where we figure out what actually fits.',
  },
  {
    q: 'Do you guarantee ROAS?',
    a: 'No, and we’d be cautious of anyone who does. Creative performance depends on your offer, product, landing page, audience and media buying, not the video alone. What we control is the quality and velocity of your creative testing.',
  },
  {
    q: 'What do you need from our team?',
    a: 'Mainly a media buyer or growth team who can actually launch and test what we produce, and someone who can share performance signals back to us. The faster that loop runs, the faster we can iterate toward what works.',
  },
  {
    q: 'How quickly can we get started?',
    a: 'It depends on scope, but once concepts are approved, production for a first batch usually takes around 10 business days. The discovery call is the fastest way to get a timeline specific to your project.',
  },
  {
    q: 'What happens on the discovery call?',
    a: 'We look at your business, current paid acquisition and where creative is, or isn’t, holding you back, then figure out honestly whether CONVRT can help. If there’s a fit, we’ll talk next steps.',
  },
]

function FAQItem({ item, isOpen, onToggle }) {
  const bodyRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (!bodyRef.current) return
    setHeight(isOpen ? bodyRef.current.scrollHeight : 0)
  }, [isOpen])

  return (
    <div
      className="group relative"
      style={{ borderLeft: isOpen ? '2px solid #d5ff40' : '2px solid transparent', transition: 'border-color 0.35s ease' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-5 py-6 pl-6 pr-2 text-left focus:outline-none"
        aria-expanded={isOpen}
      >
        <span
          className="flex-1 font-semibold leading-snug"
          style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', color: isOpen ? '#fafafa' : 'rgba(250,250,250,0.75)', transition: 'color 0.3s ease' }}
        >
          {item.q}
        </span>
        <span
          className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center"
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path d="M8 2v12M2 8h12" stroke={isOpen ? '#d5ff40' : 'rgba(255,255,255,0.35)'} strokeWidth="1.75" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease' }} />
          </svg>
        </span>
      </button>

      <div style={{ height: `${height}px`, overflow: 'hidden', transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        <div
          ref={bodyRef}
          className="pl-6 pr-8 pb-6"
          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-6px)', transition: 'opacity 0.3s ease 0.08s, transform 0.3s ease 0.08s' }}
        >
          <p className="text-[14.5px] leading-[1.75] text-ink-muted">{item.a}</p>
        </div>
      </div>

      <div className="ml-6" style={{ height: '1px', background: isOpen ? 'rgba(213,255,64,0.12)' : 'rgba(255,255,255,0.06)', transition: 'background 0.35s ease' }} />
    </div>
  )
}

export default function ScaleFAQ() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)
  const [openIndex, setOpenIndex] = useState(0)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true) }, { threshold: 0.08 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  const toggle = useCallback((i) => setOpenIndex((prev) => (prev === i ? null : i)), [])

  return (
    <section id="faq" ref={sectionRef} className="relative py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="mb-10 md:mb-14 text-center">
          <FadeUp inView={inView} delay={0}>
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="h-px w-8 bg-lime" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">FAQ</span>
              <span className="h-px w-8 bg-lime" />
            </div>
          </FadeUp>
          <FadeUp inView={inView} delay={80}>
            <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.15] text-3xl md:text-[42px]">
              Questions worth answering before we talk.
            </h2>
          </FadeUp>
        </div>

        <FadeUp inView={inView} delay={160}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <div>
            {FAQS.map((item, i) => (
              <FAQItem key={item.q} item={item} isOpen={openIndex === i} onToggle={() => toggle(i)} />
            ))}
          </div>
        </FadeUp>

        <FadeUp inView={inView} delay={260}>
          <div
            className="mt-12 rounded-2xl px-8 py-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8"
            style={{ background: 'rgba(213,255,64,0.05)', border: '1px solid rgba(213,255,64,0.15)' }}
          >
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-ink leading-snug mb-1">Still not sure?</p>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                The discovery call costs nothing and answers this faster than any FAQ can.
              </p>
            </div>
            <DiscoveryCallButton location="faq" className="shrink-0 whitespace-nowrap" />
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

function FadeUp({ children, inView, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
