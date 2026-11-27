import { currentLocale } from '../../i18n/locale.js'
import { ELYON_METRICS } from '../../caseStudies/data.js'
import { ELYON_CONCLUSION } from '../../i18n/caseStudyConclusions.js'
import { PATHS } from '../../routes.js'
import CaseStudyConclusion from '../caseStudies/CaseStudyConclusion.jsx'

/* The closing section of the Elyon Dubai study, in every language, drawn by the shared CaseStudyConclusion in its champagne-gold theme (owner brief, 2026-11-26): the peak ROAS is the hero figure, with its
   qualification written next to it (client-reported, one standout creative, early learning phase, not an average, not a guarantee). The figures are the page's own metrics (ELYON_METRICS), never retyped.
   Replaces the old "related service" line under the study: its two links are the conversion area of this card (same destinations, same analytics event). */
const [creatives, locations, peak] = [ELYON_METRICS[0], ELYON_METRICS[1], ELYON_METRICS[2]]

export default function ElyonResult() {
  const copy = ELYON_CONCLUSION[currentLocale()] ?? ELYON_CONCLUSION.en
  const figures = [
    { value: peak.value, label: copy.labels[0], sub: copy.labels[1], hero: true, raw: true },
    { value: creatives.value, label: copy.labels[2] },
    { value: locations.value, label: copy.labels[3] },
  ]
  return (
    <CaseStudyConclusion
      id="elyon-result-heading"
      theme="gold"
      copy={copy}
      figures={figures}
      links={{ service: { href: PATHS.ugcVideoAgency, label: copy.service }, pricing: { href: '/pricing#packages', label: copy.pricing } }}
      caseStudy="elyon"
    />
  )
}
