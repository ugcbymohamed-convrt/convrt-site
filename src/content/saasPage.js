/* Content for /saas-video-production. Pure data: the page (src/SaasVideoPage.jsx) feeds each block to the same configuration-driven components the UGC and
   Spokesperson pages use (UgcHero, ProcessSection, UgcGallery, SpokespersonProof, UgcFAQ, UgcFinalCTA), plus the SaaS-specific "formats" visual.

   RULES
   • No price, turnaround, revision allowance, usage right, video quantity or package deliverable is typed here. Commercial facts live in src/seo/businessKnowledge.js.
     SaaS demos and explainers are scoped as CUSTOM packages (CUSTOM_PACKAGES.paid): never apply the UGC Sprint price or deliverables to them.
   • No SaaS-specific result, statistic or testimonial exists yet: SAAS_PROOF is EMPTY on purpose. Add an entry only when the owner has verified it for a SaaS video
     production project and has permission to publish it. Do NOT reuse the UGC page's Elyon 5.28x or its testimonials (src/content/ugcProof.js): they describe UGC work
     (Adscale is a SaaS client, but its quote is about UGC ads, so it is not used here without the owner's say-so).
   • The videos come from src/content/portfolio.js (type 'saas', or `alsoOn.saas`), never from here. */

import { OFFER_PATHS, CREATOR_SHOWCASE_PATH } from '../config.js'
import { PRODUCTION_LANGUAGES, PRODUCT_REQUIREMENTS, CUSTOM_TERMS } from '../seo/businessKnowledge.js'
import { SAAS_FORMATS } from './portfolio.js'

export const SAAS_PATH_LABEL = 'SaaS Video Production'

/* 1. HERO. H1 in the HTML: "SaaS videos. Built to explain. Made to convrt." The last word rolls (convrt, engage, connect); every one completes "Made to ___." and the
   prerendered HTML holds only "convrt.". "explain" is not in the reel because the second line already says "Built to explain." and "Made to explain." would repeat it. */
export const SAAS_HERO = {
  id: 'saas-h1',
  lines: [
    ['SaaS', 'videos.'],
    ['Built', 'to', 'explain.'],
  ],
  lead: ['Made', 'to'],
  words: ['convrt', 'engage', 'connect'],
  sizer: 'connect.',
  description:
    'From product demos and animated explainers to human-led presentations and paid ads, we turn complex software into clear, engaging videos that communicate your product’s value.',
  primary: { label: 'Get 5 Free Ad Concepts', href: OFFER_PATHS.roadmap },
  /* No scrollTo: this button always goes to /creator-showcase. */
  secondary: { label: 'Explore Videos', href: CREATOR_SHOWCASE_PATH },
  track: { cta: 'saas_page_cta_click', work: 'saas_explore_videos_click' },
  stageLabel: 'SaaS videos',
  stagePrefix: 'saas',
  /* Empty phones stay EMPTY on preview hosts too: no stand-in portraits, no UGC footage. */
  previewPortraits: false,
}

/* 2. HOW IT WORKS: four stages. The scenes are in src/components/saas/SaasScenes.jsx. Each sentence stands on its own without the interaction. */
export const SAAS_STAGES = [
  { id: 'discovery', title: 'Product Discovery & Strategy', text: 'We learn your software, its audience, its key features and the problem it solves, then find the strongest message to put first.' },
  { id: 'concept', title: 'Concept & Script', text: 'We turn features and benefits into a clear video concept, script and storyboard. You approve them before production starts.' },
  { id: 'production', title: 'Production & Animation', text: 'We combine screen recordings of your product, motion graphics, presenters when relevant, captions and editing into one polished video.' },
  { id: 'delivery', title: 'Delivery & Distribution', text: 'You receive finished videos prepared for your website, paid advertising, product demos, social media and sales presentations.' },
]

export const SAAS_PROCESS = {
  id: 'how-it-works',
  headingId: 'saas-process-heading',
  eyebrow: 'How it works',
  title: 'How we produce SaaS videos.',
  intro: 'We manage the creative process from product discovery to the finished video. What each stage includes depends on your approved brief.',
}

/* 3. ONE PRODUCT, DIFFERENT WAYS TO BRING IT TO LIFE. Three ways to communicate a software product's value. Nothing here says a package includes all three, or how many
   videos a project has. */
