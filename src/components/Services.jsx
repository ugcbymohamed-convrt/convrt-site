import { useEffect, useRef, useState } from 'react'
import { OFFER_PATHS } from '../config.js'
import { PATHS } from '../routes.js'
import { SERVICE_LABELS } from '../seo/businessKnowledge.js'
import { useTr, useHref, englishOnly } from '../i18n/tr.js'
import { currentLocale } from '../i18n/locale.js'
import { primaryAction } from '../i18n/cta.js'

/* ─────────────────────────────────────────────
   SECTION 4 — WHAT WE OFFER
   Four services in an equal 2 × 2 grid. Each card is ONE link to the service's own page, so this section is the
   homepage's internal-link hub. Destinations come from PATHS (src/routes.js), never typed here.
   Styling lives in src/index.css (.svc-*); each card only sets its own colour through custom properties.
───────────────────────────────────────────── */

const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

/* rgb / rgb2 are space-separated triplets (CSS `rgb(var(--svc-rgb) / .2)`).
   glowA / glowB: radial light sources; rest and hover alphas. ring: the 1px accent border at rest and on hover. */
const SERVICES = [
  {
    id: 'ugc',
    number: '01',
    title: 'UGC Video Ads',
    description: 'Human-led UGC ads built to capture attention and test creative angles.',
    href: PATHS.ugcVideoAgency,
    pills: ['UGC Ads', 'Creator-Led', 'Creative Testing'],
    icon: IconUGC,
    rgb: '139 92 246', rgb2: '139 92 246', text: '#a78bfa', textHi: '#c4b5fd',
    glowA: { pos: '8% 12%', r: '480px', rest: 0.22, hover: 0.42 },
    glowB: { pos: '90% 88%', r: '320px', rest: 0.10, hover: 0.22 },
    ring: { rest: 0.32, hover: 0.65 },
  },
  {
    id: 'saas',
    number: '02',
    title: 'SaaS Video Production',
    description: 'Product demos, explainers and video ads that make software easier to understand.',
    href: PATHS.saasVideoProduction,
    pills: ['Product Demos', 'Explainers', 'Video Ads'],
    icon: IconSaas,
    rgb: '56 189 248', rgb2: '34 211 238', text: '#7dd3fc', textHi: '#bae6fd',
    glowA: { pos: '88% 8%', r: '460px', rest: 0.20, hover: 0.38 },
    glowB: { pos: '10% 88%', r: '320px', rest: 0.09, hover: 0.20 },
    ring: { rest: 0.30, hover: 0.62 },
  },
  {
    id: 'spokesperson',
    number: '03',
    title: 'Spokesperson Videos',
    description: 'Professional, multilingual presenters for ads, demonstrations and brand messages.',
    href: PATHS.spokespersonVideoProduction,
    pills: ['Human-Led', 'Multilingual', 'Product Demos'],
    icon: IconSpokesperson,
    rgb: '255 106 77', rgb2: '255 106 77', text: '#ff8c70', textHi: '#ffb59c',
    glowA: { pos: '8% 12%', r: '460px', rest: 0.20, hover: 0.38 },
    glowB: { pos: '90% 88%', r: '300px', rest: 0.09, hover: 0.20 },
    ring: { rest: 0.30, hover: 0.60 },
  },
  {
    id: 'social',
    number: '04',
    title: SERVICE_LABELS.organic,
    description: 'Organic social videos, content planning, publishing and community management.',
    href: PATHS.socialMediaVideoProduction,
    pills: ['Organic Video', 'Posting', 'Community'],
    icon: IconSocial,
    rgb: '213 255 64', rgb2: '213 255 64', text: '#d5ff40', textHi: '#e8ff7a',
    glowA: { pos: '88% 8%', r: '440px', rest: 0.16, hover: 0.32 },
    glowB: { pos: '10% 88%', r: '280px', rest: 0.07, hover: 0.16 },
    ring: { rest: 0.26, hover: 0.55 },
  },
]

/* Per-card custom properties read by the .svc-* rules. The -hi alphas are the EXTRA light added on hover (the
   hover layer sits on top of the rest layer). */
const cardVars = (s) => ({
  '--svc-rgb': s.rgb, '--svc-rgb2': s.rgb2, '--svc-text': s.text, '--svc-text-hi': s.textHi,
  '--svc-ring': s.ring.rest, '--svc-ring-hi': s.ring.hover,
  '--svc-ga': s.glowA.rest, '--svc-ga-hi': +(s.glowA.hover - s.glowA.rest).toFixed(2), '--svc-ga-pos': s.glowA.pos, '--svc-ga-r': s.glowA.r,
  '--svc-gb': s.glowB.rest, '--svc-gb-hi': +(s.glowB.hover - s.glowB.rest).toFixed(2), '--svc-gb-pos': s.glowB.pos, '--svc-gb-r': s.glowB.r,
})

