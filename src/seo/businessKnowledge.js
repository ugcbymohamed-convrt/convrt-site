/* CONVRT BUSINESS KNOWLEDGE — the single source of truth for who CONVRT is, what it sells and on what terms.

   Read by:
   • the pricing page components (src/components/pricing/*, CreativeTestingOffer.jsx)
   • the pricing FAQ (src/seo/pricingFaq.js), which is rendered on the page AND emitted as FAQPage JSON-LD
   • the structured-data builders (src/seo/structuredData.js)
   • tests/pricing.test.mjs, which pins every confirmed figure below

   RULES
   • Pure data + tiny formatters. No React, no Vite: it runs in the browser, in the build and in `node --test`.
   • Every number here was supplied or confirmed by the owner, or already published on the live pricing page.
     Do not add counts, ratings, locations, credentials or results that were not supplied.
   • ALL pricing is in US dollars (owner decision, Nov 2026: a currency standardisation of the same numbers, not an
     exchange-rate conversion). Money is stored as { amount, currency } and shown in that currency.
   • `status: 'pending-owner-confirmation'` would mark a value the owner has NOT confirmed; pages must not build new
     claims on it (see OWNER_REVIEW_FLAGS at the bottom). */

import { SITE_URL, CONTACT_EMAIL } from '../config.js'

/** @typedef {{ amount: number, currency: 'USD' }} Money  (all CONVRT pricing is in US dollars) */

/* ── money ────────────────────────────────────────────────────────────────────────────── */
const SYMBOL = { USD: '$' }
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/** @param {Money} m  e.g. {amount:2500,currency:'USD'} → "$2,500" */
export const formatMoney = (m) => `${SYMBOL[m.currency]}${group(m.amount)}`
const usd = (amount) => ({ amount, currency: 'USD' })

/* ── brand ────────────────────────────────────────────────────────────────────────────── */
export const BRAND = {
  name: 'CONVRT Studio',
  shortName: 'CONVRT',
  url: SITE_URL,
  motto: 'Real creators. Authentic delivery. Performance-driven creative.',
  description:
    'CONVRT is a creative video marketing studio specializing in human-led UGC advertising, spokesperson videos and organic social media content for brands. We combine creative strategy, in-house and freelance talent, and full-service video production to help brands create authentic, consistent and performance-driven creative.',
  logoPath: '/convrt-logo.svg',
  contactEmail: CONTACT_EMAIL,
  /* Organisation-level profiles only. The founder's personal LinkedIn (linked in the footer) is a person's
     profile, not the company's, so it is deliberately NOT listed as the organisation's sameAs. */
  socialProfiles: ['https://www.instagram.com/convrtcreativestudio/'],
}

export const CORE_SERVICES = [
  {
    id: 'ugc',
    name: 'Human-led UGC video advertising',
    description:
      'Creator-led UGC video ads for paid social, produced end to end: creative strategy, scripting, creator selection, filming and editing.',
  },
  {
    id: 'spokesperson',
    name: 'Spokesperson video advertising',
    description:
      'Spokesperson-led video ads that explain an offer clearly and build trust, produced end to end by CONVRT.',
  },
  {
    id: 'organic',
    name: 'Organic social media content production and management',
    description:
      'Content strategy, production, publishing on client accounts, performance reporting and engagement across Facebook, Instagram and TikTok.',
  },
]

export const ADDITIONAL_EXPERTISE = [
  'SaaS video production',
  'SaaS explainers',
  'Product demonstrations',
  'Animated videos',
  'E-commerce advertising creatives',
]

export const PRODUCTION_LANGUAGES = {
  core: ['English', 'Spanish', 'French', 'Arabic'],
  /** ISO 639-1 codes for the four core languages (used by structured data). */
  coreCodes: ['en', 'es', 'fr', 'ar'],
  other: 'Other languages are available on request, subject to availability.',
}

export const TALENT = {
  model: 'CONVRT works with both in-house talent and freelance creators.',
  points: [
    'CONVRT can recommend and select the most suitable creator for your brand.',
    'You can take part in creator selection when you want to.',
    'Relevant work samples from each creator are shared before production.',
    'You can request the same creator for future projects, subject to availability.',
  ],
}

