import { useEffect, useState } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import { ShowcasePhone } from './components/graspo/GraspoShowcase.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { OFFER_PATHS } from './config.js'
import { trackEvent } from './lib/analytics.js'
import { hrefFor } from './i18n/tr.js'
import { localizeStat } from './i18n/format.js'
import { selectShowcase } from './content/portfolio.js'
import { GRASPO_AR as C, IG_VIEWS, FB_VIEWS } from './content/graspoCaseAr.js'

/* /ar/case-studies/graspo: the Arabic Graspo case study (owner brief 2026-11-23). The English study (GraspoCaseStudyPage) is a long, English-only composition; this page keeps its visual language
   (same cards, lime accents, phones with verified view counts) and its verified content, in Arabic, in a shorter structure: hero and facts, the three headline figures, the challenge, what CONVRT
   did, the actual videos with their own view counts, the organic distribution, the bigger result and links into the rest of the Arabic site. Every figure comes from src/content/graspoCaseAr.js (which
   lists what is and is not used); the videos are the Arabic Graspo entries of src/content/portfolio.js (`views` = the figure published on the English study). */

const ACCENT = '#d5ff40'
const PCT_IG = (IG_VIEWS / (IG_VIEWS + FB_VIEWS)) * 100

const Eyebrow = ({ children }) => (
  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 backdrop-blur">
    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
    <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{children}</span>
  </div>
)
const H2 = ({ children, id }) => <h2 id={id} className="font-display font-bold text-ink tracking-display leading-[1.15] text-3xl md:text-[44px]">{children}</h2>

function useInView(threshold = 0.15) {
  const [el, setEl] = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!el) return undefined
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [el, threshold])
  return [setEl, visible]
}

