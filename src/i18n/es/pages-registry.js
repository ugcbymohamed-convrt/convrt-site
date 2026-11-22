/* Per-page extras for the Spanish JSON-LD: the FAQ each page renders (localized from the SAME English lists, so markup and visible text cannot differ) and any
   page-specific nodes (Service, offers). Keys are English base paths. */

import { UGC_FAQ } from '../../seo/ugcFaq.js'
import { SPOKESPERSON_FAQ } from '../../seo/spokespersonFaq.js'
import { ORGANIC_SOCIAL_FAQ } from '../../seo/organicSocialFaq.js'
import { SAAS_FAQ } from '../../seo/saasFaq.js'
import { PRICING_FAQ } from '../../seo/pricingFaq.js'
import { localizeFaq } from '../content.js'
import {
  monthlyOfferEs, oneOffOfferEs, offersOf, coreServiceNodesEs, packageNodesEs, pageServiceEs,
  SPRINT, SPRINT_PLUS, ORGANIC, CUSTOM_PACKAGES, ES_CORE_SERVICES,
} from './jsonld-parts.js'
import { ORG_ID } from '../../seo/structuredData.js'

/* The Organic page's Offer description. The English data states a six-month initial commitment that is not confirmed (it conflicts with the Pricing page's 3-month monthly terms), so the Spanish Offer
   points to the package conditions instead, like the visible page copy (src/i18n/es/labels.js ES_ORGANIC_PACKAGES_NOTE). */
const ES_ORGANIC_OFFER_TERMS = 'Consulta las condiciones de contratación y permanencia en la página de tarifas.'

const L = 'es'
const pricingUrl = (pageUrl) => pageUrl.replace(/\/es\/[a-z-]+$/, '/es/pricing')

export const ES_PAGE_FAQ = {
  '/pricing': localizeFaq(PRICING_FAQ, L),
  '/ugc-video-agency': localizeFaq(UGC_FAQ, L),
  '/spokesperson-video-production': localizeFaq(SPOKESPERSON_FAQ, L),
  '/social-media-video-production': localizeFaq(ORGANIC_SOCIAL_FAQ, L),
  '/saas-video-production': localizeFaq(SAAS_FAQ, L),
}

export const ES_PAGE_GRAPH_EXTRAS = {
  '/pricing': (url) => ({ nodes: [...coreServiceNodesEs(url), ...packageNodesEs(url)] }),
  '/ugc-video-agency': (url) => {
    const packages = `${pricingUrl(url)}#packages`
    return {
      about: { '@id': `${url}#service` },
      nodes: [pageServiceEs(url, {
        name: 'Producción de vídeos UGC',
        serviceType: 'Producción de anuncios UGC en vídeo',
        description: `${ES_CORE_SERVICES.ugc.description} Los vídeos UGC los crean personas reales.`,
        ...offersOf([
          monthlyOfferEs(SPRINT.name, SPRINT.monthly, packages), oneOffOfferEs(SPRINT.name, SPRINT.oneOff, packages),
          monthlyOfferEs(SPRINT_PLUS.name, SPRINT_PLUS.monthly, packages), oneOffOfferEs(SPRINT_PLUS.name, SPRINT_PLUS.oneOff, packages),
        ]),
      })],
    }
  },
  '/spokesperson-video-production': (url) => ({
    about: { '@id': `${url}#service` },
    nodes: [pageServiceEs(url, {
      name: 'Producción de vídeos Spokesperson',
      serviceType: 'Producción de vídeos Spokesperson',
      description: `${ES_CORE_SERVICES.spokesperson.description} Los vídeos Spokesperson cuentan con presentadores humanos reales y pueden producirse en varios idiomas.`,
    })],
  }),
  '/saas-video-production': (url) => ({
    about: { '@id': `${url}#service` },
    nodes: [pageServiceEs(url, {
      name: 'Producción de vídeo para SaaS',
      serviceType: 'Producción de vídeo para SaaS',
      description: 'Producción de vídeo para empresas de software y apps: vídeos explicativos de SaaS, demostraciones de producto, recorridos por apps, vídeos explicativos animados de producto, presentaciones de software con personas reales y creativos publicitarios en vídeo, producidos de principio a fin por CONVRT.',
      audience: { '@type': 'Audience', audienceType: 'Empresas de SaaS, software y apps' },
    })],
  }),
  '/social-media-video-production': (url) => {
    const packages = `${pricingUrl(url)}#packages`
    return {
      about: { '@id': `${url}#service` },
      nodes: [pageServiceEs(url, {
        name: 'Producción y gestión de contenido orgánico para redes sociales',
        serviceType: ES_CORE_SERVICES.organic.name,
        description: `${ES_CORE_SERVICES.organic.description} Los vídeos están liderados por personas y pueden producirse en varios idiomas.`,
        ...offersOf([ORGANIC.light, ORGANIC.growth].map((p) => monthlyOfferEs(p.name, p.monthly, packages, ES_ORGANIC_OFFER_TERMS))),
      })],
    }
  },
}
void ORG_ID
void CUSTOM_PACKAGES
