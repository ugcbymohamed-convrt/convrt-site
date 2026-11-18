import { CONTACT_EMAIL } from '../../config.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section, Reveal, RoadmapCta, TextLink } from './shared.jsx'

/* SECTION 11: final CTA and related links. The Free Creative Growth Roadmap is open to brands in every industry (owner-confirmed). */

const RELATED = [
  { href: '/pricing', title: 'Pricing and packages', text: 'Recurring and one-off packages, usage rights and terms.' },
  { href: '/case-studies/elyon', title: 'Elyon Dubai case study', text: 'A creator-led performance creative system in detail.' },
  { href: '/', title: 'CONVRT home', text: 'UGC, spokesperson and organic social video.' },
]

export default function UgcFinalCTA() {
  return (
    <Section id="get-started" label="ugc-cta-heading" className="!pb-12 md:!pb-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 p-7 text-center md:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
          <div className="relative">
            <h2 id="ugc-cta-heading" className="mx-auto max-w-2xl font-display text-[1.9rem] font-bold leading-[1.06] tracking-display text-ink sm:text-4xl md:text-[2.6rem]">
              See what your first five ad concepts could look like.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Apply for the Free Creative Growth Roadmap: five personalized ad concepts for your brand, presented in a free strategy
              session. Open to brands in every industry. No obligation.
            </p>
            <div className="mt-6 flex justify-center">
              <RoadmapCta location="final" />
            </div>
            <p className="mt-5 text-[15px] text-ink-muted">
              <TextLink href="/pricing#packages" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'final' })}>Compare packages and pricing</TextLink>
              <span aria-hidden="true" className="mx-3">·</span>
              <TextLink href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('UGC video production')}`} onClick={() => trackEvent('ugc_email_click', { location: 'final' })}>
                Email {CONTACT_EMAIL}
              </TextLink>
            </p>
          </div>
        </div>
      </Reveal>

      <nav aria-label="Related pages" className="mt-6">
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {RELATED.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                onClick={() => r.href.startsWith('/case-studies') && trackEvent('ugc_case_study_click', { location: 'related' })}
                className="group block h-full rounded-3xl border border-hairline bg-surface-1/60 p-5 transition-colors hover:border-hairline-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                <p className="font-display text-base font-semibold text-ink group-hover:text-lime">{r.title} <span aria-hidden="true">→</span></p>
                <p className="mt-1 text-sm leading-snug text-ink-muted">{r.text}</p>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Section>
  )
}
