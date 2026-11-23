import { localizeStat } from '../../i18n/format.js'
import { currentLocale } from '../../i18n/locale.js'
import { useTr } from '../../i18n/tr.js'

/* A VERIFIED view count on a video (the `views` field of src/content/portfolio.js, copied from the published case study: Meta Business Suite, Jan to Jun 2026). Rendered only when the entry has
   one (today the Arabic Graspo videos); nothing is estimated and no total is ever summed. The badge says views and nothing else: never conversions, revenue or leads.
   In Arabic the figure keeps Western digits ("7.5 مليون مشاهدة"); the badge is a left-to-right-safe pill (bdi keeps the figure intact next to the Arabic word). */
export default function ViewsBadge({ item, className = '' }) {
  const tr = useTr()
  if (!item?.views) return null
  const locale = currentLocale()
  const figure = localizeStat(locale, item.views)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-black/65 px-2.5 py-1 text-[11px] font-bold leading-none text-lime backdrop-blur md:text-xs ${className}`}>
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="8" cy="8" r="2" fill="currentColor" /></svg>
      <span><bdi>{figure}</bdi> {tr('views')}</span>
    </span>
  )
}
