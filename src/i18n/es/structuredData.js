/* SPANISH JSON-LD: the Spanish TEXT for the shared assembler (src/i18n/structuredDataShared.js, read its header for the structure and the identity rules). Everything comes from the
   business data and from the Spanish content the page renders (pages-registry.js, jsonld-parts.js, faq/), so the markup can never disagree with the visible text. */

import { translate } from '../tr.js'
import { coreServiceNodesEs } from './jsonld-parts.js'
import { faqTextEs } from './faq/text.js'
import { ES_PAGE_FAQ, ES_PAGE_GRAPH_EXTRAS } from './pages-registry.js'
import { ES_SEO } from './seo.js'
import { buildLocalizedJsonLd } from '../structuredDataShared.js'

const names = () => ({
  '/pricing': 'Tarifas',
  '/ugc-video-agency': 'Agencia de vídeos UGC',
  '/spokesperson-video-production': 'Vídeos Spokesperson',
  '/social-media-video-production': 'Vídeos para redes sociales',
  '/saas-video-production': 'Producción de vídeos para SaaS y aplicaciones',
  '/creator-showcase': 'Creadores',
  '/case-studies/graspo': translate('es', 'Graspo case study'),
  '/case-studies/elyon': translate('es', 'Elyon Dubai case study'),
  '/about': 'Sobre nosotros',
  '/contact': 'Contacto',
  '/privacy': 'Política de privacidad',
  '/terms': 'Términos y condiciones',
  '/legal-notice': 'Aviso legal',
  '/creative-growth-roadmap': 'Hoja de ruta de crecimiento creativo',
  '/risk-free-trial': '1 vídeo gratis',
  '/referrals': 'Programa de recomendación',
})

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== 'es') return undefined
  return buildLocalizedJsonLd({ locale: 'es', home: 'Inicio', names: names(), seo: ES_SEO, faqText: faqTextEs, pageFaq: ES_PAGE_FAQ, pageExtras: ES_PAGE_GRAPH_EXTRAS, coreServiceNodes: coreServiceNodesEs }, basePath, seo)
}
