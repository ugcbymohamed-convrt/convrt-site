/* Decides whether the browser may HYDRATE the prerendered markup or must render the page fresh.
   Hydrating requires the first client render to equal the server's. The server only knows the URL
   path; the one page whose first render also reads the query string / hash is the case-study page
   (src/CaseStudiesPage.jsx resolveInitialId): "/case-studies?case=elyon" or "/case-studies#elyon"
   would first render a different study than the static HTML contains. Those URLs render fresh
   instead (exactly as before prerendering existed). Pure: unit-tested. */

import { DEFAULT_CASE_STUDY_ID, isValidCaseStudyId } from '../../caseStudies/registry.js'

export const normalizePathname = (pathname) => pathname.replace(/\/$/, '') || '/'

export function canHydrate({ pathname, search = '', hash = '', ssrPath }) {
  const path = normalizePathname(pathname)
  if (!ssrPath || ssrPath !== path) return false
  if (path === '/case-studies') {
    const fromQuery = new URLSearchParams(search).get('case')
    if (fromQuery && isValidCaseStudyId(fromQuery) && fromQuery !== DEFAULT_CASE_STUDY_ID) return false
    const fromHash = hash.replace('#', '')
    if (fromHash && isValidCaseStudyId(fromHash) && fromHash !== DEFAULT_CASE_STUDY_ID) return false
  }
  return true
}
