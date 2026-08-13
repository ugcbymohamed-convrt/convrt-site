import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────
   HERO METRICS — the numbers that carry the page.
   All verified from Meta Business Suite screenshots
   in the source workbook (Jan 1 – Jun 19, 2026).
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'

const METRICS = [
  { value: '10.7M', label: 'Total Views', sub: 'Facebook + Instagram' },
  { value: '3.4M', label: 'Accounts Reached', sub: 'Organic distribution' },
  { value: '65K', label: 'Content Interactions', sub: 'Likes, comments, shares, saves' },
  { value: '75', label: 'Unique Inbound Leads', sub: 'Meta, email & WhatsApp' },
  { value: '26', label: 'High-Priority Opportunities', sub: 'Qualified for follow-up' },
]

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
                {m.value}
              </p>
              <p className="relative mt-3 text-[13px] font-semibold text-ink">{m.label}</p>
              <p className="relative mt-1 text-[11.5px] text-ink-subtle">{m.sub}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-ink-subtle">
          Source: Meta Business Suite analytics, Jan 1 – Jun 19 2026 · Leads: internal inbound tracker across Meta, email and WhatsApp
        </p>
      </div>
    </section>
  )
}
