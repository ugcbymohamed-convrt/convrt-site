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

import { SITE_URL, CONTACT_EMAIL, INSTAGRAM_URL, COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL } from '../config.js'
import { OPERATOR } from '../content/operator.js'
import { CONVRT_STATS, FOUNDER_EXPERIENCE } from '../lib/siteStats.js'

/** @typedef {{ amount: number, currency: 'USD' }} Money  (all CONVRT pricing is in US dollars) */

/* ── money ────────────────────────────────────────────────────────────────────────────── */
const SYMBOL = { USD: '$' }
const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/** @param {Money} m  e.g. {amount:2500,currency:'USD'} → "$2,500" */
export const formatMoney = (m) => {
  if (Number.isInteger(m.amount)) return `${SYMBOL[m.currency]}${group(m.amount)}`
  const [whole, cents] = m.amount.toFixed(2).split('.')
  return `${SYMBOL[m.currency]}${group(whole)}.${cents}`
}
const usd = (amount) => ({ amount, currency: 'USD' })

/** Price per finished ad version for a package at a billing option ('monthly' | 'oneOff'), rounded to whole dollars for marketing
 *  clarity (owner decision): Sprint $3,000 / 15 = "$200"; Sprint Plus $5,000 / 30 = 166.67, shown as "$167". `amount` keeps the
 *  exact figure. */
export const pricePerVariation = (pkg, billing = 'monthly') => {
  const v = pkg[billing].amount / pkg.variations
  return { amount: v, text: `$${group(Math.round(v))}` }
}

/* ── deliverable terminology ──────────────────────────────────────────────────────────────
   A package delivers FINISHED AD VERSIONS: `concepts × versions per concept`. Sprint = 5 × 3 = 15; Sprint Plus = 10 × 3 = 30.
   The three versions of a concept are alternatives (for example a different hook or call to action) and are INCLUDED in the total,
   never extra videos on top of it. The quantities live on SPRINT / SPRINT_PLUS below (`concepts`, `variationsPerConcept`,
   `variations`); every page, FAQ and JSON-LD phrases them through these helpers so the wording cannot drift. */
export const AD_VERSIONS = { one: 'finished ad version', many: 'finished ad versions', perConcept: 'versions' }
/** 15 → "15 finished ad versions" */
export const adVersions = (n) => `${n} ${n === 1 ? AD_VERSIONS.one : AD_VERSIONS.many}`
/** { concepts: 5, variationsPerConcept: 3, variations: 15 } → "5 concepts × 3 versions = 15 finished ad versions" */
export const packageEquation = (pkg) => `${pkg.concepts} concepts × ${pkg.variationsPerConcept} ${AD_VERSIONS.perConcept} = ${adVersions(pkg.variations)}`

/* ── end-to-end production message (owner, Nov 2026) ───────────────────────────────────────
   One compact benefit shown on both Creative Testing cards, plus the checklist line that replaces "Priority production scheduling"
   (which had no definition anywhere in the business rules). Everything named here is already in scope: FORMATS.fullProductionIncludes
   (filming, editing, captions, B-roll, motion graphics) and the PRODUCTION_STAGES. It does NOT imply media buying or ad-account management. */
export const END_TO_END = {
  title: 'End-to-end creative production',
  text: 'Strategy, scripts, creator casting, filming and editing. All handled by CONVRT.',
  checklistItem: 'Filming, editing, captions & final delivery',
}

