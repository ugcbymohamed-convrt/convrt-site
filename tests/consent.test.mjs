// Run with: node --test tests/consent.test.mjs
// SEO/GEO Batch 1: Google Consent Mode v2 + GTM loader (src/lib/consent.js) and the consent-gated trackEvent (src/lib/analytics.js).
// No browser: window / document / storage are small fakes passed in.
import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validGtmId, consentConfigured, toGoogleConsent, parseStoredConsent, serializeConsent, googleCookieNames,
  initConsent, setConsent, isTrackingAllowed, isMarketingAllowed, hasDecided, getConsentChoice, consentEnabled,
  DENIED_CHOICE, GRANTED_CHOICE, CONSENT_STORAGE_KEY, __resetConsentForTests,
} from '../src/lib/consent.js'
import { trackEvent } from '../src/lib/analytics.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

function fakeEnv({ stored } = {}) {
  const store = new Map(stored ? [[CONSENT_STORAGE_KEY, stored]] : [])
  const scripts = []
  const cookies = { value: '_ga=1; _ga_ABC=2; _gid=3; session=keep; _gcl_au=4' }
  const doc = {
    head: { appendChild: (s) => scripts.push(s) },
    createElement: () => ({ attrs: {}, setAttribute(k, v) { this.attrs[k] = v } }),
    get cookie() { return cookies.value },
    set cookie(v) {
      const [pair] = v.split(';'); const [name] = pair.split('=')
      if (/expires=Thu, 01 Jan 1970/.test(v)) cookies.value = cookies.value.split(';').map((c) => c.trim()).filter((c) => c.split('=')[0] !== name.trim()).join('; ')
    },
  }
  const win = {
    location: { hostname: 'www.convrt.studio', pathname: '/ugc-video-agency' },
    dataLayer: undefined,
    sessionStorage: { _m: new Map(), getItem(k) { return this._m.get(k) ?? null }, setItem(k, v) { this._m.set(k, v) }, removeItem(k) { this._m.delete(k) } },
    dispatchEvent() {}, CustomEvent: class {},
  }
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) }
  return { win, doc, storage, store, scripts, cookies }
}
// What the dataLayer holds, with `arguments` objects flattened to arrays.
const layer = (win) => (win.dataLayer || []).map((x) => (Array.isArray(x) ? x : x && typeof x.length === 'number' && !x.event ? Array.from(x) : x))

beforeEach(() => { __resetConsentForTests(); delete globalThis.window })

test('GTM id: only a well-formed container id is accepted; nothing is configured by default', () => {
  assert.equal(validGtmId('GTM-ABC123'), 'GTM-ABC123')
  assert.equal(validGtmId(' GTM-ABC123 '), 'GTM-ABC123')
  for (const bad of ['', undefined, null, 'G-ABCDEF1234', 'GTM-', 'gtm-abc123', 'GTM-ABC123"><script>', 'https://evil.example/x.js']) assert.equal(validGtmId(bad), '', String(bad))
  assert.equal(consentConfigured(''), false)
  assert.equal(consentConfigured('GTM-ABC123'), true)
})

test('no hard-coded Google ids anywhere in the source (GTM id comes from VITE_GTM_ID, GA4 id lives in the GTM container)', () => {
  for (const f of ['src/lib/consent.js', 'src/lib/analytics.js', 'src/main.jsx', 'src/components/ConsentManager.jsx', 'index.html', 'vercel.json']) {
    const s = read(f)
    assert.ok(!/GTM-[A-Z0-9]{4,}/.test(s.replace(/GTM-\[A-Z0-9\]\{4,12\}/g, '').replace(/GTM-ABC123/g, '')), `${f}: no GTM id`)
    assert.ok(!/\bG-[A-Z0-9]{8,}\b/.test(s), `${f}: no GA4 measurement id`)
    assert.ok(!/googletagmanager\.com\/gtag/.test(s), `${f}: no gtag.js snippet`)
  }
  assert.ok(!/googletagmanager/i.test(read('index.html')), 'index.html carries no tag manager snippet: it is loaded only by consent.js after consent')
})

test('Consent Mode mapping: denied by default, marketing gates the three ad signals, functionality/security stay granted', () => {
  assert.deepEqual(toGoogleConsent(DENIED_CHOICE), {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
    functionality_storage: 'granted', security_storage: 'granted', personalization_storage: 'denied',
  })
  const a = toGoogleConsent({ analytics: true, marketing: false })
  assert.equal(a.analytics_storage, 'granted'); assert.equal(a.ad_storage, 'denied'); assert.equal(a.ad_user_data, 'denied'); assert.equal(a.ad_personalization, 'denied')
  const all = toGoogleConsent(GRANTED_CHOICE)
  assert.deepEqual([all.ad_storage, all.ad_user_data, all.ad_personalization, all.analytics_storage], ['granted', 'granted', 'granted', 'granted'])
  assert.deepEqual(toGoogleConsent(undefined), toGoogleConsent(DENIED_CHOICE), 'garbage means denied')
})

