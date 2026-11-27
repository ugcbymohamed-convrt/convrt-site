/* ─────────────────────────────────────────────
   PROJECT APPLICATION (/project-application): the purchase-intent funnel.

   One reusable application for every package. A visitor who picked a package on /pricing arrives here with `?package=<id>&billing=<monthly|one-time>`; the page and the server
   both turn that pair into the package's price, currency, deliverables and commitment through the EXISTING pricing configuration, never through anything the browser sends:

     • English: the business data (src/seo/businessKnowledge.js, USD).
     • Spanish / French: the owner-approved EUR table (src/i18n/es/pricing.js, reused by French).
     • Arabic: the same USD amounts as English (src/i18n/ar/pricing.js).

   Pure module (no React, no Vite): it runs in the browser, in the serverless function (api/_lib/projectApplication.js) and in `node --test`.
   Nothing here prices anything: `selectionFor()` only LOOKS UP a price by its key.

   Option ids are stable English slugs shared by the browser and the server; the words shown to each language live in src/i18n/projectApplicationCopy.js and the English
   labels used in the owner's email live in OPTION_LABELS_EN below. Nothing here qualifies or disqualifies anyone: every valid application is reviewed by the owner.
───────────────────────────────────────────── */

import { SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT, USAGE_RIGHTS } from '../seo/businessKnowledge.js'
import { priceOf } from '../i18n/pricing.js'
import { DEFAULT_LOCALE, isLocale } from '../i18n/locales.js'

export { PROJECT_APPLICATION_PATH } from '../config.js'

/* ── packages ─────────────────────────────────────────────────────────────────────────── */
/* `data` is the business-data package (null for custom projects, which have no price anywhere). `billings` lists what the package can be bought as; the URL value 'one-time' maps to the
   business data's `oneOff` price. Organic packages exist monthly only (no one-off option) and Custom has no billing at all. */
const PACKAGES = {
  sprint: { id: 'sprint', category: 'paid', custom: false, data: SPRINT, billings: ['monthly', 'one-time'], keys: { monthly: 'monthly', 'one-time': 'oneOff' } },
  'sprint-plus': { id: 'sprint-plus', category: 'paid', custom: false, data: SPRINT_PLUS, billings: ['monthly', 'one-time'], keys: { monthly: 'monthly', 'one-time': 'oneOff' } },
  'organic-light': { id: 'organic-light', category: 'organic', custom: false, data: ORGANIC.light, billings: ['monthly'], keys: { monthly: 'monthly' } },
  'organic-growth': { id: 'organic-growth', category: 'organic', custom: false, data: ORGANIC.growth, billings: ['monthly'], keys: { monthly: 'monthly' } },
  'custom-paid': { id: 'custom-paid', category: 'paid', custom: true, data: null, billings: [], keys: {} },
  'custom-organic': { id: 'custom-organic', category: 'organic', custom: true, data: null, billings: [], keys: {} },
}
export const PACKAGE_IDS = Object.keys(PACKAGES)
export const BILLING_VALUES = ['monthly', 'one-time']

/* The English name of each package, for the owner's email and the analytics-free log lines. Visitor-facing names are in the copy module. */
export const PACKAGE_NAMES_EN = {
  sprint: 'Creative Testing Sprint',
  'sprint-plus': 'Creative Testing Sprint Plus',
  'organic-light': 'Organic Light',
  'organic-growth': 'Organic Growth',
  'custom-paid': 'Custom paid advertising production',
  'custom-organic': 'Custom organic content production',
}
export const BILLING_LABELS_EN = { monthly: 'Monthly', 'one-time': 'One-time' }

/* The currency a language is priced in (documentation and tests; the amount itself always comes from priceOf / the business data). */
export const CURRENCY_OF = { en: 'USD', es: 'EUR', fr: 'EUR', ar: 'USD' }

