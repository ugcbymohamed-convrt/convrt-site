// Run with: node --test tests/ugc-page.test.mjs
// SEO phase 2: the /ugc-video-agency service page. Checks its head, structured data, prerendered HTML, claims and positioning,
// figures-from-data rule, proof wording, the portfolio data model and its permission gate, the internal links and the Roadmap
// eligibility copy. Builds the site once into a temp dir and starts a Vite SSR loader to render components with sample data.
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PATHS } from '../src/routes.js'
import { SITE_URL } from '../src/config.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { ugcGraph, jsonLdFor, ORG_ID, serviceId, BREADCRUMB_TRAILS } from '../src/seo/structuredData.js'
import { UGC_FAQ, ugcFaqText } from '../src/seo/ugcFaq.js'
import {
  formatMoney, adVersions, packageEquation, SPRINT, SPRINT_PLUS, USAGE_RIGHTS, RAW_FOOTAGE, TURNAROUND, COMMITMENT, REVISIONS, RESHOOTS,
  PRODUCT_REQUIREMENTS, FORMATS, TALENT, PRODUCTION_LANGUAGES, PARTNERSHIP_TERMS,
} from '../src/seo/businessKnowledge.js'
import { ELYON_PROOF, UGC_TESTIMONIALS } from '../src/content/ugcProof.js'
import {
  UGC_PORTFOLIO, isDisplayable, selectDisplayable, portfolioProblems, creatorLabel, buildFacets, matchesFilters, posterUrl, categoryOf,
} from '../src/content/ugcPortfolio.js'
import { BUSINESS_TYPE_OPTIONS } from '../src/lib/roadmapQuestions.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const PATH = PATHS.ugcVideoAgency
const URL_ = `${SITE_URL}${PATH}`