/* ── IntersectionObserver ── */
function useInView(threshold = 0.1) {
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

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */
export default function Services() {
  const [wrapRef, sectionVisible] = useInView(0.08)
  const tr = useTr()
  const href = useHref()
  const action = primaryAction(currentLocale())

  return (
    <section id="services" className="relative overflow-hidden py-16 md:py-20">

      {/* ── Section-level ambient depth ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -right-48 h-[700px] w-[700px] rounded-full bg-violet/[0.05] blur-[150px]" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] rounded-full bg-coral/[0.045] blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[900px] rounded-full bg-lime/[0.025] blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: NOISE_BG, backgroundSize: '180px 180px' }} />
      </div>

      <div ref={wrapRef} className="relative mx-auto max-w-7xl px-5 md:px-8">

        {/* ── Header ── */}
        <div
          className="mb-14 text-center lg:text-left"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'none' : 'translateY(28px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{tr('What We Offer')}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <h2 className="font-display font-bold text-ink tracking-display leading-[1.02] text-4xl md:text-5xl lg:text-[62px]">
              {tr('Video creative for')}<br />
              <span className="text-lime">{tr('paid and organic social.')}</span>
            </h2>
            <p className="text-[15px] text-ink-muted leading-relaxed max-w-sm mx-auto lg:mx-0 text-center lg:text-right pb-1">
              {tr('Creative strategy and full video production,')}{' '}<br className="hidden lg:block" />
              {tr('from concept and creator casting to finished, platform-ready videos.')}
            </p>
          </div>
        </div>

        {/* ── Grid ── */}
        <ul className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-4 md:gap-5">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </ul>

        {/* ── CTA strip ── */}
        <div
          className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-3xl border border-hairline bg-surface-1/40 backdrop-blur-md px-8 py-7"
          style={{
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.7s 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.7s 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div>
            <p className="font-display font-semibold text-ink text-xl leading-tight">{tr('Not sure which service fits?')}</p>
            <p className="mt-1.5 text-sm text-ink-muted">{tr("We'll tell you exactly what you need in a free 20-minute strategy call.")}</p>
          </div>
          <a href={action.href} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="cta-gradient shrink-0 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas">
            {tr('Book a Creative Call')}
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
              <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <p className="mt-6 text-center lg:text-right text-xs text-ink-subtle">
          {tr('Need to test creative concepts first?')}{' '}
          <a href={href('/pricing')} className="text-ink-muted hover:text-lime underline underline-offset-2 transition-colors">
            {tr('Explore packages and pricing')}
          </a>
        </p>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   ServiceCard: the whole card is one <a> (no nested links or buttons). Its name is the title and its description is
   the description, so a screen reader announces "UGC Video Ads, link" and reads the one-line summary. The wrapper <li>
   only handles the scroll-in; hover, focus and the diagonal-arrow motion are CSS (.svc-*), so keyboard focus gets
   exactly what the mouse gets.
───────────────────────────────────────────── */
function ServiceCard({ service: s, index }) {
  const tr = useTr()
  const href = useHref()
  const [ref, visible] = useInView(0.12)
  const Icon = s.icon
  const titleId = `service-${s.id}-title`
  const descId = `service-${s.id}-desc`

  return (
    <li
      ref={ref}
      className={`h-full transition-[opacity,transform] duration-700 ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: visible ? `${(index % 2) * 90 + Math.floor(index / 2) * 90}ms` : '0ms' }}
    >
      <a href={href(s.href)} {...(englishOnly(s.href) ? { hrefLang: 'en' } : {})} className="svc-card" style={cardVars(s)} aria-labelledby={titleId} aria-describedby={descId}>
        {/* Border ring (hover version fades in) */}
        <span aria-hidden="true" className="svc-layer svc-frame" />
        <span aria-hidden="true" className="svc-layer svc-frame-hi" />

        {/* Clipped decoration: glow, grain, big number, shine sweep */}
        <span aria-hidden="true" className="svc-layer svc-clip">
          <span className="svc-layer svc-glow" />
          <span className="svc-layer svc-glow-hi" />
          <span className="svc-layer opacity-[0.032]" style={{ backgroundImage: NOISE_BG, backgroundSize: '150px 150px' }} />
          <span className="svc-num font-display">{s.number}</span>
          <span className="svc-shine" />
        </span>

        <div className="svc-body">
          {/* Icon left, diagonal arrow top-right */}
          <div className="flex items-start justify-between">
            <div className="relative">
              <span className="svc-halo" />
              <span className="svc-icon"><Icon size={26} /></span>
            </div>
            <span className="svc-corner">
              <svg className="svc-arrow" aria-hidden="true" width="16" height="16" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          <h3 id={titleId} className="svc-title mt-6 font-display font-bold tracking-display leading-[1.06]" style={{ fontSize: 'clamp(1.45rem, 2.4vw, 1.85rem)' }}>
            {tr(s.title)}
          </h3>
          <p id={descId} className="svc-desc mt-3 max-w-[38ch] text-[14.5px] leading-relaxed">{tr(s.description)}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {s.pills.map((pill) => (<li key={pill} className="svc-pill">{tr(pill)}</li>))}
          </ul>

          <div className="min-h-[24px] flex-1" />
          <div aria-hidden="true" className="svc-rule mt-5" />
          <div className="mt-4 flex">
            <span className="svc-cta">
              {tr('Explore Service')}{englishOnly(s.href) && <span className="ms-1.5 text-[11px] font-normal opacity-70">{tr('(in English)')}</span>}
              <svg className="svc-arrow" aria-hidden="true" width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </li>
  )
}

/* ─────────────────────────────────────────────
   Icons — 26 × 26 viewBox; stroke follows the CSS colour (currentColor)
───────────────────────────────────────────── */
function IconUGC({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="14" height="22" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.5" y="5" width="9" height="13" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11.5 9.5l4 2-4 2V9.5z" fill="currentColor" />
      <path d="M11.5 20h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 4l.5 1.3 1.3.5-1.3.5L21 7.6l-.5-1.3-1.3-.5 1.3-.5L21 4z" fill="currentColor" />
    </svg>
  )
}

function IconSpokesperson({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 24c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 9.5a3.5 3.5 0 010 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20.5 7a7 7 0 010 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconSocial({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="2" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="14" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16.5 19h5M16.5 21.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="22.5" cy="4" r="2" fill="currentColor" />
    </svg>
  )
}

function IconSaas({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="21" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 22.5h5M13 18v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 8.2l5 2.55-5 2.55V8.2z" fill="currentColor" />
    </svg>
  )
}
