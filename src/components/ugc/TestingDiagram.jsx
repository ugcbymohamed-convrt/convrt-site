import { useEffect, useRef, useState } from 'react'
import { SPRINT, SPRINT_PLUS, packageEquation } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'

/* The creative-testing illustration, kept deliberately simple: ONE interaction (three steps), one short sentence per step.
     1  One concept, two versions     two large cards, "Version A" and "Version B", differing in one element (the hook)
     2  The pattern scales            five concepts × two versions = ten finished ad versions (Sprint Plus: ten concepts)
     3  Compare, learn, repeat        the versions are compared and what you learn shapes the next batch
   It steps through once by itself when it scrolls into view (never for reduced-motion visitors, with a Pause button) and the
   three step buttons always work. The comparison bars in step 3 are CONCEPTUAL and say so; no performance data, no winner claims.
   Totals come from the package data. */

const STEP_MS = 4200
const STEPS = [
  { title: 'One concept, two versions', text: 'Each concept comes in two finished versions that differ in one thing, such as the hook or the call to action.' },
  { title: 'The pattern scales', text: `Five concepts become ten finished ad versions. ${SPRINT_PLUS.name} doubles it.` },
  { title: 'Compare, learn, repeat', text: 'You compare the versions in your own ad account, and what you learn shapes the next batch.' },
]
const BARS = [[44, 62], [38, 30], [58, 40], [34, 48], [50, 36]] // conceptual heights only

function Version({ label, hook, tone, delay, soft }) {
  return (
    <div className="cs-fade-up flex flex-col items-center gap-2" style={{ animationDelay: `${delay}ms` }}>
      <div
        className={`relative flex aspect-[9/14] w-[7.2rem] flex-col justify-between overflow-hidden rounded-2xl border bg-surface-2 p-3 sm:w-[8.5rem] ${soft ? 'border-hairline-strong' : 'border-hairline-strong'}`}
        style={{ boxShadow: `0 0 40px -16px ${tone}` }}
      >
        <div className="absolute inset-0" style={{ background: `radial-gradient(100% 60% at 50% 0%, ${tone}, transparent 75%)`, opacity: 0.5 }} />
        <span className="relative text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</span>
        <span className="relative rounded-lg bg-black/35 px-2 py-1.5 text-center text-xs font-semibold text-ink">{hook}</span>
      </div>
    </div>
  )
}

export default function TestingDiagram() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [inView, setInView] = useState(false)
  const [touched, setTouched] = useState(false)
  const rootRef = useRef(null)
  const done = useRef(false)
  const autoplay = useAutoplayAllowed()

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => { if (autoplay && inView && !touched && !done.current) setRunning(true) }, [autoplay, inView, touched])
  useEffect(() => {
    if (!running || !inView) return undefined
    const t = window.setTimeout(() => {
      if (step >= STEPS.length - 1) { done.current = true; setRunning(false) } else setStep((s) => s + 1)
    }, STEP_MS)
    return () => window.clearTimeout(t)
  }, [running, inView, step])
  const choose = (i) => { setTouched(true); setRunning(false); setStep(i) }
  const concepts = Array.from({ length: SPRINT.concepts }, (_, i) => i)

  return (
    <div ref={rootRef} className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Structured creative testing</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-snug text-ink md:text-[1.7rem]">Two versions of every concept. Then you learn.</h3>
      </div>

      {/* the stage: one thing on screen at a time */}
      <div aria-hidden="true" className="relative mx-auto mt-6 flex h-[15.5rem] max-w-2xl items-center justify-center overflow-hidden rounded-2xl border border-hairline bg-canvas/50 sm:h-[17rem]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[80px]" />
        {step === 0 && (
          <div key="s0" className="relative flex items-center gap-4 sm:gap-7">
            <Version label="Version A" hook="Hook A" tone="rgba(139,92,246,0.55)" delay={0} />
            <span className="cs-fade-up text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted" style={{ animationDelay: '300ms' }}>vs</span>
            <Version label="Version B" hook="Hook B" tone="rgba(213,255,64,0.45)" delay={150} soft />
          </div>
        )}
        {step === 1 && (
          <div key="s1" className="relative grid w-full max-w-lg grid-cols-5 gap-2 px-4 sm:gap-3">
            {concepts.map((i) => {
              const color = ConceptAccents[i % ConceptAccents.length]
              return (
                <div key={i} className="cs-fade-up flex flex-col items-center gap-2" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="text-[11px] font-bold tracking-[0.1em]" style={{ color }}>C{i + 1}</span>
                  {['A', 'B'].map((v, vi) => (
                    <span key={v} className="h-[4.3rem] w-full rounded-lg border bg-surface-2 sm:h-[4.9rem]" style={{ borderColor: `${color}${vi ? '55' : 'aa'}` }} />
                  ))}
                </div>
              )
            })}
          </div>
        )}
        {step === 2 && (
          <div key="s2" className="relative mt-6 flex w-full max-w-lg items-end justify-center gap-3 px-4 sm:gap-5">
            {concepts.map((i) => (
              <div key={i} className="flex h-32 flex-1 items-end justify-center gap-1.5 sm:h-36">
                {[0, 1].map((v) => (
                  <span key={v} className="ugc-rise w-3.5 rounded-t-md sm:w-4" style={{ height: `${BARS[i][v]}%`, background: v ? 'rgba(213,255,64,0.55)' : 'rgba(139,92,246,0.65)', animationDelay: `${i * 80 + v * 60}ms` }} />
                ))}
              </div>
            ))}
            <span className="cs-fade-up absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-ink-muted" style={{ animationDelay: '600ms' }}>Conceptual illustration, not real results</span>
          </div>
        )}
      </div>

      <div className="mx-auto mt-5 max-w-2xl text-center">
        <p aria-live="polite" className="min-h-[3.2rem] text-base leading-relaxed text-ink-muted md:text-lg">
          <span className="font-semibold text-ink">{STEPS[step].title}.</span> {STEPS[step].text}
        </p>
        <ol className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => choose(i)}
                aria-current={i === step ? 'step' : undefined}
                className={`min-h-[44px] rounded-full px-4 py-2 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${i === step ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-2 text-ink-muted hover:text-ink'}`}
              >
                <span className="mr-1.5 tabular-nums opacity-70">{i + 1}</span>{s.title}
              </button>
            </li>
          ))}
          {running && (
            <li>
              <button type="button" onClick={() => setRunning(false)} className="min-h-[44px] rounded-full px-3 py-2 text-[13px] font-medium text-ink-muted underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
                Pause
              </button>
            </li>
          )}
        </ol>
        <p className="mt-4 text-sm text-ink-muted">
          {packageEquation(SPRINT)} · {SPRINT_PLUS.name}: {packageEquation(SPRINT_PLUS)}.
        </p>
        <p className="mt-1 text-[13px] text-ink-muted">Illustration only. We can&rsquo;t guarantee performance, which depends on your offer, audience and budget.</p>
      </div>
    </div>
  )
}
