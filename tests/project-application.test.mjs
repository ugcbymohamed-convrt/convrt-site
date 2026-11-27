/* The project application funnel (/project-application): package resolution from the pricing configuration, validation, the owner's notification (Resend mocked),
   server-side price integrity, duplicate protection, SEO treatment, tracking hygiene and "no calendar / no payment" guarantees. Nothing leaves the machine. */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT } from '../src/seo/businessKnowledge.js'
import { ES_PRICING } from '../src/i18n/es/pricing.js'
import { PRICING } from '../src/i18n/pricing.js'
import { PA_COPY, paCopy } from '../src/i18n/projectApplicationCopy.js'
import {
  PACKAGE_IDS, selectionFor, selectionFromSearch, applicationHref, validateFields, normalizeUrl, validStartDate, questionsFor, OPTION_IDS, OPTION_LABELS_EN, STEP_FIELDS, RANGE_CURRENCY,
} from '../src/lib/projectApplication.js'
import { processProjectApplication, buildApplicationAlert, priceText } from '../api/_lib/projectApplication.js'
import { buildAlert } from '../api/_lib/notify.js'
import { sitemapRoutes } from '../src/seo/siteSeo.js'
import { pageHead } from '../src/seo/siteSeo.js'
import { TRANSLATED_PATHS } from '../src/i18n/registry.js'

const root = join(import.meta.dirname, '..')
const read = (p) => readFileSync(join(root, p), 'utf8')
const NOW = new Date('2026-11-26T20:00:00Z')
const LOCALES = ['en', 'es', 'fr', 'ar']

/* ── package resolution: the pricing configuration is the single source of truth ── */
test('selection: every package × locale resolves its price, currency and commitment from the existing pricing data (never retyped)', () => {
  const expected = {
    en: { sprint: [SPRINT.monthly.amount, SPRINT.oneOff.amount], 'sprint-plus': [SPRINT_PLUS.monthly.amount, SPRINT_PLUS.oneOff.amount], 'organic-light': [ORGANIC.light.monthly.amount], 'organic-growth': [ORGANIC.growth.monthly.amount] },
    es: { sprint: [ES_PRICING.amounts['sprint.monthly'], ES_PRICING.amounts['sprint.oneOff']], 'sprint-plus': [ES_PRICING.amounts['sprintPlus.monthly'], ES_PRICING.amounts['sprintPlus.oneOff']], 'organic-light': [ES_PRICING.amounts['organicLight.monthly']], 'organic-growth': [ES_PRICING.amounts['organicGrowth.monthly']] },
  }
  expected.fr = expected.es // French reuses the Spanish EUR table
  expected.ar = expected.en // Arabic shows the English USD prices
  const currency = { en: 'USD', es: 'EUR', fr: 'EUR', ar: 'USD' }
  for (const l of LOCALES) {
    for (const [id, prices] of Object.entries(expected[l])) {
      const billings = prices.length === 2 ? ['monthly', 'one-time'] : ['monthly']
      billings.forEach((b, i) => {
        const s = selectionFor(l, id, b)
        assert.equal(s.amount, prices[i], `${l} ${id} ${b}`)
        assert.equal(s.currency, currency[l])
        const paid = id.startsWith('sprint')
        assert.equal(s.commitmentMonths, paid ? (b === 'monthly' ? COMMITMENT.initialMonths : 0) : ORGANIC_COMMITMENT.initialMonths)
      })
    }
    for (const id of ['custom-paid', 'custom-organic']) {
      const s = selectionFor(l, id, '')
      assert.equal(s.custom, true); assert.equal(s.amount, null); assert.equal(s.billing, null)
    }
  }
  assert.deepEqual(PACKAGE_IDS, ['sprint', 'sprint-plus', 'organic-light', 'organic-growth', 'custom-paid', 'custom-organic'])
  assert.equal(PRICING.fr.currency, 'EUR')
})

