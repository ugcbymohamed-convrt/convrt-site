import { useEffect, useMemo, useRef, useState } from 'react'
import ArticleBody from './components/blog/ArticleBody.jsx'
import { ArticleFaq, RelatedArticles, TocMobile, TocSticky } from './components/blog/ArticleExtras.jsx'
import { RoadmapPromo } from './components/blog/BlogOffers.jsx'
import { CategoryLabel, PrimaryCta, formatDate } from './components/blog/shared.jsx'
import { getArticleMeta, getPublishedArticles, getLoadedBody, loadArticleBody, getTranslations } from './lib/blog/posts.js'
import { parseMarkdown } from './lib/blog/markdown.js'
import { relatedFor, SLUG_RE } from './lib/blog/schema.js'
import { articleHead, blogIndexUrl } from './lib/blog/seo.js'
import { blogUi } from './content/blogUi.js'
import { currentLocale } from './i18n/locale.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { captureAttribution, trackEvent } from './lib/analytics.js'

/* ─────────────────────────────────────────────
   /blog/<slug> — the reusable article template.

   Content comes from src/content/blog/<slug>.md (frontmatter + Markdown). This file never
   contains article text. A slug that is not a published article shows a not-found state
   with `noindex`. (In `npm run dev` a draft can be previewed here; production builds contain
   no draft content at all.)

   Semantics: <article> › <header> (breadcrumb nav, H1) › body sections (H2/H3) › FAQ
   section; the table of contents is a <nav>. Structured data: BlogPosting + BreadcrumbList
   (+ FAQPage only when the article has real FAQ entries) — see lib/blog/seo.js.
───────────────────────────────────────────── */

const notFoundHead = (locale) => ({
  title: blogUi(locale).notFoundHead,
  description: blogUi(locale).notFoundDescription,
  url: blogIndexUrl(locale),
  robots: 'noindex, follow',
})

/* /blog/<slug> (English) or /<es|fr|ar>/blog/<slug>: the slug is the last segment; the language comes from the URL prefix. */
function readSlug() {
  const parts = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean) // ['blog', slug] or ['es', 'blog', slug]
  const slug = parts.at(-1)
  return parts.at(-2) === 'blog' && SLUG_RE.test(slug) ? slug : null
}

export default function BlogArticlePage() {
  const locale = currentLocale()
  const ui = blogUi(locale)
  const slug = useMemo(readSlug, [])
  const found = useMemo(() => (slug ? getArticleMeta(slug, undefined, locale) : null), [slug, locale])
  const meta = found?.meta
  const isDraft = Boolean(found?.draft)

  // { blocks, toc } once the body chunk has loaded. Preloaded bodies (prerender / hydration) are there on first render.
  const [content, setContent] = useState(() => {
    const md = meta ? getLoadedBody(meta.slug, locale) : null
    return md == null ? null : parseMarkdown(md)
  })
  useEffect(() => {
    if (!meta || content) return
    let cancelled = false
    loadArticleBody(meta.slug, locale).then((md) => {
      if (cancelled || md == null) return
      setContent(parseMarkdown(md))
    })
    return () => { cancelled = true }
  }, [meta])

  const head = meta ? { ...articleHead(meta, getTranslations(meta)), ...(isDraft ? { robots: 'noindex, nofollow', jsonLd: undefined, alternates: undefined } : {}) } : notFoundHead(locale)
  useDocumentHead(head)

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return
    viewed.current = true
    trackEvent(meta ? 'blog_article_view' : 'blog_not_found', { slug: slug ?? '' })
  }, [meta, slug])

  if (!meta) return <NotFound ui={ui} locale={locale} />

  const related = relatedFor(meta, getPublishedArticles(undefined, locale))
  const toc = content?.toc ?? []
  const showToc = meta.toc === true || (meta.toc === 'auto' && toc.filter((t) => t.level === 2).length >= 3)
  const updated = meta.updatedAt && meta.updatedAt !== meta.publishedAt

  return (
    <>
      {isDraft && (
        <p className="bg-[#EC4899]/15 px-5 py-2 text-center text-sm font-medium text-[#F472B6]" role="status">
          {ui.draftNotice}
        </p>
      )}

      <article>
        <header className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-12">
          <nav aria-label={ui.breadcrumb}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              <li><a className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime" href={blogIndexUrl(locale).replace(/^https?:\/\/[^/]+/, '')}>{ui.blog}</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{meta.categoryLabel}</li>
            </ol>
          </nav>

          <div className="mt-6 max-w-3xl">
            <CategoryLabel>{meta.categoryLabel}</CategoryLabel>
            <h1 className="mt-4 font-display text-[2.1rem] font-bold leading-[1.08] tracking-display-xl text-ink sm:text-5xl lg:text-[3.4rem]">
              {meta.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted md:text-xl">{meta.excerpt}</p>
            {meta.publishedAt && (
              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                {meta.author && (
                  <>
                    <span>{ui.by} <span className="font-medium text-ink">{meta.author}</span></span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <time dateTime={meta.publishedAt}>{formatDate(meta.publishedAt)}</time>
                {updated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{ui.updated} <time dateTime={meta.updatedAt}>{formatDate(meta.updatedAt)}</time></span>
                  </>
                )}
              </p>
            )}
          </div>

          {meta.image && (
            <figure className="mt-9 md:mt-12">
              <img
                src={meta.image}
                alt={meta.imageAlt}
                width="1200"
                height="630"
                fetchpriority="high"
                decoding="async"
                className="aspect-[1200/630] w-full rounded-3xl border border-hairline object-cover"
              />
            </figure>
          )}
        </header>

        <div className="mx-auto mt-10 max-w-7xl px-5 md:mt-14 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
          <div className="min-w-0">
            {showToc && <TocMobile toc={toc} />}
            {content ? (
              <ArticleBody blocks={content.blocks} />
            ) : (
              <div className="min-h-[60vh] max-w-[44rem]" aria-busy="true" aria-label={ui.loading} />
            )}
            <ArticleFaq items={meta.faq} />
          </div>
          {showToc && (
            <aside aria-label={ui.articleNav} className="hidden lg:block">
              <TocSticky toc={toc} />
            </aside>
          )}
        </div>
      </article>

      <div className="mx-auto mt-16 max-w-7xl px-5 md:px-8">
        <RoadmapPromo
          id="article-roadmap-heading"
          location="blog_article"
          headline={<>{ui.roadmapHeadline[0]}<span className="text-lime">{ui.roadmapHeadline[1]}</span></>}
          copy={ui.roadmapCopy}
        />
      </div>

      <RelatedArticles articles={related} />
      <div className="pb-16 md:pb-24" />
    </>
  )
}

function NotFound({ ui, locale }) {
  const indexPath = blogIndexUrl(locale).replace(/^https?:\/\/[^/]+/, '')
  return (
    <section className="mx-auto max-w-2xl px-5 py-24 text-center md:px-8 md:py-32">
      <CategoryLabel>{ui.theBlog}</CategoryLabel>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-display text-ink md:text-5xl">{ui.notFoundTitle}</h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
        {ui.notFoundText}
      </p>
      <div className="mt-8 flex flex-col items-stretch sm:items-center">
        <PrimaryCta href={indexPath}>{ui.notFoundCta}</PrimaryCta>
      </div>
    </section>
  )
}
