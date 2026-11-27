import { useEffect, useMemo, useRef } from 'react'
import ArticleCard from './components/blog/ArticleCard.jsx'
import { CategoryLabel } from './components/blog/shared.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { blogUi } from './content/blogUi.js'
import { getPublishedArticles } from './lib/blog/posts.js'
import { articleToItem } from './lib/blog/indexModel.js'
import { localizedBlogIndexHead } from './lib/blog/seo.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { currentLocale } from './i18n/locale.js'

/* /es/blog and /fr/blog: the blog index of a language other than English (Arabic uses BlogPageAr until its first article is published, then this list).
   Only PUBLISHED articles written in that language are listed; nothing is translated on the fly and no planned topic or placeholder card is shown. A language with no published article has
   no blog route at all (src/lib/routes/staticRoutes.js), so this page shows the not-found page if it is ever reached. Interface words: src/content/blogUi.js. */
export default function BlogPageLocalized() {
  const locale = currentLocale()
  const ui = blogUi(locale)
  const published = useMemo(() => getPublishedArticles(undefined, locale), [locale])
  useDocumentHead(published.length ? localizedBlogIndexHead(locale, published) : { title: ui.notFoundHead, description: ui.notFoundDescription, robots: 'noindex, follow' })
  const viewed = useRef(false)
  useEffect(() => {
    if (!published.length || viewed.current) return
    captureAttribution()
    viewed.current = true
    trackEvent('blog_page_view', { published: published.length, locale })
  }, [published.length, locale])

  if (!published.length) return <NotFoundPage />
  return (
    <section aria-labelledby="blog-h1" className="mx-auto max-w-7xl px-5 pb-14 pt-8 md:px-8 md:pb-20 md:pt-12">
      <CategoryLabel>{ui.theBlog}</CategoryLabel>
      <h1 id="blog-h1" className="mt-4 font-display text-[2.4rem] font-bold leading-[1.05] tracking-display-xl text-ink sm:text-5xl">{ui.blog}</h1>
      <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {published.map((a) => (
          <li key={a.slug} className="min-w-0">
            <ArticleCard item={articleToItem(a)} />
          </li>
        ))}
      </ul>
    </section>
  )
}
