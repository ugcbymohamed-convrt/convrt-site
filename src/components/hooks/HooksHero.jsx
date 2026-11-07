import HooksSignupCard from './HooksSignupCard.jsx'
import { softGlow } from '../../lib/glow.js'

/* SECTION 1 — headline + copy on the left, the signup card on the right.
   DOM order is headline → card → benefits, so on mobile the form follows the
   intro copy directly; on desktop the benefits sit under the headline in the
   left column and the card spans both rows on the right. */

const BENEFITS = [
  { icon: IconMic, label: 'A verbal hook', detail: 'what to say' },
  { icon: IconEye, label: 'A visual hook', detail: 'what to show' },
  { icon: IconText, label: 'A text hook', detail: 'what to put on screen' },
]

export default function HooksHero() {
  return (
    <section aria-labelledby="hooks-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[480px] left-1/2 h-[1200px] w-[1740px] -translate-x-1/2 soft-glow" style={{ background: softGlow('#d5ff40', 0.1, 1100, 560, 160) }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-14 md:px-8 md:pt-12 md:pb-20">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-2 lg:items-center">
          {/* Headline + copy */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted sm:text-xs sm:tracking-[0.18em]">
                Free Hooks Library
              </span>
            </div>

            <h1
              id="hooks-h1"
              className="mt-5 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.4rem] min-[400px]:text-[2.9rem] sm:text-[3.4rem] lg:text-[3.3rem] xl:text-[4rem]"
            >
              <span className="block">10 Ad Hooks</span>
              <span className="block">Worth Testing.</span>
              <span className="block text-lime">Free.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Stop staring at a blank script. Get 10 ready-to-adapt advertising hooks designed to capture attention,
              spark curiosity, and give your next video ads a stronger start.
            </p>
          </div>

          {/* Signup card */}
          <div id="signup" className="min-w-0 scroll-mt-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <HooksSignupCard />
          </div>

          {/* Benefits */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">Every hook includes</p>
            <ul className="mt-3 space-y-2.5">
              {BENEFITS.map(({ icon: Icon, label, detail }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-lime/25 bg-lime/10 text-lime">
                    <Icon />
                  </span>
                  <span className="text-[15px] leading-snug text-ink-muted">
                    <span className="font-semibold text-ink">{label}</span> — {detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

const iconProps = { viewBox: '0 0 24 24', className: 'h-4 w-4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

function IconMic() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}
function IconEye() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconText() {
  return (
    <svg {...iconProps}>
      <path d="M5 7V5h14v2M12 5v14M9 19h6" />
    </svg>
  )
}