/* ── brand ────────────────────────────────────────────────────────────────────────────── */
export const BRAND = {
  name: 'CONVRT Studio',
  shortName: 'CONVRT',
  url: SITE_URL,
  motto: 'Real creators. Authentic delivery. Performance-driven creative.',
  description:
    'CONVRT is a creative video marketing studio specializing in human-led UGC advertising, SaaS video production, spokesperson videos and organic social media content for brands. We combine creative strategy, in-house and freelance talent, and full-service video production to help brands create authentic, consistent and performance-driven creative.',
  logoPath: '/convrt-logo.svg',
  contactEmail: CONTACT_EMAIL,
  /* Country of the operator's registration (About page: "registered in Spain"). Country only: no street address belongs in structured data. */
  country: 'ES',
  /* Organisation-level profiles only: Instagram and the official company LinkedIn page (owner-confirmed Nov 2026). The founder's personal LinkedIn
     is a person's profile, not the company's, so it is deliberately NOT listed as the organisation's sameAs (it is the Person's, below). */
  socialProfiles: [INSTAGRAM_URL, COMPANY_LINKEDIN_URL],
  /* Owner-confirmed (Nov 2026): the legal operator and how the business is structured. Exclusively B2B. */
  legalOperator: OPERATOR.name,
  businessStructure: OPERATOR.structure,
  audience: 'Businesses only (B2B)',
  /* The founder. The name is the owner's confirmed legal name (LEGAL_ENTITY in src/content/creatorLegal.js, confirmed 17 Nov 2026) and the LinkedIn address is
     the personal profile already linked in the footer. "Founder" is what the site already says ("founder-led"). The owner still has to confirm that the name
     and title may be shown publicly on the About page (docs/trust-pages-draft.md); no biography, credentials or years of experience are recorded, so none is stated. */
  founder: {
    name: 'Mohamed Doukkali Azizi',
    jobTitle: 'Founder',
    linkedin: FOUNDER_LINKEDIN_URL,
  },
}

/* The four core services. ONE record per service feeds every Service entity in the JSON-LD (homepage, pricing, each service page and the case studies), so the same
   @id always carries the same name, type and description. `name` / `serviceType` are the schema.org wording; the short visible navigation label is SERVICE_LABELS below. */
export const CORE_SERVICES = [
  {
    id: 'ugc',
    name: 'UGC video production',
    serviceType: 'UGC video ad production',
    description:
      'Creator-led UGC video ads for paid social, produced end to end: creative strategy, scripting, creator selection, filming and editing. UGC videos are created by real human creators.',
  },
  {
    id: 'saas',
    name: 'SaaS & app video production',
    serviceType: 'SaaS and app video production',
    description:
      'Video production for SaaS, software and app companies: explainer videos, product demonstrations, app walkthroughs, animated product explainers, human-led software and app presentations and video advertising creatives, produced end to end by CONVRT.',
  },
  {
    id: 'spokesperson',
    name: 'Spokesperson video production',
    serviceType: 'Spokesperson video production',
    description:
      'Spokesperson-led video ads that explain an offer clearly and build trust, produced end to end by CONVRT. Spokesperson videos feature real human presenters and can be produced in several languages.',
  },
  {
    id: 'organic',
    name: 'Organic social media video production and management',
    serviceType: 'Organic social media content production and management',
    description:
      'Content strategy, production, publishing on client accounts, performance reporting and engagement across Facebook, Instagram and TikTok. Videos are human-led and can be produced in several languages.',
  },
]

/* Short visible labels for navigation anchors and cards (owner direction, Nov 2026: one short label for service #4). The longer descriptive names stay in page titles, H1s and schema. */
export const SERVICE_LABELS = {
  organic: 'Organic Social Video',
}

export const ADDITIONAL_EXPERTISE = [
  'SaaS and app explainers',
  'Product demonstrations',
  'Animated videos',
  'E-commerce advertising creatives',
]

export const PRODUCTION_LANGUAGES = {
  core: ['English', 'Spanish', 'French', 'Arabic'],
  /** ISO 639-1 codes for the four core languages (used by structured data). */
  coreCodes: ['en', 'es', 'fr', 'ar'],
  other: 'Other languages are available on request, subject to creator availability.',
  /* Owner-confirmed (2026-11-21): CONVRT can support Gulf Arabic and Moroccan Darija productions. The English site keeps this to one concise clause; dialect-specific messaging
     is reserved for the future Arabic-language site. Used by the home, UGC and Spokesperson FAQs so the wording cannot drift. */
  arabicDialects: 'Gulf and Moroccan Arabic dialects',
}

