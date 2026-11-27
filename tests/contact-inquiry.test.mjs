// Run with: node --test tests/contact-inquiry.test.mjs  (the page checks read dist/: run `npm run build` first)
// General contact inquiry (Nov 2026): validation, the server handler (Resend only, labelled "General inquiry", never saved to MailerLite, no booking), and the four built Contact pages.
// Nothing here touches the network: Resend is a stub.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { processContact, sourcePageFor } from '../api/_lib/contact.js'
import { SERVICE_KEYS, BUDGET_KEYS, EMPTY_INQUIRY, normalizeInquiry, validateInquiry, normalizeWebsite, BUDGET_CURRENCY } from '../src/lib/contactInquiry.js'
import { CONTACT_COPY, errorText } from '../src/content/contactCopy.js'
import { BOOKING_URL, CONTACT_EMAIL, SITE_URL } from '../src/config.js'
import { SITE_SEO, sitemapRoutes } from '../src/seo/siteSeo.js'
import { SEO_BY_LOCALE } from '../src/i18n/seo.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(ROOT, 'dist')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const body = (h) => h.slice(h.indexOf('<body'))
const text = (h) => body(h).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').split('\n').map((s) => s.trim()).filter(Boolean).join('\n')

const GOOD = { fullName: 'Ada Lovelace', email: 'Ada@Example.com ', company: 'Analytical Engines', website: 'example.com', service: 'ugc', budget: '5k-20k', message: 'We would like three UGC concepts for our new app.', consent: true }

// ── validation ─────────────────────────────────────────────────────────────────────────────────────────────
test('a complete inquiry is valid and normalised (email lower-cased, website gets https://)', () => {
  assert.deepEqual(validateInquiry(GOOD), {})
  const n = normalizeInquiry(GOOD)
  assert.equal(n.email, 'ada@example.com'); assert.equal(n.website, 'https://example.com'); assert.equal(n.consent, true)
  assert.deepEqual(Object.keys(normalizeInquiry({})), Object.keys(EMPTY_INQUIRY))
})

test('required: name, email, brand or company, service, description and the consent box; website and budget are optional (no prospect is turned away for lacking a company website)', () => {
  assert.deepEqual(Object.keys(validateInquiry({})).sort(), ['company', 'consent', 'email', 'fullName', 'message', 'service'].sort())
  const minimal = { ...GOOD, website: '', budget: '' }
  assert.deepEqual(validateInquiry(minimal), {})
  // a social handle or profile link is accepted as the "website or social media" answer
  for (const w of ['@mybrand', 'instagram.com/mybrand', 'https://www.tiktok.com/@mybrand', 'linkedin.com/company/x']) assert.deepEqual(validateInquiry({ ...GOOD, website: w }), {}, w)
  assert.equal(normalizeWebsite('@mybrand'), '@mybrand')
  assert.equal(validateInquiry({ ...GOOD, website: 'not a website' }).website, 'invalid')
  assert.equal(validateInquiry({ ...GOOD, email: 'nope' }).email, 'invalid')
  assert.equal(validateInquiry({ ...GOOD, service: 'consulting' }).service, 'invalid')
  assert.equal(validateInquiry({ ...GOOD, budget: '1m' }).budget, 'invalid')
  assert.equal(validateInquiry({ ...GOOD, message: 'short' }).message, 'tooShort')
  assert.equal(validateInquiry({ ...GOOD, message: 'x'.repeat(2001) }).message, 'tooLong')
  assert.equal(validateInquiry({ ...GOOD, consent: 'yes' }).consent, 'required', 'consent must be the boolean true')
})

test('options: the six services and four budget bands, one translated label each, in every language; the budget currency follows the language (USD en/ar, EUR es/fr)', () => {
  assert.deepEqual(SERVICE_KEYS, ['ugc', 'spokesperson', 'organic', 'saas', 'custom', 'unsure'])
  assert.deepEqual(BUDGET_KEYS, ['under-5k', '5k-20k', '20k-plus', 'unsure'])
  assert.deepEqual(BUDGET_CURRENCY, { en: 'USD', ar: 'USD', es: 'EUR', fr: 'EUR' })
  for (const l of ['en', 'es', 'fr', 'ar']) {
    const c = CONTACT_COPY[l]
    assert.deepEqual(Object.keys(c.services), SERVICE_KEYS, l); assert.deepEqual(Object.keys(c.budgets), BUDGET_KEYS, l)
    const money = (c.budgets['under-5k'] + c.budgets['5k-20k'] + c.budgets['20k-plus'])
    if (BUDGET_CURRENCY[l] === 'EUR') assert.ok(/€/.test(money) && !/\$|USD|dollar|دولار/.test(money), l); else assert.ok(!/€/.test(money), l)
    for (const code of ['required', 'invalid', 'tooLong', 'tooShort']) for (const f of ['fullName', 'email', 'website', 'service', 'consent', 'message']) assert.ok(errorText(c, f, code), `${l} ${f} ${code}`)
  }
})

