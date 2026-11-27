import { useEffect, useRef } from 'react'
import { captureAttribution, trackEvent } from '../../lib/analytics.js'
import { useDocumentHead } from '../../lib/useDocumentHead.js'
import { pageHead } from '../../seo/siteSeo.js'
import { PATHS } from '../../routes.js'
import { OFFER_PATHS } from '../../config.js'
import { CONVRT_STATS } from '../../lib/siteStats.js'
import { TRUST_CONTENT } from '../../content/trustPages.js'
import { hrefFor } from '../../i18n/tr.js'
import { forward } from '../../lib/rtl.js'
import { Reveal } from '../roadmap/shared.jsx'
import { Inline } from '../../TrustPage.jsx'
import { Badge, Glow } from './aboutParts.jsx'

/* ABOUT, English (/about): the SAME premium layout as the Spanish, French and Arabic pages (src/AboutPage.jsx): hero, fact cards, service cards, "behind CONVRT" panel, the founder-experience
   figures with their printed disclosure, a split section, a centred section, approach-style cards and a closing call to action, on the site's dark canvas with lime accents and entrance animations.

   THE ENGLISH WORDS ARE UNCHANGED. Every sentence comes from the existing source, TRUST_CONTENT.about in src/content/trustPages.js (the GEO-clarity text: what we do, who we serve, how we produce, the
   founder, the founder-experience disclosure, creators, markets, scope limits), found by its heading, so the tests that pin that text, and the JSON-LD built from it, keep reading the same words. Only the
   presentation changed: the old plain text-document layout is gone. The few labels that exist only in the layout (the badge, the figure captions, the two button labels) are the English counterparts
   of the other languages' labels. No new claim is added. */

const about = TRUST_CONTENT.about
const section = (heading) => {
  const s = about.sections.find((x) => x.heading === heading)
  if (!s) throw new Error(`About: section "${heading}" is missing from TRUST_CONTENT.about`)
  return s
}
const strings = (s) => s.body.filter((b) => typeof b === 'string')
const list = (s) => s.body.find((b) => typeof b !== 'string').list

const GLANCE = section('CONVRT Studio at a glance')
const WHAT = section('What we do')
const FOUNDER = section('A founder-led studio')
const EXPERIENCE = section("The founder's experience")
const CREATORS = section('How we work with creators')
const MARKETS = section('Markets, production and languages')
const SCOPE = section('What we provide, and what we do not')
const CLOSING = section('See the work and talk to us')

const lh = 'leading-relaxed'
const h2Class = 'font-display font-bold leading-[1.06] tracking-display text-ink'
const FIGURES = [
  ['videos', 'videos produced'],
  ['views', 'views generated'],
  ['clients', 'clients served'],
  ['returningClients', 'returning clients'],
]

/* "Label: text" → [label, text] (the label is everything before the first colon). */
/* A fragment that followed a colon in the text version starts a card, so its first letter is capitalised (display only). */
const cap = (s) => (/^[a-z]/.test(s) ? s[0].toUpperCase() + s.slice(1) : s)
const splitLabel = (s) => { const i = s.indexOf(': '); return [s.slice(0, i), cap(s.slice(i + 2))] }
/* "Title. Rest of the paragraph." → [title, rest]. */
const splitTitle = (s) => { const i = s.indexOf('. '); return [s.slice(0, i), s.slice(i + 2)] }

