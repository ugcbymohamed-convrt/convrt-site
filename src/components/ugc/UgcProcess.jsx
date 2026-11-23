import { useEffect, useRef, useState } from 'react'
import { SPRINT, SPRINT_PLUS, TURNAROUND, FORMATS } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { Section, Head, Reveal } from './shared.jsx'
import { Avatar, MiniPhone, CheckBadge, delay } from './illustrations.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'
import TestingDiagram from './TestingDiagram.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { ES_STAGE_TITLES } from '../../i18n/es/labels.js'
import { localizeConfig } from '../../i18n/content.js'

/* SECTION 3: how we create and test UGC ads. Four stages. All four titles and one-line explanations are always visible, so the
   process reads in seconds without touching anything; selecting a stage (mouse, touch or keyboard) swaps the illustration beside it.
   The stages also advance once, by themselves, when the section is on screen (never for reduced-motion visitors, never after the
   visitor chooses, with a Pause button), then stay put. The creators in the scenes are stylised illustrations, not real people. Detail that the FAQ already carries (revisions, usage rights, formats,
   languages) is not repeated here. The interactive testing illustration follows (TestingDiagram.jsx). */

const STAGE_MS = 6000

const STAGES = [
  { id: 'research', title: 'Research & Concepts', text: 'We study your brand and audience, then develop distinct concepts, each with its own hooks.' },
  { id: 'creators', title: 'Creators & Scripts', text: 'We match the right creator and write every script. You approve both before anything is filmed.' },
  { id: 'filming', title: 'Filming & Editing', text: 'Creators film natively for each format. We edit, caption and quality-check every video.' },
  { id: 'delivery', title: 'Delivery & Creative Testing', text: 'You receive finished, platform-ready ad versions and guidance on what to test next.' },
]

/* ── stage illustrations: small scenes built from CSS and SVG, with stylised illustrated creators (illustrations.jsx). They are
   decorative (aria-hidden): the title and sentence beside them carry the meaning. Each plays once when its stage is selected. ── */