// ── approved copy, exactly ─────────────────────────────────────────────────────────────────────────────────
test('the owner-approved copy is implemented exactly (badge, headline, supporting text, labels, placeholders, services, button, notes, headings, success and error messages)', () => {
  const E = CONTACT_COPY.en
  assert.equal(E.badge, 'GET IN TOUCH'); assert.deepEqual(E.h1, { lead: "Let's talk about", accent: 'your project.', tail: '' })
  assert.equal(E.formHeading, 'Tell us what you have in mind.'); assert.equal(E.submit, 'Send your inquiry'); assert.equal(E.emailHeading, 'Prefer email?')
  assert.equal(E.successHeading, 'Inquiry received.'); assert.equal(E.errorMessage, 'Something went wrong while sending your inquiry. Please try again or contact us by email.')
  assert.deepEqual(Object.values(E.cards), ['Follow us on LinkedIn', 'Find us on Instagram', 'Join our creator network', 'Refer & Earn'])
  assert.equal(`${E.faq.lead} ${E.faq.accent}`, 'Things brands usually ask.')
  const ES = CONTACT_COPY.es, FR = CONTACT_COPY.fr, AR = CONTACT_COPY.ar
  assert.deepEqual([ES.badge, `${ES.h1.lead} ${ES.h1.accent}`, ES.submit, ES.emailHeading, ES.successHeading], ['CONTACTO', 'Hablemos de tu proyecto.', 'Enviar consulta', '¿Prefieres escribirnos por email?', 'Consulta recibida.'])
  assert.deepEqual([FR.badge, `${FR.h1.lead} ${FR.h1.accent}`, FR.submit, FR.emailHeading, FR.successHeading], ['CONTACT', 'Parlons de votre projet.', 'Envoyer ma demande', 'Vous préférez nous écrire ?', 'Demande reçue.'])
  assert.deepEqual([AR.badge, `${AR.h1.lead} ${AR.h1.accent}${AR.h1.tail}`, AR.submit, AR.emailHeading, AR.successHeading], ['تواصل معنا', 'خلنا نتحدث حول مشروعك', 'إرسال الطلب', 'تفضل التواصل عبر البريد الإلكتروني؟', 'تم استلام طلبك.'])
  assert.equal(`${ES.faq.lead} ${ES.faq.accent}`, 'Lo que suelen preguntarnos las marcas.'); assert.equal(`${FR.faq.lead} ${FR.faq.accent}`, 'Les questions que les marques nous posent souvent.'); assert.equal(`${AR.faq.lead} ${AR.faq.accent}`, 'الأسئلة التي تطرحها العلامات التجارية عادةً.')
  assert.deepEqual(Object.values(ES.services), ['Vídeos UGC', 'Vídeos Spokesperson', 'Contenido orgánico para redes sociales', 'Vídeos para SaaS y aplicaciones', 'Proyecto a medida', 'Todavía no lo tengo claro'])
  assert.deepEqual(Object.values(FR.services), ['Vidéos UGC', 'Vidéos Spokesperson', 'Contenu organique pour les réseaux sociaux', 'Vidéos SaaS et applications', 'Projet sur mesure', 'Je ne sais pas encore'])
  assert.deepEqual(Object.values(AR.services), ['فيديوهات UGC', 'فيديوهات Spokesperson', 'المحتوى العضوي لمنصات التواصل الاجتماعي', 'فيديوهات برامج SaaS والتطبيقات', 'مشروع مخصص', 'لم أحدد بعد'])
  // terminology rules
  const all = JSON.stringify(CONTACT_COPY)
  assert.ok(!/creatividades|gancho|accroche/i.test(all), 'creativos / hook rules')
  assert.ok(!/ضريبة|VAT|TVA|IVA/.test(JSON.stringify(AR)), 'no VAT wording on the Arabic Contact page')
  assert.ok(/créas/.test(FR.intro) && !/ مشروعك\.\./.test(all))
})

