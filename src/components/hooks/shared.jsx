/* Shared bits for the /free-hooks page. Reveal / Eyebrow / SectionHeader / Check
   come from the roadmap page's shared module so both lead pages stay visually
   identical; only the CTA button is specific to this page. */

export { Reveal, Eyebrow, SectionHeader, Check } from '../roadmap/shared.jsx'

export const primaryBtnClass =
  'cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ' +
  'disabled:cursor-not-allowed disabled:opacity-70'

/* Primary lime CTA that scrolls to the industry selector. */
export function SelectorButton({ onClick, className = '', children }) {
  return (
    <a
      href="#industry"
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`${primaryBtnClass} ${className}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">↓</span>
    </a>
  )
}