/* Where and how CONVRT produces (owner-approved wording, 2026-11-21). CONVRT is NOT remote-only: it produces remotely through its creator network, films on location in Spain, and may arrange
   on-location shoots in other countries. It maintains no permanent offices or local production teams outside Spain and none may be implied. Read by the About page and the Home FAQ so the
   sentence cannot drift. */
export const PRODUCTION_MODEL = {
  text: 'CONVRT offers remote video production through its creator network, as well as on-location filming in Spain. On-location shoots in other countries may be arranged subject to project requirements, availability and approval.',
  /* On-location filming is NOT part of the standard packages automatically (owner, 2026-11-21). */
  scope: 'On-location filming is subject to project scope, availability and quotation where applicable.',
  /* The short form for places that already point to the full wording. */
  short: 'Remote production through our creator network, and on-location filming in Spain.',
}

/* Owner-confirmed (2026-11-21; the United States added the same day): CONVRT serves international clients. This states clients, not presence: it implies no offices or local legal entities in those markets.
   Current SEO acquisition priorities are Europe, the UK, Spain and the Middle East, but US businesses are not excluded from the service positioning. */
export const INTERNATIONAL_CLIENTS = {
  text: 'We work with international clients, including in Europe, the UK, the Middle East and the United States.',
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
  /* APPROVED OFFER (owner, Nov 2026, second revision): Sprint = 5 concepts, 5 scripts, 3 variations per concept, 15 finished ad
     versions; $3,000 monthly, $3,500 one-off. */
  monthly: usd(3000),
  oneOff: usd(3500),
  concepts: 5,
  scripts: 5,
  variationsPerConcept: 3,
  variations: 15,
  /* Included creator limit (owner, Nov 2026): a MAXIMUM, not a guaranteed allocation. See CREATOR_ALLOCATION below. */
  maxCreators: 3,
  cardDescription: 'For brands ready to discover new creative angles and find what resonates.',
  /* Shared with Sprint Plus (owner, Nov 2026): the two packages differ in volume and price only. */
  extraDetail: 'Includes expanded research and testing recommendations.',
  turnaroundBusinessDays: 10,
  revisionRoundsPerConcept: 2,
  usageMonthsIncluded: USAGE_MONTHS_INCLUDED,
  /* Extension prices are for the ENTIRE creative batch, not per video. Re-based (owner, Nov 2026) from the earlier 10-variation
     batch to the current 15: each is 1.5 times the earlier figure ($625 / $1,000 / $1,750). */
  usageExtensions: [
    { months: 3, price: usd(937.5) },
    { months: 6, price: usd(1500) },
    { months: 12, price: usd(2625) },
  ],
}

export const SPRINT_PLUS = {
  id: 'creative-testing-sprint-plus',
  name: 'Creative Testing Sprint Plus',
  /* APPROVED (owner, Nov 2026, third revision): Sprint Plus is $5,000 monthly, $6,000 one-off, for 30 finished ad versions. */
  monthly: usd(5000),
  oneOff: usd(6000),
  /* Sprint Plus = 10 distinct concepts, 10 complete scripts, 3 variations per concept, 30 finished ad versions. It supersedes the
     earlier 8-concept / unevenly distributed structure. */
  concepts: 10,
  scripts: 10,
  variationsPerConcept: 3,
  variations: 30,
  maxCreators: 5,
  /* Subtle supporting line on the Sprint Plus card. */
  valueLine: 'Twice the creative concepts. Twice the finished ad versions.',
  cardDescription: 'For brands looking for greater creative diversity and deeper testing.',
  extraDetail: 'Includes expanded research and testing recommendations.',
  turnaroundBusinessDays: 15,
  revisionRoundsPerConcept: 2,
  usageMonthsIncluded: USAGE_MONTHS_INCLUDED,
  /* Re-based (owner, Nov 2026) from the earlier 20-variation batch to the current 30: 1.5 times the earlier $1,125 / $1,800 / $3,150. */
  usageExtensions: [
    { months: 3, price: usd(1687.5) },
    { months: 6, price: usd(2700) },
    { months: 12, price: usd(4725) },
  ],
}

