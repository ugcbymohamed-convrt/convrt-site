import { useEffect, useRef, useState } from 'react'
import { Avatar, delay } from '../ugc/illustrations.jsx'
import { useAutoplayAllowed } from '../ugc/creatorVideo.jsx'
import { SPOKESPERSON_STYLES as CONTENT } from '../../content/spokespersonPage.js'
import { VideoFrame } from './SpokespersonScenes.jsx'

/* "One message. Different ways to deliver it." The spokesperson counterpart of the UGC page's creative-testing diagram, with the SAME interaction
   system (src/components/ugc/TestingDiagram.jsx): one scene on a stage at a time, a live caption, one button per state, a one-time pass through the
   states when it scrolls into view (never for reduced-motion or data-saver visitors, with a Pause button), and buttons that always work.

   The content is different on purpose: it shows three kinds of spokesperson production, not variations of one ad.
     1  Product Explanation   a presenter plus a simple product / feature panel
     2  Demonstration         a presenter beside a product or app walkthrough
     3  Promotional Creative  a presenter with a strong opening hook and branded elements, vertical for paid advertising
   No counts, prices, deliverables or "every package includes all three" claim: the note under the stage says scope depends on the package or brief. */

const STEP_MS = 4200
const LIME = '#d5ff40'
const VIOLET = '#8b5cf6'
const CORAL = '#ff6a4d'
const PINK = '#ec4899'
const WOMAN = 2
const MAN = 1
const ALT = 3

