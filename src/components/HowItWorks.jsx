import { useEffect, useRef, useState } from 'react'
import { useTr } from '../i18n/tr.js'
import { currentLocale } from '../i18n/locale.js'
import { primaryAction } from '../i18n/cta.js'

/* ─────────────────────────────────────────────
   HOW IT WORKS — Scroll-driven vertical timeline
   4 steps · each activates as it enters viewport
   Progress: dot glow → line fill → content reveal
───────────────────────────────────────────── */

const STEPS = [
  {
    number: '01',
    phase: 'Phase One',
    label: 'Discovery',
    title: 'Free Creative Growth Roadmap',
    description: 'We learn about your brand, audience and goals, then develop five personalized ad concepts for you.',
    detail: 'We walk through the ideas together, exploring creative angles and opportunities tailored to your business.',
    badge: '5 free ad concepts',
    accent: '#8b5cf6',
    accentSoft: 'rgba(139,92,246,0.16)',
    accentGlow: 'rgba(139,92,246,0.22)',
    accentBg: 'rgba(139,92,246,0.06)',
    textLight: '#c4b5fd',
  },
  {
    number: '02',
    phase: 'Phase Two',
    label: 'Your Decision',
    title: 'Like the Direction? Let’s Work Together.',
    description: 'Review your creative roadmap and decide whether you’d like CONVRT to bring those ideas to life.',
    detail: 'If we’re a good fit, we agree on the project scope, deliverables and next steps before production begins.',
    badge: 'No obligation',
    accent: '#d5ff40',
    accentSoft: 'rgba(213,255,64,0.14)',
    accentGlow: 'rgba(213,255,64,0.18)',
    accentBg: 'rgba(213,255,64,0.05)',
    textLight: '#e8ff7a',
  },
  {
    number: '03',
    phase: 'Phase Three',
    label: 'Production',
    title: 'From Concepts to Creatives',
    description: 'Once approved, we turn the creative direction into scripts, select the right talent, and handle filming and editing.',
    detail: 'Strategy, scripting, creator casting, production and post-production — all managed by CONVRT.',
    badge: 'End-to-end production',
    accent: '#ff6a4d',
    accentSoft: 'rgba(255,106,77,0.14)',
    accentGlow: 'rgba(255,106,77,0.20)',
    accentBg: 'rgba(255,106,77,0.06)',
    textLight: '#ffb59c',
  },
  {
    number: '04',
    phase: 'Phase Four',
    label: 'Delivery',
    title: 'Review, Refine & Launch',
    description: 'Review your videos, request revisions within the agreed scope, and receive approved creatives ready for your channels.',
    detail: 'Your finished videos are delivered in the agreed formats, ready for your team to publish or use in campaigns.',
    badge: 'Ready-to-use videos',
    accent: '#ec4899',
    accentSoft: 'rgba(236,72,153,0.14)',
    accentGlow: 'rgba(236,72,153,0.20)',
    accentBg: 'rgba(236,72,153,0.06)',
    textLight: '#f9a8d4',
  },
]

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */
export default function HowItWorks() {
  const tr = useTr()
  const locale = currentLocale()
  const action = primaryAction(locale)
  /* -1 = nothing activated yet, 0–3 = highest activated index */
  const [activeStep, setActiveStep] = useState(-1)
  const [headerVisible, setHeaderVisible] = useState(false)
  const stepRefs = useRef([])
  const headerRef = useRef(null)

  useEffect(() => {
    /* Header observer */
    const hObs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeaderVisible(true) },
      { threshold: 0.3 }
    )
    if (headerRef.current) hObs.observe(headerRef.current)

    /* Step observers — progress only forward */
    const sObs = STEPS.map((_, i) => {
      const el = stepRefs.current[i]
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(prev => Math.max(prev, i))
          }
        },
        { threshold: 0.28, rootMargin: '0px 0px -5% 0px' }
      )
      obs.observe(el)
      return obs
    })

    return () => {
      hObs.disconnect()
      sObs.forEach(o => o?.disconnect())
    }
  }, [])

  const currentAccent = activeStep >= 0 ? STEPS[activeStep].accent : '#8b5cf6'
  const progressPct = ((activeStep + 1) / STEPS.length) * 100

  return (
    <section id="how-it-works" className="relative overflow-hidden py-16 md:py-24">

      {/* ── Top section progress bar ── */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: activeStep >= 0 ? `${progressPct}%` : '0%',
            background: `linear-gradient(to right, #8b5cf6, #d5ff40, #ff6a4d, #ec4899)`,
            backgroundSize: '400% 100%',
            backgroundPosition: `${100 - progressPct}% 0`,
            transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)',
            opacity: activeStep >= 0 ? 1 : 0,
          }}
        />
      </div>

      {/* ── Per-step ambient backgrounds — cross-fade ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(900px circle at 20% 55%, ${step.accentBg}, transparent 65%)`,
              opacity: i === activeStep ? 1 : 0,
              transition: 'opacity 1.4s ease',
            }}
          />
        ))}
        {/* Constant right-side depth wash */}
        <div className="absolute inset-0 bg-gradient-to-l from-surface-1/30 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">

        {/* ── Header ── */}
        <div
          ref={headerRef}
          className="mb-20 md:mb-28 max-w-3xl mx-auto lg:mx-0 text-center lg:text-left"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'none' : 'translateY(24px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{tr('How It Works')}</span>
          </div>

          <h2 className="font-display font-bold text-ink tracking-display leading-[1.02] text-4xl md:text-5xl lg:text-[62px]">
            {tr('From free ideas')}
            <br />
            <span className="text-lime">{tr('to finished videos.')}</span>
          </h2>

          <p className="mt-6 text-base md:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
            {tr('Start with five creative ideas tailored to your brand. See the direction, decide if we’re a fit, and let us handle production from start to finish.')}
          </p>
        </div>

        {/* ── Timeline ── */}
        <div className="relative">
          {STEPS.map((step, i) => {
            const active = i <= activeStep
            const isLast = i === STEPS.length - 1
            const nextStep = !isLast ? STEPS[i + 1] : null

            return (
              <div
                key={step.number}
                ref={el => stepRefs.current[i] = el}
                className="flex gap-6 md:gap-10 lg:gap-16"
              >
                {/* ── Left: dot + connecting line ── */}
                <div className="flex flex-col items-center shrink-0 w-8 md:w-10">

                  {/* Glowing dot */}
                  <div
                    className="relative shrink-0"
                    style={{ marginTop: '6px' }}
                  >
                    {/* Outer pulse ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        transform: 'scale(2.2)',
                        background: step.accent,
                        opacity: active ? 0.18 : 0,
                        transition: 'opacity 0.8s ease',
                        filter: 'blur(6px)',
                      }}
                    />
                    {/* Dot */}
                    <div
                      key={active ? 'on' : 'off'}
                      className={active ? 'dot-activate' : ''}
                      style={{
                        height: '32px',
                        width: '32px',
                        borderRadius: '50%',
                        border: `2px solid ${active ? step.accent : '#34343a'}`,
                        background: active
                          ? `radial-gradient(circle at 40% 35%, ${step.textLight}, ${step.accent})`
                          : '#131316',
                        boxShadow: active
                          ? `0 0 0 4px ${step.accentSoft}, 0 0 20px ${step.accentGlow}`
                          : 'none',
                        transition: 'border-color 0.5s, background 0.5s, box-shadow 0.5s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active ? (
                        <svg viewBox="0 0 10 10" width="11" height="11" fill="none">
                          <path d="M2 5.5l2 2 4-4" stroke={step.accent === '#d5ff40' ? '#0a0a0b' : '#fff'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="text-[9px] font-bold text-ink-subtle">{i + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Connecting line to next step */}
                  {!isLast && (
                    <div className="relative flex-1 w-[2px] mt-3 mb-0">
                      {/* Track */}
                      <div className="absolute inset-0 rounded-full bg-hairline" />
                      {/* Animated fill */}
                      <div
                        className="absolute inset-x-0 top-0 rounded-full"
                        style={{
                          height: active ? '100%' : '0%',
                          background: `linear-gradient(to bottom, ${step.accent}, ${nextStep.accent})`,
                          transition: 'height 1.1s 0.35s cubic-bezier(0.22,1,0.36,1)',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* ── Right: step content ── */}
                <div
                  className={`flex-1 relative overflow-hidden ${isLast ? 'pb-4' : 'pb-20 md:pb-28'}`}
                >
                  {/* Giant background number — cinematic depth element */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute bottom-2 right-0 md:bottom-auto md:-top-6 font-display font-black leading-none text-[64px] md:[font-size:clamp(80px,16vw,180px)]"
                    style={{
                      color: step.accent,
                      opacity: active ? 0.09 : 0.025,
                      transition: 'opacity 1s ease',
                      lineHeight: 1,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {step.number}
                  </span>

                  {/* Phase label + accent line */}
                  <div
                    className="flex items-center gap-3 mb-5"
                    style={{
                      opacity: active ? 1 : 0.25,
                      transform: active ? 'none' : 'translateY(6px)',
                      transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    {/* Accent line */}
                    <div
                      className={active ? 'line-grow' : ''}
                      style={{
                        height: '1.5px',
                        width: active ? '72px' : '0px',
                        borderRadius: '9999px',
                        background: step.accent,
                        opacity: 0.8,
                        flexShrink: 0,
                        transition: active ? 'none' : 'width 0s',
                      }}
                    />
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.22em]"
                      style={{
                        color: active ? step.textLight : '#52525b',
                        transition: 'color 0.5s',
                      }}
                    >
                      {step.number}&thinsp;/&thinsp;04&ensp;·&ensp;{tr(step.label)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="font-display font-bold tracking-display leading-[1.04] relative z-10 md:pr-[calc(clamp(80px,16vw,180px)*1.2)]"
                    style={{
                      fontSize: 'clamp(1.75rem, 4vw, 2.85rem)',
                      color: active ? '#ffffff' : '#52525b',
                      opacity: active ? 1 : 0.35,
                      transform: active ? 'none' : 'translateX(-20px)',
                      transition: 'opacity 0.65s 0.05s ease, transform 0.65s 0.05s cubic-bezier(0.22,1,0.36,1), color 0.5s',
                    }}
                  >
                    {tr(step.title)}
                  </h3>

                  {/* Description */}
                  <p
                    className="mt-4 text-[15px] leading-relaxed relative z-10 md:!max-w-[min(52ch,calc(100%-clamp(80px,16vw,180px)*1.2))]"
                    style={{
                      color: active ? '#a1a1aa' : '#3f3f46',
                      maxWidth: '52ch',
                      opacity: active ? 1 : 0.4,
                      transform: active ? 'none' : 'translateY(10px)',
                      transition: 'opacity 0.65s 0.15s ease, transform 0.65s 0.15s cubic-bezier(0.22,1,0.36,1), color 0.5s',
                    }}
                  >
                    {tr(step.description)}
                  </p>

                  {/* Detail line */}
                  <p
                    className="mt-2.5 text-[13px] leading-relaxed relative z-10 md:!max-w-[min(50ch,calc(100%-clamp(80px,16vw,180px)*1.2))]"
                    style={{
                      color: active ? '#71717a' : 'transparent',
                      maxWidth: '50ch',
                      opacity: active ? 1 : 0,
                      transform: active ? 'none' : 'translateY(8px)',
                      transition: 'opacity 0.65s 0.25s ease, transform 0.65s 0.25s cubic-bezier(0.22,1,0.36,1), color 0.5s 0.2s',
                    }}
                  >
                    {tr(step.detail)}
                  </p>

                  {/* Time badge */}
                  {step.badge && (
                    <div
                      className="mt-6 inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 relative z-10"
                      style={{
                        background: active ? step.accentSoft : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? step.accent + '50' : '#26262b'}`,
                        opacity: active ? 1 : 0.35,
                        transform: active ? 'none' : 'translateY(8px)',
                        transition: 'all 0.65s 0.3s ease',
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: active ? step.accent : '#52525b', transition: 'background 0.4s' }}
                      />
                      <span
                        className="text-xs font-semibold tracking-wide"
                        style={{ color: active ? step.textLight : '#52525b', transition: 'color 0.4s' }}
                      >
                        {tr(step.badge)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div
          className="mt-16 md:mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-3xl border border-hairline bg-surface-1/40 backdrop-blur-md px-8 py-7"
          style={{
            opacity: activeStep >= STEPS.length - 1 ? 1 : 0,
            transform: activeStep >= STEPS.length - 1 ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.7s 0.2s ease, transform 0.7s 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div>
            <p className="font-display font-semibold text-ink text-xl leading-tight">
              {tr('Start with five free ad concepts.')}
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">
              {tr('For qualifying brands. We present five tailored ad concepts in a complimentary strategy session, with no obligation to hire CONVRT.')}
            </p>
          </div>
          <a
            href={action.href}
            {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="cta-gradient shrink-0 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
          >
            {locale === 'en' ? 'Get Your 5 Free Ad Concepts' : tr(action.label)}
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
              <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
