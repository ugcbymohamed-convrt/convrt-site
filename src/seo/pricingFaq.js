/* The /pricing FAQ. ONE list, used for the visible accordion (src/components/pricing/PricingFAQ.jsx) and for the
   FAQPage JSON-LD (src/seo/structuredData.js), so the markup can never differ from what a visitor reads.

   Every figure comes from src/seo/businessKnowledge.js; no price or policy is typed into a sentence by hand.
   An answer is an array of paragraphs. */

import {
  formatMoney, SPRINT, SPRINT_PLUS, COMMITMENT, SINGLE_VIDEOS, TAX, USAGE_RIGHTS, RAW_FOOTAGE,
  RESHOOTS, FORMATS, TURNAROUND, REVISIONS, ORGANIC, PRODUCT_REQUIREMENTS, ORGANIC_COMMITMENT, CUSTOM_TERMS,
} from './businessKnowledge.js'

/* ['a','b','c'] → 'a, b and c' */
const andList = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
const ext = (pkg) => pkg.usageExtensions.map((e) => `${e.months} months for ${formatMoney(e.price)}`).join(', ')

/* Presentation groups for the categorized FAQ. Every question is always in the HTML; the selector only chooses which
   group is visible. */
export const FAQ_CATEGORIES = [
  { id: 'packages', label: 'Packages & pricing' },
  { id: 'production', label: 'Production & delivery' },
  { id: 'usage', label: 'Usage rights & add-ons' },
  { id: 'organic', label: 'Organic social' },
]

