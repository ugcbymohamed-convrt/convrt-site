import { useEffect, useRef, useState } from 'react'
import { SPRINT, SPRINT_PLUS, adVersions, packageEquation, AD_VERSIONS } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'
import { MiniPhone, ArrowDown, ArrowRight, delay } from './illustrations.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { editorial } from '../../i18n/editorial.js'

/* The creative-testing illustration: ONE interaction, three steps, one short sentence each. Every number comes from the package data
   (SPRINT / SPRINT_PLUS in src/seo/businessKnowledge.js): today 5 concepts x 3 versions = 15 finished ad versions.
     1  One concept, three versions   a concept splits into Version A, B and C (Hook A / B / C); the chips show that only the hook changes
     2  The pattern scales            five concept columns, each with its three versions: 5 x 3 = 15
     3  Compare, learn, repeat        all fifteen are compared, what you learn shapes the next batch, and the loop repeats
   It steps through once by itself when it scrolls into view (never for reduced-motion visitors, with a Pause button) and the three
   step buttons always work. State 3 is CONCEPTUAL and says so: no performance numbers, no ROAS, no winner claims. The creators are
   stylised illustrations. */

const WORDS = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 10: 'ten' }
const word = (n) => WORDS[n] ?? String(n)
const Cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)

const STEP_MS = 4200
const STEPS = [
  { title: `One concept, ${word(SPRINT.variationsPerConcept)} versions`, text: `Each concept comes in ${word(SPRINT.variationsPerConcept)} finished versions that differ in one thing, such as the hook or the call to action.` },
  { title: 'The pattern scales', text: `${Cap(word(SPRINT.concepts))} concepts with ${word(SPRINT.variationsPerConcept)} versions each make ${adVersions(SPRINT.variations)}. ${SPRINT_PLUS.name} goes to ${word(SPRINT_PLUS.concepts)} concepts and ${SPRINT_PLUS.variations}.` },
  { title: 'Compare, learn, repeat', text: `You compare all ${SPRINT.variations} in your own ad account, and what you learn shapes the next batch.` },
]
const LIME = '#d5ff40'
const VIOLET = '#8b5cf6'
const CORAL = '#ff6a4d'
const VERSION_TONES = [VIOLET, LIME, CORAL]
const LETTERS = ['A', 'B', 'C', 'D']
const STRONG = [1, 7, 11] // which of the fifteen versions are drawn highlighted in step 3 (purely illustrative, no data)

const Lock = () => <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
const Swap = () => <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3M20 16H6l3 3" /></svg>

