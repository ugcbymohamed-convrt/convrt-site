// Run with: node --test tests/trust-privacy-implementation.test.mjs
// Trust pages, privacy and attribution implementation (Nov 2026): operator identity, company LinkedIn, About/Contact/Privacy/Terms content,
// advertising click identifiers no longer stored, marketing consent kept apart from cookie consent, and a SIMULATION of the published state so the
// publication switch is proven safe before anyone flips it. Nothing here touches the network.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, TRUST_PAGES_PUBLISHED, LEGAL_NOTICE_DETAILS_APPROVED,
  COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL, INSTAGRAM_URL, BOOKING_URL, CONTACT_EMAIL,
} from '../src/config.js'
import { TRUST_CONTENT, plainText, ownerMarkersIn, operatorDetails } from '../src/content/trustPages.js'
import { OPERATOR } from '../src/content/operator.js'
import { BRAND } from '../src/seo/businessKnowledge.js'
import { organizationNode } from '../src/seo/structuredData.js'
import { LEGAL_ENTITY, CONVRT_ADDRESS } from '../src/content/creatorLegal.js'
import { captureAttribution, withUtm, ATTRIBUTION_STORAGE_KEY } from '../src/lib/analytics.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])
const SRC_FILES = walk('src').filter((f) => /\.(js|jsx)$/.test(f))

const page = (k) => plainText(TRUST_CONTENT[k])
const headings = (k) => TRUST_CONTENT[k].sections.map((s) => s.heading)

/* ───────── operator identity ───────── */

test('operator facts are the owner-confirmed ones and live in one module shared with the creator agreements', () => {
  assert.equal(OPERATOR.tradingName, 'CONVRT Studio')
  assert.equal(OPERATOR.name, 'Mohamed Doukkali Azizi')
  assert.match(OPERATOR.structure, /self-employed professional \(autónomo\) registered in Spain/)
  assert.equal(BRAND.founder.jobTitle, 'Founder')
  assert.equal(LEGAL_ENTITY.name, OPERATOR.name)
  assert.equal(LEGAL_ENTITY.taxId, OPERATOR.taxId)
  assert.equal(CONVRT_ADDRESS, OPERATOR.address)
})

