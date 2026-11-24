import { stepOfArrow } from '../../lib/rtl.js'
import { useEffect, useRef } from 'react'
import { GOALS } from '../../seo/businessKnowledge.js'
import { PaidCards, OrganicCards, BillingSwitch } from './PricingCards.jsx'
import { PaidTerms, OrganicTerms } from './PartnershipTerms.jsx'
import { useState } from 'react'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'

/* SECTION 1: one unified opening. A single headline + subtitle, a goal-based selector, and the three pricing cards for
   the chosen goal. Both card groups are always in the DOM (prerendered HTML has every package and price); the selector
   only decides which one is shown. The inactive group is parked beside the stage, invisible and `inert` (no duplicate
   focus targets, hidden from assistive tech). Switching slides the groups horizontally (CSS, ~420ms, instant for
   reduced-motion visitors) and eases the stage height so nothing below jumps. */
const ICONS = {
  paid: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  organic: <><path d="M4 18l5.5-5.5 3.5 3L20 8" /><path d="M15 8h5v5" /></>,
}

function GoalSelector({ value, onChange }) {
  const idx = GOALS.findIndex((g) => g.id === value)
  const onKeyDown = (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    e.preventDefault()
    const dir = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : stepOfArrow(e.key)
    const next = GOALS[(idx + dir + GOALS.length) % GOALS.length]
    onChange(next.id)
    document.getElementById(`service-tab-${next.id}`)?.focus()
  }
  return (
    <div className={`mx-auto mt-6 md:mt-7 ${currentLocale() !== 'es' ? 'max-w-2xl' : 'max-w-3xl'}`}>
      <p className="mb-3 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-lime sm:text-[15px]">{tr('What are you looking to achieve?')}</p>
      <div role="tablist" aria-label={tr('What are you looking to achieve?')} onKeyDown={onKeyDown} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {GOALS.map((g) => {
          const active = g.id === value
          return (
            <button
              key={g.id}
              id={`service-tab-${g.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`service-panel-${g.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(g.id)}
              className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/70 ${
                active
                  ? 'border-lime bg-lime text-canvas shadow-[0_10px_34px_-12px_rgba(213,255,64,0.55)]'
                  : 'border-hairline bg-surface-1/70 text-ink hover:border-hairline-strong'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-canvas text-lime' : 'bg-surface-2 text-lime'}`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONS[g.id]}
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-bold leading-tight tracking-snug">{tr(g.label)}</span>
                <span className={`mt-0.5 block text-[12.5px] leading-snug ${active ? 'text-canvas/70' : 'text-ink-muted'}`}>{tr(g.description)}</span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-canvas bg-canvas text-lime' : 'border-hairline-strong text-transparent'}`}
              >
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SlidePanel({ id, pos, active, children }) {
  return (
    <div
      id={`service-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`service-tab-${id}`}
      data-state={active ? 'active' : 'inactive'}
      data-pos={pos}
      aria-hidden={active ? undefined : 'true'}
      inert={active ? undefined : ''}
      className="pricing-slide"
    >
      {children}
    </div>
  )
}

export default function PricingStage({ service, onServiceChange }) {
  const [billing, setBilling] = useState('monthly')
  const stageRef = useRef(null)
  const first = useRef(true)

  // Fix the stage's current height BEFORE the switch, so the swap can ease to the new group's height without a jump.
  const select = (next) => {
    if (next === service) return
    const el = stageRef.current
    if (el) el.style.height = `${el.offsetHeight}px`
    onServiceChange(next)
  }

  useEffect(() => {
    if (first.current) { first.current = false; return undefined }
    const el = stageRef.current
    if (!el) return undefined
    const active = el.querySelector('[data-state="active"]')
    if (active) el.style.height = `${active.offsetHeight}px`
    const t = setTimeout(() => { el.style.height = '' }, 480)
    return () => clearTimeout(t)
  }, [service])

  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[360px] w-[800px] -translate-x-1/2 rounded-full bg-lime/10 blur-[140px]"
      />
      <div id="packages" className="relative mx-auto max-w-6xl px-5 pb-10 pt-8 md:px-8 md:pb-14 md:pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            {tr('UGC & video production pricing')}
          </div>
          <h1
            className="mt-4 font-display font-semibold leading-[1.06] tracking-display-xl text-ink"
            style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.75rem)' }}
          >{tr('Your creative partner.')}{' '}<span className="text-lime">{tr('On your terms.')}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:text-base">{tr('From performance-driven video ads to consistent organic content, find the right creative partnership for your brand.')}</p>
        </div>

        <GoalSelector value={service} onChange={select} />

        <div ref={stageRef} className="pricing-stage mt-5 md:mt-6">
          <SlidePanel id="paid" pos="left" active={service === 'paid'}>
            <div className="mb-4 flex justify-center">
              <BillingSwitch value={billing} onChange={setBilling} />
            </div>
            <PaidCards billing={billing} />
            <PaidTerms billing={billing} />
          </SlidePanel>

          <SlidePanel id="organic" pos="right" active={service === 'organic'}>
            <OrganicCards />
            <OrganicTerms />
          </SlidePanel>
        </div>
      </div>
    </section>
  )
}
