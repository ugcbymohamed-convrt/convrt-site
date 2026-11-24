import { useEffect, useRef, useState } from 'react'
import { Avatar, delay } from '../ugc/illustrations.jsx'
import { useAutoplayAllowed } from '../ugc/creatorVideo.jsx'
import { Icon } from '../scenes/sceneKit.jsx'
import { ORGANIC_SYSTEM as CONTENT } from '../../content/organicSocialPage.js'
import { PILLARS } from './OrganicScenes.jsx'
import { tr } from '../../i18n/tr.js'
import { dayLabel } from '../../i18n/ar/weekdays.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeConfig } from '../../i18n/content.js'
import { ES_SECTION_INTROS } from '../../i18n/es/labels.js'

/* "Not just more posts. A content system." The organic counterpart of the UGC page's creative-testing diagram and the Spokesperson page's delivery formats, with the SAME
   interaction system (src/components/ugc/TestingDiagram.jsx): one scene on a stage at a time, a live caption, one button per state, a one-time pass through the states
   when it scrolls into view (never for reduced-motion or data-saver visitors, with a Pause button), and buttons that always work.

   It tells ONE story, Strategy → Production → Publishing → Learning, in three states:
     1  Plan             content pillars feed a monthly content plan
     2  Produce          the planned ideas become finished vertical videos
     3  Publish & Learn  the videos are organized into a publishing calendar, then a simple review of the metrics the platforms make available feeds the next plan
   Conceptual only: no counts, no results, no growth. The review strip shows the metric NAMES only (no bars, no axis, no trend, no figures). The caption under the stage
   and the note say that what a plan includes and how often content is published depends on the package. */

const STEP_MS = 4600
const PEOPLE = { educational: 2, entertaining: 3, product: 0, founder: 1 }

/* the Strategy → Production → Publishing → Learning line; `at` is the index of the highlighted word for each state (Publish & Learn lights the last two) */
const FLOW_ON = [[0], [1], [2, 3]]
function Flow({ step }) {
  const on = FLOW_ON[step]
  const flow = localizeConfig(CONTENT, currentLocale()).flow
  return (
    <ol aria-label={flow.join(', ')} className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[13px] font-semibold">
      {flow.map((w, i) => (
        <li key={w} className="flex items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 transition-colors duration-300 motion-reduce:transition-none ${on.includes(i) ? 'bg-lime text-canvas' : 'bg-surface-2 text-ink-muted'}`}>{w}</span>
          {i < flow.length - 1 && <span aria-hidden="true" className="text-ink-muted">→</span>}
        </li>
      ))}
    </ol>
  )
}

