import { Avatar, CheckBadge, delay } from '../ugc/illustrations.jsx'
import { LIME, VIOLET, CORAL, PINK, Skel, Tag, Label, Icon } from '../scenes/sceneKit.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { dayLabel } from '../../i18n/ar/weekdays.js'

/* The four "How it works" scenes of /social-media-video-production. Same system as the UGC and Spokesperson scenes: small scenes built from CSS and SVG, aria-hidden
   (the title and sentence beside them carry the meaning), each playing once when its stage is selected, using the site's own animation classes (which already honour
   prefers-reduced-motion). The people are the owner-supplied portrait photographs (illustrations.jsx), used without names or claims, and the page says in words that the
   scenes are illustrative.
   They show a WORKFLOW, never a result: no counts, no likes, no follower or engagement figures, no numbers of posts. */

/* The four suggested content styles, used in every organic illustration so the colours mean the same thing everywhere. */
export const PILLARS = [
  { id: 'educational', label: 'Educational', color: VIOLET },
  { id: 'entertaining', label: 'Entertaining', color: CORAL },
  { id: 'product', label: 'Product', color: LIME },
  { id: 'founder', label: 'Founder-led', color: PINK },
]
const C = Object.fromEntries(PILLARS.map((p) => [p.id, p.color]))

