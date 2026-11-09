import { BLOG_CATEGORIES } from '../../lib/blog/schema.js'

/* Horizontal filter pills. A native <button> group with aria-pressed: Tab/Shift+Tab to move,
   Enter/Space to select — no custom key handling needed. On phones the row scrolls sideways
   (scrollbar hidden, soft fade on the right edge); from md up it wraps. */

export const ALL = { slug: 'all', label: 'All Articles' }
const OPTIONS = [ALL, ...BLOG_CATEGORIES]

export default function CategoryFilter({ active, onSelect }) {
  return (
    <div
      role="group"
      aria-label="Filter articles by category"
      className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                 [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]
                 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:[mask-image:none]"
    >
      {OPTIONS.map((c) => {
        const on = c.slug === active
        return (
          <button
            key={c.slug}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(c.slug)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none
                        min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime
                        ${
                          on
                            ? 'border-lime/70 bg-lime/[0.12] text-lime'
                            : 'border-hairline bg-surface-1/60 text-ink-muted hover:border-hairline-strong hover:text-ink'
                        }`}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
