/* ARABIC JSON-LD: the Arabic TEXT for the shared assembler (src/i18n/structuredDataShared.js, read its header for the structure and the identity rules). ONE Arabic language variant ("ar")
   serves the UAE and Saudi Arabia: no ar-AE / ar-SA nodes, no Gulf office, area served or client claim. Prices are USD read from the business data; the Arabic pages show no VAT wording, so no
   Offer states a tax status (jsonld-parts.js). */

import { coreServiceNodesAr } from './jsonld-parts.js'
import { faqTextEs as faqText } from '../es/faq/text.js'
import { AR_PAGE_FAQ, AR_PAGE_GRAPH_EXTRAS } from './pages-registry.js'
import { AR_SEO } from './seo.js'
import { buildLocalizedJsonLd } from '../structuredDataShared.js'

const names = {
  '/pricing': 'الأسعار',
  '/ugc-video-agency': 'وكالة UGC',
  '/creator-showcase': 'صناع المحتوى',
  '/spokesperson-video-production': 'فيديوهات Spokesperson',
  '/social-media-video-production': 'فيديوهات للسوشيال ميديا',
  '/saas-video-production': 'فيديوهات برامج SaaS أو التطبيقات',
  '/case-studies/graspo': 'دراسة حالة غراسبو',
  '/case-studies/elyon': 'دراسة حالة إيليون دبي',
  '/about': 'من نحن',
  '/contact': 'تواصل معنا',
  '/privacy': 'سياسة الخصوصية',
  '/terms': 'الشروط والأحكام',
  '/legal-notice': 'الإشعار القانوني',
  '/referrals': 'برنامج شركاء الإحالة',
}

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== 'ar') return undefined
  return buildLocalizedJsonLd({ locale: 'ar', home: 'الرئيسية', names, seo: AR_SEO, faqText, pageFaq: AR_PAGE_FAQ, pageExtras: AR_PAGE_GRAPH_EXTRAS, coreServiceNodes: coreServiceNodesAr }, basePath, seo)
}
