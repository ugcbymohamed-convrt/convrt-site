import { Avatar, delay } from '../ugc/illustrations.jsx'
import { LIME, VIOLET, CORAL, Skel, Icon } from '../scenes/sceneKit.jsx'
import { FormatStage } from '../spokesperson/DeliveryStyles.jsx'
import { SAAS_FORMAT_STEPS as CONTENT } from '../../content/saasPage.js'
import { AppWindow, AppUi } from './SaasScenes.jsx'

/* "One product. Different ways to bring it to life." The SaaS counterpart of the UGC creative-testing diagram and the Spokesperson formats visual, with the SAME interaction
   system (FormatStage in src/components/spokesperson/DeliveryStyles.jsx, itself modelled on src/components/ugc/TestingDiagram.jsx): one scene on a stage at a time, a live
   caption, one button per state, a one-time pass through the states when it scrolls into view (never for reduced-motion or data-saver visitors, with a Pause button), and
   buttons that always work.

   The content is different on purpose: three ways to communicate a software product's value, not three variations of one ad.
     1  Product Explainer     a clean software interface beside an animated value-proposition panel, with feature callouts
     2  Product Demonstration a realistic workflow: select a feature, perform an action, highlight the benefit
     3  SaaS Advertising      a presenter introduces a customer problem, a software demonstration follows, then a call to action
   No counts, prices, deliverables or "every package includes all three" claim: the note under the stage says scope depends on the approved brief. */

const WOMAN = 2

