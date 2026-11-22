/* CONVERSION FLOWS PER LANGUAGE.

   Four flows are English-only today: the Creative Growth Roadmap application (+ its video and qualification), the 1 FREE Video (risk-free) application, the
   10 FREE Ad Hooks signup, and the Referral Partner application. Their forms, validation messages, qualification answers, confirmation screens and
   (for the Roadmap) the explainer video are English, and their API contracts (the option labels the server matches) must not change. A visitor on a Spanish
   page must never be routed into a half-translated form, so for Spanish these flows are BLOCKED: no Spanish page links to them. Spanish CTAs use the flow
   that is language-neutral and complete: the discovery-call booking (the same Calendly event the English /scale and Organic pages use) and the contact email.

   To release a flow in Spanish: translate it end to end, then set its flag to true here. Every Spanish CTA that depends on it switches by itself.
   See docs/multilingual-spanish-release.md for what each flow needs. */

import { BOOKING_URL, OFFER_PATHS } from '../config.js'
import { DEFAULT_LOCALE } from './locales.js'
import { hrefFor } from './tr.js'

export const LOCALIZED_FLOWS = {
  es: { roadmap: true, riskFree: true, hooks: false, referrals: false },
  fr: { roadmap: false, riskFree: false, hooks: false, referrals: false },
  ar: { roadmap: false, riskFree: false, hooks: false, referrals: false },
}

/* A CTA as authored in English, resolved for a language: a CTA that points at a flow which is not translated yet becomes the booking call (label = a dictionary
   key). Everything else is returned unchanged. */
export function resolveCta(locale, { href, external = false, label }) {
  if (locale !== DEFAULT_LOCALE && href === OFFER_PATHS.roadmap && !flowAvailable(locale, 'roadmap')) return { href: BOOKING_URL, external: true, label: 'Book a Creative Call', redirected: true }
  return { href: hrefFor(href, locale), external, label, redirected: false }
}

export const flowAvailable = (locale, flow) => locale === DEFAULT_LOCALE || LOCALIZED_FLOWS[locale]?.[flow] === true

/* The primary "start here" action of a page, per language. English keeps the Roadmap. Other languages: the roadmap when its flow is localized,
   otherwise the booking call. `label` is a dictionary key (see src/i18n/es/dict-shell.js). */
export function primaryAction(locale) {
  if (flowAvailable(locale, 'roadmap')) return { kind: 'roadmap', label: 'Get 5 Free Ad Concepts', href: hrefFor(OFFER_PATHS.roadmap, locale), external: false, event: 'hero_creative_roadmap_click' }
  return { kind: 'booking', label: 'Book a Creative Call', href: BOOKING_URL, external: true, event: 'primary_cta_click' }
}