test('selection: unknown packages, impossible billing options and unknown locales resolve to nothing; the page may default the billing, the server never does', () => {
  assert.equal(selectionFor('en', 'sprint', 'weekly'), null)
  assert.equal(selectionFor('en', 'organic-light', 'one-time'), null, 'Organic has no one-off option')
  assert.equal(selectionFor('en', '__proto__', 'monthly'), null)
  assert.equal(selectionFor('en', 'sprint', undefined), null, 'the server needs an explicit billing option for a Sprint')
  assert.equal(selectionFor('en', 'sprint', undefined, { defaultBilling: true }).billing, 'monthly')
  assert.equal(selectionFor('de', 'sprint', 'monthly'), null)
  assert.equal(selectionFromSearch('en', '?package=sprint-plus&billing=one-time&from=pricing').amount, SPRINT_PLUS.oneOff.amount)
  assert.equal(selectionFromSearch('en', '?package=sprint&billing=bogus'), null)
  assert.equal(selectionFromSearch('en', '?package=sprint&price=1').amount, SPRINT.monthly.amount, 'a price in the URL is ignored')
  assert.equal(applicationHref('/es/project-application', 'sprint', 'one-time'), '/es/project-application?package=sprint&billing=one-time&from=pricing')
  assert.doesNotMatch(applicationHref('/project-application', 'custom-paid'), /billing|price/)
})

test('conditional questions: paid → ad spend; organic → social activity + accounts; custom → production type + budget; everyone → readiness, date, languages', () => {
  const q = (id, b) => questionsFor(selectionFor('en', id, b))
  assert.deepEqual(Object.entries(q('sprint', 'monthly')).filter(([, v]) => v).map(([k]) => k), ['adSpend', 'paidObjective'])
  assert.deepEqual(Object.entries(q('organic-growth', 'monthly')).filter(([, v]) => v).map(([k]) => k), ['socialActivity', 'organicObjective', 'socialAccounts'])
  assert.deepEqual(Object.entries(q('custom-paid')).filter(([, v]) => v).map(([k]) => k), ['adSpend', 'paidObjective', 'productionType', 'budget'])
  assert.deepEqual(Object.entries(q('custom-organic')).filter(([, v]) => v).map(([k]) => k), ['socialActivity', 'organicObjective', 'socialAccounts', 'productionType', 'budget'])
  assert.deepEqual(OPTION_IDS.productionType, ['ugc', 'spokesperson', 'organic', 'saas', 'other'])
  assert.equal(OPTION_LABELS_EN.adSpend.none, 'Not running paid ads yet', 'not running ads is a valid answer')
})

/* ── validation ── */
const PAID = { fullName: 'Ana Test', email: 'ana@example.com', company: 'Brand', url: 'brand.com', description: 'We sell things.', paidObjective: 'launch', adSpend: 'none', readiness: 'asap', startDate: '2026-12-01', language: ['en'], acknowledged: true }
test('validation: a complete paid application is valid; every required field is enforced; the acknowledgement is mandatory; an organic one needs no ad spend', () => {
  const sel = selectionFor('en', 'sprint', 'monthly')
  assert.deepEqual(validateFields(PAID, sel, { now: NOW }), {})
  for (const f of ['fullName', 'email', 'company', 'url', 'description', 'paidObjective', 'adSpend', 'readiness', 'startDate', 'acknowledged']) {
    const bad = { ...PAID, [f]: f === 'acknowledged' ? false : '' }
    assert.ok(validateFields(bad, sel, { now: NOW })[f], `${f} required`)
  }
  assert.ok(validateFields({ ...PAID, language: [] }, sel, { now: NOW }).language)
  assert.ok(validateFields({ ...PAID, paidObjective: 'other', objectiveOther: '' }, sel, { now: NOW }).objectiveOther, '"Other" asks for a few words')
  const org = selectionFor('en', 'organic-light', 'monthly')
  const o = { ...PAID, adSpend: '', paidObjective: '', organicObjective: 'awareness', socialActivity: 'starting' }
  assert.deepEqual(validateFields(o, org, { now: NOW }), {}, 'no paid-ads question for an organic package')
  const custom = selectionFor('en', 'custom-paid')
  assert.deepEqual(Object.keys(validateFields(PAID, custom, { now: NOW })).sort(), ['budget', 'productionType'])
  assert.deepEqual(validateFields({ ...PAID, productionType: ['ugc', 'bogus'], budget: 'unsure' }, custom, { now: NOW }), {})
  assert.ok(Object.keys(validateFields({ ...PAID }, sel, { step: 1, now: NOW })).length === 0, 'step 1 only checks the brand fields')
  assert.ok(STEP_FIELDS[1].every((f) => !STEP_FIELDS[2].includes(f)))
})

