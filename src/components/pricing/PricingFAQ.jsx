import { useState, useCallback } from 'react'
import { PRICING_FAQ } from '../../seo/pricingFaq.js'
import { SectionHeader } from './shared.jsx'

/* Pricing FAQ accordion. Same look as the homepage FAQ (lime rail on the open item, +/- icon), but every answer is
   ALWAYS in the DOM, so the prerendered HTML contains all questions and answers even though they start collapsed.
   Collapsing uses a grid-rows transition + `visibility`, so closed answers are also hidden from assistive tech and
   keyboard focus. The same PRICING_FAQ array is emitted as FAQPage JSON-LD (src/seo/structuredData.js). */
function Item({ item, open, onToggle }) {
  const btnId = `faq-q-${item.id}`
  const panelId = `faq-a-${item.id}`
  return (
    <div
      className="relative"
      style={{ borderLeft: open ? '2px solid #d5ff40' : '2px solid transparent', transition: 'border-color 0.35s ease' }}
    >
      <h3>
        <button
          id={btnId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-start gap-5 py-5 md:py-6 pl-5 md:pl-6 pr-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 rounded-sm"
        >
          <span
            className="flex-1 font-semibold leading-snug transition-colors"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)', color: open ? '#fafafa' : 'rgba(250,250,250,0.78)' }}
          >
            {item.q}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 mt-1 h-5 w-5 flex items-center justify-center motion-reduce:transition-none"
            style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M8 2v12M2 8h12" stroke={open ? '#d5ff40' : 'rgba(255,255,255,0.4)'} strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className="grid motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          visibility: open ? 'visible' : 'hidden',
          transition: `grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear ${open ? '0s' : '0.4s'}`,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pl-5 md:pl-6 pr-6 pb-6 flex flex-col gap-3">
            {item.a.map((para, i) => (
              <p key={i} className="text-[15px] leading-[1.75] text-ink-muted">{para}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-5 md:ml-6 h-px bg-white/[0.06]" />
    </div>
  )
}

export default function PricingFAQ() {
  const [openId, setOpenId] = useState(null)
  const toggle = useCallback((id) => setOpenId((prev) => (prev === id ? null : id)), [])

  return (
    <section id="pricing-faq" aria-labelledby="pricing-faq-heading" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeader
          id="pricing-faq-heading"
          eyebrow="FAQ"
          title={<>Pricing questions, <span className="text-lime">answered.</span></>}
          intro="Everything that affects what you pay, what you receive and how you can use it."
        />
        <div className="h-px bg-white/[0.06]" />
        <div>
          {PRICING_FAQ.map((item) => (
            <Item key={item.id} item={item} open={openId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      </div>
    </section>
  )
}
