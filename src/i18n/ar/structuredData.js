/* ARABIC JSON-LD. Same principles as src/i18n/es/structuredData.js and src/seo/structuredData.js: everything comes from the business data and from the Arabic content the page renders,
   so the markup can never disagree with the visible text; no invented facts, ratings, addresses, offices, service areas, awards, testimonials or results.

   IDENTITY ACROSS LANGUAGES: the Organization and WebSite keep their ONE stable @id; every Arabic page has its own WebPage (inLanguage "ar"), breadcrumb and (where it shows one)
   FAQPage generated from the Arabic FAQ it renders. ONE Arabic language variant ("ar") serves both the UAE and Saudi Arabia: no ar-AE / ar-SA nodes, no Gulf office. */

import { organizationNode, ORG_ID, WEBSITE_ID, breadcrumbNode } from '../../seo/structuredData.js'
import { coreServiceNodesAr } from './jsonld-parts.js'
import { absoluteUrl } from '../seo.js'
import { faqTextEs as faqText } from '../es/faq/text.js'
import { homeFaqFor } from '../content.js'
import { AR_PAGE_FAQ, AR_PAGE_GRAPH_EXTRAS } from './pages-registry.js'
import { AR_SEO } from './seo.js'

const CONTEXT = 'https://schema.org'
const graph = (nodes) => ({ '@context': CONTEXT, '@graph': nodes })
const LOCALE = 'ar'

export const faqNodeAr = (items, id) => ({
  '@type': 'FAQPage',
  ...(id ? { '@id': id } : {}),
  inLanguage: LOCALE,
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: faqText(f) } })),
})

const BREADCRUMB_NAMES = {
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

/* No BreadcrumbList on pages that show no breadcrumb trail (Phase 5 revision): structured data must describe what the visitor can see. */
const NO_VISIBLE_TRAIL = new Set(['/about', '/contact', '/pricing', '/referrals'])
const PAGE_TYPE = { '/about': 'AboutPage', '/contact': 'ContactPage', '/creator-showcase': 'CollectionPage' }

export function localizedJsonLd(locale, basePath, seo = {}) {
  if (locale !== LOCALE) return undefined
  if (basePath === '/creative-growth-roadmap' || basePath === '/risk-free-trial' || basePath === '/project-application') return undefined // like the English pages: noindex, no structured data
  const url = absoluteUrl(LOCALE, basePath)
  const { title, description } = { ...seo, ...AR_SEO[basePath] }
  const isHome = basePath === '/'
  const trail = isHome || NO_VISIBLE_TRAIL.has(basePath) ? null : [{ name: 'الرئيسية', path: '/ar/' }, { name: BREADCRUMB_NAMES[basePath], path: `/ar${basePath}` }]
  // (the case study's breadcrumb, like the English one, is a two-level trail: Home > the study)
  const extras = AR_PAGE_GRAPH_EXTRAS[basePath]?.(url) ?? { nodes: [] }
  const faq = isHome ? homeFaqFor(LOCALE) : AR_PAGE_FAQ[basePath]
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
      ...(extras.mentions ? { mentions: extras.mentions } : {}),
      ...(trail ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      inLanguage: LOCALE,
    },
    ...(trail ? [breadcrumbNode(trail.map((t) => ({ name: t.name, path: t.path })), `${url}#breadcrumb`)] : []),
    ...(isHome ? coreServiceNodesAr(url) : []),
    ...extras.nodes,
    ...(faq ? [faqNodeAr(faq, `${url}#faq`)] : []),
  ])
}