test('validation: e-mail, URL and date edge cases', () => {
  const sel = selectionFor('en', 'sprint', 'monthly')
  for (const email of ['x', 'a@b', 'a b@c.com', '']) assert.ok(validateFields({ ...PAID, email }, sel, { now: NOW }).email, email)
  assert.equal(normalizeUrl('instagram.com/brand'), 'https://instagram.com/brand')
  assert.equal(normalizeUrl('https://apps.apple.com/app/id1'), 'https://apps.apple.com/app/id1')
  for (const bad of ['javascript:alert(1)', 'data:text/html,hi', 'ftp://x.com', 'https://user:pw@x.com', 'not a url', 'localhost', '<script>x.com', 'x.com"onclick']) assert.equal(normalizeUrl(bad), '', bad)
  assert.ok(validateFields({ ...PAID, url: 'javascript:alert(1)' }, sel, { now: NOW }).url)
  assert.equal(validStartDate('2026-11-25', NOW), true, 'yesterday is allowed (time zones)')
  assert.equal(validStartDate('2026-11-24', NOW), false)
  assert.equal(validStartDate('2026-02-30', NOW), false)
  assert.equal(validStartDate('2029-01-01', NOW), false)
  assert.ok(validateFields({ ...PAID, description: 'x'.repeat(1501) }, sel, { now: NOW }).description)
})

/* ── server: price integrity, delivery, duplicates, spam ── */
const BODY = (over = {}) => ({ locale: 'en', packageId: 'sprint', billing: 'one-time', submissionId: 'abcd1234-abcd-4abc-8abc-abcdef123456', sourcePage: 'pricing', landingPage: '/pricing', attribution: { utm_source: 'google', foo: 'x' }, fields: PAID, ...over })
const mockFetch = (status = 200) => { const calls = []; const f = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return { status } }; f.calls = calls; return f }

test('server: the price, currency and commitment come from the pricing configuration; a price sent by the browser is ignored', async () => {
  const f = mockFetch()
  const r = await processProjectApplication({ body: BODY({ price: 1, amount: 1, currency: 'JPY', fields: { ...PAID, price: 1 } }), env: { RESEND_API_KEY: 're_x' }, fetchImpl: f, now: () => NOW })
  assert.equal(r.status, 200); assert.deepEqual(r.body, { ok: true })
  const mail = f.calls[0].body
  assert.match(mail.text, /Current package price: \$3,500 USD/)
  assert.match(mail.text, /Currency: USD/); assert.doesNotMatch(mail.text, /JPY/)
  assert.equal(mail.subject, '[CONVRT] New Project Application — Sprint One-time — Brand')
  assert.equal(mail.reply_to, 'ana@example.com')
  assert.equal(f.calls[0].init.headers['Idempotency-Key'], 'convrt-project-application-abcd1234-abcd-4abc-8abc-abcdef123456')
  for (const l of ['es', 'fr']) {
    const g = mockFetch(); await processProjectApplication({ body: BODY({ locale: l, billing: 'monthly' }), env: { RESEND_API_KEY: 'k' }, fetchImpl: g, now: () => NOW })
    assert.match(g.calls[0].body.text, /Current package price: €2,750 EUR/); assert.match(g.calls[0].body.text, /Applicable commitment: 3-month initial commitment/)
  }
})

