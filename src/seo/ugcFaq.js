/* The /ugc-video-agency FAQ. ONE list, used for the visible accordion (src/components/ugc/UgcFAQ.jsx) and for the FAQPage
   JSON-LD on that page (src/seo/structuredData.js), so the markup can never differ from what a visitor reads.

   Every price, duration and policy comes from src/seo/businessKnowledge.js; nothing commercial is typed into a sentence by hand.
   Owner-confirmed positioning (Nov 2026): CONVRT's UGC videos are 100% human-created, featuring real human creators. That
   statement is scoped to the UGC service and its finished videos. It is NOT a claim about the rest of the business.
   An answer is an array of paragraphs. */

import {
  formatMoney, pricePerVariation, adVersions, CREATOR_ALLOCATION, SPRINT, SPRINT_PLUS, COMMITMENT, SINGLE_VIDEOS, USAGE_RIGHTS, RAW_FOOTAGE, RESHOOTS, FORMATS, TURNAROUND,
  REVISIONS, PRODUCT_REQUIREMENTS, TALENT, PRODUCTION_LANGUAGES, PARTNERSHIP_TERMS,
} from './businessKnowledge.js'
import { OFFER_PATHS } from '../config.js'
import { PATHS } from '../routes.js'

const [S3, S6, S12] = SPRINT.usageExtensions
const [P3, P6, P12] = SPRINT_PLUS.usageExtensions

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
    id: 'agency-vs-hiring-creators',
    q: 'Should I use a UGC agency or hire creators directly?',
    a: [
      'Both can work. Hiring a creator directly can make sense when you already know the creator you want, have someone in-house to write the brief, review the work and handle the edit, and are comfortable agreeing the usage rights and payment with them yourself.',
      `An agency adds the work around the filming: creative research and strategy, concepts and scripts, creator casting, production coordination, editing and captions, and the usage-rights terms, so you are not negotiating them creator by creator. ${TALENT.model} The right choice depends on what your team already does well and how much of that you want to run yourself.`,
    ],
    links: [{ label: 'See what each package includes', href: '/pricing#packages' }],
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
    id: 'human-or-ai',
    q: 'Are your UGC videos made by real people or by AI?',
    a: [
      'Our UGC videos are 100% human-created, featuring real human creators performing on camera, with human creative direction and quality control.',
      'We never present paid creators as genuine customers.',
    ],
  },
  {
    id: 'creators-and-approval',
    q: 'How do you choose creators, and can I approve them?',
    a: [
      `${TALENT.model} We recommend the creator who best fits your brand and audience, chosen for on-camera delivery and product fit, not follower counts. ${CREATOR_ALLOCATION.sentence}`,
      'You see relevant work samples from the creator before production and can take part in creator selection when you want to. You can request the same creator for future projects, subject to availability.',
    ],
  },
  {
    id: 'how-to-evaluate-a-ugc-agency',
    q: 'How should I evaluate a UGC agency?',
    a: [
      'Ask for evidence rather than claims. Look for relevant work examples, a clear creative process (how concepts and scripts are developed and approved), how creators are chosen and whether you see their work before production, exactly what is delivered (concepts, versions, formats and lengths), which usage rights are included and for how long, how many revision rounds are included, and how results are used to decide what to test next.',
      `You can hold us to the same list. Our packages, deliverables and terms are published on the Pricing page. You see relevant creator work before production and approve concepts and scripts before filming, ${REVISIONS.roundsPerConcept} rounds of revisions per concept and ${USAGE_RIGHTS.includedMonths} months of worldwide usage rights are included, and our packages include testing recommendations. Be cautious of any agency that promises specific ad results.`,
    ],
    links: [
      { label: 'Read the Elyon Dubai case study', href: PATHS.caseStudyElyon },
      { label: 'Compare packages and terms on the Pricing page', href: '/pricing#packages' },
    ],
  },
  {
    id: 'ugc-cost',
    q: 'How much does UGC video production cost?',
    a: [
      `Our UGC production packages start at ${formatMoney(SPRINT.monthly)} a month. The ${SPRINT.name} includes ${SPRINT.concepts} concepts in ${SPRINT.variationsPerConcept} versions each, ${adVersions(SPRINT.variations)} in total. ${SPRINT_PLUS.name} is ${formatMoney(SPRINT_PLUS.monthly)} a month and includes ${SPRINT_PLUS.concepts} concepts in ${SPRINT_PLUS.variationsPerConcept} versions each, ${adVersions(SPRINT_PLUS.variations)} in total. At the monthly price that is ${pricePerVariation(SPRINT).text} per variation for the Sprint and ${pricePerVariation(SPRINT_PLUS).text} per variation for Sprint Plus.`,
      `${SINGLE_VIDEOS.statement} The price depends on the number of concepts, the creator and language, formats, usage duration and add-ons. Prices are in US dollars and exclude VAT.`,
    ],
    links: [{ label: 'Compare packages on the Pricing page', href: '/pricing#packages' }],
  },
  {
    id: 'one-off-and-commitment',
    q: 'Can I book a one-off project, and is there a minimum commitment?',
    a: [
      `Yes. One-off packages are ${formatMoney(SPRINT.oneOff)} for the ${SPRINT.name} and ${formatMoney(SPRINT_PLUS.oneOff)} for ${SPRINT_PLUS.name}: ${PARTNERSHIP_TERMS.oneOff.toLowerCase()}`,
      `Monthly partnerships start with a ${COMMITMENT.initialMonths}-month commitment, then run month-to-month with ${COMMITMENT.cancellationNoticeDays} days' cancellation notice.`,
    ],
    links: [{ label: 'Pricing questions and terms', href: '/pricing#pricing-faq' }],
  },
  {
    id: 'formats-and-variations',
    q: 'What are concepts and versions, and which lengths and formats are included?',
    a: [
      `A concept is a distinct advertising angle with its own hooks and script. Each concept comes in ${SPRINT.variationsPerConcept} versions, such as a different hook or call to action. The finished ad version totals in our packages already include them, so they are not extra videos on top. A custom package can include more.`,
      `Standard videos run up to ${FORMATS.standardMaxSeconds} seconds, with ${FORMATS.included.join(' and ')} included. ${FORMATS.separateDeliverable} ${FORMATS.longForm}`,
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
    id: 'usage-rights',
    q: 'What usage rights are included, and can I run the videos as paid ads?',
    a: [
      `Yes. Every package includes ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights from the date each video is delivered, covering paid advertising, organic social media and your website.`,
      `${USAGE_RIGHTS.afterExpiry.mayRemain.join(' ')} ${USAGE_RIGHTS.afterExpiry.mustStop.join(' ')} You can extend the usage rights for the whole creative batch.`,
      USAGE_RIGHTS.notOwnership,
    ],
    links: [{ label: 'Extension prices and full usage-rights terms on the Pricing page', href: '/pricing#package-info' }],
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
      `${REVISIONS.roundsPerConcept} rounds of revisions are included per creative concept. ${REVISIONS.note} Every project goes through our internal creative quality review. ${RESHOOTS.weCover}`,
      "We can't guarantee ad performance, which also depends on your offer, audience and budget. We use results to decide what to test next.",
    ],
  },
  {
    id: 'languages-and-international',
    q: 'Do you produce UGC in other languages, for international audiences?',
    a: [
      `Yes. We produce in ${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}, including ${PRODUCTION_LANGUAGES.arabicDialects}, with one core language included in a package. ${PRODUCTION_LANGUAGES.other}`,
      'We work with international brands and produce for multilingual audiences.',
    ],
  },
  {
    id: 'scripts-and-strategy',
    q: 'Who writes the scripts and handles creative strategy, and what do you need from me?',
    a: [
      'We do. We research your audience and category, develop the concepts, and write a complete script for each one around an approved angle, with its own hooks. You approve concepts and scripts before anything is filmed.',
      `${PRODUCT_REQUIREMENTS.physical} ${PRODUCT_REQUIREMENTS.saas}`,
    ],
    links: [{ label: 'Get 10 free ad hooks', href: OFFER_PATHS.hooks }],
  },
  {
    id: 'best-suited',
    q: 'Which brands is this best suited to, and how many ads should we test?',
    a: [
      'CONVRT works best with brands that run paid social and want to test several creative angles rather than rely on a single video. We work with brands across industries, including but not limited to SaaS, e-commerce, apps, technology and consumer products. When a project does not fit a standard package, we tailor one.',
      `There is no universal number of creatives to test: it depends on your budget, audience, niche and conversion volume. We size a batch for learning, with ${SPRINT.concepts} or ${SPRINT_PLUS.concepts} concepts, include testing recommendations, and never guarantee specific results.`,
    ],
    links: [
      { label: 'Get 5 free ad concepts', href: OFFER_PATHS.roadmap },
      { label: 'Prefer a presenter-led format? See spokesperson video production', href: PATHS.spokespersonVideoProduction },
      { label: 'Selling software? See SaaS video production', href: PATHS.saasVideoProduction },
    ],
  },
]

/* Exposed so tests can prove the figures quoted above are the ones in the data. */
export const UGC_FAQ_EXTENSION_FIGURES = { sprint: [S3, S6, S12], plus: [P3, P6, P12] }

export const ugcFaqText = (item) => item.a.join(' ')