export default function GraspoCaseStudyArPage() {
  useDocumentHead(pageHead('/case-studies/graspo'))
  const [distRef, distVisible] = useInView()
  const videos = selectShowcase('graspo')
  const maxTop = C.distribution.top[0].views

  return (
    <>
      <nav aria-label="مسار التنقل" className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href={hrefFor('/')} className="transition-colors hover:text-ink">الرئيسية</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">دراسة حالة Graspo</li>
        </ol>
      </nav>

      {/* hero */}
      <section aria-labelledby="graspo-ar-h1" className="relative overflow-hidden pt-10 pb-4 md:pt-16 md:pb-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.10] blur-[120px]" style={{ background: ACCENT }} />
        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center md:px-8">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur" style={{ borderColor: 'rgba(213,255,64,0.35)', background: 'rgba(213,255,64,0.08)' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-semibold tracking-[0.1em]" style={{ color: ACCENT }}>{C.eyebrow}</span>
          </div>
          <p className="font-display font-bold leading-[1.2] text-[clamp(1.9rem,5vw,3.4rem)]" style={{ color: ACCENT }}>{C.period}</p>
          <h1 id="graspo-ar-h1" className="mt-2 font-display font-bold text-ink leading-[1.25] text-[clamp(1.8rem,4.6vw,3.3rem)]">{C.h1}</h1>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-ink-muted md:text-lg">{C.lead}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={hrefFor(OFFER_PATHS.roadmap)} onClick={() => trackEvent('hero_creative_roadmap_click', { location: 'graspo_case_study' })} className="cta-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-canvas">
              {C.cta.label}
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href="https://www.instagram.com/graspo_khaleej/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-hairline px-7 py-3.5 text-sm font-medium text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink">
              {C.cta.instagramLabel}
            </a>
          </div>
          <div className="mt-10 rounded-3xl border border-hairline bg-surface-1/50 px-6 py-7 backdrop-blur-md md:px-10 md:py-8">
            <dl className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4 lg:gap-8">
              {C.facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-[11px] font-bold text-ink-subtle">{f.label}</dt>
                  <dd className="mt-2 text-[14px] font-medium leading-snug text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* the three headline figures */}
      <section aria-label="أرقام الدراسة" className="relative pt-4 pb-12 md:pt-6 md:pb-16">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
            {C.metrics.map((m) => (
              <div key={m.label} className="relative overflow-hidden rounded-3xl border border-hairline bg-surface-1/50 px-6 py-7 text-center backdrop-blur-md">
                <p className="font-display font-bold leading-none tabular-nums text-ink text-[clamp(1.9rem,4vw,2.6rem)]"><bdi>{localizeStat('ar', m.value)}</bdi></p>
                <p className="mt-3 text-[14px] font-semibold text-ink">{m.label}</p>
                <p className="mt-1 text-[12px] text-ink-subtle">{m.sub}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-ink-subtle">{C.source}</p>
        </div>
      </section>
      <SectionDivider />

      {/* the challenge */}
      <section aria-labelledby="graspo-ar-challenge" className="relative py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 text-center md:px-8">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>{C.challenge.eyebrow}</Eyebrow>
            <H2 id="graspo-ar-challenge">{C.challenge.title}</H2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-muted md:text-base">{C.challenge.lead}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {C.challenge.points.map((p) => (
              <div key={p.title} className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-6 transition-colors hover:border-hairline-strong">
                <h3 className="font-display text-lg font-semibold leading-snug text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* what CONVRT did */}
      <section aria-labelledby="graspo-ar-strategy" className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
          <div className="mx-auto mb-12 max-w-2xl md:mb-16">
            <Eyebrow>{C.strategy.eyebrow}</Eyebrow>
            <H2 id="graspo-ar-strategy">{C.strategy.title}</H2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-muted md:text-base">{C.strategy.lead}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {C.strategy.pillars.map((p) => (
              <div key={p.number} className="relative flex flex-col items-center overflow-hidden rounded-[28px] border border-hairline bg-surface-1/40 px-7 py-8 text-center transition-colors hover:border-hairline-strong">
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-4 -right-2 select-none font-display font-black leading-none opacity-[0.06]" style={{ fontSize: 'clamp(70px, 9vw, 110px)', color: ACCENT }}>{p.number}</span>
                <span className="relative text-xs font-bold" style={{ color: ACCENT }}>{p.tag}</span>
                <h3 className="relative mt-3 font-display text-lg font-bold leading-snug text-ink">{p.title}</h3>
                <p className="relative mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* the videos, each with its own verified view count */}
      {videos.length > 0 && (
        <section aria-labelledby="graspo-ar-content" className="relative overflow-hidden py-16 md:py-24">
          <div className="relative mx-auto max-w-7xl px-5 md:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
              <Eyebrow>{C.content.eyebrow}</Eyebrow>
              <H2 id="graspo-ar-content">{C.content.title}</H2>
              <p className="mt-6 text-[15px] leading-relaxed text-ink-muted md:text-base">{C.content.lead}</p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
              {videos.map((v) => (
                <ShowcasePhone key={v.id} video={{ id: v.source.cloudflareId }} labels={C.content.labels} viewsText={localizeStat('ar', v.views)} />
              ))}
            </div>
            <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-ink-subtle">{C.content.note}</p>
          </div>
        </section>
      )}
      <SectionDivider />

      {/* organic distribution */}
      <section aria-labelledby="graspo-ar-dist" className="relative py-16 md:py-24">
        <div ref={distRef} className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <Eyebrow>{C.distribution.eyebrow}</Eyebrow>
            <H2 id="graspo-ar-dist">{C.distribution.title}</H2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9 lg:col-span-7">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-sm font-semibold text-ink">{C.distribution.platformTitle}</p>
                <p className="text-xs text-ink-subtle">{C.distribution.total}</p>
              </div>
              <div dir="ltr" className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-surface-3">
                <div style={{ width: distVisible ? `${PCT_IG}%` : '0%', background: ACCENT, transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 0.1s' }} />
                <div style={{ width: distVisible ? `${100 - PCT_IG}%` : '0%', background: '#3b82f6', transition: 'width 1s cubic-bezier(0.22,1,0.36,1) 0.25s' }} />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-5">
                {[{ name: C.distribution.instagram, v: '6.27', pct: PCT_IG, c: ACCENT }, { name: C.distribution.facebook, v: '4.39', pct: 100 - PCT_IG, c: '#3b82f6' }].map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.c }} /><span className="text-xs font-semibold text-ink-muted">{p.name}</span></div>
                    <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink"><bdi>{p.v}</bdi> مليون</p>
                    <p className="text-[12px] text-ink-subtle"><bdi>{p.pct.toFixed(0)}%</bdi> {C.distribution.ofTotal}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex items-start gap-3 rounded-2xl px-5 py-4" style={{ background: 'rgba(213,255,64,0.08)', border: '1px solid rgba(213,255,64,0.25)' }}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(213,255,64,0.18)' }}>
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true"><path d="M4 10.5l4 4 8-9" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <p className="text-[13.5px] leading-relaxed text-ink-muted"><span className="font-semibold text-ink">{C.distribution.organicBold}</span> {C.distribution.organicRest}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-8 md:px-9 md:py-9 lg:col-span-5">
              <p className="mb-6 text-sm font-semibold text-ink">{C.distribution.topTitle}</p>
              <div className="space-y-4">
                {C.distribution.top.map((t, i) => (
                  <div key={t.label}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-[13px] text-ink-muted">{t.note}</span>
                      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink"><bdi>{t.label}</bdi></span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full" style={{ width: distVisible ? `${(t.views / maxTop) * 100}%` : '0%', background: ACCENT, opacity: 1 - i * 0.12, transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.08}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionDivider />

      {/* the bigger result */}
      <section aria-labelledby="graspo-ar-result" className="relative py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Eyebrow>{C.result.eyebrow}</Eyebrow>
          <h2 id="graspo-ar-result" className="font-display font-bold text-ink leading-[1.25] text-3xl md:text-[42px]">
            {C.result.title[0]} <span style={{ color: ACCENT }}>{C.result.title[1]}</span>
          </h2>
          <p className="mt-7 text-[15px] leading-relaxed text-ink-muted md:text-base">{C.result.p1}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-muted md:text-base">{C.result.p2}</p>
        </div>
      </section>

      {/* links into the rest of the Arabic site */}
      <section aria-labelledby="graspo-ar-links" className="relative pb-16 md:pb-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <h2 id="graspo-ar-links" className="mb-6 text-center font-display text-2xl font-bold text-ink">{C.links.title}</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {C.links.items.map((l) => (
              <li key={l.href}>
                <a href={hrefFor(l.href)} className="group block h-full rounded-3xl border border-hairline bg-surface-1/40 px-6 py-5 transition-colors hover:border-lime/50">
                  <span className="font-display text-lg font-semibold text-ink transition-colors group-hover:text-lime">{l.title}</span>
                  <span className="mt-1.5 block text-[13.5px] leading-relaxed text-ink-muted">{l.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <SectionDivider />
      <FinalCTA />
    </>
  )
}
