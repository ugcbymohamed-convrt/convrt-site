/* French building blocks for JSON-LD (offers and services). Amounts, quantities and terms come from the business data; French sentences either interpolate those
   values directly or look the English term up in the dictionary (so a changed term fails the build until it is re-translated). */

import { ORG_ID } from '../../seo/structuredData.js'
import {
  SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT, USAGE_RIGHTS, RAW_FOOTAGE, CUSTOM_PACKAGES,
} from '../../seo/businessKnowledge.js'
import { translate } from '../tr.js'
import { priceOf, formatPrice } from '../pricing.js'
import { FR_CORE_SERVICES } from './services.js'

const L = 'fr'
const t = (s) => translate(L, s)

/* `money` is the business-data price object; the French amount is the approved EUR price. While it is pending there is NO Offer (null), never a wrong or placeholder price. */
const eur = (money) => priceOf(L, money)
const text = (money) => formatPrice(L, eur(money))
const priceSpec = (money, extra = {}) => ({ price: eur(money).amount, priceCurrency: eur(money).currency, valueAddedTaxIncluded: false, ...extra })
export const offersOf = (list) => { const o = list.filter(Boolean); return o.length ? { offers: o } : {} }

export const monthlyOfferFr = (name, money, packagesUrl, terms = t(COMMITMENT.summary)) => eur(money).amount === null ? null : ({
  '@type': 'Offer',
  name: `${name} (mensuel)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'UnitPriceSpecification', ...priceSpec(money), unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
  description: `${text(money)} par mois, hors taxes. ${terms}`,
})

export const oneOffOfferFr = (name, money, packagesUrl) => eur(money).amount === null ? null : ({
  '@type': 'Offer',
  name: `${name} (paiement unique)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'PriceSpecification', ...priceSpec(money) },
  description: `${text(money)} en un seul paiement, hors taxes.`,
})

export const perUnitOfferFr = (name, money, packagesUrl) => eur(money).amount === null ? null : ({
  '@type': 'Offer',
  name: `${name} (par concept créatif)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'UnitPriceSpecification', ...priceSpec(money), referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: 'concept créatif' } },
  description: `${text(money)} par concept créatif, hors taxes.`,
})

export const coreServiceNodesFr = (pageUrl) =>
  Object.entries(FR_CORE_SERVICES).map(([id, s]) => ({ '@type': 'Service', '@id': `${pageUrl}#service-${id}`, name: s.name, description: s.description, provider: { '@id': ORG_ID }, url: pageUrl }))

const orgProvider = { '@id': ORG_ID }
const list = (items) => `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`
const SERVICE_TYPE_PAID = 'Production de publicités vidéo UGC et Spokesperson'
const SERVICE_TYPE_ORGANIC = 'Production et gestion de contenus organiques pour les réseaux sociaux'

/* The package Services of /fr/pricing (Sprint, Sprint Plus, Organic Light/Growth, raw footage, custom packages), with page-scoped @ids. */
export function packageNodesFr(pageUrl) {
  const packagesUrl = `${pageUrl}#packages`
  const idOf = (slug) => `${pageUrl}#service-${slug}`
  const paid = (p) => ({
    '@type': 'Service',
    '@id': idOf(p.id),
    name: p.name,
    serviceType: SERVICE_TYPE_PAID,
    description: `${p.concepts} concepts créatifs distincts, déclinés en ${p.variationsPerConcept} versions chacun (${p.variations} versions publicitaires finalisées), production de A à Z en ${p.turnaroundBusinessDays} jours ouvrés après validation des concepts et des scripts, deux cycles de modifications par concept et ${USAGE_RIGHTS.includedMonths} mois de droits d’utilisation mondiaux inclus, avec jusqu’à ${p.maxCreators} créateurs ou porte-parole.`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf('ugc') }, { '@id': idOf('spokesperson') }],
    ...offersOf([monthlyOfferFr(p.name, p.monthly, packagesUrl), oneOffOfferFr(p.name, p.oneOff, packagesUrl)]),
  })
  const organic = [ORGANIC.light, ORGANIC.growth].map((p) => ({
    '@type': 'Service',
    '@id': idOf(p.id),
    name: p.name,
    serviceType: SERVICE_TYPE_ORGANIC,
    description: `${t(p.cadence)}, publié sur les plateformes choisies (${list(ORGANIC.platforms)}). Comprend ${ORGANIC.includedInBoth.map((x) => t(x).toLowerCase()).join(' et ')} ; le périmètre détaillé de l’animation de communauté dépend de l’accord applicable. ${t(ORGANIC_COMMITMENT.summary)}`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf('organic') }],
    ...offersOf([monthlyOfferFr(p.name, p.monthly, packagesUrl, `${t(ORGANIC_COMMITMENT.summary)} ${t(ORGANIC_COMMITMENT.afterInitial)}`)]),
  }))
  const raw = {
    '@type': 'Service',
    '@id': idOf(RAW_FOOTAGE.id),
    name: 'Option rushes bruts',
    serviceType: 'Option rushes bruts pour un forfait de production vidéo finalisée',
    description: `${t(RAW_FOOTAGE.policy)} Les rushes bruts sont une option facultative à ${text(RAW_FOOTAGE.price)} par concept créatif.`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf(SPRINT.id) }, { '@id': idOf(SPRINT_PLUS.id) }],
    ...offersOf([perUnitOfferFr('Option rushes bruts', RAW_FOOTAGE.price, packagesUrl)]),
  }
  const custom = [
    { pkg: CUSTOM_PACKAGES.paid, name: 'Forfait créatif sur mesure', type: SERVICE_TYPE_PAID, related: [idOf('ugc'), idOf('spokesperson')] },
    { pkg: CUSTOM_PACKAGES.organic, name: 'Forfait de contenus organiques sur mesure', type: SERVICE_TYPE_ORGANIC, related: [idOf('organic')] },
  ].map(({ pkg, name, type, related }) => ({
    '@type': 'Service',
    '@id': idOf(pkg.id),
    name,
    serviceType: type,
    description: `${t(pkg.description)} Options possibles : ${pkg.features.map(t).join(' ; ')}. Le périmètre final, le prix et les conditions commerciales sont convenus au cas par cas.`,
    provider: orgProvider,
    isRelatedTo: related.map((id) => ({ '@id': id })),
  }))
  return [paid(SPRINT), paid(SPRINT_PLUS), ...organic, raw, ...custom]
}

/* A page-level Service (the UGC page). */
export const pageServiceFr = (pageUrl, fields) => ({ '@type': 'Service', '@id': `${pageUrl}#service`, url: pageUrl, provider: orgProvider, ...fields })
export { SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, CUSTOM_PACKAGES, FR_CORE_SERVICES, t as tFr }
