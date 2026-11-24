import { useEffect, useRef, useState } from 'react'
import { OFFER_PATHS } from '../config.js'
import { trackEvent } from '../lib/analytics.js'
import { usePressFeedback } from '../lib/usePressFeedback.js'
import { tr, hrefFor } from '../i18n/tr.js'
import { currentLocale } from '../i18n/locale.js'
import { flowAvailable } from '../i18n/cta.js'

/* ─────────────────────────────────────────────
   FREE VIDEO OFFER — a secondary homepage conversion block for translated pages ONLY (the English homepage carries the same offer in its hero's secondary cards, so it is unchanged).

   • It promotes the existing "1 FREE video production" application (/risk-free-trial, translated). The five free ad concepts stay the primary offer: this block has one quiet button and
     is not in the navigation.
   • The wording is application-based on purpose: "request", "subject to review and approval". Nothing implies an automatic entitlement.
   • It renders only where the flow is translated (src/i18n/cta.js `riskFree`), so a language without that page never gets a link to a missing route.
   • The English strings below are the source of truth for the dictionary (src/i18n/es/dict-riskfree.js); they are never shown in English.
───────────────────────────────────────────── */

export default function FreeVideoOffer() {
  const locale = currentLocale()
  const press = usePressFeedback()
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  if (locale === 'en' || !flowAvailable(locale, 'riskFree')) return null
  return (
    <section ref={ref} id="free-video" aria-labelledby="free-video-heading" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div
          className="relative overflow-hidden rounded-3xl border border-lime/30 bg-lime/[0.06] px-6 py-9 md:px-12 md:py-12"
          style={{ opacity: seen ? 1 : 0, transform: seen ? 'none' : 'translateY(14px)', transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)' }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/10 blur-[90px]" />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{tr('Try our production')}</span>
              </div>
              <h2 id="free-video-heading" className="mt-4 font-display text-[1.75rem] font-bold leading-[1.15] tracking-display text-ink sm:text-4xl">
                {tr('Try working with us.')} <span className="text-lime">{tr('Your first video, on us.')}</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
                {tr('Want to see how we work before taking the next step? Request a free trial video. We will review your project and, if it fits the programme, we will take care of the production.')}
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <a
                href={hrefFor(OFFER_PATHS.riskFree)}
                onClick={() => trackEvent('risk_free_trial_click', { location: 'home_offer', page: locale })}
                {...press}
                className="cta-gradient group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 text-[15px] font-semibold text-canvas sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                {tr('Request my free video')}
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" fill="none" aria-hidden="true">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <p className="mt-3 max-w-xs text-xs leading-snug text-ink-subtle">{tr('Offer subject to review and approval. Programme terms apply.')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
