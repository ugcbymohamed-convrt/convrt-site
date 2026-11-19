/* SINGLE SOURCE OF TRUTH for page-level SEO: title, description, canonical, robots, social copy.

   Used by:
   • every page component, via pageHead(path) → useDocumentHead(...) (runtime <head>)
   • src/lib/seo/sitemap.js (which URLs go in sitemap.xml)
   • tests/seo.test.mjs (consistency guards)
   • src/seo/structuredData.js: JSON-LD per route (Organization/WebSite on '/', the pricing graph on '/pricing').

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
import { jsonLdFor } from './structuredData.js'
import { PATHS } from '../routes.js'
import { formatMoney, SPRINT, USAGE_RIGHTS } from './businessKnowledge.js'
import { selectOurWork, selectSpokespersonHero, selectSpokespersonGallery } from '../content/portfolio.js'

export const SITE_SEO = {
  '/': {
    title: 'Video Marketing Agency | UGC Ads & Organic Social | CONVRT',
    description:
      'Human-led UGC ads, spokesperson videos and organic social video for SaaS, e-commerce and app brands, produced in English, Spanish, French and Arabic.',
    ogTitle: 'CONVRT — Performance creatives that convert.',
    ogDescription:
      'UGC ads, spokesperson videos, organic social content, and creative strategy — built to stop the scroll and drive action.',
    indexable: true,
  },
  '/pricing': {
    title: 'UGC & Video Production Pricing | CONVRT Studio',
    description:
      "Explore CONVRT's UGC, video ad and social media production packages, with clear pricing, creative deliverables, usage rights and revision policies.",
    indexable: true,
  },
  [PATHS.ugcVideoAgency]: {
    title: 'UGC Video Agency | Human-Led UGC Ads for Paid Social | CONVRT',
    // The price and usage period come from the business data, so the description can never disagree with the page.
    description: `Human-led, multilingual UGC ads for paid social, from concept to edit. Packages from ${formatMoney(SPRINT.monthly)}/month, with ${USAGE_RIGHTS.includedMonths} months of worldwide usage rights included.`,
    ogTitle: 'CONVRT: UGC Ads Built for Paid Social',
    ogDescription: 'Creator-led UGC video ads, produced end to end, with transparent pricing and usage rights.',
    indexable: true,
  },
  [PATHS.spokespersonVideoProduction]: {
    title: 'Spokesperson Video Production | Professional Video Presenters | CONVRT',
    description:
      'Professional spokesperson videos featuring real human presenters. Multilingual video production for websites, product demos, apps and paid advertising.',
    ogTitle: 'CONVRT: Professional Spokesperson Video Production',
    ogDescription: 'Human-led, multilingual spokesperson videos for websites, product demos, apps and paid advertising, from script to finished edit.',
    // Indexable (and in the sitemap) once at least one spokesperson video is approved for this page, so the page is not promoted to search while
    // its showcase is still empty. It flips by itself when the first approved spokesperson video is added to src/content/portfolio.js.
    indexable: selectSpokespersonHero().length + selectSpokespersonGallery().length > 0,
  },
  [PATHS.ourWork]: {
    title: 'Our Work | UGC Ads & Video Production Portfolio | CONVRT',
    description:
      'Watch creator-led UGC ads and performance video creatives produced by CONVRT for paid social. Browse the portfolio and filter by industry.',
    ogTitle: 'CONVRT Our Work: UGC Ads & Performance Creatives',
    ogDescription: 'Watch human-led UGC ads, spokesperson videos and performance creatives produced by CONVRT.',
    // Indexable (and in the sitemap) only while at least one video is approved for the portfolio, so an empty library is never promoted to search.
    indexable: selectOurWork().length > 0,
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
      'Apply for five personalized ad concepts tailored to your brand. Get creative angles, hooks, and testing recommendations from CONVRT.',
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
    // Structured data lives next to the head so the static HTML and the client hook always carry the same JSON-LD.
    ...jsonLdParam(path, e),
  }
}

function jsonLdParam(path, entry) {
  const jsonLd = jsonLdFor(path, entry)
  return jsonLd ? { jsonLd } : {}
}

/* Routes that belong in sitemap.xml: indexable AND their own canonical. */
export const sitemapRoutes = () =>
  Object.entries(SITE_SEO)
    .filter(([path, e]) => e.indexable && canonicalPathFor(path) === path)
    .map(([path]) => path)
