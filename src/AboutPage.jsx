import { useEffect, useRef } from 'react'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { OFFER_PATHS } from './config.js'
import { CONVRT_STATS } from './lib/siteStats.js'
import { ABOUT_COPY } from './content/aboutCopy.js'
import { currentLocale } from './i18n/locale.js'
import { hrefFor } from './i18n/tr.js'
import { localizeStat } from './i18n/format.js'
import { frTypography } from './i18n/fr/typography.js'
import { forward } from './lib/rtl.js'
import { Reveal } from './components/roadmap/shared.jsx'
import EnglishAbout from './components/about/EnglishAbout.jsx'
import { Badge, Glow } from './components/about/aboutParts.jsx'

/* ABOUT (/about, /es/about, /fr/about, /ar/about).

   English: the SAME premium layout (src/components/about/EnglishAbout.jsx), built from the unchanged English text in src/content/trustPages.js.
   Spanish, French and Arabic: ONE premium page built from the owner-approved copy (src/content/aboutCopy.js): hero, philosophy, approach cards, "behind CONVRT", the founder-experience figures with their
   visible disclosure, markets, and a closing call to action. The same dark canvas, lime accents and entrance animations as the rest of the site; Arabic is right-to-left through the site's automatic mirroring.

   Rules kept (CLAUDE.md, GEO Work Packages 1-2): the four figures are the FOUNDER's combined professional experience and the disclosure is always printed under them; no offices, awards, ratings, team members,
   certifications or client claims are added; multilingual production is a capability, not a promise that every creator speaks every language. */

export default function AboutPage() {
  const locale = currentLocale()
  if (locale === 'en') return <EnglishAbout />
  return <LocalizedAbout locale={locale} />
}

