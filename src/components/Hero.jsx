import { useEffect, useState } from 'react'
import { usePressFeedback } from '../lib/usePressFeedback.js'
import { OFFER_PATHS, CREATOR_SHOWCASE_PATH } from '../config.js'
import { trackEvent } from '../lib/analytics.js'
import CreatorVideoStage from './ugc/CreatorVideoStage.jsx'
import { HOME_HERO } from '../content/homeHero.js'
import { useTr, useHref } from '../i18n/tr.js'
import { currentLocale } from '../i18n/locale.js'
import { primaryAction, flowAvailable } from '../i18n/cta.js'

const ROTATING_WORDS = ['convert', 'resonate', 'sell', 'connect']
// Spanish rotating words complete "Creatividades de alto rendimiento diseñadas para ___" (see src/i18n/es/dict-home.js).
const ROTATING_WORDS_ES = ['convertir', 'conectar', 'vender', 'resonar']

/* Secondary offers — Level 2 in the hero's attention hierarchy. Each has its own
   accent (lime for the video offer, pink for the hooks library) so the
   two are recognisable at a glance, but both stay well below the primary CTA. */
export const SECONDARY_OFFERS = [
  {
    id: 'video',
    icon: IconClapper,
    title: <>1 <span className="text-lime">FREE</span> Video</>,
    description: 'Try our production risk-free.',
    cta: 'See if you qualify',
    href: OFFER_PATHS.riskFree,
    event: 'risk_free_trial_click',
    card: 'border-lime/30 bg-lime/[0.06] hover:border-lime/60 hover:bg-lime/[0.09] hover:shadow-[0_14px_34px_-18px_rgba(213,255,64,0.55)] focus-visible:outline-lime',
    iconTile: 'border-lime/30 bg-lime/10 text-lime',
    ctaText: 'text-lime',
  },
  {
    id: 'hooks',
    icon: IconBolt,
    title: <>10 <span className="text-[#F472B6]">FREE</span> Ad Hooks</>,
    description: 'Fresh hooks for your next ads.',
    cta: 'Get free hooks',
    href: OFFER_PATHS.hooks,
    event: 'hooks_library_click',
    card: 'border-[#F472B6]/35 bg-[#EC4899]/[0.08] hover:border-[#F472B6]/70 hover:bg-[#EC4899]/[0.14] hover:shadow-[0_14px_34px_-16px_rgba(236,72,153,0.6)] focus-visible:outline-[#F472B6]',
    iconTile: 'border-[#F472B6]/35 bg-[#EC4899]/15 text-[#F472B6]',
    ctaText: 'text-[#F472B6]',
  },
]