/* ── creative testing packages ────────────────────────────────────────────────────────── */
const USAGE_MONTHS_INCLUDED = 6

export const SPRINT = {
  id: 'creative-testing-sprint',
  name: 'Creative Testing Sprint',
  monthly: usd(2500),
  oneOff: usd(3000),
  concepts: 5,
  variationsPerConcept: 2,
  variations: 10,
  cardDescription: 'For brands ready to discover new creative angles and find what resonates.',
  turnaroundBusinessDays: 10,
  revisionRoundsPerConcept: 2,
  usageMonthsIncluded: USAGE_MONTHS_INCLUDED,
  /* Extension prices are for the ENTIRE creative batch, not per video. */
  usageExtensions: [
    { months: 3, price: usd(625) },
    { months: 6, price: usd(1000) },
    { months: 12, price: usd(1750) },
  ],
}

export const SPRINT_PLUS = {
  id: 'creative-testing-sprint-plus',
  name: 'Creative Testing Sprint Plus',
  monthly: usd(4500),
  oneOff: usd(5400),
  variations: 20,
  /* 8 distinct concepts / 8 scripts: confirmed by the owner. The 20 variations are distributed across the concepts
     according to the creative testing strategy (hook or CTA changes). Do NOT imply every concept has the same number of
     variations, and do not derive a per-concept figure. */
  concepts: { value: 8, status: 'confirmed' },
  variationsDistribution: 'Variations are distributed across the concepts according to the creative testing strategy, with changes to hooks or CTAs. Concepts do not necessarily have the same number of variations.',
  cardDescription: 'For brands looking for greater creative diversity and deeper testing.',
  extraDetail: 'Includes expanded creative research and expanded testing recommendations.',
  turnaroundBusinessDays: 15,
  revisionRoundsPerConcept: 2,
  usageMonthsIncluded: USAGE_MONTHS_INCLUDED,
  usageExtensions: [
    { months: 3, price: usd(1125) },
    { months: 6, price: usd(1800) },
    { months: 12, price: usd(3150) },
  ],
}

export const CREATIVE_TESTING_PACKAGES = [SPRINT, SPRINT_PLUS]

export const COMMITMENT = {
  initialMonths: 3,
  cancellationNoticeDays: 30,
  /* Wording owned here so the page, FAQ and tests all say the same thing. */
  summary:
    "Our creative partnerships begin with an initial three-month commitment, followed by a flexible month-to-month agreement with 30 days' cancellation notice.",
  rationale:
    'Ongoing creative production supports continued testing and creative development. We never guarantee specific results.',
}

/* Billing options for the Paid Social cards (Sprint and Sprint Plus only; Custom is always "Let's talk"; Organic has no
   one-off option). Prices live on SPRINT / SPRINT_PLUS (`monthly`, `oneOff`). */
export const BILLING_OPTIONS = [
  { id: 'monthly', label: 'Monthly', unit: '/month' },
  { id: 'oneOff', label: 'One-off', unit: '/project' },
]

export const PARTNERSHIP_TERMS = {
  monthly: `Initial ${COMMITMENT.initialMonths}-month commitment, followed by a flexible month-to-month agreement with ${COMMITMENT.cancellationNoticeDays} days' cancellation notice.`,
  oneOff: 'One creative production batch, without a recurring commitment.',
}

/* Organic Social partnerships: a SIX-month initial commitment (owner-confirmed). The Paid Social three-month terms above
   do NOT apply. What happens after the initial six months is NOT confirmed: it is "set out in the applicable agreement";
   never assume the Paid month-to-month / 30-day terms for Organic. No guaranteed growth or results. */
export const ORGANIC_COMMITMENT = {
  initialMonths: 6,
  summary: 'Initial six-month commitment.',
  rationale:
    'Organic partnerships begin with an initial six-month commitment, giving us time to build a consistent social media presence, learn what resonates with your audience and assess performance.',
  afterInitial: 'Terms after the initial six-month period are set out in the applicable agreement.',
  faqAnswer:
    'Building a meaningful social media presence takes consistency. Our organic partnerships begin with a six-month commitment, giving us time to develop your content strategy, publish consistently, learn what resonates with your audience and assess performance before making longer-term decisions.',
}

