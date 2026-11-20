/* Every public page path, in one place. Pure data: imported by the app, the build and the tests.

   • App.jsx builds its route table from PATHS, so a page cannot be routed without being listed here.
   • vite-plugin-static-routes.js writes a real HTML file for each path (and each published blog
     article) at build time. The host serves those files with 200 and answers EVERYTHING ELSE with
     a genuine HTTP 404 (dist/404.html). That is why vercel.json no longer has a catch-all rewrite.
   • Blog articles are not listed here: they come from the published Markdown files at build time. */

import { OFFER_PATHS, REFERRALS_PATH, BLOG_PATH, CREATOR_SHOWCASE_PATH } from './config.js'

export const PATHS = {
  home: '/',
  pricing: '/pricing',
  ugcVideoAgency: '/ugc-video-agency',
  spokespersonVideoProduction: '/spokesperson-video-production',
  socialMediaVideoProduction: '/social-media-video-production',
  saasVideoProduction: '/saas-video-production',
  showcase: CREATOR_SHOWCASE_PATH,
  caseStudies: '/case-studies',
  caseStudyGraspo: '/case-studies/graspo',
  caseStudyElyon: '/case-studies/elyon',
  scale: '/scale',
  roadmap: OFFER_PATHS.roadmap,
  hooks: OFFER_PATHS.hooks,
  riskFree: OFFER_PATHS.riskFree,
  referrals: REFERRALS_PATH,
  blog: BLOG_PATH,
}

export const KNOWN_PATHS = Object.values(PATHS)

/* Private, invitation-only pages (creator portfolio onboarding + the owner's review page). They are served as
   real static files like every other route (the host 404s anything without one) but are deliberately NOT in
   PATHS / KNOWN_PATHS: nothing public may link to them, the sitemap and the SEO manifest never see them, and
   the "every public page" tests do not apply to them. Their head (noindex) lives in src/seo/privateSeo.js. */
export const PRIVATE_PATHS = {
  creatorOnboarding: '/creator-onboarding',
  creatorAgreement: '/creator-onboarding/agreement',
  creatorPrivacy: '/creator-onboarding/privacy',
  creatorAdmin: '/creator-admin',
}
export const PRIVATE_PATH_LIST = Object.values(PRIVATE_PATHS)

/* '/pricing/' → '/pricing', '' → '/'. Mirrors how App.jsx reads window.location.pathname. */
export const normalizePath = (p) => p.replace(/\/$/, '') || '/'