export default function EnglishAbout() {
  useDocumentHead(pageHead(PATHS.about))
  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('about_page_view')
  }, [])

  const [whatIntro, , whatOutro] = [strings(WHAT)[0], null, strings(WHAT)[1]]
  const services = list(WHAT).map((li) => { const m = li.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]: (.*)$/); return { name: m[1], href: m[2], text: cap(m[3]) } })
  const [closingText] = strings(CLOSING)

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="about-h1" className="relative overflow-x-clip">
        <Glow className="-top-48 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 bg-lime/[0.09] blur-[170px]" />
        <Glow className="top-44 -left-40 h-[360px] w-[460px] bg-lime/[0.045] blur-[140px]" />
        <Glow className="top-28 -right-40 h-[320px] w-[420px] bg-violet/[0.06] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 text-center md:px-8 md:pb-24 md:pt-20">
          <Reveal early>
            <Badge>About CONVRT</Badge>
            <h1 id="about-h1" className="mt-7 font-display font-bold leading-[1.04] tracking-display-xl text-ink" style={{ fontSize: 'clamp(2.5rem, 6.4vw, 4.9rem)' }}>
              <span className="block">About</span>{' '}
              <span className="block text-lime">CONVRT Studio</span>
            </h1>
            <p className={`mx-auto mt-6 max-w-2xl text-balance text-base text-ink-muted md:text-lg ${lh}`}><Inline text={about.intro} /></p>
          </Reveal>
        </div>
      </section>

      {/* ── At a glance ── */}
      <section aria-labelledby="about-glance" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <h2 id="about-glance" className={`text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{GLANCE.heading}</h2>
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list(GLANCE).map((li, i) => {
              const [label, text] = splitLabel(li)
              return (
                <li key={label}>
                  <Reveal delay={(i % 3) * 90} className="h-full">
                    <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lime/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{label}</h3>
                      <p className={`mt-3 text-[15px] text-ink-muted ${lh}`}><Inline text={text} /></p>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── What we do ── */}
      <section aria-labelledby="about-what" className="relative overflow-x-clip py-14 md:py-20">
        <Glow className="left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 bg-lime/[0.04] blur-[150px]" />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <Badge>{WHAT.heading}</Badge>
            <h2 id="about-what" className={`mx-auto mt-6 max-w-3xl text-balance text-[1.7rem] sm:text-[2.1rem] md:text-[2.5rem] ${h2Class}`}>{whatIntro}</h2>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {services.map((sv, i) => (
              <li key={sv.href}>
                <Reveal delay={i * 90} className="h-full">
                  <a href={hrefFor(sv.href)} className="group block h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lime/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime/30 bg-lime/10 text-sm font-bold tabular-nums text-lime" aria-hidden="true">{`0${i + 1}`}</span>
                    <h3 className="mt-5 font-display text-xl font-bold leading-snug tracking-snug text-ink transition-colors group-hover:text-lime md:text-[1.4rem]">{sv.name}</h3>
                    <p className={`mt-3 text-[15px] text-ink-muted md:text-base ${lh}`}>{sv.text}</p>
                  </a>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal>
            <p className={`mx-auto mt-8 max-w-2xl text-center text-base text-ink-muted ${lh}`}><Inline text={whatOutro} /></p>
          </Reveal>
        </div>
      </section>

      {/* ── A founder-led studio ── */}
      <section aria-labelledby="about-founder" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-10 md:px-12 md:py-14">
            <Glow className="-top-24 left-1/2 h-[300px] w-[640px] -translate-x-1/2 bg-lime/10 blur-[120px]" />
            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-5">
                <div className="inline-flex items-center gap-2.5">
                  <span className="h-px w-8 bg-lime" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Behind CONVRT</span>
                </div>
                <h2 id="about-founder" className={`mt-6 text-[1.9rem] sm:text-4xl md:text-[2.5rem] ${h2Class}`}>{FOUNDER.heading}</h2>
              </Reveal>
              <Reveal delay={120} className="space-y-5 lg:col-span-7">
                {strings(FOUNDER).map((p, i) => <p key={i} className={`text-base text-ink-muted md:text-lg ${lh}`}><Inline text={p} /></p>)}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── The founder's experience: the four figures, with the disclosure always printed ── */}
      <section aria-labelledby="about-figures" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal className="text-center">
            <h2 id="about-figures" className={`text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{EXPERIENCE.heading}</h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {FIGURES.map(([key, label], i) => (
              <li key={key}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 px-4 py-7 text-center md:py-9">
                    <p className="font-display text-[1.9rem] font-bold tabular-nums leading-none tracking-display text-lime sm:text-4xl md:text-[2.6rem]">{CONVRT_STATS[key]}</p>
                    <p className="mt-3 text-sm leading-snug text-ink-muted">{label}<span aria-hidden="true">*</span></p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <p className={`mx-auto mt-6 max-w-3xl text-center text-[13.5px] text-ink-muted ${lh}`}>*{' '}<Inline text={strings(EXPERIENCE)[0]} /></p>
          </Reveal>
        </div>
      </section>

      {/* ── How we work with creators ── */}
      <section aria-labelledby="about-creators" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">Real people on camera</span>
              </div>
              <h2 id="about-creators" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{CREATORS.heading}</h2>
            </Reveal>
            <Reveal delay={120} className="space-y-6 lg:col-span-7">
              {strings(CREATORS).map((p, i) => (i === 0
                ? <p key={i} className="rounded-3xl border border-lime/30 bg-lime/[0.06] px-6 py-5 text-base font-medium leading-relaxed text-ink md:text-lg"><Inline text={p} /></p>
                : <p key={i} className={`text-base text-ink-muted md:text-lg ${lh}`}><Inline text={p} /></p>))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Markets, production and languages ── */}
      <section aria-labelledby="about-markets" className="relative overflow-hidden py-14 md:py-20">
        <Glow className="left-1/2 top-1/2 h-[480px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-lime/[0.05] blur-[150px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <Badge>Without borders</Badge>
            <h2 id="about-markets" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{MARKETS.heading}</h2>
            {strings(MARKETS).map((p, i) => <p key={i} className={`mt-6 text-balance text-base text-ink-muted md:text-lg ${lh}`}><Inline text={p} /></p>)}
          </Reveal>
        </div>
      </section>

      {/* ── What we provide, and what we do not ── */}
      <section aria-labelledby="about-scope" className="relative overflow-x-clip py-14 md:py-20">
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <Badge>Scope</Badge>
            <h2 id="about-scope" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{SCOPE.heading}</h2>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {strings(SCOPE).map((p, i) => {
              const [title, rest] = splitTitle(p)
              return (
                <li key={title}>
                  <Reveal delay={i * 90} className="h-full">
                    <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 md:p-8">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime/30 bg-lime/10 text-sm font-bold tabular-nums text-lime" aria-hidden="true">{`0${i + 1}`}</span>
                      <h3 className="mt-5 font-display text-xl font-bold leading-snug tracking-snug text-ink md:text-[1.4rem]">{title}.</h3>
                      <p className={`mt-3 text-[15px] text-ink-muted md:text-base ${lh}`}><Inline text={rest} /></p>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ── See the work and talk to us ── */}
      <section aria-labelledby="about-cta" className="relative py-14 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-12 text-center md:px-12 md:py-16">
              <Glow className="-top-24 left-1/2 h-[320px] w-[700px] -translate-x-1/2 bg-lime/10 blur-[120px]" />
              <Glow className="-bottom-28 right-[-8%] h-[260px] w-[420px] bg-violet/[0.12] blur-[110px]" />
              <div className="relative">
                <Badge>Work with us</Badge>
                <h2 id="about-cta" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{CLOSING.heading}</h2>
                <p className={`mx-auto mt-5 max-w-xl text-balance text-base text-ink-muted md:text-lg ${lh}`}><Inline text={closingText} /></p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <a
                    href={hrefFor(OFFER_PATHS.roadmap)}
                    onClick={() => trackEvent('about_roadmap_cta_click')}
                    className="cta-gradient inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-canvas shadow-[0_0_0_1px_rgba(213,255,64,0.4),0_10px_40px_-12px_rgba(213,255,64,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    Get 5 Free Ad Concepts <span aria-hidden="true">{forward()}</span>
                  </a>
                  <a
                    href={hrefFor('/#services')}
                    onClick={() => trackEvent('about_services_cta_click')}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-hairline-strong px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    Explore our services
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
