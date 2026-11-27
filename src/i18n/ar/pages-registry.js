/* Per-page extras for the Arabic JSON-LD: the FAQ each page renders (localized from the SAME English lists, so markup and visible text cannot differ) and any page-specific nodes
   (Service, offers). Keys are English base paths. Only the pages that exist in Arabic are listed (src/i18n/registry.js). */

import { UGC_FAQ } from '../../seo/ugcFaq.js'
import { SPOKESPERSON_FAQ } from '../../seo/spokespersonFaq.js'
import { ORGANIC_SOCIAL_FAQ } from '../../seo/organicSocialFaq.js'
import { SAAS_FAQ } from '../../seo/saasFaq.js'
import { ORG_ID } from '../../seo/structuredData.js'
import { PRICING_FAQ } from '../../seo/pricingFaq.js'
import { localizeFaq } from '../content.js'
import {
  monthlyOfferAr, oneOffOfferAr, offersOf, coreServiceNodesAr, packageNodesAr,
  pageServiceAr, SPRINT, SPRINT_PLUS, ORGANIC, ORGANIC_COMMITMENT, AR_CORE_SERVICES, tAr,
} from './jsonld-parts.js'

const L = 'ar'
const pricingUrl = (pageUrl) => pageUrl.replace(/\/ar\/[a-z-]+$/, '/ar/pricing')

export const AR_PAGE_FAQ = {
  '/pricing': localizeFaq(PRICING_FAQ, L),
  '/ugc-video-agency': localizeFaq(UGC_FAQ, L),
  '/spokesperson-video-production': localizeFaq(SPOKESPERSON_FAQ, L),
  '/social-media-video-production': localizeFaq(ORGANIC_SOCIAL_FAQ, L),
  '/saas-video-production': localizeFaq(SAAS_FAQ, L),
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
        description: `${AR_CORE_SERVICES.ugc.description} يصنع فيديوهات UGC صناع محتوى حقيقيون.`,
        ...offersOf([
          monthlyOfferAr(SPRINT.name, SPRINT.monthly, packages), oneOffOfferAr(SPRINT.name, SPRINT.oneOff, packages),
          monthlyOfferAr(SPRINT_PLUS.name, SPRINT_PLUS.monthly, packages), oneOffOfferAr(SPRINT_PLUS.name, SPRINT_PLUS.oneOff, packages),
        ]),
      })],
    }
  },
  '/spokesperson-video-production': (url) => ({
    about: { '@id': `${url}#service` },
    nodes: [pageServiceAr(url, {
      name: 'إنتاج فيديوهات Spokesperson',
      serviceType: 'إنتاج فيديوهات Spokesperson',
      description: `${AR_CORE_SERVICES.spokesperson.description}`,
    })],
  }),
  '/saas-video-production': (url) => ({
    about: { '@id': `${url}#service` },
    nodes: [pageServiceAr(url, {
      name: 'فيديوهات برامج SaaS أو التطبيقات',
      serviceType: 'إنتاج فيديوهات لبرامج SaaS والتطبيقات',
      description: AR_CORE_SERVICES.saas.description,
      audience: { '@type': 'Audience', audienceType: 'شركات SaaS والبرمجيات وتطبيقات الويب والجوال' },
    })],
  }),
  '/social-media-video-production': (url) => {
    const packages = `${pricingUrl(url)}#packages`
    return {
      about: { '@id': `${url}#service` },
      nodes: [pageServiceAr(url, {
        name: 'إنتاج فيديوهات للسوشيال ميديا وإدارة المحتوى العضوي',
        serviceType: AR_CORE_SERVICES.organic.name,
        description: AR_CORE_SERVICES.organic.description,
        ...offersOf([ORGANIC.light, ORGANIC.growth].map((p) => monthlyOfferAr(p.name, p.monthly, packages, `${tAr(ORGANIC_COMMITMENT.summary)} ${tAr(ORGANIC_COMMITMENT.afterInitial)}`))),
      })],
    }
  },
  // The case study: like the English one, a WebPage about the client work that mentions the organic service. No Article, rating, review or result markup beyond the visible page.
  '/case-studies/graspo': (url) => ({
    about: { '@type': 'Organization', name: 'Graspo' },
    mentions: { '@id': `${url.replace('/case-studies/graspo', '/social-media-video-production')}#service` },
    nodes: [],
  }),
  // The Elyon Dubai study (paid-advertising proof): the same shape, mentioning the UGC service it is an example of. No rating, review, date or result markup beyond the visible page.
  '/case-studies/elyon': (url) => ({
    about: { '@type': 'Organization', name: 'Elyon Dubai' },
    mentions: { '@id': `${url.replace('/case-studies/elyon', '/ugc-video-agency')}#service` },
    nodes: [],
  }),
}
void ORG_ID
