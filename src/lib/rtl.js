/* Right-to-left helpers for interactive components (Arabic site). The CSS side of RTL is automatic (the left/right utilities are mirrored at build time, scripts/postcss-rtl-flip.js); this file is
   for the behaviour CSS cannot express: horizontal scroll offsets, arrow keys and swipe direction. All functions are no-ops for left-to-right pages (English and Spanish behave exactly as before). */
import { currentLocale } from '../i18n/locale.js'
import { dirOf } from '../i18n/locales.js'

/* Is the page being rendered right-to-left? Read from the URL (same source as the rest of the i18n layer), so server render and hydration agree. */
export const isRtlPage = () => dirOf(currentLocale()) === 'rtl'

/* +1 = "go to the next item", -1 = "previous", 0 = not a horizontal arrow. The arrow that means "next" follows the visual direction: ArrowRight in English, ArrowLeft in Arabic. */
export const stepOfArrow = (key, rtl = isRtlPage()) => (key === 'ArrowRight' ? (rtl ? -1 : 1) : key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0)

/* Swipe: a finger/mouse moving by dx pixels. Moving toward the START of the reading direction reveals the NEXT item: left in English (dx < 0), right in Arabic (dx > 0). */
export const stepOfSwipe = (dx, rtl = isRtlPage()) => ((rtl ? dx > 0 : dx < 0) ? 1 : -1)

/* Scroll position measured from the start edge (0 = start) in either direction. Browsers report scrollLeft as 0 → negative in RTL containers. */
export const scrollOffset = (el) => Math.abs(el.scrollLeft)
/* scrollBy() toward the end of the content by `delta` pixels (negative = toward the start), whatever the direction. */
export const scrollAlong = (el, delta, behavior) => el.scrollBy({ left: isRtlPage() ? -delta : delta, behavior })

/* The "go on" arrow glyph: → in English and Spanish, ← in Arabic (the reading direction). Used for text arrows that are not SVG icons. */
export const forward = () => (isRtlPage() ? '←' : '→')
