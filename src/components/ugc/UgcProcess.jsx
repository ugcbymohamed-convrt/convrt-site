import { PRODUCTION_PROCESS, PRODUCTION_STAGES, PRODUCT_REQUIREMENTS, TURNAROUND, SPRINT, SPRINT_PLUS } from '../../seo/businessKnowledge.js'
import { Section, Head, Reveal } from './shared.jsx'

/* SECTION 5: how it works. All eight published steps, grouped under the four published stages.
   The turnaround clock and product shipping/access are explained SEPARATELY (owner-confirmed): the clock starts the moment
   concepts and scripts are approved. No other exclusions, extensions or guarantees are added. */

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

      <div className="mt-10 grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-12 lg:gap-12">
        <ol className="space-y-8 lg:col-span-7">
          {PRODUCTION_STAGES.map((stage) => (
            <li key={stage.id} className="list-none">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{stage.title}</p>
                <ol className="mt-3 space-y-3 border-l border-hairline-strong pl-5">
                  {stage.steps.map((idx) => {
                    const step = PRODUCTION_PROCESS[idx]
                    return (
                      <li key={step.title} className="relative list-none rounded-2xl border border-hairline bg-surface-1/60 p-4 md:p-5">
                        <span aria-hidden="true" className="absolute -left-[27px] top-5 flex h-3 w-3 rounded-full border-2 border-lime bg-canvas" />
                        <h3 className="font-display text-base font-semibold leading-snug tracking-snug text-ink">
                          <span className="mr-2 tabular-nums text-ink-subtle">{String(idx + 1).padStart(2, '0')}</span>
                          {step.title}
                        </h3>
                        <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{step.description}</p>
                      </li>
                    )
                  })}
                </ol>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="space-y-5 lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Production clock</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                Production turnaround is{' '}
                <span className="font-semibold text-ink">{SPRINT.turnaroundBusinessDays} business days</span> for the {SPRINT.name} and{' '}
                <span className="font-semibold text-ink">{SPRINT_PLUS.turnaroundBusinessDays} business days</span> for {SPRINT_PLUS.name}.
                The clock starts {TURNAROUND.startsAt}. {TURNAROUND.note}
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl border border-hairline bg-surface-1/60 p-6 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Product shipping and access</p>
              <ul className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-muted">
                <li>{PRODUCT_REQUIREMENTS.physical}</li>
                <li>{PRODUCT_REQUIREMENTS.saas}</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