const decode = (s) => s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;|&#x2019;/g, '’').replace(/&ldquo;|&#x201C;/g, '“').replace(/&rdquo;|&#x201D;/g, '”')
const rootOf = (h) => h.slice(h.indexOf('<div id="root"'))
const textOf = (h) => decode(rootOf(h).replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()
const headOf = (h) => h.slice(0, h.indexOf('</head>'))

let tmp, dist, vite, UgcWork, UgcHero, CreatorVideoStage
const page = (p) => fs.readFileSync(path.join(dist, p === '/' ? 'index.html' : `${p.slice(1)}/index.html`), 'utf8')

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-ugc-'))
  dist = path.join(tmp, 'dist')
  const pub = path.join(tmp, 'public')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  await build({ root: ROOT, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
  vite = await createServer({ root: ROOT, configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  UgcWork = await vite.ssrLoadModule('/src/components/ugc/UgcWork.jsx')
  UgcHero = await vite.ssrLoadModule('/src/components/ugc/UgcHero.jsx')
  CreatorVideoStage = await vite.ssrLoadModule('/src/components/ugc/CreatorVideoStage.jsx')
})
after(async () => {
  if (vite) await vite.close()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

// ── SEO manifest, head, sitemap ──────────────────────────────────────────────────────────
test('head: approved title, price-driven description, self-canonical, indexable, in the sitemap', () => {
  const e = SITE_SEO[PATH]
  assert.equal(e.title, 'UGC Video Agency | Human-Led UGC Ads for Paid Social | CONVRT')
  assert.ok(e.title.length <= 62, 'title length')
  assert.ok(e.description.length >= 120 && e.description.length <= 160, `description length ${e.description.length}`)
  assert.ok(e.description.includes(`${formatMoney(SPRINT.monthly)}/month`) && e.description.includes(`${USAGE_RIGHTS.includedMonths} months`), 'description is built from the business data')
  assert.equal(e.indexable, true)
  assert.equal(pageHead(PATH).url, URL_)
  assert.ok(sitemapRoutes().includes(PATH))
  const titles = Object.entries(SITE_SEO).filter(([p]) => p !== PATH).map(([, v]) => v.title)
  assert.ok(!titles.includes(e.title), 'unique title')
  const html = page(PATH)
  const head = headOf(html)
  assert.ok(head.includes('<title>UGC Video Agency | Human-Led UGC Ads for Paid Social | CONVRT</title>'))
  assert.ok(head.includes(`<link rel="canonical" href="${URL_}" />`))
  assert.equal((head.match(/rel="canonical"/g) || []).length, 1)
  assert.ok(!/name="robots"/.test(head), 'indexable: no robots tag')
  assert.ok(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes(`<loc>${URL_}</loc>`))
})

// ── prerendered HTML ─────────────────────────────────────────────────────────────────────
test('static HTML: breadcrumb, the approved H1, five main sections (the portfolio only with approved videos) and a short final CTA', () => {
  const html = page(PATH)
  const root = rootOf(html)
  assert.equal((root.match(/<h1[\s>]/g) || []).length, 1)
  const h1 = decode(root.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
  assert.equal(h1, 'Human-led UGC ads. Built for paid social. Made to be tested.')
  assert.match(root, /<nav aria-label="Breadcrumb"[\s\S]*?<a href="\/"[^>]*>Home<\/a>[\s\S]*?UGC Video Agency/)
  const portfolio = selectDisplayable().length > 0
  // hero (h1) + [work] + process + results + faq, then the final CTA
  assert.equal((root.match(/<h2[\s>]/g) || []).length, (portfolio ? 4 : 3) + 1, 'work (only with approved videos), process, results, faq, final CTA')
  for (const id of ['how-it-works', 'results', 'ugc-faq', 'get-started']) assert.ok(root.includes(`id="${id}"`), id)
  assert.equal(root.includes('id="work"'), portfolio, 'the portfolio section exists only when approved videos exist')
  // the redundant sections are gone
  for (const id of ['what-is-ugc', 'whats-included', 'creative-craft', 'pricing', 'usage-rights', 'best-suited', 'ugc-process-old']) assert.ok(!root.includes(`id="${id}"`), `${id} was removed`)
  for (const f of ['UgcDefinition', 'UgcBatch', 'UgcCraft', 'UgcPricing', 'UgcRights', 'UgcFit']) assert.ok(!fs.existsSync(path.join(ROOT, `src/components/ugc/${f}.jsx`)), `${f} was removed`)
  assert.ok(!/min-h-\[100svh\]/.test(root), 'no suspense fallback left in the static HTML')
})

test('static HTML: the Free Creative Growth Roadmap is the primary CTA; pricing is the secondary path; contextual links reach Pricing, the case study and the hooks page', () => {
  const root = rootOf(page(PATH))
  const roadmap = (root.match(/href="\/creative-growth-roadmap"/g) || []).length
  assert.ok(roadmap >= 3, `Roadmap CTAs: ${roadmap}`)
  assert.ok(root.includes('Get 5 Free Ad Concepts'))
  for (const href of ['/pricing#packages', '/pricing#pricing-faq', '/pricing#package-info', '/case-studies/elyon', '/free-hooks']) assert.ok(root.includes(`href="${href}"`), href)
  // in the hero the lime Roadmap button comes before the secondary pricing button
  assert.ok(root.indexOf('/creative-growth-roadmap') < root.indexOf('/pricing#packages'))
  // the final CTA is short: the headline, one button and one line, not a content section
  const cta = root.slice(root.indexOf('id="get-started"'), root.indexOf('</section>', root.indexOf('id="get-started"')))
  assert.ok(cta.includes('Ready to see what your next five ad concepts could look like?'))
  assert.ok(textOf('<div id="root">' + cta).length < 520, 'the final CTA stays short')
})

test('static HTML: every FAQ question, answer and contextual link is in the page, and the list is 14 long', () => {
  const root = rootOf(page(PATH))
  const t = textOf(page(PATH))
  assert.equal(UGC_FAQ.length, 14)
  assert.equal(new Set(UGC_FAQ.map((f) => f.id)).size, UGC_FAQ.length)
  for (const f of UGC_FAQ) {
    assert.ok(t.includes(decode(f.q)), `question: ${f.q}`)
    for (const para of f.a) assert.ok(t.includes(para), `answer: ${para.slice(0, 50)}`)
    for (const l of f.links ?? []) assert.ok(root.includes(`href="${l.href}"`) && t.includes(l.label), `link: ${l.label}`)
  }
  // the buyer objections from the Reddit research and keyword analysis are each answered
  const qs = UGC_FAQ.map((f) => f.q).join(' | ')
  for (const topic of [/UGC agency/, /influencer/, /real people or by AI/, /choose creators/, /cost/, /concepts and versions/, /one-off/, /how long/i, /usage rights/, /raw footage/, /revisions/, /other languages/, /scripts and handles creative strategy/]) assert.match(qs, topic)
})

// ── claims and positioning ───────────────────────────────────────────────────────────────
test('human-created positioning: 100% human-created UGC, no AI-assisted or AI-generated UGC language, no business-wide "no AI" claim', () => {
  const t = textOf(page(PATH))
  const src = ['src/components/ugc', 'src/seo/ugcFaq.js', 'src/content/ugcProof.js'].flatMap((p) => (fs.statSync(path.join(ROOT, p)).isDirectory() ? fs.readdirSync(path.join(ROOT, p)).map((f) => `${p}/${f}`) : [p])).map(read).join('\n')
  assert.match(t, /100% human-created, featuring real human creators/)
  assert.match(t, /never present paid creators as genuine customers/)
  assert.ok(!/AI-assisted|AI assisted|AI tools|AI-generated|AI avatars?|synthetic/i.test(t + src.replace(/\/\*[\s\S]*?\*\//g, '')), 'no AI-assisted / AI-generated language in the UGC page')
  assert.ok(!/never use AI|no AI\b|without AI|AI-free|we do not use AI|we don.t use AI/i.test(t), 'no claim that CONVRT never uses AI anywhere')
})

test('no unsupported claims: no rankings, superlatives or guarantees; every "guarantee" is a denial', () => {
  const t = textOf(page(PATH)).replace(/Our best UGC work/g, '') // the owner-specified section heading (shown only with approved videos)
  assert.ok(!/\b(the best|best (UGC|agency|studio|in)|#1|number one|top-rated|leading|award|ranked)\b/i.test(t), 'no superlatives or rankings')
  assert.ok(!/\b\d[\d,]*\+?\s+(creators|brands|clients|customers)\b/i.test(t.replace(/\b0\d(?= [A-Z])/g, '§')), 'no creator / client counts (stage numerals like "02 Creators & Scripts" are not counts)')
  for (const s of t.split(/(?<=[.!?])\s+/).filter((x) => /guarant/i.test(x))) assert.ok(/never|not a|can['’]t|don['’]t|not typical/i.test(s), `guarantee only as a denial: ${s}`)
})

test('international, multilingual and industry-neutral: nothing restricts the service to certain industries or countries', () => {
  const t = textOf(page(PATH))
  assert.match(t, /international, multilingual UGC agency and creative production studio/)
  assert.match(t, /across industries, including but not limited to SaaS, e-commerce, apps, technology and consumer products/)
  assert.match(t, /Share a few brand details, then book a free strategy session where we present five personalized ad concepts\. Brands in every industry are welcome, subject to a short fit check\. No obligation\./)
  assert.ok(!/(only|just|exclusively|currently) (for|designed for|offered to|open to) (SaaS|e-commerce)/i.test(t))
  assert.ok(!/\b(UK|United Kingdom|Dubai|UAE|London) (brands|clients|only)/i.test(t), 'no market restriction or unverified market claims')
  assert.ok(!/who it isn['’]t for|probably not|not a fit|isn['’]t for you/i.test(t), 'no negative fit list')
})

test('turnaround: the clock starts when concepts and scripts are approved (10 / 15 business days); shipping is explained separately', () => {
  const t = textOf(page(PATH))
  assert.ok(t.includes(`${SPRINT.turnaroundBusinessDays} business days`) && t.includes(`${SPRINT_PLUS.turnaroundBusinessDays} business days`))
  assert.ok(t.includes(`The clock starts ${TURNAROUND.startsAt}`))
  assert.ok(t.includes(TURNAROUND.note))
  assert.ok(!/after (the )?(product|shipping) (delivery|arrives|is received)|once the product (arrives|is delivered)/i.test(t), 'the clock is not tied to product delivery')
  assert.ok(t.includes(PRODUCT_REQUIREMENTS.physical) && t.includes(PRODUCT_REQUIREMENTS.saas), 'product shipping and access are explained separately from the clock')
})

test('deliverables: 10 and 20 FINISHED AD VERSIONS (concepts × 2 versions), included in the totals, never extra videos; one term everywhere', () => {
  const t = textOf(page(PATH))
  assert.equal(SPRINT.concepts * SPRINT.variationsPerConcept, SPRINT.variations)
  assert.equal(SPRINT_PLUS.concepts * SPRINT_PLUS.variationsPerConcept, SPRINT_PLUS.variations)
  assert.deepEqual([SPRINT.concepts, SPRINT.variations, SPRINT_PLUS.concepts, SPRINT_PLUS.variations], [5, 10, 10, 20], 'quantities are unchanged')
  for (const p of [SPRINT, SPRINT_PLUS]) assert.ok(t.includes(packageEquation(p)), p.name)
  assert.equal(packageEquation(SPRINT), '5 concepts × 2 versions = 10 finished ad versions')
  assert.equal(adVersions(20), '20 finished ad versions')
  assert.match(t, /Each concept comes in 2 versions, such as a different hook or call to action\. The finished ad version totals in our packages already include them, so they are not extra videos on top\./)
  assert.ok(!/ad variations/i.test(t), 'the UGC page never says "ad variations"')
  // the Pricing page and the shared data say exactly the same thing
  const pricing = textOf(page('/pricing'))
  assert.ok(pricing.includes('10 finished ad versions') && pricing.includes('20 finished ad versions') && !/ad variations/i.test(pricing), 'Pricing page wording is synchronised')
  assert.ok(JSON.stringify(jsonLdFor('/pricing', SITE_SEO['/pricing'])).includes('(10 finished ad versions)'))
  assert.ok(JSON.stringify(jsonLdFor(PATH, SITE_SEO[PATH])).includes('10 finished ad versions') && !/ad variations/.test(JSON.stringify(jsonLdFor(PATH, SITE_SEO[PATH]))))
})

// ── commercial figures come from the data ─────────────────────────────────────────────────
test('pricing in the FAQ: recurring and one-off prices, commitment and extension prices are the business-data figures; the full detail is linked', () => {
  const t = textOf(page(PATH))
  assert.ok(t.includes(`Our UGC production packages start at ${formatMoney(SPRINT.monthly)} a month`))
  for (const p of [SPRINT, SPRINT_PLUS]) {
    assert.ok(t.includes(formatMoney(p.monthly)) && t.includes(formatMoney(p.oneOff)), p.name)
    for (const e of p.usageExtensions) assert.ok(t.includes(formatMoney(e.price)), `${p.name} ${e.months}m extension`)
  }
  assert.ok(t.includes(formatMoney(RAW_FOOTAGE.price)))
  assert.ok(rootOf(page(PATH)).includes('href="/pricing#packages"') && rootOf(page(PATH)).includes('href="/pricing#package-info"'), 'complete pricing and contract detail stays on the Pricing page')
  assert.ok(t.includes(`${COMMITMENT.initialMonths}-month commitment`) && t.includes(`${COMMITMENT.cancellationNoticeDays} days`))
  assert.ok(t.includes('Prices are in US dollars and exclude VAT'))
  assert.ok(t.includes(`${USAGE_RIGHTS.includedMonths} months of worldwide usage rights`))
})

test('no commercial figure is hard-coded in the UGC components or FAQ (all read from src/seo/businessKnowledge.js)', () => {
  const dir = path.join(ROOT, 'src/components/ugc')
  const files = [...fs.readdirSync(dir).map((f) => path.join('src/components/ugc', f)), 'src/seo/ugcFaq.js', 'src/UgcVideoAgencyPage.jsx']
  for (const f of files) {
    const code = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    assert.ok(!/\$\s?\d/.test(code), `${f}: a dollar amount is typed in the source`)
    assert.ok(!/\b(2,?500|3,?000|4,?500|5,?400)\b/.test(code), `${f}: a package price is typed in the source`)
  }
})

// ── proof ───────────────────────────────────────────────────────────────────────────────
test('Elyon 5.28x: one creator-led UGC video, client-reported, early learning phase, with the case-study link; no invented metrics', () => {
  const t = textOf(page(PATH))
  assert.deepEqual([ELYON_PROOF.roas, ELYON_PROOF.purchases, ELYON_PROOF.revenue], ['5.28x', 9, '$3,421.25'])
  const src = read('src/components/elyon/ElyonPerformance.jsx')
  assert.ok(src.includes('value="5.28x"') && src.includes('value="9"') && src.includes('value="$3,421.25"'), 'figures match the Elyon case study')
  assert.equal((t.match(/5\.28x/g) || []).length >= 1, true)
  assert.match(t, /a single creator-led UGC video reached 5\.28x ROAS, with 9 purchases and \$3,421\.25 in reported revenue/)
  assert.match(t, /one individual creative, reported by the client during an early learning phase/)
  assert.match(t, /not typical, not a guarantee and not representative of all campaigns/)
  assert.ok(rootOf(page(PATH)).includes('href="/case-studies/elyon"'))
  const proof = t.slice(t.indexOf('ROAS, one UGC video'), t.indexOf('Read the full Elyon case study'))
  assert.ok(proof.length > 200, 'the proof block was found')
  assert.ok(!/ad spend|spent|reporting period|\bROAS of\b|3\.63x|5\.10x|3\.17x|\$229|\$835/i.test(proof), 'no ad spend, period or other metrics')
})

test('testimonials: verbatim, attributed as on the homepage, clearly separated from the portfolio; no stars, ratings or repeat-order statistic', () => {
  const t = textOf(page(PATH))
  const src = read('src/components/Testimonials.jsx')
  assert.equal(UGC_TESTIMONIALS.length, 2)
  for (const q of UGC_TESTIMONIALS) {
    assert.ok(src.includes(q.quote), `${q.brand}: quote is word-for-word the homepage quote`)
    assert.ok(t.includes(q.quote), `${q.brand}: quote is on the page unchanged`)
    assert.ok(src.includes(`brand: '${q.brand}'`), `${q.brand}: brand`)
    assert.ok(src.includes(`${q.category}'`) || src.includes(`category: '${q.category}'`), `${q.brand}: category attribution as published`)
  }
  assert.ok(t.includes('Adscale · SaaS · Paid Social') || (t.includes('Adscale') && t.includes('SaaS · Paid Social')), 'attribution as published')
  assert.ok(!/Talk360/.test(t), 'the Talk360 quote is not used (not confirmed as UGC)')
  assert.ok(!/aggregateRating|"Review"|reviewRating/.test(JSON.stringify(pageHead(PATH).jsonLd)))
  assert.ok(!/(\d+|two|three)\s+(repeat|returning)\s+(clients|customers|orders)|repeat[- ]client(s)?\b/i.test(t), 'no standalone repeat-client statistic')
})

// ── structured data ──────────────────────────────────────────────────────────────────────
test('JSON-LD: Organization, WebPage, BreadcrumbList, Service (+ Offers from the data) and an FAQPage generated from the visible FAQ', () => {
  const g = ugcGraph(SITE_SEO[PATH])['@graph']
  assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage'])
  assert.equal(jsonLdFor(PATH, SITE_SEO[PATH])['@graph'].length, g.length)
  const [, web, crumb, svc, faq] = g
  assert.equal(web.url, URL_)
  assert.equal(web.about['@id'], svc['@id'])
  assert.deepEqual(crumb.itemListElement.map((i) => [i.position, i.name, i.item]), [[1, 'Home', `${SITE_URL}/`], [2, 'UGC Video Agency', URL_]])
  assert.deepEqual(Object.keys(BREADCRUMB_TRAILS), ['/pricing', PATH])
  assert.equal(svc.provider['@id'], ORG_ID)
  assert.ok(svc.isRelatedTo.some((r) => r['@id'] === serviceId('ugc')))
  const prices = svc.offers.map((o) => o.priceSpecification.price)
  assert.deepEqual(prices, [SPRINT.monthly.amount, SPRINT.oneOff.amount, SPRINT_PLUS.monthly.amount, SPRINT_PLUS.oneOff.amount])
  assert.ok(svc.offers.every((o) => o.priceSpecification.priceCurrency === 'USD' && o.priceSpecification.valueAddedTaxIncluded === false))
  assert.equal(faq.mainEntity.length, UGC_FAQ.length)
  UGC_FAQ.forEach((f, i) => {
    assert.equal(faq.mainEntity[i].name, f.q)
    assert.equal(faq.mainEntity[i].acceptedAnswer.text, ugcFaqText(f))
  })
  assert.ok(!/aggregateRating|"review"|"address"|"award"|areaServed|VideoObject|"Product"|"Person"/.test(JSON.stringify(g)), 'nothing the page does not show')
})

test('JSON-LD is in the static HTML, valid JSON, and equal to the manifest graph', () => {
  const html = page(PATH)
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1].replace(/\\u003c/g, '<')))
  assert.equal(blocks.length, 1)
  assert.deepEqual(blocks[0], JSON.parse(JSON.stringify(pageHead(PATH).jsonLd)))
})

// ── portfolio data model ─────────────────────────────────────────────────────────────────
const sample = (over = {}) => ({
  id: 'sample-a', creatorId: 'c-test-1', brand: 'Sample Brand', category: 'Sample category', industry: 'beauty', languages: ['es'],
  caption: 'A sample caption for tests.', source: { mp4: '/videos/sample.mp4' }, poster: '/portfolio/sample.webp',
  approval: { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'test', approvedOn: '2026-01-01' },
  ...over,
})

test('portfolio: the shipped list is valid, has unique ids, and only approved items would ever render', () => {
  const ids = UGC_PORTFOLIO.map((i) => i.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const i of UGC_PORTFOLIO) assert.deepEqual(portfolioProblems(i), [], i.id)
  // the owner confirmed: the existing Adscale and Elyon clips are NOT portfolio material
  assert.ok(UGC_PORTFOLIO.every((i) => !/adscale|elyon|graspo/i.test(JSON.stringify(i))), 'no Adscale / Elyon / Graspo clips in the portfolio')
})

test('portfolio gate: renders only with status "approved" AND portfolio permission AND creator consent', () => {
  assert.equal(isDisplayable(sample()), true)
  for (const approval of [
    { status: 'pending', portfolioUse: true, creatorConsent: true },
    { status: 'approved', portfolioUse: false, creatorConsent: true },
    { status: 'approved', portfolioUse: true, creatorConsent: false },
    { status: 'approved', portfolioUse: 'yes', creatorConsent: true },
    { status: 'approved', creatorConsent: true },
    {},
  ]) assert.equal(isDisplayable(sample({ approval })), false, JSON.stringify(approval))
  assert.equal(isDisplayable(sample({ approval: undefined })), false)
  assert.equal(isDisplayable(sample({ caption: '' })), false)
  assert.equal(isDisplayable(sample({ languages: [] })), false)
  assert.equal(isDisplayable(sample({ languages: ['Spanish'] })), false)
  assert.equal(isDisplayable(sample({ source: {} })), false)
  assert.equal(isDisplayable(sample({ source: { mp4: '/a.mp4' }, poster: undefined })), false, 'an mp4 needs a poster')
  assert.equal(isDisplayable(sample({ source: { cloudflareId: 'abc123' }, poster: undefined })), true, 'Cloudflare derives a thumbnail')
  assert.match(posterUrl(sample({ source: { cloudflareId: 'abc123' }, poster: undefined })), /videodelivery\.net\/abc123\/thumbnails/)
  assert.deepEqual(selectDisplayable([sample(), sample({ id: 'b', approval: { status: 'draft' } })]).map((i) => i.id), ['sample-a'])
})

test('portfolio: a creator name is shown only with explicit permission; the internal creator id never is', () => {
  assert.equal(creatorLabel(sample({ creator: { displayName: 'Ana', showName: true } })), 'Ana')
  assert.equal(creatorLabel(sample({ creator: { displayName: 'Ana', showName: false } })), null)
  assert.equal(creatorLabel(sample({ creator: { displayName: 'Ana' } })), null)
  assert.equal(creatorLabel(sample()), null)
  const html = renderToStaticMarkup(createElement(UgcWork.PortfolioGrid, { items: [sample({ creator: { displayName: 'Ana', showName: false } })] }))
  assert.ok(!html.includes('Ana') && !html.includes('c-test-1'))
})

test('portfolio filters: language and category (SaaS, E-commerce, Apps, Other) facets appear only with two or more values, and filtering matches either field', () => {
  const one = [sample()]
  assert.deepEqual(buildFacets(one), { language: [], category: [] })
  const two = [sample(), sample({ id: 'sample-b', languages: ['ar', 'en'], industry: 'saas' })]
  const f = buildFacets(two)
  assert.deepEqual(f.language.map((x) => [x.value, x.label, x.count]), [['ar', 'Arabic', 1], ['en', 'English', 1], ['es', 'Spanish', 1]])
  assert.deepEqual(f.category.map((x) => [x.value, x.label]), [['saas', 'SaaS'], ['other', 'Other']], 'SaaS, E-commerce, Apps and Other: only those with approved videos; beauty groups under Other')
  assert.equal(matchesFilters(two[1], { language: 'en' }), true)
  assert.equal(matchesFilters(two[0], { language: 'en' }), false)
  assert.equal(matchesFilters(two[1], { language: 'en', category: 'other' }), false)
  assert.equal(matchesFilters(two[0], { category: 'other' }), true)
  assert.equal(categoryOf(sample({ industry: 'technology' })), 'app')
  assert.equal(categoryOf(sample({ industry: 'ecommerce' })), 'ecommerce')
  assert.equal(buildFacets([sample({ industry: 'ecommerce' }), sample({ id: 'b', industry: 'app', languages: ['en'] }), sample({ id: 'c', industry: 'saas' })]).category.map((x) => x.label).join(), 'SaaS,E-commerce,Apps')
  assert.equal(matchesFilters(two[0], {}), true)
})

test('portfolio render: poster-first (no video element, no streaming request until a tap); filter controls only when useful', () => {
  const solo = renderToStaticMarkup(createElement(UgcWork.PortfolioGrid, { items: [sample()] }))
  assert.ok(!/<video/.test(solo) && !/<source/.test(solo), 'no video element before a tap')
  assert.ok(!/autoplay/i.test(solo))
  assert.ok(solo.includes('loading="lazy"') && solo.includes('/portfolio/sample.webp'))
  assert.ok(!/aria-pressed/.test(solo), 'a single language and industry: no filter controls')
  assert.match(solo, /aria-label="Play video: A sample caption for tests\."/)
  assert.match(solo, />ES</, 'a language badge on the card')
  const duo = renderToStaticMarkup(createElement(UgcWork.PortfolioGrid, { items: [sample(), sample({ id: 'sample-b', languages: ['en'], industry: 'saas' })] }))
  assert.ok(/aria-pressed="true"[^>]*>All</.test(duo) && /English\s*<span[^>]*>1<\/span>/.test(duo) && /Spanish\s*<span[^>]*>1<\/span>/.test(duo) && /SaaS\s*<span/.test(duo), 'filters rendered with counts')
  assert.match(duo, /2 videos/)
  assert.equal((duo.match(/<li /g) || []).length, 2)
})

test('portfolio scales: "Show more" pages through a large library without rendering every video at once', () => {
  const many = Array.from({ length: 8 }, (_, i) => sample({ id: `sample-${i}`, languages: [i % 2 ? 'en' : 'es'] }))
  const html = renderToStaticMarkup(createElement(UgcWork.PortfolioGrid, { items: many, pageSize: 3 }))
  assert.equal((html.match(/<li /g) || []).length, 3, 'only one page of cards in the DOM')
  assert.match(html, /Show more \(5 more\)/)
  const all = renderToStaticMarkup(createElement(UgcWork.PortfolioGrid, { items: many.slice(0, 3), pageSize: 3 }))
  assert.ok(!/Show more/.test(all), 'no button when everything fits')
})

test('portfolio absent: no section, no placeholder, no illustration and no video in the HTML; the hero is a clean text-led hero', () => {
  assert.equal(selectDisplayable().length, UGC_PORTFOLIO.filter(isDisplayable).length)
  assert.equal(renderToStaticMarkup(createElement(UgcWork.default, { items: [] })), '', 'the portfolio section renders nothing without approved videos')
  if (selectDisplayable().length > 0) return // once real videos ship, the portfolio is correctly present
  const html = page(PATH)
  const t = textOf(html)
  assert.ok(!/being updated|coming soon|portfolio is/i.test(t), 'no placeholder message')
  assert.ok(!/<video/.test(rootOf(html)) && !/videodelivery\.net/.test(rootOf(html)) && !/\.mp4/.test(rootOf(html)), 'no video or stream request in the HTML')
  assert.ok(!/<figure/.test(rootOf(html).split('id="how-it-works"')[0]), 'no illustration or stand-in visual in the hero')
  for (const s of ['Elyon Dubai', 'Get 5 Free Ad Concepts']) assert.ok(t.includes(s), s)
})

test('portfolio present: the portfolio section appears, and the hero becomes the interactive creator-video stage', () => {
  const items = [sample(), sample({ id: 'sample-b', languages: ['en'], industry: 'saas', caption: 'Second sample caption.' }), sample({ id: 'sample-c', languages: ['fr'], industry: 'app', caption: 'Third sample caption.' })]
  const work = renderToStaticMarkup(createElement(UgcWork.default, { items }))
  assert.match(work, /Our best UGC work/)
  assert.match(work, /Creator-led ads, made for paid social\./)
  assert.ok(work.includes('id="work"') && /aria-pressed/.test(work), 'category and language toggles')
  const hero = renderToStaticMarkup(createElement(UgcHero.default, { items }))
  assert.ok(hero.includes('/portfolio/sample.webp') && hero.includes('aria-roledescription="carousel"'))
  assert.ok(!/<figure/.test(hero) && !/Illustration/.test(hero), 'no illustration')
})

test('hero video stage: posters first, one active video, switchable by button, dot, card and keyboard; no video loads in the static HTML', () => {
  const items = [sample(), sample({ id: 'sample-b', languages: ['en'], industry: 'saas', caption: 'Second sample caption.' }), sample({ id: 'sample-c', languages: ['fr'], industry: 'app', caption: 'Third sample caption.' })]
  const html = renderToStaticMarkup(createElement(CreatorVideoStage.default, { items }))
  assert.ok(!/<video/.test(html) && !/autoplay/i.test(html) && !/<source/.test(html), 'only posters until the browser is idle and the stage is on screen')
  assert.equal((html.match(/<img /g) || []).length, 3, 'three posters')
  assert.ok(html.includes('fetchpriority="high"'), 'the active poster is the LCP image')
  assert.equal((html.match(/loading="lazy"/g) || []).length, 2, 'the two supporting posters are lazy')
  for (const label of ['Previous video', 'Next video', 'Video 1 of 3', 'Video 2 of 3', 'Video 3 of 3', 'Show video 2 of 3: Second sample caption.', 'Play video: A sample caption for tests.']) assert.ok(html.includes(`aria-label="${label}"`), label)
  assert.ok(/aria-current="true"/.test(html) && /tabindex="0"/.test(html) && /aria-live="polite"/.test(html), 'current video, keyboard focus and a live caption')
  assert.ok(/touch-pan-y/.test(html), 'swipe-friendly')
  assert.ok(/motion-reduce:transition-none/.test(html), 'transitions off for reduced motion')
  const one = renderToStaticMarkup(createElement(CreatorVideoStage.default, { items: [sample()] }))
  assert.ok(!/Previous video|Next video/.test(one), 'no switcher for a single video')
  const src = read('src/components/ugc/CreatorVideoStage.jsx') + read('src/components/ugc/creatorVideo.jsx')
  assert.ok(/prefers-reduced-motion: reduce/.test(src) && /saveData/.test(src), 'reduced motion and data saver are respected')
  assert.ok(/IntersectionObserver/.test(src) && /requestIdleCallback/.test(src), 'playback waits for idle and for the stage to be on screen')
  assert.ok(!/setInterval|autoAdvance/.test(src), 'no automatic carousel advance')
})

test('process: four stages with their explanations in the page text, an interactive testing diagram, no deliverables grid or eight-step timeline', () => {
  const t = textOf(page(PATH))
  for (const title of ['Research & Concepts', 'Creators & Scripts', 'Filming & Editing', 'Delivery & Creative Testing']) assert.ok(t.includes(title), title)
  // every stage explanation is in the static HTML even though only one is expanded
  for (const phrase of ['develop genuinely different creative concepts', 'You approve concepts and scripts before anything is filmed', 'Creators film natively for each format', 'guidance on what to test next', 'Brand and product discovery', 'Script development', 'Editing and captions', 'internal creative quality review']) assert.ok(t.includes(phrase), phrase)
  assert.ok(t.includes(`${REVISIONS.roundsPerConcept} rounds of revisions per concept`))
  // the testing illustration: concepts, two versions, hook or call to action, learning; and it says it is only an illustration
  for (const phrase of ['Distinct concepts', 'Two finished versions', 'One thing changed', 'Learn, then make more', 'the hook or the call to action', 'shapes the next batch of concepts', 'Illustration only, not real results']) assert.ok(t.includes(phrase), phrase)
  assert.ok(t.includes(packageEquation(SPRINT)) && t.includes(packageEquation(SPRINT_PLUS)))
  assert.ok(!/ugc-nine|nine-card|PRODUCTION_PROCESS\.map|steps\.map/.test(read('src/components/ugc/UgcProcess.jsx')), 'the eight-step timeline is not rebuilt')
  const src = read('src/components/ugc/UgcProcess.jsx')
  assert.ok(/useAutoplayAllowed/.test(src) && /Pause animation/.test(src), 'auto-advance respects reduced motion and can be paused')
})

test('nothing contractual is lost: every policy the removed sections carried is still on the page (FAQ), from the business data', () => {
  const t = textOf(page(PATH))
  const must = [
    USAGE_RIGHTS.afterExpiry.mayRemain.join(' '), USAGE_RIGHTS.afterExpiry.mustStop.join(' '), USAGE_RIGHTS.notOwnership, USAGE_RIGHTS.creatorAccountAds.summary,
    USAGE_RIGHTS.creatorAccountAds.notIncluded, REVISIONS.note, RESHOOTS.weCover, FORMATS.separateDeliverable, FORMATS.longForm, TALENT.model,
    PRODUCTION_LANGUAGES.other, PARTNERSHIP_TERMS.oneOff.toLowerCase(), PRODUCT_REQUIREMENTS.physical, PRODUCT_REQUIREMENTS.saas, TURNAROUND.note,
  ]
  for (const m of must) assert.ok(t.includes(m), `missing: ${m.slice(0, 60)}`)
  for (const m of FORMATS.included) assert.ok(t.includes(m), m)
  for (const p of [SPRINT, SPRINT_PLUS]) for (const e of p.usageExtensions) assert.ok(t.includes(`${e.months} months for ${formatMoney(e.price)}`), `${p.name} ${e.months}m extension`)
})



// ── internal links ───────────────────────────────────────────────────────────────────────
test('internal links into the page: homepage Services line and UGC FAQ, Pricing, Elyon case study and the footer', () => {
  const link = (h) => rootOf(h).includes(`href="${PATH}"`)
  assert.ok(link(page('/')), 'homepage')
  const home = rootOf(page('/'))
  assert.match(home, /See how our UGC video production works/)
  assert.match(home, /Learn about our UGC video production/)
  assert.ok(link(page('/pricing')) && /See how our UGC production works/.test(rootOf(page('/pricing'))), 'pricing')
  assert.ok(link(page('/case-studies/elyon')), 'Elyon case study')
  for (const p of ['/', '/pricing', '/creative-growth-roadmap']) assert.match(rootOf(page(p)), /<a [^>]*href="\/ugc-video-agency"[^>]*>UGC Video Agency<\/a>/, `footer link on ${p}`)
  // the homepage FAQ JSON-LD is unchanged by the link (links are not part of the answer text)
  assert.ok(!JSON.stringify(jsonLdFor('/')).includes('ugc-video-agency'))
})

// ── Roadmap eligibility ──────────────────────────────────────────────────────────────────
test('Roadmap: eligibility copy no longer restricts the offer to SaaS and e-commerce; the form offers every industry', () => {
  for (const f of ['src/components/roadmap/RoadmapHero.jsx', 'src/components/roadmap/RoadmapFAQ.jsx', 'src/components/roadmap/RoadmapApplication.jsx', 'src/components/hooks/RoadmapUpsell.jsx']) {
    assert.ok(!/(for|to|designed for|built for) (qualifying )?SaaS and e-?commerce/i.test(read(f)), `${f}: still restricts eligibility`)
  }
  assert.ok(!/SaaS or e-commerce brand/.test(SITE_SEO['/creative-growth-roadmap'].description))
  assert.match(read('src/components/roadmap/RoadmapHero.jsx'), /For brands in every industry\. No obligation\./)
  assert.ok(BUSINESS_TYPE_OPTIONS.includes('Other brand or business') && BUSINESS_TYPE_OPTIONS.includes('App / Technology') && BUSINESS_TYPE_OPTIONS.includes('Consumer products'))
  const html = page('/creative-growth-roadmap')
  assert.ok(!/designed for SaaS and E-commerce brands/.test(html))
  // the other legitimate qualification rules and the Calendly step are untouched
  assert.match(read('src/lib/roadmapQualification.js'), /QUALIFYING_TIMELINES = \['Immediately \/ This month', 'Within 1–3 months'\]/)
  assert.match(read('src/components/roadmap/RoadmapApplication.jsx'), /RoadmapBooking bookingUrl=\{ROADMAP_BOOKING_URL\}/)
})

// ── readability ──────────────────────────────────────────────────────────────────────────
test('readability: no low-contrast text colour in the UGC components; headings never skip a level', () => {
  const dir = path.join(ROOT, 'src/components/ugc')
  for (const f of fs.readdirSync(dir)) {
    const code = read(path.join('src/components/ugc', f))
    for (const line of code.split('\n').filter((l) => /text-ink-subtle/.test(l))) assert.ok(/aria-hidden="true"/.test(line), `${f}: secondary copy must use text-ink-muted (AA contrast), not ink-subtle: ${line.trim().slice(0, 80)}`)
    // the process visuals and the testing diagram are decorative (aria-hidden); the same words are in the readable text beside them
    assert.ok(!/text-\[(9|10|11)px\]/.test(code.replace(/uppercase[^"']*/g, '')) || /UgcHero|UgcProcess|TestingDiagram|CreatorVideoStage/.test(f), `${f}: tiny text`)
  }
  const root = rootOf(page(PATH))
  const levels = [...root.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1])
  assert.equal(levels[0], 1)
  for (let i = 1; i < levels.length; i++) assert.ok(levels[i] - levels[i - 1] <= 1, `heading level jumps ${levels[i - 1]} → ${levels[i]} at #${i}`)
  assert.ok(!levels.includes(4), 'no h4 needed')
})

test('page length: tighter vertical rhythm, five sections, and no repeated blocks of the same information', () => {
  assert.match(read('src/components/ugc/shared.jsx'), /py-10 md:py-14/)
  const t = textOf(page(PATH))
  assert.ok((t.match(/relevant work samples/g) || []).length <= 3, 'samples are not restated in every section')
  assert.ok(t.length < 26000, `the page text is ${t.length} characters; it must stay lean`)
  const page_ = read('src/UgcVideoAgencyPage.jsx')
  for (const c of ['UgcHero', 'UgcWork', 'UgcProcess', 'UgcResults', 'UgcFAQ', 'UgcFinalCTA']) assert.ok(page_.includes(`<${c}`), c)
})