test('stored consent: round trip, corrupt or old records are ignored (the banner shows again)', () => {
  const rec = serializeConsent({ analytics: true, marketing: false }, 1700000000000)
  assert.deepEqual(parseStoredConsent(rec), { choice: { analytics: true, marketing: false }, savedAt: 1700000000000 })
  for (const bad of [null, '', 'nope', '{}', JSON.stringify({ v: 99, analytics: true })]) assert.equal(parseStoredConsent(bad), null, String(bad))
  assert.deepEqual(parseStoredConsent(JSON.stringify({ v: 1, analytics: 'yes', marketing: 1 })).choice, { analytics: false, marketing: false }, 'only a real true counts')
})

test('google cookie cleanup only targets Google cookies', () => {
  assert.deepEqual(googleCookieNames('_ga=1; _ga_ABC=2; _gid=3; session=keep; _gcl_au=4; theme=dark'), ['_ga', '_ga_ABC', '_gid', '_gcl_au'])
})

test('not configured: nothing happens (no banner, no dataLayer, no script, no tracking)', () => {
  const e = fakeEnv()
  const r = initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: '' })
  assert.deepEqual(r, { enabled: false, needsDecision: false })
  assert.equal(e.win.dataLayer, undefined)
  assert.equal(e.scripts.length, 0)
  assert.equal(consentEnabled(), false)
  globalThis.window = e.win
  trackEvent('ugc_page_view')
  assert.equal(e.win.dataLayer, undefined, 'trackEvent is a no-op')
})

test('configured, first visit: denied defaults go to the dataLayer FIRST, GTM is NOT loaded, events are dropped', () => {
  const e = fakeEnv()
  const r = initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  assert.deepEqual(r, { enabled: true, needsDecision: true })
  const l = layer(e.win)
  assert.deepEqual(l[0].slice(0, 2), ['consent', 'default'])
  assert.equal(l[0][2].analytics_storage, 'denied'); assert.equal(l[0][2].ad_storage, 'denied')
  assert.equal(e.scripts.length, 0, 'no Google script before consent')
  assert.equal(isTrackingAllowed(), false)
  globalThis.window = e.win
  trackEvent('roadmap_form_started')
  assert.equal(layer(e.win).filter((x) => x.event).length, 0, 'no event is pushed without consent')
})

