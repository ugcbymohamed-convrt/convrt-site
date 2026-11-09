/* Decides what the /blog index shows. Pure, so the rules are unit-tested.

   Two states, derived — never configured by hand:
   • coming soon (no published articles): featured = the planned topic marked `featured`,
     grid = the other planned topics. Nothing links anywhere.
   • live (≥1 published article): featured = the article marked `featured: true` (else the
     newest), "Latest articles" = the rest, and a "Coming soon" list keeps the planned topics
     that have not been published yet.
   Category filter: with a category selected the featured block folds into the lists, so a
   filtered view is always one simple grid. */

import { BLOG_CATEGORIES, articlePath, pickFeatured, remainingPlanned } from './schema.js'

const labelOf = (slug) => BLOG_CATEGORIES.find((c) => c.slug === slug)?.label ?? ''

export const plannedToItem = (t) => ({
  kind: 'planned',
  key: `planned:${t.slug}`,
  slug: t.slug,
  category: t.category,
  categoryLabel: labelOf(t.category),
  title: t.title,
  description: t.description,
  featuredDescription: t.featuredDescription || t.description,
  art: t.art,
})

export const articleToItem = (a) => ({
  kind: 'published',
  key: `article:${a.slug}`,
  slug: a.slug,
  href: articlePath(a.slug),
  category: a.category,
  categoryLabel: a.categoryLabel || labelOf(a.category),
  title: a.title,
  description: a.excerpt,
  featuredDescription: a.excerpt,
  image: a.image,
  imageAlt: a.imageAlt,
  publishedAt: a.publishedAt,
  author: a.author,
})

export function buildIndexModel(published, planned, activeCategory = 'all') {
  const live = published.length > 0
  const remaining = remainingPlanned(planned, published)
  const inCategory = (it) => activeCategory === 'all' || it.category === activeCategory

  let featured = null
  if (live) featured = articleToItem(pickFeatured(published))
  else {
    const topic = remaining.find((t) => t.featured)
    if (topic) featured = plannedToItem(topic)
  }
  const showFeatured = Boolean(featured) && activeCategory === 'all'

  const isFeatured = (it) => showFeatured && it.key === featured.key
  const articles = published.map(articleToItem).filter(inCategory).filter((it) => !isFeatured(it))
  const upcoming = remaining.map(plannedToItem).filter(inCategory).filter((it) => !isFeatured(it))

  const total = articles.length + upcoming.length + (showFeatured ? 1 : 0)
  return { live, featured: showFeatured ? featured : null, articles, upcoming, total }
}
