import { useEffect, useRef, useState } from 'react'
import { forward } from '../../lib/rtl.js'
import { trackEvent } from '../../lib/analytics.js'
import { hrefFor } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { stat } from './format.js'
import { statNode } from '../graspo/GraspoMetrics.jsx'

/* The closing section of a case study: ONE shared layout, two visual themes (owner brief, 2026-11-26).
     lime → the CONVRT brand (Graspo)          gold → the Elyon Dubai luxury palette (champagne gold on near-black)
   Structure, top to bottom: eyebrow · headline (one accent phrase) · the commercial achievement · a compact figure summary (the figures the page already verifies, nothing new) · the strategy that
   produced it · one conversion area with the service link and the pricing link. All text is real page text in every language; the content lives in src/i18n/caseStudyConclusions.js (per locale),
   the figures come from src/caseStudies/data.js through the caller. Right-to-left needs no special code: the build mirrors left/right utilities and everything else uses logical properties.
   Entrance: a short rise-and-fade as the card scrolls into view; never under prefers-reduced-motion, and the prerendered HTML is fully visible (the hidden state is only set on the client, below the fold). */

export const THEMES = {
  lime: { accent: '#d5ff40', light: '#d5ff40', rgb: '213,255,64', button: '#d5ff40' },
  gold: { accent: '#c9a668', light: '#e8d9b5', rgb: '201,166,104', button: 'linear-gradient(110deg, #e8d9b5 0%, #c9a668 60%, #e8d9b5 100%)' },
}

/* Rise-and-fade on scroll, armed only on the client and only when the card starts below the fold. 'static' = rendered as authored (server render, reduced motion, no IntersectionObserver). */
function useReveal() {
  const ref = useRef(null)
  const [state, setState] = useState('static')
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return undefined
    setState('hidden')
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setState('shown'); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, state]
}

function Reveal({ state, delay = 0, className = '', children }) {
  const style = state === 'hidden'
    ? { opacity: 0, transform: 'translateY(18px)' }
    : state === 'shown'
      ? { opacity: 1, transform: 'none', transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }
      : undefined
  return <div className={className} style={style}>{children}</div>
}

const fig = (locale, f) => (locale === 'ar' ? (f.raw ? <bdi dir="ltr">{f.value}</bdi> : statNode(locale, f.value)) : stat(f.value))
/* `lead` / `strategy` are one sentence (a string) or a list of paragraphs (Arabic Elyon): a string renders exactly as before. */
const paragraphs = (text, className) => (Array.isArray(text) ? text.map((t, i) => <p key={i} className={`${className}${i ? ' mt-4' : ''}`}>{t}</p>) : <p className={className}>{text}</p>)

/* props
   id        heading id (aria-labelledby)
   theme     'lime' | 'gold'
   copy      the locale's block from src/i18n/caseStudyConclusions.js
   figures   [{ value, label, hero? }]  (values are English-notation strings, localized here)
   links     { service: { href, label }, pricing: { href, label } }  (base paths; localized with hrefFor)
   caseStudy id used for the unchanged analytics event */
