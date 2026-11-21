import { Avatar, CheckBadge, delay } from '../ugc/illustrations.jsx'
import { LIME, VIOLET, CORAL, PINK, Skel, Tag, Label, Icon } from '../scenes/sceneKit.jsx'
import { tr } from '../../i18n/tr.js'

/* The four "How it works" scenes of /spokesperson-video-production. Same system as the UGC scenes (src/components/ugc/UgcProcess.jsx): small
   scenes built from CSS and SVG, aria-hidden (the title and sentence beside them carry the meaning), each playing once when its stage is
   selected, using the site's own animation classes. The people are the owner-supplied portrait photographs (illustrations.jsx), used without
   names or claims, so no cartoon avatars; the page says in words that the scenes are illustrative. No data, results or deliverable counts. */

/* portrait indexes (illustrations.jsx PORTRAITS): the presenters used in the scenes */
const P = { woman: 2, man: 1, alt: 3 }

export const PlayDot = ({ className = 'h-6 w-6' }) => (
  <span className={`flex items-center justify-center rounded-full border border-white/40 bg-black/45 text-ink ${className}`}>
    <svg viewBox="0 0 12 12" className="ml-px h-[45%] w-[45%]" fill="currentColor" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" /></svg>
  </span>
)

/* a landscape (16:9) video frame holding a presenter */
export function VideoFrame({ variant = P.man, tone = VIOLET, pos = '50% 22%', className = '', children }) {
  return (
    <div className={`relative aspect-video overflow-hidden rounded-xl border bg-surface-2 ${className}`} style={{ borderColor: `${tone}aa`, boxShadow: `0 0 28px -12px ${tone}` }}>
      <Avatar variant={variant} className="absolute inset-0 h-full w-full" pos={pos} />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.55) 100%)' }} />
      {children}
    </div>
  )
}

