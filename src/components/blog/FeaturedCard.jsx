import { CategoryLabel, ComingSoonPill, Thumb, ArrowUpRight, formatDate } from './shared.jsx'
import { trackEvent } from '../../lib/analytics.js'

/* The featured slot above the grid. A planned topic renders as a non-linked
   "FEATURED · COMING SOON" preview; once a real article is featured it becomes a link. */

export default function FeaturedCard({ item }) {
  const planned = item.kind === 'planned'
  return (
    <article
      className="group relative grid overflow-hidden rounded-[28px] border border-hairline bg-surface-1 lg:grid-cols-12
                 hover:border-hairline-strong focus-within:border-lime/60"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.07) 0%, transparent 65%)' }}
      />
      <div className="relative lg:col-span-7">
        <Thumb item={item} priority className="lg:aspect-auto lg:h-full lg:min-h-[320px]" />
      </div>
      <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {planned ? (
            <ComingSoonPill className="bg-[#EC4899]/10">Featured · Coming soon</ComingSoonPill>
          ) : (
            <span className="inline-flex items-center rounded-full border border-lime/40 bg-lime/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-lime">
              Featured
            </span>
          )}
          <CategoryLabel>{item.categoryLabel}</CategoryLabel>
        </div>

        <h2 className="mt-4 font-display text-[1.65rem] font-bold leading-[1.12] tracking-display text-ink sm:text-3xl lg:text-[2rem]">
          {planned ? (
            item.title
          ) : (
            <a
              href={item.href}
              onClick={() => trackEvent('blog_article_click', { slug: item.slug, location: 'featured' })}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {item.title}
            </a>
          )}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-[17px]">{item.featuredDescription}</p>

        {!planned && (
          <p className="mt-6 flex items-center gap-4 text-[13px] text-ink-muted">
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
            <span className="inline-flex items-center gap-1 font-semibold text-lime" aria-hidden="true">
              Read article <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        )}
      </div>
    </article>
  )
}
