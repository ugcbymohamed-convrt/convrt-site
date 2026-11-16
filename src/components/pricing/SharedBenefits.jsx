import { SHARED_SPRINT_BENEFITS, SHARED_SPRINT_NOTE } from '../../seo/businessKnowledge.js'

/* One compact strip of what every standard Sprint includes, so the three cards do not repeat it. */
const ICONS = {
  research: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
  approval: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 14l2 2 4-4" /></>,
  creators: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6" /></>,
  production: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10.5l4-2.5v8l-4-2.5" /></>,
  extras: <><path d="M4 7h16M4 12h10M4 17h13" /></>,
  reframing: <><rect x="3" y="5" width="11" height="11" rx="1.5" /><rect x="10" y="9" width="11" height="11" rx="1.5" /></>,
  testing: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
}

export default function SharedBenefits() {
  return (
    <div className="mt-10 md:mt-14 rounded-[26px] border border-hairline bg-surface-1/50 px-5 py-7 md:px-8 md:py-9">
      <h3 className="text-center font-display text-xl font-bold leading-tight tracking-display text-ink md:text-2xl">
        Every Sprint includes <span className="text-lime">full creative production.</span>
      </h3>
      <ul className="mt-6 md:mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHARED_SPRINT_BENEFITS.map((b) => (
          <li key={b.id} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline-strong bg-surface-2 text-lime">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[b.id]}
              </svg>
            </span>
            <span className="text-[14px] leading-snug text-ink">{b.label}</span>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-6 max-w-2xl text-center text-[12.5px] leading-relaxed text-ink-muted">{SHARED_SPRINT_NOTE}</p>
    </div>
  )
}
