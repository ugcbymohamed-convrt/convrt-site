import { PRODUCTION_PROCESS, PRODUCTION_STAGES, PRODUCT_REQUIREMENTS, TURNAROUND, SPRINT, SPRINT_PLUS } from '../../seo/businessKnowledge.js'
import { Section, Head, Reveal } from './shared.jsx'

/* SECTION 5: how it works. All eight published steps, grouped under the four published stages, as a 2 × 2 grid of stage cards
   (compact, and the stage is the heading: h3). The turnaround clock and product shipping/access are explained SEPARATELY
   (owner-confirmed): the clock starts the moment concepts and scripts are approved. No other exclusions, extensions or guarantees. */

export default function UgcProcess() {
  return (
    <Section id="how-it-works" label="ugc-process-heading">
      <Reveal>
        <Head
          id="ugc-process-heading"
          eyebrow="Process"
          title="From brief to finished ads."
          intro="Eight steps in four stages, and your approval before anything is filmed."
        />
      </Reveal>

      <ol className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
        {PRODUCTION_STAGES.map((stage, si) => (
          <li key={stage.id} className="list-none">
            <Reveal delay={(si % 2) * 80} className="h-full">
              <div className="h-full rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md">
                <h3 className="font-display text-lg font-semibold tracking-snug text-ink">
                  <span className="mr-2 text-sm font-bold tabular-nums text-lime">{String(si + 1).padStart(2, '0')}</span>
                  {stage.title}
                </h3>
                <ol className="mt-4 space-y-3.5">
                  {stage.steps.map((idx) => {
                    const step = PRODUCTION_PROCESS[idx]
                    return (
                      <li key={step.title} className="list-none border-l-2 border-lime/60 pl-4">
                        <p className="text-[15px] font-semibold leading-snug text-ink">{step.title}</p>
                        <p className="mt-0.5 text-[15px] leading-relaxed text-ink-muted">{step.description}</p>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-2 md:gap-5">
        <Reveal className="h-full">
          <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Production clock</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              Production turnaround is{' '}
              <span className="font-semibold text-ink">{SPRINT.turnaroundBusinessDays} business days</span> for the {SPRINT.name} and{' '}
              <span className="font-semibold text-ink">{SPRINT_PLUS.turnaroundBusinessDays} business days</span> for {SPRINT_PLUS.name}.
              The clock starts {TURNAROUND.startsAt}. {TURNAROUND.note}
            </p>
          </div>
        </Reveal>
        <Reveal delay={80} className="h-full">
          <div className="h-full rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Product shipping and access</h3>
            <ul className="mt-2 space-y-2.5 text-[15px] leading-relaxed text-ink-muted">
              <li>{PRODUCT_REQUIREMENTS.physical}</li>
              <li>{PRODUCT_REQUIREMENTS.saas}</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
