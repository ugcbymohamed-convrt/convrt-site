/* FRENCH JSON-LD: the French TEXT for the shared assembler (src/i18n/structuredDataShared.js, read its header for the structure and the identity rules). Everything comes from the business
   data and from the French content the page renders; CONVRT has no French office, address, area served or legal establishment, and none is implied. */

import { coreServiceNodesFr } from './jsonld-parts.js'
import { faqTextFr } from './faq/text.js'
import { FR_PAGE_FAQ, FR_PAGE_GRAPH_EXTRAS } from './pages-registry.js'
import { FR_SEO } from './seo.js'
import { buildLocalizedJsonLd } from '../structuredDataShared.js'

const names = {
  '/pricing': 'Tarifs',
  '/ugc-video-agency': 'Vidéos UGC',
  '/spokesperson-video-production': 'Vidéos Spokesperson',
  '/social-media-video-production': 'Vidéos organiques pour les réseaux',
  '/saas-video-production': 'Production vidéo pour SaaS et applications',
  '/creator-showcase': 'Créateurs',
  '/about': 'À propos',
  '/contact': 'Contact',
  '/privacy': 'Politique de confidentialité',
  '/terms': 'Conditions générales',
  '/legal-notice': 'Mentions légales',
  '/referrals': 'Programme de parrainage',
  '/case-studies/graspo': 'Étude de cas Graspo',
  '/case-studies/elyon': 'Étude de cas Elyon Dubai',
}

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== 'fr') return undefined
  return buildLocalizedJsonLd({ locale: 'fr', home: 'Accueil', names, seo: FR_SEO, faqText: faqTextFr, pageFaq: FR_PAGE_FAQ, pageExtras: FR_PAGE_GRAPH_EXTRAS, coreServiceNodes: coreServiceNodesFr }, basePath, seo)
}
