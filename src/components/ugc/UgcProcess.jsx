import { useEffect, useRef, useState } from 'react'
import { SPRINT, SPRINT_PLUS, TURNAROUND, FORMATS } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { Section, Head, Reveal } from './shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'
import TestingDiagram from './TestingDiagram.jsx'

/* SECTION 3: how we create and test UGC ads. Four stages. All four titles and one-line explanations are always visible, so the
   process reads in seconds without touching anything; selecting a stage (mouse, touch or keyboard) swaps the illustration beside it.
   The stages also advance once, by themselves, when the section is on screen (never for reduced-motion visitors, never after the
   visitor chooses, with a Pause button), then stay put. Detail that the FAQ already carries (revisions, usage rights, formats,
   languages) is not repeated here. The interactive testing illustration follows (TestingDiagram.jsx). */

const STAGE_MS = 6000

const STAGES = [
  { id: 'research', title: 'Research & Concepts', text: 'We study your brand and audience, then develop distinct concepts, each with its own hooks.' },
  { id: 'creators', title: 'Creators & Scripts', text: 'We match the right creator and write every script. You approve both before anything is filmed.' },
  { id: 'filming', title: 'Filming & Editing', text: 'Creators film natively for each format. We edit, caption and quality-check every video.' },
  { id: 'delivery', title: 'Delivery & Creative Testing', text: 'You receive finished, platform-ready ad versions and guidance on what to test next.' },
]

/* ── stage illustrations: small CSS/SVG scenes, decorative (the text beside them carries the meaning) ── */
const Skel = ({ w = 'w-full', className = '' }) => <span className={`block h-1.5 rounded-full bg-white/15 ${w} ${className}`} />
const delay = (ms) => ({ animationDelay: `${ms}ms` })
const Arrow = () => (
  <svg viewBox="0 0 24 12" className="h-3 w-6 shrink-0 text-ink-muted" fill="none" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const Check = ({ className = '' }) => (
  <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-lime text-canvas ${className}`}>
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
)
const Person = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></svg>
)

/* a brief becomes several concepts */
function VisualResearch() {
  return (
    <div className="flex h-full items-center justify-center gap-4 sm:gap-6">
      <div className="ugc-pop flex w-[28%] flex-col gap-2 rounded-2xl border border-hairline-strong bg-surface-2 p-3">
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em] text-lime">Brief</span>
        <Skel /><Skel w="w-5/6" /><Skel w="w-2/3" />
      </div>
      <Arrow />
      <ul className="grid flex-1 grid-cols-1 gap-2">
        {Array.from({ length: SPRINT.concepts }, (_, i) => (
          <li key={i} className="cs-fade-up flex items-center gap-2.5 rounded-xl border border-hairline bg-canvas/50 px-3 py-2" style={delay(200 + i * 110)}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ConceptAccents[i] }} />
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">Concept {i + 1}</span>
            <Skel w="w-1/3" className="ml-auto max-sm:hidden" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* choose the right creator, then approve the script */
function VisualCreators() {
  const tones = ['#8b5cf6', '#d5ff40', '#ff6a4d']
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4 sm:gap-6">
        {tones.map((t, i) => (
          <div key={t} className="cs-fade-up relative flex flex-col items-center gap-1.5" style={delay(i * 120)}>
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 bg-surface-2 sm:h-16 sm:w-16" style={{ color: t, borderColor: i === 1 ? '#d5ff40' : '#34343a' }}>
              <Person className="h-7 w-7" />
            </span>
            {i === 1 && <Check className="ugc-pop absolute -right-1 -top-1" />}
            <span className="text-[11px] font-medium text-ink-muted">Creator {i + 1}</span>
          </div>
        ))}
      </div>
      <div className="cs-fade-up relative w-[78%] max-w-[18rem] rounded-2xl border border-hairline-strong bg-surface-2 p-3.5" style={delay(700)}>
        <span className="inline-block rounded-md bg-lime px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-canvas">Hook</span>
        <Skel className="mt-2.5" /><Skel w="w-5/6" className="mt-1.5" /><Skel w="w-3/5" className="mt-1.5" />
        <span className="ugc-pop absolute -right-2 -top-2 rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-canvas" style={delay(1200)}>Approved</span>
      </div>
    </div>
  )
}

/* shooting becomes editing */
function VisualFilming() {
  const tracks = [['Footage', 'w-full', '#8b5cf6'], ['Edit', 'w-4/5', '#d5ff40'], ['Captions', 'w-3/5', '#ff6a4d']]
  return (
    <div className="flex h-full items-center justify-center gap-4 sm:gap-6">
      <div className="ugc-pop relative aspect-[9/16] h-[88%] max-h-[250px] overflow-hidden rounded-2xl border border-hairline-strong bg-surface-2">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 50% 20%, rgba(139,92,246,0.45), transparent 70%)' }} />
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink"><span className="h-1.5 w-1.5 rounded-full bg-coral" />Rec</span>
      </div>
      <Arrow />
      <div className="min-w-0 flex-1">
        <ul className="space-y-2.5">
          {tracks.map(([label, w, color], i) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="w-[4.2rem] shrink-0 text-[11px] font-semibold text-ink-muted">{label}</span>
              <span className="block h-2.5 flex-1 rounded-full bg-white/[0.06]">
                <span className={`ugc-bar block h-full rounded-full ${w}`} style={{ background: color, ...delay(300 + i * 220) }} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3.5 flex flex-wrap gap-1.5">
          {['9:16', ...FORMATS.included.map((f) => f.replace(/ reframing$/, '').replace(/^(Square|Portrait) /, ''))].map((f, i) => (
            <span key={f} className="cs-fade-up rounded-full border border-hairline-strong bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-muted" style={delay(1000 + i * 90)}>{f}</span>
          ))}
        </p>
      </div>
    </div>
  )
}

/* two finished versions, compared */
function VisualDelivery() {
  return (
    <div className="flex h-full items-center justify-center gap-4 sm:gap-6">
      {[['Version A', 'Hook A', 0, '#8b5cf6'], ['Version B', 'Hook B', 1, '#d5ff40']].map(([v, h, i, c], idx) => (
        <div key={v} className="flex items-center gap-4 sm:gap-6">
          {idx === 1 && <span className="cs-fade-up text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted" style={delay(450)}>vs</span>}
          <div className="cs-fade-up flex flex-col items-center gap-2" style={delay(i * 200)}>
            <div className="relative flex aspect-[9/14] w-[6.4rem] flex-col justify-between overflow-hidden rounded-2xl border border-hairline-strong bg-surface-2 p-2.5 sm:w-[7.4rem]" style={{ boxShadow: `0 0 36px -14px ${c}` }}>
              <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(100% 60% at 50% 0%, ${c}66, transparent 75%)` }} />
              <span className="relative text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{v}</span>
              <span className="relative rounded-md bg-black/35 px-2 py-1 text-center text-[11px] font-semibold text-ink">{h}</span>
            </div>
            <Check className="ugc-pop" />
          </div>
        </div>
      ))}
    </div>
  )
}

