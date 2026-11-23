/* Per-page extras for the French JSON-LD: the FAQ each page renders (localized from the SAME English lists, so markup and visible text cannot differ) and any
   page-specific nodes (Service, offers). Keys are English base paths. Only the pages that exist in French are listed. */

import { UGC_FAQ } from '../../seo/ugcFaq.js'
import { PRICING_FAQ } from '../../seo/pricingFaq.js'
import { localizeFaq } from '../content.js'
import {
  monthlyOfferFr, oneOffOfferFr, offersOf, coreServiceNodesFr, packageNodesFr, pageServiceFr,
  SPRINT, SPRINT_PLUS, FR_CORE_SERVICES,
} from './jsonld-parts.js'

const L = 'fr'
const pricingUrl = (pageUrl) => pageUrl.replace(/\/fr\/[a-z-]+$/, '/fr/pricing')

export const FR_PAGE_FAQ = {
  '/pricing': localizeFaq(PRICING_FAQ, L),
  '/ugc-video-agency': localizeFaq(UGC_FAQ, L),
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
}
