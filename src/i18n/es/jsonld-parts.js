/* Spanish building blocks for JSON-LD (offers and services). Amounts, quantities and terms come from the business data; Spanish sentences either interpolate those
   values directly or look the English term up in the dictionary (so a changed term fails the build until it is re-translated). */

import { ORG_ID } from '../../seo/structuredData.js'
import {
  SPRINT, SPRINT_PLUS, ORGANIC, COMMITMENT, ORGANIC_COMMITMENT, USAGE_RIGHTS, RAW_FOOTAGE, CUSTOM_PACKAGES,
} from '../../seo/businessKnowledge.js'
import { translate } from '../tr.js'
import { priceOf, formatPrice } from '../pricing.js'
import { ES_CORE_SERVICES } from './services.js'

const L = 'es'
const t = (s) => translate(L, s)

/* `money` is the business-data price object; the Spanish amount is the owner-approved EUR price. While it is pending there is NO Offer (null), never a wrong or placeholder price. */
const eur = (money) => priceOf(L, money)
const text = (money) => formatPrice(L, eur(money))
const priceSpec = (money, extra = {}) => ({ price: eur(money).amount, priceCurrency: eur(money).currency, valueAddedTaxIncluded: false, ...extra })
export const offersOf = (list) => { const o = list.filter(Boolean); return o.length ? { offers: o } : {} }

export const monthlyOfferEs = (name, money, packagesUrl, terms = t(COMMITMENT.summary)) => eur(money).amount === null ? null : ({
  '@type': 'Offer',
  name: `${name} (mensual)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'UnitPriceSpecification', ...priceSpec(money), unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
  description: `${text(money)} al mes, sin IVA. ${terms}`,
})

export const oneOffOfferEs = (name, money, packagesUrl) => eur(money).amount === null ? null : ({
  '@type': 'Offer',
  name: `${name} (pago único)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'PriceSpecification', ...priceSpec(money) },
  description: `${text(money)} en un único pago, sin IVA.`,
})

export const perUnitOfferEs = (name, money, packagesUrl) => eur(money).amount === null ? null : ({
  '@type': 'Offer',
  name: `${name} (por concepto creativo)`,
  url: packagesUrl,
  priceSpecification: { '@type': 'UnitPriceSpecification', ...priceSpec(money), referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitText: 'concepto creativo' } },
  description: `${text(money)} por concepto creativo, sin IVA.`,
})

export const coreServiceNodesEs = (pageUrl) =>
  Object.entries(ES_CORE_SERVICES).map(([id, s]) => ({ '@type': 'Service', '@id': `${pageUrl}#service-${id}`, name: s.name, description: s.description, provider: { '@id': ORG_ID }, url: pageUrl }))

const orgProvider = { '@id': ORG_ID }
const list = (items) => `${items.slice(0, -1).join(', ')} y ${items.at(-1)}`
const SERVICE_TYPE_PAID = 'Producción de anuncios en vídeo UGC y con presentador'
const SERVICE_TYPE_ORGANIC = 'Producción y gestión de contenido orgánico para redes sociales'

/* The package Services of /es/pricing (Sprint, Sprint Plus, Organic Light/Growth, raw footage, custom packages), with page-scoped @ids. */
export function packageNodesEs(pageUrl) {
  const packagesUrl = `${pageUrl}#packages`
  const idOf = (slug) => `${pageUrl}#service-${slug}`
  const paid = (p) => ({
    '@type': 'Service',
    '@id': idOf(p.id),
    name: p.name,
    serviceType: SERVICE_TYPE_PAID,
    description: `${p.concepts} conceptos creativos distintos con ${p.variationsPerConcept} versiones cada uno (${p.variations} versiones de anuncio finalizadas), producción integral en ${p.turnaroundBusinessDays} días laborables tras la aprobación de conceptos y guiones, dos rondas de revisiones por concepto y ${USAGE_RIGHTS.includedMonths} meses de derechos de uso mundiales incluidos, con hasta ${p.maxCreators} creadores o presentadores.`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf('ugc') }, { '@id': idOf('spokesperson') }],
    ...offersOf([monthlyOfferEs(p.name, p.monthly, packagesUrl), oneOffOfferEs(p.name, p.oneOff, packagesUrl)]),
  })
  const organic = [ORGANIC.light, ORGANIC.growth].map((p) => ({
    '@type': 'Service',
    '@id': idOf(p.id),
    name: p.name,
    serviceType: SERVICE_TYPE_ORGANIC,
    description: `${t(p.cadence)}, distribuido en las plataformas elegidas (${list(ORGANIC.platforms)}). Incluye ${ORGANIC.includedInBoth.map((x) => t(x).toLowerCase()).join(' y ')}; el alcance detallado de la gestión de comunidad está sujeto al acuerdo aplicable. ${t(ORGANIC_COMMITMENT.summary)}`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf('organic') }],
    ...offersOf([monthlyOfferEs(p.name, p.monthly, packagesUrl, `${t(ORGANIC_COMMITMENT.summary)} ${t(ORGANIC_COMMITMENT.afterInitial)}`)]),
  }))
  const raw = {
    '@type': 'Service',
    '@id': idOf(RAW_FOOTAGE.id),
    name: 'Complemento de material en bruto',
    serviceType: 'Complemento de material en bruto para un paquete de producción de vídeo finalizado',
    description: `${t(RAW_FOOTAGE.policy)} El material en bruto es un complemento opcional por ${text(RAW_FOOTAGE.price)} por concepto creativo.`,
    provider: orgProvider,
    isRelatedTo: [{ '@id': idOf(SPRINT.id) }, { '@id': idOf(SPRINT_PLUS.id) }],
    ...offersOf([perUnitOfferEs('Complemento de material en bruto', RAW_FOOTAGE.price, packagesUrl)]),
  }
  const custom = [
    { pkg: CUSTOM_PACKAGES.paid, name: 'Paquete creativo a medida', type: SERVICE_TYPE_PAID, related: [idOf('ugc'), idOf('spokesperson')] },
    { pkg: CUSTOM_PACKAGES.organic, name: 'Paquete de contenido orgánico a medida', type: SERVICE_TYPE_ORGANIC, related: [idOf('organic')] },
  ].map(({ pkg, name, type, related }) => ({
    '@type': 'Service',
    '@id': idOf(pkg.id),
    name,
    serviceType: type,
    description: `${t(pkg.description)} Posibilidades: ${pkg.features.map(t).join('; ')}. El alcance final, el precio y las condiciones comerciales se acuerdan de forma individual.`,
    provider: orgProvider,
    isRelatedTo: related.map((id) => ({ '@id': id })),
  }))
  return [paid(SPRINT), paid(SPRINT_PLUS), ...organic, raw, ...custom]
}

/* A page-level Service (UGC, spokesperson, organic, SaaS pages). */
export const pageServiceEs = (pageUrl, fields) => ({ '@type': 'Service', '@id': `${pageUrl}#service`, url: pageUrl, provider: orgProvider, ...fields })
export { SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, CUSTOM_PACKAGES, ES_CORE_SERVICES, t as tEs }
