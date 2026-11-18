import { useState } from 'react'
import { SPRINT, SPRINT_PLUS, packageEquation } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'

/* The compact, interactive "why structured testing works" illustration. Four steps, each a button that is also its own caption (so
   every explanation is in the page text): distinct concepts, two finished versions of each, one thing changed between versions
   (hook or call to action), and what the performance data tells you to make next. The bars at step 4 are an ILLUSTRATION of how a
   winner emerges. They are labelled as such and are not results from any client. Totals come from the package data. */

const STEPS = [
  { title: 'Distinct concepts', text: 'Each concept is a different advertising angle, not the same idea re-shot.' },
  { title: 'Two finished versions', text: 'Every concept comes in two finished ad versions, included in the package total.' },
  { title: 'One thing changed', text: 'The versions differ in a single element you want to test: the hook or the call to action.' },
  { title: 'Learn, then make more', text: 'Your performance data shows which angle and which version wins, and shapes the next batch of concepts.' },
]

/* Illustrative bar heights (percent) for versions A and B of each concept; one clear winner. */
const BARS = [[38, 52], [30, 24], [82, 58], [44, 36], [27, 41]]
const WINNER = { concept: 2, version: 0 }

export default function TestingDiagram() {
  const [step, setStep] = useState(0)
  const [test, setTest] = useState('hook')
  const concepts = Array.from({ length: SPRINT.concepts }, (_, i) => i)
  const label = test === 'hook' ? 'Hook' : 'CTA'

  return (
    <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 md:p-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Structured creative testing</p>
          <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug tracking-snug text-ink md:text-2xl">
            Not a pile of videos. A batch built to teach you something.
          </h3>
        </div>
        <p className="text-sm text-ink-muted">
          {packageEquation(SPRINT)}. {SPRINT_PLUS.name}: {packageEquation(SPRINT_PLUS)}.
        </p>
      </div>

      {/* the diagram */}
      <div aria-hidden="true" className="mt-5 rounded-2xl border border-hairline bg-canvas/50 p-3 sm:p-5">
        <ul className="grid grid-cols-5 gap-2 sm:gap-3">
          {concepts.map((i) => {
            const color = ConceptAccents[i % ConceptAccents.length]
            return (
              <li key={i} className="flex flex-col items-center">
                <div className="w-full rounded-xl border bg-surface-1 px-1 py-2 text-center" style={{ borderColor: `${color}66` }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] sm:text-xs" style={{ color }}>C{i + 1}</span>
                </div>
                <div className="mt-2 flex w-full flex-col gap-1.5">
                  {[0, 1].map((v) => {
                    const shown = step >= 1
                    const win = step >= 3 && i === WINNER.concept && v === WINNER.version
                    return (
                      <div
                        key={v}
                        className={`flex items-center justify-center rounded-lg border px-1 py-1.5 text-[10px] font-semibold transition-all duration-500 motion-reduce:transition-none sm:text-xs ${shown ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'} ${win ? 'border-lime bg-lime/15 text-lime' : 'border-hairline bg-white/[0.05] text-ink-muted'}`}
                        style={{ transitionDelay: shown ? `${i * 60 + v * 90}ms` : '0ms' }}
                      >
                        {step >= 2 ? `${label} ${v === 0 ? 'A' : 'B'}` : `V${v + 1}`}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 flex h-20 w-full items-end justify-center gap-1.5 sm:h-24">
                  {[0, 1].map((v) => {
                    const win = i === WINNER.concept && v === WINNER.version
                    return (
                      <span
                        key={v}
                        className={`block w-3 rounded-t-md transition-[height,opacity] duration-700 motion-reduce:transition-none sm:w-4 ${win ? 'bg-lime' : 'bg-white/25'}`}
                        style={{ height: step >= 3 ? `${BARS[i][v]}%` : '4%', opacity: step >= 3 ? 1 : 0.25 }}
                      />
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ul>
        <p className={`mt-3 text-center text-xs font-medium transition-opacity duration-500 motion-reduce:transition-none ${step >= 3 ? 'text-lime opacity-100' : 'opacity-0'}`}>
          Winner found → informs the next batch of concepts
        </p>
      </div>

      {/* hook / call-to-action switch, relevant from step 3 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-muted">What are the two versions testing?</span>
        <div role="group" aria-label="What the versions test" className="flex gap-1.5">
          {[['hook', 'Hook'], ['cta', 'Call to action']].map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={test === k}
              onClick={() => { setTest(k); setStep((s) => Math.max(s, 2)) }}
              className={`min-h-[40px] rounded-full px-4 py-2 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${test === k ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-2 text-ink-muted hover:text-ink'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* the four steps: buttons that double as captions */}
      <ol className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const on = i === step
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-pressed={on}
                className={`h-full w-full rounded-2xl border p-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime motion-reduce:transition-none ${on ? 'border-lime/50 bg-lime/[0.06]' : 'border-hairline bg-surface-2/50 hover:border-hairline-strong'}`}
              >
                <span className="flex items-baseline gap-2">
                  <span className={`font-display text-sm font-bold tabular-nums ${on ? 'text-lime' : 'text-ink-muted'}`}>{i + 1}</span>
                  <span className="font-display text-base font-semibold leading-snug text-ink">{s.title}</span>
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-ink-muted">{s.text}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-[13px] text-ink-muted">
        Illustration only, not real results. We can&rsquo;t guarantee performance, which depends on your offer, audience and budget.
      </p>
    </div>
  )
}