export default function Hero() {
  const tr = useTr()
  const href = useHref()
  const locale = currentLocale()
  const action = primaryAction(locale)
  const en = locale === 'en'
  const primaryPress = usePressFeedback()
  const ghostPress = usePressFeedback()
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient lime glow — replaces the old violet/coral wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[40%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-14 md:px-8 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left column — headline → description → primary CTA → compact secondary offers.
              Below lg the wrapper is `display: contents`, so its two groups become grid items that can be
              ordered around the phone showcase: headline + description, then the phones, then the CTAs
              and offers. From lg up it is a normal left column and the order classes do nothing. */}
          <div className="contents lg:block lg:col-span-6 text-center lg:text-left">
            <div className="order-1 lg:order-none">
            <h1 className="font-display font-semibold text-ink tracking-display-xl leading-[1.02] text-[48px] sm:text-[50px] md:text-[54px] lg:text-[60px] xl:text-[70px]">
              <span className="block">{tr('Performance creatives')}</span>{' '}
              <span className="block">
                {tr('engineered to')} <RotatingWord words={en ? ROTATING_WORDS : ROTATING_WORDS_ES} />
              </span>
            </h1>

            <p className="mt-6 md:mt-8 max-w-xl mx-auto lg:mx-0 text-pretty text-base md:text-lg text-ink-muted leading-relaxed">
              {tr('From creative strategy and scripting to creator casting, filming and editing. We produce human-led UGC ads, SaaS videos, spokesperson videos and organic social content, ready to perform.')}
            </p>
            </div>

            <div className="order-3 lg:order-none">

            {/* Level 1 — the primary action: one value-prop line tied tightly to the button.
                Vertical rhythm of this column: 24 / 32 headline→description, 24 description→offer,
                12 offer→button, 32 / 40 button→secondary, 12 label→cards. */}
            <div className="lg:mt-6">
              <p className="mb-3 text-balance text-[15px] md:text-base font-medium leading-snug text-ink">
                {en ? <>Your next 5 ad concepts. Tailored to your brand. <span className="text-lime">On us.</span></> : <>{tr('Book a free strategy call.')} <span className="text-lime">{tr('We tell you exactly what you need.')}</span></>}
              </p>
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <a
                  href={action.href}
                  {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={() => trackEvent(action.event, en ? { location: 'hero' } : { page: locale, location: 'hero' })}
                  {...primaryPress}
                  className="cta-gradient hero-cta group inline-flex w-full sm:w-auto min-h-[64px] md:min-h-[68px] items-center justify-center gap-2.5
                             rounded-full px-6 md:px-7 lg:px-6 xl:px-7 py-4 text-base md:text-[17px] font-bold tracking-snug text-canvas
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                >
                  {tr(action.label)}
                  <svg viewBox="0 0 12 12" className="h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" aria-hidden="true">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href={href(CREATOR_SHOWCASE_PATH)}
                  onClick={() => trackEvent('hero_see_our_work_click', { location: 'hero' })}
                  {...ghostPress}
                  className="hero-cta-ghost group inline-flex w-full sm:w-auto min-h-[48px] sm:min-h-[64px] md:min-h-[68px] items-center justify-center gap-2
                             rounded-full border border-hairline-strong bg-surface-2 px-6 md:px-7 lg:px-5 xl:px-7 py-3 sm:py-4 text-base md:text-[17px] font-semibold tracking-snug text-ink
                             hover:border-ink-muted
                             focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                >
                  {tr('Explore Videos')}
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" aria-hidden="true">
                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Level 2 — compact secondary offers under a quiet, left-aligned label */}
            {/* The two free offers lead to English-only forms: shown only in languages where their flow is translated (src/i18n/cta.js). */}
            {flowAvailable(locale, 'riskFree') && flowAvailable(locale, 'hooks') && (
            <div className="mt-8 md:mt-10 max-w-xl mx-auto lg:mx-0">
              <p className="text-left text-[13px] text-ink-muted">{tr("Not ready yet? We've got two more FREE ways to start.")}</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {SECONDARY_OFFERS.map((offer) => (
                  <SecondaryOffer key={offer.id} offer={offer} />
                ))}
              </div>
            </div>
            )}
            </div>
          </div>

          {/* Right column — the same three-phone video stage as the /ugc-video-agency hero (second on small screens).
              The videos are listed in src/content/homeHero.js; the first is the large centre phone. */}
          <div className="order-2 min-w-0 lg:order-none lg:col-span-6">
            <CreatorVideoStage items={HOME_HERO} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Secondary offer module ----------
   The whole card is the link. On phones the icon sits beside three stacked text
   lines (short card); from sm up the icon shares a row with the title so two
   cards fit side by side in the left column without wrapping. */

export function SecondaryOffer({ offer }) {
  const Icon = offer.icon
  return (
    <a
      href={offer.href}
      onClick={() => trackEvent(offer.event, { location: 'hero' })}
      className={`group grid grid-cols-[auto_1fr] items-center gap-x-3 rounded-2xl border p-3.5 sm:p-4
                  transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5
                  motion-reduce:transition-none motion-reduce:hover:translate-y-0
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${offer.card}`}
    >
      <span className={`col-start-1 row-start-1 row-span-3 sm:row-span-1 flex h-10 w-10 items-center justify-center rounded-xl border sm:h-9 sm:w-9 ${offer.iconTile}`}>
        <Icon />
      </span>
      <span className="col-start-2 row-start-1 text-[15px] sm:text-base font-semibold leading-tight tracking-snug text-ink">{offer.title}</span>
      <span className="col-start-2 row-start-2 mt-0.5 text-[13px] leading-snug text-ink-muted sm:col-start-1 sm:col-span-2 sm:mt-2.5">{offer.description}</span>
      <span className={`col-start-2 row-start-3 mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold sm:col-start-1 sm:col-span-2 ${offer.ctaText}`}>
        {offer.cta}
        <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" fill="none" aria-hidden="true">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  )
}

function IconClapper() {
  return (
    <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="10" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.4 10L2.6 5.9a1.2 1.2 0 01.9-1.4l17.3-3.5a1.2 1.2 0 011.4.9l.7 3.4L3.4 10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M11 14.2l5 2.8-5 2.8v-5.6z" fill="currentColor" />
    </svg>
  )
}

function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ---------- Rotating headline word ---------- */

function RotatingWord({ words }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // Reduced motion: keep the first word still instead of cycling.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, 2200)
    return () => clearInterval(id)
  }, [words.length])

  // Pick the longest word to set a stable container width — no layout shift.
  const widest = words.reduce((a, b) => (a.length >= b.length ? a : b), '')

  return (
    <span className="relative inline-block align-baseline overflow-hidden pb-[0.12em]">
      {/* Invisible sizing element — reserves space for the widest word + underline padding */}
      {/* The widest word is drawn by CSS (::after reads data-word), not as text, so the heading's text is
          "Performance creatives engineered to <current word>" for search engines and screen readers, and nothing else changes. */}
      <span aria-hidden="true" data-word={widest} className="invisible whitespace-pre after:content-[attr(data-word)]" />

      {/* Animated word + underline, both bound to the current word so the
          underline tracks the word's width and sits flush under it */}
      <span
        key={index}
        className="animate-word-in absolute inset-0 flex items-baseline justify-center lg:justify-start"
      >
        <span className="relative text-lime">
          {words[index]}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-[0.04em] h-[0.08em] rounded-full bg-lime"
          />
        </span>
      </span>
    </span>
  )
}