test('server: the notification names every qualifying field and says it is a purchase-intent project application, not a Roadmap application', async () => {
  const f = mockFetch()
  await processProjectApplication({ body: BODY({ packageId: 'custom-organic', billing: '', fields: { ...PAID, paidObjective: '', adSpend: '', organicObjective: 'other', objectiveOther: 'Open a showroom', socialActivity: 'regular', socialAccounts: '@brand', productionType: ['organic', 'saas'], budget: '6k-12k', language: ['es', 'other'], languageOther: 'Catalan' } }), env: { RESEND_API_KEY: 'k' }, fetchImpl: f, now: () => NOW })
  const t = f.calls[0].body.text
  for (const must of ['PROJECT APPLICATION (purchase intent). NOT a Free Creative Growth Roadmap', 'Applicant name: Ana Test', 'Email: ana@example.com', 'Company / brand: Brand', 'Website / app / social URL: https://brand.com/', 'Selected package: Custom organic content production',
    'Billing preference: Custom proposal', 'Custom: no price', 'Project description: We sell things.', 'Project objective: Other: Open a showroom', 'Current social media activity: We publish regularly but need better content', 'Social media accounts: @brand',
    'Type of production required: Organic social videos, SaaS and app videos', 'Estimated project budget (USD): $6,000–$12,000', 'Production languages: Spanish, Other: Catalan', 'Desired start date: 2026-12-01', 'Pricing acknowledgement: Yes: understands that pricing will be determined',
    'Submitted: 2026-11-26T20:00:00.000Z', 'Website locale: en (English)', 'Source page: pricing', 'Landing page: /pricing', 'Campaign attribution: utm_source=google']) assert.ok(t.includes(must), must)
  assert.doesNotMatch(t, /Monthly advertising spend/, 'no paid-ads question for organic'); assert.doesNotMatch(t, /foo=/, 'only utm_* attribution is kept')
  const subj = f.calls[0].body.subject; assert.match(subj, /^\[CONVRT\] New Project Application — Custom organic content production Custom proposal — Brand$/)
})

test('server: euro ranges for Spanish and French, dollar ranges for English and Arabic (qualification ranges, not conversions)', () => {
  assert.deepEqual(RANGE_CURRENCY, { en: 'USD', es: 'EUR', fr: 'EUR', ar: 'USD' })
  const mk = (l) => buildApplicationAlert({ locale: l, ...{ packageId: 'sprint', billing: 'monthly', submissionId: 'x', sourcePage: 'pricing', landingPage: '', attribution: {}, fields: { ...PAID, adSpend: '15k-50k' } } }, selectionFor(l, 'sprint', 'monthly'), { now: NOW })
  assert.ok(mk('es').rows.find(([k]) => k === 'Monthly advertising spend')[1].includes('€15,000–€50,000'))
  assert.ok(mk('fr').rows.find(([k]) => k === 'Monthly advertising spend')[1].includes('€15,000–€50,000'))
  assert.ok(mk('ar').rows.find(([k]) => k === 'Monthly advertising spend')[1].includes('$15,000–$50,000'))
  assert.equal(priceText(3000, 'USD'), '$3,000 USD'); assert.equal(priceText(937.5, 'USD'), '$937.50 USD')
})

test('server: invalid applications are refused (422) and nothing is sent; honeypot gets a quiet success; success needs a delivered e-mail', async () => {
  const f = mockFetch()
  const run = (body, env = { RESEND_API_KEY: 'k' }, fetchImpl = f) => processProjectApplication({ body, env, fetchImpl, now: () => NOW })
  assert.equal((await run(BODY({ packageId: 'platinum' }))).status, 422)
  assert.equal((await run(BODY({ billing: 'weekly' }))).status, 422)
  assert.equal((await run(BODY({ packageId: 'organic-light', billing: 'one-time' }))).status, 422)
  assert.equal((await run(BODY({ locale: 'de' }))).status, 422)
  assert.equal((await run(BODY({ submissionId: '' }))).status, 422)
  assert.equal((await run(BODY({ fields: { ...PAID, email: 'nope' } }))).body.fields[0], 'email')
  assert.equal((await run(BODY({ fields: { ...PAID, acknowledged: false } }))).status, 422)
  assert.equal((await run(null)).status, 400); assert.equal((await run([])).status, 400)
  assert.equal(f.calls.length, 0, 'nothing was sent for any invalid request')
  const bot = await run(BODY({ nickname: 'spam' })); assert.equal(bot.status, 200); assert.equal(f.calls.length, 0)
  assert.equal((await run(BODY(), {})).status, 503, 'no Resend key = unavailable, never a fake success')
  assert.equal((await run(BODY(), { RESEND_API_KEY: 'k' }, mockFetch(500))).status, 502, 'Resend refuses = error')
  assert.equal((await run(BODY(), { RESEND_API_KEY: 'k' }, async () => { throw new Error('network') })).status, 502)
  assert.equal((await run(BODY(), { RESEND_API_KEY: 'k' }, mockFetch(429))).body.error, 'rate_limited')
  const dry = await run(BODY(), { PROJECT_APPLICATION_DRY_RUN: '1' }); assert.equal(dry.status, 200); assert.equal(dry.dryRun, true)
})

