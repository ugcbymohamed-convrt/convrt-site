/* Head metadata + structured data for the blog. Pure functions (testable in node).

   Structured-data rules (see docs/blog-publishing.md):
   • The index gets a CollectionPage. It lists articles only when real, published ones exist.
   • BlogPosting + BreadcrumbList are produced only for a real published article.
   • FAQPage is produced only when the article has real `faq` entries that are also
     shown on the page. Coming-soon topics never produce any structured data. */

import { SITE_URL, BLOG_PATH, BLOG_INDEXABLE } from '../../config.js'
import { articlePath } from './schema.js'

export const BLOG_TITLE = 'CONVRT Blog | Video Ads, UGC & Creative Strategy'
export const BLOG_DESCRIPTION =
  'Explore CONVRT Insights for practical guides on UGC video ads, SaaS marketing, e-commerce creative, and performance-focused video strategy.'

export const BLOG_URL = `${SITE_URL}${BLOG_PATH}`

export const robotsFor = (indexable) => (indexable ? 'index, follow' : 'noindex, follow')

const absolute = (urlOrPath) => (urlOrPath?.startsWith('/') ? `${SITE_URL}${urlOrPath}` : urlOrPath)

const ORGANIZATION = { '@type': 'Organization', name: 'CONVRT', url: SITE_URL }

export function blogIndexHead(published = []) {
  return {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    robots: robotsFor(BLOG_INDEXABLE),
    jsonLd: blogIndexJsonLd(published),
  }
}

export function blogIndexJsonLd(published = []) {
  const page = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CONVRT Blog',
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    isPartOf: { '@type': 'WebSite', name: 'CONVRT', url: SITE_URL },
    publisher: ORGANIZATION,
  }
  if (published.length) {
    page.mainEntity = {
      '@type': 'ItemList',
      itemListElement: published.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}${articlePath(a.slug)}`,
        name: a.title,
      })),
    }
  }
  return page
}

export const articleUrl = (a) => a.canonicalUrl || `${SITE_URL}${articlePath(a.slug)}`

export function articleHead(a) {
  const image = absolute(a.ogImage || a.image)
  return {
    title: a.seoTitle || `${a.title} | CONVRT Blog`,
    description: a.metaDescription || a.excerpt,
    url: articleUrl(a),
    image,
    type: 'article',
    robots: a.noindex ? 'noindex, follow' : 'index, follow',
    jsonLd: articleJsonLd(a),
  }
}

export function articleJsonLd(a) {
  const url = articleUrl(a)
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.metaDescription || a.excerpt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      datePublished: a.publishedAt,
      dateModified: a.updatedAt || a.publishedAt,
      author: { '@type': 'Person', name: a.author },
      publisher: ORGANIZATION,
      articleSection: a.categoryLabel,
      ...(a.ogImage || a.image ? { image: [absolute(a.ogImage || a.image)] } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: BLOG_URL },
        { '@type': 'ListItem', position: 3, name: a.title, item: url },
      ],
    },
  ]
  if (a.faq?.length) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: a.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }
  return graph
}

/* sitemap-blog.xml: published articles only (+ the index once it is indexable). */
export function buildBlogSitemap(published, { indexable = BLOG_INDEXABLE } = {}) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const entries = []
  if (indexable) entries.push({ loc: BLOG_URL, lastmod: published[0]?.updatedAt || published[0]?.publishedAt })
  for (const a of published) {
    if (a.noindex) continue
    entries.push({ loc: articleUrl(a), lastmod: a.updatedAt || a.publishedAt })
  }
  const body = entries
    .map((e) => `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}${body ? '\n' : ''}</urlset>\n`
}