/* STATE 1: one concept, three versions that differ in a single element */
function SceneOne() {
  const n = SPRINT.variationsPerConcept
  const xs = Array.from({ length: n }, (_, i) => ((i + 0.5) / n) * 300)
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-3.5">
      <div className="cs-fade-up flex items-center gap-2.5 rounded-2xl border border-hairline-strong bg-surface-2 px-3 py-2">
        <MiniPhone variant={1} tone={VIOLET} className="h-9 w-5 rounded-md" />
        <span className="text-left"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-lime">{tr('One concept')}</span><span className="block text-[11px] text-ink-muted">{tr('One creator, one offer, one script')}</span></span>
      </div>
      <div className="w-full max-w-md">
        <svg viewBox="0 0 300 36" preserveAspectRatio="none" aria-hidden="true" className="block h-9 w-full">
          {xs.map((x, i) => (
            <path key={x} d={`M150 0 C150 20, ${x} 14, ${x} 36`} fill="none" stroke={VERSION_TONES[i]} strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="ugc-draw" style={delay(250 + i * 90)} />
          ))}
        </svg>
        <div className="grid grid-cols-3">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="cs-fade-up flex flex-col items-center gap-1.5" style={delay(500 + i * 140)}>
              <MiniPhone variant={1} tone={VERSION_TONES[i]} caption={`${tr('Hook')} ${LETTERS[i]}`} captionBg={VERSION_TONES[i]} ring className="w-[4.6rem] sm:w-[6rem]" />
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${VERSION_TONES[i]}26`, color: VERSION_TONES[i] }}>{tr('Version')} {LETTERS[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="cs-fade-up flex flex-wrap items-center justify-center gap-1.5" style={delay(1000)}>
        {['Creator', 'Offer', 'CTA'].map((c) => (
          <li key={c} className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2 py-1 text-[10px] font-medium text-ink-muted"><Lock />{tr(c)} {tr('same')}</li>
        ))}
        <li className="inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold text-canvas"><Swap />{tr('Only the hook changes')}</li>
      </ul>
    </div>
  )
}

/* STATE 2: five concepts, three versions each, fifteen finished ad versions */
function SceneTwo({ concepts }) {
  const n = SPRINT.variationsPerConcept
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3.5">
      <div className="grid w-full max-w-lg grid-cols-5 gap-1.5 sm:gap-3">
        {concepts.map((i) => {
          const color = ConceptAccents[i % ConceptAccents.length]
          return (
            <div key={i} className="cs-fade-up flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2 sm:px-2" style={{ ...delay(i * 110), borderColor: `${color}66`, background: `${color}10` }}>
              <span className="text-[10px] font-bold tracking-[0.08em]" style={{ color }}>C{i + 1}</span>
              {Array.from({ length: n }, (_, v) => (
                <MiniPhone key={v} variant={i} tone={color} badge={LETTERS[v]} className="w-[72%] max-w-[2.6rem]" />
              ))}
            </div>
          )
        })}
      </div>
      <p className="cs-fade-up flex items-baseline justify-center gap-x-1.5 whitespace-nowrap sm:gap-x-2" style={delay(900)}>
        <Num n={SPRINT.concepts} label="concepts" /><span className="text-base text-ink-muted sm:text-lg">×</span>
        <Num n={n} label={AD_VERSIONS.perConcept} /><span className="text-base text-ink-muted sm:text-lg">=</span>
        <Num n={SPRINT.variations} label="ads" lime />
      </p>
    </div>
  )
}
const Num = ({ n, label, lime = false }) => (
  <span className="inline-flex items-baseline gap-1">
    <span className={`font-display text-[1.65rem] font-bold tabular-nums sm:text-4xl ${lime ? 'text-lime' : 'text-ink'}`}>{n}</span>
    <span className={`text-xs font-medium ${lime ? 'text-lime' : 'text-ink-muted'}`}>{tr(label)}</span>
  </span>
)

/* STATE 3: compare the fifteen, learn, build the next batch, repeat (conceptual only) */
function SceneThree({ concepts }) {
  const n = SPRINT.variationsPerConcept
  const Step = ({ k, children }) => (
    <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted"><span className="mr-1 text-lime">{k}</span>{children}</p>
  )
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 sm:pt-5">
      <div className="flex w-full max-w-xl flex-col items-center gap-1.5 sm:flex-row sm:items-center sm:justify-center sm:gap-2.5">
        <div className="cs-fade-up">
          <Step k="1">{currentLocale() === 'ar' ? `قارن النسخ الـ${SPRINT.variations}` : <>Compare the {SPRINT.variations}</>}</Step>
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
            {Array.from({ length: n }, (_, v) => concepts.map((i) => {
              const k = i * n + v
              const strong = STRONG.includes(k)
              const color = ConceptAccents[i % ConceptAccents.length]
              return <MiniPhone key={k} variant={i} tone={strong ? LIME : color} dim={!strong} ring={strong} className="w-6 sm:w-8" />
            }))}
          </div>
        </div>
        <ArrowDown className="h-4 w-3 text-lime sm:hidden" /><ArrowRight className="hidden h-3 w-5 text-lime sm:block" />
        <div className="cs-fade-up flex flex-col items-center gap-1.5" style={delay(500)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/15 text-lime">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>
          </span>
          <span className="whitespace-nowrap rounded-full border border-lime/50 bg-lime/10 px-3 py-1 text-[11px] font-bold text-lime">{tr('2 · Learn what resonates')}</span>
        </div>
        <ArrowDown className="h-4 w-3 text-lime sm:hidden" /><ArrowRight className="hidden h-3 w-5 text-lime sm:block" />
        <div className="cs-fade-up" style={delay(900)}>
          <Step k="3">{tr('Next batch builds on it')}</Step>
          <ul className="flex items-end justify-center gap-1.5">
            {concepts.map((i) => (
              <li key={i} className="w-8 sm:w-9"><MiniPhone variant={i + 1} tone={ConceptAccents[i % ConceptAccents.length]} badge="★" className="w-full" /></li>
            ))}
          </ul>
        </div>
      </div>
      <span className="ugc-pop inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-surface-2 px-3 py-1 text-[11px] font-semibold text-ink" style={delay(1300)}>
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-lime" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 11-2.6-5.9M20 4v5h-5" /></svg>{tr('Test it the same way, then repeat')}</span>
      <span className="cs-fade-up order-first text-[10px] text-ink-muted sm:absolute sm:right-3 sm:top-2.5" style={delay(300)}>{tr('Conceptual illustration, not real results')}</span>
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{tr('Structured creative testing')}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-snug text-ink md:text-[1.7rem]">{tr(`${Cap(word(SPRINT.variationsPerConcept))} versions of every concept. Then you learn.`)}</h3>
        {editorial(currentLocale())?.SECTION_INTROS?.['ugc-testing'] && <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">{editorial(currentLocale()).SECTION_INTROS['ugc-testing']}</p>}
      </div>

      {/* the stage: one thing on screen at a time */}
      <div aria-hidden="true" className="relative mx-auto mt-6 h-[28rem] max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-canvas/50 px-3 sm:h-[24.5rem]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[80px]" />
        {step === 0 && <SceneOne key="s0" />}
        {step === 1 && <SceneTwo key="s1" concepts={concepts} />}
        {step === 2 && <SceneThree key="s2" concepts={concepts} />}
      </div>

      <div className="mx-auto mt-5 max-w-2xl text-center">
        <p aria-live="polite" className="min-h-[3.2rem] text-base leading-relaxed text-ink-muted md:text-lg">
          <span className="font-semibold text-ink">{tr(STEPS[step].title)}.</span> {tr(STEPS[step].text)}
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
                <span className="mr-1.5 tabular-nums opacity-70">{i + 1}</span>{tr(s.title)}
              </button>
            </li>
          ))}
          {running && (
            <li>
              <button type="button" onClick={() => setRunning(false)} className="min-h-[44px] rounded-full px-3 py-2 text-[13px] font-medium text-ink-muted underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">{tr('Pause')}</button>
            </li>
          )}
        </ol>
        <p className="mt-4 text-sm text-ink-muted">
          {tr(packageEquation(SPRINT))} · {SPRINT_PLUS.name}: {tr(packageEquation(SPRINT_PLUS))}.
        </p>
        <p className="mt-1 text-[13px] text-ink-muted">{tr('Illustration only. We can’t guarantee performance, which depends on your offer, audience and budget.')}</p>
      </div>
    </div>
  )
}
