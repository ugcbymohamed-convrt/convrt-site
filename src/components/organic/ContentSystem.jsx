import { useEffect, useRef, useState } from 'react'
import { Avatar, delay } from '../ugc/illustrations.jsx'
import { useAutoplayAllowed } from '../ugc/creatorVideo.jsx'
import { Icon, Skel } from '../scenes/sceneKit.jsx'
import { ORGANIC_SYSTEM as CONTENT } from '../../content/organicSocialPage.js'
import { PILLARS } from './OrganicScenes.jsx'

/* "Not just more posts. A content system." The organic counterpart of the UGC page's creative-testing diagram and the Spokesperson page's delivery formats, with the SAME
   interaction system (src/components/ugc/TestingDiagram.jsx): one scene on a stage at a time, a live caption, one button per state, a one-time pass through the states
   when it scrolls into view (never for reduced-motion or data-saver visitors, with a Pause button), and buttons that always work.

   It tells ONE story, Strategy → Production → Publishing → Learning, in three states:
     1  Plan             content pillars feed a monthly content plan
     2  Produce          the planned ideas become finished vertical videos
     3  Publish & Learn  the videos are organized into a publishing calendar, then a simple review of the metrics the platforms make available feeds the next plan
   Conceptual only: no counts, no results, no growth. The review panel shows labelled, equal placeholder lines (no bars, no axis, no trend, no figures). The caption under the stage
   and the note say that what a plan includes and how often content is published depends on the package. */

const STEP_MS = 4600
const PEOPLE = { educational: 2, entertaining: 3, product: 0, founder: 1 }

/* the Strategy → Production → Publishing → Learning line; `at` is the index of the highlighted word for each state (Publish & Learn lights the last two) */
const FLOW_ON = [[0], [1], [2, 3]]
function Flow({ step }) {
  const on = FLOW_ON[step]
  return (
    <ol aria-label={CONTENT.flow.join(', ')} className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[13px] font-semibold">
      {CONTENT.flow.map((w, i) => (
        <li key={w} className="flex items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 transition-colors duration-300 motion-reduce:transition-none ${on.includes(i) ? 'bg-lime text-canvas' : 'bg-surface-2 text-ink-muted'}`}>{w}</span>
          {i < CONTENT.flow.length - 1 && <span aria-hidden="true" className="text-ink-muted">→</span>}
        </li>
      ))}
    </ol>
  )
}