const Skel = ({ w = 'w-full', className = '' }) => <span className={`block h-1.5 rounded-full bg-white/15 ${w} ${className}`} />
const Chip = ({ children, lime = false }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${lime ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-2 font-medium text-ink-muted'}`}>{children}</span>
)

/* STATE 1: a presenter explains; a product / feature panel supports what is said */
function SceneExplain() {
  const feats = [['Feature one', VIOLET], ['Feature two', LIME], ['Feature three', CORAL]]
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="grid w-full max-w-xl grid-cols-1 items-center gap-3 sm:grid-cols-[1.15fr_1fr]">
        <VideoFrame variant={MAN} tone={VIOLET} className="ugc-pop mx-auto w-full max-w-[16rem] sm:max-w-none">
          <span className="absolute bottom-2 left-2 flex w-[44%] flex-col gap-1 rounded-md border-l-2 border-lime bg-black/60 px-2 py-1.5"><span className="h-1.5 w-4/5 rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-white/45" /></span>
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-ink">To camera</span>
        </VideoFrame>
        <div className="cs-fade-up rounded-2xl border border-hairline-strong bg-surface-2 p-3" style={delay(500)}>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime/20 text-lime">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5L12 12l8-4.5M12 12v9" /></svg>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink">Your product</span>
          </div>
          <ul className="mt-2.5 space-y-2">
            {feats.map(([f, c], i) => (
              <li key={f} className="cs-fade-up flex items-center gap-2" style={delay(800 + i * 250)}>
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c }} />
                <span className="text-[11px] font-medium text-ink-muted">{f}</span>
                <Skel w="w-1/3" className="ml-auto" />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="cs-fade-up flex flex-wrap items-center justify-center gap-1.5" style={delay(1500)}>
        <li><Chip lime>Presenter explains</Chip></li><li><Chip>Clear, scripted message</Chip></li><li><Chip>Product panel supports it</Chip></li>
      </ul>
    </div>
  )
}

/* STATE 2: a presenter walks through an interface; numbered steps light up one after another */
function SceneDemo() {
  const steps = [1, 2, 3]
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="ugc-pop relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-surface-2">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-coral" /><span className="h-1.5 w-1.5 rounded-full bg-amber" /><span className="h-1.5 w-1.5 rounded-full bg-lime" /><span className="ml-2 h-1.5 w-1/3 rounded-full bg-white/10" /></div>
        <div className="grid grid-cols-[2.2rem_1fr] gap-2.5 p-2.5 sm:grid-cols-[3rem_1fr] sm:gap-3 sm:p-3">
          <div className="flex flex-col gap-2">{[LIME, VIOLET, CORAL, PINK].map((c) => <span key={c} className="h-4 rounded-md sm:h-5" style={{ background: `${c}40` }} />)}</div>
          <div className="relative pr-[3.75rem] sm:pr-[4.5rem]">
            <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: '5.2rem' }}>
              {[40, 62, 48, 80, 58, 92].map((h, i) => (
                <span key={h} className="ugc-bar block flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === 3 ? LIME : 'rgba(139,92,246,0.55)', animationDuration: '0.7s', ...delay(300 + i * 120) }} />
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {steps.map((n, i) => (
                <span key={n} className="cs-fade-up flex items-center gap-1.5 rounded-lg border border-lime/30 bg-lime/[0.06] px-1.5 py-1" style={delay(900 + i * 450)}>
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime text-[9px] font-bold text-canvas">{n}</span><Skel w="w-full" />
                </span>
              ))}
            </div>
            {/* click marker */}
            <span aria-hidden="true" className="ugc-pop absolute right-[14%] top-[38%] h-5 w-5 rounded-full border-2 border-lime bg-lime/20" style={delay(1100)} />
          </div>
        </div>
        {/* the presenter, picture-in-picture */}
        <span className="ugc-pop absolute bottom-2.5 right-2.5 h-14 w-14 overflow-hidden rounded-full border-2 border-lime shadow-[0_0_24px_-6px_rgba(213,255,64,0.6)] sm:h-16 sm:w-16" style={delay(600)}>
          <Avatar variant={WOMAN} className="h-full w-full" pos="50% 20%" />
        </span>
      </div>
      <ul className="cs-fade-up flex flex-wrap items-center justify-center gap-1.5" style={delay(1500)}>
        <li><Chip lime>Presenter walks you through</Chip></li><li><Chip>Product or app on screen</Chip></li><li><Chip>Step by step</Chip></li>
      </ul>
    </div>
  )
}

/* STATE 3: a vertical promotional creative: an opening hook, branded elements and a call to action around the presenter */
function ScenePromo() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 sm:gap-8">
      <div className="ugc-pop relative aspect-[9/16] h-full max-h-[19rem] overflow-hidden rounded-[1.1rem] border border-white/15 bg-surface-2" style={{ boxShadow: '0 0 50px -18px rgba(255,106,77,0.7)' }}>
        <Avatar variant={ALT} className="absolute inset-0 h-full w-full" pos="50% 22%" />
        <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 34%, transparent 58%, rgba(0,0,0,0.7) 100%)' }} />
        <span className="cs-fade-up absolute inset-x-[9%] top-[9%] rounded-md bg-lime px-1.5 py-1.5 text-center" style={delay(500)}><span className="mx-auto block h-1.5 w-4/5 rounded-full bg-canvas/80" /><span className="mx-auto mt-1 block h-1.5 w-3/5 rounded-full bg-canvas/80" /></span>
        <span className="absolute right-2 top-[26%] flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/50 text-[9px] font-bold text-ink">Logo</span>
        <span className="cs-fade-up absolute inset-x-[10%] bottom-[16%] flex flex-col items-center gap-0.5 rounded bg-black/55 px-2 py-1" style={delay(1000)}><span className="h-1 w-full rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-lime" /></span>
        <span className="ugc-pop absolute inset-x-[12%] bottom-[5%] h-4 rounded-full bg-coral" style={delay(1500)} />
      </div>
      <ul className="flex flex-col gap-2.5">
        {[['Opening hook', LIME, 500], ['Branded visuals', VIOLET, 900], ['Call to action', CORAL, 1500]].map(([l, c, d]) => (
          <li key={l} className="cs-fade-up flex items-center gap-2" style={delay(d)}>
            <span className="h-px w-5 sm:w-8" style={{ background: c }} />
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: `${c}26`, color: c }}>{l}</span>
          </li>
        ))}
        <li className="cs-fade-up mt-1" style={delay(1800)}><Chip>Built for paid advertising</Chip></li>
      </ul>
    </div>
  )
}

const SCENES = [SceneExplain, SceneDemo, ScenePromo]

/* The interaction shell, shared with /saas-video-production (src/components/saas/SaasFormats.jsx): `content` is { eyebrow, title, steps, note }, `scenes` one component per step,
   `id` the section's anchor. Spokesperson passes its own below; the markup and behaviour are exactly what they were. */
export function FormatStage({ content, scenes: SCENES, id }) {
  const { eyebrow, title, steps, note } = content
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
    <div ref={rootRef} id={id} className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 md:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{eyebrow}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-snug text-ink md:text-[1.7rem]">{title}</h3>
      </div>

      <div aria-hidden="true" className="relative mx-auto mt-6 h-[26rem] max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-canvas/50 px-3 py-3 sm:h-[23.5rem]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-violet/[0.14] blur-[80px]" />
        <div className="relative h-full"><Scene key={`s${step}`} /></div>
      </div>

      <div className="mx-auto mt-5 max-w-2xl text-center">
        <p aria-live="polite" className="min-h-[3.2rem] text-base leading-relaxed text-ink-muted md:text-lg">
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

export default function DeliveryStyles() {
  return <FormatStage content={CONTENT} scenes={SCENES} id="spokesperson-formats" />
}
