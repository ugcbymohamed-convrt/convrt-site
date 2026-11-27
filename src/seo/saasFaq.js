/* The /saas-video-production FAQ (SaaS & app video production). ONE list, used for the visible accordion (src/components/ugc/UgcFAQ.jsx, configured by src/SaasVideoPage.jsx) and for the FAQPage JSON-LD on
   that page (src/seo/structuredData.js), so the markup can never differ from what a visitor reads. (FAQPage markup is accurate structured data; it does not guarantee a Google
   rich result or an AI citation, and nothing on the page says it does.)

   Every price, duration and policy comes from src/seo/businessKnowledge.js; nothing commercial is typed into a sentence by hand. NO SaaS-specific price, turnaround, revision
   allowance, usage right, video quantity or animation deliverable exists in the business data, so none is stated here: the answers say that SaaS and app demos and explainers are
   scoped as custom packages (CUSTOM_PACKAGES.paid lists "SaaS and app demos and explainers"), quote the published package terms for the standard packages only, and point to Pricing.
   The Sprint price and deliverables are NOT applied to custom SaaS explainer projects. An answer is an array of paragraphs. */

import {
  SINGLE_VIDEOS, USAGE_RIGHTS, REVISIONS, PRODUCTION_LANGUAGES, PRODUCT_REQUIREMENTS, SHARED_SPRINT_LANGUAGE_NOTE, CUSTOM_TERMS,
} from './businessKnowledge.js'
import { OFFER_PATHS } from '../config.js'

export const SAAS_FAQ = [
  {
    id: 'what-is-saas-video-production',
    q: 'What is SaaS and app video production?',
    a: [
      'SaaS and app video production is the planning, scripting, filming, animation and editing of videos that explain and promote a software product, web application or mobile app. Typical formats are explainers, product demonstrations, app walkthroughs, launch and feature-announcement videos, and video ads.',
      'CONVRT combines creative strategy, scripting, professional presenters, product demonstrations, motion graphics and editing, so a video is never limited to animation alone.',
    ],
  },
  {
    id: 'types-of-saas-video',
    q: 'What types of SaaS and app videos does CONVRT produce?',
    a: [
      'We produce explainer videos for software and apps, product demonstrations, app walkthroughs, animated product explainers, human-led software and app presentations, feature-announcement and product-launch videos, and SaaS and app advertising creatives for paid social.',
      'These are examples of the formats we make, not a list that every project or package includes. Which formats a project uses, and what is delivered, depends on your approved brief.',
    ],
  },
  {
    id: 'explainer-vs-demo',
    q: 'What’s the difference between a software or app explainer and a product demo?',
    a: [
      'An explainer communicates what the software or app does, who it is for and why it matters. It leads with the idea and the value, often using motion graphics and short on-screen labels.',
      'A product demo shows the product in action by following a real workflow in the interface: selecting a feature, performing an action and showing the result. Many videos combine the two, and we help you choose from your product, your audience and where the video will be used.',
    ],
  },
  {
    id: 'actual-software-interface',
    q: 'Can you create videos using our actual software or app interface?',
    a: [
      'Yes. A video can be built around recordings of your real product, so viewers see the interface they would actually use. We scope this with you.',
      PRODUCT_REQUIREMENTS.saas,
    ],
  },
  {
    id: 'animated-saas-explainers',
    q: 'Do you produce animated explainer videos for software and apps?',
    a: [
      'Yes. We produce animated and motion-graphics-led videos, including animated product explainers, and we can combine animation with screen recordings and on-camera presenters. Animation is one tool among several, so the style, length and mix of elements are agreed in the brief.',
    ],
  },
  {
    id: 'human-presenter-with-demos',
    q: 'Can we combine a real human presenter with product demonstrations?',
    a: [
      'Yes. A professional presenter can introduce the problem, walk viewers through the product and deliver the call to action, with screen recordings and motion graphics supporting them. We recommend a presenter who fits your brand, and you approve the presenter and the script before anything is filmed.',
    ],
    links: [{ label: 'See our spokesperson video production', href: '/spokesperson-video-production' }],
  },
  {
    id: 'saas-video-ads',
    q: 'Can you create SaaS and app videos for paid advertising?',
    a: [
      'Yes. We produce short-form SaaS and app advertising creatives in which a presenter or creator introduces a customer problem, the software or app is demonstrated and a clear call to action follows.',
      'If you want to see what your own ads could look like, you can request five free ad concepts. That offer covers ad concepts; it does not include a free explainer or demo video.',
    ],
    links: [{ label: 'Get 5 free ad concepts', href: OFFER_PATHS.roadmap }, { label: 'See our UGC video agency', href: '/ugc-video-agency' }],
  },
  {
    id: 'concepts-scripts-filming-editing',
    q: 'Do you handle creative concepts, scripts, filming and editing?',
    a: [
      'Yes. We handle the creative strategy, concepts and scripts, presenter or creator selection, filming where a video needs it, screen recordings, motion graphics, captions and editing, so you do not have to coordinate separate freelancers.',
      'You provide the brief and the facts about your product, and you review and approve the concepts and scripts before production starts.',
    ],
  },
  {
    id: 'languages',
    q: 'Can you produce SaaS and app videos in multiple languages?',
    a: [
      `Yes. We produce in ${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}. ${PRODUCTION_LANGUAGES.other}`,
      `For a custom SaaS or app project, the languages and any additional versions are agreed when we scope the work. ${SHARED_SPRINT_LANGUAGE_NOTE}`,
    ],
  },
  {
    id: 'saas-video-cost',
    q: 'How much does SaaS and app video production cost?',
    a: [
      `We do not publish a SaaS or app price list. SaaS and app demos and explainers are scoped as custom packages, because the price depends on the format, the length, how much animation or filming is involved and the number of videos. ${CUSTOM_TERMS}`,
      `Our standard packages and their prices are on the Pricing page, and apply to the work they describe, not automatically to a custom explainer or demo. ${SINGLE_VIDEOS.statement} Prices exclude VAT.`,
    ],
    links: [{ label: 'See pricing and discuss a custom project', href: '/pricing#packages' }],
  },
  {
    id: 'saas-video-timeline',
    q: 'How long does it take to produce a software or app explainer or product demo?',
    a: [
      'We do not quote a fixed timeline for software or app explainers or demos, because it depends on the format, the length, the amount of animation or filming and how quickly concepts, scripts and drafts are approved. We agree the timeline with you when we scope the project.',
      'Turnaround for our standard packages is listed on the Pricing page.',
    ],
    links: [{ label: 'Standard package turnaround on the Pricing page', href: '/pricing#packages' }],
  },
  {
    id: 'revisions-and-usage-rights',
    q: 'What usage rights and revisions are included?',
    a: [
      `Our standard packages include ${REVISIONS.roundsPerConcept} rounds of revisions per creative concept, and ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights from the date each video is delivered. ${REVISIONS.note}`,
      `${USAGE_RIGHTS.notOwnership} For a custom SaaS or app project, revisions and usage terms are agreed individually.`,
    ],
    links: [{ label: 'Extension prices and full usage-rights terms on the Pricing page', href: '/pricing#package-info' }],
  },
]

export const saasFaqText = (item) => item.a.join(' ')
