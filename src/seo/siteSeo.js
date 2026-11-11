/* SINGLE SOURCE OF TRUTH for page-level SEO: title, description, canonical, robots, social copy.

   Used by:
   • every page component, via pageHead(path) → useDocumentHead(...) (runtime <head>)
   • src/lib/seo/sitemap.js (which URLs go in sitemap.xml)
   • tests/seo.test.mjs (consistency guards)
   • later phases: build-time static head, X-Robots-Tag headers, JSON-LD.

   Rules
   • Copy is exactly what each page used before this file existed. Changing wording is a copy
     decision, not an SEO-plumbing one.
   • Indexing for the four offer pages follows the *_INDEXABLE flags in config.js. Flip a flag
     and the page's robots tag AND its sitemap entry change together.
   • `canonicalPath` marks a URL that is a duplicate of another: /case-studies renders the default
     study, so it canonicalises to /case-studies/graspo and is not listed in the sitemap.
   • The blog (/blog, /blog/<slug>) has its own head helpers in src/lib/blog/seo.js.
   • '/' is the static <head> in index.html (the homepage has no component calling the hook). Its entry
     here exists so a test can prove the two never drift apart. */

import {
  SITE_URL, OFFER_PATHS, REFERRALS_PATH,
  ROADMAP_INDEXABLE, FREE_HOOKS_INDEXABLE, RISK_FREE_INDEXABLE, REFERRALS_INDEXABLE,
} from '../config.js'

export const SITE_SEO = {
  '/': {
    title: 'Performance Creative Studio for Paid Social | CONVRT',
    description:
      'CONVRT creates performance-driven UGC, spokesperson ads and creator-led videos for apps, SaaS and e-commerce brands in English, Spanish, French and Arabic.',
    ogTitle: 'CONVRT — Performance creatives that convert.',
    ogDescription:
      'UGC ads, spokesperson videos, organic social content, and creative strategy — built to stop the scroll and drive action.',
    indexable: true,
  },
  '/pricing': {
    title: 'Paid & Organic Social Pricing | CONVRT',
    description:
      'Explore CONVRT pricing for paid social creative testing and organic social media management, from strategy and production to publishing and optimization.',
    indexable: true,
  },
  '/case-studies/graspo': {
    title: 'Graspo Case Study: 10.7M Organic Views & Arabic Social Media Leads | CONVRT',
    description:
      'How CONVRT turned a European printing company into an Arabic-first social content engine, 10.7M organic views, 3.4M reach across MENA, and 75 qualified inbound printing leads.',
    ogTitle: 'Graspo × CONVRT, From Printing Expertise to 10.7M Organic Views and Qualified MENA Demand',
    ogDescription:
      'A social media content management case study: how Arabic-first strategy, production and inbound handling turned Graspo into a recognized name across Saudi Arabia, Iraq, Morocco, Egypt and the wider MENA region.',
    indexable: true,
  },
  '/case-studies/elyon': {
    title: 'Elyon Dubai Case Study: Performance Creative for Luxury Fragrance | CONVRT',
    description:
      'How CONVRT built a repeatable performance-creative system for Elyon Dubai, 160+ creatives across street interviews, creator-led ads and multiple locations, with a 5.28x ROAS standout result.',
    ogTitle: 'Elyon Dubai × CONVRT, Performance Creative for a Luxury Fragrance Brand',
    ogDescription:
      'Creator-led ads, street interviews and continuous creative testing turned into measurable purchases and ROAS for Elyon Dubai.',
    indexable: true,
  },
  // Same content as /case-studies/graspo (the default study): a duplicate, so it points at the original.
  '/case-studies': { canonicalPath: '/case-studies/graspo', indexable: true },
  // Paid-acquisition landing page, intentionally outside organic search (see ScalePage.jsx).
  '/scale': {
    title: 'Book a Discovery Call | CONVRT Performance Creative Studio',
    description:
      'CONVRT is a performance creative partner for growth teams running paid social. Founder-led, agency-grade, built around testing. Book a discovery call.',
    robots: 'noindex, follow',
    indexable: false,
  },
  [OFFER_PATHS.roadmap]: {
    title: 'Free Creative Growth Roadmap | 5 Custom Ad Concepts | CONVRT',
    description:
      'Apply for five personalized ad concepts tailored to your SaaS or e-commerce brand. Get creative angles, hooks, and testing recommendations from CONVRT.',
    indexable: ROADMAP_INDEXABLE,
  },
  [OFFER_PATHS.hooks]: {
    title: '10 Free Ad Hooks for SaaS & E-commerce | CONVRT',
    description:
      'Get 10 ready-to-adapt advertising hooks for your industry — verbal, visual and on-screen text — delivered free by email from CONVRT.',
    indexable: FREE_HOOKS_INDEXABLE,
  },
  [OFFER_PATHS.riskFree]: {
    title: '1 Free Video Production | Try CONVRT Risk Free',
    description:
      'Apply for one free video ad produced by CONVRT, plus two bonus hook variations. Try CONVRT risk free and see if you qualify.',
    indexable: RISK_FREE_INDEXABLE,
  },
  [REFERRALS_PATH]: {
    title: 'CONVRT Referral Partner Program | Earn Rewards for Introductions',
    description:
      'Refer SaaS and e-commerce brands to CONVRT, earn rewards for successful introductions, and give your connections an exclusive creative upgrade.',
    indexable: REFERRALS_INDEXABLE,
  },
}

export const urlFor = (path) => `${SITE_URL}${path === '/' ? '/' : path}`

/* The canonical path for a route: itself, unless it is a registered duplicate. */
export const canonicalPathFor = (path) => SITE_SEO[path]?.canonicalPath ?? path

/* Arguments for useDocumentHead(...) for a route. Throws on an unknown path so a typo can't ship. */
export function pageHead(path) {
  const e = SITE_SEO[path]
  if (!e || e.canonicalPath) throw new Error(`pageHead: no head entry for "${path}"`)
  return {
    title: e.title,
    description: e.description,
    url: urlFor(path),
    ...(e.ogTitle ? { ogTitle: e.ogTitle } : {}),
    ...(e.ogDescription ? { ogDescription: e.ogDescription } : {}),
    ...(e.robots ? { robots: e.robots } : { noindex: !e.indexable }),
  }
}

/* Routes that belong in sitemap.xml: indexable AND their own canonical. */
export const sitemapRoutes = () =>
  Object.entries(SITE_SEO)
    .filter(([path, e]) => e.indexable && canonicalPathFor(path) === path)
    .map(([path]) => path)
