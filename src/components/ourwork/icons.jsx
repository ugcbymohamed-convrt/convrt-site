/* Icons for the Creator Showcase: one per category tab, plus the player and gallery controls. Inline SVG (no icon library), 20px grid, currentColor. */

const base = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const CATEGORY_ICONS = {
  /* four tiles: the whole library */
  all: (p) => (
    <svg {...base} {...p}><rect x="3" y="3" width="5.5" height="5.5" rx="1.4" /><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.4" /><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.4" /><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.4" /></svg>
  ),
  /* shopping bag */
  ecommerce: (p) => (
    <svg {...base} {...p}><path d="M4.5 6.5h11l-.8 9.2a1.2 1.2 0 0 1-1.2 1.1H6.5a1.2 1.2 0 0 1-1.2-1.1L4.5 6.5z" /><path d="M7.5 8.5V5.8a2.5 2.5 0 0 1 5 0v2.7" /></svg>
  ),
  /* stacked layers: software */
  saas: (p) => (
    <svg {...base} {...p}><path d="M10 3.2l7 3.6-7 3.6-7-3.6 7-3.6z" /><path d="M3 10.2l7 3.6 7-3.6" /><path d="M3 13.6l7 3.6 7-3.6" /></svg>
  ),
  /* briefcase: services */
  services: (p) => (
    <svg {...base} {...p}><rect x="3" y="6.5" width="14" height="9.5" rx="2" /><path d="M7.5 6.5V5.3a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.2" /><path d="M3 10.8h14" /></svg>
  ),
  /* microphone: spokesperson videos (a type filter) */
  spokesperson: (p) => (
    <svg {...base} {...p}><rect x="7.5" y="2.8" width="5" height="9" rx="2.5" /><path d="M4.8 9.5a5.2 5.2 0 0 0 10.4 0M10 14.7v2.5M7.3 17.2h5.4" /></svg>
  ),
  /* phone: UGC videos (a type filter, Spanish page only) */
  ugc: (p) => (
    <svg {...base} {...p}><rect x="5.8" y="2.6" width="8.4" height="14.8" rx="2.2" /><path d="M8.8 14.6h2.4" /></svg>
  ),
  /* four-point sparkle: everything else */
  other: (p) => (
    <svg {...base} {...p}><path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6L10 3z" /><path d="M15.5 14.5v3M14 16h3" /></svg>
  ),
}

export const Chevron = ({ dir = 1, className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 12 12" className={className} fill="none" aria-hidden="true"><path d={dir < 0 ? 'M8 2L4 6l4 4' : 'M4 2l4 4-4 4'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export const CloseGlyph = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
)
