/* Reusable JSON-LD (schema.org) builders. Pure functions: they run in the build (static HTML), the browser
   (useDocumentHead) and `node --test`.

   Principles
   • Everything comes from src/seo/businessKnowledge.js and the visible pricing FAQ, so structured data cannot disagree
     with what the page says.
   • Entities have STABLE @ids (ORG_ID, WEBSITE_ID, one per service) and refer to each other by @id.
   • No invented facts: no ratings, reviews, addresses, awards, credentials, geographic service areas or prices that are
     not on the page. Nothing here promises rankings, AI citations or results.
   • A recurring monthly fee is always expressed as a per-month UnitPriceSpecification, never as a total contract cost,
     and one-off prices are separate Offers in the currency they are shown in on the page.
   • Services are marked up as Service + Offer. Product markup is deliberately not used.
   • Blog articles keep their own helpers (src/lib/blog/seo.js), which reference the Organization defined here. */

import { SITE_URL } from '../config.js'
import {
  BRAND, CORE_SERVICES, PRODUCTION_LANGUAGES, SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT,
  USAGE_RIGHTS, RAW_FOOTAGE, CUSTOM_PACKAGES, formatMoney,
} from './businessKnowledge.js'
import { PRICING_FAQ, faqAnswerText } from './pricingFaq.js'

const CONTEXT = 'https://schema.org'
const abs = (path) => `${SITE_URL}${path === '/' ? '/' : path}`

/* ── stable entity ids ────────────────────────────────────────────────────────────────── */
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const serviceId = (slug) => `${abs('/pricing')}#service-${slug}`
export const pageId = (path) => `${abs(path)}#webpage`

/* A light reference to the Organization for pages that do not define the full entity (blog articles etc.). */
export const organizationRef = () => ({ '@type': 'Organization', '@id': ORG_ID, name: BRAND.name, url: SITE_URL })
export const websiteRef = () => ({ '@type': 'WebSite', '@id': WEBSITE_ID, name: BRAND.name, url: SITE_URL })

/* ── site-wide entities ───────────────────────────────────────────────────────────────── */
export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND.name,
    alternateName: BRAND.shortName,
    url: SITE_URL,
    description: BRAND.description,
    slogan: BRAND.motto,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}${BRAND.logoPath}` },
    email: BRAND.contactEmail,
    sameAs: BRAND.socialProfiles,
    knowsLanguage: PRODUCTION_LANGUAGES.coreCodes,
  }
}

export function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: BRAND.name,
    description: BRAND.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  }
}

/* ── breadcrumbs ──────────────────────────────────────────────────────────────────────── */
/* The real site hierarchy, by canonical URL. Only pages listed here get a BreadcrumbList.
   (/case-studies/* is intentionally absent: its parent /case-studies is a duplicate of /case-studies/graspo, so a
   breadcrumb would point at a non-canonical URL. Blog articles build their own trail in src/lib/blog/seo.js.) */
export const BREADCRUMB_TRAILS = {
  '/pricing': [{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }],
}

export function breadcrumbNode(trail, id) {
  return {
    '@type': 'BreadcrumbList',
    ...(id ? { '@id': id } : {}),
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: abs(t.path) })),
  }
}

/* ── offers ───────────────────────────────────────────────────────────────────────────── */
const PACKAGES_URL = `${abs('/pricing')}#packages`

/* Recurring monthly fee: price PER MONTH, with the commitment terms in the description. Not a contract total. */
export function monthlyOffer(name, money) {
  return {
    '@type': 'Offer',
    name: `${name} (monthly)`,
    url: PACKAGES_URL,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: money.amount,
      priceCurrency: money.currency,
      valueAddedTaxIncluded: false,
      unitCode: 'MON',
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
    },
    description: `${formatMoney(money)} per month, excluding VAT. ${COMMITMENT.summary}`,
  }
}

/* One-off price: a single payment, in the currency published on the page. */
export function oneOffOffer(name, money) {
  return {
    '@type': 'Offer',
    name: `${name} (one-off)`,
    url: PACKAGES_URL,
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: money.amount,
      priceCurrency: money.currency,
      valueAddedTaxIncluded: false,
    },
    description: `${formatMoney(money)} one-off, excluding VAT.`,
  }
}

/* Price per unit (here: per creative concept), a one-time add-on fee, not a recurring or total price. */
export function perUnitOffer(name, money, unit) {
  return {
    '@type': 'Offer',
    name: `${name} (per ${unit})`,
    url: PACKAGES_URL,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: money.amount,
      priceCurrency: money.currency,
      valueAddedTaxIncluded: false,
      referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: unit },
    },
    description: `${formatMoney(money)} per ${unit}, excluding VAT.`,
  }
}

/* ── services ─────────────────────────────────────────────────────────────────────────── */
export function coreServiceNodes() {
  return CORE_SERVICES.map((s) => ({
    '@type': 'Service',
    '@id': serviceId(s.id),
    name: s.name,
    description: s.description,
    provider: { '@id': ORG_ID },
    url: abs('/pricing'),
  }))
}

const usageLine = `${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights`

