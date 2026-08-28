/* ─────────────────────────────────────────────
   ANALYTICS / ATTRIBUTION — placeholder event hooks for the /scale
   paid-acquisition landing page.

   No analytics vendor is wired into this project yet. trackEvent()
   pushes to window.dataLayer (GTM/GA4) and calls window.fbq (Meta
   Pixel) ONLY if those globals already exist on the page — otherwise
   it's a no-op plus a console.debug so events are visible during
   development. When real tracking is installed, nothing here needs
   to change: this stays the single call site for every conversion
   event on the page.

   UTM + click-id capture: read once on landing, persisted in
   sessionStorage so they survive in-page navigation and can be
   replayed onto the booking link even if the visitor scrolls the
   page for a while before converting.
───────────────────────────────────────────── */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
const CLICK_ID_KEYS = ['gclid', 'fbclid', 'ttclid', 'wbraid', 'gbraid']
const STORAGE_KEY = 'convrt_scale_attribution'

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params })
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, params)
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
