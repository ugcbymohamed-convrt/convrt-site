/* SPANISH JSON-LD. Same principles as src/seo/structuredData.js (read its header): everything comes from the business data and from the Spanish content the
   page renders, so the markup can never disagree with the visible text; no invented facts, ratings, addresses, areas or prices.

   IDENTITY ACROSS LANGUAGES
   • The Organization and WebSite keep their ONE stable @id (ORG_ID / WEBSITE_ID): Spanish pages carry the same Organization node as English, and refer to the
     WebSite by @id. CONVRT is one entity in every language.
   • Each Spanish page has its own WebPage (@id = its own URL, inLanguage "es"), its own breadcrumb and its own FAQPage generated from the Spanish FAQ it shows.
   • Services on a Spanish page have page-scoped @ids (…/es/pricing#service-ugc) with Spanish names and descriptions, provider = the stable Organization. */

import { SITE_URL } from '../../config.js'
import { organizationNode, ORG_ID, WEBSITE_ID, breadcrumbNode } from '../../seo/structuredData.js'
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
  '/spokesperson-video-production': 'Vídeos con presentador',
  '/social-media-video-production': 'Vídeos para redes sociales',
  '/saas-video-production': 'Producción de vídeo para SaaS',
  '/creator-showcase': 'Creator Showcase',
  '/about': 'Sobre CONVRT',
  '/contact': 'Contacto',
  '/creative-growth-roadmap': 'Hoja de ruta de crecimiento creativo',
}

const PAGE_TYPE = { '/about': 'AboutPage', '/contact': 'ContactPage', '/creator-showcase': 'CollectionPage' }

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== LOCALE) return undefined
  if (basePath === '/creative-growth-roadmap') return undefined // like the English page: noindex, no structured data
  const url = absoluteUrl(LOCALE, basePath)
  const { title, description } = seoFor(basePath, seo)
  const isHome = basePath === '/'
  const trail = isHome ? null : [{ name: 'Inicio', path: '/es/' }, { name: BREADCRUMB_NAMES[basePath], path: `/es${basePath}` }]
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
