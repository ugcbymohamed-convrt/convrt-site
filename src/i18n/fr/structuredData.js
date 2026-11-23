/* FRENCH JSON-LD. Same principles as src/seo/structuredData.js and the Spanish builder (read their headers): everything comes from the business data and from the French content the
   page renders, so the markup can never disagree with the visible text; no invented facts, ratings, addresses, areas, offices or prices.

   IDENTITY ACROSS LANGUAGES
   • The Organization and WebSite keep their ONE stable @id (ORG_ID / WEBSITE_ID): French pages carry the same Organization node as English, and refer to the WebSite by @id.
     CONVRT is one entity in every language; its address is the English country-only one (no French office, address, area served or legal establishment exists or is implied).
   • Each French page has its own WebPage (@id = its own URL, inLanguage "fr-FR"), its own breadcrumb and its own FAQPage generated from the French FAQ it shows.
   • Services on a French page have page-scoped @ids (…/fr/pricing#service-ugc) with French names and descriptions, provider = the stable Organization. */

import { organizationNode, ORG_ID, WEBSITE_ID, breadcrumbNode } from '../../seo/structuredData.js'
import { coreServiceNodesFr } from './jsonld-parts.js'
import { absoluteUrl } from '../seo.js'
import { faqTextFr } from './faq/text.js'
import { homeFaqFor } from '../content.js'
import { FR_PAGE_FAQ, FR_PAGE_GRAPH_EXTRAS } from './pages-registry.js'
import { FR_SEO } from './seo.js'
import { LOCALES } from '../locales.js'

const CONTEXT = 'https://schema.org'
const graph = (nodes) => ({ '@context': CONTEXT, '@graph': nodes })
const LOCALE = 'fr'
const IN_LANGUAGE = LOCALES.fr.htmlLang

export const faqNodeFr = (items, id) => ({
  '@type': 'FAQPage',
  ...(id ? { '@id': id } : {}),
  inLanguage: IN_LANGUAGE,
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: faqTextFr(f) } })),
})

const BREADCRUMB_NAMES = {
  '/pricing': 'Tarifs',
  '/ugc-video-agency': 'Agence UGC',
  '/spokesperson-video-production': 'Vidéos avec porte-parole',
  '/social-media-video-production': 'Vidéos pour les réseaux sociaux',
  '/saas-video-production': 'Vidéos pour le SaaS',
  '/creator-showcase': 'Créateurs',
}

const PAGE_TYPE = { '/creator-showcase': 'CollectionPage' }

const seoFor = (basePath, seo) => ({ title: FR_SEO[basePath]?.title, description: FR_SEO[basePath]?.description, ...seo, ...FR_SEO[basePath] })

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== LOCALE) return undefined
  if (basePath === '/creative-growth-roadmap' || basePath === '/risk-free-trial') return undefined // like the English pages: noindex, no structured data
  const url = absoluteUrl(LOCALE, basePath)
  const { title, description } = seoFor(basePath, seo)
  const isHome = basePath === '/'
  const trail = isHome ? null : [{ name: 'Accueil', path: '/fr/' }, { name: BREADCRUMB_NAMES[basePath], path: `/fr${basePath}` }]
  const extras = FR_PAGE_GRAPH_EXTRAS[basePath]?.(url) ?? { nodes: [] }
  const faq = isHome ? homeFaqFor(LOCALE) : FR_PAGE_FAQ[basePath]
  return graph([
    organizationNode(),
    {
      '@type': PAGE_TYPE[basePath] ?? 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      ...(isHome ? { about: { '@id': ORG_ID } } : {}),
      ...(extras.about ? { about: extras.about } : {}),
      ...(trail ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      inLanguage: IN_LANGUAGE,
    },
    ...(trail ? [breadcrumbNode(trail.map((t) => ({ name: t.name, path: t.path })), `${url}#breadcrumb`)] : []),
    ...(isHome ? coreServiceNodesFr(url) : []),
    ...extras.nodes,
    ...(faq ? [faqNodeFr(faq, `${url}#faq`)] : []),
  ])
}
