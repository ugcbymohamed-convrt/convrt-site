import { useEffect, useRef, useState } from 'react'
import { SPRINT, SPRINT_PLUS, packageEquation, AD_VERSIONS } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'
import { MiniPhone, ArrowDown, delay } from './illustrations.jsx'

/* The creative-testing illustration: ONE interaction, three steps, one short sentence each.
     1  One concept, two versions     a concept splits into Version A and Version B; the chips show that only the hook changes
     2  The pattern scales            five concept groups, each with its two versions: 5 concepts x 2 versions = 10 finished ad versions
     3  Compare, learn, repeat        a batch is compared, what you learn feeds the next batch, and the loop repeats
   It steps through once by itself when it scrolls into view (never for reduced-motion visitors, with a Pause button) and the three
   step buttons always work. State 3 is CONCEPTUAL and says so: no performance numbers, no ROAS, no winner claims. The creators are
   stylised illustrations. Totals come from the package data. */

const STEP_MS = 4200
const STEPS = [
  { title: 'One concept, two versions', text: 'Each concept comes in two finished versions that differ in one thing, such as the hook or the call to action.' },
  { title: 'The pattern scales', text: `Five concepts become ten finished ad versions. ${SPRINT_PLUS.name} doubles it.` },
  { title: 'Compare, learn, repeat', text: 'You compare the versions in your own ad account, and what you learn shapes the next batch.' },
]
const LIME = '#d5ff40'
const VIOLET = '#8b5cf6'
const CORAL = '#ff6a4d'
const STRONG = [1, 4, 7] // which of the ten versions are drawn highlighted in step 3 (purely illustrative)

const Lock = () => <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
const Swap = () => <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3M20 16H6l3 3" /></svg>

