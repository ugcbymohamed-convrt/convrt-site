/* Every public page path, in one place. Pure data: imported by the app, the build and the tests.

   • App.jsx builds its route table from PATHS, so a page cannot be routed without being listed here.
   • vite-plugin-static-routes.js writes a real HTML file for each path (and each published blog
     article) at build time. The host serves those files with 200 and answers EVERYTHING ELSE with
     a genuine HTTP 404 (dist/404.html). That is why vercel.json no longer has a catch-all rewrite.
   • Blog articles are not listed here: they come from the published Markdown files at build time. */

import { OFFER_PATHS, REFERRALS_PATH, BLOG_PATH } from './config.js'

export const PATHS = {
  home: '/',
  pricing: '/pricing',
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

/* '/pricing/' → '/pricing', '' → '/'. Mirrors how App.jsx reads window.location.pathname. */
export const normalizePath = (p) => p.replace(/\/$/, '') || '/'