/* Resolve a (locale, package, billing) triple into everything the page and the email show. Returns null for an unknown locale/package or a billing option the package does not offer
   (`billing` may be omitted for Organic and Custom; for a Sprint it defaults to 'monthly' only when `defaultBilling` is true: the page does, the server does not). */
export function selectionFor(locale, packageId, billing, { defaultBilling = false } = {}) {
  if (!isLocale(locale)) return null
  const pkg = Object.prototype.hasOwnProperty.call(PACKAGES, packageId) ? PACKAGES[packageId] : null
  if (!pkg) return null

  let chosen = null
  if (pkg.billings.length) {
    if (billing === undefined || billing === null || billing === '') {
      if (pkg.billings.length === 1) chosen = pkg.billings[0]
      else if (defaultBilling) chosen = 'monthly'
      else return null
    } else if (pkg.billings.includes(billing)) chosen = billing
    else return null
  }

  const out = { packageId: pkg.id, category: pkg.category, custom: pkg.custom, billing: chosen, locale }
  if (pkg.custom) return { ...out, priceKey: null, amount: null, currency: null, commitmentMonths: 0, cancellationNoticeDays: 0, usageMonths: 0 }

  const usd = pkg.data[pkg.keys[chosen]]
  const price = locale === DEFAULT_LOCALE ? { key: null, amount: usd.amount, currency: usd.currency } : priceOf(locale, usd)
  if (!Number.isFinite(price.amount)) return null // a language whose price is not approved never gets an application with a made-up number
  const paid = pkg.category === 'paid'
  return {
    ...out,
    priceKey: price.key,
    amount: price.amount,
    currency: price.currency,
    // Commitment: Sprint(+) monthly = the 3-month initial commitment then month-to-month with notice; one-time = none; Organic = the 6-month initial commitment (what follows is "set out in the applicable agreement").
    commitmentMonths: paid ? (chosen === 'monthly' ? COMMITMENT.initialMonths : 0) : ORGANIC_COMMITMENT.initialMonths,
    cancellationNoticeDays: paid && chosen === 'monthly' ? COMMITMENT.cancellationNoticeDays : 0,
    // Deliverables (paid) or cadence (organic), straight from the business data.
    ...(paid
      ? { concepts: pkg.data.concepts, scripts: pkg.data.scripts, variationsPerConcept: pkg.data.variationsPerConcept, variations: pkg.data.variations, maxCreators: pkg.data.maxCreators, turnaroundBusinessDays: pkg.data.turnaroundBusinessDays, revisionRoundsPerConcept: pkg.data.revisionRoundsPerConcept, usageMonths: pkg.data.usageMonthsIncluded }
      : { cadence: pkg.data.cadence, usageMonths: 0 }),
  }
}
export { USAGE_RIGHTS }

/* Read ?package=…&billing=… (the page's own URL). Unknown values give null, never an exception. `from` is a whitelisted source label for analytics only. */
export function selectionFromSearch(locale, search) {
  const q = new URLSearchParams(search || '')
  return selectionFor(locale, q.get('package') ?? '', q.get('billing') ?? '', { defaultBilling: true })
}
export const SOURCE_PAGES = ['pricing']
export const sourceFromSearch = (search) => {
  const v = new URLSearchParams(search || '').get('from')
  return SOURCE_PAGES.includes(v) ? v : 'direct'
}

/* The page URL for a package (what a pricing CTA links to). Only identifiers travel in the URL: never a price, a name, an email or any answer. */
export function applicationHref(localizedBasePath, packageId, billing, from = 'pricing') {
  const q = new URLSearchParams({ package: packageId })
  if (billing) q.set('billing', billing)
  if (from) q.set('from', from)
  return `${localizedBasePath}?${q.toString()}`
}

