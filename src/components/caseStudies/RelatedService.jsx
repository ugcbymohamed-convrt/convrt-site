import { getCaseStudy } from '../../caseStudies/registry.js'
import { trackEvent } from '../../lib/analytics.js'
import { TextLink } from '../ugc/shared.jsx'

/* "Related service" line at the end of a case study (SEO/GEO Batch 2). It says which CONVRT service the project is an example of and where to compare that service's packages,
   so a reader who is convinced by the proof has an obvious next step that is not the generic final CTA. Content is the `related` record of the study in
   src/caseStudies/registry.js; routes come from src/routes.js. Plain anchors, no layout of its own beyond one centred paragraph pair. */
export default function RelatedService({ currentId }) {
  const study = getCaseStudy(currentId)
  const r = study?.related
  if (!r) return null
  const track = (target) => () => trackEvent('case_study_related_click', { case_study: currentId, target })
  return (
    <section aria-label="Related service" className="relative pt-10 md:pt-14">
      <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
        <p className="text-[15px] leading-relaxed text-ink-muted">
          {r.lead}{' '}
          <TextLink href={r.service.href} onClick={track('service')}>{r.service.label}</TextLink> service.
        </p>
        <p className="mt-2 text-[15px]">
          <TextLink href={r.pricing.href} onClick={track('pricing')}>{r.pricing.label} <span aria-hidden="true">→</span></TextLink>
        </p>
      </div>
    </section>
  )
}
