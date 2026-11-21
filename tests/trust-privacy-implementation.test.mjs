// Run with: node --test tests/trust-privacy-implementation.test.mjs
// Trust pages, privacy and attribution implementation (Nov 2026): operator identity, company LinkedIn, About/Contact/Privacy/Terms content,
// advertising click identifiers no longer stored, marketing consent kept apart from cookie consent, and a SIMULATION of the published state so the
// publication switch is proven safe before anyone flips it. Nothing here touches the network.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { readSource } from './helpers/i18nSource.mjs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH, TRUST_PAGES_PUBLISHED, LEGAL_NOTICE_DETAILS_APPROVED,
  COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL, INSTAGRAM_URL, BOOKING_URL, CONTACT_EMAIL,
} from '../src/config.js'
import { TRUST_CONTENT, plainText, ownerMarkersIn, operatorDetails } from '../src/content/trustPages.js'
import { OPERATOR } from '../src/content/operator.js'
import { BRAND } from '../src/seo/businessKnowledge.js'
import { organizationNode } from '../src/seo/structuredData.js'
import { pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { LEGAL_ENTITY, CONVRT_ADDRESS } from '../src/content/creatorLegal.js'
import { captureAttribution, withUtm, ATTRIBUTION_STORAGE_KEY } from '../src/lib/analytics.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readSource(path.join(ROOT, p))
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

test('the legally required operator details (LSSI art. 10) are in the Legal Notice: name, structure, tax ID, postal address, email and a second direct way to reach us', () => {
  const lines = operatorDetails().join('\n')
  assert.match(lines, /Trading name: CONVRT Studio/)
  assert.match(lines, /Operator: Mohamed Doukkali Azizi, a self-employed professional/)
  assert.ok(lines.includes(CONTACT_EMAIL))
  assert.ok(lines.includes(BOOKING_URL) && lines.includes(COMPANY_LINKEDIN_URL), 'a second means of direct contact')
  assert.equal(LEGAL_NOTICE_DETAILS_APPROVED, true, 'the owner approved showing the tax ID and address (21 Nov 2026)')
  assert.ok(lines.includes(OPERATOR.taxId) && lines.includes(OPERATOR.address))
  assert.ok(!/\[OWNER TO CONFIRM/.test(lines))
  // they appear on the Legal Notice and in the Privacy Policy's controller identity, and are kept off the Contact page
  assert.ok(page('legalNotice').includes(OPERATOR.taxId) && page('legalNotice').includes(OPERATOR.address))
  assert.ok(page('privacy').includes('Operator: Mohamed Doukkali Azizi'))
  assert.ok(!page('contact').includes(OPERATOR.taxId) && !page('contact').includes('Almería'), 'Legal Notice stays distinct from Contact')
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
    'Who is responsible', 'What we collect', 'Marketing emails', 'Booking a call', 'Cookies and browser storage', 'Browser storage we use', 'Analytics',
    'Who we share information with', 'Transfers outside the European Economic Area', 'How long we keep it', 'Your rights',
  ]) assert.ok(h.includes(topic), topic)
  const p = page('privacy')
  for (const s of ['Free ad hooks', 'Free video application', 'Referral Partner Program', 'Free Creative Growth Roadmap', 'withdraw', 'Agencia Española de Protección de Datos (AEPD)', 'www.aepd.es']) assert.ok(p.includes(s), s)
  for (const provider of ['MailerLite', 'Resend', 'Calendly', 'Vercel', 'Cloudflare', 'Google Tag Manager', 'Google Analytics']) assert.ok(p.includes(provider), provider)
  assert.match(p, /We have no other customer database or CRM/)
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

test('Privacy: retention periods are stated plainly (owner proposals, now applied through periodic review); GA4 14 months', () => {
  const sec = TRUST_CONTENT.privacy.sections.find((s) => s.heading === 'How long we keep it')
  const t = plainText({ h1: '', intro: '', sections: [sec] })
  assert.match(t, /12 months after our last meaningful contact/)
  assert.match(t, /Booking records: 12 months, unless an ongoing business relationship/)
  assert.match(t, /until you withdraw your consent or unsubscribe, with a periodic review/)
  assert.match(t, /as long as Spanish law requires/)
  assert.match(t, /event and user data \(once analytics is on\): 14 months/)
  assert.match(t, /by reviewing our records periodically/)
  assert.ok(!/automatic(ally)? delet|automated delet/i.test(t), 'no automated deletion is claimed')
})

test('Privacy: no unverified agreements, safeguards or storage locations are claimed', () => {
  const p = page('privacy')
  assert.ok(!/we have (signed )?data[- ]processing (agreements|addenda)/i.test(p))
  assert.ok(!/(MailerLite|Vercel|Google)[^.]*(stores?|stored|located|hosted) (in|within) (the )?(EU|European|Germany|Ireland|United States)/i.test(p), 'no location claimed for MailerLite, Vercel or Google')
  // safeguards are attributed to the providers' own documents, and the unconfirmed providers are named as unconfirmed
  assert.match(p, /According to their own published documentation, Resend stores customer data in the United States/)
  assert.match(p, /For MailerLite, Vercel and Google we have not independently confirmed/)
  assert.ok(!/MailerLite[^.]*(Data Privacy Framework|Standard Contractual)/.test(p))
  assert.ok(!/legal review|reviewed by (a )?(lawyer|solicitor|legal adviser)|legally (approved|validated)|GDPR[- ]compliant/i.test(Object.values(TRUST_CONTENT).map(plainText).join('\n')), 'no fake legal-review claims on the pages')
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

test('Privacy: the Google Analytics statements match the confirmed GA4 settings and the real state of the build', () => {
  const p = page('privacy')
  assert.match(p, /Google signals off, collection of user-provided data off, automatic form-interaction tracking off, browser-history page views off/)
  assert.match(p, /event and user data kept for 14 months with "reset on new activity" off/)
  assert.match(p, /never include your name, email address or anything you type into a form/)
  assert.ok(!ownerMarkersIn(TRUST_CONTENT.privacy).length)
  // This test build has no GTM id, so the policy says analytics is NOT active and no cookie banner exists yet (Production's real state).
  assert.match(p, /Google Analytics, through Google Tag Manager, is not active on this website today/)
  assert.match(p, /sets no analytics or advertising cookies and shows no cookie banner/)
  assert.ok(!/Cookie settings" link in the footer/.test(p))
})

/* ───────── Terms of Service ───────── */

test('Terms of Service: every required topic, Spanish law stated, no invented contract, no open markers', () => {
  const h = headings('terms').join(' | ')
  for (const topic of [
    'Using the website', 'Enquiries and applications', 'Free creative concepts offer', 'Free Video Production eligibility',
    'Website content and intellectual property', 'No guarantee of results', 'Liability', 'Governing law and disputes', 'Website terms and signed client agreements',
  ]) assert.ok(h.includes(topic), topic)
  assert.equal(TRUST_CONTENT.terms.h1, 'Terms of Service')
  const t = page('terms')
  assert.match(t, /Sending an enquiry or application does not create a contract/)
  assert.match(t, /governed by Spanish law/)
  assert.match(t, /competent Spanish courts/)
  assert.match(t, /If a signed agreement conflicts with these terms, the signed agreement prevails for that project/)
  assert.ok(!/(payment terms|net \d+|invoice(s)? (are|is) due|cancellation fee|revision(s)? (are|is) included|late fee|termination for)/i.test(t), 'no invented client-agreement provisions in the website terms')
  assert.ok(!/(guarantee|promise)s? (sales|leads|roas|return|growth)/i.test(t.replace(/never guarantee[^.]*\./g, '')))
  assert.deepEqual(ownerMarkersIn(TRUST_CONTENT.terms), [])
})

test('Legal Notice (Aviso Legal): its own page with the LSSI art. 10 information, distinct from Contact', () => {
  const h = headings('legalNotice').join(' | ')
  for (const topic of ['Website operator', 'Activity and audience', 'Prices and taxes', 'Intellectual property', 'Personal data and cookies', 'applicable law and jurisdiction']) assert.ok(h.includes(topic), topic)
  const t = page('legalNotice')
  assert.match(t, /Ley 34\/2002/)
  assert.match(t, /Tax identification number \(NIF\): /)
  assert.match(t, /Postal address: /)
  assert.match(t, /offered to businesses only/)
  assert.match(t, /prices exclude VAT/i)
  assert.deepEqual(ownerMarkersIn(TRUST_CONTENT.legalNotice), [])
  assert.equal(LEGAL_NOTICE_PATH, '/legal-notice')
  assert.ok(JSON.stringify(TRUST_CONTENT.contact).includes(`${LEGAL_NOTICE_PATH}`), 'Contact points to the Legal Notice')
})

test('the B2B Client Service Agreement is an unpublished outline only: no route, no page, no link, not in the sitemap', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/client-service-agreement-outline.md')))
  const routes = read('src/routes.js')
  assert.ok(!/client-?service|service-?agreement/i.test(routes))
  assert.ok(!/client-?service-?agreement/i.test(read('vercel.json')))
  for (const f of SRC_FILES) assert.ok(!/client-service-agreement/i.test(read(f)), f)
})

/* ───────── publication safety ───────── */

test('published state: flags on, no open marker anywhere, the legally required details approved', () => {
  assert.equal(TRUST_PAGES_PUBLISHED, true)
  assert.equal(LEGAL_NOTICE_DETAILS_APPROVED, true)
  assert.deepEqual(Object.values(TRUST_CONTENT).flatMap(ownerMarkersIn), [])
  assert.equal(PRIVACY_POLICY_URL_CHECK(), '/privacy')
})

function PRIVACY_POLICY_URL_CHECK() {
  return /export const PRIVACY_POLICY_URL = TRUST_PAGES_PUBLISHED \? PRIVACY_PATH : ''/.test(read('src/config.js')) ? '/privacy' : ''
}

test('every form and the cookie preferences link the Privacy Policy, and the footer links all five pages', () => {
  for (const f of ['src/components/roadmap/RoadmapApplication.jsx', 'src/components/referrals/ReferralForm.jsx', 'src/components/hooks/HooksSignupCard.jsx', 'src/components/riskfree/RiskFreeApplication.jsx', 'src/components/ConsentManager.jsx']) {
    assert.match(read(f), /PRIVACY_POLICY_URL/, f)
  }
  const footer = read('src/components/Footer.jsx')
  for (const p of ['ABOUT_PATH', 'PRIVACY_PATH', 'TERMS_PATH', 'LEGAL_NOTICE_PATH', 'CONTACT_PATH']) assert.ok(footer.includes(`href={${p}}`) || footer.includes(`href={h(${p})}`) || footer.includes(`? ${p} :`) || footer.includes(`? h(${p}) :`), p)
})

async function importSim(flags, dirName) {
  // Copy src into node_modules (so bare imports still resolve), set flags in the copy, import the copy. The real files are never touched.
  const sim = path.join(ROOT, 'node_modules', dirName)
  fs.rmSync(sim, { recursive: true, force: true })
  fs.cpSync(path.join(ROOT, 'src'), path.join(sim, 'src'), { recursive: true })
  const cfgPath = path.join(sim, 'src/config.js')
  let cfg = fs.readFileSync(cfgPath, 'utf8')
  for (const [k, v] of Object.entries(flags)) cfg = cfg.replace(new RegExp(`${k} = (true|false)`), `${k} = ${v}`)
  fs.writeFileSync(cfgPath, cfg)
  return sim
}

test('SIMULATED draft build (flags off) still works: pages noindex, no markers hidden, legal details withheld behind a visible marker', async () => {
  const sim = await importSim({ TRUST_PAGES_PUBLISHED: false, LEGAL_NOTICE_DETAILS_APPROVED: false }, '.convrt-draft-sim')
  try {
    const url = (f) => pathToFileURL(path.join(sim, f)).href
    const seo = await import(url('src/seo/siteSeo.js'))
    const content = await import(url('src/content/trustPages.js'))
    for (const p of [ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH]) {
      const h = seo.pageHead(p)
      assert.ok(h.noindex === true || /noindex/.test(h.robots || ''), p)
      assert.ok(!seo.sitemapRoutes().includes(p), p)
    }
    const left = Object.values(content.TRUST_CONTENT).flatMap(content.ownerMarkersIn)
    assert.ok(left.length >= 2 && left.every((m) => /show the operator’s/.test(m)), 'only the hidden-details markers remain')
    assert.ok(!content.operatorDetails().join('\n').includes(OPERATOR.taxId))
  } finally {
    fs.rmSync(sim, { recursive: true, force: true })
  }
})

test('SIMULATED build with analytics ON (VITE_GTM_ID set): the Privacy Policy describes the cookie banner, consent and cookie settings instead of "not active"', async () => {
  const sim = await importSim({}, '.convrt-analytics-sim')
  const consentPath = path.join(sim, 'src/lib/consent.js')
  fs.writeFileSync(consentPath, fs.readFileSync(consentPath, 'utf8').replace("export const GTM_ID = validGtmId(import.meta.env?.VITE_GTM_ID)", "export const GTM_ID = validGtmId('GTM-TEST1234')"))
  try {
    const content = await import(pathToFileURL(path.join(sim, 'src/content/trustPages.js')).href)
    const p = content.plainText(content.TRUST_CONTENT.privacy)
    assert.match(p, /This website uses Google Analytics, through Google Tag Manager/)
    assert.match(p, /"Cookie settings" link in the footer/)
    assert.match(p, /only if you accept analytics cookies/)
    assert.ok(!/is not active on this website today/.test(p))
    assert.ok(!/shows no cookie banner/.test(p))
    // what does NOT depend on the build is identical
    assert.match(p, /Google signals off/)
    assert.match(p, /marketing emails are a separate choice on our forms/)
  } finally {
    fs.rmSync(sim, { recursive: true, force: true })
  }
})

test('published build: all five pages indexable with self-canonicals and sitemap entries; Organization carries the company LinkedIn and the founder Person; legal-notice details shown', () => {
  for (const p of [ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH]) {
    const head = pageHead(p)
    assert.equal(head.noindex, false, `${p} indexable`)
    assert.equal(head.robots, undefined, `${p} no robots override`)
    assert.equal(head.url, `https://www.convrt.studio${p}`, `${p} self-referencing canonical`)
    assert.ok(sitemapRoutes().includes(p), `${p} in the sitemap`)
    assert.ok(head.jsonLd && JSON.stringify(head.jsonLd).includes('BreadcrumbList'), `${p} has breadcrumbs`)
  }
  const org = organizationNode()
  assert.equal(org.founder.name, 'Mohamed Doukkali Azizi')
  assert.deepEqual(org.founder.sameAs, [FOUNDER_LINKEDIN_URL])
  assert.deepEqual(org.sameAs, [INSTAGRAM_URL, COMPANY_LINKEDIN_URL])
  assert.ok(!JSON.stringify(org).includes(OPERATOR.taxId), 'the tax id is shown on the page, not repeated in structured data')
})

test('the nine commercial pages stay indexable and in the sitemap', () => {
  const routes = sitemapRoutes()
  for (const p of ['/', '/pricing', '/ugc-video-agency', '/spokesperson-video-production', '/creator-showcase', '/case-studies/graspo', '/case-studies/elyon', '/scale', '/creative-growth-roadmap']) {
    if (p === '/scale' || p === '/creative-growth-roadmap') continue // gated pages are checked by their own suites
    assert.ok(routes.includes(p), p)
  }
})

test('activation script reports an already-published state with no open marker and changes nothing', async () => {
  const before = [read('src/config.js'), read('vercel.json')]
  const { checkActivation } = await import('../scripts/activate-trust-pages.mjs')
  const report = await checkActivation(ROOT)
  assert.deepEqual(report.blockers, ['TRUST_PAGES_PUBLISHED is already true'])
  assert.deepEqual([read('src/config.js'), read('vercel.json')], before)
  const v = JSON.parse(read('vercel.json'))
  assert.equal(v.headers.filter((h) => ['/about', '/contact', '/privacy', '/terms', '/legal-notice'].includes(h.source)).length, 0, 'no X-Robots-Tag rule left for the five pages')
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
