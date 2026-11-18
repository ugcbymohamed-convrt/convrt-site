import { trackEvent } from '../../lib/analytics.js'
import { formatMoney, SPRINT, USAGE_RIGHTS, PRODUCTION_LANGUAGES } from '../../seo/businessKnowledge.js'
import { posterUrl } from '../../content/ugcPortfolio.js'
import { RoadmapCta, GhostCta, Reveal } from './shared.jsx'

/* HERO. Primary CTA: the Free Creative Growth Roadmap. Secondary paths: pricing and the selected work.

   HERO VISUAL. Until approved creator videos exist, the right-hand visual is a DECORATIVE ILLUSTRATION of concepts and their
   two versions (ConceptIllustration): it carries no play icon and no footage, says so in its caption, and is hidden on phones (it is decoration, so the copy and CTAs come first). As soon as
   src/content/ugcPortfolio.js contains approved videos (approval.status + portfolioUse + creatorConsent), the same slot
   automatically becomes a poster showcase of up to three of them (VideoShowcase). Nothing here needs editing to swap. */

const facts = () => [
  { value: `From ${formatMoney(SPRINT.monthly)}/month`, sub: `Recurring packages. One-off from ${formatMoney(SPRINT.oneOff)}. Excl. VAT.` },
  { value: `${SPRINT.turnaroundBusinessDays} business days`, sub: 'Production, from script approval.' },
  { value: `${USAGE_RIGHTS.includedMonths} months`, sub: 'Worldwide usage rights included, extendable.' },
  { value: 'Multilingual', sub: `${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')}, ${PRODUCTION_LANGUAGES.core.at(-1)} and more on request.` },
]

const TONES = [
  { ring: 'rgba(139,92,246,0.5)', glow: 'rgba(139,92,246,0.38)', text: '#c4b5fd' },
  { ring: 'rgba(213,255,64,0.5)', glow: 'rgba(213,255,64,0.30)', text: '#d5ff40' },
  { ring: 'rgba(255,106,77,0.5)', glow: 'rgba(255,106,77,0.32)', text: '#ff9d8a' },
]

/* Decorative: three concept cards, each in two versions. Deliberately not video-shaped UI (no play button, no timeline). */
function ConceptIllustration() {
  const cards = [
    { n: '01', t: TONES[0], pos: 'left-[2%] top-[10%] -rotate-6 z-10', self: 'self-start' },
    { n: '02', t: TONES[1], pos: 'left-1/2 -translate-x-1/2 top-0 z-20', self: 'self-start' },
    { n: '03', t: TONES[2], pos: 'right-[2%] top-[10%] rotate-6 z-10', self: 'self-end' },
  ]
  return (
    <figure className="m-0 hidden sm:block">
      <div aria-hidden="true" className="relative mx-auto h-[360px] w-full max-w-[460px] sm:h-[430px]">
        {cards.map((c) => (
          <div
            key={c.n}
            className={`absolute aspect-[9/16] w-[44%] rounded-[26px] border bg-surface-1 ${c.pos}`}
            style={{ borderColor: c.t.ring, boxShadow: `0 0 50px -12px ${c.t.glow}, 0 30px 60px -30px rgba(0,0,0,0.9)` }}
          >
            <div className="absolute inset-0 rounded-[26px]" style={{ background: `radial-gradient(120% 80% at 50% 0%, ${c.t.glow}, transparent 70%)` }} />
            <div className="relative flex h-full flex-col justify-between p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Concept</span>
              <span className={`${c.self} font-display text-5xl font-bold leading-none tracking-display sm:text-6xl`} style={{ color: c.t.text }}>{c.n}</span>
              <div className="flex w-full flex-col gap-1.5">
                {['Version A', 'Version B'].map((v) => (
                  <span key={v} className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-center text-[10px] font-medium text-ink-muted">{v}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-[13px] text-ink-muted">Illustration: concepts, each in two versions.</figcaption>
    </figure>
  )
}

/* Real approved videos: posters link to the portfolio, where they play on tap. */
function VideoShowcase({ items }) {
  const shown = items.slice(0, 3)
  const rot = shown.length === 1 ? ['rotate-0'] : shown.length === 2 ? ['-rotate-3', 'rotate-3'] : ['-rotate-6', 'rotate-0', 'rotate-6']
  return (
    <div className="relative mx-auto flex h-[360px] w-full max-w-[460px] items-center justify-center sm:h-[430px]">
      {shown.map((item, i) => (
        <a
          key={item.id}
          href="#work"
          aria-label={`Watch: ${item.caption}`}
          className={`absolute aspect-[9/16] w-[44%] overflow-hidden rounded-[26px] border border-hairline-strong shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ${rot[i]}`}
          style={{ left: shown.length === 1 ? '28%' : `${4 + i * (shown.length === 2 ? 36 : 25)}%`, zIndex: i === 1 ? 20 : 10 }}
        >
          <img src={posterUrl(item)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur">
            <svg viewBox="0 0 12 12" className="ml-0.5 h-4 w-4 text-ink" fill="currentColor"><path d="M3 1.8v8.4L10 6z" /></svg>
          </span>
        </a>
      ))}
    </div>
  )
}

export default function UgcHero({ items }) {
  const hasWork = items.length > 0
  return (
    <section aria-labelledby="ugc-h1" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-10 right-[-10%] h-[420px] w-[520px] rounded-full bg-violet/[0.10] blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-5 pb-8 md:px-8 md:pt-8 md:pb-14">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur sm:rounded-full">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted min-[400px]:text-[11px] sm:text-xs sm:tracking-[0.18em]">
                UGC Video Agency · International &amp; Multilingual
              </span>
            </div>

            <h1
              id="ugc-h1"
              className="mt-5 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.2rem] min-[400px]:text-[2.75rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[2.75rem] xl:text-[3.6rem]"
            >
              <span className="block">Human-led UGC ads.</span>
              <span className="block">Built for paid social.</span>
              <span className="block text-lime">Made to be tested.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              CONVRT is an international, multilingual creative production studio and UGC agency for brands that run paid
              social. We handle the concepts, scripts, creator casting, filming and editing, and deliver a structured batch of
              finished ads you can test, with pricing and usage rights stated up front.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <RoadmapCta hero location="hero" className="w-full sm:w-auto" />
              <GhostCta href="/pricing#packages" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'hero' })} className="w-full sm:w-auto">
                See Pricing
              </GhostCta>
            </div>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
              Share a few brand details, then book a free strategy session where we present five personalized ad concepts. Brands in
              every industry are welcome, subject to a short fit check. No obligation.
            </p>
            <p className="mt-3 text-sm">
              <a
                href="#work"
                className="font-medium text-ink underline decoration-lime/50 underline-offset-4 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                {hasWork ? 'Watch selected work' : 'See results and client feedback'} <span aria-hidden="true">↓</span>
              </a>
            </p>
          </div>

          <div className="min-w-0 lg:col-span-5">{hasWork ? <VideoShowcase items={items} /> : <ConceptIllustration />}</div>
        </div>

        <Reveal className="mt-8 md:mt-12">
          <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {facts().map((f) => (
              <li key={f.value} className="rounded-2xl border border-hairline bg-surface-1/60 p-4 backdrop-blur-md md:p-5">
                <p className="font-display text-lg font-bold leading-tight tracking-snug text-ink md:text-xl">{f.value}</p>
                <p className="mt-1.5 text-sm leading-snug text-ink-muted">{f.sub}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