test('server: the template is the shared Resend alert (HTML-escaped), and the applicant receives no e-mail, calendar link or payment link', async () => {
  const f = mockFetch()
  await processProjectApplication({ body: BODY({ fields: { ...PAID, company: '<img src=x onerror=alert(1)>' } }), env: { RESEND_API_KEY: 'k' }, fetchImpl: f, now: () => NOW })
  assert.equal(f.calls.length, 1); assert.deepEqual(f.calls[0].body.to, ['mohamed@convrt.studio'])
  assert.match(f.calls[0].body.html, /&lt;img src=x onerror=alert\(1\)&gt;/); assert.doesNotMatch(f.calls[0].body.html, /<img/)
  assert.doesNotMatch(f.calls[0].body.text + f.calls[0].body.html, /calendly\.com|stripe\.com|paypal\.com/i)
  const api = read('api/_lib/projectApplication.js')
  assert.doesNotMatch(api, /MAILERLITE|subscribers/, 'never added to an e-mail list')
  assert.ok(buildAlert(buildApplicationAlert({ locale: 'en', packageId: 'sprint', billing: 'monthly', submissionId: 'x', sourcePage: 'direct', landingPage: '', attribution: {}, fields: PAID }, selectionFor('en', 'sprint', 'monthly'), { now: NOW }), {}).subject.length <= 150)
})

/* ── pages, copy and SEO ── */
test('copy: the owner-supplied headline, description, confirmation, button and CTA wording is exact in every language', () => {
  const want = {
    en: ["Let's talk about your project.", "Tell us a little about your brand, your goals and what you need. We'll review your application and get back to you with the next steps.", 'Application received.', "Thank you for telling us about your project. We'll review your application and contact you regarding the next steps.", 'Submit My Application', 'Request This Package', 'Request a Custom Proposal'],
    es: ['Hablemos de tu proyecto.', 'Cuéntanos un poco sobre tu marca, tus objetivos y lo que necesitas. Revisaremos tu solicitud y nos pondremos en contacto contigo para definir los próximos pasos.', 'Solicitud recibida.', 'Gracias por contarnos tu proyecto. Revisaremos tu solicitud y nos pondremos en contacto contigo para definir los próximos pasos.', 'Enviar mi solicitud', 'Solicitar este paquete', 'Solicitar una propuesta personalizada'],
    fr: ['Parlons de votre projet.', 'Parlez-nous de votre marque, de vos objectifs et de vos besoins. Nous étudierons votre demande avant de revenir vers vous pour définir la suite.', 'Demande reçue.', 'Merci de nous avoir présenté votre projet. Nous allons étudier votre demande et revenir vers vous pour définir la suite.', 'Envoyer ma demande', 'Demander cette formule', 'Demander un devis personnalisé'],
    ar: ['لنتحدث عن مشروعك.', 'أخبرنا عن علامتك التجارية وأهدافك واحتياجاتك. سنراجع طلبك ونتواصل معك لتحديد الخطوات التالية.', 'تم استلام طلبك.', 'شكرًا لمشاركتنا تفاصيل مشروعك. سنراجع طلبك ونتواصل معك لتحديد الخطوات التالية.', 'إرسال الطلب', 'طلب هذه الباقة', 'طلب عرض مخصص'],
  }
  for (const l of LOCALES) {
    const c = PA_COPY[l]
    assert.deepEqual([c.headline, c.description, c.done.headline, c.done.body, c.submit, c.cta.standard, c.cta.custom], want[l], l)
  }
  assert.equal(paCopy('xx'), PA_COPY.en)
  // every option id has a label in every language
  for (const l of LOCALES) for (const [k, ids] of Object.entries(OPTION_IDS)) for (const id of ids) assert.ok(PA_COPY[l].options[k][id], `${l}.${k}.${id}`)
  // currency of the ranges
  assert.match(PA_COPY.es.options.adSpend['5k-15k'], /€/); assert.match(PA_COPY.fr.options.adSpend['5k-15k'], /€/)
  assert.match(PA_COPY.en.options.adSpend['5k-15k'], /\$/); assert.match(PA_COPY.ar.options.adSpend['5k-15k'], /\$/)
  assert.equal(PA_COPY.ar.summary.exVat, null, 'no VAT wording on any Arabic page')
  assert.ok(!JSON.stringify(PA_COPY.ar).match(/ضريبة|VAT/))
  assert.ok(!/gancho/i.test(JSON.stringify(PA_COPY.es)), 'Spanish: "hook", never "gancho"')
  assert.ok(!/creatividades/i.test(JSON.stringify(PA_COPY.es)), 'Spanish: "creativos", never "creatividades"')
})

