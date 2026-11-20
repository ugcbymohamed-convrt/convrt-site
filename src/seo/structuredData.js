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
  adVersions, BRAND, CORE_SERVICES, PRODUCTION_LANGUAGES, SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT,
  USAGE_RIGHTS, RAW_FOOTAGE, CUSTOM_PACKAGES, formatMoney,
} from './businessKnowledge.js'
import { PRICING_FAQ, faqAnswerText } from './pricingFaq.js'
import { HOME_FAQ, homeFaqText } from './homeFaq.js'
import { UGC_FAQ } from './ugcFaq.js'
import { SPOKESPERSON_FAQ } from './spokespersonFaq.js'
import { PATHS } from '../routes.js'
import { selectOurWork, isDisplayable, posterUrl, hlsUrl, titleOf } from '../content/portfolio.js'

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
  [PATHS.ugcVideoAgency]: [{ name: 'Home', path: '/' }, { name: 'UGC Video Agency', path: PATHS.ugcVideoAgency }],
  [PATHS.spokespersonVideoProduction]: [{ name: 'Home', path: '/' }, { name: 'Spokesperson Video Production', path: PATHS.spokespersonVideoProduction }],
  [PATHS.showcase]: [{ name: 'Home', path: '/' }, { name: 'Creator Showcase', path: PATHS.showcase }],
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
export function monthlyOffer(name, money, terms = COMMITMENT.summary) {
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
    description: `${formatMoney(money)} per month, excluding VAT. ${terms}`,
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
    description: `${SPRINT.concepts} distinct creative concepts with ${SPRINT.variationsPerConcept} versions each (${adVersions(SPRINT.variations)}), full-service production in ${SPRINT.turnaroundBusinessDays} business days after concept and script approval, two rounds of revisions per concept and ${usageLine} included, with up to ${SPRINT.maxCreators} creators or spokespeople.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId('ugc') }, { '@id': serviceId('spokesperson') }],
    offers: [monthlyOffer(SPRINT.name, SPRINT.monthly), oneOffOffer(SPRINT.name, SPRINT.oneOff)],
  }
  const plus = {
    '@type': 'Service',
    '@id': serviceId(SPRINT_PLUS.id),
    name: SPRINT_PLUS.name,
    serviceType: 'UGC and spokesperson video ad production',
    description: `${SPRINT_PLUS.concepts} distinct creative concepts with ${SPRINT_PLUS.variationsPerConcept} versions each (${adVersions(SPRINT_PLUS.variations)}), full-service production in ${SPRINT_PLUS.turnaroundBusinessDays} business days after concept and script approval, two rounds of revisions per concept and ${usageLine} included, with up to ${SPRINT_PLUS.maxCreators} creators or spokespeople.`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId('ugc') }, { '@id': serviceId('spokesperson') }],
    offers: [monthlyOffer(SPRINT_PLUS.name, SPRINT_PLUS.monthly), oneOffOffer(SPRINT_PLUS.name, SPRINT_PLUS.oneOff)],
  }
  const organic = [ORGANIC.light, ORGANIC.growth].map((p) => ({
    '@type': 'Service',
    '@id': serviceId(p.id),
    name: p.name,
    serviceType: 'Organic social media content production and management',
    description: `${p.cadence}, distributed across your selected platforms (${ORGANIC.platforms.slice(0, -1).join(', ')} and ${ORGANIC.platforms.at(-1)}). Includes ${ORGANIC.includedInBoth.map((x) => x.toLowerCase()).join(' and ')}; detailed community management scope is subject to the applicable agreement. ${ORGANIC_COMMITMENT.summary}`,
    provider: { '@id': ORG_ID },
    isRelatedTo: [{ '@id': serviceId('organic') }],
    offers: [monthlyOffer(p.name, p.monthly, `${ORGANIC_COMMITMENT.summary} ${ORGANIC_COMMITMENT.afterInitial}`)],
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

/* Homepage: Organization + WebSite, the WebPage itself, the three core services (same @ids as on /pricing, so they are one entity
   described in two places) and an FAQPage generated from the exact FAQ shown on the page (src/seo/homeFaq.js). No ratings, no
   addresses, no promised results; FAQPage is included for consistency with visible content, not as a promise of rich results. */
export function homeGraph({ title, description } = {}) {
  const url = abs('/')
  return graph([
    organizationNode(),
    webSiteNode(),
    {
      '@type': 'WebPage',
      '@id': pageId('/'),
      url,
      ...(title ? { name: title } : {}),
      ...(description ? { description } : {}),
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORG_ID },
      inLanguage: 'en',
    },
    ...coreServiceNodes(),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: HOME_FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: homeFaqText(f) },
      })),
    },
  ])
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

/* UGC service page (/ugc-video-agency). Everything here is on the visible page: the Service description, the Sprint and Sprint Plus
   prices (the same Offers as /pricing, built by the same functions from the same data) and the FAQ (generated from the exact Q&A
   the page renders). No ratings, reviews, addresses, awards, creator counts, service areas or promised results. FAQPage and Service
   markup are for consistency with visible content, not a promise of rich results or AI citations. */
export function ugcGraph({ title, description }) {
  const path = PATHS.ugcVideoAgency
  const url = abs(path)
  const trail = BREADCRUMB_TRAILS[path]
  const ugc = CORE_SERVICES.find((s) => s.id === 'ugc')
  return graph([
    organizationNode(),
    {
      '@type': 'WebPage',
      '@id': pageId(path),
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': `${url}#service` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: 'en',
    },
    breadcrumbNode(trail, `${url}#breadcrumb`),
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: 'UGC video production',
      serviceType: 'UGC video ad production',
      description: `${ugc.description} UGC videos are created by real human creators.`,
      url,
      provider: { '@id': ORG_ID },
      isRelatedTo: [{ '@id': serviceId('ugc') }, { '@id': serviceId(SPRINT.id) }, { '@id': serviceId(SPRINT_PLUS.id) }],
      offers: [
        monthlyOffer(SPRINT.name, SPRINT.monthly),
        oneOffOffer(SPRINT.name, SPRINT.oneOff),
        monthlyOffer(SPRINT_PLUS.name, SPRINT_PLUS.monthly),
        oneOffOffer(SPRINT_PLUS.name, SPRINT_PLUS.oneOff),
      ],
    },
    faqNode(UGC_FAQ, `${url}#faq`),
  ])
}

