import { Avatar, CheckBadge, delay } from '../ugc/illustrations.jsx'
import { LIME, VIOLET, CORAL, PINK, Skel, Tag, Label, Icon } from '../scenes/sceneKit.jsx'
import { PlayDot } from '../spokesperson/SpokespersonScenes.jsx'

/* The four "How it works" scenes of /saas-video-production, plus the product-interface pieces the SaaS "formats" visual (SaasFormats.jsx) reuses.
   Same system as the UGC, Spokesperson and Organic scenes (src/components/ugc/UgcProcess.jsx): small scenes built from CSS and SVG, aria-hidden (the title and
   sentence beside them carry the meaning), each playing once when its stage is selected, using the site's own animation classes (which are switched off under
   prefers-reduced-motion, leaving the finished picture). The software is a generic, believable workspace drawn from neutral blocks: no product name, no screenshot of a real
   client, no numbers, no metrics, no fake performance dashboard. The people are the owner-supplied portrait photographs (illustrations.jsx), used without names or claims;
   the page says in words that the scenes are illustrative. */

const P = { woman: 2, man: 1, alt: 3 }
const TEAL = '#34c9c0'

/* A browser-style window around a piece of software. */
export const AppWindow = ({ children, className = '', url = true }) => (
  <div className={`overflow-hidden rounded-xl border border-white/15 bg-surface-2 ${className}`}>
    <div className="flex items-center gap-1.5 border-b border-white/10 px-2.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-coral" /><span className="h-1.5 w-1.5 rounded-full bg-amber" /><span className="h-1.5 w-1.5 rounded-full bg-lime" />
      {url && <span className="ml-2 h-1.5 w-1/3 rounded-full bg-white/10" />}
    </div>
    {children}
  </div>
)

const FEATURE_ICONS = [
  <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><path d="M16.5 13v7M13 16.5h7" /></>,
  <><path d="M4 12h4l2-6 4 12 2-6h4" /></>,
  <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
]

