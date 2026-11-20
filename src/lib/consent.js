/* ─────────────────────────────────────────────
   CONSENT + GOOGLE TAG MANAGER LOADER (Google Consent Mode v2, "basic" mode).

   What this file guarantees
   • Nothing from Google loads, and no analytics event is pushed, unless BOTH are true:
       1. a GTM container ID is configured (build-time env var VITE_GTM_ID, set in Vercel; never committed), and
       2. the visitor has granted consent for at least one non-essential category.
   • Consent Mode v2 defaults are all "denied" and are pushed to the dataLayer BEFORE GTM can exist. A visitor's saved
     choice is applied with a consent "update" before the GTM script is requested.
   • Two categories the visitor controls: "analytics" (analytics_storage) and "marketing" (ad_storage, ad_user_data,
     ad_personalization). Marketing stays off unless explicitly accepted. Nothing in this site's code sets advertising
     cookies; the category exists so a pixel added inside GTM later is also gated.
   • Withdrawing consent is honoured immediately: events stop, a consent "update" to denied is sent, and Google's
     first-party cookies (_ga, _ga_*, _gid, _gac_*, _gcl_*) are removed.
   • With no GTM ID configured (today, and on any deploy that does not set it) this module does nothing: no banner,
     no script, no storage.

   The GA4 measurement ID is NOT in this code either: it lives inside the GTM container (the "Google tag").
   Everything here is split into pure functions (tested in tests/consent.test.mjs) and a small runtime that takes its
   window / document / storage as arguments so it can be tested without a browser.
───────────────────────────────────────────── */

export const CONSENT_STORAGE_KEY = 'convrt_consent_v1'
export const CONSENT_VERSION = 1
export const OPEN_CONSENT_EVENT = 'convrt:open-consent'
export const CONSENT_CHANGE_EVENT = 'convrt:consent-change'

const GTM_ID_RE = /^GTM-[A-Z0-9]{4,12}$/
const GOOGLE_COOKIE_RE = /^(_ga|_ga_[A-Za-z0-9]+|_gid|_gat.*|_gac_.*|_gcl_.*|_gads|FPID|FPLC)$/

/* The configured container ID, or '' when missing or malformed (a bad value must never reach a script URL). */
export function validGtmId(raw) {
  const id = String(raw ?? '').trim()
  return GTM_ID_RE.test(id) ? id : ''
}

/* Build-time ID. `import.meta.env` is undefined under plain Node (tests), hence the optional chaining. */
export const GTM_ID = validGtmId(import.meta.env?.VITE_GTM_ID)
export const consentConfigured = (id = GTM_ID) => Boolean(validGtmId(id))

export const DENIED_CHOICE = Object.freeze({ analytics: false, marketing: false })
export const GRANTED_CHOICE = Object.freeze({ analytics: true, marketing: true })

const normalizeChoice = (c) => ({ analytics: c?.analytics === true, marketing: c?.marketing === true })
export const anyGranted = (c) => Boolean(c && (c.analytics || c.marketing))

/* Consent Mode v2 signal names. Strictly necessary storage stays granted; the rest follow the visitor's choice. */
export function toGoogleConsent(choice) {
  const c = normalizeChoice(choice)
  const v = (on) => (on ? 'granted' : 'denied')
  return {
    ad_storage: v(c.marketing),
    ad_user_data: v(c.marketing),
    ad_personalization: v(c.marketing),
    analytics_storage: v(c.analytics),
    functionality_storage: 'granted',
    security_storage: 'granted',
    personalization_storage: 'denied',
  }
}

export const DEFAULT_GOOGLE_CONSENT = toGoogleConsent(DENIED_CHOICE)

/* Saved record → { choice, savedAt } or null when absent, corrupt or from an older consent version. */
export function parseStoredConsent(raw) {
  if (!raw) return null
  try {
    const o = JSON.parse(raw)
    if (!o || o.v !== CONSENT_VERSION) return null
    return { choice: normalizeChoice(o), savedAt: typeof o.t === 'number' ? o.t : 0 }
  } catch {
    return null
  }
}

export const serializeConsent = (choice, now = Date.now()) => {
  const c = normalizeChoice(choice)
  return JSON.stringify({ v: CONSENT_VERSION, analytics: c.analytics, marketing: c.marketing, t: now })
}

/* Names of the Google cookies to remove when consent is withdrawn (pure, so it can be tested). */
export const googleCookieNames = (cookieString) =>
  String(cookieString || '')
    .split(';')
    .map((p) => p.split('=')[0].trim())
    .filter((n) => GOOGLE_COOKIE_RE.test(n))

/* ── runtime state (one per page load) ─────────────────────────────────────────────── */
const state = { id: '', choice: { ...DENIED_CHOICE }, decided: false, loaded: false, win: null, doc: null, storage: null }