function LocalizedAbout({ locale }) {
  const c = ABOUT_COPY[locale]
  const rtl = locale === 'ar'
  const t = locale === 'fr' ? frTypography : (s) => s
  useDocumentHead(pageHead(PATHS.about))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('about_page_view')
  }, [])

  const lh = rtl ? 'leading-[1.9]' : 'leading-relaxed'
  const h2Class = `font-display font-bold text-ink ${rtl ? 'leading-[1.35]' : 'leading-[1.06] tracking-display'}`
  const stats = [
    ['videos', CONVRT_STATS.videos],
    ['views', CONVRT_STATS.views],
    ['clients', CONVRT_STATS.clients],
    ['returningClients', CONVRT_STATS.returningClients],
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="about-h1" className="relative overflow-x-clip">
        <Glow className="-top-48 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 bg-lime/[0.09] blur-[170px]" />
        <Glow className="top-44 -left-40 h-[360px] w-[460px] bg-lime/[0.045] blur-[140px]" />
        <Glow className="top-28 -right-40 h-[320px] w-[420px] bg-violet/[0.06] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 text-center md:px-8 md:pb-24 md:pt-20">
          <Reveal early>
            <Badge>{t(c.hero.badge)}</Badge>
            <h1 id="about-h1" className={`mt-7 font-display font-bold text-ink ${rtl ? 'leading-[1.3]' : 'leading-[1.04] tracking-display-xl'}`} style={{ fontSize: rtl ? 'clamp(2.3rem, 6.4vw, 4.6rem)' : 'clamp(2.5rem, 6.4vw, 4.9rem)' }}>
              <span className="block">{t(c.hero.h1[0])}</span>
              <span className="block text-lime">{t(c.hero.h1[1])}</span>
            </h1>
            {c.hero.body.map((p, i) => (
              <p key={i} className={`mx-auto mt-6 max-w-2xl text-balance text-base text-ink-muted md:text-lg ${lh}`}>{t(p)}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section aria-labelledby="about-philosophy" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-6">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{t(c.philosophy.badge)}</span>
              </div>
              <h2 id="about-philosophy" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>
                <span className="block">{t(c.philosophy.h2[0])}</span>
                <span className="block text-lime">{t(c.philosophy.h2[1])}</span>
              </h2>
            </Reveal>
            <Reveal delay={120} className="lg:col-span-6">
              <p className={`rounded-3xl border border-lime/30 bg-lime/[0.06] px-6 py-5 font-display text-xl font-semibold text-ink md:text-2xl ${rtl ? 'leading-[1.6]' : 'leading-snug'}`}>{t(c.philosophy.lead)}</p>
              {c.philosophy.body.map((p, i) => <p key={i} className={`mt-6 text-base text-ink-muted md:text-lg ${lh}`}>{t(p)}</p>)}
              <p className={`mt-6 border-s-2 border-lime ps-5 text-base font-medium text-ink md:text-lg ${lh}`}>{t(c.philosophy.closing)}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Approach ── */}
      <section aria-labelledby="about-approach" className="relative overflow-x-clip py-14 md:py-20">
        <Glow className="left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 bg-lime/[0.04] blur-[150px]" />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <Badge>{t(c.approach.badge)}</Badge>
            <h2 id="about-approach" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>
              {t(c.approach.h2[0])} <span className="text-lime">{t(c.approach.h2[1])}</span>
            </h2>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {c.approach.items.map((it, i) => (
              <li key={it.title}>
                <Reveal delay={i * 90} className="h-full">
                  <div className="group h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lime/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime/30 bg-lime/10 text-sm font-bold tabular-nums text-lime" aria-hidden="true">{`0${i + 1}`}</span>
                    <h3 className={`mt-5 font-display text-xl font-bold text-ink md:text-[1.4rem] ${rtl ? 'leading-[1.5]' : 'leading-snug tracking-snug'}`}>{t(it.title)}</h3>
                    <p className={`mt-3 text-[15px] text-ink-muted md:text-base ${lh}`}>{t(it.text)}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Behind CONVRT ── */}
      <section aria-labelledby="about-behind" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-10 md:px-12 md:py-14">
            <Glow className="-top-24 left-1/2 h-[300px] w-[640px] -translate-x-1/2 bg-lime/10 blur-[120px]" />
            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-5">
                <div className="inline-flex items-center gap-2.5">
                  <span className="h-px w-8 bg-lime" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{t(c.behind.badge)}</span>
                </div>
                <h2 id="about-behind" className={`mt-6 text-[1.9rem] sm:text-4xl md:text-[2.5rem] ${h2Class}`}>
                  <span className="block">{t(c.behind.h2[0])}</span>
                  <span className="block text-lime">{t(c.behind.h2[1])}</span>
                </h2>
              </Reveal>
              <Reveal delay={120} className="space-y-5 lg:col-span-7">
                {c.behind.body.map((p, i) => <p key={i} className={`text-base text-ink-muted md:text-lg ${lh}`}>{t(p)}</p>)}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Figures (the founder's combined professional experience; the disclosure is always printed) ── */}
      <section aria-labelledby="about-figures" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal className="text-center">
            <Badge><span id="about-figures">{t(c.figures.badge)}</span></Badge>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {stats.map(([key, value], i) => (
              <li key={key}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 px-4 py-7 text-center md:py-9">
                    <p dir="ltr" className="font-display text-[1.9rem] font-bold tabular-nums leading-none tracking-display text-lime sm:text-4xl md:text-[2.6rem]">
                      {t(localizeStat(locale, value))}
                    </p>
                    <p className={`mt-3 text-sm text-ink-muted ${rtl ? 'leading-[1.7]' : 'leading-snug'}`}>{t(c.figures.labels[key])}<span aria-hidden="true">*</span></p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className={`mx-auto mt-6 max-w-2xl text-center text-[13px] text-ink-muted ${rtl ? 'leading-[1.8]' : 'leading-snug'}`}>*{' '}{t(c.figures.footnote)}</p>
        </div>
      </section>

      {/* ── Without borders ── */}
      <section aria-labelledby="about-borderless" className="relative overflow-hidden py-14 md:py-20">
        <Glow className="left-1/2 top-1/2 h-[480px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-lime/[0.05] blur-[150px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <Badge>{t(c.borderless.badge)}</Badge>
            <h2 id="about-borderless" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>
              <span className="block">{t(c.borderless.h2[0])}</span>
              <span className="block text-lime">{t(c.borderless.h2[1])}</span>
            </h2>
            {c.borderless.body.map((p, i) => <p key={i} className={`mt-6 text-balance text-base text-ink-muted md:text-lg ${lh}`}>{t(p)}</p>)}
          </Reveal>
        </div>
      </section>

      {/* ── Work with us ── */}
      <section aria-labelledby="about-cta" className="relative py-14 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-12 text-center md:px-12 md:py-16">
              <Glow className="-top-24 left-1/2 h-[320px] w-[700px] -translate-x-1/2 bg-lime/10 blur-[120px]" />
              <Glow className="-bottom-28 right-[-8%] h-[260px] w-[420px] bg-violet/[0.12] blur-[110px]" />
              <div className="relative">
                <Badge>{t(c.cta.badge)}</Badge>
                <h2 id="about-cta" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>
                  <span className="block">{t(c.cta.h2[0])}</span>
                  <span className="block text-lime">{t(c.cta.h2[1])}</span>
                </h2>
                <p className={`mx-auto mt-5 max-w-xl text-balance text-base text-ink-muted md:text-lg ${lh}`}>{t(c.cta.body)}</p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <a
                    href={hrefFor(OFFER_PATHS.roadmap)}
                    onClick={() => trackEvent('about_roadmap_cta_click')}
                    className="cta-gradient inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-canvas shadow-[0_0_0_1px_rgba(213,255,64,0.4),0_10px_40px_-12px_rgba(213,255,64,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {t(c.cta.primary)} <span aria-hidden="true">{forward()}</span>
                  </a>
                  <a
                    href={hrefFor('/#services')}
                    onClick={() => trackEvent('about_services_cta_click')}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-hairline-strong px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {t(c.cta.secondary)}
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