/* STATE 1: four content pillars feed one plan */
function ScenePlan() {
  const y = (i) => ((i + 0.5) / PILLARS.length) * 100
  return (
    <div className="flex h-full w-full items-stretch justify-center gap-0 sm:gap-1">
      <div className="flex w-[40%] max-w-[9.5rem] shrink-0 flex-col justify-center">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Content pillars</p>
        <ul className="flex flex-1 flex-col justify-between gap-1.5">
          {PILLARS.map((p, i) => (
            <li key={p.id} className="cs-fade-up flex flex-1 items-center gap-1.5 rounded-xl border bg-canvas/50 px-2" style={{ ...delay(i * 130), borderColor: `${p.color}77` }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
              <span className="truncate text-[10px] font-bold sm:text-[11px]" style={{ color: p.color }}>{p.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="flex w-[9%] max-w-[3.5rem] shrink-0 flex-col sm:w-[12%]">
        <span className="mb-2 block h-[12px]" />
        <svg viewBox="0 0 40 100" preserveAspectRatio="none" className="min-h-0 w-full flex-1">
          {PILLARS.map((p, i) => (
            <path key={p.id} pathLength="1" d={`M0 ${y(i)} C 22 ${y(i)}, 18 50, 40 50`} fill="none" stroke={p.color} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="ugc-draw" style={delay(500 + i * 90)} />
          ))}
        </svg>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Content plan</p>
        <div className="ugc-pop rounded-2xl border border-lime/40 bg-surface-2 p-2.5" style={{ ...delay(700), boxShadow: '0 0 40px -18px rgba(213,255,64,0.5)' }}>
          <div className="mb-1.5 grid grid-cols-4 gap-1">
            {['W1', 'W2', 'W3', 'W4'].map((w) => <span key={w} className="text-center text-[9px] font-semibold text-ink-muted">{w}</span>)}
          </div>
          {[0, 1, 2].map((r) => (
            <div key={r} className="mb-1 grid grid-cols-4 gap-1 last:mb-0">
              {[0, 1, 2, 3].map((c) => {
                const p = PILLARS[(r * 2 + c * 3 + (r % 2)) % PILLARS.length]
                const filled = (r + c) % 3 !== 2
                return filled
                  ? <span key={c} className="ugc-pop h-5 rounded-md" style={{ ...delay(1000 + (r * 4 + c) * 90), background: `${p.color}55`, boxShadow: `inset 0 0 0 1px ${p.color}aa` }} />
                  : <span key={c} className="h-5 rounded-md border border-dashed border-white/10" />
              })}
            </div>
          ))}
        </div>
        <p className="cs-fade-up mt-2.5 text-[11px] leading-snug text-ink-muted" style={delay(2200)}>Every slot has a purpose before filming.</p>
      </div>
    </div>
  )
}

/* STATE 2: planned ideas become finished vertical videos */
function SceneProduce() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <ul className="grid w-full max-w-md grid-cols-4 gap-2 sm:gap-3">
        {PILLARS.map((p, i) => (
          <li key={p.id} className="flex flex-col items-center gap-1.5">
            <span className="cs-fade-up w-full rounded-md py-0.5 text-center text-[9px] font-bold uppercase tracking-[0.04em]" style={{ ...delay(i * 120), background: `${p.color}26`, color: p.color }}>Idea</span>
            <svg viewBox="0 0 12 14" className="h-3.5 w-3 text-ink-muted" fill="none" aria-hidden="true"><path d="M6 1v10M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="ugc-pop relative aspect-[9/16] w-full overflow-hidden rounded-xl border" style={{ ...delay(500 + i * 230), borderColor: `${p.color}bb`, boxShadow: `0 0 24px -12px ${p.color}` }}>
              <Avatar variant={PEOPLE[p.id]} className="absolute inset-0 h-full w-full" pos="50% 22%" />
              <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 58%, rgba(0,0,0,0.65) 100%)' }} />
              <span className="absolute inset-x-1.5 bottom-1.5 flex flex-col items-center gap-0.5 rounded bg-black/55 px-1 py-1"><span className="h-0.5 w-full rounded-full bg-white/85" /><span className="h-0.5 w-3/5 rounded-full" style={{ background: p.color }} /></span>
            </span>
            <span className="cs-fade-up inline-flex items-center gap-1 rounded-full bg-lime/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.05em] text-lime" style={delay(1000 + i * 230)}>
              <Icon className="h-2.5 w-2.5"><path d="M4 12.5l5 5L20 6" /></Icon>Ready
            </span>
          </li>
        ))}
      </ul>
      <p className="cs-fade-up text-center text-[11px] text-ink-muted" style={delay(2200)}>Scripted, filmed and edited as finished vertical videos.</p>
    </div>
  )
}

/* STATE 3: the videos are organized into a publishing calendar; a simple review of the available metrics feeds the next plan */
function ScenePublishLearn() {
  const cal = [['M', 'educational'], ['T', null], ['W', 'entertaining'], ['T', 'product'], ['F', 'founder']]
  const metrics = ['Reach', 'Watch time', 'Engagement']
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 sm:gap-4">
      <div className="mx-auto w-full max-w-md">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Publishing calendar</p>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {cal.map(([d, id], i) => {
            const p = PILLARS.find((x) => x.id === id)
            return (
              <div key={`${d}${i}`} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{d}</span>
                {p
                  ? <span className="ugc-pop relative block aspect-[9/12] w-full overflow-hidden rounded-lg border" style={{ ...delay(i * 200), borderColor: `${p.color}bb`, background: `${p.color}22` }}><Avatar variant={PEOPLE[p.id]} className="absolute inset-0 h-full w-full" pos="50% 22%" /></span>
                  : <span className="block aspect-[9/12] w-full rounded-lg border border-dashed border-white/10" />}
              </div>
            )
          })}
        </div>
      </div>
      <div className="cs-fade-up mx-auto grid w-full max-w-md grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-hairline-strong bg-surface-2 p-3" style={delay(1300)}>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Review what the platforms report</p>
          <ul className="mt-2 space-y-1.5">
            {metrics.map((l, i) => (
              <li key={l} className="cs-fade-up flex items-center gap-2" style={delay(1600 + i * 200)}>
                <span className="w-[4.6rem] shrink-0 text-[10px] font-medium text-ink-muted">{l}</span>
                <Skel />
              </li>
            ))}
          </ul>
        </div>
        <span className="cs-fade-up flex flex-col items-center gap-1 text-lime" style={delay(2400)}>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0113.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 01-13.7 5.6L4 15.3M4 20v-4.7h4.7" /></svg>
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">Next plan</span>
        </span>
      </div>
    </div>
  )
}

const SCENES = [ScenePlan, SceneProduce, ScenePublishLearn]

export default function ContentSystem() {
  const { eyebrow, title, steps, note } = CONTENT
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
      if (step >= steps.length - 1) { done.current = true; setRunning(false) } else setStep((s) => s + 1)
    }, STEP_MS)
    return () => window.clearTimeout(t)
  }, [running, inView, step, steps.length])
  const choose = (i) => { setTouched(true); setRunning(false); setStep(i) }
  const Scene = SCENES[step]

  return (
    <div ref={rootRef} id="organic-content-system" className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{eyebrow}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-snug text-ink md:text-[1.7rem]">{title}</h3>
      </div>

      <Flow step={step} />

      <div aria-hidden="true" className="relative mx-auto mt-5 h-[25rem] max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-canvas/50 px-3 py-3 sm:h-[23.5rem]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[80px]" />
        <div className="relative h-full"><Scene key={`s${step}`} /></div>
      </div>

      <div className="mx-auto mt-5 max-w-2xl text-center">
        <p aria-live="polite" className="min-h-[4.8rem] text-base leading-relaxed text-ink-muted md:min-h-[3.2rem] md:text-lg">
          <span className="font-semibold text-ink">{steps[step].title}.</span> {steps[step].text}
        </p>
        <ol className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => choose(i)}
                aria-current={i === step ? 'step' : undefined}
                className={`min-h-[44px] rounded-full px-4 py-2 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none ${i === step ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-2 text-ink-muted hover:text-ink'}`}
              >
                <span className="mr-1.5 tabular-nums opacity-70">{i + 1}</span>{s.short}
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
        <p className="mt-4 text-[13px] text-ink-muted">{note}</p>
      </div>
    </div>
  )
}
