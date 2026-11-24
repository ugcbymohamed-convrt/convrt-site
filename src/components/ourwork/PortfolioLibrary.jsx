import { useEffect, useMemo, useRef, useState } from 'react'
import { availableCategories, countIn, filterByCategory, prioritizeLanguage, buildFacets, matchesFilters, languageLabel } from '../../content/portfolio.js'
import { currentLocale } from '../../i18n/locale.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section } from '../ugc/shared.jsx'
import { RoadmapCta, GhostCta } from '../ugc/shared.jsx'
import CategoryTabs from './CategoryTabs.jsx'
import VideoCard from './VideoCard.jsx'
import VideoLightbox from './VideoLightbox.jsx'
import { tr } from '../../i18n/tr.js'

/* SECTION 2: the video library. A category selector, a grid of portrait cards and one shared lightbox player.

   DATA. `items` = the approved videos (selectOurWork(), src/content/portfolio.js). The component is pure with respect to them, so
   tests render it with sample data. Filtering is a plain in-memory filter: instant, no network.

   LAYOUT. Four cards per row on desktop (lg), three on tablet (md), two on phones; always 9:16, so thumbnails never shift the page.
   A category with no videos has no tab; All Work is always the first tab. Switching category swaps the grid with a short fade (none
   for reduced motion), keeps the scroll position, and resets to the first page.

   SCALE. Only `pageSize` cards are in the DOM at a time ("Show more" adds the next page), every thumbnail below the first row is
   lazy-loaded, and there is no <video> element until a card is opened (one player, in the lightbox). Hundreds of videos cost hundreds
   of small images, loaded as they scroll into view, and nothing else.

   ACCENT. The selected category's colour (--cat) tints the small controls: the load-more button and the keyboard focus ring. The page
   background and the cards never change colour wholesale. */

const PAGE = 12

function EmptyState() {
  // A language page with no approved videos in that language (the Spanish Showcase has its own creators and videos, never the English library): say so plainly.
  const localized = currentLocale() !== 'en'
  return (
    <Section id="library" label="library-heading" className="!py-10 md:!py-16">
      <h2 id="library-heading" className="sr-only">{tr('Video library')}</h2>
      <div className="mx-auto max-w-2xl rounded-3xl border border-hairline bg-surface-1/60 p-7 text-center md:p-10">
        <p className="font-display text-2xl font-bold tracking-display text-ink md:text-3xl">{localized ? tr('The Spanish-language showcase is being prepared.') : tr('New work is on its way.')}</p>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-muted">{localized ? tr('We are selecting Spanish-speaking creators and videos for this page. Meanwhile, tell us about your project.') : tr('Videos appear here as soon as they are approved for public display.')}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RoadmapCta location="our-work-empty" />
          <GhostCta href="/case-studies" onClick={() => trackEvent('our_work_case_studies_click', { location: 'empty' })}>{tr('Read the case studies')}</GhostCta>
        </div>
      </div>
    </Section>
  )
}