function packageNodes() {
  const sprint = {
    '@type': 'Service',
    '@id': serviceId(SPRINT.id),
    name: SPRINT.name,
    serviceType: 'UGC and spokesperson video ad production',
    description: `${SPRINT.concepts} distinct creative concepts with ${SPRINT.variationsPerConcept} variations each (${SPRINT.variations} ad variations), full-service production in ${SPRINT.turnaroundBusinessDays} business days after concept and script approval, two rounds of revisions per concept and ${usageLine} included.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId('ugc') }, { '@id': serviceId('spokesperson') }],
    offers: [monthlyOffer(SPRINT.name, SPRINT.monthly), oneOffOffer(SPRINT.name, SPRINT.oneOff)],
  }
  const plus = {
    '@type': 'Service',
    '@id': serviceId(SPRINT_PLUS.id),
    name: SPRINT_PLUS.name,
    serviceType: 'UGC and spokesperson video ad production',
    description: `${SPRINT_PLUS.concepts.value} distinct creative concepts and ${SPRINT_PLUS.variations} ad variations in total, distributed across the concepts according to the creative testing strategy; full-service production in ${SPRINT_PLUS.turnaroundBusinessDays} business days after concept and script approval, two rounds of revisions per concept and ${usageLine} included.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId('ugc') }, { '@id': serviceId('spokesperson') }],
    offers: [monthlyOffer(SPRINT_PLUS.name, SPRINT_PLUS.monthly), oneOffOffer(SPRINT_PLUS.name, SPRINT_PLUS.oneOff)],
  }
  const organic = [ORGANIC.light, ORGANIC.growth].map((p) => ({
    '@type': 'Service',
    '@id': serviceId(p.id),
    name: p.name,
    serviceType: 'Organic social media content production and management',
    description: `${p.cadence}, distributed across your selected platforms (${ORGANIC.platforms.slice(0, -1).join(', ')} and ${ORGANIC.platforms.at(-1)}). Includes ${ORGANIC.includedInBoth.map((x) => x.toLowerCase()).join(' and ')}; detailed community management scope is subject to the applicable agreement.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId('organic') }],
    offers: [monthlyOffer(p.name, p.monthly)],
  }))
  /* Optional add-on only: never a raw-only or raw-instead-of-edited package. Priced per creative concept. */
  const rawFootage = {
    '@type': 'Service',
    '@id': serviceId(RAW_FOOTAGE.id),
    name: RAW_FOOTAGE.name,
    serviceType: 'Raw footage add-on for a finished video production package',
    description: `${RAW_FOOTAGE.policy} Raw footage is an optional add-on at ${formatMoney(RAW_FOOTAGE.price)} per ${RAW_FOOTAGE.per}.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId(SPRINT.id) }, { '@id': serviceId(SPRINT_PLUS.id) }],
    offers: [perUnitOffer(RAW_FOOTAGE.name, RAW_FOOTAGE.price, RAW_FOOTAGE.per)],
  }
  /* Custom packages: described, deliberately WITHOUT any Offer or price (scope, pricing and terms are agreed individually). */
  const custom = [
    { pkg: CUSTOM_PACKAGES.paid, name: 'Custom creative package', type: 'UGC and spokesperson video ad production', related: [serviceId('ugc'), serviceId('spokesperson')] },
    { pkg: CUSTOM_PACKAGES.organic, name: 'Custom organic content package', type: 'Organic social media content production and management', related: [serviceId('organic')] },
  ].map(({ pkg, name, type, related }) => ({
    '@type': 'Service',
    '@id': serviceId(pkg.id),
    name,
    serviceType: type,
    description: `${pkg.description} Possibilities include: ${pkg.features.join('; ')}. Final scope, pricing and commercial terms are agreed individually.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: related.map((id) => ({ '@id': id })),
  }))
  return [sprint, plus, ...organic, rawFootage, ...custom]
}

/* ── FAQPage: generated from the exact Q&A the page renders ───────────────────────────── */
export function faqNode(items = PRICING_FAQ, id) {
  return {
    '@type': 'FAQPage',
    ...(id ? { '@id': id } : {}),
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(f) },
    })),
  }
}

/* ── page graphs ──────────────────────────────────────────────────────────────────────── */
const graph = (nodes) => ({ '@context': CONTEXT, '@graph': nodes })

export function homeGraph() {
  return graph([organizationNode(), webSiteNode()])
}

export function pricingGraph({ title, description }) {
  const url = abs('/pricing')
  const trail = BREADCRUMB_TRAILS['/pricing']
  return graph([
    organizationNode(),
    {
      '@type': 'WebPage',
      '@id': pageId('/pricing'),
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORG_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: 'en',
    },
    breadcrumbNode(trail, `${url}#breadcrumb`),
    ...coreServiceNodes(),
    ...packageNodes(),
    faqNode(PRICING_FAQ, `${url}#faq`),
  ])
}

/* The JSON-LD for a route, or undefined when the route has none. `seo` is the route's SITE_SEO entry. */
export function jsonLdFor(path, seo = {}) {
  if (path === '/') return homeGraph()
  if (path === '/pricing') return pricingGraph(seo)
  return undefined
}
