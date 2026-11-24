/* PER-LANGUAGE PRICING. English prices are the business data in src/seo/businessKnowledge.js (USD) and never change here.
   Every other language has its OWN pricing configuration (src/i18n/<locale>/pricing.js) holding an explicitly approved amount per price, in that language's currency.

   RULES
   • No live exchange rates, no formula and no reuse of the USD number: an amount is `null` until the owner approves it, then a plain number the owner supplied.
   • While a language's pricing is not approved, its pages show a visible placeholder instead of a price, its price Offers are left out of the JSON-LD, and every page that carries a price is
     launch-blocked (noindex, no sitemap, no hreflang: src/i18n/release.js). Nothing wrong can go live by accident.
   • Spanish call sites never see a USD price: money() maps the business-data price object to its key here and THROWS for an object that has no key, so a new price added to the business data
     cannot silently fall through to another language in dollars.
   • To add a language's pricing: copy src/i18n/es/pricing.js, fill the amounts the owner approved, register the config in PRICING below. Nothing else changes.

   Dictionary values carry prices as tokens, so the translated sentence never holds a number:   {{price:sprint.monthly}}   {{perVariation:sprint.monthly}}   (see resolvePriceTokens). */

import { SPRINT, SPRINT_PLUS, ORGANIC, RAW_FOOTAGE } from '../seo/businessKnowledge.js'
import { DEFAULT_LOCALE } from './locales.js'
import { ES_PRICING } from './es/pricing.js'
import { FR_PRICING } from './fr/pricing.js'
import { formatMoneyFr } from './fr/money.js'
import { formatMoneyEs } from './es/money.js'

/* THE LIST OF PRICES: every amount in the business data that is shown to a visitor. `usd` is the business-data object itself (its identity is the lookup key). */
const ext = (id, pkg, name) => pkg.usageExtensions.map((e) => ({ key: `${id}.ext${e.months}`, label: `${name}: usage-rights extension, ${e.months} months (whole creative batch)`, usd: e.price }))
export const PRICE_ITEMS = [
  { key: 'sprint.monthly', label: `${SPRINT.name}: monthly`, usd: SPRINT.monthly, perVariationOf: SPRINT },
  { key: 'sprint.oneOff', label: `${SPRINT.name}: one-off`, usd: SPRINT.oneOff, perVariationOf: SPRINT },
  ...ext('sprint', SPRINT, SPRINT.name),
  { key: 'sprintPlus.monthly', label: `${SPRINT_PLUS.name}: monthly`, usd: SPRINT_PLUS.monthly, perVariationOf: SPRINT_PLUS },
  { key: 'sprintPlus.oneOff', label: `${SPRINT_PLUS.name}: one-off`, usd: SPRINT_PLUS.oneOff, perVariationOf: SPRINT_PLUS },
  ...ext('sprintPlus', SPRINT_PLUS, SPRINT_PLUS.name),
  { key: 'rawFootage', label: `${RAW_FOOTAGE.name}: per ${RAW_FOOTAGE.per}`, usd: RAW_FOOTAGE.price },
  { key: 'organicLight.monthly', label: `${ORGANIC.light.name}: monthly`, usd: ORGANIC.light.monthly },
  { key: 'organicGrowth.monthly', label: `${ORGANIC.growth.name}: monthly`, usd: ORGANIC.growth.monthly },
]
export const PRICE_KEYS = PRICE_ITEMS.map((i) => i.key)
const KEY_OF = new Map(PRICE_ITEMS.map((i) => [i.usd, i.key]))
const ITEM = Object.fromEntries(PRICE_ITEMS.map((i) => [i.key, i]))

/* One entry per language that has its own pricing. English is not listed: it uses the business data directly. */
export const PRICING = { es: ES_PRICING, fr: FR_PRICING }
export const pricingConfig = (locale) => PRICING[locale] ?? null
export const hasOwnPricing = (locale) => locale !== DEFAULT_LOCALE
export const isPricingApproved = (locale, config = pricingConfig(locale)) => locale === DEFAULT_LOCALE || (config?.status === 'approved' && pricingProblems(config).length === 0)

