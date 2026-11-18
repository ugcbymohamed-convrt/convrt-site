import { useEffect, useRef, useState } from 'react'
import { SPRINT, SPRINT_PLUS, TURNAROUND, FORMATS, REVISIONS } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { Section, Head, Reveal } from './shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'
import TestingDiagram from './TestingDiagram.jsx'

/* SECTION 3: how we create and test UGC ads. Four stages (the published eight steps, grouped), each with a short explanation that is
   always in the page text, and an animated visual that changes with the active stage. The stages advance once, by themselves, when
   the section is on screen (never for visitors who prefer reduced motion, never after they choose a stage, and with a Pause
   button), then stay where they are. The interactive testing diagram follows (TestingDiagram.jsx).
   Facts: the stage copy maps to PRODUCTION_PROCESS in src/seo/businessKnowledge.js; turnaround, revisions and formats are read from there. */

const STAGE_MS = 6500

const STAGES = [
  {
    id: 'research',
    title: 'Research & Concepts',
    text: 'We study your product, audience and category, then develop genuinely different creative concepts, each with its own hooks.',
    chips: ['Brand and product discovery', 'Audience and ad research', 'Concepts and hooks'],
  },
  {
    id: 'creators',
    title: 'Creators & Scripts',
    text: 'We recommend the right creator, share relevant work samples, and write a complete script for every concept. You approve concepts and scripts before anything is filmed.',
    chips: ['Creator selection', 'Script development', 'Your approval'],
  },
  {
    id: 'filming',
    title: 'Filming & Editing',
    text: 'Creators film natively for each format. We edit, caption and finish every video, and each project goes through our internal creative quality review.',
    chips: ['Native filming', 'Editing and captions', 'Quality review'],
  },
  {
    id: 'delivery',
    title: 'Delivery & Creative Testing',
    text: `You receive organized, platform-ready ad versions, with ${REVISIONS.roundsPerConcept} rounds of revisions per concept and guidance on what to test next.`,
    chips: ['Finished ad versions', 'Revisions included', 'Testing guidance'],
  },
]

/* ── stage visuals (decorative: the text beside them carries the meaning) ── */
const Skel = ({ w = 'w-full', className = '' }) => <span className={`block h-1.5 rounded-full bg-white/15 ${w} ${className}`} />
const delay = (ms) => ({ animationDelay: `${ms}ms` })

