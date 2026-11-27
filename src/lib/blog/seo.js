/* Head metadata + structured data for the blog. Pure functions (testable in node).

   Structured-data rules (see docs/blog-publishing.md):
   • The index gets a CollectionPage. It lists articles only when real, published ones exist.
   • BlogPosting + BreadcrumbList are produced only for a real published article.
   • FAQPage is produced only when the article has real `faq` entries that are also
     shown on the page. Coming-soon topics never produce any structured data. */

import { SITE_URL, OG_IMAGE, BLOG_PATH, BLOG_INDEXABLE } from '../../config.js'
import { articlePath, translationsOf, publishedIn, selectPublished, BLOG_LOCALES, BLOG_DEFAULT_LOCALE } from './schema.js'
import { blogUi } from '../../content/blogUi.js'
import { organizationRef, websiteRef } from '../../seo/structuredData.js'
import { LOCALES } from '../../i18n/locales.js'

export const BLOG_TITLE = 'CONVRT Blog | Video Ads, UGC & Creative Strategy'
export const BLOG_DESCRIPTION =
  'Explore CONVRT Insights for practical guides on UGC video ads, SaaS marketing, e-commerce creative, and performance-focused video strategy.'

export const BLOG_URL = `${SITE_URL}${BLOG_PATH}`

export const robotsFor = (indexable) => (indexable ? 'index, follow' : 'noindex, follow')

const absolute = (urlOrPath) => (urlOrPath?.startsWith('/') ? `${SITE_URL}${urlOrPath}` : urlOrPath)

/* The publisher is the Organization entity defined once in src/seo/structuredData.js (same @id everywhere). */
const ORGANIZATION = organizationRef()

export function blogIndexHead(published = []) {
  return {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    image: OG_IMAGE.url,
    imageAlt: OG_IMAGE.alt,
    imageWidth: OG_IMAGE.width,
    imageHeight: OG_IMAGE.height,
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
    isPartOf: websiteRef(),
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

const localeOf = (a) => a.locale ?? BLOG_DEFAULT_LOCALE
export const articleUrl = (a) => a.canonicalUrl || `${SITE_URL}${articlePath(a.slug, localeOf(a))}`
/* The blog index URL of a language: /blog, /es/blog, /fr/blog, /ar/blog. */
export const blogIndexUrl = (locale = BLOG_DEFAULT_LOCALE) => (locale === BLOG_DEFAULT_LOCALE ? BLOG_URL : `${SITE_URL}/${locale}${BLOG_PATH}`)

/* hreflang annotations between the GENUINE published translations of an article (its `translationGroup`): every member, itself included, plus x-default = the English version when there is one.
   `translations` = translationsOf(article, allArticles); fewer than two members → none. A draft, a future-dated or a noindex article is never in it (see schema.js). */
export function articleAlternates(translations = []) {
  if (translations.length < 2) return []
  const list = translations.map((m) => ({ hreflang: LOCALES[localeOf(m)].htmlLang, href: articleUrl(m) }))
  const en = translations.find((m) => localeOf(m) === BLOG_DEFAULT_LOCALE)
  return en ? [...list, { hreflang: 'x-default', href: articleUrl(en) }] : list
}

export function articleHead(a, translations = []) {
  const locale = localeOf(a)
  const ui = blogUi(locale)
  const own = absolute(a.ogImage || a.image)
  // An article's own cover wins; otherwise the default share image (with its known size) is used.
  const image = own || OG_IMAGE.url
  const alternates = articleAlternates(translations)
  return {
    title: a.seoTitle || `${a.title} | ${locale === BLOG_DEFAULT_LOCALE ? 'CONVRT Blog' : ui.indexName}`,
    description: a.metaDescription || a.excerpt,
    url: articleUrl(a),
    image,
    ...(own ? {} : { imageAlt: OG_IMAGE.alt, imageWidth: OG_IMAGE.width, imageHeight: OG_IMAGE.height }),
    type: 'article',
    robots: a.noindex ? 'noindex, follow' : 'index, follow',
    ...(locale === BLOG_DEFAULT_LOCALE ? {} : { lang: LOCALES[locale].htmlLang, dir: LOCALES[locale].dir, ogLocale: LOCALES[locale].ogLocale }),
    ...(alternates.length ? { alternates } : {}),
    jsonLd: articleJsonLd(a),
  }
}

export function articleJsonLd(a) {
  const url = articleUrl(a)
  const locale = localeOf(a)
  const ui = blogUi(locale)
  const home = locale === BLOG_DEFAULT_LOCALE ? `${SITE_URL}/` : `${SITE_URL}/${locale}/`
  const graph = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.metaDescription || a.excerpt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      ...(locale === BLOG_DEFAULT_LOCALE ? {} : { inLanguage: LOCALES[locale].htmlLang }),
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
        { '@type': 'ListItem', position: 1, name: ui.home, item: home },
        { '@type': 'ListItem', position: 2, name: ui.blog, item: blogIndexUrl(locale) },
        { '@type': 'ListItem', position: 3, name: a.title, item: url },
      ],
    },
  ]
  if (a.faq?.length) {
    graph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      ...(locale === BLOG_DEFAULT_LOCALE ? {} : { inLanguage: LOCALES[locale].htmlLang }),
      mainEntity: a.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }
  return graph
}