/* Custom projects: terms are agreed individually. */
export const CUSTOM_TERMS = 'Custom project terms are agreed individually.'

/* The goal-based selector at the top of the page. `id` is the service group it selects. */
export const GOALS = [
  { id: 'paid', label: 'Scale my ads', description: 'UGC, spokesperson videos and creative testing.' },
  { id: 'organic', label: 'Grow my socials', description: 'Content, publishing and organic community growth.' },
]

export const SINGLE_VIDEOS = {
  sold: false,
  statement: 'CONVRT does not sell individual paid videos as a standard service.',
}

export const TAX = {
  pricesExcludeVat: true,
  statement:
    'All prices exclude VAT. Applicable taxes will be calculated based on your business location and tax status.',
}

/* ── Custom packages ──────────────────────────────────────────────────────────────────── */
/* Custom has NO numerical price anywhere (cards, FAQ, JSON-LD). The listed items are possibilities, not deliverables that
   every custom project includes; scope, pricing and commercial terms are agreed individually. */
export const CUSTOM_PACKAGES = {
  paid: {
    id: 'custom-creative-package',
    name: 'Custom',
    description: "Need something different? Let's build a creative package around your brand.",
    priceLabel: "Let's talk.",
    supportingLabel: 'Tailored to your needs',
    features: [
      'Custom creative strategy',
      'Flexible production volume',
      'Tailored creator selection',
      'Multilingual campaigns',
      'SaaS demos and explainers',
      'Long-form video production',
      'Custom licensing options',
    ],
    note: 'These are custom production possibilities, not deliverables included in every project. Final scope, pricing and commercial terms are agreed individually.',
    cta: 'Discuss your project',
  },
  organic: {
    id: 'custom-organic-package',
    name: 'Custom',
    description: "Need a different content system? Let's build an organic plan around your brand.",
    priceLabel: "Let's talk.",
    supportingLabel: 'Tailored to your needs',
    features: [
      'Tailored content strategy',
      'Flexible production volume',
      'Custom publishing requirements',
      'Custom engagement requirements',
      'Facebook, Instagram and TikTok',
    ],
    note: 'Final scope, pricing and commercial terms are agreed individually.',
    cta: 'Discuss your project',
  },
}

/* Shown once under the Paid Social cards, for the STANDARD Sprint packages only. */
export const SHARED_SPRINT_BENEFITS = [
  { id: 'research', label: 'Creative research and strategy' },
  { id: 'approval', label: 'Concepts, scripts and client approval' },
  { id: 'creators', label: 'Creator selection' },
  { id: 'production', label: 'Filming and professional editing' },
  { id: 'extras', label: 'Captions, B-roll and motion graphics as agreed' },
  { id: 'reframing', label: 'Square and 4:5 reframing' },
  { id: 'testing', label: 'Agreed creative variations and testing recommendations' },
  { id: 'language', label: 'Production in one selected core language: English, Spanish, French or Arabic' },
  { id: 'languages-extra', label: 'Additional languages available on request, subject to availability' },
]
export const SHARED_SPRINT_NOTE =
  'Included in Creative Testing Sprint and Sprint Plus. Custom packages have separately agreed production scopes.'

/* ── usage rights ─────────────────────────────────────────────────────────────────────── */
export const USAGE_RIGHTS = {
  includedMonths: USAGE_MONTHS_INCLUDED,
  scope: 'Worldwide',
  startsOn: 'the date each video is delivered',
  includedUses: [
    'Paid advertising',
    'Organic social media publishing',
    'Website usage',
    'Worldwide distribution within the agreed usage scope',
  ],
  afterExpiry: {
    mayRemain: [
      'Existing organic social media posts may remain published.',
      'Existing website video placements may remain online.',
    ],
    mustStop: [
      'Paid advertising use must stop unless the usage rights are extended.',
      'The content cannot be reshared or republished without extending the usage rights.',
    ],
  },
  perpetual:
    'Perpetual usage is subject to agreement with the featured creator or creators and is priced individually.',
  notOwnership:
    'Usage rights license how you may use the finished videos. They are not a transfer of copyright ownership, and the exact terms are set out in the applicable agreement.',
  creatorAccountAds: {
    title: 'Creator-account advertising',
    summary:
      'CONVRT can arrange creator-account advertising permissions, such as TikTok Spark Ads and Meta partnership ads, where available.',
    notIncluded:
      'These permissions are separate from the standard usage rights for the finished video assets, are not included automatically in every package, and are not granted indefinitely. Pricing varies and is confirmed individually.',
  },
}