/* A generic workspace: a sidebar, a top bar, three feature cards and a short list. `ring` lists the feature cards (0-2) to highlight; `tag` labels a highlighted one. */
export function AppUi({ ring = [], tag, rows = 2, className = '', stagger = 0, mini = false }) {
  const cols = [VIOLET, LIME, TEAL]
  return (
    <div className={mini ? `grid grid-cols-1 gap-1 p-1 ${className}` : `grid grid-cols-[1.7rem_1fr] gap-2 p-2 sm:grid-cols-[2.2rem_1fr] sm:gap-2.5 sm:p-2.5 ${className}`}>
      {!mini && (
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          {[LIME, VIOLET, CORAL, PINK].map((c, i) => <span key={c} className="h-3.5 w-full rounded-md sm:h-4" style={{ background: `${c}${i === 0 ? '66' : '33'}` }} />)}
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2"><Skel w="w-1/3" className="!bg-white/25" /><span className="ml-auto h-3 w-8 rounded-full bg-lime/70" /></div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
          {cols.map((c, i) => {
            const on = ring.includes(i)
            return (
              <div key={c} className={`relative rounded-lg border p-1.5 sm:p-2 ${on ? 'ugc-ring border-lime/70 bg-lime/[0.07]' : 'border-white/10 bg-canvas/40'}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-md sm:h-6 sm:w-6" style={{ background: `${c}2e`, color: c }}><Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5">{FEATURE_ICONS[i]}</Icon></span>
                <Skel className="mt-1.5" w="w-4/5" /><Skel className="mt-1" w="w-3/5" />
                {on && tag && (
                  <span className="ugc-pop absolute -top-2 right-1 rounded-full bg-lime px-1.5 py-px text-[8px] font-bold uppercase tracking-[0.06em] text-canvas sm:text-[9px]" style={delay(stagger + i * 200)}>{tag}</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-2 space-y-1.5">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-white/[0.07] bg-canvas/30 px-1.5 py-1">
              <span className="h-2 w-2 shrink-0 rounded-sm border border-white/30" /><Skel w={i % 2 ? 'w-1/2' : 'w-2/3'} /><span className="ml-auto h-1.5 w-5 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Cursor = ({ className = '', style }) => (
  <svg viewBox="0 0 20 20" className={`ugc-pop pointer-events-none absolute h-5 w-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${className}`} style={style} aria-hidden="true"><path d="M3 2l13 7-5.5 1.5L8 16z" fill="#fff" stroke="#0a0a0b" strokeWidth="1.2" strokeLinejoin="round" /></svg>
)

/* 1  Product discovery: a workspace with two features in focus, and the brief that comes out of it */
export function SceneDiscovery() {
  const rows = [['Product', 'w-full'], ['Audience', 'w-4/5'], ['Problem it solves', 'w-3/5']]
  return (
    <div className="flex h-full items-stretch gap-2.5 sm:gap-3">
      <div className="flex min-w-0 flex-[1.35] flex-col justify-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Your software</p>
        <AppWindow className="ugc-pop"><AppUi ring={[0, 2]} tag="Key" stagger={500} /></AppWindow>
        <p className="cs-fade-up flex items-center gap-1.5 text-[10px] font-medium text-ink-muted" style={delay(900)}><span className="h-2 w-2 rounded-full bg-lime" />Key features in focus</p>
      </div>
      <div aria-hidden="true" className="hidden w-5 shrink-0 items-center sm:flex">
        <svg viewBox="0 0 20 12" className="ugc-draw w-full text-lime" style={delay(700)} fill="none"><path d="M1 6h16M12 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Creative brief</p>
        <div className="cs-fade-up rounded-2xl border border-lime/40 bg-surface-2 p-2.5 sm:p-3" style={{ ...delay(400), boxShadow: '0 0 40px -18px rgba(213,255,64,0.5)' }}>
          <div className="flex items-center gap-1.5 text-lime">
            <Icon className="h-3.5 w-3.5"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></Icon>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em]">The brief</span>
          </div>
          {rows.map(([l, w], i) => (
            <div key={l} className="cs-fade-up mt-2" style={delay(650 + i * 180)}>
              <span className="text-[10px] font-medium text-ink-muted">{l}</span>
              <Skel className="mt-1" w={w} />
            </div>
          ))}
          <div className="ugc-pop mt-2.5 rounded-lg border border-lime/60 bg-lime/[0.12] px-2 py-1.5" style={delay(1500)}>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-lime">Strongest message</span>
            <Skel className="mt-1 !bg-lime/70" w="w-full" /><Skel className="mt-1 !bg-lime/40" w="w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* a tiny 16:9 storyboard frame */
function Frame({ n, label, tone, i, children }) {
  return (
    <li className="cs-fade-up flex min-w-0 flex-col gap-1" style={delay(700 + i * 280)}>
      <div className="relative aspect-video overflow-hidden rounded-md border bg-surface-2" style={{ borderColor: `${tone}aa`, boxShadow: `0 0 20px -12px ${tone}` }}>
        {children}
        <span className="absolute left-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/70 text-[8px] font-bold text-ink">{n}</span>
      </div>
      <span className="truncate text-center text-[10px] font-bold" style={{ color: tone }}>{label}</span>
    </li>
  )
}

/* 2  Concept & script: a script card and a four-scene storyboard */
export function SceneConcept() {
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <Label n="1">We write the script</Label>
        <div className="cs-fade-up mt-2 rounded-2xl border border-hairline-strong bg-surface-2 p-2.5 sm:p-3" style={delay(150)}>
          <div className="flex items-center gap-2.5"><Tag className="min-w-[4.6rem] shrink-0 text-center">Hook</Tag><Skel w="w-4/5" /></div>
          <div className="mt-2 flex items-center gap-2.5"><Tag color={VIOLET} className="min-w-[4.6rem] shrink-0 text-center !text-white">Solution</Tag><Skel w="w-full" /></div>
          <div className="mt-2 flex items-center gap-2.5"><Tag color={CORAL} className="min-w-[4.6rem] shrink-0 text-center">CTA</Tag><Skel w="w-3/5" /></div>
        </div>
      </div>
      <div>
        <Label n="2">And storyboard the scenes</Label>
        <ol className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2.5">
          <Frame n="1" label="Problem" tone={CORAL} i={0}>
            <Avatar variant={P.woman} className="absolute inset-0 h-full w-full" pos="50% 20%" />
            <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
            <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-canvas">?</span>
          </Frame>
          <Frame n="2" label="Solution" tone={VIOLET} i={1}>
            <div className="p-1"><AppUi rows={0} mini /></div>
          </Frame>
          <Frame n="3" label="Key feature" tone={LIME} i={2}>
            <div className="p-1"><AppUi ring={[1]} rows={0} mini /></div>
          </Frame>
          <Frame n="4" label="Call to action" tone={PINK} i={3}>
            <span className="absolute inset-x-[12%] top-[26%] block"><Skel w="w-full" className="!bg-white/70" /><Skel w="w-2/3" className="mx-auto mt-1 !bg-lime/70" /></span>
            <span className="absolute inset-x-[16%] bottom-[16%] h-3 rounded-full bg-lime" />
          </Frame>
        </ol>
      </div>
    </div>
  )
}

/* 3  Production & animation: a screen recording becomes a finished video frame */
export function SceneProduction() {
  const lanes = [
    ['Screen recording', VIOLET, <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></>],
    ['Motion graphics', LIME, <><path d="M5 18c4 0 3-12 7-12s3 12 7 12" /><circle cx="5" cy="18" r="1.4" /><circle cx="19" cy="18" r="1.4" /></>],
    ['Presenter', CORAL, <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></>],
    ['Captions & edit', PINK, <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M8 11h3M8 15h6M14 11h2" /></>],
  ]
  return (
    <div className="flex h-full flex-col justify-between gap-2.5">
      <div className="flex min-h-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Screen recording</p>
          <AppWindow className="ugc-pop" url={false}>
            <AppUi ring={[1]} rows={1} stagger={600} />
          </AppWindow>
          <Cursor className="right-[26%] top-[62%]" style={delay(500)} />
        </div>
        <div aria-hidden="true" className="flex shrink-0 flex-col items-center gap-1 text-lime">
          <svg viewBox="0 0 20 12" className="ugc-draw h-3 w-5" style={delay(900)} fill="none"><path d="M1 6h16M12 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-lime">Finished video</p>
          <div className="cs-fade-up relative aspect-video overflow-hidden rounded-xl border border-lime/60 bg-surface-2" style={{ ...delay(1000), boxShadow: '0 0 34px -12px rgba(213,255,64,0.55)' }}>
            <div className="absolute inset-0 p-1.5"><AppUi ring={[1]} rows={0} mini /></div>
            <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.7) 100%)' }} />
            <span className="cs-fade-up absolute left-1.5 top-1.5 rounded-md bg-lime px-1.5 py-1" style={delay(1500)}><span className="block h-1 w-9 rounded-full bg-canvas/80" /></span>
            <span className="ugc-pop absolute bottom-1.5 left-1.5 h-9 w-9 overflow-hidden rounded-full border-2 border-lime sm:h-11 sm:w-11" style={delay(1800)}>
              <Avatar variant={P.man} className="h-full w-full" pos="50% 20%" />
            </span>
            <span className="cs-fade-up absolute inset-x-[30%] bottom-1.5 flex flex-col items-center gap-0.5 rounded bg-black/60 px-1.5 py-1" style={delay(2100)}><span className="h-1 w-full rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-lime" /></span>
          </div>
        </div>
      </div>
      <ul className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {lanes.map(([label, color, icon], i) => (
          <li key={label} className="cs-fade-up flex flex-col items-center gap-1 rounded-xl border border-hairline bg-canvas/40 px-1 py-1.5 sm:py-2" style={delay(300 + i * 450)}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8" style={{ background: `${color}26`, color }}><Icon>{icon}</Icon></span>
            <span className="text-center text-[9px] font-semibold leading-tight text-ink sm:text-[10px]">{label}</span>
            <CheckBadge className="ugc-pop" size="h-4 w-4" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* 4  Delivery & distribution: one finished video, prepared for five placements */
export function SceneDelivery() {
  const Tile = ({ label, i, span, children }) => (
    <li className={`cs-fade-up flex min-h-0 flex-col gap-1.5 rounded-2xl border border-hairline bg-canvas/40 p-2 ${span}`} style={delay(i * 200)}>
      <div className="flex min-h-0 flex-1 items-center justify-center">{children}</div>
      <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-1">
        <span className="text-[10px] font-semibold leading-tight text-ink sm:truncate sm:text-[11px]">{label}</span>
        <span className="ugc-pop inline-flex shrink-0 items-center gap-1 rounded-full bg-lime/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-lime" style={delay(900 + i * 200)}>
          <Icon className="h-2.5 w-2.5"><path d="M4 12.5l5 5L20 6" /></Icon>Ready
        </span>
      </div>
    </li>
  )
  const Thumb = ({ tone = VIOLET, v = P.woman, className = '' }) => (
    <span className={`relative block aspect-video overflow-hidden rounded-md border bg-surface-2 ${className}`} style={{ borderColor: `${tone}aa` }}>
      <AppUi rows={0} mini />
      <span className="absolute inset-0 flex items-center justify-center bg-black/25"><PlayDot className="h-5 w-5" /></span>
      <span className="absolute bottom-0.5 right-0.5 h-4 w-4 overflow-hidden rounded-full border border-lime"><Avatar variant={v} className="h-full w-full" pos="50% 20%" /></span>
    </span>
  )
  return (
    <ul className="grid h-full grid-cols-6 grid-rows-2 gap-2 sm:gap-2.5">
      <Tile label="Landing page" i={0} span="col-span-2">
        <div className="w-full overflow-hidden rounded-md border border-white/15 bg-surface-2">
          <div className="flex items-center gap-1 border-b border-white/10 px-1 py-0.5"><span className="h-1 w-1 rounded-full bg-coral" /><span className="h-1 w-1 rounded-full bg-amber" /><span className="h-1 w-1 rounded-full bg-lime" /></div>
          <div className="p-1"><Skel w="w-2/3" className="!bg-white/30" /><Thumb className="mt-1" /></div>
        </div>
      </Tile>
      <Tile label="Paid ads" i={1} span="col-span-2">
        <div className="w-full max-w-[7.5rem] overflow-hidden rounded-md border border-white/15 bg-surface-2">
          <div className="flex items-center gap-1 px-1 py-0.5"><span className="h-2.5 w-2.5 rounded-full bg-lime/70" /><Skel w="w-1/2" /><span className="ml-auto text-[7px] font-semibold uppercase tracking-wide text-ink-muted">Ad</span></div>
          <Thumb tone={CORAL} v={P.alt} className="!rounded-none !border-0" />
          <div className="px-1 py-1"><span className="block h-2.5 rounded bg-lime" /></div>
        </div>
      </Tile>
      <Tile label="Product demo" i={2} span="col-span-2">
        <Thumb tone={TEAL} v={P.man} className="w-full max-w-[8.5rem]" />
      </Tile>
      <Tile label="Social media" i={3} span="col-span-3">
        <div className="relative aspect-[9/16] h-full max-h-[5.5rem] overflow-hidden rounded-md border border-white/15 bg-surface-2">
          <Avatar variant={P.woman} className="absolute inset-0 h-full w-full" pos="50% 22%" />
          <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
          <span className="absolute inset-x-1.5 bottom-1.5 flex flex-col items-center gap-0.5"><span className="h-1 w-full rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-lime" /></span>
          <span className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-1"><span className="h-1.5 w-1.5 rounded-full bg-white/70" /><span className="h-1.5 w-1.5 rounded-full bg-white/70" /></span>
        </div>
      </Tile>
      <Tile label="Sales presentation" i={4} span="col-span-3">
        <div className="relative aspect-video w-full max-w-[8.5rem] overflow-hidden rounded-md border border-white/15 bg-surface-2 p-1.5">
          <Skel w="w-1/2" className="!bg-lime/70" /><Skel className="mt-1.5" w="w-3/4" /><Skel className="mt-1" w="w-2/3" />
          <span className="absolute bottom-1 right-1 w-[44%]"><Thumb tone={VIOLET} v={P.man} /></span>
        </div>
      </Tile>
    </ul>
  )
}

export const SAAS_VISUALS = [SceneDiscovery, SceneConcept, SceneProduction, SceneDelivery]
