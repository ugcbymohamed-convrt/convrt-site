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

   UTM capture: the five standard utm_* campaign parameters are read once on landing and kept in sessionStorage
   (this tab only) so they survive in-page navigation and can be replayed onto the booking link, which Calendly
   records against the booking. Advertising click identifiers (gclid, fbclid, ttclid, wbraid, gbraid) are NOT
   stored: nothing on the site ever used them, and storing them before any consent is unnecessary. Google's own
   tags read gclid/gbraid/wbraid from the page URL themselves, and only as far as the visitor's consent allows.
───────────────────────────────────────────── */

import { isTrackingAllowed, isMarketingAllowed, landingPage } from './consent.js'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
/* Advertising click identifiers: never written to storage. Listed only so a value saved by an earlier version of the
   site in a visitor's open tab is wiped the next time attribution is captured. */
const LEGACY_CLICK_ID_KEYS = ['gclid', 'fbclid', 'ttclid', 'wbraid', 'gbraid']
export const ATTRIBUTION_STORAGE_KEY = 'convrt_scale_attribution'
const STORAGE_KEY = ATTRIBUTION_STORAGE_KEY

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

/* Capture the utm_* params from the current URL into sessionStorage. Call once on page mount. Safe to call
   repeatedly: only overwrites stored values when the current URL has new ones. Click identifiers are never kept
   (and any left in storage by an earlier version are removed). */
export function captureAttribution() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const found = {}
  UTM_KEYS.forEach((key) => {
    const value = params.get(key)
    if (value) found[key] = value
  })
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    let existing = {}
    try {
      existing = JSON.parse(raw || '{}') || {}
    } catch {
      existing = {}
    }
    const hadClickIds = LEGACY_CLICK_ID_KEYS.some((k) => k in existing)
    if (Object.keys(found).length === 0 && !hadClickIds) return
    const kept = Object.fromEntries(Object.entries({ ...existing, ...found }).filter(([k]) => UTM_KEYS.includes(k)))
    if (Object.keys(kept).length === 0) window.sessionStorage.removeItem(STORAGE_KEY)
    else window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(kept))
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

/* Append captured UTM params onto a booking URL: the utm_* keys, which Calendly natively records against the booking. */
export function withUtm(url) {
  const stored = getStoredAttribution()
  const utmOnly = Object.fromEntries(Object.entries(stored).filter(([k]) => UTM_KEYS.includes(k)))
  if (Object.keys(utmOnly).length === 0) return url
  const [base, hash = ''] = url.split('#')
  const separator = base.includes('?') ? '&' : '?'
  const query = new URLSearchParams(utmOnly).toString()
  return `${base}${separator}${query}${hash ? `#${hash}` : ''}`
}
