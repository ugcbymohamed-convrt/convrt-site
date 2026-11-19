import { CONTACT_EMAIL } from '../../config.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section, Reveal, RoadmapCta, GhostCta } from './shared.jsx'

/* Final CTA: deliberately short, not a sixth content section. The Free Creative Growth Roadmap is open to brands in every industry. */

export default function UgcFinalCTA() {
  return (
    <Section id="get-started" label="ugc-cta-heading" className="!pt-4 !pb-12 md:!pb-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-9 text-center md:px-10 md:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-[-8%] h-[260px] w-[420px] rounded-full bg-violet/[0.12] blur-[110px]" />
          <div className="relative">
            <h2 id="ugc-cta-heading" className="mx-auto max-w-2xl font-display text-[1.9rem] font-bold leading-[1.06] tracking-display text-ink sm:text-4xl md:text-[2.6rem]">
              Ready to see what your next five ad concepts could look like?
            </h2>
            <div className="mt-6 flex justify-center">
              <RoadmapCta hero location="final" />
            </div>
            <p className="mt-4 text-sm text-ink-muted">Free strategy session. Every industry welcome, subject to a short fit check. No obligation.</p>
            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <GhostCta href="/pricing#packages" onClick={() => trackEvent('ugc_pricing_link_click', { location: 'final' })}>
                See Pricing
              </GhostCta>
              <GhostCta href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('UGC video production')}`} onClick={() => trackEvent('ugc_email_click', { location: 'final' })}>
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-lime" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
                Email the Founder
              </GhostCta>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
