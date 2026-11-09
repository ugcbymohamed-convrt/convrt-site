import { CategoryLabel, ComingSoonPill, Thumb, ArrowUpRight, formatDate } from './shared.jsx'
import { trackEvent } from '../../lib/analytics.js'

/* One card in the index grid. Rendered as an <li>/<article> pair by the caller's <ul>.

   • planned  → a "Coming soon" preview. It is deliberately NOT a link, not focusable and has
                no pointer cursor, so it can never lead to a nonexistent article.
   • published → the whole card is one link (the title is the link; a ::after covers the card). */

const card =
  'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-hairline bg-surface-1 transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transition-none'

export default function ArticleCard({ item }) {
  if (item.kind === 'planned') {
    return (
      <article className={`${card} hover:border-hairline-strong`}>
        <div className="relative">
          <Thumb item={item} />
          <ComingSoonPill className="absolute left-3.5 top-3.5" />
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <CategoryLabel>{item.categoryLabel}</CategoryLabel>
          <h3 className="mt-3 font-display text-xl font-bold leading-[1.2] tracking-snug text-ink">{item.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{item.description}</p>
        </div>
      </article>
    )
  }

  return (
    <article className={`${card} hover:-translate-y-0.5 hover:border-lime/40 hover:shadow-[0_18px_40px_-24px_rgba(213,255,64,0.35)] motion-reduce:hover:translate-y-0 focus-within:border-lime/60`}>
      <Thumb item={item} />
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <CategoryLabel>{item.categoryLabel}</CategoryLabel>
        <h3 className="mt-3 font-display text-xl font-bold leading-[1.2] tracking-snug text-ink">
          <a
            href={item.href}
            onClick={() => trackEvent('blog_article_click', { slug: item.slug, location: 'grid' })}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {item.title}
          </a>
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{item.description}</p>
        <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-[13px] text-ink-muted">
          <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          <span className="inline-flex items-center gap-1 font-semibold text-lime" aria-hidden="true">
            Read <ArrowUpRight className="h-3 w-3" />
          </span>
        </p>
      </div>
    </article>
  )
}
