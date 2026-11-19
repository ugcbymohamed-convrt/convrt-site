import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORY_ICONS, Chevron } from './icons.jsx'

/* The horizontal category selector: All Work + one pill per category that has videos (the caller passes only those).

   • ONE row on every screen (no wrapping). It is a native horizontal scroller, so a touch swipe and a two-finger trackpad swipe work
     with no library; previous/next buttons and edge fades appear on desktop only when the row actually overflows.
   • The active pill is scrolled into view (horizontally only, the page never moves) whenever it changes.
   • Buttons with aria-pressed inside a labelled group: the selection filters the grid below, it does not swap tab panels.
   • Each pill carries its category colour: the icon in the colour when idle, a solid colour fill when active. Colour is never the only
     signal (the label, the icon and aria-pressed say it too). */

export default function CategoryTabs({ tabs, activeId, counts, onSelect }) {
  const scroller = useRef(null)
  const [edge, setEdge] = useState({ prev: false, next: false })

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdge({ prev: el.scrollLeft > 4, next: el.scrollLeft < max - 4 })
  }, [])

  useEffect(() => {
    const el = scroller.current
    if (!el) return undefined
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure) }
    measure()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    // Re-measure when the row or a pill changes size (webfont and stylesheet arrival, a count changing), not only on window resize.
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(on)
    if (ro) { ro.observe(el); [...el.children].forEach((c) => ro.observe(c)) }
    return () => { el.removeEventListener('scroll', on); window.removeEventListener('resize', on); ro?.disconnect(); cancelAnimationFrame(raf) }
  }, [measure, tabs.length])

  /* keep the active pill in view: scroll the row itself, never the page */
  useEffect(() => {
    const el = scroller.current
    const btn = el?.querySelector('[aria-pressed="true"]')
    if (!el || !btn) return
    const target = btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' })
  }, [activeId])

  const by = (dir) => {
    const el = scroller.current
    if (!el) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        role="group"
        aria-label="Filter videos by industry"
        className="relative -mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto overscroll-x-contain px-5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:scroll-px-0 md:px-0"
      >
        {tabs.map((t) => {
          const Icon = CATEGORY_ICONS[t.id]
          const active = t.id === activeId
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(t.id)}
              style={{ '--c': t.color }}
              className={`group inline-flex min-h-[46px] shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[14px] font-semibold transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c)] motion-reduce:transition-none md:px-5 md:text-[15px] ${
                active
                  ? 'border-[var(--c)] bg-[var(--c)] text-canvas shadow-[0_8px_26px_-12px_var(--c)]'
                  : 'border-hairline-strong bg-surface-1 text-ink-muted hover:border-[var(--c)] hover:text-ink'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors duration-300 motion-reduce:transition-none ${active ? 'text-canvas' : 'text-[var(--c)]'}`} />
              {t.label}
              <span className={`text-[12px] font-bold tabular-nums ${active ? 'text-canvas/70' : 'text-ink-subtle'}`}>{counts[t.id]}</span>
            </button>
          )
        })}
      </div>
      {/* edge fades + arrows: desktop only, and only when the row overflows */}
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-canvas to-transparent transition-opacity duration-300 md:block ${edge.prev ? 'opacity-100' : 'opacity-0'}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300 md:block ${edge.next ? 'opacity-100' : 'opacity-0'}`} />
      {[-1, 1].map((dir) => {
        const show = dir < 0 ? edge.prev : edge.next
        return (
          <button
            key={dir}
            type="button"
            tabIndex={show ? 0 : -1}
            aria-hidden={!show}
            aria-label={dir < 0 ? 'Show previous categories' : 'Show next categories'}
            onClick={() => by(dir)}
            className={`absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-hairline-strong bg-surface-2 text-ink transition-opacity duration-300 hover:border-ink-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime md:flex ${dir < 0 ? 'left-0' : 'right-0'} ${show ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <Chevron dir={dir} />
          </button>
        )
      })}
    </div>
  )
}
