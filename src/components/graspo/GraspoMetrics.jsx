import { useEffect, useRef, useState } from 'react'
import { useTr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeStat } from '../../i18n/format.js'
import { GRASPO_METRICS as METRICS } from '../../caseStudies/data.js'
import { stat } from '../caseStudies/format.js'

/* ─────────────────────────────────────────────
   HERO METRICS — the numbers that carry the page.
   All verified from Meta Business Suite screenshots
   in the source workbook (Jan 1 – Jun 19, 2026).
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

/* Arabic figures read "10.7 مليون": the unit is set smaller than the number so a big figure stays on one line inside its card (English is untouched: it returns the plain string). */
export function statNode(locale, v) {
  const t = localizeStat(locale, v)
  const m = locale === 'ar' ? String(t).match(/^(\S+) (\S+)$/) : null
  return m ? <>{m[1]} <span className="text-[0.5em] font-semibold">{m[2]}</span></> : t
}

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

export default function GraspoMetrics() {
  const tr = useTr()
  const locale = currentLocale()
  const [wrapRef, visible] = useInView()

  return (
    <section id="kpis" className="relative pt-4 pb-12 md:pt-6 md:pb-16 scroll-mt-24">
      <div ref={wrapRef} className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`relative overflow-hidden rounded-3xl border border-hairline bg-surface-1/50 backdrop-blur-md px-6 py-7 ${i === 4 ? 'col-span-2 lg:col-span-1' : ''}`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(18px)',
                transition: `opacity 0.6s ${i * 70}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${i * 70}ms cubic-bezier(0.22,1,0.36,1)`,
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-[0.10] blur-2xl"
                style={{ background: ACCENT }}
              />
              <p
                className="relative font-display font-bold tracking-display leading-none text-[clamp(1.9rem,4vw,2.6rem)] tabular-nums"
                style={{ color: i === 3 || i === 4 ? ACCENT : '#ffffff' }}
              >
                {locale === 'ar' ? statNode(locale, m.value) : stat(m.value)}
              </p>
              <p className="relative mt-3 text-[13px] font-semibold text-ink">{tr(m.label)}</p>
              <p className="relative mt-1 text-[11.5px] text-ink-subtle">{tr(m.sub)}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-ink-subtle">
          {tr('Source: Meta Business Suite analytics, Jan 1 – Jun 19 2026 · Leads: internal inbound tracker across Meta, email and WhatsApp')}
        </p>
        {/* Spanish and French (not English, not Arabic): the limitation stated on the Organic page for the same figures (src/content/organicSocialPage.js), shown here too. The English page is unchanged. */}
        {locale !== 'en' && locale !== 'ar' && (
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-ink-subtle">
            {tr('Results are specific to this client and period; they are not typical and not guaranteed.')}
          </p>
        )}
      </div>
    </section>
  )
}
