/* ─────────────────────────────────────────────
   ANALYTICS / ATTRIBUTION — every conversion and CTA event on the site goes through trackEvent().

   Events are pushed to the Google Tag Manager dataLayer ONLY when consent allows it (src/lib/consent.js):
   a GTM container ID must be configured (VITE_GTM_ID) AND the visitor must have granted analytics or marketing
   consent. Otherwise trackEvent() is a no-op (plus a console.debug in development), exactly as before GTM existed.
   The Meta Pixel hook (window.fbq) is only called with marketing consent.

   Every pushed event also carries `page_path` (this page) and `landing_page` (the page the session started on),
   so a GA4/GTM report can show which landing pages lead to each enquiry. Event names are stable: GTM triggers
   match on them (see docs/analytics-and-consent.md for the full list). Identical events fired within
   750 ms are dropped, which protects against accidental double firing (for example effects that re-run).

   UTM + click-id capture: read once on landing, persisted in
   sessionStorage so they survive in-page navigation and can be replayed onto the booking link even if the
   visitor scrolls the page for a while before converting.
───────────────────────────────────────────── */

import { isTrackingAllowed, isMarketingAllowed, landingPage } from './consent.js'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const CLICK_ID_KEYS = ['gclid', 'fbclid', 'ttclid', 'wbraid', 'gbraid']
const STORAGE_KEY = 'convrt_scale_attribution'

const DEDUPE_MS = 750
const recent = new Map()

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return

  if (isTrackingAllowed()) {
    const key = `${name}|${JSON.stringify(params)}|${window.location.pathname}`
    const now = Date.now()
    const last = recent.get(key)
    if (last !== undefined && now - last < DEDUPE_MS) return
    recent.set(key, now)

    const payload = {
      page_path: window.location.pathname.replace(/\/$/, '') || '/',
      landing_page: landingPage(),
      ...params,
    }
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: name, ...payload })
    if (isMarketingAllowed() && typeof window.fbq === 'function') {
      window.fbq('trackCustom', name, params)
    }
  }
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[track]', name, params)
  }
}

/* Capture UTM + click-id params from the current URL into sessionStorage.
   Call once on page mount. Safe to call repeatedly — only overwrites
   stored values when the current URL actually has new ones. */
export function captureAttribution() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const found = {}
  ;[...UTM_KEYS, ...CLICK_ID_KEYS].forEach((key) => {
    const value = params.get(key)
    if (value) found[key] = value
  })
  if (Object.keys(found).length === 0) return
  try {
    const existing = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}')
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...found }))
  } catch {
    /* sessionStorage unavailable (privacy mode, etc.) — attribution simply isn't replayed */
  }
}

function getStoredAttribution() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

/* Append captured UTM params onto a booking URL. Click-ids (gclid/fbclid/…)
   are attribution-only and aren't meaningful to Calendly, so only the
   utm_* keys — which Calendly natively records against the booking — are
   forwarded into the query string. */
export function withUtm(url) {
  const stored = getStoredAttribution()
  const utmOnly = Object.fromEntries(Object.entries(stored).filter(([k]) => UTM_KEYS.includes(k)))
  if (Object.keys(utmOnly).length === 0) return url
  const [base, hash = ''] = url.split('#')
  const separator = base.includes('?') ? '&' : '?'
  const query = new URLSearchParams(utmOnly).toString()
  return `${base}${separator}${query}${hash ? `#${hash}` : ''}`
}