/* STATE 1: one concept, two versions that differ in a single element */
function SceneOne() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-3">
      <div className="cs-fade-up flex items-center gap-2.5 rounded-2xl border border-hairline-strong bg-surface-2 px-3 py-2">
        <MiniPhone variant={1} tone={VIOLET} className="h-9 w-5 rounded-md" />
        <span className="text-left"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-lime">Concept 1</span><span className="block text-[11px] text-ink-muted">One creator, one offer, one script</span></span>
      </div>
      <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true" className="h-8 w-[56%]">
        <path pathLength="1" d="M100 0 C100 22, 40 14, 40 40" fill="none" stroke={VIOLET} strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="ugc-draw" style={delay(300)} />
        <path pathLength="1" d="M100 0 C100 22, 160 14, 160 40" fill="none" stroke={LIME} strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="ugc-draw" style={delay(380)} />
      </svg>
      <div className="flex items-start justify-center gap-6 sm:gap-12">
        {[['Version A', 'Hook A', VIOLET, 560], ['Version B', 'Hook B', LIME, 700]].map(([v, hook, tone, d]) => (
          <div key={v} className="cs-fade-up flex flex-col items-center gap-1.5" style={delay(d)}>
            <MiniPhone variant={1} tone={tone} caption={hook} captionBg={tone} ring className="w-[5rem] sm:w-[6.2rem]" />
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${tone}26`, color: tone }}>{v}</span>
          </div>
        ))}
      </div>
      <ul className="cs-fade-up flex flex-wrap items-center justify-center gap-1.5" style={delay(1000)}>
        {['Creator', 'Offer', 'CTA'].map((c) => (
          <li key={c} className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2 py-1 text-[10px] font-medium text-ink-muted"><Lock />{c} same</li>
        ))}
        <li className="inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold text-canvas"><Swap />Only the hook changes</li>
      </ul>
    </div>
  )
}

/* STATE 2: five concepts, two versions each, ten finished ad versions */
function SceneTwo({ concepts }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="grid w-full max-w-lg grid-cols-5 gap-1.5 sm:gap-3">
        {concepts.map((i) => {
          const color = ConceptAccents[i % ConceptAccents.length]
          return (
            <div key={i} className="cs-fade-up flex flex-col items-center gap-1.5 rounded-xl border p-1.5 sm:p-2" style={{ ...delay(i * 110), borderColor: `${color}66`, background: `${color}10` }}>
              <span className="text-[10px] font-bold tracking-[0.08em]" style={{ color }}>C{i + 1}</span>
              <MiniPhone variant={i} tone={color} badge="A" className="w-full" />
              <MiniPhone variant={i} tone={color} badge="B" className="w-full" />
            </div>
          )
        })}
      </div>
      <p className="cs-fade-up flex items-baseline justify-center gap-x-1.5 whitespace-nowrap sm:gap-x-2" style={delay(900)}>
        <Num n={SPRINT.concepts} label="concepts" /><span className="text-base text-ink-muted sm:text-lg">×</span>
        <Num n={SPRINT.variationsPerConcept} label={AD_VERSIONS.perConcept} /><span className="text-base text-ink-muted sm:text-lg">=</span>
        <Num n={SPRINT.variations} label="ads" lime />
      </p>
    </div>
  )
}
const Num = ({ n, label, lime = false }) => (
  <span className="inline-flex items-baseline gap-1">
    <span className={`font-display text-[1.65rem] font-bold tabular-nums sm:text-4xl ${lime ? 'text-lime' : 'text-ink'}`}>{n}</span>
    <span className={`text-xs font-medium ${lime ? 'text-lime' : 'text-ink-muted'}`}>{label}</span>
  </span>
)

/* STATE 3: compare a batch, learn, build the next batch, repeat (conceptual only) */
function SceneThree({ concepts }) {
  const ten = concepts.flatMap((i) => [i * 2, i * 2 + 1])
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 pt-5">
      <div className="cs-fade-up w-full max-w-xl">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">1 &middot; Compare the batch</p>
        <ul className="flex items-end justify-center gap-[3px] sm:gap-1.5">
          {ten.map((k) => {
            const strong = STRONG.includes(k)
            const color = ConceptAccents[Math.floor(k / 2) % ConceptAccents.length]
            return (
              <li key={k} className="w-[9%] max-w-[2.9rem]">
                <MiniPhone variant={Math.floor(k / 2)} tone={strong ? LIME : color} dim={!strong} ring={strong} className="w-full" />
              </li>
            )
          })}
        </ul>
      </div>
      <div className="cs-fade-up flex flex-col items-center" style={delay(500)}>
        <ArrowDown className="h-5 w-3 text-lime" />
        <span className="rounded-full border border-lime/50 bg-lime/10 px-3.5 py-1.5 text-xs font-bold text-lime">2 &middot; Learn what resonates</span>
        <ArrowDown className="h-5 w-3 text-lime" />
      </div>
      <div className="cs-fade-up flex w-full max-w-lg flex-col items-center justify-center gap-2.5 sm:flex-row sm:items-end sm:gap-3" style={delay(900)}>
        <div>
          <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">3 &middot; Next batch builds on it</p>
          <ul className="flex items-end justify-center gap-1.5 sm:gap-2">
            {concepts.map((i) => (
              <li key={i} className="w-11 sm:w-[3.4rem]"><MiniPhone variant={i + 1} tone={ConceptAccents[i % ConceptAccents.length]} badge="★" className="w-full" /></li>
            ))}
          </ul>
        </div>
        <span className="ugc-pop inline-flex items-center gap-1 rounded-full border border-hairline-strong bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink" style={delay(1300)}>
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-lime" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 11-2.6-5.9M20 4v5h-5" /></svg>Repeat
        </span>
      </div>
      <span className="cs-fade-up absolute right-3 top-2.5 text-[10px] text-ink-muted" style={delay(300)}>Conceptual illustration, not real results</span>
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
      <div aria-hidden="true" className="relative mx-auto mt-6 h-[22.5rem] max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-canvas/50 px-3 sm:h-[24rem]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[80px]" />
        {step === 0 && <SceneOne key="s0" />}
        {step === 1 && <SceneTwo key="s1" concepts={concepts} />}
        {step === 2 && <SceneThree key="s2" concepts={concepts} />}
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
