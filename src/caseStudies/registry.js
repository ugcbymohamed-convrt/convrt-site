/* ─────────────────────────────────────────────
   CASE STUDY REGISTRY
   Single source of truth for the case-study switcher.
   Add a new client by adding an entry here + a page
   component wired in CaseStudiesPage.jsx's PAGES map.
───────────────────────────────────────────── */

export const CASE_STUDIES = [
  {
    id: 'graspo',
    label: 'Graspo',
    category: 'Social Growth',
    descriptor: '10M+ Organic Views',
    accent: '#d5ff40',
    blurb: 'From zero to 10M+ organic views.',
  },
  {
    id: 'elyon',
    label: 'Elyon Dubai',
    category: 'Performance Creative',
    descriptor: 'Up to 5.28x ROAS',
    accent: '#c9a668',
    blurb: 'Creator-led paid social reaching up to 5.28x ROAS.',
  },
]

export const DEFAULT_CASE_STUDY_ID = CASE_STUDIES[0].id

export function isValidCaseStudyId(id) {
  return CASE_STUDIES.some((c) => c.id === id)
}

export function getCaseStudy(id) {
  return CASE_STUDIES.find((c) => c.id === id)
}

export function getAdjacentCaseStudy(id) {
  const idx = CASE_STUDIES.findIndex((c) => c.id === id)
  if (idx === -1) return CASE_STUDIES[0]
  return CASE_STUDIES[(idx + 1) % CASE_STUDIES.length]
}
