/* The /spokesperson-video-production FAQ. ONE list, used for the visible accordion (src/components/ugc/UgcFAQ.jsx, configured by
   src/content/spokespersonPage.js) and for the FAQPage JSON-LD on that page (src/seo/structuredData.js), so the markup can never
   differ from what a visitor reads.

   Every price, duration and policy comes from src/seo/businessKnowledge.js; nothing commercial is typed into a sentence by hand.
   No spokesperson-specific price, turnaround, revision allowance or usage right exists in the business data, so none is stated here:
   the answers quote the published package terms and say where a project is scoped individually.
   "Real human presenters" is the owner's positioning for this service (brief, Nov 2026). It is scoped to the spokesperson service and
   is NOT a claim about the rest of the business. An answer is an array of paragraphs. */

import {
  formatMoney, SPRINT, SPRINT_PLUS, SINGLE_VIDEOS, USAGE_RIGHTS, FORMATS, REVISIONS, TALENT, PRODUCTION_LANGUAGES, PRODUCT_REQUIREMENTS,
  SHARED_SPRINT_LANGUAGE_NOTE, TURNAROUND, CUSTOM_TERMS, creatorsLine,
} from './businessKnowledge.js'
import { OFFER_PATHS } from '../config.js'

export const SPOKESPERSON_FAQ = [
  {
    id: 'what-is-a-spokesperson-video',
    q: 'What is a spokesperson video?',
    a: [
      'A spokesperson video features a presenter who speaks to the camera to explain, demonstrate or promote a product, service or message. It is scripted, so the message stays clear, consistent and on brand.',
      'Brands use spokesperson videos on their website, in product presentations and app walkthroughs, in paid advertising and on social media.',
    ],
  },
  {
    id: 'types-of-spokesperson-video',
    q: 'What types of spokesperson videos does CONVRT produce?',
    a: [
      'We produce product and service explanations, product and software demonstrations, website spokesperson videos, SaaS and app walkthroughs, promotional videos, talking-head videos and performance-driven spokesperson ads for paid advertising.',
      'Which formats a project includes, and what is delivered, depends on your package or your custom brief. We work with brands in any industry, not only software or technology.',
    ],
  },
  {
    id: 'spokesperson-vs-ugc',
    q: 'How is a spokesperson video different from UGC?',
    a: [
      'A UGC ad uses a natural, creator-led style that looks native to social feeds. A spokesperson video uses a presenter to deliver a clear, scripted message with authority, often to explain or demonstrate something in more detail.',
      'The two can work together. We manage casting, scripting and production for both.',
    ],
    links: [{ label: 'See our UGC video production', href: '/ugc-video-agency' }],
  },
  {
    id: 'choose-your-presenter',
    q: 'Can I choose the person presenting my video?',
    a: [
      `${TALENT.model} We recommend the presenter who best fits your brand, product and audience, and you can take part in the selection when you want to.`,
      'Relevant work samples are shared before production, and you can request the same presenter for future projects, subject to availability.',
    ],
  },
  {
    id: 'scripts-and-direction',
    q: 'Do you provide scripts and creative direction?',
    a: [
      'Yes. We research your product and audience, shape the message and write the script, with human creative direction through filming and editing. You approve the presenter and the script before anything is filmed.',
      'You provide the brief and the facts about your product, and we do the rest.',
    ],
  },
  {
    id: 'languages',
    q: 'Can you produce spokesperson videos in multiple languages?',
    a: [
      `Yes. We produce in ${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}, including Gulf and Moroccan Arabic dialects, with one core language included in a package. ${PRODUCTION_LANGUAGES.other}`,
      SHARED_SPRINT_LANGUAGE_NOTE,
    ],
  },
  {
    id: 'software-and-apps',
    q: 'Can spokesperson videos demonstrate software or apps?',
    a: [
      'Yes. A presenter can walk viewers through a product, a software interface or a customer problem. We produce product demonstrations and SaaS explainers as part of our work, and scope each one with you.',
      PRODUCT_REQUIREMENTS.saas,
    ],
    links: [{ label: 'See our SaaS video production', href: '/saas-video-production' }],
  },
  {
    id: 'real-people-or-ai',
    q: 'Are the presenters real people or AI-generated?',
    a: [
      'Our spokesperson videos feature real human presenters performing on camera, with human creative direction and quality control. They are not AI-generated avatars.',
    ],
  },
  {
    id: 'spokesperson-cost',
    q: 'How much does professional spokesperson video production cost?',
    a: [
      `We do not publish a separate spokesperson price list. Spokesperson production for paid advertising is available within our Creative Testing packages, which start at ${formatMoney(SPRINT.monthly)} a month (${formatMoney(SPRINT.oneOff)} as a one-off) and include ${creatorsLine(SPRINT).toLowerCase()}. ${SPRINT_PLUS.name} is ${formatMoney(SPRINT_PLUS.monthly)} a month. Prices are in US dollars and exclude VAT.`,
      `Projects that do not fit a standard package, such as SaaS demos, explainers or long-form video, are scoped as custom packages. ${CUSTOM_TERMS} ${SINGLE_VIDEOS.statement}`,
    ],
    links: [{ label: 'Compare packages on the Pricing page', href: '/pricing#packages' }],
  },
  {
    id: 'turnaround',
    q: 'How long does spokesperson video production take?',
    a: [
      `For our standard packages, production turnaround is ${SPRINT.turnaroundBusinessDays} business days for the ${SPRINT.name} and ${SPRINT_PLUS.turnaroundBusinessDays} business days for ${SPRINT_PLUS.name}. The clock starts ${TURNAROUND.startsAt}, not when you pay.`,
      'For a custom project, we agree the timeline with you when we scope the work.',
    ],
  },
  {
    id: 'revisions-and-usage-rights',
    q: 'What revisions and usage rights are included?',
    a: [
      `Standard packages include ${REVISIONS.roundsPerConcept} rounds of revisions per creative concept, and ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights from the date each video is delivered. ${REVISIONS.note}`,
      `${USAGE_RIGHTS.notOwnership} For a custom project, revisions and usage terms are agreed individually.`,
    ],
    links: [{ label: 'Extension prices and full usage-rights terms on the Pricing page', href: '/pricing#package-info' }],
  },
  {
    id: 'where-it-can-be-used',
    q: 'Can the finished video be used on websites, social media and paid advertising?',
    a: [
      `Yes. Included usage covers ${USAGE_RIGHTS.includedUses.slice(0, 3).map((u) => u.toLowerCase()).join(', ')}, within the agreed usage period.`,
      `Standard videos run up to ${FORMATS.standardMaxSeconds} seconds, with ${FORMATS.included.join(' and ')} included. ${FORMATS.separateDeliverable} ${FORMATS.longForm}`,
    ],
    links: [{ label: 'Get 5 free ad concepts', href: OFFER_PATHS.roadmap }],
  },
]

export const spokespersonFaqText = (item) => item.a.join(' ')