export default function PortfolioLibrary({ items: itemsProp, pageSize = PAGE }) {
  const locale = currentLocale()
  // A page in another language shows that language's videos first (only where the data confirms the spoken language); nothing is removed.
  const items = useMemo(() => prioritizeLanguage(itemsProp, locale), [itemsProp, locale])
  const languages = useMemo(() => buildFacets(items).language, [items])
  const [lang, setLang] = useState(null)
  const tabs = useMemo(() => availableCategories(items), [items])
  const counts = useMemo(() => Object.fromEntries(tabs.map((t) => [t.id, countIn(items, t.id)])), [items, tabs])
  const [catId, setCatId] = useState('all')
  const [limit, setLimit] = useState(pageSize)
  const [openId, setOpenId] = useState(null)
  const grid = useRef(null)
  const focusFrom = useRef(null)

  const active = tabs.find((t) => t.id === catId) ?? tabs[0]
  const filtered = useMemo(() => filterByCategory(items, active.id).filter((i) => matchesFilters(i, { language: lang })), [items, active.id, lang])
  const shown = filtered.slice(0, limit)
  const openIndex = openId ? filtered.findIndex((i) => i.id === openId) : -1
  const open = openIndex >= 0 ? filtered[openIndex] : null

  /* after "Show more", move keyboard focus to the first new card so it is not left behind */
  useEffect(() => {
    if (focusFrom.current === null) return
    grid.current?.querySelectorAll('li button')[focusFrom.current]?.focus({ preventScroll: false })
    focusFrom.current = null
  }, [limit])

  if (!items.length) return <EmptyState />

  const select = (id) => {
    if (id === active.id) return
    setCatId(id)
    setLimit(pageSize)
    trackEvent('our_work_filter', { category: id })
  }
  const openItem = (item) => {
    setOpenId(item.id)
    trackEvent('our_work_play', { id: item.id, industry: item.industry, type: item.type ?? 'unspecified' })
  }
  const go = (delta) => {
    const i = (openIndex + delta + filtered.length) % filtered.length
    setOpenId(filtered[i].id)
    setLimit((n) => Math.max(n, i + 1))
    trackEvent('our_work_play', { id: filtered[i].id, industry: filtered[i].industry, via: 'next-prev' })
  }
  const multiple = filtered.length > 1
  const label = active.id === 'all' ? '' : `${tr(active.label)} `

  return (
    <Section id="library" label="library-heading" className="!pt-3 !pb-14 md:!pt-5 md:!pb-20">
      <div style={{ '--cat': active.color }}>
        <h2 id="library-heading" className="sr-only">{tr('Video library')}</h2>
        <CategoryTabs tabs={tabs} activeId={active.id} counts={counts} onSelect={select} />
        {/* Language filter: appears only when the confirmed data holds two or more spoken languages (so it is absent while every confirmed video is in one language). */}
        {languages.length >= 2 && (
          <div role="group" aria-label={tr('Filter videos by spoken language')} className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{tr('Language')}</span>
            {[{ value: null, label: tr('All languages') }, ...languages].map((l) => (
              <button key={l.value ?? 'all'} type="button" aria-pressed={lang === l.value} onClick={() => { setLang(l.value); setLimit(pageSize) }} className={`min-h-[40px] rounded-full border px-4 text-[13px] font-semibold ${lang === l.value ? 'border-lime bg-lime text-canvas' : 'border-hairline text-ink-muted hover:text-ink'}`}>{l.label}</button>
            ))}
          </div>
        )}
        <p className="sr-only" aria-live="polite">{locale === 'en' ? `Showing ${filtered.length} ${label}${filtered.length === 1 ? 'video' : 'videos'}` : `${tr('Showing')} ${filtered.length} ${filtered.length === 1 ? tr('video') : tr('videos')}${label ? ` · ${label}` : ''}`}</p>

        {/* keyed by the category: the grid re-enters with a short fade whenever it changes */}
        <ul ref={grid} key={active.id} className="ow-fade mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:mt-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {shown.map((item, i) => (
            <li key={item.id}>
              <VideoCard item={item} priority={i < 4} onOpen={openItem} />
            </li>
          ))}
        </ul>

        {filtered.length > limit && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => { focusFrom.current = limit; setLimit((n) => n + pageSize) }}
              className="min-h-[48px] rounded-full border border-[var(--cat)] bg-surface-2 px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-[var(--cat)] hover:text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cat)] motion-reduce:transition-none"
            >{tr('Show more')}{' '}<span className="opacity-70">({filtered.length - limit} {tr('more')})</span>
            </button>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3 text-center md:mt-16">
          <p className="text-[15px] text-ink-muted">{tr('Want creative like this for your brand?')}</p>
          <RoadmapCta location="our-work" />
        </div>
      </div>

      {open && (
        <VideoLightbox
          item={open}
          color={active.color}
          onClose={() => setOpenId(null)}
          onPrev={multiple ? () => go(-1) : undefined}
          onNext={multiple ? () => go(1) : undefined}
        />
      )}
    </Section>
  )
}
