import { useCallback, useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { CREATOR_SHOWCASE_PATH } from '../../config.js'
import { posterUrl, captionOf, typeLabel } from '../../content/portfolio.js'
import { usePreviewHost } from '../../lib/previewHost.js'
import SectionDivider from '../SectionDivider.jsx'
import { Section, Head, Reveal, GhostCta } from './shared.jsx'
import { PlayGlyph } from './creatorVideo.jsx'
import { tr, hrefFor } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeConfig } from '../../i18n/content.js'
import { Player } from './UgcWork.jsx'
import { PORTRAITS } from './illustrations.jsx'

/* SECTION: a horizontal gallery of real UGC examples, shown before "Results & client feedback".

   DATA. The approved portfolio videos (selectDisplayable, src/content/portfolio.js), at most TOTAL (10). Adding a video there is the
   only step needed: this section, the hero stage and the Creator Showcase page (/our-work) all read the same list. With none, the section is
   absent on the live site (no placeholder, no stock footage). On Vercel preview hosts only (usePreviewHost) it shows ten stand-in
   cards so the layout can be reviewed; those never reach the production domain.

   BROWSING. Four cards fill the row on a laptop (three on a tablet, one and a half on a phone). It is a native horizontal scroller:
   a two-finger trackpad swipe, a touch swipe, the keyboard arrows and shift + wheel all work; mouse users can also drag it or use the
   arrow buttons; a lime progress bar shows where you are. Scroll-snap keeps cards aligned. Vertical page scrolling is never hijacked.

   PLAYBACK. Poster first. A video element (and its stream) exists only after a tap, one at a time, with sound; it pauses when it scrolls
   out of view (Player, shared with the portfolio grid). */

const TOTAL = 10

/* CONFIGURATION-DRIVEN. UGC_GALLERY is this page's content and the default. /spokesperson-video-production passes its own: heading, badge, button, analytics
   prefix and (importantly) NO stand-in portraits, so its preview-host layout cards are neutral empty frames, never creator imagery.
     id, headingId, eyebrow, title, intro   the section and its heading
     ariaLabel, badge                       the scroller's accessible name and the pill on each card ("UGC", "Spokesperson")
     cta                                    { label, href } the button under the gallery
     track                                  analytics prefix
     samplePortraits                        portraits for the preview-only stand-in cards, or null for neutral empty frames
     filter                                 optional content-style filter { ariaLabel, allLabel, field, options: [{ id, label }] }. A chip appears only for an option that at least
                                            one APPROVED video carries in `field`, and the row only when two or more options are present (a single style needs no filter). On preview
                                            hosts the empty frames carry every option so the filter can be reviewed. Without `filter` the section is exactly as before. */
export const UGC_GALLERY = {
  id: 'ugc-videos',
  headingId: 'ugc-videos-heading',
  eyebrow: 'How your videos could look',
  title: 'Creator-led ads, made for paid social.',
  intro: 'Real creators, made to stop the scroll. Watch the work.',
  ariaLabel: 'UGC video examples. Scroll sideways to see more.',
  badge: 'UGC',
  cta: { label: 'Explore UGC Videos', href: CREATOR_SHOWCASE_PATH },
  track: 'ugc',
  samplePortraits: PORTRAITS,
  sampleNote: 'Layout preview only: your ten approved videos replace these cards. This never shows on the live site.',
}

