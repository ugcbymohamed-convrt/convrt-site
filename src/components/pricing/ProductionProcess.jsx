import { PRODUCTION_STAGES } from '../../seo/businessKnowledge.js'
import { SectionHeader } from './shared.jsx'

/* Four stages (Strategy, Preparation, Production, Delivery). Each covers part of the eight-step process kept in
   businessKnowledge.js, so the meaning of every original step is preserved without repeating its description. */
const ICONS = {
  strategy: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
  preparation: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 14l2 2 4-4" /></>,
  production: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10.5l4-2.5v8l-4-2.5" /></>,
  delivery: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
}

export default function ProductionProcess() {
  return (
    <section aria-labelledby="process-heading" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader id="process-heading" title="From idea to ready-to-launch creative." />
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {PRODUCTION_STAGES.map((stage, i) => (
            <li key={stage.id} className="relative rounded-2xl border border-hairline bg-surface-1/50 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-surface-2 text-lime">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {ICONS[stage.id]}
                  </svg>
                </span>
                <span className="font-display text-sm font-bold tracking-[0.08em] text-lime">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">{stage.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{stage.description}</p>
              {i < PRODUCTION_STAGES.length - 1 && (
                <span aria-hidden="true" className="absolute -right-[10px] top-1/2 hidden h-px w-[8px] bg-hairline-strong lg:block" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