// ── server handler ─────────────────────────────────────────────────────────────────────────────────────────
function resendStub({ ok = true } = {}) {
  const calls = []
  const fetchImpl = async (url, init) => { calls.push({ url, init, json: JSON.parse(init.body) }); return { status: ok ? 200 : 500 } }
  return { calls, fetchImpl }
}
const ENV = { RESEND_API_KEY: 're_test' }

test('a valid inquiry is emailed to the owner as a labelled GENERAL inquiry (service, language, source page, reply-to) and nothing else happens', async () => {
  const { calls, fetchImpl } = resendStub()
  const r = await processContact({ body: { ...GOOD, locale: 'es', hpCheck: '' }, env: ENV, fetchImpl })
  assert.deepEqual([r.status, r.body], [200, { ok: true }])
  assert.equal(calls.length, 1, 'exactly one request: the Resend alert (no MailerLite, no calendar)')
  assert.equal(calls[0].url, 'https://api.resend.com/emails')
  const m = calls[0].json
  assert.match(m.subject, /^\[General inquiry\] Ada Lovelace \(Analytical Engines\)$/)
  assert.equal(m.reply_to, 'ada@example.com')
  for (const s of ['General inquiry (Contact page)', 'not a package application', 'Service of interest: UGC Videos (ugc)', 'Language of the form: Spanish', 'Source page: /es/contact', '5,000 to 20,000 EUR', 'We would like three UGC concepts', 'No call was offered or scheduled automatically.']) assert.ok(m.text.includes(s), s)
  assert.ok(!/calendly|booking|book a call|choose a time/i.test(JSON.stringify(m)), 'the notification offers no booking link')
  assert.ok(!/within \d+|24 hours|48 hours|response time/i.test(JSON.stringify(m)), 'no response time is promised')
  assert.equal(sourcePageFor('en'), '/contact'); assert.equal(sourcePageFor('fr'), '/fr/contact'); assert.equal(sourcePageFor('ar'), '/ar/contact')
})

test('the source page is derived from the language, never taken from the request; an unknown language counts as English', async () => {
  const { calls, fetchImpl } = resendStub()
  await processContact({ body: { ...GOOD, locale: 'xx', sourcePage: '/evil\nBcc: x@y.z' }, env: ENV, fetchImpl })
  assert.ok(calls[0].json.text.includes('Source page: /contact') && !calls[0].json.text.includes('evil'))
})

test('a header-injection attempt in the name cannot add a header or a second subject line', async () => {
  const { calls, fetchImpl } = resendStub()
  await processContact({ body: { ...GOOD, fullName: 'Eve\r\nBcc: x@y.z', company: 'A\nB' }, env: ENV, fetchImpl })
  assert.ok(!/[\r\n]/.test(calls[0].json.subject))
})

test('invalid input is a 422 naming the fields and sends nothing; the honeypot answers success and sends nothing', async () => {
  const { calls, fetchImpl } = resendStub()
  const bad = await processContact({ body: { ...GOOD, email: '', message: '' }, env: ENV, fetchImpl })
  assert.equal(bad.status, 422); assert.deepEqual(bad.body.fields.sort(), ['email', 'message'])
  const bot = await processContact({ body: { ...GOOD, hpCheck: 'I am a bot' }, env: ENV, fetchImpl })
  assert.deepEqual([bot.status, bot.body], [200, { ok: true }])
  assert.equal((await processContact({ body: null, env: ENV, fetchImpl })).status, 400)
  assert.equal(calls.length, 0)
})

test('delivery failures are never reported as success: no Resend key → 503, Resend error → 503', async () => {
  const none = resendStub()
  assert.equal((await processContact({ body: GOOD, env: {}, fetchImpl: none.fetchImpl })).status, 503)
  assert.equal(none.calls.length, 0)
  const down = resendStub({ ok: false })
  const r = await processContact({ body: GOOD, env: ENV, fetchImpl: down.fetchImpl })
  assert.deepEqual([r.status, r.body], [503, { ok: false, error: 'unavailable' }])
})