test('accept all: consent update, GTM loaded once with the configured id, events flow with page_path and landing_page', () => {
  const e = fakeEnv()
  initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  globalThis.window = e.win
  setConsent(GRANTED_CHOICE)
  setConsent(GRANTED_CHOICE)
  assert.equal(e.scripts.length, 1, 'GTM is injected exactly once')
  assert.equal(e.scripts[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-ABC123')
  const l = layer(e.win)
  assert.ok(l.some((x) => Array.isArray(x) && x[0] === 'consent' && x[1] === 'update' && x[2].analytics_storage === 'granted'))
  assert.ok(l.some((x) => x && x.event === 'gtm.js'))
  assert.equal(isTrackingAllowed(), true); assert.equal(isMarketingAllowed(), true); assert.equal(hasDecided(), true)
  trackEvent('risk_free_application_success', { x: 1 })
  const ev = layer(e.win).filter((x) => x.event === 'risk_free_application_success')
  assert.equal(ev.length, 1)
  assert.equal(ev[0].page_path, '/ugc-video-agency'); assert.equal(ev[0].landing_page, '/ugc-video-agency'); assert.equal(ev[0].x, 1)
  assert.ok(e.store.has(CONSENT_STORAGE_KEY), 'the choice is remembered')
})

test('identical events within 750 ms are not pushed twice (no duplicate firing)', () => {
  const e = fakeEnv()
  initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  globalThis.window = e.win
  setConsent(GRANTED_CHOICE)
  trackEvent('hooks_signup_success', { industry: 'saas' })
  trackEvent('hooks_signup_success', { industry: 'saas' })
  trackEvent('hooks_signup_success', { industry: 'ecommerce' })
  assert.equal(layer(e.win).filter((x) => x.event === 'hooks_signup_success').length, 2)
})

test('reject all: nothing loads, nothing is tracked, but the choice is remembered (no repeated banner)', () => {
  const e = fakeEnv()
  initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  globalThis.window = e.win
  setConsent(DENIED_CHOICE)
  assert.equal(e.scripts.length, 0)
  assert.equal(isTrackingAllowed(), false)
  trackEvent('roadmap_application_submitted')
  assert.equal(layer(e.win).filter((x) => x.event).length, 0)
  __resetConsentForTests()
  const again = initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  assert.equal(again.needsDecision, false, 'a saved rejection is respected on the next visit')
})

test('analytics only: ad signals stay denied and the pixel hook is not called', () => {
  const e = fakeEnv()
  initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  globalThis.window = e.win
  const calls = []; e.win.fbq = (...a) => calls.push(a)
  setConsent({ analytics: true, marketing: false })
  assert.equal(isTrackingAllowed(), true); assert.equal(isMarketingAllowed(), false)
  const upd = layer(e.win).filter((x) => Array.isArray(x) && x[1] === 'update').at(-1)[2]
  assert.deepEqual([upd.analytics_storage, upd.ad_storage, upd.ad_user_data, upd.ad_personalization], ['granted', 'denied', 'denied', 'denied'])
  trackEvent('primary_cta_click', { page: 'scale' })
  assert.equal(calls.length, 0, 'fbq only with marketing consent')
  setConsent(GRANTED_CHOICE)
  trackEvent('calendar_newtab_click', { page: 'roadmap' })
  assert.equal(calls.length, 1)
})

test('withdrawal: events stop immediately, denied update is sent, Google cookies are removed, other cookies stay', () => {
  const e = fakeEnv()
  initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  globalThis.window = e.win
  setConsent(GRANTED_CHOICE)
  trackEvent('ugc_page_view')
  const before = layer(e.win).filter((x) => x.event === 'ugc_page_view').length
  setConsent(DENIED_CHOICE)
  const last = layer(e.win).filter((x) => Array.isArray(x) && x[1] === 'update').at(-1)[2]
  assert.equal(last.analytics_storage, 'denied'); assert.equal(last.ad_storage, 'denied')
  trackEvent('saas_page_view')
  assert.equal(layer(e.win).filter((x) => x.event === 'saas_page_view').length, 0)
  assert.equal(layer(e.win).filter((x) => x.event === 'ugc_page_view').length, before)
  assert.equal(e.cookies.value, 'session=keep')
  assert.deepEqual(getConsentChoice(), { analytics: false, marketing: false })
})

test('returning visitor with saved consent: update is applied BEFORE GTM is requested', () => {
  const e = fakeEnv({ stored: serializeConsent({ analytics: true, marketing: false }) })
  const r = initConsent({ win: e.win, doc: e.doc, storage: e.storage, id: 'GTM-ABC123' })
  assert.equal(r.needsDecision, false)
  const l = layer(e.win)
  const iDefault = l.findIndex((x) => Array.isArray(x) && x[1] === 'default')
  const iUpdate = l.findIndex((x) => Array.isArray(x) && x[1] === 'update')
  const iGtm = l.findIndex((x) => x && x.event === 'gtm.js')
  assert.ok(iDefault === 0 && iUpdate > iDefault && iGtm > iUpdate)
  assert.equal(e.scripts.length, 1)
})

test('banner has Accept all, Reject all and Preferences; preferences has Analytics and Marketing switches that start off; footer link re-opens it', () => {
  const ui = read('src/components/ConsentManager.jsx')
  for (const label of ['Accept all', 'Reject all', 'Preferences', 'Save preferences', 'Analytics', 'Marketing', 'Necessary']) assert.ok(ui.includes(label), label)
  assert.match(ui, /role="switch"/)
  assert.match(ui, /aria-modal="true"/)
  assert.match(ui, /useState\(initial\.analytics\)/); assert.match(ui, /useState\(initial\.marketing\)/)
  assert.ok(/getConsentChoice\(\)/.test(ui), 'the dialog starts from the saved choice, which is denied by default')
  assert.match(read('src/components/CookieSettingsLink.jsx'), /OPEN_CONSENT_EVENT/)
  assert.match(read('src/components/Footer.jsx'), /<CookieSettingsLink/)
  assert.match(read('src/main.jsx'), /initConsent\(/)
  assert.match(read('src/main.jsx'), /createRoot\(host\)/, 'the banner mounts in its own root, not inside the hydrated app')
})

test('every conversion event the owner listed still exists exactly where it was coded', () => {
  const where = {
    roadmap_form_started: 'src/components/roadmap/RoadmapApplication.jsx',
    roadmap_application_submitted: 'src/components/roadmap/RoadmapApplication.jsx',
    roadmap_qualified: 'src/components/roadmap/RoadmapApplication.jsx',
    calendar_newtab_click: 'src/components/roadmap/RoadmapBooking.jsx', // the link-out click (a completed booking is no longer observable: roadmap_booking_confirmed was retired 27 Nov 2026)
    risk_free_application_success: 'src/components/riskfree/RiskFreeApplication.jsx',
    hooks_signup_success: 'src/components/hooks/HooksSignupCard.jsx',
    referral_application_success: 'src/components/referrals/ReferralForm.jsx',
    vsl_play: 'src/components/roadmap/RoadmapVideo.jsx',
    vsl_complete: 'src/components/scale/ScaleHero.jsx',
    primary_cta_click: 'src/components/scale/ScaleCtaButton.jsx',
  }
  for (const [ev, file] of Object.entries(where)) assert.ok(read(file).includes(ev), `${ev} in ${file}`)
})