function VisualResearch() {
  return (
    <div className="flex h-full items-center justify-center gap-4 sm:gap-6">
      <div className="ugc-pop flex w-[28%] flex-col items-center gap-2 rounded-2xl border border-hairline-strong bg-surface-2 p-3 text-center">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-lime" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
        <span className="text-xs font-semibold text-ink">Your brand and audience</span>
      </div>
      <svg viewBox="0 0 24 12" className="h-3 w-6 shrink-0 text-ink-muted" fill="none" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <ul className="grid flex-1 grid-cols-1 gap-2">
        {Array.from({ length: SPRINT.concepts }, (_, i) => (
          <li key={i} className="cs-fade-up flex items-center gap-2.5 rounded-xl border border-hairline bg-canvas/50 px-3 py-2" style={delay(150 + i * 110)}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ConceptAccents[i] }} />
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Concept {i + 1}</span>
            <Skel w="w-1/3" className="ml-auto max-sm:hidden" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function VisualCreators() {
  return (
    <div className="flex h-full items-center justify-center gap-3 sm:gap-5">
      <div className="ugc-pop w-[26%] rounded-2xl border border-hairline-strong bg-surface-2 p-3">
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-[11px]" style={{ color: ConceptAccents[0] }}>Concept 2</span>
        <Skel className="mt-2" /><Skel w="w-2/3" className="mt-1.5" />
      </div>
      <svg viewBox="0 0 24 12" className="h-3 w-5 shrink-0 text-ink-muted" fill="none" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="cs-fade-up flex w-[24%] flex-col items-center gap-1.5 rounded-2xl border border-hairline-strong bg-surface-2 p-3" style={delay(250)}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-violet/40 bg-violet/15 text-[#c4b5fd]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></svg>
        </span>
        <span className="text-[11px] font-semibold text-ink">Creator</span>
      </div>
      <svg viewBox="0 0 24 12" className="h-3 w-5 shrink-0 text-ink-muted" fill="none" aria-hidden="true"><path d="M1 6h20M16 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <div className="cs-fade-up relative w-[30%] rounded-2xl border border-hairline-strong bg-surface-2 p-3" style={delay(500)}>
        <span className="inline-block rounded-md bg-lime px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-canvas">Hook</span>
        <Skel className="mt-2" /><Skel w="w-5/6" className="mt-1.5" /><Skel w="w-2/3" className="mt-1.5" /><Skel w="w-3/4" className="mt-1.5" />
        <span className="ugc-pop absolute right-1 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-lime text-canvas" style={delay(900)}>
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </div>
  )
}

function VisualFilming() {
  const tracks = [['Footage', 'w-full', '#8b5cf6'], ['Edit', 'w-4/5', '#d5ff40'], ['Captions', 'w-3/5', '#ff6a4d'], ['B-roll', 'w-2/5', '#ffb547']]
  return (
    <div className="flex h-full items-center justify-center gap-5">
      <div className="ugc-pop relative aspect-[9/16] h-[88%] max-h-[250px] overflow-hidden rounded-2xl border border-lime/40 bg-surface-2">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 50% 20%, rgba(139,92,246,0.45), transparent 70%)' }} />
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />Rec</span>
        <span className="absolute inset-x-2.5 bottom-3 rounded-md bg-black/55 px-2 py-1 text-center text-[10px] font-semibold text-ink">Captions</span>
      </div>
      <div className="flex-1">
        <ul className="space-y-2.5">
          {tracks.map(([label, w, color], i) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="w-16 shrink-0 text-[11px] font-semibold text-ink-muted">{label}</span>
              <span className="block h-2.5 flex-1 rounded-full bg-white/[0.06]">
                <span className={`ugc-bar block h-full rounded-full ${w}`} style={{ background: color, ...delay(200 + i * 160) }} />
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex flex-wrap gap-1.5">
          {['9:16', ...FORMATS.included.map((f) => f.replace(/ reframing$/, '').replace(/^(Square|Portrait) /, ''))].map((f) => (
            <span key={f} className="rounded-full border border-hairline-strong bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-muted">{f}</span>
          ))}
        </p>
      </div>
    </div>
  )
}

function VisualDelivery() {
  return (
    <div className="flex h-full items-center justify-center gap-5">
      <ul className="grid flex-1 grid-cols-1 gap-2">
        {Array.from({ length: SPRINT.concepts }, (_, i) => (
          <li key={i} className="cs-fade-up flex items-center gap-2 rounded-xl border border-hairline bg-canvas/50 px-3 py-1.5" style={delay(100 + i * 100)}>
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ConceptAccents[i] }} />
            <span className="text-[11px] font-semibold text-ink">C{i + 1}</span>
            {['V1', 'V2'].map((v) => (
              <span key={v} className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-ink-muted">{v}</span>
            ))}
            <svg viewBox="0 0 16 16" className="ml-auto h-3.5 w-3.5 text-lime" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </li>
        ))}
      </ul>
      <div className="ugc-pop hidden w-[34%] rounded-2xl border border-lime/30 bg-lime/[0.05] p-3.5 sm:block" style={delay(650)}>
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-lime" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></svg>
        <p className="mt-2 text-xs font-semibold text-ink">What to test next</p>
        <Skel className="mt-2" /><Skel w="w-3/4" className="mt-1.5" />
      </div>
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

  /* One pass through the stages, then it stops. Starts only once, while visible, and never for reduced motion or after a choice. */
  useEffect(() => { if (autoplay && inView && !touched && !done.current) setRunning(true) }, [autoplay, inView, touched])
  useEffect(() => {
    if (!running || !inView) return undefined
    const t = window.setTimeout(() => {
      if (active >= STAGES.length - 1) { done.current = true; setRunning(false) }
      else setActive((a) => a + 1)
    }, STAGE_MS)
    return () => window.clearTimeout(t)
  }, [running, inView, active])

  const choose = (i) => { setTouched(true); setRunning(false); setActive(i) }
  const Visual = VISUALS[active]

  return (
    <Section id="how-it-works" label="ugc-process-heading" glow>
      <Reveal>
        <Head
          id="ugc-process-heading"
          eyebrow="How it works"
          title="How we create and test UGC ads."
          intro="Four stages, with your approval before anything is filmed."
        />
      </Reveal>

      <Reveal className="mt-8 md:mt-10">
        <div ref={rootRef} className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-8">
          {/* desktop: the visual sits beside the list. Phones get the same visual inside the active stage (below), next to what was tapped. */}
          <div className="hidden lg:order-2 lg:col-span-7 lg:block">
            <div
              key={STAGES[active].id}
              aria-hidden="true"
              className="pricing-panel-in relative h-[300px] overflow-hidden rounded-3xl border border-hairline-strong bg-surface-1 p-5 sm:h-[330px] sm:p-7"
            >
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
                      {/* inactive stages stay in the page text (collapsed, out of the tab order) so every explanation is crawlable */}
                      <div
                        className="grid motion-reduce:transition-none"
                        style={{
                          gridTemplateRows: on ? '1fr' : '0fr',
                          visibility: on ? 'visible' : 'hidden',
                          transition: `grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear ${on ? '0s' : '0.4s'}`,
                        }}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <p className="mt-1.5 pl-[2.1rem] text-[15px] leading-relaxed text-ink-muted">{s.text}</p>
                          <ul className="mt-2.5 flex flex-wrap gap-1.5 pl-[2.1rem]">
                            {s.chips.map((c) => (
                              <li key={c} className="rounded-full border border-hairline bg-canvas/50 px-2.5 py-1 text-xs font-medium text-ink-muted">{c}</li>
                            ))}
                          </ul>
                          {on && (
                            <div key={`m-${s.id}`} aria-hidden="true" className="pricing-panel-in relative mt-4 h-[230px] overflow-hidden rounded-2xl border border-hairline bg-canvas/50 p-4 lg:hidden">
                              <Visual />
                            </div>
                          )}
                        </div>
                      </div>
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
              <button
                type="button"
                onClick={() => setRunning(false)}
                className="mt-3 rounded-full border border-hairline px-4 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
              >
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