function Card({ item, index, playing, onPlay, config }) {
  const sample = item.sample
  // Spanish pages name the language in full ("UGC · Español"); English keeps the two-letter code.
  const badge = config.badgeByType && item.type ? typeLabel(item) : config.badge // a mixed gallery (Spanish homepage) names each video's own type
  // Another language's site names no language on its cards: every video there is in that language, so "UGC · Español" repeated on each card says nothing (Spanish review 3, Nov 2026). The language stays in the records and the Showcase filters.
  const langs = sample ? 'EN' : currentLocale() === 'en' ? (item.languages ?? []).map((l) => l.toUpperCase()).join(' · ') : ''
  return (
    <figure className="group relative aspect-[9/16] overflow-hidden rounded-3xl border border-lime/25 bg-surface-1 shadow-[0_26px_60px_-30px_rgba(0,0,0,0.9),0_0_44px_-26px_rgba(213,255,64,0.5)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-lime/60 hover:shadow-[0_30px_64px_-28px_rgba(0,0,0,0.9),0_0_56px_-18px_rgba(213,255,64,0.55)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {playing ? (
        <Player item={item} />
      ) : (
        <button
          type="button"
          onClick={sample ? undefined : onPlay}
          aria-label={sample ? `Sample card ${index + 1}` : `${tr('Play video:')} ${captionOf(item)}`}
          disabled={sample}
          className="absolute inset-0 cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime disabled:cursor-default"
        >
          {sample && !item.portrait ? (
            <span aria-hidden="true" className="block h-full w-full" style={{ background: 'radial-gradient(120% 70% at 50% 0%, rgba(213,255,64,0.16), transparent 60%), linear-gradient(180deg, #17171b, #0c0c0f)' }} />
          ) : (
            <img
              src={sample ? item.portrait : posterUrl(item)}
              alt=""
              width="405"
              height="720"
              loading="lazy"
              decoding="async"
              draggable="false"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
              style={sample ? { objectPosition: '50% 28%' } : undefined}
            />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35" />
          {/* Spanish: a generic "UGC" pill on every card of a single-type gallery adds nothing, so it is left out (the mixed homepage gallery still names each video's own type) */}
          {!(currentLocale() === 'es' && !config.badgeByType) && (
          <span aria-hidden="true" className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-lime/40 bg-black/55 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] text-lime backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />{langs ? `${badge} · ${langs}` : badge}
          </span>
          )}
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-lime/60 bg-lime/20 text-ink backdrop-blur transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none">
            <PlayGlyph />
          </span>
        </button>
      )}
    </figure>
  )
}

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden="true"><path d={dir < 0 ? 'M8 2L4 6l4 4' : 'M4 2l4 4-4 4'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function UgcGallery({ items, config: configProp = UGC_GALLERY }) {
  const config = localizeConfig(configProp, currentLocale())
  const preview = usePreviewHost()
  const real = items.slice(0, TOTAL)
  // Stand-in cards are an English-preview layout aid only: a translated page with no genuine video shows no gallery at all (no empty frames, no placeholders), even on a Preview.
  const sample = real.length === 0 && preview && currentLocale() === 'en'
  const fcfg = config.filter
  const cards = real.length ? real : sample ? Array.from({ length: TOTAL }, (_, i) => ({ id: `sample-${i}`, sample: true, portrait: config.samplePortraits ? config.samplePortraits[i % config.samplePortraits.length] : undefined, ...(fcfg ? { [fcfg.field]: fcfg.options[i % fcfg.options.length].id } : {}) })) : []
  const [chip, setChip] = useState('all')
  const chips = fcfg ? fcfg.options.filter((o) => cards.some((c) => c[fcfg.field] === o.id)) : []
  const showChips = chips.length >= 2
  const shown = showChips && chip !== 'all' ? cards.filter((c) => c[fcfg.field] === chip) : cards

  const scroller = useRef(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const [activeId, setActiveId] = useState(null)
  const [bar, setBar] = useState({ thumb: 100, left: 0, prev: false, next: false })
  const [dragging, setDragging] = useState(false)

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const thumb = Math.min(100, (el.clientWidth / el.scrollWidth) * 100)
    setBar({ thumb, left: max > 0 ? (el.scrollLeft / max) * (100 - thumb) : 0, prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4 })
  }, [])
  useEffect(() => {
    const el = scroller.current
    if (!el) return undefined
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure) }
    measure()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [measure, shown.length])

  const pick = (id) => {
    setChip(id)
    setActiveId(null)
    if (scroller.current) scroller.current.scrollLeft = 0
    trackEvent(`${config.track}_gallery_filter`, { style: id })
  }
  const by = (dir) => {
    const el = scroller.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
    trackEvent(`${config.track}_gallery_scroll`, { how: 'button' })
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); by(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); by(-1) }
  }
  /* mouse drag (touch and trackpad scroll natively) */
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { down: true, x: e.clientX, left: scroller.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.down) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; setDragging(true) }
    if (d.moved) scroller.current.scrollLeft = d.left - dx
  }
  const end = () => {
    if (drag.current.down && drag.current.moved) trackEvent(`${config.track}_gallery_scroll`, { how: 'drag' })
    drag.current.down = false
    setDragging(false)
  }

  if (!cards.length) return null
  return (
    <>
    <SectionDivider />
    <Section id={config.id} label={config.headingId} glow>
      <Reveal>
        <Head id={config.headingId} eyebrow={config.eyebrow} title={config.title} intro={config.intro} />
      </Reveal>

      <Reveal className="mt-8 md:mt-10">
        {sample && <p className="mb-3 text-center text-xs font-medium text-ink-muted">{config.sampleNote}</p>}
        {showChips && (
          <div role="group" aria-label={fcfg.ariaLabel} className="mb-5 flex flex-wrap items-center justify-center gap-2">
            {[{ id: 'all', label: fcfg.allLabel }, ...chips].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o.id)}
                aria-pressed={chip === o.id}
                className={`min-h-[44px] rounded-full px-4 py-2 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${chip === o.id ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-2 text-ink-muted hover:text-ink'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <div
            ref={scroller}
            role="region"
            aria-label={config.ariaLabel}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={end}
            onPointerLeave={end}
            onPointerCancel={end}
            onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false } }}
            className={`-mx-5 overflow-x-auto overscroll-x-contain px-5 pb-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${dragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab snap-x snap-mandatory'}`}
          >
            <ul className="flex gap-4">
              {shown.map((item, i) => (
                <li key={item.id} className="w-[66%] shrink-0 snap-start sm:w-[42%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]">
                  <Card
                    item={item}
                    index={i}
                    playing={activeId === item.id}
                    config={config}
                    onPlay={() => { setActiveId(item.id); trackEvent(`${config.track}_gallery_play`, { language: item.languages?.join(','), industry: item.industry }) }}
                  />
                </li>
              ))}
            </ul>
          </div>
          {/* edge fades hint that there is more to the side */}
          <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-canvas to-transparent transition-opacity duration-300 md:block ${bar.prev ? 'opacity-100' : 'opacity-0'}`} />
          <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300 md:block ${bar.next ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div aria-hidden="true" className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <span className="absolute inset-y-0 rounded-full bg-lime transition-[left] duration-150 motion-reduce:transition-none" style={{ width: `${bar.thumb}%`, left: `${bar.left}%` }} />
          </div>
          <div className="flex items-center gap-2">
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => by(dir)}
                disabled={dir < 0 ? !bar.prev : !bar.next}
                aria-label={dir < 0 ? tr('Scroll videos left') : tr('Scroll videos right')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-lime/40 bg-surface-2 text-lime transition-colors hover:bg-lime hover:text-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime disabled:cursor-default disabled:border-hairline disabled:text-ink-muted disabled:hover:bg-surface-2 disabled:hover:text-ink-muted"
              >
                <Chevron dir={dir} />
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-9 flex justify-center">
        <GhostCta href={config.cta.href} onClick={() => trackEvent(`${config.track}_see_all_videos_click`, { location: 'gallery' })}>
          {`${config.cta.label} `}<span aria-hidden="true">→</span>
        </GhostCta>
      </div>
    </Section>
    </>
  )
}