/* ── qualification options (ids) ──────────────────────────────────────────────────────── */
export const OPTION_LABELS_EN = {
  adSpend: { none: 'Not running paid ads yet', 'under-5k': 'Under 5,000', '5k-15k': '5,000–15,000', '15k-50k': '15,000–50,000', '50k-plus': '50,000+' },
  paidObjective: { launch: 'Launch a new product or campaign', test: 'Test new advertising concepts', scale: 'Scale existing campaigns', improve: 'Improve advertising creative performance', other: 'Other' },
  socialActivity: { starting: 'We are just getting started', occasional: 'We publish occasionally', regular: 'We publish regularly but need better content', outsource: 'We want to outsource content production and management' },
  organicObjective: { awareness: 'Build brand awareness', presence: 'Establish a consistent social media presence', inquiries: 'Generate commercial inquiries', engagement: 'Improve audience engagement', markets: 'Expand into new markets', other: 'Other' },
  productionType: { ugc: 'UGC videos', spokesperson: 'Spokesperson videos', organic: 'Organic social videos', saas: 'SaaS and app videos', other: 'Other video production requirements' },
  budget: { 'under-3k': 'Under 3,000', '3k-6k': '3,000–6,000', '6k-12k': '6,000–12,000', '12k-25k': '12,000–25,000', '25k-plus': '25,000+', unsure: 'Not sure yet' },
  readiness: { asap: 'As soon as possible', '30-days': 'Within 30 days', '1-3-months': 'Within 1–3 months', exploring: 'Still exploring' },
  language: { en: 'English', es: 'Spanish', fr: 'French', ar: 'Arabic', other: 'Other' },
}
export const OPTION_IDS = Object.fromEntries(Object.entries(OPTION_LABELS_EN).map(([k, v]) => [k, Object.keys(v)]))
/* Currency of the ranges (qualification ranges, not conversions): Spanish and French show euros, English and Arabic dollars. */
export const RANGE_CURRENCY = { en: 'USD', es: 'EUR', fr: 'EUR', ar: 'USD' }

/* ── which questions a package gets (the conditional logic, in one place) ─────────────── */
export function questionsFor(selection) {
  const paid = selection.category === 'paid'
  return {
    adSpend: paid, // Sprint, Sprint Plus, custom paid
    paidObjective: paid,
    socialActivity: !paid, // Organic Light, Organic Growth, custom organic
    organicObjective: !paid,
    socialAccounts: !paid,
    productionType: selection.custom, // custom inquiries only
    budget: selection.custom,
  }
}

/* ── fields, limits, normalisation ────────────────────────────────────────────────────── */
export const LIMITS = { name: 100, email: 254, company: 120, url: 300, description: 1500, other: 200, accounts: 500, languageOther: 100 }

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{16,64}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

const str = (v) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim() : '')
const list = (v, ids) => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string' && ids.includes(x)))] : [])

/* A brand URL as the owner will read it: https URL, a real host name, no credentials, no control characters. Accepts "brand.com", "instagram.com/brand", "https://apps.apple.com/…".
   Returns '' when it is not a safe http(s) URL. The value is only ever shown as TEXT in the owner's email (HTML-escaped there). */
