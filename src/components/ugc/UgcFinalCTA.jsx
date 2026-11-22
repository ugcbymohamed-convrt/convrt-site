import { CONTACT_EMAIL } from '../../config.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section, Reveal, RoadmapCta, GhostCta } from './shared.jsx'
import { tr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { localizeConfig } from '../../i18n/content.js'
import { ES_FINAL_CTA } from '../../i18n/es/labels.js'

/* Final CTA: deliberately short, not a sixth content section. The Free Creative Growth Roadmap is open to brands in every industry. */

/* Configuration-driven: UGC_CTA is this page's content and the default; the Spokesperson page passes its own headline, email subject and analytics names. Optional:
     primary  { label, href, external }  a different primary button (default: "Get 5 Free Ad Concepts" → the Roadmap)
     note     the line under it; undefined keeps the default, null removes it (the default describes the Roadmap's free strategy session) */
export const UGC_CTA = {
  id: 'ugc-cta-heading',
  title: 'Ready to see what your next five ad concepts could look like?',
  emailSubject: 'UGC video production',
  track: { cta: 'ugc_page_cta_click', pricing: 'ugc_pricing_link_click', email: 'ugc_email_click' },
}

export default function UgcFinalCTA({ config: configProp = UGC_CTA }) {
  const config = localizeConfig(configProp, currentLocale())
  const esCta = currentLocale() === 'es' ? ES_FINAL_CTA[config.id] : undefined
  return (
    <Section id="get-started" label={config.id} className="!pt-4 !pb-12 md:!pb-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-hairline-strong bg-surface-1 px-6 py-9 text-center md:px-10 md:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-lime/10 blur-[120px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-[-8%] h-[260px] w-[420px] rounded-full bg-violet/[0.12] blur-[110px]" />
          <div className="relative">
            <h2 id={config.id} className="mx-auto max-w-2xl font-display text-[1.9rem] font-bold leading-[1.06] tracking-display text-ink sm:text-4xl md:text-[2.6rem]">
              {config.title}
            </h2>
            {esCta?.text && <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{esCta.text}</p>}
            <div className="mt-6 flex justify-center">
              {config.primary
                ? <RoadmapCta hero location="final" track={config.track.cta} href={config.primary.href} external={config.primary.external}>{config.primary.label}</RoadmapCta>
                : <RoadmapCta hero location="final" track={config.track.cta} />}
            </div>
            {config.note !== null && <p className="mt-4 text-sm text-ink-muted">{esCta?.note ?? config.note ?? tr('Free strategy session. Every industry welcome, subject to a short fit check. No obligation.')}</p>}
            <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <GhostCta href="/pricing#packages" onClick={() => trackEvent(config.track.pricing, { location: 'final' })}>{tr('See Pricing')}</GhostCta>
              <GhostCta href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(config.emailSubject)}`} onClick={() => trackEvent(config.track.email, { location: 'final' })}>
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-lime" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>{tr('Email the Founder')}</GhostCta>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