/* sitemap-blog.xml: published articles of every language (+ each language's index once it is indexable and has an article). Articles that belong to a translation group with at least two
   published members also carry xhtml:link alternates, so the hreflang in the sitemap equals the hreflang in the page. `published` = selectPublished(all metas); `allMetas` = every article's metadata. */
export function buildBlogSitemap(published, { indexable = BLOG_INDEXABLE, allMetas = published } = {}) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const entries = []
  const english = published.filter((a) => localeOf(a) === BLOG_DEFAULT_LOCALE)
  if (indexable) entries.push({ loc: BLOG_URL, lastmod: english[0]?.updatedAt || english[0]?.publishedAt })
  for (const l of BLOG_LOCALES.filter((x) => x !== BLOG_DEFAULT_LOCALE)) {
    const list = published.filter((a) => localeOf(a) === l)
    if (indexable && list.length) entries.push({ loc: blogIndexUrl(l), lastmod: list[0].updatedAt || list[0].publishedAt })
  }
  for (const a of published) {
    if (a.noindex) continue
    entries.push({ loc: articleUrl(a), lastmod: a.updatedAt || a.publishedAt, alternates: articleAlternates(translationsOf(a, allMetas)) })
  }
  const withAlternates = entries.some((e) => e.alternates?.length)
  const body = entries
    .map((e) => `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}${(e.alternates ?? []).map((l) => `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${esc(l.href)}"/>`).join('')}</url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${withAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ''}>\n${body}${body ? '\n' : ''}</urlset>\n`
}

/* The blog index of a language other than English (/es/blog, /fr/blog, /ar/blog). It is "noindex, follow" until BLOG_INDEXABLE is on AND the language has a published article, so an index with no
   articles is never offered to search. Arabic keeps its masthead-only state (src/BlogPageAr.jsx) until the first Arabic article is published. */
export function localizedBlogIndexHead(locale, published = []) {
  const ui = blogUi(locale)
  return {
    title: ui.indexTitle,
    description: ui.indexDescription,
    url: blogIndexUrl(locale),
    image: OG_IMAGE.url,
    imageAlt: OG_IMAGE.alt,
    imageWidth: OG_IMAGE.width,
    imageHeight: OG_IMAGE.height,
    robots: robotsFor(BLOG_INDEXABLE && published.length > 0),
    lang: LOCALES[locale].htmlLang,
    dir: LOCALES[locale].dir,
    ogLocale: LOCALES[locale].ogLocale,
    alternates: [],
  }
}
export const arabicBlogHead = (articles = []) => localizedBlogIndexHead('ar', articles)
export const AR_BLOG_TITLE = blogUi('ar').indexTitle
export const AR_BLOG_DESCRIPTION = blogUi('ar').indexDescription
