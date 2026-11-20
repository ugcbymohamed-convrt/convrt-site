/* Small building blocks shared by the explanatory scenes on the service pages (Spokesperson, Organic Social): a skeleton line, a coloured tag, a numbered
   label, an icon frame and the site's accent colours. Pure presentation, no content: each page's scenes decide what they show. */

export const LIME = '#d5ff40'
export const VIOLET = '#8b5cf6'
export const CORAL = '#ff6a4d'
export const PINK = '#ec4899'

export const Skel = ({ w = 'w-full', className = '' }) => <span className={`block h-1.5 rounded-full bg-white/15 ${w} ${className}`} />
export const Tag = ({ children, color = LIME, className = '' }) => (
  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${className}`} style={{ background: color, color: '#0a0a0b' }}>{children}</span>
)
export const Label = ({ n, children }) => (
  <p className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[9px] font-bold text-canvas">{n}</span>{children}
  </p>
)
export const Icon = ({ children, className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