export const CREATIVE_TESTING_PACKAGES = [SPRINT, SPRINT_PLUS]

/** 'Up to 3 creators or spokespeople': the card line. */
export const creatorsLine = (pkg) => `Up to ${pkg.maxCreators} creators or spokespeople`

/* How creators are selected and allocated (owner wording, Nov 2026). The numbers are MAXIMUMS. One source for the pricing FAQ (visible
   accordion + FAQPage JSON-LD), the UGC FAQ sentence and the "Production & extras" row, so they cannot drift apart.
   The limits never change the agreed number of concepts or finished ad versions. */
export const CREATOR_ALLOCATION = {
  question: 'How are creators selected and allocated?',
  answer: [
    'Creator selection is based on your campaign goals, target audience and approved creative concepts.',
    `Sprint includes up to ${SPRINT.maxCreators} creators, while Sprint Plus includes up to ${SPRINT_PLUS.maxCreators}.`,
    'The final number and allocation of creators are determined during creative planning, based on what makes the most sense for the campaign and creator availability.',
    'Not every concept requires a different creator, and we prioritize effective creative testing over using the maximum number of creators.',
    "Specific creators and demographics are subject to availability, and several creators aren't automatically assigned to the same concept. The creator limit doesn't change the number of concepts or finished ad versions in your package. If you'd like more creators than your package includes, we'll prepare a custom quote.",
  ],
  /* Concise version for the Production & extras panel and the UGC FAQ. */
  summary: `Up to ${SPRINT.maxCreators} with Sprint, up to ${SPRINT_PLUS.maxCreators} with Sprint Plus, guided by your approved strategy. Allocation is confirmed during planning, subject to availability. It's a maximum, not a guarantee, and adds no concepts or ad versions. More creators need a custom quote.`,
  sentence: `Sprint includes up to ${SPRINT.maxCreators} creators and Sprint Plus up to ${SPRINT_PLUS.maxCreators}; we confirm the final number during creative planning, based on your strategy and creator availability.`,
}

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

/* Organic Social visitors get ONE organic-specific route: the Contact inquiry with "Organic Social Video" already chosen (/contact?service=organic, read by src/components/contact/ContactForm.jsx).
   It used to be the public 20-minute Calendly strategy call (BOOKING_URL, a new tab); the owner asked on 2026-11-27 to remove every unrestricted public Calendly link, so the conversation now starts with
   a short inquiry (existing Contact form, owner e-mail through Resend) and the calendar stays inside the qualified flows (Creative Growth Roadmap booking, private invitations). The Free Creative Growth
   Roadmap is a paid-ads offer whose form asks about monthly paid-ad spend, so it is not used for organic leads. The Organic page hero, its proof and final CTA, its FAQ link and the Organic promo on
   /pricing all read this one object. The href is an English path; every place that renders it localizes it with hrefFor(). */
export const ORGANIC_CTA = {
  label: 'Discuss Your Content Strategy',
  href: '/contact?service=organic',
  external: false,
  promo: {
    eyebrow: 'Your organic content partnership',
    headline: "Let's build your brand's organic presence.",
    text: 'Strategy, consistent video production, publishing and engagement — managed together.',
  },
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
      'SaaS and app demos and explainers',
      'Long-form video production',
      'Custom licensing options',
    ],
    note: 'Scope, pricing and terms are tailored to your project.',
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
    note: 'Scope, pricing and terms are tailored to your project.',
    cta: 'Discuss your project',
  },
}

/* Shown once under the Paid Social cards, for the STANDARD Sprint packages only. */
export const SHARED_SPRINT_BENEFITS = [
  { id: 'research', label: 'Creative research & strategy' },
  { id: 'approval', label: 'Concepts, scripts & approval' },
  { id: 'creators', label: 'Creator selection' },
  { id: 'production', label: 'Filming & editing' },
  { id: 'extras', label: 'Captions, B-roll & graphics' },
  { id: 'reframing', label: 'Square & 4:5 reframing' },
  { id: 'variations', label: 'Creative variations' },
  { id: 'testing', label: 'Testing recommendations' },
  { id: 'language', label: 'Multilingual production', detail: 'One core language included: English, Spanish, French or Arabic.' },
]
/* Short notes shown under the grid. Additional languages are available on request, never implied as free. */
export const SHARED_SPRINT_LANGUAGE_NOTE =
  'Additional languages are available on request and may incur extra charges.'
