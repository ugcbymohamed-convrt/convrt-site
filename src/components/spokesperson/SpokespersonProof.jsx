import { trackEvent } from '../../lib/analytics.js'
import { Section, Head, Reveal, RoadmapCta, TextLink } from '../ugc/shared.jsx'
import { SPOKESPERSON_PROOF, SPOKESPERSON_EXPECTATIONS } from '../../content/spokespersonPage.js'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeConfig } from '../../i18n/content.js'

/* Proof for /spokesperson-video-production: verified, spokesperson-specific material only (src/content/spokespersonPage.js).

   • With verified results or testimonials (`proof`), it shows them in the UGC page's visual language: a result card (the figure, its context and its
     honest qualifiers) and attributed, verbatim testimonial cards, under "Results & client feedback".
   • With none (today), it shows a COMPACT "what to expect" strip made only of published business terms (no results, no statistics, no placeholder,
     no "coming soon"). It is deliberately short so the page never carries a large empty section.
   The UGC page's Elyon 5.28x and its two testimonials are NOT used here: they describe UGC work.

   CONFIGURATION-DRIVEN: the Spokesperson content is the default; /social-media-video-production passes its own `config` (its verified Graspo organic result, its heading and
   analytics names) and gets the same two layouts. A config supplies:
     proof          { results, testimonials }              (a result may add `secondary: [{ value, label }]`, shown beside the headline figure)
     expectations   the compact strip shown when proof is empty, or null (then the section is absent while there is nothing to show)
     headingId, heading { eyebrow, title }                the populated layout's heading
     track          { cta, pricing } analytics names
     cta            optional { label, href, external }: a different button under the populated results (default: "Get 5 Free Ad Concepts" → the Roadmap) */

export const SPOKESPERSON_PROOF_CONFIG = {
  proof: SPOKESPERSON_PROOF,
  expectations: SPOKESPERSON_EXPECTATIONS,
  headingId: 'spokesperson-proof-heading',
  heading: { eyebrow: 'Results & client feedback', title: 'What clients see. What clients say.' },
  track: { cta: 'spokesperson_page_cta_click', pricing: 'spokesperson_pricing_link_click' },
}

function Expectations({ config }) {
  const e = config.expectations
  return (
    <Section id="results" label={config.headingId} glow className="!py-8 md:!py-10">
      <Reveal>
        <Head id={config.headingId} eyebrow={e.eyebrow} title={e.title} />
      </Reveal>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {e.items.map((it, i) => (
          <li key={it.id} className="list-none">
            <Reveal delay={i * 90} className="h-full">
              <div className="h-full rounded-3xl border border-hairline bg-surface-1/60 p-5 backdrop-blur-md">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-lime/15 text-lime">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <h3 className="mt-3 font-display text-[1.05rem] font-semibold leading-snug tracking-snug text-ink">{it.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{it.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mt-6 flex justify-center">
        <p className="text-[15px]">
          <TextLink href={e.link.href} onClick={() => trackEvent(config.track.pricing, { location: 'expect' })}>{e.link.label} <span aria-hidden="true">→</span></TextLink>
        </p>
      </Reveal>
    </Section>
  )
}

function Results({ config }) {
  const { results, testimonials } = config.proof
  const wide = testimonials.length === 0 // a lone result spans the row: figures left, context right
  return (
    <Section id="results" label={config.headingId} glow>
      <Reveal>
        <Head id={config.headingId} eyebrow={config.heading.eyebrow} title={config.heading.title} intro={currentLocale() === 'es' ? config.heading.esIntro : undefined} />
      </Reveal>
      <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 lg:grid-cols-12 lg:gap-6">
        {results.map((r) => (
          <Reveal key={r.id} className={testimonials.length ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className={`relative h-full overflow-hidden rounded-[28px] border border-lime/25 bg-surface-1 p-6 md:p-8 ${wide ? 'lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-x-14' : ''}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{r.brand} · {r.category}</p>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-[4rem] font-bold leading-none tracking-display-xl text-lime sm:text-[5rem]">{r.metric}</span>
                  <span className="font-display text-xl font-semibold text-ink md:text-2xl">{r.metricLabel}</span>
                </p>
                {r.secondary?.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                    {r.secondary.map((x) => (
                      <li key={x.label}><span className="font-display text-3xl font-bold leading-none tracking-display text-ink">{x.value}</span> <span className="text-[15px] text-ink-muted">{x.label}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={wide ? 'mt-4 lg:mt-0' : ''}>
                {r.context && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted lg:mt-0">{r.context}</p>}
                {r.disclaimer && <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-muted">{r.disclaimer}</p>}
                {r.href && <p className="mt-2.5 text-[15px]"><TextLink href={r.href}>{tr('Read the case study')}{' '}<span aria-hidden="true">→</span></TextLink></p>}
              </div>
            </div>
          </Reveal>
        ))}
        {testimonials.length > 0 && <div className={`grid gap-5 ${results.length ? 'lg:col-span-5' : 'lg:col-span-12 lg:grid-cols-2'}`}>
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={120 + i * 120} className="h-full">
              <figure className="relative flex h-full flex-col rounded-[28px] border border-hairline bg-surface-1/70 p-6 backdrop-blur-md md:p-7">
                <span aria-hidden="true" className="absolute right-6 top-3 font-display text-6xl leading-none text-lime/25">&ldquo;</span>
                {t.logo && (
                  <img src={t.logo.src} alt={t.logo.alt} width={t.logo.w} height={t.logo.h} loading="lazy" decoding="async" draggable="false" className="h-7 w-auto max-w-[140px] object-contain object-left" style={{ filter: 'brightness(0) invert(1)' }} />
                )}
                <blockquote lang={currentLocale() === 'en' ? undefined : 'en'} className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm text-ink-muted"><span className="font-semibold text-ink">{t.brand}</span> · {t.category}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>}
      </div>
      <Reveal className="mt-8 flex justify-center">
        {config.cta
          ? <RoadmapCta location="results" track={config.track.cta} href={config.cta.href} external={config.cta.external}>{config.cta.label}</RoadmapCta>
          : <RoadmapCta location="results" track={config.track.cta} />}
      </Reveal>
    </Section>
  )
}

/* `proof` (or a whole `config`) is injectable so the populated layout can be rendered and tested with sample data. */
export default function SpokespersonProof({ proof, config = SPOKESPERSON_PROOF_CONFIG }) {
  // Other languages: headings, contexts and disclaimers go through the dictionary; testimonial quotes are verbatim and stay in their original language.
  const cfg = localizeConfig(proof ? { ...config, proof } : config, currentLocale())
  if (cfg.proof.results.length || cfg.proof.testimonials.length) return <Results config={cfg} />
  return cfg.expectations ? <Expectations config={cfg} /> : null
}