export function normalizeUrl(value) {
  const v = str(value)
  if (!v || /[\s<>"'`\\]/.test(v)) return ''
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`
  let u
  try { u = new URL(withScheme) } catch { return '' }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return ''
  if (u.username || u.password) return ''
  if (!/^[^\s/@.]+(\.[^\s/@.]+)*\.[^\s/@.]{2,}$/i.test(u.hostname) && !/^xn--/i.test(u.hostname)) return ''
  const out = u.toString()
  return out.length > LIMITS.url ? '' : out
}

export const EMPTY_FIELDS = {
  fullName: '', email: '', company: '', url: '',
  description: '', paidObjective: '', organicObjective: '', objectiveOther: '', adSpend: '', socialActivity: '', socialAccounts: '',
  productionType: [], budget: '', readiness: '', startDate: '', language: [], languageOther: '', acknowledged: false,
}

/* Trim and constrain every field. Always returns every key with its own type (strings, arrays, boolean). Unknown ids are dropped. */
export function normalizeFields(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  return {
    fullName: str(src.fullName),
    email: str(src.email).toLowerCase(),
    company: str(src.company),
    url: normalizeUrl(src.url),
    urlRaw: str(src.url),
    description: str(src.description),
    paidObjective: OPTION_IDS.paidObjective.includes(src.paidObjective) ? src.paidObjective : '',
    organicObjective: OPTION_IDS.organicObjective.includes(src.organicObjective) ? src.organicObjective : '',
    objectiveOther: str(src.objectiveOther),
    adSpend: OPTION_IDS.adSpend.includes(src.adSpend) ? src.adSpend : '',
    socialActivity: OPTION_IDS.socialActivity.includes(src.socialActivity) ? src.socialActivity : '',
    socialAccounts: str(src.socialAccounts),
    productionType: list(src.productionType, OPTION_IDS.productionType),
    budget: OPTION_IDS.budget.includes(src.budget) ? src.budget : '',
    readiness: OPTION_IDS.readiness.includes(src.readiness) ? src.readiness : '',
    startDate: str(src.startDate),
    language: list(src.language, OPTION_IDS.language),
    languageOther: str(src.languageOther),
    acknowledged: src.acknowledged === true,
  }
}

const isoDay = (d) => d.toISOString().slice(0, 10)
/* A real calendar date, from yesterday (time zones) to two years ahead. `now` is injected by the server and the tests. */
export function validStartDate(value, now = new Date()) {
  if (!DATE_RE.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(d.getTime()) || isoDay(d) !== value) return false
  const dayMs = 86_400_000
  const today = new Date(`${isoDay(now)}T00:00:00Z`).getTime()
  return d.getTime() >= today - dayMs && d.getTime() <= today + 731 * dayMs
}

/* Which fields a step holds (also the order the first invalid field is focused in). */
export const STEP_FIELDS = {
  1: ['fullName', 'email', 'company', 'url'],
  2: ['description', 'paidObjective', 'objectiveOther', 'organicObjective', 'adSpend', 'socialActivity', 'socialAccounts', 'productionType', 'budget', 'readiness', 'startDate', 'language', 'languageOther', 'acknowledged'],
}
export const FIELD_ORDER = [...STEP_FIELDS[1], ...STEP_FIELDS[2]]

/* { field: code } for every problem ({} when valid). Codes: 'required' | 'invalid' | 'too_long'. The browser turns them into localized sentences; the server only reports the field names.
   `selection` decides which questions are asked (questionsFor). `step` limits the check to one step (the browser validates step 1 before showing step 2). */
export function validateFields(raw, selection, { step = 0, now = new Date() } = {}) {
  const v = normalizeFields(raw)
  const q = questionsFor(selection)
  const e = {}
  const inStep = (f) => !step || STEP_FIELDS[step].includes(f)

  if (inStep('fullName')) {
    if (!v.fullName) e.fullName = 'required'
    else if (v.fullName.length > LIMITS.name) e.fullName = 'too_long'
  }
  if (inStep('email')) {
    if (!v.email) e.email = 'required'
    else if (v.email.length > LIMITS.email || !EMAIL_RE.test(v.email)) e.email = 'invalid'
  }
  if (inStep('company')) {
    if (!v.company) e.company = 'required'
    else if (v.company.length > LIMITS.company) e.company = 'too_long'
  }
  if (inStep('url')) {
    if (!v.urlRaw) e.url = 'required'
    else if (!v.url) e.url = 'invalid'
  }

  if (step !== 1) {
    if (inStep('description')) {
      if (!v.description) e.description = 'required'
      else if (v.description.length > LIMITS.description) e.description = 'too_long'
    }
    const objective = q.paidObjective ? v.paidObjective : v.organicObjective
    const objectiveField = q.paidObjective ? 'paidObjective' : 'organicObjective'
    if (!objective) e[objectiveField] = 'required'
    else if (objective === 'other') {
      if (!v.objectiveOther) e.objectiveOther = 'required'
      else if (v.objectiveOther.length > LIMITS.other) e.objectiveOther = 'too_long'
    }
    if (q.adSpend && !v.adSpend) e.adSpend = 'required'
    if (q.socialActivity && !v.socialActivity) e.socialActivity = 'required'
    if (q.socialAccounts && v.socialAccounts.length > LIMITS.accounts) e.socialAccounts = 'too_long'
    if (q.productionType && !v.productionType.length) e.productionType = 'required'
    if (q.budget && !v.budget) e.budget = 'required'
    if (!v.readiness) e.readiness = 'required'
    if (!v.startDate) e.startDate = 'required'
    else if (!validStartDate(v.startDate, now)) e.startDate = 'invalid'
    if (!v.language.length) e.language = 'required'
    else if (v.language.includes('other') && v.languageOther.length > LIMITS.languageOther) e.languageOther = 'too_long'
    if (!v.acknowledged) e.acknowledged = 'required'
  }
  return e
}

/* ── the request body ─────────────────────────────────────────────────────────────────── */
/* What the browser may send: identifiers, answers and attribution. NEVER a price: the server recomputes it. */
export function normalizeRequest(body) {
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  const attribution = {}
  const src = b.attribution && typeof b.attribution === 'object' ? b.attribution : {}
  for (const k of UTM_KEYS) if (typeof src[k] === 'string' && src[k].trim()) attribution[k] = src[k].trim().slice(0, 100)
  return {
    locale: typeof b.locale === 'string' && isLocale(b.locale) ? b.locale : null,
    packageId: typeof b.packageId === 'string' ? b.packageId : '',
    billing: typeof b.billing === 'string' ? b.billing : '',
    submissionId: typeof b.submissionId === 'string' && SUBMISSION_ID_RE.test(b.submissionId) ? b.submissionId : '',
    sourcePage: SOURCE_PAGES.includes(b.sourcePage) ? b.sourcePage : 'direct',
    landingPage: typeof b.landingPage === 'string' && /^\/[A-Za-z0-9/_-]{0,120}$/.test(b.landingPage) ? b.landingPage : '',
    attribution,
    fields: normalizeFields(b.fields),
    rawFields: b.fields,
  }
}

/* The qualification answers as the owner reads them, in English (labels from OPTION_LABELS_EN). Ranges carry the currency of the visitor's language ("Under €5,000"). */
export function describeAnswers(fields, selection, locale) {
  const sym = RANGE_CURRENCY[locale] === 'EUR' ? '€' : '$'
  const range = (key, id) => OPTION_LABELS_EN[key][id].replace(/\d[\d,]*/g, (n) => `${sym}${n}`)
  const q = questionsFor(selection)
  const objective = (key, id) => (id === 'other' ? `Other: ${fields.objectiveOther}` : OPTION_LABELS_EN[key][id])
  const out = {}
  if (q.adSpend) out.adSpend = fields.adSpend === 'none' ? OPTION_LABELS_EN.adSpend.none : `${range('adSpend', fields.adSpend)} per month`
  if (q.paidObjective) out.objective = objective('paidObjective', fields.paidObjective)
  if (q.socialActivity) out.socialActivity = OPTION_LABELS_EN.socialActivity[fields.socialActivity]
  if (q.organicObjective) out.objective = objective('organicObjective', fields.organicObjective)
  if (q.socialAccounts) out.socialAccounts = fields.socialAccounts || '(not provided)'
  if (q.productionType) out.productionType = fields.productionType.map((id) => OPTION_LABELS_EN.productionType[id]).join(', ')
  if (q.budget) out.budget = fields.budget === 'unsure' ? OPTION_LABELS_EN.budget.unsure : range('budget', fields.budget)
  return out
}
