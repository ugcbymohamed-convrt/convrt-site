/* Per-page extras for the Arabic JSON-LD: the FAQ each page renders (localized from the SAME English lists, so markup and visible text cannot differ) and any page-specific nodes
   (Service, offers). Keys are English base paths. Only the pages that exist in Arabic are listed (src/i18n/registry.js). */

import { UGC_FAQ } from '../../seo/ugcFaq.js'
import { PRICING_FAQ } from '../../seo/pricingFaq.js'
import { localizeFaq } from '../content.js'
import {
  monthlyOfferAr, oneOffOfferAr, offersOf, coreServiceNodesAr, packageNodesAr,
  pageServiceAr, SPRINT, SPRINT_PLUS, AR_CORE_SERVICES,
} from './jsonld-parts.js'

const L = 'ar'
const pricingUrl = (pageUrl) => pageUrl.replace(/\/ar\/[a-z-]+$/, '/ar/pricing')

export const AR_PAGE_FAQ = {
  '/pricing': localizeFaq(PRICING_FAQ, L),
  '/ugc-video-agency': localizeFaq(UGC_FAQ, L),
}

export const AR_PAGE_GRAPH_EXTRAS = {
  '/pricing': (url) => ({ nodes: [...coreServiceNodesAr(url), ...packageNodesAr(url)] }),
  '/ugc-video-agency': (url) => {
    const packages = `${pricingUrl(url)}#packages`
    return {
      about: { '@id': `${url}#service` },
      nodes: [pageServiceAr(url, {
        name: 'إنتاج فيديوهات UGC',
        serviceType: 'إنتاج إعلانات فيديو UGC',
        description: `${AR_CORE_SERVICES.ugc.description} يصنع فيديوهات UGC صُنّاع محتوى حقيقيون.`,
        ...offersOf([
          monthlyOfferAr(SPRINT.name, SPRINT.monthly, packages), oneOffOfferAr(SPRINT.name, SPRINT.oneOff, packages),
          monthlyOfferAr(SPRINT_PLUS.name, SPRINT_PLUS.monthly, packages), oneOffOfferAr(SPRINT_PLUS.name, SPRINT_PLUS.oneOff, packages),
        ]),
      })],
    }
  },
}