export const SHARED_SPRINT_NOTE = 'Included in Sprint and Sprint Plus. Custom scopes are agreed individually.'

/* Concise notes under the pricing cards (the full policies live in the panels, the FAQ and the config above). */
export const CARD_NOTES = {
  paid: `Monthly plans start with a ${COMMITMENT.initialMonths}-month commitment, then become month-to-month with ${COMMITMENT.cancellationNoticeDays} days’ notice. One-off projects are also available. All prices exclude VAT.`,
  organic: `A ${ORGANIC_COMMITMENT.initialMonths}-month initial partnership to build a consistent social presence and assess results. All prices exclude VAT.`,
}

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
  /* Compact copy for the Usage rights panel. The long-form wording below (afterExpiry, notOwnership, creatorAccountAds) stays
     in the FAQ. */
  panel: {
    headline: '6 months of worldwide usage included.',
    fromDelivery: 'From the date each video is delivered.',
    shortUses: ['Paid ads', 'Organic social', 'Website use'],
    expirySummary: 'Existing organic posts and website placements may stay live. Paid advertising, resharing and republishing require an extension.',
    creatorNote: 'Creator-account advertising, including Spark Ads and Meta partnership ads, is arranged and priced separately.',
    batchNote: 'Extensions apply to the entire creative batch. Prices exclude VAT.',
    organic: 'Content usage terms are set out in your agreement. Paid Social usage rights and extension prices do not automatically apply.',
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
  shortNote: 'Optional add-on to finished videos.',
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
  { id: 'strategy', title: 'Strategy', description: 'Research & creative concepts.', steps: [0, 1, 2] },
  { id: 'preparation', title: 'Preparation', description: 'Creators, scripts & approval.', steps: [3, 4, 5] },
  { id: 'production', title: 'Production', description: 'Filming, editing & variations.', steps: [6] },
  { id: 'delivery', title: 'Delivery', description: 'Finished videos, revisions & recommendations.', steps: [7] },
]

export const PRODUCT_REQUIREMENTS = {
  physical: 'For physical products produced remotely by a creator, you ship the product to the selected creator and cover the shipping costs.',
  saas: 'For software and app products, you provide a dedicated demo or dummy account with access to the relevant features, using test data rather than real customer information where possible.',
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
    'Content strategy & planning',
    'Concepts & scripting',
    'Filming & editing',
    'Captions & post copy',
    'Scheduling & publishing',
    'Cross-platform distribution',
    'Performance optimization',
    'Community engagement',
  ],
  panelNote: 'Facebook, Instagram and TikTok. Community management excludes customer support.',
  /* The same sentence on its own, for places that already name the platforms elsewhere (the Organic Social page's package section). */
  customerSupportNote: 'Community management excludes customer support.',
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
  { id: 'strategy', title: 'Strategy', sequenceLabel: 'Strategy', description: 'Content planning & objectives.' },
  { id: 'production', title: 'Production', sequenceLabel: 'Production', description: 'Concepts, filming & editing.' },
  { id: 'publishing', title: 'Publishing', sequenceLabel: 'Publishing & engagement', description: 'Distribution & engagement.' },
  { id: 'optimization', title: 'Optimization', sequenceLabel: 'Optimization', description: 'Performance review & refinement.' },
]

/* ── owner review flags ───────────────────────────────────────────────────────────────── */
/* Things the owner must confirm before production. The tests assert this list exists so it cannot be dropped
   silently; the delivery report prints it. */