/* ── raw footage ──────────────────────────────────────────────────────────────────────── */
export const RAW_FOOTAGE = {
  id: 'raw-footage-add-on',
  name: 'Raw footage add-on',
  price: usd(250),
  per: 'creative concept',
  addOnOnly: true,
  /* Every CONVRT video is a professionally edited, finished video. There is NO raw-only package, NO raw-instead-of-edited
     option and NO raw-vs-edited selector: raw footage exists only as this optional add-on. */
  policy:
    'Every video CONVRT produces and delivers is a professionally edited, finished video. We do not offer raw-only production packages or raw footage in place of edited deliverables.',
  /* Short form shown in the page's details list. */
  summary: 'Raw footage is only available alongside finished, professionally edited videos. It cannot replace them.',
  note:
    'Raw footage is available exclusively as an optional add-on, alongside your finished, edited videos. Buying it does not by itself transfer copyright ownership, unlimited editing rights or perpetual usage rights; derivative-editing and ownership terms are set out in the applicable agreement.',
}

/* ── production ───────────────────────────────────────────────────────────────────────── */
export const PRODUCTION_PROCESS = [
  { title: 'Brand and product discovery', description: 'We learn the brand, the product and what the ads need to achieve.' },
  { title: 'Audience and creative research', description: 'We study the audience, current ads and the creative opportunities in your category.' },
  { title: 'Concepts and hooks', description: 'We develop genuinely different creative concepts, each with its own hooks.' },
  { title: 'Creator selection', description: 'We recommend the right creator and share relevant work samples before production.' },
  { title: 'Script development', description: 'Every concept gets a complete script, written around the approved angle.' },
  { title: 'Client approval', description: 'You approve the concepts and scripts. Production time starts from this approval.' },
  { title: 'Filming and editing', description: 'Creators film natively for each format, then CONVRT edits, captions and finishes.' },
  { title: 'Delivery and revisions', description: 'You receive organized, platform-ready videos, with revisions included in the package.' },
]

/* The page shows four stages; each maps to the original eight steps above (indexes into PRODUCTION_PROCESS), so the full
   process is preserved without repeating each step's description. */
export const PRODUCTION_STAGES = [
  { id: 'strategy', title: 'Strategy', description: 'Brand discovery, audience research and creative concepts.', steps: [0, 1, 2] },
  { id: 'preparation', title: 'Preparation', description: 'Creator selection, scripts and your approval.', steps: [3, 4, 5] },
  { id: 'production', title: 'Production', description: 'Filming, editing, captions and creative variations.', steps: [6] },
  { id: 'delivery', title: 'Delivery', description: 'Finished videos, revisions and testing recommendations.', steps: [7] },
]

export const PRODUCT_REQUIREMENTS = {
  physical: 'For physical products, you ship the product to the selected creator and cover the shipping costs.',
  saas: 'For SaaS products, you provide a dedicated demo or dummy account with access to the relevant features, using test data rather than real customer information where possible.',
}

export const TURNAROUND = {
  startsAt: 'once you have reviewed and approved the creative concepts and scripts',
  note: 'The clock does not start at payment.',
}

export const REVISIONS = {
  roundsPerConcept: 2,
  note: 'They are not unlimited, and they are not two separate rounds for every individual variation.',
}