/* a vertical (9:16) finished-video thumbnail: a creator portrait, a soft wash in the pillar colour and caption lines. Decorative (the stage is aria-hidden). */
function Clip({ variant, color, className = '', play = false, children }) {
  return (
    <span className={`relative block aspect-[9/16] overflow-hidden rounded-xl border bg-surface-2 ${className}`} style={{ borderColor: `${color}bb`, boxShadow: `0 0 26px -12px ${color}` }}>
      <Avatar variant={variant} className="absolute inset-0 h-full w-full" pos="50% 22%" />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, transparent 30%, transparent 58%, rgba(0,0,0,0.68) 100%)' }} />
      {play && (
        <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45">
          <svg viewBox="0 0 12 12" className="ml-px h-2.5 w-2.5 text-ink" fill="currentColor"><path d="M3 1.8v8.4L10 6z" /></svg>
        </span>
      )}
      {children}
    </span>
  )
}
const Caption = ({ color }) => (
  <span className="absolute inset-x-[10%] bottom-[6%] flex flex-col items-center gap-0.5 rounded bg-black/60 px-1.5 py-1"><span className="h-[3px] w-full rounded-full bg-white/85" /><span className="h-[3px] w-3/5 rounded-full" style={{ background: color }} /></span>
)
const Cap = ({ children, center = false }) => <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted ${center ? 'text-center' : ''}`}>{children}</p>
const Down = () => (
  <svg viewBox="0 0 12 14" className="cs-fade-up mx-auto h-3.5 w-3 shrink-0 text-lime sm:h-4 sm:w-3.5" fill="none" aria-hidden="true" style={delay(500)}><path d="M6 1v10M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/* STATE 1: content pillars → video concepts (vertical thumbnails) → the content calendar they are placed in */
function ScenePlan() {
  const concepts = PILLARS.map((p) => ({ ...p, who: PEOPLE[p.id] }))
  /* the calendar: 3 weeks of 5 days; filled slots reuse the concept thumbnails. The pattern is uneven on purpose: it shows variety, not a posting frequency. */
  const slots = [[0, null, 2, null, 1], [null, 3, null, 0, null], [2, null, 1, 3, null]]
  let n = 0
  return (
    <div className="flex h-full w-full flex-col items-stretch justify-center gap-2 sm:gap-3 lg:gap-4">
      <div>
        <Cap center>{tr('1 · Content pillars')}</Cap>
        <ul className="mt-1.5 flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {PILLARS.map((p, i) => (
            <li key={p.id} className="cs-fade-up inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold sm:px-3.5 sm:py-1.5 sm:text-[13px]" style={{ ...delay(i * 120), color: p.color, background: `${p.color}1f`, borderColor: `${p.color}88` }}>
              <span className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2" style={{ background: p.color }} />{tr(p.label)}
            </li>
          ))}
        </ul>
      </div>
      <Down />
      <div className="flex min-h-0 flex-col items-center justify-center gap-2 lg:flex-row lg:gap-6">
        <div className="shrink-0">
          <Cap>{tr('2 · Video concepts')}</Cap>
          <ul className="mt-1.5 flex justify-center gap-2 sm:gap-2.5">
            {concepts.map((c, i) => (
              <li key={c.id} className="ugc-pop" style={delay(700 + i * 160)}>
                <Clip variant={c.who} color={c.color} play className="h-[6.4rem] sm:h-[8.2rem] lg:h-[12.6rem]"><Caption color={c.color} /></Clip>
              </li>
            ))}
          </ul>
        </div>
        <svg viewBox="0 0 32 16" className="cs-fade-up hidden h-4 w-8 shrink-0 text-lime lg:block" fill="none" aria-hidden="true" style={delay(1500)}><path d="M1 8h26M21 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div className="cs-fade-up block lg:hidden" style={delay(1500)}><Down /></div>
        <div className="w-full max-w-[17rem] shrink-0 sm:max-w-[22rem] lg:w-[16.5rem]">
          <Cap>{tr('3 · Content calendar')}</Cap>
          <div className="mt-1.5 rounded-2xl border border-lime/40 bg-surface-2 p-2 sm:p-2.5" style={{ boxShadow: '0 0 40px -18px rgba(213,255,64,0.45)' }}>
            <div className="mb-1 grid grid-cols-5 gap-1 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{['M', 'T', 'W', 'T', 'F'].map((d, i) => <span key={`${d}${i}`}>{dayLabel(currentLocale(), d, i)}</span>)}</div>
            {slots.map((row, r) => (
              <div key={r} className="mb-1 grid grid-cols-5 gap-1 last:mb-0">
                {row.map((idx, c) => {
                  if (idx === null) return <span key={c} className="h-7 rounded-md border border-dashed border-white/10 sm:h-8 lg:h-11" />
                  const k = concepts[idx]
                  const d = 1700 + n++ * 150
                  return (
                    <span key={c} className="org-drop relative block h-7 overflow-hidden rounded-md border sm:h-8 lg:h-11" style={{ ...delay(d), borderColor: `${k.color}cc` }}>
                      <Avatar variant={k.who} className="absolute inset-0 h-full w-full" pos="50% 25%" />
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1" style={{ background: k.color }} />
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* STATE 2: creator footage is edited, captioned and finished: three finished vertical videos are the dominant element */
function SceneProduce() {
  const edits = [
    ['Cut', <><circle cx="6" cy="7" r="2.4" /><circle cx="6" cy="17" r="2.4" /><path d="M8 8.5L20 16M8 15.5L20 8" /></>],
    ['Captions', <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M8 11h3M8 15h6M14 11h2" /></>],
    ['Graphics', <path d="M12 3l2.2 5.3L20 9l-4.3 3.9L17 19l-5-3-5 3 1.3-6.1L4 9l5.8-.7z" />],
  ]
  return (
    <div className="flex h-full w-full items-center justify-center gap-1 px-1 sm:gap-5 sm:px-0">
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <Clip variant={2} color="#6b7280" className="ugc-pop h-[8.4rem] sm:h-[15rem]">
          <span aria-hidden="true" className="absolute inset-0" style={{ background: 'rgba(24,24,28,0.35)', mixBlendMode: 'saturation' }} />
          <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-ink"><span className="ugc-blink h-1.5 w-1.5 rounded-full bg-coral" />{tr('Rec')}</span>
          <span aria-hidden="true" className="absolute inset-x-0 top-1/3 h-px bg-white/20" /><span aria-hidden="true" className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
          <span aria-hidden="true" className="absolute inset-y-0 left-1/3 w-px bg-white/20" /><span aria-hidden="true" className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
        </Clip>
        <Cap>{tr('Footage')}</Cap>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2 sm:gap-3">
        <svg viewBox="0 0 32 16" className="cs-fade-up h-3.5 w-6 text-lime sm:h-4 sm:w-8" fill="none" aria-hidden="true" style={delay(800)}><path d="M1 8h26M21 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <ul className="flex flex-col gap-1.5 sm:gap-2">
          {edits.map(([l, icon], i) => (
            <li key={l} className="cs-fade-up flex items-center gap-1.5 rounded-lg border border-lime/30 bg-lime/[0.07] p-1 sm:rounded-xl sm:px-2.5 sm:py-1.5" style={delay(1000 + i * 420)}>
              <Icon className="h-4 w-4 shrink-0 text-lime sm:h-4 sm:w-4">{icon}</Icon>
              <span className="hidden text-[11px] font-semibold text-ink sm:inline">{tr(l)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <div className="flex items-end justify-center">
          <Clip variant={3} color={PILLARS[1].color} className="org-drop -mr-7 hidden h-[10.5rem] sm:-mr-9 sm:block sm:h-[15.5rem]" ><Caption color={PILLARS[1].color} /></Clip>
          <Clip variant={2} color="#d5ff40" play className="org-drop relative z-10 h-[10.8rem] sm:h-[19.5rem]">
            <span aria-hidden="true" className="absolute inset-x-2 top-1.5 flex h-1 overflow-hidden rounded-full bg-white/25"><span className="block h-full w-2/3 rounded-full bg-lime" /></span>
            <span className="absolute inset-x-[9%] top-[11%] rounded-md bg-lime px-1 py-1 text-center"><span className="mx-auto block h-1.5 w-4/5 rounded-full bg-canvas/80" /><span className="mx-auto mt-1 block h-1.5 w-3/5 rounded-full bg-canvas/80" /></span>
            <Caption color="#d5ff40" />
          </Clip>
          <Clip variant={1} color={PILLARS[0].color} className="org-drop -ml-6 h-[8.8rem] sm:-ml-9 sm:h-[15.5rem]"><Caption color={PILLARS[0].color} /></Clip>
        </div>
        <span className="cs-fade-up inline-flex items-center gap-1 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-lime" style={delay(2400)}>
          <Icon className="h-2.5 w-2.5"><path d="M4 12.5l5 5L20 6" /></Icon>{tr('Finished videos')}</span>
      </div>
    </div>
  )
}

/* STATE 3: finished videos drop into the publishing calendar, then a simple review of what the platforms report feeds the next plan. Metric names only: no numbers, bars or trends. */
function ScenePublishLearn() {
  const cal = [['M', 'educational', 'IG'], ['T', null], ['W', 'entertaining', 'TT'], ['T', 'product', 'FB'], ['F', 'founder', 'IG']]
  const metrics = ['Reach', 'Watch time', 'Engagement']
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3 sm:gap-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <Cap>{tr('Finished videos → publishing calendar')}</Cap>
          <span className="cs-fade-up inline-flex shrink-0 items-center gap-1 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-lime" style={delay(1900)}>
            <Icon className="h-3 w-3"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>{tr('Scheduled')}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {cal.map(([d, id, plat], i) => {
            const p = PILLARS.find((x) => x.id === id)
            return (
              <div key={`${d}${i}`} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{dayLabel(currentLocale(), d, i)}</span>
                {p
                  ? <Clip variant={PEOPLE[p.id]} color={p.color} className="org-drop h-[6.6rem] sm:h-[11rem] lg:h-[14rem]"><Caption color={p.color} /></Clip>
                  : <span className="block aspect-[9/16] h-[6.6rem] rounded-xl border border-dashed border-white/10 sm:h-[11rem] lg:h-[14rem]" />}
                {plat ? <span className="cs-fade-up rounded px-1 text-[8px] font-bold tracking-[0.06em] text-ink-muted ring-1 ring-white/15" style={delay(900 + i * 200)}>{plat}</span> : <span className="h-3" />}
              </div>
            )
          })}
        </div>
      </div>
      <div className="cs-fade-up flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-hairline-strong bg-surface-2 px-3 py-2.5 sm:px-4 sm:py-3" style={delay(2200)}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          <Cap>{tr('Review')}</Cap>
          {metrics.map((m) => (
            <span key={m} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted"><span className="h-1.5 w-1.5 rounded-full bg-violet" />{tr(m)}</span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 text-lime">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0113.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 01-13.7 5.6L4 15.3M4 20v-4.7h4.7" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{tr('Next plan')}</span>
        </span>
      </div>
    </div>
  )
}

const SCENES = [ScenePlan, SceneProduce, ScenePublishLearn]

export default function ContentSystem() {
  const { eyebrow, title, steps, note } = localizeConfig(CONTENT, currentLocale())
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
        {currentLocale() === 'es' && <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">{ES_SECTION_INTROS['organic-content-system']}</p>}
      </div>

      <Flow step={step} />

      <div aria-hidden="true" className="relative mx-auto mt-5 h-[27rem] max-w-4xl overflow-hidden rounded-2xl border border-hairline bg-canvas/50 px-3 py-3 sm:h-[28rem] sm:px-6 lg:h-[29rem]">
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
              <button type="button" onClick={() => setRunning(false)} className="min-h-[44px] rounded-full px-3 py-2 text-[13px] font-medium text-ink-muted underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">{tr('Pause')}</button>
            </li>
          )}
        </ol>
        <p className="mt-4 text-[13px] text-ink-muted">{note}</p>
      </div>
    </div>
  )
}
