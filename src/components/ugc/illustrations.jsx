/* Shared pieces for the explanatory scenes on /ugc-video-agency (How it works, creative testing).

   The faces are the portrait photographs supplied by the owner (public/creators/portrait-1..5.webp). They stand in for "a creator on
   screen" so each step is understood at a glance; they are used WITHOUT names, handles or claims, every scene that shows them is
   aria-hidden, and the page says in words that the scenes are illustrative. Colours are the site's own accents. */

import { isRtlPage } from '../../lib/rtl.js'
export const PORTRAITS = [1, 2, 3, 4, 5].map((n) => `/creators/portrait-${n}.webp`)

/* A portrait that fills its box (object-fit: cover, framed on the face). variant 0-4 picks the person. */
export function Avatar({ variant = 0, className = '', pos = '50% 24%' }) {
  const v = ((variant % PORTRAITS.length) + PORTRAITS.length) % PORTRAITS.length
  return <img src={PORTRAITS[v]} alt="" width="600" height="750" loading="lazy" decoding="async" draggable="false" className={`object-cover ${className}`} style={{ objectPosition: pos }} />
}

/* A tiny vertical "video": a creator portrait, a soft tone wash, an optional caption bar and a corner badge. */
export function MiniPhone({ variant = 0, tone = '#8b5cf6', caption, captionBg, captionColor = '#0a0a0b', badge, dim = false, ring = false, className = '', children }) {
  return (
    <div
      className={`relative aspect-[9/16] overflow-hidden rounded-[0.8rem] border bg-surface-2 ${ring ? 'ugc-ring' : ''} ${className}`}
      style={{ borderColor: `${tone}aa`, boxShadow: `0 0 26px -12px ${tone}`, opacity: dim ? 0.42 : 1 }}
    >
      <Avatar variant={variant} className="absolute inset-0 h-full w-full" pos="50% 22%" />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 62%, ${tone}77 100%)` }} />
      {caption && (
        <span className="absolute inset-x-[9%] top-[11%] rounded-md px-1 py-[3px] text-center text-[10px] font-bold leading-tight" style={{ background: captionBg, color: captionColor }}>
          {caption}
        </span>
      )}
      {badge && (
        <span className="absolute left-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-black/60 px-1 text-[9px] font-bold text-ink">{badge}</span>
      )}
      <span className="absolute left-1/2 top-[3%] h-[3px] w-[28%] -translate-x-1/2 rounded-full bg-black/60" />
      {children}
    </div>
  )
}

export const CheckBadge = ({ className = '', size = 'h-6 w-6' }) => (
  <span className={`flex items-center justify-center rounded-full bg-lime text-canvas ${size} ${className}`}>
    <svg viewBox="0 0 16 16" className="h-[58%] w-[58%]" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
)

export const ArrowRight = ({ className = 'h-3 w-6 text-ink-muted' }) => (
  <svg viewBox="0 0 24 12" className={`shrink-0 ${className}`} style={isRtlPage() ? { transform: 'scaleX(-1)' } : undefined} fill="none" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export const ArrowDown = ({ className = 'h-6 w-3 text-ink-muted' }) => (
  <svg viewBox="0 0 12 24" className={`shrink-0 ${className}`} fill="none" aria-hidden="true"><path d="M6 1v20M1 16l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export const delay = (ms) => ({ animationDelay: `${ms}ms` })