test('SEO: the application is noindex, self-canonical, in no sitemap, never in robots.txt, and carries no hreflang (any language)', () => {
  const h = pageHead('/project-application', 'en')
  assert.equal(h.robots, 'noindex, follow'); assert.equal(h.url, 'https://www.convrt.studio/project-application')
  assert.ok(!sitemapRoutes().includes('/project-application'))
  assert.doesNotMatch(read('public/robots.txt'), /project-application/)
  assert.match(read('vercel.json'), /project-application[\s\S]{0,120}X-Robots-Tag[\s\S]{0,40}noindex/)
  for (const l of ['es', 'fr', 'ar']) {
    assert.ok(TRANSLATED_PATHS[l].includes('/project-application'))
    const hl = pageHead('/project-application', l)
    assert.equal(hl.robots, 'noindex, follow'); assert.deepEqual(hl.alternates ?? [], []); assert.ok(hl.url.includes(`/${l}/project-application`))
  }
  const dist = join(root, 'dist')
  if (existsSync(join(dist, 'sitemap.xml'))) assert.doesNotMatch(readFileSync(join(dist, 'sitemap.xml'), 'utf8'), /project-application/)
})

test('pricing page: every package card opens the project application with its package and billing; Roadmap CTAs elsewhere are untouched', () => {
  const cards = read('src/components/pricing/PricingCards.jsx')
  for (const id of ["packageId: 'sprint'", "packageId: 'sprint-plus'", "packageId: 'organic-light'", "packageId: 'organic-growth'", "packageId: 'custom-paid'", "packageId: 'custom-organic'"]) assert.ok(cards.includes(id), id)
  assert.match(cards, /trackEvent\('package_cta_click'/)
  assert.doesNotMatch(cards, /OFFER_PATHS|resolveCta|creative-growth-roadmap/, 'the cards no longer link to the Roadmap')
  assert.match(read('src/components/Hero.jsx'), /OFFER_PATHS\.roadmap|primaryAction/)
  assert.match(read('src/components/pricing/PricingFinalCTA.jsx') + read('src/components/pricing/PhilosophySection.jsx'), /roadmap/i, 'the free Roadmap offer stays on the pricing page')
})

test('tracking: funnel events fire where intended, carry identifiers only, and the conversion fires only after the server confirmed delivery', () => {
  const form = read('src/components/projectApplication/ApplicationForm.jsx')
  const page = read('src/ProjectApplicationPage.jsx')
  assert.match(page, /trackEvent\('project_application_view'/)
  assert.match(form, /trackEvent\('project_application_start'/)
  const submitAt = form.indexOf("trackEvent('project_application_submit'")
  assert.ok(submitAt > form.indexOf('await submitProjectApplication'), 'submit event after the awaited request')
  assert.ok(submitAt < form.indexOf('catch (err)'), 'inside the success path, before the catch')
  assert.equal((form.match(/project_application_submit'/g) || []).length, 1)
  assert.match(form, /sentRef/, 'guarded against a second firing')
  for (const src of [form, page, read('src/components/pricing/PricingCards.jsx')]) {
    for (const call of src.matchAll(/trackEvent\([^)]*\)/g)) assert.doesNotMatch(call[0], /email|fullName|values|description|url\b|company|name:/i, call[0])
  }
  assert.doesNotMatch(read('src/lib/projectApply.js') + form, /gtag|fbq|dataLayer/, 'no direct ad-platform calls: everything goes through trackEvent (consent-gated)')
})

test('no public calendar, booking link, payment or checkout anywhere in the application', () => {
  const files = ['src/ProjectApplicationPage.jsx', 'src/components/projectApplication/ApplicationForm.jsx', 'src/components/projectApplication/PackageSummary.jsx', 'src/i18n/projectApplicationCopy.js', 'src/lib/projectApply.js', 'api/_lib/projectApplication.js']
  for (const f of files) assert.doesNotMatch(read(f), /calendly|BOOKING_URL|openBookingModal|stripe|checkout|paypal/i, f)
})
