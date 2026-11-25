/* Arabic building blocks for JSON-LD (offers and services). Amounts, quantities and terms come from the business data; the Arabic sentences either interpolate those values directly or
   look the English term up in the dictionary (so a changed term fails the build until it is re-translated). Same structure as src/i18n/es/jsonld-parts.js.

   Prices are the approved English USD prices (src/i18n/ar/pricing.js). "valueAddedTaxIncluded: false" and "قبل ضريبة القيمة المضافة" repeat the existing English commercial term
   ("All prices exclude VAT"); no UAE or Saudi tax registration or rate is stated. */

import { ORG_ID } from '../../seo/structuredData.js'
import {
  SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT, USAGE_RIGHTS, RAW_FOOTAGE, CUSTOM_PACKAGES,
} from '../../seo/businessKnowledge.js'
import { translate } from '../tr.js'
import { priceOf, formatPrice } from '../pricing.js'
import { AR_CORE_SERVICES } from './services.js'

const L = 'ar'
const t = (s) => translate(L, s)

const usd = (money) => priceOf(L, money)
const text = (money) => formatPrice(L, usd(money))
const priceSpec = (money, extra = {}) => ({ price: usd(money).amount, priceCurrency: usd(money).currency, valueAddedTaxIncluded: false, ...extra })
export const offersOf = (list) => { const o = list.filter(Boolean); return o.length ? { offers: o } : {} }

export const monthlyOfferAr = (name, money, packagesUrl, terms = t(COMMITMENT.summary)) => ({
  '@type': 'Offer',
  name: `${name} (شهري)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'UnitPriceSpecification', ...priceSpec(money), unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
  description: `${text(money)} (USD) شهريًا، قبل ضريبة القيمة المضافة. ${terms}`,
})

export const oneOffOfferAr = (name, money, packagesUrl) => ({
  '@type': 'Offer',
  name: `${name} (دفعة واحدة)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'PriceSpecification', ...priceSpec(money) },
  description: `${text(money)} (USD) دفعة واحدة، قبل ضريبة القيمة المضافة.`,
})

export const perUnitOfferAr = (name, money, packagesUrl) => ({
  '@type': 'Offer',
  name: `${name} (لكل مفهوم إبداعي)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'UnitPriceSpecification', ...priceSpec(money), referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: 'مفهوم إبداعي' } },
  description: `${text(money)} (USD) لكل مفهوم إبداعي، قبل ضريبة القيمة المضافة.`,
})

export const coreServiceNodesAr = (pageUrl) =>
  Object.entries(AR_CORE_SERVICES).map(([id, s]) => ({ '@type': 'Service', '@id': `${pageUrl}#service-${id}`, name: s.name, description: s.description, provider: { '@id': ORG_ID }, url: pageUrl }))

const orgProvider = { '@id': ORG_ID }
const list = (items) => `${items.slice(0, -1).join('، ')} و${items.at(-1)}`
const SERVICE_TYPE_PAID = 'إنتاج إعلانات فيديو UGC وفيديوهات بمقدّمين'
const SERVICE_TYPE_ORGANIC = 'إنتاج محتوى السوشيال ميديا وإدارته'

/* The package Services of /ar/pricing (Sprint, Sprint Plus, Organic Light/Growth, raw footage, custom packages), with page-scoped @ids. */
export function packageNodesAr(pageUrl) {
  const packagesUrl = `${pageUrl}#packages`
  const idOf = (slug) => `${pageUrl}#service-${slug}`
  const paid = (p) => ({
    '@type': 'Service',
    '@id': idOf(p.id),
    name: p.name,
    serviceType: SERVICE_TYPE_PAID,
    description: `${p.concepts} مفاهيم إبداعية مختلفة، لكل مفهوم ${p.variationsPerConcept} نسخ (${p.variations} نسخة إعلانية نهائية)، وإنتاج متكامل خلال ${p.turnaroundBusinessDays} أيام عمل بعد اعتماد المفاهيم والنصوص، وجولتا مراجعة لكل مفهوم، و${USAGE_RIGHTS.includedMonths} أشهر من حقوق الاستخدام عالميًا، بمشاركة ما يصل إلى ${p.maxCreators} من صناع المحتوى أو المقدّمين.`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf('ugc') }, { '@id': idOf('spokesperson') }],
    ...offersOf([monthlyOfferAr(p.name, p.monthly, packagesUrl), oneOffOfferAr(p.name, p.oneOff, packagesUrl)]),
  })
  const organic = [ORGANIC.light, ORGANIC.growth].map((p) => ({
    '@type': 'Service',
    '@id': idOf(p.id),
    name: p.name,
    serviceType: SERVICE_TYPE_ORGANIC,
    description: `${t(p.cadence)}، موزّعة على المنصات المتفق عليها (${list(ORGANIC.platforms)}). تشمل ${ORGANIC.includedInBoth.map((x) => t(x)).join(' و')}؛ ويخضع النطاق التفصيلي لإدارة المجتمع للاتفاقية المعمول بها. ${t(ORGANIC_COMMITMENT.summary)}`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf('organic') }],
    ...offersOf([monthlyOfferAr(p.name, p.monthly, packagesUrl, `${t(ORGANIC_COMMITMENT.summary)} ${t(ORGANIC_COMMITMENT.afterInitial)}`)]),
  }))
  const raw = {
    '@type': 'Service',
    '@id': idOf(RAW_FOOTAGE.id),
    name: 'إضافة اللقطات الخام',
    serviceType: 'إضافة اللقطات الخام إلى باقة إنتاج فيديو نهائية',
    description: `${t(RAW_FOOTAGE.policy)} اللقطات الخام إضافة اختيارية بسعر ${text(RAW_FOOTAGE.price)} (USD) لكل مفهوم إبداعي.`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf(SPRINT.id) }, { '@id': idOf(SPRINT_PLUS.id) }],
    ...offersOf([perUnitOfferAr('إضافة اللقطات الخام', RAW_FOOTAGE.price, packagesUrl)]),
  }
  const custom = [
    { pkg: CUSTOM_PACKAGES.paid, name: 'باقة إبداعية مخصصة', type: SERVICE_TYPE_PAID, related: [idOf('ugc'), idOf('spokesperson')] },
    { pkg: CUSTOM_PACKAGES.organic, name: 'باقة محتوى عضوي مخصصة', type: SERVICE_TYPE_ORGANIC, related: [idOf('organic')] },
  ].map(({ pkg, name, type, related }) => ({
    '@type': 'Service',
    '@id': idOf(pkg.id),
    name,
    serviceType: type,
    description: `${t(pkg.description)} الخيارات المتاحة: ${pkg.features.map(t).join('؛ ')}. يُتفق على النطاق النهائي والسعر والشروط التجارية بشكل فردي.`,
    provider: orgProvider,
    isRelatedTo: related.map((id) => ({ '@id': id })),
  }))
  return [paid(SPRINT), paid(SPRINT_PLUS), ...organic, raw, ...custom]
}

/* A page-level Service (the UGC page). */
export const pageServiceAr = (pageUrl, fields) => ({ '@type': 'Service', '@id': `${pageUrl}#service`, url: pageUrl, provider: orgProvider, ...fields })
export { SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, CUSTOM_PACKAGES, AR_CORE_SERVICES, t as tAr }