export const SAAS_FORMAT_STEPS = {
  eyebrow: 'SaaS video formats',
  title: 'One product. Different ways to bring it to life.',
  steps: [
    { id: 'explainer', short: 'Product Explainer', title: 'Product Explainer', text: 'Communicates what the software does, who it is for and why it matters, with motion graphics, feature callouts and short on-screen labels.' },
    { id: 'demo', short: 'Product Demonstration', title: 'Product Demonstration', text: 'Shows the product in action: a feature is selected, an action is demonstrated and the resulting benefit is highlighted.' },
    { id: 'ad', short: 'SaaS Advertising Creative', title: 'SaaS Advertising Creative', text: 'A presenter introduces a customer problem, a software demonstration shows the solution and a clear call to action follows. Short-form, for paid advertising.' },
  ],
  note: 'Illustration only. Which formats a project uses, and what is delivered, depends on your approved brief.',
}

/* VIDEO ORDER (English design review, Nov 2026). The hero stage opens on its FIRST video (large centre phone); the gallery follows the same rule. The founder's own presenter video
   (`spokesperson-gal-1`, listed for this page with alsoOn.saas = 'hero') is the featured centre phone, and the creator example that used to open the hero (`saas-creator-1`, now placement
   'gallery') is the THIRD gallery video. Listed ids come first, in this order; any other video follows in its usual order (see orderedBy in src/content/portfolio.js). No video appears twice:
   a video is in the hero OR the gallery, decided by its placement on this page. */
export const SAAS_VIDEO_ORDER = {
  hero: ['spokesperson-gal-1', 'saas-creator-2', 'creator-04'],
  gallery: ['spokesperson-gal-3', 'spokesperson-hero-1', 'saas-creator-1'],
}

/* 4. SHOWCASE (the horizontal gallery). The format filter appears only when at least two formats have an approved video. */
export const SAAS_GALLERY = {
  id: 'saas-videos',
  headingId: 'saas-videos-heading',
  eyebrow: 'SaaS showcase',
  title: 'Creator-led videos for software brands.',
  intro: 'Examples of how software and app products can be presented on camera. Explainers, demos and animation are scoped to your brief.',
  ariaLabel: 'SaaS video examples. Scroll sideways to see more.',
  badge: 'SaaS',
  /* /creator-showcase filters by industry only (it has no SaaS or format filter route), so this goes to the whole Creator Showcase. Point it at a filtered view only once one exists. */
  cta: { label: 'Explore SaaS Videos', href: CREATOR_SHOWCASE_PATH },
  track: 'saas',
  samplePortraits: null,
  sampleNote: 'Layout preview only: your approved SaaS videos replace these empty frames. This never shows on the live site.',
  filter: { ariaLabel: 'Filter videos by format', allLabel: 'All', field: 'format', options: SAAS_FORMATS },
}

/* 5. PROOF. Verified SaaS video production material only. Both lists are empty today, so the page shows the compact "what to expect" strip below (published business
   terms, not results). Shape of an entry (the shared proof section renders it):
     results:      { id, brand, category, metric, metricLabel, secondary?: [{ value, label }], context, disclaimer, href? }   a client-reported figure and its honest qualifiers
     testimonials: { id, brand, category, quote, logo?: { src, alt, w, h } }                                                    verbatim, attributed, with permission */
export const SAAS_PROOF = { results: [], testimonials: [] }

export const SAAS_EXPECTATIONS = {
  eyebrow: 'What to expect',
  title: 'A clear process, built around your product.',
  items: [
    { id: 'product', title: 'Built on your real product', text: 'You provide a demo or dummy account with access to the relevant features, using test data where possible.' },
    { id: 'blend', title: 'Human-led, with motion', text: 'Presenters, screen recordings and motion graphics are combined as the brief requires.' },
    { id: 'languages', title: 'Multilingual production', text: `${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}, with other languages on request.` },
    { id: 'scope', title: 'Scoped to your brief', text: `SaaS demos and explainers are scoped as custom packages. ${CUSTOM_TERMS}` },
  ],
  link: { label: 'See pricing and terms', href: '/pricing#packages' },
}

export const SAAS_PROOF_CONFIG_TRACK = { cta: 'saas_page_cta_click', pricing: 'saas_pricing_link_click' }

/* The dummy-account requirement is quoted from the business data wherever the page needs it (FAQ), not retyped. */
export const SAAS_PRODUCT_ACCESS = PRODUCT_REQUIREMENTS.saas

/* 6. FINAL CTA. (The FAQ list is src/seo/saasFaq.js; the page composes its heading.) The free Roadmap gives ad concepts; it does not include a free explainer video. */
export const SAAS_CTA = {
  id: 'saas-cta-heading',
  title: 'Ready to show the world what your software can do?',
  emailSubject: 'SaaS video production',
  track: { cta: 'saas_page_cta_click', pricing: 'saas_pricing_link_click', email: 'saas_email_click' },
}