/* 1  a content calendar fills with different video concepts */
export function SceneStrategy() {
  const days = ['M', 'T', 'W', 'T', 'F']
  /* each week: five slots, a concept colour or null. The pattern is deliberately uneven: it illustrates variety, not a posting frequency. */
  const weeks = [
    [C.educational, null, C.product, null, C.entertaining],
    [null, C.founder, null, C.educational, null],
    [C.product, null, C.entertaining, C.founder, null],
    [null, C.educational, null, C.product, C.entertaining],
  ]
  let n = 0
  return (
    <div className="flex h-full flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <Label n="1">{tr('Brand, audience, goals')}</Label>
        <ul className="hidden shrink-0 items-center gap-1 sm:flex" aria-hidden="true">
          {['Brand', 'Audience', 'Goals'].map((t, i) => (
            <li key={t} className="cs-fade-up rounded-full border border-hairline-strong bg-surface-2 px-2 py-0.5 text-[9px] font-semibold text-ink-muted" style={delay(i * 110)}>{tr(t)}</li>
          ))}
        </ul>
      </div>
      <div className="min-h-0 flex-1 rounded-2xl border border-hairline bg-canvas/40 p-2.5">
        <div className="mb-1.5 grid grid-cols-5 gap-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
          {days.map((d, i) => <span key={`${d}${i}`}>{dayLabel(currentLocale(), d, i)}</span>)}
        </div>
        <div className="grid h-[calc(100%-1.1rem)] grid-rows-4 gap-1.5">
          {weeks.map((row, wi) => (
            <div key={wi} className="grid grid-cols-5 gap-1.5">
              {row.map((color, di) => {
                if (!color) return <span key={di} className="rounded-lg border border-dashed border-white/10" />
                const d = 400 + n++ * 170
                return (
                  <span key={di} className="ugc-pop relative flex items-center gap-1 overflow-hidden rounded-lg border px-1" style={{ ...delay(d), background: `${color}26`, borderColor: `${color}99` }}>
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full" style={{ background: color, color: '#0a0a0b' }}>
                      <svg viewBox="0 0 12 12" className="ml-px h-2 w-2" fill="currentColor" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" /></svg>
                    </span>
                    <Skel w="w-full" className="!h-1" />
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-1.5" aria-hidden="true">
        {PILLARS.map((p, i) => (
          <li key={p.id} className="cs-fade-up inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ ...delay(1800 + i * 100), background: `${p.color}22`, color: p.color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{tr(p.label)}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* 2  each script is matched with a creator and approved */
export function SceneScripts() {
  const rows = [
    ['Educational', C.educational, 2, 'Hook', 'Tip'],
    ['Entertaining', C.entertaining, 3, 'Hook', 'Story'],
    ['Founder-led', C.founder, 1, 'Hook', 'Message'],
  ]
  return (
    <div className="flex h-full flex-col justify-between gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <Label n="1">{tr('Creators and scripts')}</Label>
        <span className="ugc-pop inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-canvas" style={delay(2200)}>
          <Icon className="h-3 w-3"><path d="M4 12.5l5 5L20 6" /></Icon>{tr('Approved')}</span>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col justify-between gap-2">
        {rows.map(([label, color, who, a, b], i) => (
          <li key={label} className="cs-fade-up relative flex flex-1 items-center gap-2.5 rounded-2xl border bg-canvas/40 px-2.5 py-1.5 sm:gap-3 sm:px-3" style={{ ...delay(250 + i * 330), borderColor: `${color}77` }}>
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 sm:h-12 sm:w-12" style={{ borderColor: color, background: '#17171b' }}>
              <Avatar variant={who} className="absolute inset-0 h-full w-full" pos="50% 20%" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="inline-block rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.08em]" style={{ background: `${color}26`, color }}>{tr(label)}</span>
              <span className="mt-1.5 flex items-center gap-2"><Tag color={color} className="shrink-0">{tr(a)}</Tag><Skel w="w-4/5" /></span>
              <span className="mt-1 flex items-center gap-2"><Tag color="#34343a" className="shrink-0 !text-ink-muted">{tr(b)}</Tag><Skel w="w-3/5" /></span>
            </span>
            <span className="ugc-pop shrink-0" style={delay(1100 + i * 380)}><CheckBadge size="h-6 w-6" /></span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* a vertical (9:16) phone-shaped video frame holding a creator */
function Vertical({ variant, tone, className = '', children, filter }) {
  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-[1rem] border bg-surface-2 ${className}`} style={{ borderColor: `${tone}aa`, boxShadow: `0 0 30px -12px ${tone}` }}>
      <Avatar variant={variant} className="absolute inset-0 h-full w-full" pos="50% 22%" />
      {filter && <span aria-hidden="true" className="absolute inset-0" style={{ background: 'rgba(24,24,28,0.35)', mixBlendMode: 'saturation' }} />}
      <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.6) 100%)' }} />
      {children}
    </div>
  )
}

const PHONE = 'h-[12rem] sm:h-[14rem]'

/* 3  a creator films; the footage becomes an edited vertical video */
export function SceneFilming() {
  const steps = [['Film', VIOLET, <><rect x="3" y="7" width="13" height="10" rx="2" /><path d="M16 11l5-3v8l-5-3z" /></>], ['Edit', LIME, <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></>], ['Captions', CORAL, <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M8 11h3M8 15h6M14 11h2" /></>], ['Polish', PINK, <path d="M12 3l2.2 5.3L20 9l-4.3 3.9L17 19l-5-3-5 3 1.3-6.1L4 9l5.8-.7z" />]]
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2.5 sm:gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <Vertical variant={2} tone="#6b7280" filter className={`ugc-pop ${PHONE}`}>
            <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-ink"><span className="ugc-blink h-1.5 w-1.5 rounded-full bg-coral" />{tr('Rec')}</span>
            {/* framing guides */}
            <span aria-hidden="true" className="absolute inset-x-0 top-1/3 h-px bg-white/20" /><span aria-hidden="true" className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
            <span aria-hidden="true" className="absolute inset-y-0 left-1/3 w-px bg-white/20" /><span aria-hidden="true" className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
          </Vertical>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{tr('Footage')}</span>
        </div>
        <svg viewBox="0 0 32 16" className="cs-fade-up h-4 w-8 shrink-0 text-lime" fill="none" aria-hidden="true" style={delay(900)}><path d="M1 8h26M21 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div className="flex flex-col items-center gap-1.5">
          <Vertical variant={2} tone={LIME} className={`ugc-pop ${PHONE}`}>
            <span className="absolute inset-x-2 top-1.5 flex h-1 overflow-hidden rounded-full bg-white/25" style={delay(1300)}><span className="ugc-bar block h-full w-2/3 rounded-full bg-lime" style={{ animationDuration: '1.4s', ...delay(1400) }} /></span>
            <span className="cs-fade-up absolute inset-x-[10%] top-[13%] rounded-md bg-lime px-1 py-1 text-center" style={delay(1700)}><span className="mx-auto block h-1.5 w-4/5 rounded-full bg-canvas/80" /><span className="mx-auto mt-1 block h-1.5 w-3/5 rounded-full bg-canvas/80" /></span>
            <span className="cs-fade-up absolute bottom-[22%] right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/40 bg-black/50" style={delay(2100)}><Icon className="h-3 w-3"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></Icon></span>
            <span className="cs-fade-up absolute inset-x-[14%] bottom-[7%] flex flex-col items-center gap-0.5 rounded bg-black/60 px-1.5 py-1" style={delay(2400)}><span className="h-1 w-full rounded-full bg-white/85" /><span className="h-1 w-3/5 rounded-full bg-lime" /></span>
          </Vertical>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-lime">{tr('Edited video')}</span>
        </div>
      </div>
      <ul className="grid grid-cols-4 gap-1.5 sm:gap-2" aria-hidden="true">
        {steps.map(([label, color, icon], i) => (
          <li key={label} className="cs-fade-up flex items-center justify-center gap-1.5 rounded-xl border border-hairline bg-canvas/40 px-1 py-1.5" style={delay(300 + i * 560)}>
            <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `${color}26`, color }}><Icon className="h-3.5 w-3.5">{icon}</Icon></span>
            <span className="hidden text-[10px] font-semibold text-ink min-[420px]:inline">{tr(label)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* 4  scheduled posts in a social calendar, and community interaction */
export function ScenePublishing() {
  const week = [['M', 2, C.educational, 'IG'], ['T', null], ['W', 3, C.entertaining, 'TT'], ['T', 0, C.product, 'FB'], ['F', 1, C.founder, 'IG']]
  const comments = [[4, 'Comment'], [0, 'Comment']]
  return (
    <div className="flex h-full flex-col justify-between gap-2.5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <Label n="1">{tr('Publishing calendar')}</Label>
          <span className="cs-fade-up inline-flex shrink-0 items-center gap-1 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-lime" style={delay(1500)}>
            <Icon className="h-3 w-3"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>{tr('Scheduled')}</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
          {week.map(([d, who, color, plat], i) => (
            <div key={`${d}${i}`} className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{dayLabel(currentLocale(), d, i)}</span>
              {who === null ? (
                <span className="aspect-[9/16] w-full max-w-[3rem] rounded-lg border border-dashed border-white/10" />
              ) : (
                <span className="ugc-pop relative aspect-[9/16] w-full max-w-[3rem] overflow-hidden rounded-lg border" style={{ ...delay(250 + i * 230), borderColor: `${color}aa` }}>
                  <Avatar variant={who} className="absolute inset-0 h-full w-full" pos="50% 22%" />
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7))' }} />
                  <span className="absolute inset-x-1 bottom-1 flex flex-col items-center gap-0.5"><span className="h-0.5 w-full rounded-full bg-white/85" /><span className="h-0.5 w-3/5 rounded-full bg-lime" /></span>
                </span>
              )}
              {plat && <span className="cs-fade-up rounded px-1 text-[8px] font-bold tracking-[0.06em] text-ink-muted ring-1 ring-white/15" style={delay(700 + i * 230)}>{plat}</span>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label n="2">{tr('Community')}</Label>
        <ul className="mt-2 space-y-1.5">
          {comments.map(([who, t], i) => (
            <li key={i} className="flex flex-col gap-1">
              <div className="cs-fade-up flex items-center gap-2" style={delay(1900 + i * 900)}>
                <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20"><Avatar variant={who} className="absolute inset-0 h-full w-full" pos="50% 20%" /></span>
                <span className="flex-1 rounded-2xl rounded-tl-sm border border-hairline bg-surface-2 px-2.5 py-1.5"><Skel w="w-3/4" /></span>
              </div>
              <div className="cs-fade-up flex items-center justify-end gap-2" style={delay(2300 + i * 900)}>
                <span className="w-3/5 rounded-2xl rounded-tr-sm border border-lime/40 bg-lime/10 px-2.5 py-1.5"><Skel w="w-4/5" className="!bg-lime/60" /></span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-[8px] font-bold text-canvas">{tr('CV')}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const ORGANIC_VISUALS = [SceneStrategy, SceneScripts, SceneFilming, ScenePublishing]
