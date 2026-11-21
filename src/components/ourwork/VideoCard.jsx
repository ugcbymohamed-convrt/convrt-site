import { posterUrl, titleOf, industryLabel, categoryOf, CATEGORIES, creatorLabel, brandLabel } from '../../content/portfolio.js'
import { PlayGlyph } from '../ugc/creatorVideo.jsx'
import { tr } from '../../i18n/tr.js'

/* One portrait (9:16) card. Poster first: there is NO <video> element, stream or download until a visitor opens the card, so a library of
   hundreds of videos costs only its thumbnails. The whole card is one button (the accessible name is "Play video: <title>").

   Text is kept to the minimum: the industry (with its category colour; none while it is unconfirmed) and the language(s) as small badges, the title and, only with
   the recorded permission, the brand and creator name. `priority` (the first row) loads eagerly; everything else lazy-loads. The image has fixed
   dimensions and the card a fixed 9:16 box, so the grid never shifts as thumbnails arrive. */

const COLOR_OF = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]))
const NEUTRAL = '#a1a1aa' // an unclassified video belongs to no category: no category colour, no industry badge

export default function VideoCard({ item, priority = false, onOpen }) {
  const color = COLOR_OF[categoryOf(item)] ?? NEUTRAL
  const industry = industryLabel(item.industry)
  const title = titleOf(item)
  const langs = (item.languages ?? []).map((l) => l.toUpperCase()).join(' · ')
  const who = [brandLabel(item), creatorLabel(item)].filter(Boolean).join(' · ')
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`${tr('Play video:')} ${title}`}
      style={{ '--c': color }}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border border-hairline bg-surface-1 text-left transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[var(--c)] hover:shadow-[0_18px_40px_-24px_var(--c)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:rounded-3xl"
    >
      <img
        src={posterUrl(item)}
        alt=""
        width="405"
        height="720"
        decoding="async"
        {...(priority ? { fetchpriority: 'high' } : { loading: 'lazy' })}
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />

      <span className="absolute inset-x-2.5 top-2.5 flex items-start justify-between gap-2 md:inset-x-3 md:top-3">
        {industry ? (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink backdrop-blur md:text-[11px]">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="truncate">{industry}</span>
          </span>
        ) : <span />}
        {langs && <span className="shrink-0 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-ink-muted backdrop-blur md:text-[11px]">{langs}</span>}
      </span>

      <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-ink backdrop-blur transition-[transform,background-color,border-color] duration-200 group-hover:scale-110 group-hover:border-[var(--c)] group-hover:bg-[var(--c)] group-hover:text-canvas motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:h-14 md:w-14">
        <PlayGlyph />
      </span>

      <span className="absolute inset-x-0 bottom-0 block p-3 md:p-4">
        <span className="line-clamp-2 block text-[13px] font-semibold leading-snug text-ink md:text-[15px]">{title}</span>
        {who && <span className="mt-0.5 block truncate text-[11px] text-ink-muted md:text-xs">{who}</span>}
      </span>
    </button>
  )
}