const Skel = ({ w = 'w-full', className = '' }) => <span className={`block h-1.5 rounded-full bg-white/15 ${w} ${className}`} />
const Tag = ({ children, color = '#d5ff40', className = '' }) => (
  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${className}`} style={{ background: color, color: '#0a0a0b' }}>{children}</span>
)
const Label = ({ n, children }) => (
  <p className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[9px] font-bold text-canvas">{n}</span>{children}
  </p>
)
const Icon = ({ children, className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

const HOOKS = ['Problem → fix', 'Founder story', 'Before & after', 'Social proof', 'Unboxing'] // rendered through tr()

/* 1  one brief branches into several different concepts */
function VisualResearch() {
  const rows = SPRINT.concepts
  const y = (i) => ((i + 0.5) / rows) * 100
  return (
    <div className="flex h-full items-stretch">
      <div className="flex w-[34%] shrink-0 flex-col justify-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{tr('One brief')}</p>
        <div className="ugc-pop rounded-2xl border border-lime/40 bg-surface-2 p-2.5 sm:p-3" style={{ boxShadow: '0 0 40px -18px rgba(213,255,64,0.5)' }}>
          <div className="flex items-center gap-1.5 text-lime">
            <Icon className="h-3.5 w-3.5"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></Icon>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{tr('Brand brief')}</span>
          </div>
          {['Offer', 'Audience', 'Goal'].map((l) => (
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
        {Array.from({ length: rows }, (_, i) => (
          <path key={i} pathLength="1" d={`M0 50 C 22 50, 18 ${y(i)}, 40 ${y(i)}`} fill="none" stroke={ConceptAccents[i]} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="ugc-draw" style={delay(250 + i * 90)} />
        ))}
      </svg>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="mb-2 h-[12px] text-[10px] font-semibold uppercase leading-[12px] tracking-[0.12em] text-ink-muted">{rows} {tr('different concepts')}</p>
        <ul className="flex flex-1 flex-col justify-between gap-1.5">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="cs-fade-up flex flex-1 items-center gap-2 rounded-xl border bg-canvas/50 px-2 py-1" style={{ ...delay(500 + i * 110), borderColor: `${ConceptAccents[i]}66` }}>
              <MiniPhone variant={i} tone={ConceptAccents[i]} className="h-full max-h-[2.6rem] shrink-0 rounded-md" />
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-ink">{tr('Concept')} {i + 1}</span>
                <span className="mt-0.5 inline-block max-w-full truncate rounded px-1.5 py-px text-[10px] font-bold" style={{ background: `${ConceptAccents[i]}26`, color: ConceptAccents[i] }}>{tr(HOOKS[i % HOOKS.length])}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* 2  match a creator, write the script, you approve it */
function VisualCreators() {
  const creators = [['Relatable', 0, '#8b5cf6'], ['Expert', 3, '#d5ff40'], ['Energetic', 2, '#ff6a4d']]
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div>
        <Label n="1">{tr('We match the right creator')}</Label>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
          {creators.map(([tag, v, tone], i) => {
            const chosen = i === 1
            return (
              <div key={tag} className={`cs-fade-up relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 transition-opacity ${chosen ? 'border-lime/60 bg-lime/[0.06]' : 'border-hairline bg-canvas/40 opacity-70'}`} style={delay(i * 120)}>
                <span className="relative h-12 w-12 overflow-hidden rounded-full border-2 sm:h-14 sm:w-14" style={{ borderColor: chosen ? '#d5ff40' : '#34343a', background: '#17171b' }}>
                  <Avatar variant={v} className="absolute inset-0 h-full w-full" pos="50% 20%" />
                </span>
                <span className="text-[11px] font-semibold text-ink">{tr('Creator')} {i + 1}</span>
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
          <div className="flex items-start gap-2.5"><Tag className="mt-0.5 shrink-0">{tr('Hook')}</Tag><p className="text-[12px] font-medium leading-snug text-ink">&ldquo;Wait, you&rsquo;re still doing it the hard way?&rdquo;</p></div>
          <div className="mt-2.5 flex items-center gap-2.5"><Tag color="#8b5cf6" className="shrink-0 !text-white">{tr('Story')}</Tag><Skel w="w-4/5" /></div>
          <div className="mt-2 flex items-center gap-2.5"><Tag color="#ff6a4d" className="shrink-0">{tr('Call')}</Tag><Skel w="w-3/5" /></div>
        </div>
      </div>
    </div>
  )
}

/* 3  filming, editing, captions, export: one video moving through production */
function VisualFilming() {
  const lanes = [
    ['Filming', '#8b5cf6', <><rect x="3" y="7" width="13" height="10" rx="2" /><path d="M16 11l5-3v8l-5-3z" /></>],
    ['Editing', '#d5ff40', <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></>],
    ['Captions', '#ff6a4d', <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M8 11h3M8 15h6M14 11h2" /></>],
    ['Export', '#ec4899', <><path d="M12 3v12M7 8l5-5 5 5M5 21h14" /></>],
  ]
  const formats = ['9:16', ...FORMATS.included.map((f) => f.replace(/ reframing$/, '').replace(/^(Square|Portrait) /, ''))]
  return (
    <div className="flex h-full items-center gap-4 sm:gap-6">
      <div className="ugc-pop relative aspect-[9/16] w-[6.2rem] shrink-0 sm:h-full sm:max-h-[17.5rem] sm:w-auto overflow-hidden rounded-[1.1rem] border border-white/15" style={{ boxShadow: '0 0 50px -18px rgba(139,92,246,0.7)' }}>
        <Avatar variant={0} className="absolute inset-0 h-full w-full" pos="50% 22%" />
        <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.6) 100%)' }} />
        <span className="ugc-fade-out absolute left-2 top-2.5 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-ink" style={delay(2300)}>
          <span className="ugc-blink h-1.5 w-1.5 rounded-full bg-coral" />{tr('Rec')}</span>
        {/* captions, drawn as neutral lines (no words) */}
        <span className="cs-fade-up absolute inset-x-3 bottom-8 flex flex-col items-center gap-1 rounded-lg bg-black/55 px-2 py-2" style={delay(2450)}>
          <span className="h-1.5 w-full rounded-full bg-white/85" /><span className="h-1.5 w-3/5 rounded-full bg-lime" />
        </span>
        <span className="absolute inset-x-2 bottom-3 h-[3px] rounded-full bg-white/20"><span className="ugc-bar block h-full rounded-full bg-lime" style={{ animationDuration: '3.4s', ...delay(200) }} /></span>
      </div>
      <ul className="min-w-0 flex-1 space-y-3.5 sm:space-y-5">
        {lanes.map(([label, color, icon], i) => (
          <li key={label} className="cs-fade-up flex items-center gap-2.5" style={delay(200 + i * 650)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}26`, color }}><Icon>{icon}</Icon></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-xs font-semibold text-ink">{tr(label)}
                <CheckBadge className="ugc-pop" size="h-4 w-4" />
              </span>
              <span className="mt-1 block h-1.5 rounded-full bg-white/[0.07]"><span className="ugc-bar block h-full rounded-full" style={{ background: color, animationDuration: '0.8s', ...delay(300 + i * 650) }} /></span>
              {i === 3 && (
                <span className="mt-1.5 flex flex-wrap gap-1">
                  {formats.map((f, k) => <span key={f} className="cs-fade-up rounded-full border border-hairline-strong bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-ink-muted" style={delay(2800 + k * 100)}>{tr(f)}</span>)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* 4  three finished versions of the concept, delivered, plus guidance on what to test */
function VisualDelivery() {
  const n = SPRINT.variationsPerConcept
  const tones = ['#8b5cf6', '#d5ff40', '#ff6a4d']
  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex items-start justify-center gap-3 sm:gap-6">
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="cs-fade-up flex flex-col items-center gap-1.5" style={delay(i * 200)}>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${tones[i]}26`, color: tones[i] }}>{tr('Version')} {'ABC'[i]}</span>
            <MiniPhone variant={1} tone={tones[i]} caption={`${tr('Hook')} ${'ABC'[i]}`} captionBg={tones[i]} className="w-[4.4rem] sm:w-[6rem]" />
            <span className="ugc-pop inline-flex items-center gap-1 rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-lime" style={delay(900 + i * 200)}>
              <Icon className="h-3 w-3"><path d="M4 12.5l5 5L20 6" /></Icon>{tr('Delivered')}</span>
          </div>
        ))}
      </div>
      <div className="cs-fade-up flex items-center gap-3 rounded-2xl border border-lime/30 bg-lime/[0.06] px-3 py-2.5" style={delay(1400)}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime/20 text-lime"><Icon><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></Icon></span>
        <span className="min-w-0"><span className="block text-[12px] font-bold text-ink">{tr('Ready to test')}</span><span className="block text-[11px] leading-snug text-ink-muted">{tr('Finished versions, plus guidance on what to test next.')}</span></span>
      </div>
    </div>
  )
}

const VISUALS = [VisualResearch, VisualCreators, VisualFilming, VisualDelivery]

/* The UGC page's content for the shared four-stage section. /spokesperson-video-production supplies its own `config` (stages, scenes, heading,
   footer note) and its own section after the stages (`children`), and gets the same layout, the same stage-switching behaviour and the same
   auto-advance rules. `config.stages` = [{ id, title, text }] x4, `config.visuals` = one scene component per stage. */
export const UGC_PROCESS = {
  id: 'how-it-works',
  headingId: 'ugc-process-heading',
  eyebrow: 'How it works',
  title: 'How we create and test UGC ads.',
  intro: 'Four stages, with your approval before anything is filmed.',
  stages: STAGES,
  visuals: VISUALS,
}

export default function UgcProcess() {
  return (
    <ProcessSection config={UGC_PROCESS} footer={<UgcProcessFooter />}>
      <TestingDiagram />
    </ProcessSection>
  )
}

function UgcProcessFooter() {
  return (
    <>
      <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink">{tr('Production turnaround:')}</span>{' '}
        {currentLocale() === 'en'
          ? <>{SPRINT.turnaroundBusinessDays} business days for the {SPRINT.name} and{' '}{SPRINT_PLUS.turnaroundBusinessDays} for {SPRINT_PLUS.name}, counted from the moment you approve concepts and scripts. {TURNAROUND.note}</>
          : currentLocale() === 'ar'
            ? <><bdi>{SPRINT.turnaroundBusinessDays}</bdi> أيام عمل لباقة <bdi>{SPRINT.name}</bdi> و<bdi>{SPRINT_PLUS.turnaroundBusinessDays}</bdi> يومًا لباقة <bdi>{SPRINT_PLUS.name}</bdi>، تُحسب من لحظة اعتمادك للأفكار والنصوص، وليس من تاريخ الدفع.</>
            : <>{SPRINT.turnaroundBusinessDays} días laborables para {SPRINT.name} y {SPRINT_PLUS.turnaroundBusinessDays} para {SPRINT_PLUS.name}, a partir de la aprobación de los conceptos y guiones, no desde el pago.</>}
      </p>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-muted">{tr('Scenes are illustrative. The portraits are for illustration only.')}</p>
    </>
  )
}

export function ProcessSection({ config: configProp, footer, children }) {
  const config = localizeConfig(configProp, currentLocale())
  // Spanish: a few stage titles differ per page although the English key is shared (src/i18n/es/labels.js).
  const stageTitles = currentLocale() === 'es' ? ES_STAGE_TITLES[configProp.headingId] : null
  const STAGES = stageTitles ? config.stages.map((st) => (stageTitles[st.id] ? { ...st, title: stageTitles[st.id] } : st)) : config.stages
  const { visuals: VISUALS } = config
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
    <Section id={config.id} label={config.headingId} glow>
      <Reveal>
        <Head id={config.headingId} eyebrow={config.eyebrow} title={config.title} intro={config.intro} />
      </Reveal>

      <Reveal className="mt-8 md:mt-10">
        <div ref={rootRef} className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center lg:gap-8">
          {/* desktop: the illustration sits beside the list. Phones get it inside the selected stage, next to what was tapped. */}
          <div className="hidden lg:order-2 lg:col-span-7 lg:block">
            <div key={STAGES[active].id} aria-hidden="true" className="pricing-panel-in relative h-[400px] overflow-hidden rounded-3xl border border-hairline-strong bg-surface-1 p-6">
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
                        <div key={`m-${s.id}`} aria-hidden="true" className="pricing-panel-in relative mt-4 h-[330px] overflow-hidden rounded-2xl border border-hairline bg-canvas/50 p-3.5 lg:hidden">
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
              <button type="button" onClick={() => setRunning(false)} className="mt-3 min-h-[44px] rounded-full border border-hairline px-4 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">{tr('Pause animation')}</button>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-5 md:mt-6">{footer}</Reveal>

      <Reveal className="mt-10 md:mt-12">{children}</Reveal>
    </Section>
  )
}
