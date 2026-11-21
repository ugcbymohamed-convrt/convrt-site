import { useState, useCallback } from 'react'
import { PRICING_FAQ, FAQ_CATEGORIES } from '../../seo/pricingFaq.js'
import { SectionHeader } from './shared.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeFaq } from '../../i18n/content.js'

/* Categorized pricing FAQ. EVERY question and answer is always in the DOM (and therefore in the prerendered HTML);
   the category selector only decides which group is visible (the others carry `hidden`). Accordion answers also stay
   in the DOM when collapsed (grid-rows + `visibility`, so closed answers are out of the tab order and the a11y tree).
   Category selector = WAI-ARIA tabs (roving tabindex, arrow keys). The same PRICING_FAQ array, including every category,
   is emitted as FAQPage JSON-LD (src/seo/structuredData.js). */
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
          className="flex w-full items-start gap-5 rounded-sm py-4 md:py-5 pl-5 md:pl-6 pr-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60"
        >
          <span
            className="flex-1 font-semibold leading-snug transition-colors"
            style={{ fontSize: 'clamp(0.97rem, 1.9vw, 1.075rem)', color: open ? '#fafafa' : 'rgba(250,250,250,0.78)' }}
          >
            {item.q}
          </span>
          <span
            aria-hidden="true"
            className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center motion-reduce:transition-none"
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
          <div className="flex flex-col gap-3 pb-5 pl-5 pr-6 md:pl-6">
            {item.a.map((para, i) => (
              <p key={i} className="text-[15px] leading-[1.7] text-ink-muted">{para}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="ml-5 h-px bg-white/[0.06] md:ml-6" />
    </div>
  )
}

export default function PricingFAQ() {
  const FAQ = localizeFaq(PRICING_FAQ, currentLocale())
  const [category, setCategory] = useState(FAQ_CATEGORIES[0].id)
  const [openId, setOpenId] = useState(null)
  const toggle = useCallback((id) => setOpenId((prev) => (prev === id ? null : id)), [])

  const idx = FAQ_CATEGORIES.findIndex((c) => c.id === category)
  const onKeyDown = (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const n = FAQ_CATEGORIES.length
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (idx + (e.key === 'ArrowRight' ? 1 : -1) + n) % n
    setCategory(FAQ_CATEGORIES[next].id)
    setOpenId(null)
    document.getElementById(`faq-tab-${FAQ_CATEGORIES[next].id}`)?.focus()
  }

  return (
    <section id="pricing-faq" aria-labelledby="pricing-faq-heading" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeader
          id="pricing-faq-heading"
          eyebrow="FAQ"
          title={<>{tr('Pricing questions,')}{' '}<span className="text-lime">{tr('answered.')}</span></>}
        />

        <div className="mb-6 flex justify-center">
          <div
            role="tablist"
            aria-label={tr('FAQ categories')}
            onKeyDown={onKeyDown}
            className="flex max-w-full flex-wrap justify-center gap-1.5 rounded-3xl border border-hairline bg-surface-1/60 p-1.5 backdrop-blur-md"
          >
            {FAQ_CATEGORIES.map((c) => {
              const active = c.id === category
              return (
                <button
                  key={c.id}
                  id={`faq-tab-${c.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`faq-panel-${c.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => { setCategory(c.id); setOpenId(null) }}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 sm:text-sm ${
                    active ? 'bg-lime text-canvas shadow-[0_0_20px_rgba(213,255,64,0.3)]' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {tr(c.label)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />
        {FAQ_CATEGORIES.map((c) => (
          <div key={c.id} id={`faq-panel-${c.id}`} role="tabpanel" aria-labelledby={`faq-tab-${c.id}`} hidden={c.id !== category}>
            {FAQ.filter((f) => f.category === c.id).map((item) => (
              <Item key={item.id} item={item} open={openId === item.id} onToggle={() => toggle(item.id)} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
