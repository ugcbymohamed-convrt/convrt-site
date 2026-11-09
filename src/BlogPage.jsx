import { useEffect, useMemo, useRef, useState } from 'react'
import BlogHero from './components/blog/BlogHero.jsx'
import CategoryFilter, { ALL } from './components/blog/CategoryFilter.jsx'
import FeaturedCard from './components/blog/FeaturedCard.jsx'
import ArticleCard from './components/blog/ArticleCard.jsx'
import { HooksPromo, RoadmapPromo } from './components/blog/BlogOffers.jsx'
import { PLANNED_TOPICS } from './content/blogPlanned.js'
import { getPublishedArticles } from './lib/blog/posts.js'
import { buildIndexModel } from './lib/blog/indexModel.js'
import { blogIndexHead } from './lib/blog/seo.js'
import { BLOG_CATEGORIES } from './lib/blog/schema.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { captureAttribution, trackEvent } from './lib/analytics.js'

/* ─────────────────────────────────────────────
   /blog — CONVRT Insights.

   Nothing on this page is a hard-coded article list:
   • real articles come from src/content/blog/*.md (see docs/blog-publishing.md)
   • "coming soon" previews come from src/content/blogPlanned.js
   • which of them show, and how, is decided by lib/blog/indexModel.js.

   SEO: title/description/canonical per the brief; robots is driven by BLOG_INDEXABLE in
   src/config.js (currently `noindex, follow`). Structured data: CollectionPage only.
───────────────────────────────────────────── */

const categoryLabel = (slug) => BLOG_CATEGORIES.find((c) => c.slug === slug)?.label ?? ALL.label

export default function BlogPage() {
  const published = useMemo(() => getPublishedArticles(), [])
  const [active, setActive] = useState(ALL.slug)
  const model = useMemo(() => buildIndexModel(published, PLANNED_TOPICS, active), [published, active])

  useDocumentHead(blogIndexHead(published))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('blog_page_view', { published: published.length })
  }, [published.length])

  const select = (slug) => {
    setActive(slug)
    trackEvent('blog_category_select', { category: slug })
  }

  const filtered = active !== ALL.slug
  const summary = model.live
    ? `${model.articles.length + (model.featured ? 1 : 0)} article${model.articles.length + (model.featured ? 1 : 0) === 1 ? '' : 's'}${model.upcoming.length ? `, ${model.upcoming.length} coming soon` : ''}`
    : `${model.total} planned article${model.total === 1 ? '' : 's'}`

  return (
    <>
      <BlogHero comingSoon={!model.live} />

      <section aria-label="Articles" className="mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-20">
        <CategoryFilter active={active} onSelect={select} />
        <p className="mt-4 text-sm text-ink-muted" role="status" aria-live="polite">
          {filtered ? `${categoryLabel(active)}: ${summary}` : summary}
        </p>

        {model.featured && (
          <div className="mt-6 md:mt-8">
            <FeaturedCard item={model.featured} />
          </div>
        )}

        {model.articles.length > 0 && (
          <Group title={model.featured || filtered ? 'Latest articles' : 'Articles'} items={model.articles} />
        )}

        {model.upcoming.length > 0 && (
          <Group title={model.live ? 'Coming soon' : 'Topics we’re working on'} items={model.upcoming} />
        )}

        {model.total === 0 && (
          <p className="mt-10 rounded-3xl border border-dashed border-hairline px-6 py-12 text-center text-ink-muted">
            Nothing in {categoryLabel(active)} yet. Check back soon, or{' '}
            <button
              type="button"
              onClick={() => select(ALL.slug)}
              className="font-semibold text-lime underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              view all articles
            </button>
            .
          </p>
        )}
      </section>

      <HooksPromo comingSoon={!model.live} />
      <RoadmapPromo className="mx-auto mt-10 max-w-7xl px-5 pb-16 md:mt-14 md:px-8 md:pb-24" />
    </>
  )
}

function Group({ title, items }) {
  return (
    <div className="mt-10 md:mt-12">
      <h2 className="font-display text-lg font-bold tracking-snug text-ink md:text-xl">{title}</h2>
      <ul className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.key} className="min-w-0">
            <ArticleCard item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}