/* Safe storage access: private modes and blocked storage must never break the site. */
const readStore = (storage) => { try { return storage?.getItem(CONSENT_STORAGE_KEY) } catch { return null } }
const writeStore = (storage, value) => { try { storage?.setItem(CONSENT_STORAGE_KEY, value) } catch { /* choice simply is not remembered */ } }

function gtag(win, ...args) {
  // GTM only understands the `arguments` object form, not an Array.
  win.dataLayer = win.dataLayer || []
  win.dataLayer.push((function () { return arguments })(...args))
}

function loadGtm({ win, doc, id }) {
  if (state.loaded) return
  state.loaded = true
  win.dataLayer = win.dataLayer || []
  win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const s = doc.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
  s.setAttribute('data-convrt-gtm', id)
  doc.head.appendChild(s)
}

function clearGoogleCookies(doc, win) {
  try {
    const host = win.location?.hostname || ''
    const parts = host.split('.')
    const domains = ['', host, ...(parts.length > 2 ? [`.${parts.slice(-2).join('.')}`] : []), `.${host}`]
    for (const name of googleCookieNames(doc.cookie)) {
      for (const d of domains) {
        doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`
      }
    }
  } catch { /* nothing to clear */ }
}

/* Called once at startup (src/main.jsx). Returns { enabled, needsDecision }. */
export function initConsent({ win = globalThis.window, doc = globalThis.document, storage, id = GTM_ID } = {}) {
  state.id = validGtmId(id)
  state.win = win
  state.doc = doc
  state.storage = storage ?? (() => { try { return win?.localStorage } catch { return null } })()
  state.loaded = false
  state.choice = { ...DENIED_CHOICE }
  state.decided = false
  if (!state.id || !win || !doc) return { enabled: false, needsDecision: false }

  // 1. Denied defaults, always first.
  gtag(win, 'consent', 'default', { ...DEFAULT_GOOGLE_CONSENT })

  // 2. A saved choice is applied before GTM is requested.
  const saved = parseStoredConsent(readStore(state.storage))
  if (saved) {
    state.choice = saved.choice
    state.decided = true
    gtag(win, 'consent', 'update', toGoogleConsent(saved.choice))
    if (anyGranted(saved.choice)) loadGtm({ win, doc, id: state.id })
  }
  return { enabled: true, needsDecision: !saved }
}

/* The visitor made (or changed) a choice. Persists it, informs Google, loads GTM on first grant, cleans up on withdrawal. */
export function setConsent(choice) {
  const { win, doc, id } = state
  if (!id || !win || !doc) return state.choice
  const next = normalizeChoice(choice)
  const hadAnyGranted = anyGranted(state.choice)
  state.choice = next
  state.decided = true
  writeStore(state.storage, serializeConsent(next))
  gtag(win, 'consent', 'update', toGoogleConsent(next))
  if (anyGranted(next)) loadGtm({ win, doc, id })
  if (hadAnyGranted && !next.analytics) clearGoogleCookies(doc, win)
  if (!anyGranted(next)) { try { win.sessionStorage?.removeItem(LANDING_KEY) } catch { /* ignore */ } }
  try { win.dispatchEvent(new win.CustomEvent(CONSENT_CHANGE_EVENT, { detail: next })) } catch { /* no CustomEvent in tests */ }
  return next
}

export const getConsentChoice = () => ({ ...state.choice })
export const hasDecided = () => state.decided
export const consentEnabled = () => Boolean(state.id)

/* analytics.js asks this before pushing ANY event. */
export const isTrackingAllowed = () => Boolean(state.id && state.decided && anyGranted(state.choice))
export const isMarketingAllowed = () => Boolean(state.id && state.decided && state.choice.marketing)

/* Landing page of the session, kept in sessionStorage (path only, no query string) and only while tracking is allowed.
   Added to every event so a GTM/GA4 report can tie each enquiry back to the page the visit started on. */
export const LANDING_KEY = 'convrt_landing_page'
export function landingPage(win = state.win) {
  if (!win || !isTrackingAllowed()) return undefined
  const path = (win.location?.pathname || '/').replace(/\/$/, '') || '/'
  try {
    const stored = win.sessionStorage?.getItem(LANDING_KEY)
    if (stored) return stored
    win.sessionStorage?.setItem(LANDING_KEY, path)
  } catch { /* storage blocked: fall back to this page */ }
  return path
}

/* Test hook: forget runtime state. */
export function __resetConsentForTests() {
  state.id = ''; state.choice = { ...DENIED_CHOICE }; state.decided = false; state.loaded = false
  state.win = null; state.doc = null; state.storage = null
}