export const RESHOOTS = {
  weCover:
    'You see relevant examples of each creator’s work before production. If CONVRT fails to deliver the agreed scope, CONVRT covers the corrective production or reshoot.',
  clientPays:
    'If you ask for a reshoot because you are unhappy with an approved creator’s performance, and what was delivered is consistent with the approved examples and the agreed brief, the reshoot is charged in full. Changes to creative direction or requirements after approval may also need separately paid production.',
}

export const FORMATS = {
  standardMaxSeconds: 60,
  longForm: 'Long-form performance creatives of one to three minutes are available at custom prices.',
  included: ['Square 1:1 reframing', 'Portrait 4:5 reframing'],
  separateDeliverable: 'Horizontal 16:9 production counts as a separate video.',
  nativeApproach:
    'We film for the intended viewing experience rather than shooting horizontal footage and cropping it into vertical content. Horizontal production needs its own filming, so it is a separate deliverable.',
  fullProductionIncludes: ['Filming', 'Editing', 'Captions', 'B-roll', 'Motion graphics', 'Agreed creative variations'],
  scopeQualifier: 'according to the agreed creative requirements',
}

/* ── organic social ───────────────────────────────────────────────────────────────────── */
/* Prices and quantities are the ones already live on the pricing page. Nothing else (reporting schedule,
   response times, video counts) may be added without owner confirmation. */
export const ORGANIC = {
  light: {
    id: 'organic-light',
    name: 'Organic Light',
    monthly: usd(1500),
    cadence: '2 posts per week, approximately 9 original posts per month',
  },
  growth: {
    id: 'organic-growth',
    name: 'Organic Growth',
    monthly: usd(2500),
    cadence: '3 posts per week, 13 original posts per month',
  },
  platforms: ['Facebook', 'Instagram', 'TikTok'],
  /* Included in BOTH packages (owner-confirmed). No response-time guarantees, monitoring hours or platform
     allowances: detailed community management scope is subject to the applicable agreement. */
  includedInBoth: ['Content scheduling and posting', 'Organic community management'],
  communityManagement:
    'Organic community management covers social media engagement and brand relationship management. Detailed community management scope is subject to the applicable agreement.',
  /* What the Organic "What's included" panel lists (same approved scope as `scope`, grouped for display). */
  panelInclusions: [
    'Strategy and planning',
    'Concepts and scripts',
    'Filming and editing',
    'Post copywriting and captions',
    'Scheduling and publishing',
    'Content distribution',
    'Performance reporting and optimization',
    'Organic community engagement and brand relationship management',
  ],
  scope: [
    'Content strategy and planning',
    'Video concepts and scripting',
    'Filming and editing',
    'Post captions and copywriting',
    'Publishing on client accounts',
    'Content distribution across agreed platforms',
    'Performance reporting and optimization',
    'Social media engagement',
    'Brand relationship management',
  ],
  excluded: [
    'Customer support is not part of the service.',
    'Paid advertising management is outside the organic service scope.',
  ],
}

export const ORGANIC_PACKAGES = [ORGANIC.light, ORGANIC.growth]

/* Organic approach, shown as a four-step sequence and as the "How we work" stages for Organic Social. */
export const ORGANIC_STAGES = [
  { id: 'strategy', title: 'Strategy', sequenceLabel: 'Strategy', description: 'Content planning and brand objectives.' },
  { id: 'production', title: 'Production', sequenceLabel: 'Production', description: 'Concepts, scripts, filming and editing.' },
  { id: 'publishing', title: 'Publishing', sequenceLabel: 'Publishing & engagement', description: 'Scheduling, distribution and organic engagement.' },
  { id: 'optimization', title: 'Optimization', sequenceLabel: 'Optimization', description: 'Monitoring performance and refining the content approach.' },
]

/* ── owner review flags ───────────────────────────────────────────────────────────────── */
/* Things the owner must confirm before production. The tests assert this list exists so it cannot be dropped
   silently; the delivery report prints it. */
export const OWNER_REVIEW_FLAGS = [
  'Copyright, derivative-editing and ownership terms are deferred to the applicable agreement: no ownership transfer or unrestricted editing rights may be implied.',
  'Detailed organic operational commitments (community management scope, reporting schedule, response times, monitoring hours, video counts) are deferred to the applicable agreement.',
]
