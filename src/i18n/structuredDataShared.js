/* THE LOCALIZED JSON-LD ASSEMBLER: one function builds the structured data of every non-English page, so the Spanish, French and Arabic graphs can never drift apart in shape
   (Phase 5, audit F2-3). A language supplies only its TEXT through a small config (src/i18n/<locale>/structuredData.js): its breadcrumb names, FAQ text function, core-service wording,
   page extras (Service/Offer nodes built from the business data) and SEO titles. Everything structural is decided here:

   • the Organization (ONE @id in every language, description in the page's language) and the WebSite (referred to by @id);
   • one WebPage per page: @id = its own URL, name/description = the page's SEO title and description (src/i18n/<locale>/seo.js), inLanguage = the language's html code;
   • BreadcrumbList only where the page shows a trail (never About, Contact, Pricing or Referrals) and always Home › page;
   • the home page lists ALL four core services; the pricing page the core services plus every package; each service page its own Service (+ Offers from the business data);
   • a case study = a WebPage about the client, mentioning the service it exemplifies, with that service's Service node embedded (no Offers), exactly like the English graph;
   • the FAQPage generated from the FAQ the page shows.
   No ratings, reviews, dates, addresses, areas served or claims beyond the visible page. */

import { organizationNode, ORG_ID, WEBSITE_ID, breadcrumbNode, CASE_STUDY_SCHEMA, SERVICE_PATHS } from '../seo/structuredData.js'
import { absoluteUrl } from './seo.js'
import { homeFaqFor } from './content.js'
import { LOCALES } from './locales.js'

const CONTEXT = 'https://schema.org'
export const graph = (nodes) => ({ '@context': CONTEXT, '@graph': nodes })

/* Pages with no structured data (noindex conversion utilities), like their English twins. */
const NO_JSONLD = new Set(['/creative-growth-roadmap', '/risk-free-trial', '/project-application'])
/* Pages that show no breadcrumb trail, so carry no BreadcrumbList (Phase 5 revision): structured data describes what the visitor can see. */
export const NO_VISIBLE_TRAIL = new Set(['/about', '/contact', '/pricing', '/referrals'])
const PAGE_TYPE = { '/about': 'AboutPage', '/contact': 'ContactPage', '/creator-showcase': 'CollectionPage' }

export const faqNodeFor = (locale, faqText) => (items, id) => ({
  '@type': 'FAQPage',
  ...(id ? { '@id': id } : {}),
  inLanguage: LOCALES[locale].htmlLang,
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: faqText(f) } })),
})

/* cfg = { locale, home: 'Inicio', names: { '/pricing': 'Tarifas', … (breadcrumb names, incl. the two case studies) }, seo: { '/path': { title, description } },
           faqText(item), pageFaq: { '/path': items }, pageExtras: { '/path': (url) => ({ about?, nodes }) }, coreServiceNodes(url) } */
export function buildLocalizedJsonLd(cfg, basePath, seo = {}) {
  const { locale, home, names, pageFaq, pageExtras, coreServiceNodes, faqText } = cfg
  if (NO_JSONLD.has(basePath)) return undefined
  const inLanguage = LOCALES[locale].htmlLang
  const url = absoluteUrl(locale, basePath)
  const { title, description } = { title: cfg.seo[basePath]?.title, description: cfg.seo[basePath]?.description, ...seo, ...cfg.seo[basePath] }
  const org = organizationNode(locale)
  const homeUrl = absoluteUrl(locale, '/')

  if (CASE_STUDY_SCHEMA[basePath]) {
    const cs = CASE_STUDY_SCHEMA[basePath]
    const servicePath = SERVICE_PATHS[cs.service]
    const { offers, ...service } = pageExtras[servicePath](absoluteUrl(locale, servicePath)).nodes[0]
    void offers // the study mentions the service; the package prices stay on the service page and /pricing
    return graph([
      org,
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description,
        isPartOf: { '@id': WEBSITE_ID }, publisher: { '@id': ORG_ID },
        about: { '@type': 'Organization', name: cs.client },
        mentions: { '@id': service['@id'] },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        inLanguage,
      },
      breadcrumbNode([{ name: home, path: new URL(homeUrl).pathname }, { name: names[basePath], path: new URL(url).pathname }], `${url}#breadcrumb`),
      service,
    ])
  }

  const isHome = basePath === '/'
  const trail = isHome || NO_VISIBLE_TRAIL.has(basePath) ? null : [{ name: home, path: new URL(homeUrl).pathname }, { name: names[basePath], path: new URL(url).pathname }]
  const extras = pageExtras[basePath]?.(url) ?? { nodes: [] }
  const faq = isHome ? homeFaqFor(locale) : pageFaq[basePath]
  return graph([
    org,
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
      inLanguage,
    },
    ...(trail ? [breadcrumbNode(trail, `${url}#breadcrumb`)] : []),
    ...(isHome ? coreServiceNodes(url) : []),
    ...extras.nodes,
    ...(faq ? [faqNodeFor(locale, faqText)(faq, `${url}#faq`)] : []),
  ])
}
