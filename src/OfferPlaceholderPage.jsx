import { useEffect } from 'react'
import { BOOKING_URL } from './config.js'

/* ─────────────────────────────────────────────
   PLACEHOLDER destinations for the homepage offers.

   These are NOT the landing pages — no forms, no submissions, no success
   states. They exist so the homepage CTAs never land on a 404. Each is
   marked noindex. Replace the component registered for the route in
   App.jsx when the real page ships; the homepage links won't change.
───────────────────────────────────────────── */

const COPY = {
  hooks: {
    eyebrow: 'Free Hooks Library',
    title: '10 Free Ad Hooks',
    body: 'Soon you’ll be able to choose SaaS or e-commerce and receive the relevant hook frameworks by email. The library is being finalized.',
  },
  riskFree: {
    eyebrow: 'Risk-Free Video Production',
    title: 'Try CONVRT Risk-Free',
    body: 'Qualifying brands can apply for a free video production trial, including two bonus hook variations, subject to production conditions. The application page is being finalized.',
  },
}

function OfferPlaceholderPage({ copy }) {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-lime/10 blur-[140px]"
      />
      <div className="relative mx-auto max-w-2xl px-5 py-20 md:px-8 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{copy.eyebrow}</span>
        </div>
        <h1 className="font-display font-bold text-ink tracking-display leading-[1.05] text-4xl md:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-5 text-base md:text-lg text-ink-muted leading-relaxed">{copy.body}</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <a
            href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
            className="cta-gradient inline-flex w-full sm:w-auto items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-canvas"
          >
            Book a Creative Call
          </a>
          <a href="/" className="inline-flex min-h-[44px] items-center text-sm font-medium text-ink hover:text-lime transition-colors">
            ← Back to home
          </a>
        </div>
      </div>
    </section>
  )
}

export const HooksPlaceholderPage = () => <OfferPlaceholderPage copy={COPY.hooks} />
export const RiskFreePlaceholderPage = () => <OfferPlaceholderPage copy={COPY.riskFree} />
