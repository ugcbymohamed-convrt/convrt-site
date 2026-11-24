/* Per-page extras for the French JSON-LD: the FAQ each page renders (localized from the SAME English lists, so markup and visible text cannot differ) and any
   page-specific nodes (Service, offers). Keys are English base paths. Only the pages that exist in French are listed. */

import { UGC_FAQ } from '../../seo/ugcFaq.js'
import { SPOKESPERSON_FAQ } from '../../seo/spokespersonFaq.js'
import { ORGANIC_SOCIAL_FAQ } from '../../seo/organicSocialFaq.js'
import { SAAS_FAQ } from '../../seo/saasFaq.js'
import { PRICING_FAQ } from '../../seo/pricingFaq.js'
import { localizeFaq } from '../content.js'
import {
  monthlyOfferFr, oneOffOfferFr, offersOf, coreServiceNodesFr, packageNodesFr, pageServiceFr,
  SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, FR_CORE_SERVICES, tFr,
} from './jsonld-parts.js'
import { FR_SAAS_SERVICE } from './services.js'

const L = 'fr'
const pricingUrl = (pageUrl) => pageUrl.replace(/\/fr\/[a-z-]+$/, '/fr/pricing')

export const FR_PAGE_FAQ = {
  '/pricing': localizeFaq(PRICING_FAQ, L),
  '/ugc-video-agency': localizeFaq(UGC_FAQ, L),
  '/spokesperson-video-production': localizeFaq(SPOKESPERSON_FAQ, L),
  '/social-media-video-production': localizeFaq(ORGANIC_SOCIAL_FAQ, L),
  '/saas-video-production': localizeFaq(SAAS_FAQ, L),
}

export const FR_PAGE_GRAPH_EXTRAS = {
  '/pricing': (url) => ({ nodes: [...coreServiceNodesFr(url), ...packageNodesFr(url)] }),
  '/ugc-video-agency': (url) => {
    const packages = `${pricingUrl(url)}#packages`
    return {
      about: { '@id': `${url}#service` },
      nodes: [pageServiceFr(url, {
        name: 'Production de vidéos UGC',
        serviceType: 'Production de publicités vidéo UGC',
        description: `${FR_CORE_SERVICES.ugc.description} Les vidéos UGC sont créées par de vraies personnes.`,
        ...offersOf([
          monthlyOfferFr(SPRINT.name, SPRINT.monthly, packages), oneOffOfferFr(SPRINT.name, SPRINT.oneOff, packages),
          monthlyOfferFr(SPRINT_PLUS.name, SPRINT_PLUS.monthly, packages), oneOffOfferFr(SPRINT_PLUS.name, SPRINT_PLUS.oneOff, packages),
        ]),
      })],
    }
  },
  /* The three video-less service pages. Each has ONE Service (page-scoped, stable @id = its own URL + #service, provider = the single Organization) and a BreadcrumbList (added by
     structuredData.js). No rating, review, office, founding date or invented result; no Offer on spokesperson and SaaS (custom-scoped, no published price); Organic keeps its two
     package Offers exactly as the English graph does (Organic Light, Organic Growth: EUR amounts from src/i18n/fr/pricing.js while approved). */
  '/spokesperson-video-production': (url) => ({
    about: { '@id': `${url}#service` },
    nodes: [pageServiceFr(url, {
      name: 'Production de vidéos Spokesperson',
      serviceType: 'Production de vidéos Spokesperson',
      description: `${FR_CORE_SERVICES.spokesperson.description} Les vidéos Spokesperson mettent en scène de vrais présentateurs et peuvent être produites en plusieurs langues.`,
    })],
  }),
  '/saas-video-production': (url) => ({
    about: { '@id': `${url}#service` },
    nodes: [pageServiceFr(url, {
      name: FR_SAAS_SERVICE.name,
      serviceType: 'Production vidéo SaaS',
      description: FR_SAAS_SERVICE.description,
      audience: { '@type': 'Audience', audienceType: 'Éditeurs de logiciels, de SaaS et d’applications' },
    })],
  }),
  '/social-media-video-production': (url) => {
    const packages = `${pricingUrl(url)}#packages`
    return {
      about: { '@id': `${url}#service` },
      nodes: [pageServiceFr(url, {
        name: 'Production et gestion de vidéos organiques pour les réseaux sociaux',
        serviceType: FR_CORE_SERVICES.organic.name,
        description: `${FR_CORE_SERVICES.organic.description} Les vidéos sont portées par des humains et peuvent être produites en plusieurs langues.`,
        ...offersOf([ORGANIC.light, ORGANIC.growth].map((p) => monthlyOfferFr(p.name, p.monthly, packages, `${tFr(ORGANIC_COMMITMENT.summary)} ${tFr(ORGANIC_COMMITMENT.afterInitial)}`))),
      })],
    }
  },
}
