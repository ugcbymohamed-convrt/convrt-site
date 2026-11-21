/* The /social-media-video-production FAQ. ONE list, used for the visible accordion (src/components/ugc/UgcFAQ.jsx, configured by
   src/content/organicSocialPage.js) and for the FAQPage JSON-LD on that page (src/seo/structuredData.js), so the markup can never
   differ from what a visitor reads.

   Every price, cadence, platform, commitment and policy comes from src/seo/businessKnowledge.js (ORGANIC, ORGANIC_COMMITMENT, CUSTOM_PACKAGES...); nothing commercial is typed
   into a sentence by hand. Questions follow what buyers ask about outsourced social content (Reddit research, Nov 2026): what is included, how often, what it costs, how it
   is measured, who is on camera and whether it is AI. Nothing promises growth, virality, sales or a reporting schedule, and community management is never described as
   customer support. An answer is an array of paragraphs. */

import {
  formatMoney, ORGANIC, ORGANIC_CTA, ORGANIC_COMMITMENT, CARD_NOTES, CUSTOM_PACKAGES, CUSTOM_TERMS, TALENT, PRODUCTION_LANGUAGES, USAGE_RIGHTS,
} from './businessKnowledge.js'
import { CONTACT_EMAIL } from '../config.js'
import { PATHS } from '../routes.js'
import { ORGANIC_PRICING_HREF } from '../content/organicSocialPage.js'

const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0])
const PLATFORMS = list(ORGANIC.platforms)

export const ORGANIC_SOCIAL_FAQ = [
  {
    id: 'what-is-organic-social-video-production',
    q: 'What is organic social media video production?',
    a: [
      'It is the planning, scripting, filming and editing of short-form videos that you publish on your own social media accounts, without paying to promote them. The aim is to give your audience a reason to follow, watch and engage, consistently over time.',
      `CONVRT also publishes the content on your accounts and manages the community around it, according to the package you choose. Our organic packages cover ${PLATFORMS}.`,
    ],
  },
  {
    id: 'organic-vs-ugc',
    q: 'How is organic content different from UGC advertising?',
    a: [
      'UGC advertising is made to be run as paid ads and is tested for performance. Organic content is made to be published on your own channels and to build a consistent presence, so it is planned as an ongoing calendar rather than as a batch of ad variations.',
      `${ORGANIC.excluded[1]} The two can work together, and we produce both.`,
    ],
    links: [{ label: 'See our UGC video production', href: PATHS.ugcVideoAgency }],
  },
  {
    id: 'types-of-social-video',
    q: 'What types of social media videos can CONVRT create?',
    a: [
      'Short-form videos for your feed: educational Reels, creator-led stories, entertaining videos, product-focused videos and founder-led content are typical examples. We choose the mix with you during content planning, based on your brand and audience.',
      'Every video is professionally edited, and each post comes with a caption and post copy. Which formats a project includes depends on your package or custom brief.',
    ],
  },
  {
    id: 'strategy-and-planning',
    q: 'Do you handle creative strategy and content planning?',
    a: [
      'Yes. Content strategy and planning, video concepts and scripting are part of the service. We study your brand, audience and goals, then build an organized plan so every video has a purpose.',
      'You provide the brief and the facts about your business, and we do the rest.',
    ],
  },
  {
    id: 'creators-and-presenters',
    q: 'Can you provide creators and on-camera presenters?',
    a: [
      `${TALENT.model} We recommend the creator or presenter who best fits your brand, and you can take part in the selection when you want to.`,
      'Relevant work samples are shared before production, and you can request the same creator for future content, subject to availability.',
    ],
  },
  {
    id: 'platforms',
    q: 'Do you produce videos for Instagram, TikTok, YouTube Shorts and LinkedIn?',
    a: [
      `Our organic packages cover ${PLATFORMS}. The videos are made for vertical, short-form viewing, but YouTube Shorts and LinkedIn are not part of the standard packages.`,
      'If you need other platforms, tell us and we will say whether a custom plan can cover them.',
    ],
    links: [{ label: 'Talk to us about a custom plan', href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Organic social video production')}` }],
  },
  {
    id: 'posting-and-community',
    q: 'Do your services include posting and community management?',
    a: [
      `Yes. Both organic packages include ${ORGANIC.includedInBoth.map((x) => x.toLowerCase()).join(' and ')}. We publish on your accounts and handle social media engagement and brand relationship management.`,
      `${ORGANIC.communityManagement} Customer support is not part of the service.`,
    ],
    links: [{ label: 'See the Graspo case study', href: PATHS.caseStudyGraspo }],
  },
  {
    id: 'organic-light-vs-growth',
    q: `What’s included in ${ORGANIC.light.name} and ${ORGANIC.growth.name}?`,
    a: [
      `Both include content strategy and planning, concepts and scripting, filming and editing, captions and post copy, scheduling and publishing, performance reporting and optimization, and community engagement, across ${PLATFORMS}.`,
      `The difference is volume: ${ORGANIC.light.name} is ${ORGANIC.light.cadence}, and ${ORGANIC.growth.name} is ${ORGANIC.growth.cadence}.`,
      USAGE_RIGHTS.panel.organic,
    ],
    links: [{ label: 'See both packages on the Pricing page', href: ORGANIC_PRICING_HREF }],
  },
  {
    id: 'organic-cost',
    q: 'How much does organic social media content production cost?',
    a: [
      `${ORGANIC.light.name} is ${formatMoney(ORGANIC.light.monthly)} a month and ${ORGANIC.growth.name} is ${formatMoney(ORGANIC.growth.monthly)} a month. Prices are in US dollars and exclude VAT.`,
      `${ORGANIC_COMMITMENT.faqAnswer} ${ORGANIC_COMMITMENT.afterInitial}`,
      `${CUSTOM_PACKAGES.organic.description} ${CUSTOM_TERMS}`,
    ],
    links: [{ label: 'Compare packages on the Pricing page', href: ORGANIC_PRICING_HREF }],
  },
  {
    id: 'languages',
    q: 'Can you produce videos in multiple languages?',
    a: [
      `Yes. We produce in ${list(PRODUCTION_LANGUAGES.core)}. ${PRODUCTION_LANGUAGES.other}`,
      'We confirm how languages apply to your organic plan when we scope it with you.',
    ],
  },
  {
    id: 'real-people-or-ai',
    q: 'Are your videos created by real people or AI?',
    a: [
      'Our organic videos are human-led: real creators and presenters perform on camera, with human creative direction and quality control from our team.',
    ],
  },
  {
    id: 'measuring-performance',
    q: 'How do you evaluate organic content performance?',
    a: [
      'We review the performance data your platforms make available, such as views, watch time and engagement, to see what your audience responds to, and we use it to refine the content plan. Performance reporting and optimization are part of the organic service.',
      'We never guarantee virality, follower growth or sales. Organic results build over time, which is why our organic partnerships start with an initial commitment. How often we report is set out in your agreement.',
    ],
    links: [{ label: ORGANIC_CTA.label, href: ORGANIC_CTA.href, external: ORGANIC_CTA.external }],
  },
]

export const organicSocialFaqText = (item) => item.a.join(' ')