/* Spokesperson service page (/spokesperson-video-production). Same shape as ugcGraph, with the differences that matter: the Service is the existing
   'spokesperson' core service (same @id as on /pricing), described from the business data, and it carries NO Offer: no spokesperson-specific price is
   published, and the package prices already live on /pricing (the Service is related to those packages, not priced here). The FAQPage is generated from the
   exact Q&A the page renders. No ratings, reviews, addresses, awards, presenter counts, service areas, results or VideoObject. */
export function spokespersonGraph({ title, description }) {
  const path = PATHS.spokespersonVideoProduction
  const url = abs(path)
  const trail = BREADCRUMB_TRAILS[path]
  const core = CORE_SERVICES.find((s) => s.id === 'spokesperson')
  return graph([
    organizationNode(),
    {
      '@type': 'WebPage',
      '@id': pageId(path),
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': `${url}#service` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: 'en',
    },
    breadcrumbNode(trail, `${url}#breadcrumb`),
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: 'Spokesperson video production',
      serviceType: 'Spokesperson video production',
      description: `${core.description} Spokesperson videos feature real human presenters and can be produced in several languages.`,
      url,
      provider: { '@id': ORG_ID },
      isRelatedTo: [{ '@id': serviceId('spokesperson') }, { '@id': serviceId(SPRINT.id) }, { '@id': serviceId(SPRINT_PLUS.id) }, { '@id': serviceId(CUSTOM_PACKAGES.paid.id) }],
    },
    faqNode(SPOKESPERSON_FAQ, `${url}#faq`),
  ])
}

/* One VideoObject for an approved portfolio video, or undefined. Only a video with a real, verified uploadDate gets one (Google requires
   it, and the site must not invent it): the data file's `uploadDate` is the opt-in. Never emitted for anything that is not displayable. */
export function videoObjectNode(item) {
  if (!isDisplayable(item) || !item.uploadDate) return undefined
  const cf = item.source.cloudflareId
  const thumb = posterUrl(item)
  return {
    '@type': 'VideoObject',
    '@id': `${abs(PATHS.showcase)}#video-${item.id}`,
    name: titleOf(item),
    description: item.description ?? item.caption,
    thumbnailUrl: [thumb.startsWith('http') ? thumb : abs(thumb)],
    uploadDate: item.uploadDate,
    ...(item.languages?.length ? { inLanguage: item.languages[0] } : {}),
    ...(cf ? { contentUrl: hlsUrl(item), embedUrl: `https://iframe.videodelivery.net/${cf}` } : { contentUrl: abs(item.source.mp4) }),
    // CONVRT is named as the producer ONLY when the data says the video was produced through CONVRT. Independent creator examples are never
    // attributed to CONVRT, and a video with unknown production gets no producer at all.
    ...(item.production === 'convrt' ? { producer: { '@id': ORG_ID } } : {}),
  }
}

/* /creator-showcase: a CollectionPage + its breadcrumb, plus VideoObject markup only for the videos that qualify (see videoObjectNode). With
   no verified videos there is no video markup at all, never a placeholder. */
export function ourWorkGraph({ title, description }) {
  const path = PATHS.showcase
  const url = abs(path)
  const videos = selectOurWork().map(videoObjectNode).filter(Boolean)
  return graph([
    organizationNode(),
    {
      '@type': 'CollectionPage',
      '@id': pageId(path),
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: 'en',
      ...(videos.length ? { hasPart: videos.map((v) => ({ '@id': v['@id'] })) } : {}),
    },
    breadcrumbNode(BREADCRUMB_TRAILS[path], `${url}#breadcrumb`),
    ...videos,
  ])
}

/* The JSON-LD for a route, or undefined when the route has none. `seo` is the route's SITE_SEO entry. */
export function jsonLdFor(path, seo = {}) {
  if (path === '/') return homeGraph(seo)
  if (path === '/pricing') return pricingGraph(seo)
  if (path === PATHS.ugcVideoAgency) return ugcGraph(seo)
  if (path === PATHS.spokespersonVideoProduction) return spokespersonGraph(seo)
  if (path === PATHS.showcase) return ourWorkGraph(seo)
  return undefined
}
