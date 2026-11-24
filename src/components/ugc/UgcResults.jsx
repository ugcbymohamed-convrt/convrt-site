import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { ELYON_PROOF, UGC_TESTIMONIALS } from '../../content/ugcProof.js'
import { Section, Head, Reveal, RoadmapCta, TextLink } from './shared.jsx'
import { useAutoplayAllowed } from './creatorVideo.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeStat } from '../../i18n/format.js'
import { formatMoneyEs } from '../../i18n/es/money.js'
import { ES_REVIEWS } from '../../i18n/es/reviews.js'
import { editorial } from '../../i18n/editorial.js'
import ClientQuote from '../ClientQuote.jsx'

/* SECTION 4: results and client feedback, in one compact block.
   • Elyon 5.28x: ONE individual creator-led UGC video, client-reported, early learning phase, never typical or guaranteed (wording
     and figures: src/content/ugcProof.js, tested). The two client messages that source those figures are shown as clean message cards
     (the text is the client's own, verbatim), not as screenshots.
   • Testimonials: verbatim, attributed exactly as on the homepage; logos are the ones the homepage already shows.
   • No stars, ratings, repeat-order counts or other derived statistics. The left card is kept short on purpose. */

const LOGOS = {
  adscale: { src: '/clients/adscale.png', alt: 'Adscale', w: 531, h: 149 },
  elyon: { src: '/clients/elyon.png', alt: 'Elyon Dubai', w: 600, h: 226 },
}
/* The client's own messages, word for word (as published in the Elyon case study). English only: they are the client's raw wording (typos included), so a translated page states the same facts in its own words instead of showing them. */
const CLIENT_MESSAGES = ['It has 9 sales with an revenue of 3421.25$', 'Roas 5.28']

/* One-time number reveal: the page text is always the final figure ("5.28x"); when it scrolls into view it counts up once, over about
   a second, and settles on the same text. Skipped for reduced-motion visitors. */
function RoasNumber({ value, locale }) {
  const [shown, setShown] = useState(null)
  const ref = useRef(null)
  const autoplay = useAutoplayAllowed()
  useEffect(() => {
    const el = ref.current
    if (!autoplay || !el || typeof IntersectionObserver === 'undefined') return undefined
    const target = parseFloat(value)
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min((now - t0) / 1100, 1)
        setShown(target * (1 - (1 - p) ** 3))
        if (p < 1) raf = requestAnimationFrame(tick); else setShown(null)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.6 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [autoplay, value])
  return <span ref={ref} className="tabular-nums">{shown == null ? localizeStat(locale, value) : localizeStat(locale, `${shown.toFixed(2)}x`)}</span>
}

export default function UgcResults() {
  const e = ELYON_PROOF
  const locale = currentLocale()
  const revenue = locale === 'en' ? e.revenue : editorial(locale).formatMoney({ amount: Number(e.revenue.replace(/[$,]/g, '')), currency: 'USD' })
  return (
    <Section id="results" label="ugc-results-heading" glow>
      <Reveal>
        <Head id="ugc-results-heading" eyebrow={tr('Results & client feedback')} title={tr('What clients see. What clients say.')} />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-7">
          <div className="relative h-full overflow-hidden rounded-[28px] border border-lime/25 bg-surface-1 p-6 md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-lime/[0.12] blur-[90px]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{e.brand} · {tr(e.category)}</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-[4.25rem] font-bold leading-none tracking-display-xl text-lime sm:text-[5.5rem]"><RoasNumber value={e.roas} locale={locale} /></span>
                <span className="font-display text-xl font-semibold text-ink md:text-2xl">{tr('ROAS, one UGC video')}</span>
              </p>
              {/* supporting metrics */}
              <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3 border-t border-hairline pt-5">
                {[[String(e.purchases), tr('Purchases')], [revenue, tr('Reported revenue')]].map(([v, l]) => (
                  <div key={l} className="flex flex-col">
                    <dd className="order-1 font-display text-2xl font-bold tabular-nums text-ink">{v}</dd>
                    <dt className="order-2 text-sm text-ink-muted">{l}</dt>
                  </div>
                ))}
              </dl>

              {/* the client's own messages: ONE evidence container, messages stacked and aligned together */}
              {locale === 'en' && <figure className="mt-5 rounded-2xl border border-lime/25 bg-canvas/60 p-4">
                <figcaption className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-lime">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime" />{tr('Client-reported results')}</figcaption>
                <ul className="space-y-2">
                  {CLIENT_MESSAGES.map((m) => (
                    <li key={m} lang={locale === 'en' ? undefined : 'en'} className="w-fit max-w-full rounded-2xl rounded-tl-md border border-white/10 bg-surface-2 px-4 py-2.5 text-[15px] font-medium leading-snug text-ink">
                      {m}
                    </li>
                  ))}
                </ul>
              </figure>}

              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-ink-muted">{tr('One individual creative, client-reported during an early learning phase. Not typical, not a guarantee. Results depend on brand, offer, audience and budget.')}</p>
              <p className="mt-2.5 text-[15px]">
                <TextLink href={e.caseStudyHref} onClick={() => trackEvent('ugc_case_study_click', { location: 'results' })}>{tr('Read the full Elyon case study')}{' '}<span aria-hidden="true">→</span>
                </TextLink>
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:col-span-5">
          {UGC_TESTIMONIALS.map((t, i) => {
            const logo = LOGOS[t.id]
            return (
              <Reveal key={t.id} delay={120 + i * 120} className="h-full">
                <figure className="relative flex h-full flex-col rounded-[28px] border border-hairline bg-surface-1/70 p-6 backdrop-blur-md md:p-7">
                  <span aria-hidden="true" className="absolute right-6 top-3 font-display text-6xl leading-none text-lime/25">&ldquo;</span>
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.w}
                    height={logo.h}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    className="h-7 w-auto max-w-[140px] object-contain object-left"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                  {locale === 'es' && ES_REVIEWS[t.id]
                    ? <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">«{ES_REVIEWS[t.id].full}»</blockquote>
                    : <ClientQuote text={t.quote} typographic className="mt-4 flex-1 text-[15px] leading-relaxed text-ink" innerClass="text-[15px] leading-relaxed text-ink" outerClass="mt-4 flex flex-1 flex-col gap-3" />}
                  <figcaption className="mt-4 text-sm text-ink-muted">
                    <span className="font-semibold text-ink">{t.brand}</span> · {locale === 'es' && ES_REVIEWS[t.id] ? ES_REVIEWS[t.id].category : tr(t.category)}
                  </figcaption>
                </figure>
              </Reveal>
            )
          })}
        </div>
      </div>

      {editorial(locale)?.testimonialsNote && <p className="mt-6 text-center text-[13px] text-ink-muted">{editorial(locale).testimonialsNote}</p>}

      <Reveal className="mt-8 flex justify-center">
        <RoadmapCta location="results" />
      </Reveal>
    </Section>
  )
}
