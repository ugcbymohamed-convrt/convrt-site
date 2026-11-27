import { useEffect, useRef } from 'react'
import { captureAttribution, trackEvent } from '../../lib/analytics.js'
import { useDocumentHead } from '../../lib/useDocumentHead.js'
import { pageHead } from '../../seo/siteSeo.js'
import { PATHS } from '../../routes.js'
import { OFFER_PATHS } from '../../config.js'
import { CONVRT_STATS } from '../../lib/siteStats.js'
import { hrefFor } from '../../i18n/tr.js'
import { localizeStat } from '../../i18n/format.js'
import { frTypography } from '../../i18n/fr/typography.js'
import { forward } from '../../lib/rtl.js'
import { Reveal } from '../roadmap/shared.jsx'
import { Inline } from '../../TrustPage.jsx'
import { Badge, Glow } from './aboutParts.jsx'

/* ABOUT PAGE LAYOUT (/about, /es/about, /fr/about, /ar/about): ONE premium layout for all four languages. It takes a normalized content object, so the words never live in the layout:
     English  → src/content/about/english.js (an adapter over TRUST_CONTENT.about in src/content/trustPages.js: the English words are unchanged)
     Spanish, French, Arabic → src/content/about/{es,fr,ar}.js (the owner's professionally localized copy, copied verbatim).

   Content shape (every field is a string unless noted; text fields may carry [[label|target]] link tokens, rendered by <Inline>):
     badge, h1 { lead, accent }, intro,
     glance { heading, items [{ label, text }] },
     what { badge, lead, services [{ name, href, text }], outro },
     founder { badge, heading, paragraphs [] },
     experience { heading, labels { videos, views, clients, returningClients }, disclaimer },
     creators { badge, heading, paragraphs [] }   (the first paragraph is the highlighted one),
     markets { badge, heading, paragraphs [] },
     scope { badge, heading, items [{ title, text, mark? }] },
     closing { badge, heading, text, primary, secondary }.

   Sections: hero, "at a glance" fact cards, service cards, "behind CONVRT" panel, the founder-experience figures with their disclosure ALWAYS printed (the four figures come from src/lib/siteStats.js through
   localizeStat, never from the copy), real people on camera, markets, scope cards and a closing call to action, on the site's dark canvas with lime accents and entrance animations. Arabic is right-to-left
   through the site's automatic mirroring (scripts/postcss-rtl-flip.js); the Arabic line-heights and type sizes below are the ones the localized page already used, and Latin names, numbers and identifiers inside
   Arabic text are isolated by <Inline rtl>. For English every class string is identical to the page that existed before this layout was shared (tests/about-localized.test.mjs pins the words).

   Rules kept (CLAUDE.md, GEO Work Packages 1-2): the four figures are the FOUNDER's combined professional experience and the disclosure is always printed under them; no offices, awards, ratings, team members,
   certifications or client claims are added; multilingual production is a capability, not a promise that every creator speaks every language. */

const FIGURE_KEYS = ['videos', 'views', 'clients', 'returningClients']

