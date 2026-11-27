/* SPANISH JSON-LD. Same principles as src/seo/structuredData.js (read its header): everything comes from the business data and from the Spanish content the
   page renders, so the markup can never disagree with the visible text; no invented facts, ratings, addresses, areas or prices.

   IDENTITY ACROSS LANGUAGES
   • The Organization and WebSite keep their ONE stable @id (ORG_ID / WEBSITE_ID): Spanish pages carry the same Organization node as English, and refer to the
     WebSite by @id. CONVRT is one entity in every language.
   • Each Spanish page has its own WebPage (@id = its own URL, inLanguage "es"), its own breadcrumb and its own FAQPage generated from the Spanish FAQ it shows.
   • Services on a Spanish page have page-scoped @ids (…/es/pricing#service-ugc) with Spanish names and descriptions, provider = the stable Organization. */

import { SITE_URL } from '../../config.js'
import { organizationNode, ORG_ID, WEBSITE_ID, breadcrumbNode, CASE_STUDY_SCHEMA, SERVICE_PATHS } from '../../seo/structuredData.js'
import { translate } from '../tr.js'
import { coreServiceNodesEs } from './jsonld-parts.js'
import { absoluteUrl } from '../seo.js'
import { faqTextEs } from './faq/text.js'
import { homeFaqFor } from '../content.js'
import { ES_PAGE_FAQ, ES_PAGE_GRAPH_EXTRAS } from './pages-registry.js'

const CONTEXT = 'https://schema.org'
const graph = (nodes) => ({ '@context': CONTEXT, '@graph': nodes })
const LOCALE = 'es'

export const faqNodeEs = (items, id) => ({
  '@type': 'FAQPage',
  ...(id ? { '@id': id } : {}),
  inLanguage: LOCALE,
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: faqTextEs(f) } })),
})

const BREADCRUMB_NAMES = {
  '/pricing': 'Tarifas',
  '/ugc-video-agency': 'Agencia de vídeos UGC',
  '/spokesperson-video-production': 'Vídeos Spokesperson',
  '/social-media-video-production': 'Vídeos para redes sociales',
  '/saas-video-production': 'Producción de vídeos para SaaS y aplicaciones',
  '/creator-showcase': 'Creadores',
  '/about': 'Sobre nosotros',
  '/contact': 'Contacto',
  '/privacy': 'Política de privacidad',
  '/terms': 'Términos y condiciones',
  '/legal-notice': 'Aviso legal',
  '/creative-growth-roadmap': 'Hoja de ruta de crecimiento creativo',
  '/risk-free-trial': '1 vídeo gratis',
  '/referrals': 'Programa de recomendación',
}

/* No BreadcrumbList on pages that show no breadcrumb trail (Phase 5 revision): structured data must describe what the visitor can see. */
const NO_VISIBLE_TRAIL = new Set(['/about', '/contact', '/pricing', '/referrals'])
const PAGE_TYPE = { '/about': 'AboutPage', '/contact': 'ContactPage', '/creator-showcase': 'CollectionPage' }

/* The Spanish twin of caseStudyGraph (src/seo/structuredData.js): the same facts (a WebPage about the client work, its two-level breadcrumb and the CONVRT service the study is an
   example of), in Spanish, with inLanguage "es". Deliberately NOT emitted, as in English: Article, Review/Rating, dates, result figures beyond the visible text, VideoObject.
   The Service is the Spanish service page's own node (same @id), without its package Offers. */
function caseStudyGraphEs(basePath, { title, description }) {
  const url = absoluteUrl(LOCALE, basePath)
  const cs = CASE_STUDY_SCHEMA[basePath]
  const servicePath = SERVICE_PATHS[cs.service]
  const { offers, ...service } = ES_PAGE_GRAPH_EXTRAS[servicePath](absoluteUrl(LOCALE, servicePath)).nodes[0]
  void offers
  return graph([
    organizationNode(),
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
      about: { '@type': 'Organization', name: cs.client },
      mentions: { '@id': service['@id'] },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: LOCALE,
    },
    breadcrumbNode([{ name: 'Inicio', path: '/es/' }, { name: translate(LOCALE, cs.trail), path: `/es${basePath}` }], `${url}#breadcrumb`),
    service,
  ])
}

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== LOCALE) return undefined
  if (CASE_STUDY_SCHEMA[basePath]) return caseStudyGraphEs(basePath, seoFor(basePath, seo))
  if (basePath === '/creative-growth-roadmap' || basePath === '/risk-free-trial' || basePath === '/project-application') return undefined // like the English pages: noindex, no structured data
  const url = absoluteUrl(LOCALE, basePath)
  const { title, description } = seoFor(basePath, seo)
  const isHome = basePath === '/'
  const trail = isHome || NO_VISIBLE_TRAIL.has(basePath) ? null : [{ name: 'Inicio', path: '/es/' }, { name: BREADCRUMB_NAMES[basePath], path: `/es${basePath}` }]
  const extras = ES_PAGE_GRAPH_EXTRAS[basePath]?.(url) ?? { nodes: [] }
  const faq = isHome ? homeFaqFor(LOCALE) : ES_PAGE_FAQ[basePath]
  return graph([
    organizationNode(),
    {
      '@type': PAGE_TYPE[basePath] ?? 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      ...(isHome || basePath === '/about' ? { about: { '@id': ORG_ID } } : {}),
      ...(extras.about ? { about: extras.about } : {}),
      ...(trail ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      inLanguage: LOCALE,
    },
    ...(trail ? [breadcrumbNode(trail.map((t) => ({ name: t.name, path: t.path })), `${url}#breadcrumb`)] : []),
    ...(isHome ? coreServiceNodesEs(url) : []),
    ...extras.nodes,
    ...(faq ? [faqNodeEs(faq, `${url}#faq`)] : []),
  ])
}

import { ES_SEO } from './seo.js'
const seoFor = (basePath, seo) => ({ title: ES_SEO[basePath]?.title, description: ES_SEO[basePath]?.description, ...seo, ...ES_SEO[basePath] })
