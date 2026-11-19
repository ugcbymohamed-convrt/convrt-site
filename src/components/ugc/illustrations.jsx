/* Shared pieces for the explanatory illustrations on /ugc-video-agency (How it works, creative testing).

   The creators drawn here are STYLISED ILLUSTRATIONS (flat vector busts), not photos, not AI-generated people and not real
   creators: they only stand in for "a creator on screen" so each step is understood at a glance. Every scene that uses them is
   aria-hidden, and the section says in words that it is an illustration. Colours are the site's own accents. */

const SKIN = ['#f1c8a5', '#c98f68', '#8e5b3d', '#e6b693']
const HAIR = ['#2a1a13', '#17171b', '#5a3319', '#d4a03c']
const SHIRT = ['#8b5cf6', '#ff6a4d', '#d5ff40', '#ec4899']

/* A head-and-shoulders bust that fills its box (anchored to the bottom). variant 0-3 changes hair, skin and shirt. */
export function Avatar({ variant = 0, className = '' }) {
  const v = ((variant % 4) + 4) % 4
  const skin = SKIN[v]
  const hair = HAIR[v]
  return (
    <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true" focusable="false">
      {v === 1 && <path d="M27 64C22 34 40 24 52 25c16 1 26 14 22 46l1 30c-7-3-9-20-9-34-5-8-26-9-33-1 0 14-1 31-8 34z" fill={hair} />}
      <path d="M5 130c0-27 22-37 45-37s45 10 45 37z" fill={SHIRT[v]} />
      <path d="M41 80h18v18c-3 5-15 5-18 0z" fill="#000" opacity="0.18" />
      <rect x="42" y="78" width="16" height="20" rx="7" fill={skin} />
      <ellipse cx="50" cy="62" rx="19" ry="22" fill={skin} />
      {v === 0 && <path d="M30 61C27 37 43 27 52 28c15 1 22 13 19 31-4-9-12-13-21-13s-16 5-20 15z" fill={hair} />}
      {v === 2 && (
        <g fill={hair}>
          <circle cx="35" cy="45" r="11" /><circle cx="50" cy="38" r="12" /><circle cx="65" cy="45" r="11" /><circle cx="31" cy="58" r="7" /><circle cx="69" cy="58" r="7" />
        </g>
      )}
      {v === 3 && (
        <g fill={hair}>
          <circle cx="50" cy="26" r="9" />
          <path d="M30 60C28 38 40 31 50 31s22 7 20 29c-4-9-11-13-20-13s-16 4-20 13z" />
        </g>
      )}
      {v === 1 && <path d="M32 58c3-11 11-16 19-16s16 5 19 16c-6-5-12-7-19-7s-13 2-19 7z" fill={hair} />}
      <circle cx="43" cy="64" r="1.7" fill="#1b1b1f" />
      <circle cx="57" cy="64" r="1.7" fill="#1b1b1f" />
      <path d="M44 72q6 5 12 0" fill="none" stroke="#1b1b1f" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* A tiny vertical "video": tinted screen, an illustrated creator, an optional caption bar and a corner badge. */
export function MiniPhone({ variant = 0, tone = '#8b5cf6', caption, captionBg, captionColor = '#0a0a0b', badge, dim = false, ring = false, className = '', children }) {
  return (
    <div
      className={`relative aspect-[9/16] overflow-hidden rounded-[0.8rem] border border-white/15 ${ring ? 'ugc-ring' : ''} ${className}`}
      style={{ background: `linear-gradient(180deg, ${tone}66 0%, #121216 82%)`, boxShadow: `0 0 26px -12px ${tone}`, opacity: dim ? 0.42 : 1 }}
    >
      <Avatar variant={variant} className="absolute inset-x-0 bottom-0 h-[80%] w-full" />
      {caption && (
        <span className="absolute inset-x-[9%] top-[11%] rounded-md px-1 py-[3px] text-center text-[10px] font-bold leading-tight" style={{ background: captionBg, color: captionColor }}>
          {caption}
        </span>
      )}
      {badge && (
        <span className="absolute left-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-black/55 px-1 text-[9px] font-bold text-ink">{badge}</span>
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
  <svg viewBox="0 0 24 12" className={`shrink-0 ${className}`} fill="none" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export const ArrowDown = ({ className = 'h-6 w-3 text-ink-muted' }) => (
  <svg viewBox="0 0 12 24" className={`shrink-0 ${className}`} fill="none" aria-hidden="true"><path d="M6 1v20M1 16l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export const delay = (ms) => ({ animationDelay: `${ms}ms` })
