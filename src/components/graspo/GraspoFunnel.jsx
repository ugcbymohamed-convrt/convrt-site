import { useEffect, useRef, useState } from 'react'
import { useTr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { statNode } from './GraspoMetrics.jsx'
import { mix } from '../../i18n/ar/mix.jsx'
import { GRASPO_FUNNEL as STAGES } from '../../caseStudies/data.js'
import { stat, isEnglish, cx } from '../caseStudies/format.js'

/* ─────────────────────────────────────────────
   ATTENTION → DEMAND
   The central narrative of the page: verified,
   ordered stages from views down to advanced
   commercial opportunities. Widths are illustrative
   (log-scaled for legibility, not linear) — the
   numbers themselves are what carry the story.
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

export default function GraspoFunnel() {
  const tr = useTr()
  const locale = currentLocale()
  const ar = locale === 'ar'
  const en = isEnglish()
  const [ref, visible] = useInView()

  return (
    <section className="relative py-16 md:py-24">
      <div ref={ref} className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{tr('Attention → Demand')}</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.08] text-balance text-3xl md:text-[44px]">
            {/* A translation may mark its preferred desktop break with a newline (French: two balanced lines); below md the lines simply wrap and balance. */}
            {tr('The social funnel, start to finish.').split('\n').map((line, i) => (i === 0 ? mix(line) : <span key={i}>{' '}<br className="hidden md:block" />{mix(line)}</span>))}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-[15px] text-ink-muted leading-relaxed">
            {tr("This is the funnel observed during the management period, not a claim that every view produced an inquiry. It's what happened between a content strategy and a sales team's inbox.")}
          </p>
        </div>

        <div className="space-y-3">
          {STAGES.map((s, i) => (
            <div key={s.label} className="relative">
              <div
                className="relative overflow-hidden rounded-2xl border border-hairline bg-surface-1/40"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(14px)',
                  transition: `opacity 0.6s ${i * 110}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${i * 110}ms cubic-bezier(0.22,1,0.36,1)`,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: visible ? `${s.pct}%` : '0%',
                    background: 'rgba(213,255,64,0.10)',
                    borderRight: '1px solid rgba(213,255,64,0.25)',
                    transition: `width 0.9s ${i * 110 + 150}ms cubic-bezier(0.22,1,0.36,1)`,
                  }}
                />
                <div className="relative flex items-center justify-between gap-4 px-6 py-4 md:px-8 md:py-5">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <span
                      className="shrink-0 font-display font-bold tabular-nums"
                      style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: i === 0 ? ACCENT : '#ffffff' }}
                    >
                      {ar ? statNode(locale, s.value) : stat(s.value)}
                    </span>
                    <div className="min-w-0">
                      <p className={cx('text-[14px] font-semibold text-ink', (en || ar) && 'truncate')}>{tr(s.label)}</p>
                      <p className={cx('text-[11.5px] text-ink-subtle', en ? 'truncate' : 'leading-snug')}>{tr(s.desc)}</p>
                    </div>
                  </div>
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
                    <path d="M6 2v8M2.5 7L6 10.5 9.5 7" stroke="#52525b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
