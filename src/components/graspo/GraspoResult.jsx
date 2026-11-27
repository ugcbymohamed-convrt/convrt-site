import { currentLocale } from '../../i18n/locale.js'
import { GRASPO_FUNNEL } from '../../caseStudies/data.js'
import { GRASPO_CONCLUSION } from '../../i18n/caseStudyConclusions.js'
import { PATHS } from '../../routes.js'
import CaseStudyConclusion from '../caseStudies/CaseStudyConclusion.jsx'

/* The closing section of the Graspo study, in every language, drawn by the shared CaseStudyConclusion in its lime (CONVRT) theme (owner brief, 2026-11-26; it replaces the English/French text column and the
   Arabic card layout). The four figures are the funnel's own (views, leads, high priority, advanced), so they cannot drift from the section above. Copy: src/i18n/caseStudyConclusions.js.
   It also replaces the old "related service" line under the study: the service link and the pricing link are the conversion area of this card (same destinations, same analytics event). */
const FUNNEL_INDEX = [0, 2, 3, 4]

export default function GraspoResult() {
  const copy = GRASPO_CONCLUSION[currentLocale()] ?? GRASPO_CONCLUSION.en
  const figures = FUNNEL_INDEX.map((i, n) => ({ value: GRASPO_FUNNEL[i].value, label: copy.labels[n] }))
  return (
    <CaseStudyConclusion
      id="graspo-result-heading"
      theme="lime"
      copy={copy}
      figures={figures}
      links={{ service: { href: PATHS.socialMediaVideoProduction, label: copy.service }, pricing: { href: '/pricing#organic', label: copy.pricing } }}
      caseStudy="graspo"
    />
  )
}