export default function CaseStudyConclusion({ id, theme = 'lime', copy, figures, links, caseStudy }) {
  const t = THEMES[theme]
  const locale = currentLocale()
  const [ref, state] = useReveal()
  const hero = figures.find((f) => f.hero)
  const rest = figures.filter((f) => !f.hero)
  const track = (target) => () => trackEvent('case_study_related_click', { case_study: caseStudy, target })
  const rgba = (a) => `rgba(${t.rgb},${a})`
  const arrow = <span aria-hidden="true">{forward()}</span>
  /* a long headline (French Graspo, English Graspo) is set a step smaller so it stays at three lines on desktop */
  const longHeadline = copy.headline.reduce((n, seg) => n + seg.text.length, 0) > 72

  return (
    <section aria-labelledby={id} className="relative overflow-hidden pt-14 pb-10 md:pt-20 md:pb-14">
      {/* ambient light behind the card: soft, one source, no neon */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[820px] max-w-[140vw] -translate-x-1/2 rounded-full opacity-[0.10] blur-[120px]" style={{ background: t.accent }} />
      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-[32px] border px-5 py-10 sm:px-8 md:px-14 md:py-14"
          style={{ borderColor: rgba(0.24), background: `linear-gradient(165deg, ${rgba(0.11)} 0%, rgba(17,17,19,0.92) 36%, rgba(10,10,11,0.96) 100%)` }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.7)}, transparent)` }} />
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[28rem] max-w-full -translate-x-1/2 rounded-full opacity-25 blur-3xl" style={{ background: t.accent }} />

          <div className="relative text-center">
            <Reveal state={state}>
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur" style={{ borderColor: rgba(0.35), background: rgba(0.08) }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: t.accent }} />
                <span className={`text-xs font-medium uppercase tracking-[0.18em] ${theme === 'gold' ? '' : 'text-ink-muted'}`} style={theme === 'gold' ? { color: t.light } : undefined}>{copy.badge}</span>
              </div>
            </Reveal>

            <Reveal state={state} delay={80}>
              <h2 id={id} className={`mx-auto mt-6 max-w-3xl font-display font-bold leading-[1.1] tracking-display text-ink text-balance ${longHeadline ? 'text-[clamp(1.6rem,3.5vw,2.45rem)]' : 'text-[clamp(1.8rem,4.2vw,2.9rem)]'}`}>
                {copy.headline.map((seg, i) => (seg.accent
                  ? <span key={i} style={theme === 'gold' ? { color: t.light } : { color: t.accent }}>{seg.text}</span>
                  : <span key={i}>{seg.text}</span>))}
              </h2>
            </Reveal>

            <Reveal state={state} delay={160}>
              {paragraphs(copy.lead, 'mx-auto mt-6 max-w-2xl text-balance text-[15.5px] leading-[1.75] text-ink-muted md:text-[17px]')}
            </Reveal>
          </div>

          {/* compact figure summary: the figures already verified higher up the page, set large; no second KPI section */}
          <Reveal state={state} delay={240} className="relative mt-9 md:mt-11">
            {hero ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.5fr_1fr_1fr] md:gap-4">
                <div className="relative col-span-2 flex flex-col justify-center overflow-hidden rounded-2xl border px-6 py-6 text-center md:col-span-1 md:py-7" style={{ borderColor: rgba(0.4), background: `linear-gradient(150deg, ${rgba(0.16)}, ${rgba(0.04)})` }}>
                  <div aria-hidden="true" className="pointer-events-none absolute -top-10 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full opacity-30 blur-2xl" style={{ background: t.accent }} />
                  <p className="relative font-display font-bold leading-none tabular-nums tracking-display text-[clamp(2.6rem,6.5vw,3.8rem)]" style={{ backgroundImage: `linear-gradient(120deg, #f4ead2, ${t.accent})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{fig(locale, hero)}</p>
                  <p className="relative mt-3 text-[13px] font-semibold text-ink">{hero.label}</p>
                  {hero.sub && <p className="relative mt-1 text-[12px] leading-snug text-ink-subtle">{hero.sub}</p>}
                </div>
                {rest.map((f) => (
                  <div key={f.label} className="flex flex-col justify-center rounded-2xl border px-4 py-5 text-center md:py-7" style={{ borderColor: rgba(0.18), background: rgba(0.04) }}>
                    <p className="font-display font-bold leading-none tabular-nums text-ink text-[clamp(1.7rem,3.6vw,2.3rem)]">{fig(locale, f)}</p>
                    <p className="mt-3 text-[12.5px] font-semibold leading-snug text-ink">{f.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {figures.map((f, i) => (
                  <li key={f.label} className="relative flex list-none flex-col justify-center overflow-hidden rounded-2xl border px-4 py-5 text-center md:py-6" style={{ borderColor: i === 0 ? rgba(0.4) : rgba(0.16), background: i === 0 ? `linear-gradient(150deg, ${rgba(0.14)}, ${rgba(0.03)})` : rgba(0.035) }}>
                    <p className="font-display font-bold leading-none tabular-nums tracking-display text-[clamp(1.8rem,4vw,2.6rem)]" style={{ color: i === 0 ? t.accent : '#ffffff' }}>{fig(locale, f)}</p>
                    <p className="mt-3 text-[12.5px] font-semibold leading-snug text-ink">{f.label}</p>
                  </li>
                ))}
              </ul>
            )}
            {copy.note && <p className="mx-auto mt-4 max-w-2xl text-balance text-center text-[12px] leading-relaxed text-ink-subtle">{copy.note}</p>}
          </Reveal>

          {/* the strategy that produced it */}
          <Reveal state={state} delay={320} className="relative mx-auto mt-8 max-w-2xl md:mt-10">
            {Array.isArray(copy.strategy)
              ? <div className="border-s-2 ps-5 text-start text-[15px] leading-[1.75] text-ink text-pretty md:text-base" style={{ borderColor: rgba(0.55) }}>{copy.strategy.map((t, k) => <p key={k} className={k ? 'mt-4' : undefined}>{t}</p>)}</div>
              : <p className="border-s-2 ps-5 text-start text-[15px] leading-[1.75] text-ink text-pretty md:text-base" style={{ borderColor: rgba(0.55) }}>{copy.strategy}</p>}
          </Reveal>

          {/* one conversion area */}
          <Reveal state={state} delay={400} className="relative mt-10 text-center md:mt-12">
            <div aria-hidden="true" className="mx-auto mb-8 h-px w-full max-w-md" style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.35)}, transparent)` }} />
            <p className="mx-auto max-w-xl text-balance text-[15px] leading-relaxed text-ink-muted">{copy.ctaLead}</p>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 md:flex-row md:items-center">
              <a
                href={hrefFor(links.service.href)}
                onClick={track('service')}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas transition-transform duration-150 hover:brightness-105 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{ background: t.button, outlineColor: t.accent }}
              >
                {links.service.label} {arrow}
              </a>
              <a
                href={hrefFor(links.pricing.href)}
                onClick={track('pricing')}
                className="inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-medium text-ink transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{ borderColor: rgba(0.4), outlineColor: t.accent }}
              >
                {links.pricing.label} {arrow}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