export default function AboutLayout({ content: c, locale }) {
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
  const h2Class = rtl ? 'font-display font-bold text-ink leading-[1.35]' : 'font-display font-bold leading-[1.06] tracking-display text-ink'
  const cardH3 = rtl ? 'leading-[1.5]' : 'leading-snug tracking-snug'
  const text = (s) => <Inline text={t(s)} rtl={rtl} />

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="about-h1" className="relative overflow-x-clip">
        <Glow className="-top-48 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 bg-lime/[0.09] blur-[170px]" />
        <Glow className="top-44 -left-40 h-[360px] w-[460px] bg-lime/[0.045] blur-[140px]" />
        <Glow className="top-28 -right-40 h-[320px] w-[420px] bg-violet/[0.06] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-14 text-center md:px-8 md:pb-24 md:pt-20">
          <Reveal early>
            <Badge>{t(c.badge)}</Badge>
            <h1
              id="about-h1"
              className={rtl ? 'mt-7 font-display font-bold text-ink leading-[1.3]' : 'mt-7 font-display font-bold leading-[1.04] tracking-display-xl text-ink'}
              style={{ fontSize: rtl ? 'clamp(2.3rem, 6.4vw, 4.6rem)' : 'clamp(2.5rem, 6.4vw, 4.9rem)' }}
            >
              <span className="block">{t(c.h1.lead)}</span>{' '}
              <span className="block text-lime">{t(c.h1.accent)}</span>
            </h1>
            <p className={`mx-auto mt-6 max-w-2xl text-balance text-base text-ink-muted md:text-lg ${lh}`}>{text(c.intro)}</p>
          </Reveal>
        </div>
      </section>

      {/* ── At a glance ── */}
      <section aria-labelledby="about-glance" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <h2 id="about-glance" className={`text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{t(c.glance.heading)}</h2>
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.glance.items.map(({ label, text: body }, i) => (
              <li key={label}>
                <Reveal delay={(i % 3) * 90} className="h-full">
                  <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lime/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{t(label)}</h3>
                    <p className={`mt-3 text-[15px] text-ink-muted ${lh}`}>{text(body)}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What we do ── */}
      <section aria-labelledby="about-what" className="relative overflow-x-clip py-14 md:py-20">
        <Glow className="left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 bg-lime/[0.04] blur-[150px]" />
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <Badge>{t(c.what.badge)}</Badge>
            <h2 id="about-what" className={`mx-auto mt-6 max-w-3xl text-balance text-[1.7rem] sm:text-[2.1rem] md:text-[2.5rem] ${h2Class}`}>{t(c.what.lead)}</h2>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {c.what.services.map((sv, i) => (
              <li key={sv.href}>
                <Reveal delay={i * 90} className="h-full">
                  <a href={hrefFor(sv.href)} className="group block h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lime/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:p-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime/30 bg-lime/10 text-sm font-bold tabular-nums text-lime" aria-hidden="true">{`0${i + 1}`}</span>
                    <h3 className={`mt-5 font-display text-xl font-bold ${cardH3} text-ink transition-colors group-hover:text-lime md:text-[1.4rem]`}>{t(sv.name)}</h3>
                    <p className={`mt-3 text-[15px] text-ink-muted md:text-base ${lh}`}>{t(sv.text)}</p>
                  </a>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal>
            <p className={`mx-auto mt-8 max-w-2xl text-center text-base text-ink-muted ${lh}`}>{text(c.what.outro)}</p>
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
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{t(c.founder.badge)}</span>
                </div>
                <h2 id="about-founder" className={`mt-6 text-[1.9rem] sm:text-4xl md:text-[2.5rem] ${h2Class}`}>{t(c.founder.heading)}</h2>
              </Reveal>
              <Reveal delay={120} className="space-y-5 lg:col-span-7">
                {c.founder.paragraphs.map((p, i) => <p key={i} className={`text-base text-ink-muted md:text-lg ${lh}`}>{text(p)}</p>)}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── The founder's experience: the four figures, with the disclosure always printed ── */}
      <section aria-labelledby="about-figures" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal className="text-center">
            <h2 id="about-figures" className={`text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{t(c.experience.heading)}</h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {FIGURE_KEYS.map((key, i) => (
              <li key={key}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 px-4 py-7 text-center md:py-9">
                    <p {...(locale === 'en' ? {} : { dir: 'ltr' })} className="font-display text-[1.9rem] font-bold tabular-nums leading-none tracking-display text-lime sm:text-4xl md:text-[2.6rem]">{t(localizeStat(locale, CONVRT_STATS[key]))}</p>
                    <p className={rtl ? 'mt-3 text-sm text-ink-muted leading-[1.7]' : 'mt-3 text-sm leading-snug text-ink-muted'}>{t(c.experience.labels[key])}<span aria-hidden="true">*</span></p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <p className={`mx-auto mt-6 max-w-3xl text-center text-[13.5px] text-ink-muted ${rtl ? 'leading-[1.8]' : 'leading-relaxed'}`}>*{' '}{text(c.experience.disclaimer)}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Real people on camera: how we work with creators ── */}
      <section aria-labelledby="about-creators" className="relative py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{t(c.creators.badge)}</span>
              </div>
              <h2 id="about-creators" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{t(c.creators.heading)}</h2>
            </Reveal>
            <Reveal delay={120} className="space-y-6 lg:col-span-7">
              {c.creators.paragraphs.map((p, i) => (i === 0
                ? <p key={i} className={`rounded-3xl border border-lime/30 bg-lime/[0.06] px-6 py-5 text-base font-medium ${rtl ? 'leading-[1.9]' : 'leading-relaxed'} text-ink md:text-lg`}>{text(p)}</p>
                : <p key={i} className={`text-base text-ink-muted md:text-lg ${lh}`}>{text(p)}</p>))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Markets, production and languages ── */}
      <section aria-labelledby="about-markets" className="relative overflow-hidden py-14 md:py-20">
        <Glow className="left-1/2 top-1/2 h-[480px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-lime/[0.05] blur-[150px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <Badge>{t(c.markets.badge)}</Badge>
            <h2 id="about-markets" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{t(c.markets.heading)}</h2>
            {c.markets.paragraphs.map((p, i) => <p key={i} className={`mt-6 text-balance text-base text-ink-muted md:text-lg ${lh}`}>{text(p)}</p>)}
          </Reveal>
        </div>
      </section>

      {/* ── What we provide, and what we do not ── */}
      <section aria-labelledby="about-scope" className="relative overflow-x-clip py-14 md:py-20">
        <div className="relative mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <Badge>{t(c.scope.badge)}</Badge>
            <h2 id="about-scope" className={`mt-6 text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{t(c.scope.heading)}</h2>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {c.scope.items.map(({ title, mark, text: body }, i) => (
              <li key={title}>
                <Reveal delay={i * 90} className="h-full">
                  <div className="h-full rounded-3xl border border-hairline-strong bg-surface-1/70 p-6 md:p-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-lime/30 bg-lime/10 text-sm font-bold tabular-nums text-lime" aria-hidden="true">{`0${i + 1}`}</span>
                    <h3 className={`mt-5 font-display text-xl font-bold ${cardH3} text-ink md:text-[1.4rem]`}>{t(title)}{mark || null}</h3>
                    <p className={`mt-3 text-[15px] text-ink-muted md:text-base ${lh}`}>{text(body)}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Closing call to action ── */}
      <section aria-labelledby="about-cta" className="relative py-14 md:py-24">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-12 text-center md:px-12 md:py-16">
              <Glow className="-top-24 left-1/2 h-[320px] w-[700px] -translate-x-1/2 bg-lime/10 blur-[120px]" />
              <Glow className="-bottom-28 right-[-8%] h-[260px] w-[420px] bg-violet/[0.12] blur-[110px]" />
              <div className="relative">
                {c.closing.badge ? <Badge>{t(c.closing.badge)}</Badge> : null}
                <h2 id="about-cta" className={`${c.closing.badge ? 'mt-6 ' : ''}text-[2rem] sm:text-[2.6rem] md:text-5xl ${h2Class}`}>{t(c.closing.heading)}</h2>
                <p className={`mx-auto mt-5 max-w-xl text-balance text-base text-ink-muted md:text-lg ${lh}`}>{text(c.closing.text)}</p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <a
                    href={hrefFor(OFFER_PATHS.roadmap)}
                    onClick={() => trackEvent('about_roadmap_cta_click')}
                    className="cta-gradient inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-canvas shadow-[0_0_0_1px_rgba(213,255,64,0.4),0_10px_40px_-12px_rgba(213,255,64,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {`${t(c.closing.primary)} `}<span aria-hidden="true">{forward()}</span>
                  </a>
                  <a
                    href={hrefFor('/#services')}
                    onClick={() => trackEvent('about_services_cta_click')}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-hairline-strong px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {t(c.closing.secondary)}
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