export const OWNER_REVIEW_FLAGS = [
  'Copyright, derivative-editing and ownership terms are deferred to the applicable agreement: no ownership transfer or unrestricted editing rights may be implied.',
  'Detailed organic operational commitments (community management scope, reporting schedule, response times, monitoring hours, video counts) are deferred to the applicable agreement.',
]

/* ── public claims register ───────────────────────────────────────────────────────────────
   Every figure, credential and client relationship the PUBLIC pages state, with where it comes from and whether it is confirmed. It exists so a claim has ONE reviewable home and so the
   tests can prove the pages still use it (tests/claims-register.test.mjs). It never adds a claim: an entry only describes what the site already says.
   status:  'owner-confirmed'            the owner confirmed it (date in `source`)
            'published-client-reported'  reported by the client, published with that qualifier
            'needs-confirmation'         shown on the site, but no source is recorded: ask the owner before building anything new on it
                                         (none left after the owner's review of 2026-11-21)
   The wording of every claim is unchanged by the Batch 2 review (2026-11-21); `proposed` is a conservative replacement for the owner to approve, never applied. */
export const PUBLIC_CLAIMS = [
  /* The four statistics below are the founder's combined professional experience, NOT CONVRT-Studio-only (owner, 2026-11-22). Their numbers and the verified basis of the returning-client
     percentage are unchanged; only the attribution on the pages changed. The 13 logos are separate (verified relationships authorised for display). */
  { id: 'founder-experience-scope', claim: `${CONVRT_STATS.videos} videos, ${CONVRT_STATS.clients} clients, ${CONVRT_STATS.views} views and ${CONVRT_STATS.returningClients} returning clients are ${FOUNDER_EXPERIENCE.scope}.`, appears: 'homepage credibility strip and final CTA strip; /pricing stats row; About "The founder\'s experience"', source: 'owner-confirmed 2026-11-22 (all four figures)', status: 'owner-confirmed',
    note: 'Never describe these as CONVRT Studio-only, and never attach them to the Organization in structured data. Not part of this scope: client-specific case-study results (Graspo, Elyon), which keep their own periods and qualifiers. The 240+ five-star reviews on ugcbymohamed.com are unconfirmed and are not used anywhere.' },
  { id: 'stat-clients', claim: `Our founder has worked with ${CONVRT_STATS.clients} clients`, appears: 'homepage credibility strip (with the caption); /pricing "Clients served"', source: `siteStats.js; scope: ${FOUNDER_EXPERIENCE.scope}`, status: 'owner-confirmed',
    note: 'Shown beside 13 logos, all confirmed as verified relationships authorised for display (owner, 2026-11-21). "Clients", not "brands" (owner, 2026-11-22).' },
  { id: 'stat-videos', claim: `${CONVRT_STATS.videos} videos produced`, appears: 'homepage final CTA strip; /pricing stats row', source: `siteStats.js; scope: ${FOUNDER_EXPERIENCE.scope}`, status: 'owner-confirmed', note: 'Counts videos, not creators. Founder combined experience, not CONVRT Studio alone.' },
  { id: 'stat-views', claim: `${CONVRT_STATS.views} views generated`, appears: 'homepage final CTA strip; /pricing stats row', source: `siteStats.js; scope: ${FOUNDER_EXPERIENCE.scope}`, status: 'owner-confirmed', note: 'No platform or period is stated on the page. Founder combined experience, not CONVRT Studio alone.' },
  { id: 'stat-returning', claim: `${CONVRT_STATS.returningClients} of clients return for more`, appears: 'homepage final CTA strip', source: `owner-confirmed 2026-11-21 (supporting business records exist; calculation basis unchanged); scope: ${FOUNDER_EXPERIENCE.scope}`, status: 'owner-confirmed', note: 'The percentage keeps its existing verified basis; it is not reinterpreted. Founder combined experience, not CONVRT Studio alone.' },
  { id: 'arabic-dialects', claim: PRODUCTION_LANGUAGES.arabicDialects, appears: 'home, UGC and Spokesperson FAQs (not the Organic FAQ)', source: 'owner-confirmed 2026-11-21 (Gulf Arabic and Moroccan Darija)', status: 'owner-confirmed',
    note: 'Dialect-specific messaging is reserved for the future Arabic-language site; the English site keeps this one clause.' },
  { id: 'quality-review', claim: 'Every project goes through our internal creative quality review.', appears: 'home FAQ "What makes CONVRT different?" and UGC FAQ "revisions-and-performance"', source: 'owner-confirmed 2026-11-21: an actual process (kept as published)', status: 'owner-confirmed' },
  { id: 'hundreds-of-creatives', claim: "After producing hundreds of creatives, we've developed a strong understanding of what captures attention", appears: 'home FAQ "Do you help with concepts and scripting?"', source: 'owner-confirmed 2026-11-21: accurate and substantiable (kept as published)', status: 'owner-confirmed',
    note: 'Scope (CONVRT Studio or the founder\'s wider work) not separately confirmed: left unchanged on purpose (owner, 2026-11-22). Ask before building on it.' },
  { id: 'international-clients', claim: INTERNATIONAL_CLIENTS.text, appears: 'About page ("at a glance" and "Markets, production and languages")', source: 'owner-confirmed 2026-11-21', status: 'owner-confirmed',
    note: 'States clients, not presence: it implies no offices or local legal entities in Europe, the UK, the Middle East or the United States. SEO acquisition priorities remain Europe, the UK, Spain and the Middle East; US businesses are not excluded.' },
  { id: 'production-model', claim: PRODUCTION_MODEL.text, appears: 'About page; Home FAQ "other languages and for other markets"', source: 'owner-confirmed 2026-11-21 (approved wording, verbatim)', status: 'owner-confirmed',
    note: 'CONVRT is not remote-only. Implies no permanent offices or local production teams outside Spain. On-location filming is not presented as part of standard packages: PRODUCTION_MODEL.scope says it is subject to project scope, availability and quotation where applicable.' },
  { id: 'human-created-ugc', claim: 'UGC videos are 100% human-created, featuring real human creators', appears: 'UGC FAQ, structured data', source: 'owner-confirmed Nov 2026 (scoped to the UGC service)', status: 'owner-confirmed' },
  { id: 'client-logos', claim: '13 client logos: TikTok, inDrive, Airalo, Ria, Expert Option, Promova, FIXD, Adscale, Toluna, WPX, Elyon, Coursiv, Graspo', appears: 'homepage credibility strip', source: 'owner-confirmed 2026-11-21: all 13 are verified relationships authorised for display', status: 'owner-confirmed' },
  { id: 'elyon-roas', claim: '5.28x ROAS, 9 purchases, $3,421.25 reported revenue (one video)', appears: 'UGC page proof, Elyon case study, Elyon page title/description', source: 'client-reported, early learning phase (src/content/ugcProof.js)', status: 'published-client-reported',
    note: 'The case-study registry blurb says "reaching up to 5.28x ROAS" for the whole campaign; the proof says one video. Titles and descriptions now say "client-reported" and "one video".' },
  { id: 'elyon-creatives', claim: '160+ creatives', appears: 'Elyon case study and description', source: 'published on the Elyon case study as a production count', status: 'published-client-reported' },
  { id: 'graspo-results', claim: '10.7M organic views, 3.4M accounts reached, 75 unique inbound leads (1 Jan to 19 Jun 2026)', appears: 'Graspo case study, Organic page proof, descriptions', source: 'Meta Business Suite (views, reach) and Graspo\'s inbound tracker (leads)', status: 'published-client-reported' },
  { id: 'graspo-views-switcher', claim: '10.7M organic views generated through our work with Graspo.', appears: 'case-study switcher card ("10.7M Organic Views") and "Next case study" block', source: 'the Graspo case study: Meta Business Suite total views across Facebook and Instagram, 1 Jan to 19 Jun 2026 (replaces "From zero to 10M+ organic views", owner 2026-11-21)', status: 'published-client-reported',
    note: 'An aggregate across the Facebook and Instagram accounts during the management period, not one video, and the case study itself carries the source and period. No timeframe is stated in the short teaser, so none is implied.' },
]