/* 1  one brief becomes several message angles */
export function SceneBrief() {
  const angles = [['Introduce the product', P.woman, VIOLET], ['Show how it works', P.man, LIME], ['Make the offer', P.alt, CORAL]]
  const y = (i) => ((i + 0.5) / angles.length) * 100
  return (
    <div className="flex h-full items-stretch">
      <div className="flex w-[34%] shrink-0 flex-col justify-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{tr('One brief')}</p>
        <div className="ugc-pop rounded-2xl border border-lime/40 bg-surface-2 p-2.5 sm:p-3" style={{ boxShadow: '0 0 40px -18px rgba(213,255,64,0.5)' }}>
          <div className="flex items-center gap-1.5 text-lime">
            <Icon className="h-3.5 w-3.5"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></Icon>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{tr('Brand brief')}</span>
          </div>
          {['Product', 'Audience', 'Goal'].map((l) => (
            <div key={l} className="mt-2.5">
              <span className="text-[10px] font-medium text-ink-muted">{tr(l)}</span>
              <Skel className="mt-1" w={l === 'Goal' ? 'w-2/3' : 'w-full'} />
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="flex w-[11%] shrink-0 flex-col">
        <span className="mb-2 block h-[12px]" />
        <svg viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true" className="min-h-0 w-full flex-1">
          {angles.map(([, , c], i) => (
            <path key={c} pathLength="1" d={`M0 50 C 22 50, 18 ${y(i)}, 40 ${y(i)}`} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="ugc-draw" style={delay(250 + i * 90)} />
          ))}
        </svg>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mb-2 h-[12px] text-[10px] font-semibold uppercase leading-[12px] tracking-[0.12em] text-ink-muted">{tr('Possible video messages')}</p>
        <ul className="flex flex-1 flex-col justify-between gap-1.5">
          {angles.map(([label, v, c], i) => (
            <li key={label} className="cs-fade-up flex flex-1 items-center gap-2 rounded-xl border bg-canvas/50 px-2 py-1" style={{ ...delay(500 + i * 110), borderColor: `${c}66` }}>
              <span className="relative aspect-video h-full max-h-[2.6rem] shrink-0 overflow-hidden rounded-md border" style={{ borderColor: `${c}aa` }}>
                <Avatar variant={v} className="absolute inset-0 h-full w-full" pos="50% 20%" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted">{tr('Angle')} {i + 1}</span>
                <span className="mt-0.5 inline-block max-w-full truncate rounded px-1.5 py-px text-[11px] font-bold" style={{ background: `${c}26`, color: c }}>{tr(label)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* 2  choose a presenter, approve the script */
export function ScenePresenter() {
  const presenters = [['Warm', P.woman], ['Authoritative', P.man], ['Energetic', P.alt]]
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <Label n="1">{tr('We recommend the right presenter')}</Label>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
          {presenters.map(([tag, v], i) => {
            const chosen = i === 1
            return (
              <div key={tag} className={`cs-fade-up relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-2 sm:py-2.5 ${chosen ? 'border-lime/60 bg-lime/[0.06]' : 'border-hairline bg-canvas/40 opacity-70'}`} style={delay(i * 120)}>
                <span className="relative h-10 w-10 overflow-hidden rounded-full border-2 sm:h-14 sm:w-14" style={{ borderColor: chosen ? LIME : '#34343a', background: '#17171b' }}>
                  <Avatar variant={v} className="absolute inset-0 h-full w-full" pos="50% 20%" />
                </span>
                <span className="text-[11px] font-semibold text-ink">{tr('Presenter')} {i + 1}</span>
                <span className="text-[10px] text-ink-muted">{tr(tag)}</span>
                {chosen && <CheckBadge className="ugc-pop absolute -right-1.5 -top-1.5" size="h-5 w-5" />}
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <Label n="2">{tr('We write the script')}</Label>
          <span className="ugc-pop inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-canvas" style={delay(1300)}>
            <Icon className="h-3 w-3"><path d="M4 12.5l5 5L20 6" /></Icon>{tr('You approve')}</span>
        </div>
        <div className="cs-fade-up relative mt-2 rounded-2xl border border-hairline-strong bg-surface-2 p-3" style={delay(750)}>
          <div className="flex items-start gap-2.5"><Tag className="mt-0.5 shrink-0">{tr('Intro')}</Tag><Skel w="w-4/5" className="mt-1.5" /></div>
          <div className="mt-2.5 flex items-center gap-2.5"><Tag color={VIOLET} className="shrink-0 !text-white">{tr('Message')}</Tag><Skel w="w-full" /></div>
          <div className="mt-2 flex items-center gap-2.5"><Tag color={CORAL} className="shrink-0">{tr('Action')}</Tag><Skel w="w-3/5" /></div>
        </div>
      </div>
    </div>
  )
}

/* 3  filming, editing, captions, finishing: a presenter in a video frame, with a timeline under it */
export function SceneFilming() {
  const lanes = [
    ['Filming', VIOLET, <><rect x="3" y="7" width="13" height="10" rx="2" /><path d="M16 11l5-3v8l-5-3z" /></>],
    ['Editing', LIME, <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></>],
    ['Captions', CORAL, <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M8 11h3M8 15h6M14 11h2" /></>],
    ['Finishing', PINK, <><path d="M12 3l2.2 5.3L20 9l-4.3 3.9L17 19l-5-3-5 3 1.3-6.1L4 9l5.8-.7z" /></>],
  ]
  const clips = [['32%', VIOLET], ['22%', LIME], ['28%', CORAL], ['14%', PINK]]
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <VideoFrame variant={P.man} tone={VIOLET} className="ugc-pop h-full max-h-[11.5rem] max-w-full">
          <span className="ugc-fade-out absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-ink" style={delay(2300)}>
            <span className="ugc-blink h-1.5 w-1.5 rounded-full bg-coral" />{tr('Rec')}</span>
          {/* lower third, drawn as neutral lines (no names or words) */}
          <span className="cs-fade-up absolute bottom-8 left-3 flex w-[40%] flex-col gap-1 rounded-md border-l-2 border-lime bg-black/60 px-2 py-1.5" style={delay(1500)}>
            <span className="h-1.5 w-4/5 rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-white/45" />
          </span>
          {/* captions, drawn as lines */}
          <span className="cs-fade-up absolute inset-x-[22%] bottom-1.5 flex flex-col items-center gap-0.5 rounded bg-black/55 px-2 py-1" style={delay(2450)}>
            <span className="h-1 w-full rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-lime" />
          </span>
        </VideoFrame>
      </div>
      <div className="flex h-5 w-full overflow-hidden rounded-md border border-hairline bg-canvas/60">
        {clips.map(([w, c], i) => (
          <span key={c} className="ugc-bar block h-full border-r border-canvas" style={{ width: w, background: `${c}cc`, animationDuration: '0.7s', ...delay(300 + i * 450) }} />
        ))}
      </div>
      <ul className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {lanes.map(([label, color, icon], i) => (
          <li key={label} className="cs-fade-up flex flex-col items-center gap-1 rounded-xl border border-hairline bg-canvas/40 px-1 py-2" style={delay(300 + i * 450)}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${color}26`, color }}><Icon>{icon}</Icon></span>
            <span className="text-[10px] font-semibold text-ink">{tr(label)}</span>
            <CheckBadge className="ugc-pop" size="h-4 w-4" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* 4  one finished video, prepared for four placements */
export function SceneDelivery() {
  const Tile = ({ label, i, children }) => (
    <li className="cs-fade-up flex min-h-0 flex-col gap-1.5 rounded-2xl border border-hairline bg-canvas/40 p-2" style={delay(i * 200)}>
      <div className="flex min-h-0 flex-1 items-center justify-center">{children}</div>
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[11px] font-semibold text-ink">{tr(label)}</span>
        <span className="ugc-pop inline-flex shrink-0 items-center gap-1 rounded-full bg-lime/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-lime" style={delay(900 + i * 200)}>
          <Icon className="h-2.5 w-2.5"><path d="M4 12.5l5 5L20 6" /></Icon>{tr('Ready')}</span>
      </div>
    </li>
  )
  return (
    <ul className="grid h-full grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
      <Tile label="Website" i={0}>
        <div className="w-full max-w-[9.5rem] overflow-hidden rounded-lg border border-white/15 bg-surface-2">
          <div className="flex items-center gap-1 border-b border-white/10 px-1.5 py-1"><span className="h-1 w-1 rounded-full bg-coral" /><span className="h-1 w-1 rounded-full bg-amber" /><span className="h-1 w-1 rounded-full bg-lime" /><span className="ml-1 h-1 flex-1 rounded-full bg-white/10" /></div>
          <div className="p-1.5">
            <VideoFrame variant={P.woman} tone={VIOLET} className="rounded-md"><span className="absolute inset-0 flex items-center justify-center"><PlayDot className="h-5 w-5" /></span></VideoFrame>
            <Skel className="mt-1.5" w="w-3/4" />
          </div>
        </div>
      </Tile>
      <Tile label="Paid advertising" i={1}>
        <div className="w-full max-w-[7.5rem] overflow-hidden rounded-lg border border-white/15 bg-surface-2">
          <div className="flex items-center gap-1 px-1.5 py-1"><span className="h-3 w-3 rounded-full bg-lime/70" /><Skel w="w-1/2" /><span className="ml-auto text-[8px] font-semibold uppercase tracking-wide text-ink-muted">{tr('Ad')}</span></div>
          <VideoFrame variant={P.alt} tone={CORAL} className="rounded-none border-0"><span className="absolute inset-0 flex items-center justify-center"><PlayDot className="h-5 w-5" /></span></VideoFrame>
          <div className="px-1.5 py-1"><span className="block h-3 rounded bg-lime" /></div>
        </div>
      </Tile>
      <Tile label="Product presentation" i={2}>
        <div className="relative aspect-video w-full max-w-[9.5rem] overflow-hidden rounded-lg border border-white/15 bg-surface-2 p-2">
          <Skel w="w-1/2" className="!bg-lime/70" /><Skel className="mt-2" w="w-3/4" /><Skel className="mt-1.5" w="w-2/3" /><Skel className="mt-1.5" w="w-1/2" />
          <span className="absolute bottom-1.5 right-1.5 h-9 w-9 overflow-hidden rounded-full border-2 border-lime"><Avatar variant={P.man} className="h-full w-full" pos="50% 20%" /></span>
        </div>
      </Tile>
      <Tile label="Social media" i={3}>
        <div className="relative aspect-[9/16] h-full max-h-[5.75rem] overflow-hidden rounded-lg border border-white/15 bg-surface-2">
          <Avatar variant={P.woman} className="absolute inset-0 h-full w-full" pos="50% 22%" />
          <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.65) 100%)' }} />
          <span className="absolute inset-x-1.5 bottom-1.5 flex flex-col items-center gap-0.5"><span className="h-1 w-full rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-lime" /></span>
          <span className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-1"><span className="h-2 w-2 rounded-full bg-white/70" /><span className="h-2 w-2 rounded-full bg-white/70" /></span>
        </div>
      </Tile>
    </ul>
  )
}

export const SPOKESPERSON_VISUALS = [SceneBrief, ScenePresenter, SceneFilming, SceneDelivery]
