import { getCaseStudy } from '../../caseStudies/registry.js'
import { trackEvent } from '../../lib/analytics.js'
import { TextLink } from '../ugc/shared.jsx'
import { useTr } from '../../i18n/tr.js'
import { isEnglish } from './format.js'

/* "Related service" line at the end of a case study (SEO/GEO Batch 2). It says which CONVRT service the project is an example of and where to compare that service's packages,
   so a reader who is convinced by the proof has an obvious next step that is not the generic final CTA. Content is the `related` record of the study in
   src/caseStudies/registry.js; routes come from src/routes.js. Plain anchors, no layout of its own beyond one centred paragraph pair. */
/* Mid-sentence: the dictionary's service names are capitalised for headings, so Spanish lower-cases the first letter ("…nuestro servicio de producción de vídeos UGC"). English is untouched. */
const serviceLabel = (label) => (isEnglish() ? label : label.charAt(0).toLowerCase() + label.slice(1))

export default function RelatedService({ currentId }) {
  const tr = useTr()
  const study = getCaseStudy(currentId)
  const r = study?.related
  if (!r) return null
  const track = (target) => () => trackEvent('case_study_related_click', { case_study: currentId, target })
  return (
    <section aria-label={tr('Related service')} className="relative pt-10 md:pt-14">
      <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
        <p className="text-[15px] leading-relaxed text-ink-muted">
          {tr(r.lead)}{' '}
          <TextLink href={r.service.href} onClick={track('service')}>{serviceLabel(tr(r.service.label))}</TextLink>{isEnglish() ? ' service.' : '.'}
        </p>
        <p className="mt-2 text-[15px]">
          <TextLink href={r.pricing.href} onClick={track('pricing')}>{tr(r.pricing.label)} <span aria-hidden="true">→</span></TextLink>
        </p>
      </div>
    </section>
  )
}