export const PRICING_FAQ = [
  {
    id: 'concept-vs-variation',
    category: 'packages',
    q: 'What is the difference between a creative concept and an ad variation?',
    a: [
      'A creative concept is a distinct advertising angle or idea. A variation is an alternative version of that concept, such as a different hook or call to action.',
      `The ${SPRINT.name} includes ${SPRINT.concepts} distinct concepts with ${SPRINT.variationsPerConcept} variations each, ${SPRINT.variations} ad variations in total. ${SPRINT_PLUS.name} includes ${SPRINT_PLUS.concepts} concepts with ${SPRINT_PLUS.variationsPerConcept} variations each, ${SPRINT_PLUS.variations} ad variations in total. You receive a structured creative batch built for testing, not a collection of unrelated videos.`,
    ],
  },
  {
    id: 'whats-included',
    category: 'packages',
    q: 'What is included in a Creative Testing package?',
    a: [
      `Full-service creative production: research, concept and script development, creator selection, filming, editing and delivery. ${SPRINT.name} is ${formatMoney(SPRINT.monthly)}/month for ${SPRINT.concepts} concepts and ${SPRINT.variations} ad variations. ${SPRINT_PLUS.name} is ${formatMoney(SPRINT_PLUS.monthly)}/month for ${SPRINT_PLUS.concepts} concepts and ${SPRINT_PLUS.variations} ad variations.`,
      `Both include ${REVISIONS.roundsPerConcept} rounds of revisions per creative concept and ${USAGE_RIGHTS.includedMonths} months of worldwide usage rights. Production includes ${andList(FORMATS.fullProductionIncludes.map((x) => (x === 'B-roll' ? x : x.toLowerCase())))}, ${FORMATS.scopeQualifier}.`,
    ],
  },
  {
    id: 'minimum-commitment',
    category: 'packages',
    q: 'Is there a minimum commitment?',
    a: [
      `Paid Social monthly partnerships: ${COMMITMENT.summary} One-off projects are available separately, without a recurring commitment.`,
      `Organic Social partnerships: ${ORGANIC_COMMITMENT.rationale} ${ORGANIC_COMMITMENT.afterInitial}`,
      `${COMMITMENT.rationale} ${CUSTOM_TERMS}`,
    ],
  },
  {
    id: 'one-off-and-single-video',
    category: 'packages',
    q: 'Can I book a one-off package, or order just one video?',
    a: [
      `Yes, one-off packages are available: ${SPRINT.name} is ${formatMoney(SPRINT.oneOff)} and ${SPRINT_PLUS.name} is ${formatMoney(SPRINT_PLUS.oneOff)}.`,
      `${SINGLE_VIDEOS.statement} Our packages are structured creative batches, so there is enough variety to test.`,
    ],
  },
  {
    id: 'turnaround-start',
    category: 'production',
    q: 'When does production turnaround begin?',
    a: [
      `Turnaround is ${SPRINT.turnaroundBusinessDays} business days for ${SPRINT.name} and ${SPRINT_PLUS.turnaroundBusinessDays} business days for ${SPRINT_PLUS.name}. It begins ${TURNAROUND.startsAt}, not when payment is made.`,
    ],
  },
  {
    id: 'revisions',
    category: 'production',
    q: 'How many revisions are included?',
    a: [
      `Two rounds of revisions are included per creative concept. ${REVISIONS.note}`,
    ],
  },
  {
    id: 'usage-rights-included',
    category: 'usage',
    q: 'What usage rights are included?',
    a: [
      `Creative Testing packages include ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights, starting on ${USAGE_RIGHTS.startsOn}. Included uses: ${andList(USAGE_RIGHTS.includedUses.map((u) => u.toLowerCase()))}.`,
      USAGE_RIGHTS.notOwnership,
    ],
  },
  {
    id: 'usage-rights-expiry-extension',
    category: 'usage',
    q: 'What happens when my usage rights expire, and can I extend them?',
    a: [
      `${USAGE_RIGHTS.afterExpiry.mayRemain.join(' ')} ${USAGE_RIGHTS.afterExpiry.mustStop.join(' ')}`,
      `You can extend the usage rights for the entire creative batch. ${SPRINT.name}: ${ext(SPRINT)}. ${SPRINT_PLUS.name}: ${ext(SPRINT_PLUS)}. Extension prices exclude VAT.`,
    ],
  },
  {
    id: 'perpetual-usage',
    category: 'usage',
    q: 'Can I purchase perpetual usage rights?',
    a: [USAGE_RIGHTS.perpetual],
  },
  {
    id: 'spark-ads',
    category: 'usage',
    q: 'Do you offer Spark Ads or partnership ads?',
    a: [
      `${USAGE_RIGHTS.creatorAccountAds.summary} ${USAGE_RIGHTS.creatorAccountAds.notIncluded}`,
    ],
  },
  {
    id: 'raw-footage',
    category: 'usage',
    q: 'Is raw footage available?',
    a: [
      `We offer raw footage exclusively as an optional add-on at ${formatMoney(RAW_FOOTAGE.price)} per ${RAW_FOOTAGE.per}. ${RAW_FOOTAGE.policy} Raw footage is available alongside your finished creatives, never as a replacement for them.`,
      'Buying raw footage does not by itself transfer copyright ownership, unlimited editing rights or perpetual usage rights. Those terms are set out in the applicable agreement.',
    ],
  },
  {
    id: 'production-requirements',
    category: 'production',
    q: 'What do you need from me before production starts?',
    a: [PRODUCT_REQUIREMENTS.physical, PRODUCT_REQUIREMENTS.saas],
  },
  {
    id: 'reshoots',
    category: 'production',
    q: 'What happens if I need a reshoot?',
    a: [RESHOOTS.weCover, RESHOOTS.clientPays],
  },
  {
    id: 'formats-and-length',
    category: 'production',
    q: 'Which video lengths and aspect ratios are included?',
    a: [
      `Standard performance videos are up to ${FORMATS.standardMaxSeconds} seconds. ${FORMATS.longForm}`,
      `${FORMATS.included.join(' and ')} are included. ${FORMATS.separateDeliverable} ${FORMATS.nativeApproach}`,
    ],
  },
  {
    id: 'vat',
    category: 'packages',
    q: 'Are prices inclusive of VAT?',
    a: [TAX.statement],
  },
  {
    id: 'organic-commitment',
    category: 'organic',
    q: 'Why is there a six-month minimum commitment for organic social media?',
    a: [ORGANIC_COMMITMENT.faqAnswer, ORGANIC_COMMITMENT.afterInitial],
  },
  {
    id: 'organic-included',
    category: 'organic',
    q: 'What is included in the organic social media packages?',
    a: [
      `${ORGANIC.light.name} is ${formatMoney(ORGANIC.light.monthly)}/month and ${ORGANIC.growth.name} is ${formatMoney(ORGANIC.growth.monthly)}/month. Both packages include ${andList(ORGANIC.includedInBoth.map((s) => s.toLowerCase()))}. The service covers ${andList(ORGANIC.scope.map((s) => s.toLowerCase()))}, across ${andList(ORGANIC.platforms)}.`,
      `${ORGANIC.communityManagement} ${ORGANIC.excluded.join(' ')}`,
    ],
  },
]

/* Plain text of one answer, as used in FAQPage JSON-LD. */
export const faqAnswerText = (item) => item.a.join(' ')
