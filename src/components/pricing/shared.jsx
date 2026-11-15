/* Small building blocks shared by the pricing-page sections. Same visual vocabulary as the rest of /pricing:
   hairline borders, surface-1 cards, lime accents, Inter display headings. */

export function SectionHeader({ eyebrow, title, intro, id }) {
  return (
    <div className="mx-auto max-w-3xl text-center mb-8 md:mb-12">
      {eyebrow && (
        <div className="inline-flex items-center gap-2.5 mb-4">
          <span className="h-px w-6 bg-lime" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{eyebrow}</span>
          <span className="h-px w-6 bg-lime" aria-hidden="true" />
        </div>
      )}
      <h2
        id={id}
        className="font-display font-bold text-ink tracking-display leading-[1.08] text-2xl md:text-[34px]"
      >
        {title}
      </h2>
      {intro && <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed">{intro}</p>}
    </div>
  )
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-[22px] md:rounded-[26px] border border-hairline bg-surface-1/60 backdrop-blur-md p-5 md:p-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, as: Tag = 'h3' }) {
  return <Tag className="font-display font-semibold text-ink tracking-snug text-base md:text-lg leading-snug">{children}</Tag>
}

export function CardLabel({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime mb-2">{children}</p>
}

export function Check({ className = 'text-lime' }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-1 h-3.5 w-3.5 shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Cross({ className = 'text-coral' }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-1 h-3.5 w-3.5 shrink-0 ${className}`} fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export const ConceptAccents = ['#8b5cf6', '#ff6a4d', '#d5ff40', '#ec4899', '#ffb547']

export const Small = ({ children, className = '' }) => (
  <p className={`text-[13px] text-ink-muted leading-relaxed ${className}`}>{children}</p>
)
