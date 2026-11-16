/* Head data for the private pages in PRIVATE_PATHS. Kept apart from SITE_SEO on purpose: SITE_SEO feeds the
   sitemap and the public-page tests, and these pages must never appear in either.
   Every private page is `noindex, nofollow, noarchive` and carries no personal data (the HTML is generated
   at build time, before any creator exists; creator details only ever load client-side after authorisation). */

import { PRIVATE_PATHS, PRIVATE_PATH_LIST } from '../routes.js'

const ROBOTS = 'noindex, nofollow, noarchive'

const ENTRIES = {
  [PRIVATE_PATHS.creatorOnboarding]: {
    title: 'Creator Network | CONVRT',
    description: 'Private invitation for CONVRT freelance creators to submit a portfolio.',
  },
  [PRIVATE_PATHS.creatorAgreement]: {
    title: 'Creator Portfolio Agreement | CONVRT',
    description: 'The CONVRT Studio Creator Portfolio Agreement.',
  },
  [PRIVATE_PATHS.creatorPrivacy]: {
    title: 'Creator Privacy Notice | CONVRT',
    description: 'How CONVRT Studio handles information submitted by freelance creators.',
  },
  [PRIVATE_PATHS.creatorAdmin]: {
    title: 'Creator review | CONVRT',
    description: 'Private review area.',
  },
}

export const isPrivatePath = (path) => PRIVATE_PATH_LIST.includes(path)

/* Arguments for useDocumentHead / buildHeadSpec. No url: a private page has no canonical and no og:url. */
export function privateHead(path) {
  const e = ENTRIES[path]
  if (!e) throw new Error(`privateHead: no entry for "${path}"`)
  return { ...e, robots: ROBOTS }
}