test('the legally required operator details are present in the legal notice: name, structure, email and a second direct way to reach us; NIF and address only after approval, otherwise a visible marker', () => {
  const lines = operatorDetails().join('\n')
  assert.match(lines, /Trading name: CONVRT Studio/)
  assert.match(lines, /Operator: Mohamed Doukkali Azizi, a self-employed professional/)
  assert.ok(lines.includes(CONTACT_EMAIL))
  assert.ok(lines.includes(BOOKING_URL) && lines.includes(COMPANY_LINKEDIN_URL), 'a second means of direct contact')
  if (LEGAL_NOTICE_DETAILS_APPROVED) {
    assert.ok(lines.includes(OPERATOR.taxId) && lines.includes(OPERATOR.address))
  } else {
    assert.ok(!lines.includes(OPERATOR.taxId) && !lines.includes('Gibraltar'))
    assert.equal((lines.match(/\[OWNER TO CONFIRM: show the operator’s/g) || []).length, 2, 'both missing items are flagged')
  }
  // the notice appears in the Terms and the same details lead the Privacy Policy
  assert.ok(headings('terms')[0] === 'Legal notice')
  assert.ok(page('privacy').includes('Operator: Mohamed Doukkali Azizi'))
})

test('the owner decision "no public phone number or office hours" holds on every trust page', () => {
  for (const k of ['about', 'contact', 'privacy', 'terms']) {
    assert.ok(!/\b(phone|telephone|tel\.|whatsapp|office hours|opening hours)\b/i.test(page(k)), k)
  }
  assert.ok(!/telephone|contactPoint.*phone/i.test(JSON.stringify(organizationNode())))
})

test('exclusively B2B: stated on the About, Terms and Privacy pages', () => {
  assert.match(page('about'), /We work with businesses only/)
  assert.match(page('terms'), /offered to businesses only/)
  assert.match(page('privacy'), /offered to businesses, not to consumers/)
})

/* ───────── LinkedIn: company page versus founder profile ───────── */

test('company LinkedIn is the confirmed page; the founder profile is a different URL', () => {
  assert.equal(COMPANY_LINKEDIN_URL, 'https://www.linkedin.com/company/123164137/')
  assert.match(FOUNDER_LINKEDIN_URL, /linkedin\.com\/in\//)
  assert.notEqual(COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL)
  assert.equal(BRAND.founder.linkedin, FOUNDER_LINKEDIN_URL)
})

test('footer: ONE LinkedIn icon, and it is the company page (the founder profile is not presented as the company)', () => {
  const footer = read('src/components/Footer.jsx')
  assert.equal((footer.match(/linkedin/gi) || []).length >= 1, true)
  assert.equal((footer.match(/label="[^"]*LinkedIn"/g) || []).length, 1, 'no duplicate LinkedIn icons')
  assert.match(footer, /href=\{COMPANY_LINKEDIN_URL\} label="CONVRT on LinkedIn"/)
  assert.ok(!footer.includes('linkedin.com/in/') && !footer.includes('FOUNDER_LINKEDIN_URL'), 'no founder profile in the footer')
  assert.match(footer, /href=\{INSTAGRAM_URL\}/)
})

test('About and Contact show the company page and, separately labelled, the founder profile', () => {
  for (const k of ['about', 'contact']) {
    const raw = JSON.stringify(TRUST_CONTENT[k])
    assert.ok(raw.includes(COMPANY_LINKEDIN_URL), `${k}: company page`)
    assert.ok(raw.includes(FOUNDER_LINKEDIN_URL), `${k}: founder profile kept`)
  }
  assert.match(page('contact'), /CONVRT Studio on LinkedIn: official company page/)
  assert.match(page('contact'), /Mohamed Doukkali Azizi on LinkedIn \(personal profile\)/)
  assert.ok(JSON.stringify(TRUST_CONTENT.contact).includes(INSTAGRAM_URL))
})

test('Organization structured data: sameAs is Instagram + the company LinkedIn page, never the founder profile; the founder keeps his own Person profile', () => {
  const org = organizationNode()
  assert.deepEqual(org.sameAs, [INSTAGRAM_URL, COMPANY_LINKEDIN_URL])
  assert.ok(!org.sameAs.includes(FOUNDER_LINKEDIN_URL))
  assert.match(read('src/seo/structuredData.js'), /jobTitle: BRAND\.founder\.jobTitle, sameAs: \[BRAND\.founder\.linkedin\]/)
})

/* ───────── About and Contact content ───────── */

test('About: services, founder-led model, in-house and freelance creators, how creators are chosen and approved, languages, performance focus; nothing invented', () => {
  const a = page('about')
  for (const s of ['UGC video ads', 'SaaS video production', 'Spokesperson videos', 'Organic social video']) assert.ok(a.includes(s), s)
  assert.match(a, /founder-led creative studio/)
  assert.match(a, /in-house talent and freelance creators/)
  assert.match(a, /Creator selection is based on your campaign goals, target audience and approved creative concepts/)
  assert.match(a, /CONVRT decides which creators it works with/)
  assert.match(a, /only when that creator has agreed and CONVRT has approved it/)
  assert.match(a, /English, Spanish, French and Arabic/)
  assert.match(a, /performance-driven/)
  assert.ok(!/\b(team of \d+|\d+\+? (employees|clients|creators|brands)|offices?|headquarter|award|certified|former|previously|graduat|degree|years of experience)\b/i.test(a), 'no invented people, offices, credentials or numbers')
  assert.ok(!/\b(he|she|his|her|him)\b/i.test(a))
})

test('Contact: email, Calendly, company LinkedIn, Instagram, creator and referral links; no form, phone or address', () => {
  const raw = JSON.stringify(TRUST_CONTENT.contact)
  for (const must of [`mailto:${CONTACT_EMAIL}`, BOOKING_URL, COMPANY_LINKEDIN_URL, INSTAGRAM_URL, 'forms.gle', '/referrals']) assert.ok(raw.includes(must), must)
  assert.ok(!/<form|contact form|crm/i.test(page('contact')))
  assert.ok(!page('contact').includes('Almería') && !page('contact').includes(OPERATOR.taxId))
})

/* ───────── Privacy Policy ───────── */

test('Privacy: covers every required topic', () => {
  const h = headings('privacy').join(' | ')
  for (const topic of [
    'Who is responsible', 'What we collect', 'Marketing emails', 'Booking a call', 'Cookies and similar', 'Analytics',
    'Who we share information with', 'Transfers outside the European Economic Area', 'How long we keep it', 'Your rights',
  ]) assert.ok(h.includes(topic), topic)
  const p = page('privacy')
  for (const s of ['Free ad hooks', 'Free video application', 'Referral Partner Program', 'Free Creative Growth Roadmap', 'withdraw', 'Agencia Española de Protección de Datos (AEPD)', 'www.aepd.es']) assert.ok(p.includes(s), s)
  for (const provider of ['MailerLite', 'Resend', 'Calendly', 'Vercel', 'Cloudflare', 'Google Tag Manager', 'Google Analytics']) assert.ok(p.includes(provider), provider)
  assert.match(p, /We do not use any other customer database/)
})

test('Privacy: marketing email consent is described exactly as implemented', () => {
  const p = page('privacy')
  assert.match(p, /only if you tick the optional box/)
  assert.match(p, /never ticked for you/)
  assert.match(p, /submit every form without ticking it/)
  assert.match(p, /the date and time, which form you used and the version of the wording/)
  assert.match(p, /We keep applications and requests separate from our marketing list/)
  assert.match(p, /Receiving the hooks does not add you to our marketing list/)
  assert.match(p, /withdraw your consent at any time/)
  // the wording quoted is the live wording, and the version named is the live version
  const src = read('src/content/marketingConsent.js')
  assert.ok(p.includes('Also email me occasional creative tips and offers from CONVRT.'))
  assert.match(src, /CURRENT_MARKETING_CONSENT_VERSION = 'v2'/)
  assert.ok(p.includes('currently v2'))
  // implementation facts the paragraph relies on
  const marketing = read('api/_lib/marketing.js')
  for (const key of ['marketing_consent_at', 'marketing_consent_version', 'marketing_consent_source']) assert.ok(marketing.includes(key), key)
})

test('Privacy: retention periods are the owner proposals, flagged for legal review, and no deletion routine is claimed to exist', () => {
  const sec = TRUST_CONTENT.privacy.sections.find((s) => s.heading === 'How long we keep it')
  const t = plainText({ h1: '', intro: '', sections: [sec] })
  assert.match(t, /12 months after our last meaningful contact/)
  assert.match(t, /Booking records: 12 months, unless an ongoing business relationship/)
  assert.match(t, /until you withdraw your consent or unsubscribe, with a periodic review/)
  assert.match(t, /as long as Spanish law requires/)
  assert.match(t, /Google Analytics event data: 14 months/)
  assert.match(t, /\[LEGAL REVIEW: these periods are proposals/)
  assert.match(t, /No automated deletion exists yet/)
})

test('Privacy: no invented data-processing agreements, transfer safeguards or provider storage locations', () => {
  const p = page('privacy')
  assert.ok(!/we have (signed )?data[- ]processing (agreements|addenda)/i.test(p))
  assert.ok(!/(servers?|data) (is|are) (stored|located|hosted) (in|within) (the )?(EU|European|Germany|Frankfurt|United States|US|Ireland)/i.test(p))
  assert.ok(!/standard contractual clauses (with|from|apply)/i.test(p.replace(/for example an adequacy decision[^\]]*\]/, '')))
  // each of those facts is an open owner marker instead
  const markers = ownerMarkersIn(TRUST_CONTENT.privacy).join(' ')
  assert.match(markers, /data-processing terms that apply to your account/)
  assert.match(markers, /where it stores and processes the information and the safeguard it relies on/)
})

test('Privacy: every browser-storage key in the code is disclosed, and no undisclosed one exists', () => {
  const keys = new Set()
  for (const f of SRC_FILES.filter((x) => !/creator|Creator/.test(x))) {
    for (const m of read(f).matchAll(/['"`](convrt_[a-z0-9_]+)['"`]/g)) keys.add(m[1])
  }
  const p = page('privacy')
  assert.ok(keys.size >= 4, [...keys].join(', '))
  for (const k of keys) assert.ok(p.includes(k), `${k} must be listed in the Privacy Policy`)
  assert.ok(p.includes('convrt_scale_attribution (this browser tab only)'))
  assert.match(p, /do not store advertising click identifiers \(such as gclid or fbclid\)/)
})

test('Privacy: the Google Analytics statements match the owner-confirmed GA4 settings and carry an owner check', () => {
  const p = page('privacy')
  assert.match(p, /switched off Google signals and the collection of user-provided data/)
  assert.match(p, /keeps event-level data for 14 months/)
  assert.match(p, /never include your name, email address or anything you type into a form/)
  assert.match(ownerMarkersIn(TRUST_CONTENT.privacy).join(' '), /Google’s data-processing terms have been accepted/)
})

/* ───────── Terms of Service ───────── */

test('Terms of Service: every required topic, liability and governing law flagged for Spanish legal review, no invented contract', () => {
  const h = headings('terms').join(' | ')
  for (const topic of [
    'Legal notice', 'Using the website', 'Enquiries and applications', 'Free creative concepts offer', 'Free Video Production eligibility',
    'Website content and intellectual property', 'No guarantee of results', 'Liability', 'Governing law and disputes', 'Website terms and signed client agreements',
  ]) assert.ok(h.includes(topic), topic)
  assert.equal(TRUST_CONTENT.terms.h1, 'Terms of Service')
  const t = page('terms')
  assert.match(t, /Sending an enquiry or application does not create a contract/)
  assert.match(t, /\[LEGAL REVIEW: the limitation of liability/)
  assert.match(t, /\[LEGAL REVIEW: governing law/)
  assert.match(t, /governed by Spanish law/)
  assert.match(t, /If a signed agreement conflicts with these terms, the signed agreement prevails for that project/)
  assert.match(t, /A standard Client Service Agreement does not exist yet/)
  assert.ok(!/(payment terms|net \d+|invoice(s)? (are|is) due|cancellation fee|revision(s)? (are|is) included|late fee|termination for)/i.test(t), 'no invented client-agreement provisions in the website terms')
  assert.ok(!/(guarantee|promise)s? (sales|leads|roas|return|growth)/i.test(t.replace(/never guarantee[^.]*\./g, '')))
})

test('the B2B Client Service Agreement is an unpublished outline only: no route, no page, no link, not in the sitemap', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/client-service-agreement-outline.md')))
  const routes = read('src/routes.js')
  assert.ok(!/client-?service|service-?agreement/i.test(routes))
  assert.ok(!/client-?service-?agreement/i.test(read('vercel.json')))
  for (const f of SRC_FILES) assert.ok(!/client-service-agreement/i.test(read(f)), f)
})

/* ───────── publication safety ───────── */

test('draft state: unpublished, noindex, no form privacy link; the legal-notice gate is closed', () => {
  assert.equal(TRUST_PAGES_PUBLISHED, false)
  assert.equal(LEGAL_NOTICE_DETAILS_APPROVED, false)
  const markers = Object.values(TRUST_CONTENT).flatMap(ownerMarkersIn)
  assert.ok(markers.length > 10, 'markers are listed')
  if (TRUST_PAGES_PUBLISHED) assert.equal(LEGAL_NOTICE_DETAILS_APPROVED, true, 'cannot publish without the legally required details')
})

test('publication prep: a SIMULATED published build makes all four pages indexable with self-canonicals, sitemap entries, footer and form links, and the founder Person', async () => {
  // Copy src into node_modules (so bare imports still resolve), flip the two flags in the copy, import the copy. The real config is never touched.
  const sim = path.join(ROOT, 'node_modules/.convrt-publish-sim')
  fs.rmSync(sim, { recursive: true, force: true })
  fs.cpSync(path.join(ROOT, 'src'), path.join(sim, 'src'), { recursive: true })
  const cfgPath = path.join(sim, 'src/config.js')
  fs.writeFileSync(cfgPath, fs.readFileSync(cfgPath, 'utf8')
    .replace('TRUST_PAGES_PUBLISHED = false', 'TRUST_PAGES_PUBLISHED = true')
    .replace('LEGAL_NOTICE_DETAILS_APPROVED = false', 'LEGAL_NOTICE_DETAILS_APPROVED = true'))
  try {
    const url = (f) => pathToFileURL(path.join(sim, f)).href
    const cfg = await import(url('src/config.js'))
    const seo = await import(url('src/seo/siteSeo.js'))
    const sd = await import(url('src/seo/structuredData.js'))
    const content = await import(url('src/content/trustPages.js'))
    assert.equal(cfg.PRIVACY_POLICY_URL, '/privacy', 'every form links the privacy policy')
    for (const p of [ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH]) {
      const head = seo.pageHead(p)
      assert.equal(head.noindex, false, `${p} indexable`)
      assert.equal(head.robots, undefined, `${p} no robots override`)
      assert.equal(head.url, `https://www.convrt.studio${p}`, `${p} self-referencing canonical`)
      assert.ok(seo.sitemapRoutes().includes(p), `${p} in the sitemap`)
    }
    const org = sd.organizationNode()
    assert.equal(org.founder.name, 'Mohamed Doukkali Azizi')
    assert.deepEqual(org.founder.sameAs, [FOUNDER_LINKEDIN_URL])
    assert.deepEqual(org.sameAs, [INSTAGRAM_URL, COMPANY_LINKEDIN_URL])
    // with the details approved the legal notice carries the NIF and address
    const notice = content.operatorDetails().join('\n')
    assert.ok(notice.includes(OPERATOR.taxId) && notice.includes(OPERATOR.address))
    // the remaining blockers are exactly the owner/legal markers (the guard in tests/trust-pages.test.mjs refuses to publish until none is left)
    const left = Object.values(content.TRUST_CONTENT).flatMap(content.ownerMarkersIn)
    assert.ok(left.length > 0, 'the simulation shows what still blocks publication')
    assert.ok(!left.some((m) => /show the operator’s/.test(m)), 'the legal-notice markers disappear once the details are approved')
  } finally {
    fs.rmSync(sim, { recursive: true, force: true })
  }
})

test('activation script (dry run) reports the blockers and changes nothing', async () => {
  const before = [read('src/config.js'), read('vercel.json')]
  const { checkActivation } = await import('../scripts/activate-trust-pages.mjs')
  const report = await checkActivation(ROOT)
  assert.equal(report.ready, false)
  assert.ok(report.blockers.some((b) => /OWNER TO CONFIRM|LEGAL REVIEW/.test(b)))
  assert.ok(report.blockers.some((b) => /LEGAL_NOTICE_DETAILS_APPROVED/.test(b)))
  assert.deepEqual([read('src/config.js'), read('vercel.json')], before)
})

/* ───────── advertising click identifiers ───────── */

function withBrowser(search, stored, fn) {
  const store = new Map(stored === undefined ? [] : [[ATTRIBUTION_STORAGE_KEY, JSON.stringify(stored)]])
  const sessionStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  }
  const prev = globalThis.window
  globalThis.window = { location: { search, pathname: '/scale' }, sessionStorage }
  try {
    return fn(() => (store.has(ATTRIBUTION_STORAGE_KEY) ? JSON.parse(store.get(ATTRIBUTION_STORAGE_KEY)) : null))
  } finally {
    globalThis.window = prev
  }
}

test('click identifiers (gclid, fbclid, ttclid, wbraid, gbraid) are never written to storage; the five utm_ values still are', () => {
  withBrowser('?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=a&utm_term=ugc&gclid=G1&fbclid=F1&ttclid=T1&wbraid=W1&gbraid=B1', undefined, (read) => {
    captureAttribution()
    assert.deepEqual(read(), { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'spring', utm_content: 'a', utm_term: 'ugc' })
  })
})

test('a visit with only click identifiers stores nothing at all', () => {
  withBrowser('?gclid=G1&fbclid=F1', undefined, (read) => {
    captureAttribution()
    assert.equal(read(), null)
  })
})

test('click identifiers saved by an earlier version of the site in an open tab are removed; utm values survive', () => {
  withBrowser('', { utm_source: 'meta', gclid: 'OLD', fbclid: 'OLD2' }, (read) => {
    captureAttribution()
    assert.deepEqual(read(), { utm_source: 'meta' })
  })
  withBrowser('?gclid=NEW', { gclid: 'OLD' }, (read) => {
    captureAttribution()
    assert.equal(read(), null, 'only identifiers left → nothing is kept')
  })
})

test('a later page of the same visit without utm values keeps the stored campaign details', () => {
  withBrowser('', { utm_source: 'meta', utm_campaign: 'x' }, (read) => {
    captureAttribution()
    assert.deepEqual(read(), { utm_source: 'meta', utm_campaign: 'x' })
  })
})

test('booking links and /scale attribution keep working: utm values are appended, click identifiers never are', () => {
  withBrowser('?utm_source=google&utm_campaign=spring&gclid=G1', undefined, () => {
    captureAttribution()
    const url = withUtm(BOOKING_URL)
    assert.equal(url, `${BOOKING_URL}?utm_source=google&utm_campaign=spring`)
    assert.ok(!/gclid|fbclid|ttclid|wbraid|gbraid/.test(url))
    assert.equal(withUtm(`${BOOKING_URL}?hide=1#x`), `${BOOKING_URL}?hide=1&utm_source=google&utm_campaign=spring#x`)
  })
  withBrowser('', undefined, () => assert.equal(withUtm(BOOKING_URL), BOOKING_URL))
})

test('code audit: no reader or writer of the attribution store touches click identifiers (only the one-time cleanup names them)', () => {
  const users = SRC_FILES.filter((f) => /gclid|fbclid|ttclid|wbraid|gbraid/.test(read(f)))
  // analytics.js (one-time cleanup) and the Privacy Policy text that says they are not stored
  assert.deepEqual(users.sort(), [path.join('src', 'content', 'trustPages.js'), path.join('src', 'lib', 'analytics.js')], users.join(', '))
  const a = read('src/lib/analytics.js')
  assert.match(a, /const LEGACY_CLICK_ID_KEYS = \['gclid', 'fbclid', 'ttclid', 'wbraid', 'gbraid'\]/)
  assert.ok(!/CLICK_ID_KEYS\)/.test(a.replace(/LEGACY_CLICK_ID_KEYS\.some/, '')), 'the list is only used for cleanup')
  const readers = SRC_FILES.filter((f) => f !== path.join('src', 'content', 'trustPages.js') && /convrt_scale_attribution|ATTRIBUTION_STORAGE_KEY/.test(read(f)))
  assert.deepEqual(readers.sort(), [path.join('src', 'lib', 'analytics.js')].sort(), 'one module owns the store')
})

/* ───────── marketing consent kept apart from cookie/analytics consent ───────── */

test('marketing-email consent and cookie consent are independent code paths and say so', () => {
  const box = read('src/components/forms/MarketingConsent.jsx')
  assert.ok(!/consent\.js|setConsent|isTrackingAllowed|dataLayer|gtag/.test(box.replace(/marketingConsent\.js/g, '')), 'the email checkbox never touches cookie consent')
  const consent = read('src/lib/consent.js')
  assert.ok(!/marketingConsent|marketing_consent|MARKETING_GROUP|mailerlite/i.test(consent), 'cookie consent never touches email consent')
  const banner = read('src/components/ConsentManager.jsx')
  assert.match(banner, /marketing emails are a separate choice on our forms/)
  assert.match(page('privacy'), /The cookie choices are about cookies only; marketing emails are a separate choice on our forms/)
})
