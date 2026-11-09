import { useId } from 'react'
import ArticleCard from './ArticleCard.jsx'
import { articleToItem } from '../../lib/blog/indexModel.js'

/* Table of contents (H2 + H3 of the body, built from the same AST). Rendered twice by the
   page: a collapsible <details> on small screens, a sticky list on lg+. */
export function TocList({ toc }) {
  return (
    <ol className="space-y-2.5 text-[15px] leading-snug">
      {toc.map((t) => (
        <li key={t.id} className={t.level === 3 ? 'pl-4' : ''}>
          <a
            href={`#${t.id}`}
            className="block rounded text-ink-muted transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            {t.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

export function TocMobile({ toc }) {
  const id = useId()
  return (
    <nav aria-labelledby={id} className="mb-8 lg:hidden">
      <details className="group rounded-2xl border border-hairline bg-surface-1 px-5 py-4">
        <summary
          id={id}
          className="flex min-h-[28px] cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime [&::-webkit-details-marker]:hidden"
        >
          In this article
          <span aria-hidden="true" className="text-lime transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
        </summary>
        <div className="mt-4"><TocList toc={toc} /></div>
      </details>
    </nav>
  )
}

export function TocSticky({ toc }) {
  const id = useId()
  return (
    <nav aria-labelledby={id} className="sticky top-28 hidden lg:block">
      <p id={id} className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">In this article</p>
      <TocList toc={toc} />
    </nav>
  )
}

/* FAQ: native <details> (works without JS, keyboard accessible). The same items feed the
   FAQPage structured data in lib/blog/seo.js, so what is marked up is what is shown. */
export function ArticleFaq({ items }) {
  if (!items?.length) return null
  return (
    <section aria-labelledby="article-faq" className="mt-16 max-w-[44rem]">
      <h2 id="article-faq" className="font-display text-[1.65rem] font-bold leading-[1.15] tracking-display text-ink md:text-[2rem]">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-hairline rounded-2xl border border-hairline bg-surface-1">
        {items.map((f, i) => (
          <details key={i} className="group px-5 py-4 md:px-6">
            <summary className="flex min-h-[28px] cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime md:text-[17px] [&::-webkit-details-marker]:hidden">
              <h3 className="font-semibold">{f.q}</h3>
              <span aria-hidden="true" className="mt-0.5 text-lime transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
            </summary>
            <p className="mt-3 text-[16px] leading-relaxed text-zinc-300">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function RelatedArticles({ articles }) {
  if (!articles.length) return null
  return (
    <section aria-labelledby="related-articles" className="mx-auto mt-16 max-w-7xl px-5 md:px-8">
      <h2 id="related-articles" className="font-display text-xl font-bold tracking-snug text-ink md:text-2xl">
        Keep reading
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {articles.map((a) => (
          <li key={a.slug} className="min-w-0">
            <ArticleCard item={articleToItem(a)} />
          </li>
        ))}
      </ul>
    </section>
  )
}