/* Problems with a pricing config (empty = valid). An approved config must have a finite positive amount for every price, and who approved it and when. */
export function pricingProblems(config) {
  const p = []
  if (!config || typeof config !== 'object') return ['no pricing configuration']
  if (!/^[A-Z]{3}$/.test(config.currency ?? '')) p.push('currency must be an ISO 4217 code')
  const amounts = config.amounts ?? {}
  for (const k of Object.keys(amounts)) if (!PRICE_KEYS.includes(k)) p.push(`unknown price key: ${k}`)
  if (config.status !== 'approved' && config.status !== 'pending') p.push("status must be 'pending' or 'approved'")
  if (config.status === 'approved') {
    for (const k of PRICE_KEYS) if (!(Number.isFinite(amounts[k]) && amounts[k] > 0)) p.push(`approved pricing needs an amount for ${k}`)
    if (!config.approvedBy || !/^\d{4}-\d{2}-\d{2}$/.test(config.approvedOn ?? '')) p.push('approved pricing needs approvedBy and approvedOn (YYYY-MM-DD)')
  } else {
    for (const [k, v] of Object.entries(amounts)) if (v !== null && v !== undefined) p.push(`pending pricing must not hold an amount (${k}); amounts are filled in only when the owner approves them`)
  }
  return p
}

/* The price (in the language's own currency) for a business-data USD price object. amount is null while pending. */
export function priceOf(locale, usdMoney, config = pricingConfig(locale)) {
  if (!config) throw new Error(`No pricing configuration for "${locale}"`)
  const key = KEY_OF.get(usdMoney)
  if (!key) throw new Error(`priceOf(${locale}): this price has no key in src/i18n/pricing.js (add it to PRICE_ITEMS); refusing to show a USD amount in another language`)
  return { key, amount: config.amounts[key] ?? null, currency: config.currency }
}

/* Whole-currency price per finished ad version, derived ONLY from the approved amount of that language (rounded like the English figure). */
export function perVariationOf(locale, key, config = pricingConfig(locale)) {
  const item = ITEM[key]
  if (!item?.perVariationOf) throw new Error(`No per-variation price for "${key}"`)
  const amount = config.amounts[key] ?? null
  return { key, amount: amount === null ? null : Math.round(amount / item.perVariationOf.variations), currency: config.currency }
}

/* Text of the per-variation price for a package price object (pkg.monthly / pkg.oneOff), in the language's own currency. */
export const perVariationText = (locale, usdMoney, config = pricingConfig(locale)) => formatPrice(locale, perVariationOf(locale, priceOf(locale, usdMoney, config).key, config), config)

/* Text for a price: the language's notation, or its placeholder while pending. */
export const formatPrice = (locale, money, config = pricingConfig(locale)) => (money.amount === null ? config.placeholder : config.format(money))

/* {{price:key}} and {{perVariation:key}} inside a translated sentence. */
const TOKEN = /\{\{(price|perVariation|usd):([A-Za-z0-9.]+)\}\}/g
export const hasPriceTokens = (text) => text.includes('{{')
/* {{usd:150}}: a dollar amount that is a FACT of the English page and is not a CONVRT price (a referral reward, a client-reported campaign result). It stays in US dollars, formatted the way the
   locale writes money (« 3 421,25 USD »): never converted, never turned into euros. */
const formatUsdFact = (locale, amount) => (locale === 'fr' ? formatMoneyFr({ amount, currency: 'USD' }) : formatMoneyEs({ amount, currency: 'USD' }))
export function resolvePriceTokens(locale, text, config = pricingConfig(locale)) {
  text = text.replace(/\{\{usd:([0-9.]+)\}\}/g, (_, n) => formatUsdFact(locale, Number(n)))
  if (!config) return text
  return text.replace(TOKEN, (_, kind, key) => {
    const item = ITEM[key]
    if (!item) throw new Error(`Unknown price token ${kind}:${key}`)
    return formatPrice(locale, kind === 'price' ? { key, amount: config.amounts[key] ?? null, currency: config.currency } : perVariationOf(locale, key, config), config)
  })
}