const Chip = ({ children, lime = false }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${lime ? 'bg-lime text-canvas' : 'border border-hairline bg-surface-2 font-medium text-ink-muted'}`}>{children}</span>
)

/* STATE 1: the product beside a motion-graphic value proposition with feature callouts */
function SceneExplainer() {
  const callouts = [['What it does', VIOLET, 700], ['Who it is for', LIME, 1100], ['Why it matters', CORAL, 1500]]
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="ugc-pop relative grid w-full max-w-xl grid-cols-[1.25fr_1fr] items-stretch gap-2.5 sm:gap-3">
        <AppWindow className="min-w-0"><AppUi ring={[0, 1]} tag="New" stagger={600} rows={2} /></AppWindow>
        <div className="flex min-w-0 flex-col justify-center gap-2 rounded-2xl border border-lime/30 bg-surface-2 p-2.5 sm:p-3" style={{ boxShadow: '0 0 40px -20px rgba(213,255,64,0.5)' }}>
          <span className="cs-fade-up inline-flex w-fit items-center gap-1 rounded-md bg-lime px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-canvas" style={delay(400)}>Value proposition</span>
          <div className="cs-fade-up" style={delay(550)}><Skel className="!h-2 !bg-white/80" w="w-full" /><Skel className="mt-1.5 !h-2 !bg-white/50" w="w-3/4" /></div>
          <ul className="mt-0.5 space-y-1.5">
            {callouts.map(([l, c, d]) => (
              <li key={l} className="cs-fade-up flex items-center gap-1.5" style={delay(d)}>
                <span className="h-px w-3 shrink-0 sm:w-5" style={{ background: c }} />
                <span className="rounded px-1.5 py-px text-[10px] font-bold leading-tight sm:text-[11px]" style={{ background: `${c}26`, color: c }}>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="cs-fade-up flex flex-wrap items-center justify-center gap-1.5" style={delay(1700)}>
        <li><Chip lime>Motion graphics</Chip></li><li><Chip>Feature callouts</Chip></li><li><Chip>Short on-screen labels</Chip></li>
      </ul>
    </div>
  )
}

/* STATE 2: a workflow in the product: 1 select a feature, 2 act, 3 the benefit is highlighted */
function SceneDemo() {
  const steps = [['Select a feature', 500], ['Demonstrate an action', 1300], ['Highlight the benefit', 2100]]
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="ugc-pop relative w-full max-w-xl">
        <AppWindow>
          <div className="grid grid-cols-[1.9rem_1fr] gap-2.5 p-2.5 sm:grid-cols-[2.6rem_1fr] sm:gap-3 sm:p-3">
            {/* 1  the sidebar item is picked */}
            <div className="flex flex-col gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`relative block h-4 rounded-md sm:h-5 ${i === 1 ? 'ugc-ring bg-lime/60' : 'bg-white/10'}`} />
              ))}
            </div>
            <div className="relative min-w-0 pr-1">
              <Skel w="w-1/3" className="!bg-white/30" />
              {/* 2  a form is filled and submitted */}
              <div className="mt-2.5 space-y-1.5">
                {['w-full', 'w-4/5'].map((w, i) => (
                  <div key={w} className="rounded-md border border-white/10 bg-canvas/40 p-1.5"><div className="ugc-bar h-1.5 rounded-full bg-violet/60" style={{ width: i ? '55%' : '80%', animationDuration: '0.8s', ...delay(1300 + i * 250) }} /></div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="relative inline-flex">
                  <span className="ugc-pop inline-flex h-6 items-center rounded-full bg-lime px-3 text-[9px] font-bold text-canvas sm:text-[10px]" style={delay(1700)}>Run</span>
                  <span aria-hidden="true" className="ugc-pop absolute -inset-1.5 rounded-full border-2 border-lime/70" style={delay(1800)} />
                </span>
              </div>
              {/* 3  the result appears */}
              <div className="ugc-pop mt-2.5 flex items-center gap-2 rounded-lg border border-lime/60 bg-lime/[0.1] px-2 py-1.5" style={delay(2200)}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-canvas"><Icon className="h-3 w-3"><path d="M4 12.5l5 5L20 6" /></Icon></span>
                <span className="min-w-0 flex-1"><Skel w="w-3/4" className="!bg-lime/70" /><Skel w="w-1/2" className="mt-1 !bg-lime/40" /></span>
              </div>
            </div>
          </div>
        </AppWindow>
      </div>
      <ol className="flex flex-wrap items-center justify-center gap-1.5">
        {steps.map(([l, d], i) => (
          <li key={l} className="cs-fade-up" style={delay(d)}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/[0.06] px-2.5 py-1 text-[10px] font-semibold text-ink">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[9px] font-bold text-canvas">{i + 1}</span>{l}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* STATE 3: a vertical ad: a presenter opens on the problem, the product answers it, a call to action closes */
function SceneAd() {
  const beats = [['Customer problem', CORAL, 500], ['Software demonstration', VIOLET, 1200], ['Clear call to action', LIME, 1900]]
  return (
    <div className="flex h-full w-full items-center justify-center gap-4 sm:gap-8">
      <div className="ugc-pop relative aspect-[9/16] h-full max-h-[19rem] overflow-hidden rounded-[1.1rem] border border-white/15 bg-surface-2" style={{ boxShadow: '0 0 50px -18px rgba(139,92,246,0.7)' }}>
        <Avatar variant={WOMAN} className="absolute inset-0 h-full w-full" pos="50% 22%" />
        <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 46%, rgba(0,0,0,0.78) 100%)' }} />
        <span className="cs-fade-up absolute inset-x-[9%] top-[8%] rounded-md bg-coral px-1.5 py-1.5 text-center" style={delay(500)}><span className="mx-auto block h-1.5 w-4/5 rounded-full bg-canvas/80" /><span className="mx-auto mt-1 block h-1.5 w-3/5 rounded-full bg-canvas/80" /></span>
        {/* the software answers the problem */}
        <span className="ugc-pop absolute inset-x-[7%] bottom-[19%] overflow-hidden rounded-lg border border-white/25 bg-surface-2/95" style={delay(1200)}>
          <AppUi rows={0} mini ring={[1]} />
        </span>
        <span className="ugc-pop absolute inset-x-[12%] bottom-[5%] flex h-4 items-center justify-center rounded-full bg-lime" style={delay(1900)}><span className="h-1 w-1/2 rounded-full bg-canvas/70" /></span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {beats.map(([l, c, d], i) => (
          <li key={l} className="cs-fade-up flex items-center gap-2" style={delay(d)}>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-canvas" style={{ background: c }}>{i + 1}</span>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: `${c}26`, color: c }}>{l}</span>
          </li>
        ))}
        <li className="cs-fade-up mt-1" style={delay(2200)}><Chip>Short-form, for paid advertising</Chip></li>
      </ul>
    </div>
  )
}

const SCENES = [SceneExplainer, SceneDemo, SceneAd]

export default function SaasFormats() {
  return <FormatStage content={CONTENT} scenes={SCENES} id="saas-formats" />
}
