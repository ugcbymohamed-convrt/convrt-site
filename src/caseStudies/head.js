/* The head of a case-study page. /case-studies (and /es/case-studies) render the default study and canonicalise to it, so they carry that study's title, description and
   canonical but NO hreflang: an alternate-language annotation belongs to the canonical page only (English /case-studies never had any). */
import { pageHead } from '../seo/siteSeo.js'
import { parsePath } from '../i18n/paths.js'

export const withoutAlternates = ({ alternates, ...head }) => head

export function caseStudyHead(studyPath) {
  const head = pageHead(studyPath)
  const onDuplicate = typeof window !== 'undefined' && window.location && parsePath(window.location.pathname).basePath === '/case-studies'
  return onDuplicate ? withoutAlternates(head) : head
}