const VISUALS = [VisualResearch, VisualCreators, VisualFilming, VisualDelivery]

export default function UgcProcess() {
  const [active, setActive] = useState(0)
  const [running, setRunning] = useState(false)
  const [inView, setInView] = useState(false)
  const [touched, setTouched] = useState(false)
  const rootRef = useRef(null)
  const done = useRef(false)
  const autoplay = useAutoplayAllowed()

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => { if (autoplay && inView && !touched && !done.current) setRunning(true) }, [autoplay, inView, touched])
  useEffect(() => {
    if (!running || !inView) return undefined
    const t = window.setTimeout(() => {
      if (active >= STAGES.length - 1) { done.current = true; setRunning(false) } else setActive((a) => a + 1)
    }, STAGE_MS)
    return () => window.clearTimeout(t)
  }, [running, inView, active])

  const choose = (i) => { setTouched(true); setRunning(false); setActive(i) }
  const Visual = VISUALS[active]

  return (
    <Section id="how-it-works" label="ugc-process-heading" glow>
      <Reveal>
        <Head id="ugc-process-heading" eyebrow="How it works" title="How we create and test UGC ads." intro="Four stages, with your approval before anything is filmed." />
      </Reveal>

      <Reveal className="mt-8 md:mt-10">
        <div ref={rootRef} className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* desktop: the illustration sits beside the list. Phones get it inside the selected stage, next to what was tapped. */}
          <div className="hidden lg:order-2 lg:col-span-7 lg:block">
            <div key={STAGES[active].id} aria-hidden="true" className="pricing-panel-in relative h-[360px] overflow-hidden rounded-3xl border border-hairline-strong bg-surface-1 p-7">
              <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[90px]" />
              <div className="relative h-full"><Visual /></div>
            </div>
          </div>

          <div className="lg:order-1 lg:col-span-5">
            <ol className="space-y-2.5">
              {STAGES.map((s, i) => {
                const on = i === active
                return (
                  <li key={s.id}>
                    {/* the whole card is clickable for pointer users; the heading button is the keyboard and screen-reader control */}
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                    <div
                      onClick={() => choose(i)}
                      className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-colors duration-300 motion-reduce:transition-none ${on ? 'border-lime/40 bg-surface-1' : 'border-hairline bg-surface-1/40 hover:border-hairline-strong'}`}
                    >
                      <h3>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); choose(i) }}
                          aria-current={on ? 'step' : undefined}
                          className="flex w-full items-baseline gap-3 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                        >
                          <span className={`font-display text-sm font-bold tabular-nums ${on ? 'text-lime' : 'text-ink-muted'}`}>{String(i + 1).padStart(2, '0')}</span>
                          <span className="font-display text-lg font-semibold leading-snug tracking-snug text-ink">{s.title}</span>
                        </button>
                      </h3>
                      <p className="mt-1.5 pl-[2.1rem] text-[15px] leading-relaxed text-ink-muted">{s.text}</p>
                      {on && (
                        <div key={`m-${s.id}`} aria-hidden="true" className="pricing-panel-in relative mt-4 h-[230px] overflow-hidden rounded-2xl border border-hairline bg-canvas/50 p-4 lg:hidden">
                          <Visual />
                        </div>
                      )}
                      {on && (
                        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/[0.06]">
                          <span key={`${s.id}-${running}`} className={`block h-full bg-lime ${running ? 'ugc-progress' : ''}`} style={running ? { animationDuration: `${STAGE_MS}ms` } : undefined} />
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
            {running && (
              <button type="button" onClick={() => setRunning(false)} className="mt-3 min-h-[44px] rounded-full border border-hairline px-4 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">
                Pause animation
              </button>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-5 md:mt-6">
        <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">Production turnaround:</span> {SPRINT.turnaroundBusinessDays} business days for the {SPRINT.name} and{' '}
          {SPRINT_PLUS.turnaroundBusinessDays} for {SPRINT_PLUS.name}, counted from the moment you approve concepts and scripts. {TURNAROUND.note}
        </p>
      </Reveal>

      <Reveal className="mt-10 md:mt-12">
        <TestingDiagram />
      </Reveal>
    </Section>
  )
}
