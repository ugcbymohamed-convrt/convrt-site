import { useEffect, useRef } from 'react'
import BlogHero from './components/blog/BlogHero.jsx'
import { ArrowUpRight } from './components/blog/shared.jsx'
import { AR_ARTICLES } from './content/blogAr.js'
import { arabicBlogHead } from './lib/blog/seo.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { hrefFor } from './i18n/tr.js'
import { OFFER_PATHS } from './config.js'
import { PATHS } from './routes.js'

/* /ar/blog: the Arabic blog index (owner brief 2026-11-25). Same masthead and styling as the English index (BlogHero), in Arabic.

   NOTHING is invented: no article card, date, author or category filter appears until an Arabic article is approved and listed in src/content/blogAr.js, and the English articles are never shown here as
   if they were Arabic. While the list is empty the page shows the masthead's "coming soon" state and a short set of links to the working Arabic service pages, so it is never a dead end. */

const SERVICES = [
  { label: 'فيديوهات UGC', text: 'إعلانات بصُنّاع محتوى حقيقيين.', href: PATHS.ugcVideoAgency },
  { label: 'فيديوهات Spokesperson', text: 'مقدّمون يوصلون رسالتك بوضوح.', href: PATHS.spokespersonVideoProduction },
  { label: 'فيديوهات SaaS', text: 'شرح المنتج بفيديو سهل الفهم.', href: PATHS.saasVideoProduction },
  { label: 'فيديوهات عضوية للسوشل ميديا', text: 'محتوى مستمر بخطة واضحة.', href: PATHS.socialMediaVideoProduction },
]

export default function BlogPageAr() {
  useDocumentHead(arabicBlogHead(AR_ARTICLES))
  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return
    viewed.current = true
    trackEvent('blog_page_view', { published: AR_ARTICLES.length, locale: 'ar' })
  }, [])

  return (
    <>
      <BlogHero comingSoon={AR_ARTICLES.length === 0} />

      <section aria-label="المقالات" className="mx-auto max-w-7xl px-5 pb-14 md:px-8 md:pb-20">
        {AR_ARTICLES.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {AR_ARTICLES.map((a) => (
              <li key={a.slug} className="min-w-0">
                <a href={`/ar/blog/${a.slug}`} className="block h-full rounded-3xl border border-hairline bg-surface-1/60 p-5 transition-colors hover:border-lime/50">
                  <h2 className="font-display text-lg font-bold leading-snug text-ink">{a.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{a.description}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <h2 className="font-display text-lg font-bold tracking-snug text-ink md:text-xl">في هذه الأثناء، تعرّف على خدماتنا</h2>
            <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((s) => (
                <li key={s.href} className="min-w-0">
                  <a href={hrefFor(s.href)} className="group block h-full rounded-3xl border border-hairline bg-surface-1/60 p-5 backdrop-blur-md transition-colors hover:border-lime/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime">
                    <span className="font-display text-base font-bold leading-snug text-ink transition-colors group-hover:text-lime">{s.label}</span>
                    <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ink-muted">{s.text}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <a
                href={hrefFor(OFFER_PATHS.roadmap)}
                onClick={() => trackEvent('hero_creative_roadmap_click', { location: 'blog_index' })}
                className="cta-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas"
              >
                احصل على 5 أفكار إعلانية مجانًا
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </>
        )}
      </section>
    </>
  )
}