test('the endpoint uses the shared infrastructure: same-origin check, JSON body limit, the shared owner-alert helper; the other forms are untouched', () => {
  const h = read('api/contact.js'), lib = read('api/_lib/contact.js')
  assert.match(h, /isSameOrigin/); assert.match(h, /MAX_BODY_BYTES = 16 \* 1024/); assert.match(lib, /sendOwnerAlert/)
  assert.ok(!/MAILERLITE|saveSubscriber|subscribe\.js/.test(lib.replace(/\/\*[\s\S]*?\*\//g, '')), 'a general inquiry is never saved to MailerLite')
  for (const f of ['api/_lib/notify.js', 'api/_lib/subscribe.js', 'api/_lib/apply.js', 'api/_lib/referral.js']) assert.ok(fs.existsSync(path.join(ROOT, f)), f)
})

// ── the four built Contact pages ───────────────────────────────────────────────────────────────────────────
const PAGES = { en: '/contact', es: '/es/contact', fr: '/fr/contact', ar: '/ar/contact' }

test('every Contact page: the approved copy, all seven fields with their labels and placeholders, the six services, the budget bands, one h1, the form posts to our own endpoint only', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p), t = text(h), c = CONTACT_COPY[l]
    assert.equal((h.match(/<h1[ >]/g) ?? []).length, 1, p)
    for (const s of [c.badge, c.h1.lead, c.h1.accent, c.intro, c.formHeading, c.labels.fullName, c.labels.email, c.labels.company, c.labels.website, c.labels.service, c.labels.budget, c.labels.message, c.submit, c.submitNote, c.emailHeading, c.connectHeading, ...Object.values(c.cards), c.founderLinkedin]) assert.ok(t.includes(s.replace(/&/g, '&')), `${p}: ${s}`)
    for (const s of [...Object.values(c.placeholders)]) assert.ok(h.includes(`placeholder="${s}"`) || h.includes(`>${s}</option>`), `${p}: placeholder ${s}`)
    for (const s of [...Object.values(c.services), ...Object.values(c.budgets)]) assert.ok(t.replace(/&/g, '&').includes(s), `${p}: option ${s}`)
    assert.ok(h.includes(`${c.faq.lead}`) && h.includes(`${c.faq.accent}`), `${p}: FAQ heading`)
    for (const n of ['fullName', 'email', 'company', 'website', 'service', 'budget', 'message']) assert.ok(h.includes(`name="${n}"`), `${p}: field ${n}`)
    assert.match(h, /<form[^>]*aria-label=/, p)
    assert.ok(h.includes(`mailto:${CONTACT_EMAIL}`), `${p}: prefer-email link`)
    assert.ok(!/action="https?:/.test(h), `${p}: the form never posts to a third party`)
  }
})

test('NO Calendly, booking widget, booking button or scheduling prompt on any Contact page (HTML and its code); layout leaves no empty booking column', () => {
  for (const p of Object.values(PAGES)) {
    const h = page(p)
    assert.ok(!/calendly/i.test(h), `${p}: no calendly in the HTML`)
    assert.ok(!h.includes(BOOKING_URL), p)
    assert.ok(!/Book a Creative Call|Reservar una llamada|Réserver un appel|احجز مكالمة|choose a time|elige un horario|choisissez un créneau/i.test(text(h)), `${p}: no booking CTA text`)
    assert.ok(!/Who runs this website|Quién gestiona este sitio|Qui gère ce site|من يدير هذا الموقع/i.test(text(h)), `${p}: the operator section is gone (Legal Notice via the footer)`)
  }
  const src = ['src/components/contact/ContactPage.jsx', 'src/components/contact/ContactForm.jsx', 'src/content/contactCopy.js', 'src/lib/contactSubmit.js', 'src/lib/contactInquiry.js', 'api/_lib/contact.js'].map(read).join('\n')
  assert.ok(!/calendly|BOOKING_URL|CalendlyGate|BookingModal|bookingModal/i.test(src.replace(/NO Calendly|not a booking/gi, '')))
  // private scheduling infrastructure and the other funnels are untouched
  for (const f of ['src/components/roadmap/RoadmapBooking.jsx']) assert.ok(fs.existsSync(path.join(ROOT, f)), `${f} kept (the Roadmap's qualification-first booking, link-out only)`)
  assert.ok(!fs.existsSync(path.join(ROOT, 'src/components/booking/CalendlyGate.jsx')), 'the embed gate was removed (link-out only, 27 Nov 2026)')
  for (const f of ['src/components/scale/BookingModal.jsx', 'src/lib/bookingModal.js']) assert.ok(!fs.existsSync(path.join(ROOT, f)), `${f} removed (no public booking modal; owner decision 27 Nov 2026)`)
})

test('the bottom of every Contact page is the existing Free Creative Growth Roadmap CTA (translated), and the footer links reach the Legal Notice and Privacy Policy', () => {
  for (const [l, p] of Object.entries(PAGES)) {
    const h = page(p)
    const roadmap = l === 'en' ? '/creative-growth-roadmap' : `/${l}/creative-growth-roadmap`
    assert.ok(h.includes(`href="${roadmap}"`), `${p}: Roadmap CTA in its own language`)
    assert.match(h, /href="[^"]*legal-notice"/); assert.match(h, /href="[^"]*privacy"/)
  }
})

test('Arabic Contact page: right-to-left, the email and website fields stay left-to-right, the lime accent is «مشروعك» only', () => {
  const h = page('/ar/contact')
  assert.match(h, /<html lang="ar" dir="rtl">/)
  assert.match(h, /type="email"[^>]*dir="ltr"/); assert.match(h, /name="website"[^>]*|dir="ltr"[^>]*name="website"/)
  assert.ok(/<span class="block whitespace-nowrap">خلنا نتحدث حول(<!-- -->)? <span class="text-lime">مشروعك<\/span><\/span>/.test(h), 'the whole Arabic headline is on one line; the lime part is «مشروعك»')
})

test('English Contact page: the headline is two lines with "your project." in lime', () => {
  assert.ok(/<span class="block">Let(&#x27;|')s talk about<\/span> <span class="block"><span class="whitespace-nowrap"><span class="text-lime">your project\.<\/span><\/span><\/span>/.test(page('/contact')))
})

test('a successful submission is the ONE conversion event, fired only after the server confirmed; no personal data in any event; no click or view counts as an inquiry', () => {
  const f = read('src/components/contact/ContactForm.jsx')
  const after = f.slice(f.indexOf('await submitInquiry'))
  assert.ok(after.indexOf("trackEvent('contact_inquiry_success'") > after.indexOf("setStatus('success')") && after.indexOf("trackEvent('contact_inquiry_success'") < after.indexOf('} catch'), 'inside the try, after the awaited success')
  assert.equal((f.match(/trackEvent\('contact_inquiry_success'/g) || []).length, 1)
  for (const m of f.matchAll(/trackEvent\('([a-z_]+)'(?:, (\{[^}]*\}))?\)/g)) assert.ok(!/fullName|email|company|website|message|values\.(fullName|email|company|website|message)/.test(m[2] ?? ''), `${m[1]}: no personal data in params`)
  assert.ok(!/trackEvent\('contact_inquiry_success'[^)]*\)[\s\S]{0,60}onSubmit/.test(f))
  assert.ok(!/roadmap_|referral_|risk_free|free_hooks|hooks_/.test(f), 'measured apart from the Roadmap, free-video, referral and hooks funnels')
  const page_ = read('src/components/contact/ContactPage.jsx')
  assert.ok(!/contact_inquiry_success/.test(page_))
})

// ── SEO and sitemap ───────────────────────────────────────────────────────────────────────────────────────
test('Contact SEO: the approved preliminary titles, self-canonical, reciprocal hreflang in the four languages, in the sitemap; descriptions are natural, not keyword lists', () => {
  assert.equal(SITE_SEO['/contact'].title, 'Contact CONVRT | Tell Us About Your Project')
  assert.equal(SEO_BY_LOCALE.es['/contact'].title, 'Contacto | Cuéntanos tu proyecto | CONVRT')
  assert.equal(SEO_BY_LOCALE.fr['/contact'].title, 'Contact | Parlons de votre projet | CONVRT')
  assert.equal(SEO_BY_LOCALE.ar['/contact'].title, 'تواصل معنا | لنتحدث عن مشروعك | CONVRT')
  const sets = Object.values(PAGES).map((p) => [...page(p).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|'))
  assert.ok(sets.every((x) => x === sets[0]) && sets[0].split('|').length === 5)
  for (const [l, p] of Object.entries(PAGES)) assert.match(page(p), new RegExp(`<link rel="canonical" href="${SITE_URL}${p}"`), `${l}: self-canonical`)
  assert.ok(sitemapRoutes().includes('/contact'))
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const p of Object.values(PAGES)) assert.ok(sm.includes(`<loc>${SITE_URL}${p}</loc>`), p)
  assert.ok(!/\?|confirmation|success|thank/i.test(sm.match(/<loc>[^<]*contact[^<]*<\/loc>/g).join()), 'no parameter, confirmation or utility URL in the sitemap')
})
