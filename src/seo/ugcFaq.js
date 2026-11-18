/* The /ugc-video-agency FAQ. ONE list, used for the visible accordion (src/components/ugc/UgcFAQ.jsx) and for the FAQPage
   JSON-LD on that page (src/seo/structuredData.js), so the markup can never differ from what a visitor reads.

   Every price, duration and policy comes from src/seo/businessKnowledge.js; nothing commercial is typed into a sentence by hand.
   Owner-confirmed positioning (Nov 2026): CONVRT's UGC videos are 100% human-created, featuring real human creators. That
   statement is scoped to the UGC service and its finished videos. It is NOT a claim about the rest of the business.
   An answer is an array of paragraphs. */

import {
  formatMoney, adVersions, SPRINT, SPRINT_PLUS, COMMITMENT, SINGLE_VIDEOS, USAGE_RIGHTS, RAW_FOOTAGE, RESHOOTS, FORMATS, TURNAROUND,
  REVISIONS, PRODUCT_REQUIREMENTS, TALENT, PRODUCTION_LANGUAGES, PARTNERSHIP_TERMS,
} from './businessKnowledge.js'

const [S3, S6, S12] = SPRINT.usageExtensions
const [P3, P6, P12] = SPRINT_PLUS.usageExtensions
const ext = (pkg) => pkg.usageExtensions.map((e) => `${e.months} months for ${formatMoney(e.price)}`).join(', ')

export const UGC_FAQ = [
  {
    id: 'what-is-a-ugc-agency',
    q: 'What is a UGC agency, and what does your UGC service include?',
    a: [
      'A UGC agency commissions and manages creator-led video content for your brand. Ours covers creative research, concepts and hooks, scripts, creator selection, filming, editing, captions, reframing and creative variations, produced end to end for brands in any industry.',
      "We make the ads. We don't buy media or manage your advertising accounts, so you keep control of distribution and spend.",
    ],
  },
  {
    id: 'ugc-vs-influencer',
    q: "What's the difference between UGC and influencer marketing?",
    a: [
      'Influencers are paid for access to their audience. UGC creators are paid for the content itself. You commission the video and run it from your own accounts, so a UGC creator does not need a large following. They need to understand hooks, buyer psychology and your product.',
      'Genuine customer content is different again, and we never present paid creators as genuine customers.',
    ],
  },
  {
    id: 'ugc-cost',
    q: 'How much does UGC video production cost?',
    a: [
      `Our UGC production packages start at ${formatMoney(SPRINT.monthly)} a month. The ${SPRINT.name} includes ${SPRINT.concepts} concepts in ${SPRINT.variationsPerConcept} versions each, ${adVersions(SPRINT.variations)} in total. ${SPRINT_PLUS.name} is ${formatMoney(SPRINT_PLUS.monthly)} a month and includes ${SPRINT_PLUS.concepts} concepts in ${SPRINT_PLUS.variationsPerConcept} versions each, ${adVersions(SPRINT_PLUS.variations)} in total.`,
      `${SINGLE_VIDEOS.statement} The price depends on the number of concepts, the creator and language, formats, usage duration and add-ons. Prices are in US dollars and exclude VAT.`,
    ],
  },
  {
    id: 'one-off-and-commitment',
    q: 'Can I book a one-off project, and is there a minimum commitment?',
    a: [
      `Yes. One-off packages are ${formatMoney(SPRINT.oneOff)} for the ${SPRINT.name} and ${formatMoney(SPRINT_PLUS.oneOff)} for ${SPRINT_PLUS.name}: ${PARTNERSHIP_TERMS.oneOff.toLowerCase()}`,
      `Monthly partnerships start with a ${COMMITMENT.initialMonths}-month commitment, then run month-to-month with ${COMMITMENT.cancellationNoticeDays} days' cancellation notice.`,
    ],
  },
  {
    id: 'creators-and-languages',
    q: 'How do you choose creators, and can I approve them?',
    a: [
      `${TALENT.model} We recommend the creator who best fits your brand. You see relevant work samples from each creator before production and can take part in creator selection when you want to. You can request the same creator for future projects, subject to availability.`,
      `We produce in ${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}, including Gulf and Moroccan Arabic dialects. ${PRODUCTION_LANGUAGES.other}`,
    ],
  },
  {
    id: 'human-or-ai',
    q: 'Are your UGC videos made by real people or by AI?',
    a: [
      'Our UGC videos are 100% human-created, featuring real human creators performing on camera, with human creative direction and quality control.',
      'We never present paid creators as genuine customers.',
    ],
  },
  {
    id: 'scripts-and-requirements',
    q: 'Who writes the scripts, and what do you need from me?',
    a: [
      'We do. Every concept gets a complete script written around an approved angle, with its own hooks, and you approve concepts and scripts before filming.',
      `${PRODUCT_REQUIREMENTS.physical} ${PRODUCT_REQUIREMENTS.saas}`,
    ],
  },
  {
    id: 'turnaround',
    q: 'How long does production take?',
    a: [
      `Production turnaround is ${SPRINT.turnaroundBusinessDays} business days for the ${SPRINT.name} and ${SPRINT_PLUS.turnaroundBusinessDays} business days for ${SPRINT_PLUS.name}. The clock starts ${TURNAROUND.startsAt}, not when you pay.`,
    ],
  },
  {
    id: 'formats-and-variations',
    q: 'Which video lengths, formats and versions are included?',
    a: [
      `Standard videos run up to ${FORMATS.standardMaxSeconds} seconds, with ${FORMATS.included.join(' and ')} included. ${FORMATS.separateDeliverable} ${FORMATS.longForm}`,
      `Each concept comes in ${SPRINT.variationsPerConcept} versions, such as a different hook or call to action. The finished ad version totals in our packages already include them, so they are not extra videos on top. A custom package can include more.`,
    ],
  },
  {
    id: 'usage-rights',
    q: 'What usage rights are included, and can I run the videos as paid ads?',
    a: [
      `Yes. Every package includes ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights from the date each video is delivered, covering paid advertising, organic social media and your website.`,
      `${USAGE_RIGHTS.afterExpiry.mayRemain.join(' ')} ${USAGE_RIGHTS.afterExpiry.mustStop.join(' ')} You can extend the usage rights for the whole creative batch: ${SPRINT.name}, ${ext(SPRINT)}; ${SPRINT_PLUS.name}, ${ext(SPRINT_PLUS)}. Extension prices exclude VAT.`,
      USAGE_RIGHTS.notOwnership,
    ],
  },
  {
    id: 'raw-footage-and-creator-accounts',
    q: 'Can I get the raw footage, or run ads from a creator’s account?',
    a: [
      `Raw footage is available only as an optional add-on at ${formatMoney(RAW_FOOTAGE.price)} per ${RAW_FOOTAGE.per}, alongside your finished, edited videos.`,
      `${USAGE_RIGHTS.creatorAccountAds.summary} ${USAGE_RIGHTS.creatorAccountAds.notIncluded}`,
    ],
  },
  {
    id: 'revisions-and-performance',
    q: "How many revisions are included, and what if a video doesn't perform?",
    a: [
      `${REVISIONS.roundsPerConcept} rounds of revisions are included per creative concept. ${REVISIONS.note} ${RESHOOTS.weCover}`,
      "We can't guarantee ad performance, which also depends on your offer, audience and budget. We use results to decide what to test next.",
    ],
  },
]

/* Exposed so tests can prove the figures quoted above are the ones in the data. */
export const UGC_FAQ_EXTENSION_FIGURES = { sprint: [S3, S6, S12], plus: [P3, P6, P12] }

export const ugcFaqText = (item) => item.a.join(' ')
