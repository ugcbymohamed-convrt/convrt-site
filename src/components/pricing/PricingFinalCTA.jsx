import { OFFER_PATHS } from '../../config.js'
import { ORGANIC_CTA } from '../../seo/businessKnowledge.js'
import { withUtm } from '../../lib/analytics.js'

function CtaLink({ href, external = false, children }) {
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} onClick={external ? (e) => { e.currentTarget.href = withUtm(href) } : undefined} className="cta-gradient group mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-canvas">
      {children}
      <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" aria-hidden="true">
        <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

/* SECTION 5: one short closing invitation. Paid: existing Creative Growth Roadmap flow. Organic: organic-specific wording. */
export default function PricingFinalCTA({ service = 'paid' }) {
  return (
    <section id="contact" className="relative overflow-hidden py-12 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.08) 0%, transparent 60%)' }}
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <h2 className="font-display font-bold leading-[1.08] tracking-display text-ink" style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.5rem)' }}>
          Ready to create something <span className="text-lime">that converts?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-muted">Let&rsquo;s find the right creative approach for your brand.</p>
        {/* Paid Social: the Roadmap offer. Organic Social: the organic conversation starter. Both are always in the HTML. */}
        <div hidden={service !== 'paid'}>
          <CtaLink href={OFFER_PATHS.roadmap}>Get 5 Free Ad Concepts</CtaLink>
        </div>
        <div hidden={service !== 'organic'}>
          <CtaLink href={ORGANIC_CTA.href} external={ORGANIC_CTA.external}>{ORGANIC_CTA.label}</CtaLink>
        </div>
      </div>
    </section>
  )
}
