/* Content for /social-media-video-production (the Organic Social Video Production & Management page). Pure data: the page (src/OrganicSocialVideoPage.jsx) feeds each block
   to the same configuration-driven components the UGC and Spokesperson pages use (UgcHero, ProcessSection, UgcGallery, UgcFAQ, UgcFinalCTA, the proof section).

   RULES
   • No price, post count, platform list, turnaround, reporting schedule or community-management promise is typed here. Packages, cadence, platforms, the six-month
     commitment and the community-management wording come from src/seo/businessKnowledge.js (ORGANIC, ORGANIC_COMMITMENT, CARD_NOTES, CUSTOM_PACKAGES).
   • The ONLY proof is the existing, published Graspo organic case study (verified from Meta Business Suite; /case-studies/graspo). Do NOT reuse the UGC page's Elyon
     5.28x (a paid-social result) or the UGC testimonials. Add an organic testimonial only when the owner has verified it and has permission to publish it.
   • The videos come from src/content/portfolio.js (type: 'organic'), never from here. */

import { OFFER_PATHS, OUR_WORK_PATH } from '../config.js'
import { ORGANIC_STYLES } from './portfolio.js'

export const ORGANIC_PATH_LABEL = 'Organic Social Video Production'

/* Where the compact packages section sends visitors for full details. */
export const ORGANIC_PRICING_HREF = '/pricing#organic'

/* 1. HERO. H1 in the HTML: "Organic social videos. Built to engage. Made to convrt." The last word rolls (convrt, connect, inspire, resonate); every one completes
   "Made to ___." and the prerendered HTML holds only "convrt.". "engage" is not in the reel because the line above already ends "Built to engage." */
export const ORGANIC_HERO = {
  id: 'organic-h1',
  lines: [
    ['Organic', 'social', 'videos.'],
    ['Built', 'to', 'engage.'],
  ],
  lead: ['Made', 'to'],
  words: ['convrt', 'connect', 'inspire', 'resonate'],
  sizer: 'resonate.',
  description:
    'Keep your brand visible with human-led social media videos built around your audience. From creative strategy and scripting to filming, editing, posting and community management, CONVRT helps you create content worth watching.',
  primary: { label: 'Get 5 Free Ad Concepts', href: OFFER_PATHS.roadmap },
  /* No scrollTo: this button always goes to /our-work. */
  secondary: { label: 'Explore Videos', href: OUR_WORK_PATH },
  track: { cta: 'organic_page_cta_click', work: 'organic_explore_videos_click' },
  stageLabel: 'Organic social videos',
  stagePrefix: 'organic',
  /* Empty phones stay EMPTY on preview hosts too: no stand-in portraits, no UGC or spokesperson footage. */
  previewPortraits: false,
}

/* 2. HOW IT WORKS: four stages. The scenes are in src/components/organic/OrganicScenes.jsx. */
export const ORGANIC_PAGE_STAGES = [
  { id: 'strategy', title: 'Strategy & Content Planning', text: 'We study the brand, audience and communication goals, then develop relevant content ideas and an organized production plan.' },
  { id: 'scripts', title: 'Scripts & Creators', text: 'We develop the scripts, select appropriate creators or presenters, and prepare the content for production.' },
  { id: 'filming', title: 'Filming & Editing', text: 'Our creators produce the footage, and CONVRT edits it into polished social media videos.' },
  { id: 'publishing', title: 'Publishing & Community', text: 'Approved content is prepared for publishing, with posting and community management according to the selected package.' },
]

export const ORGANIC_PROCESS = {
  id: 'how-it-works',
  headingId: 'organic-process-heading',
  eyebrow: 'How it works',
  title: 'How we run your organic content.',
  intro: 'Four stages, from the content plan to the published post.',
}

/* 3. NOT JUST MORE POSTS. A CONTENT SYSTEM. Three states; the line Strategy → Production → Publishing → Learning runs through them. Nothing here promises a result,
   a number of videos or a posting frequency: those depend on the package (src/seo/businessKnowledge.js). */
export const ORGANIC_SYSTEM = {
  eyebrow: 'Content system',
  title: 'Not just more posts. A content system.',
  flow: ['Strategy', 'Production', 'Publishing', 'Learning'],
  steps: [
    { id: 'plan', short: 'Plan', title: 'Plan', text: 'Content pillars feed one organized plan, so every video has a purpose before anything is filmed.' },
    { id: 'produce', short: 'Produce', title: 'Produce', text: 'Planned ideas become finished vertical videos: scripted, filmed and edited.' },
    { id: 'publish', short: 'Publish & Learn', title: 'Publish & Learn', text: 'Videos are organized into a publishing calendar. Then we review the performance data your platforms make available and use it to shape the next plan.' },
  ],
  note: 'Illustration only. What a plan includes, and how often content is published, depends on your package.',
}

/* 4. SHOWCASE (the horizontal gallery, with the content-style filter). */
export const ORGANIC_GALLERY = {
  id: 'organic-videos',
  headingId: 'organic-videos-heading',
  eyebrow: 'Organic showcase',
  title: 'Content people actually want to watch.',
  intro: 'From educational Reels and creator-led stories to entertaining short-form videos, explore different ways brands can connect with their audiences.',
  ariaLabel: 'Organic social video examples. Scroll sideways to see more.',
  badge: 'Organic',
  /* /our-work filters by industry only (no content-style or service filter), so this goes to the whole showcase. Point it at a filtered view only once one exists. */
  cta: { label: 'Explore Videos', href: OUR_WORK_PATH },
  track: 'organic',
  samplePortraits: null,
  sampleNote: 'Layout preview only: your approved organic videos replace these empty frames. This never shows on the live site.',
  /* Suggested styles. A chip appears only for a style that an APPROVED video carries (and only when at least two styles are present); a video gets a `style` only once
     the owner has confirmed it (src/content/portfolio.js). On preview hosts the empty frames carry all four so the filter can be reviewed. */
  filter: { ariaLabel: 'Filter videos by content style', allLabel: 'All', field: 'style', options: ORGANIC_STYLES },
}

/* 5. PROOF. Verified organic proof only. Both lists below feed the shared proof section; shape of an entry:
     results:      { id, brand, category, metric, metricLabel, secondary?: [{ value, label }], context, disclaimer, href? }
     testimonials: { id, brand, category, quote, logo?: { src, alt, w, h } }   verbatim, attributed, with permission
   The Graspo figures are the ones already published on /case-studies/graspo (Meta Business Suite, 1 Jan – 19 Jun 2026); tests/organic-social-page.test.mjs proves they still
   match that page. There is no organic testimonial yet, so none is shown. */
export const ORGANIC_PROOF = {
  results: [
    {
      id: 'graspo',
      brand: 'Graspo',
      category: 'Printing · Social media content & management',
      metric: '10.7M',
      metricLabel: 'organic views',
      secondary: [
        { value: '3.4M', label: 'accounts reached' },
        { value: '75', label: 'unique inbound leads' },
      ],
      context: 'CONVRT built an Arabic-first organic social presence for Graspo, a European printing company. Facebook and Instagram, 1 January to 19 June 2026.',
      disclaimer: 'Views and reach: Meta Business Suite. Leads: Graspo’s inbound tracker across Meta, email and WhatsApp. Results are specific to this client and period; they are not typical and not guaranteed.',
      href: '/case-studies/graspo',
    },
  ],
  testimonials: [],
}

export const ORGANIC_PROOF_COPY = {
  eyebrow: 'Results',
  title: 'Organic social, in one client’s numbers.',
  headingId: 'organic-proof-heading',
  track: { cta: 'organic_page_cta_click', pricing: 'organic_pricing_link_click' },
}

/* 6. PACKAGES: a light pointer to the Pricing page, not a second Pricing page. The figures on the cards come from the business data at render time. */
export const ORGANIC_PACKAGES_COPY = {
  id: 'organic-packages',
  headingId: 'organic-packages-heading',
  eyebrow: 'Packages',
  title: 'Consistent content. Flexible support.',
  intro: 'Two organic packages, both with scheduling, posting and community management.',
  link: { label: 'Compare packages and full scope', href: ORGANIC_PRICING_HREF },
  track: 'organic_pricing_link_click',
}

/* 7. FINAL CTA. (The FAQ list is src/seo/organicSocialFaq.js; the page composes its heading.) */
export const ORGANIC_PAGE_CTA = {
  id: 'organic-cta-heading',
  title: 'Ready to turn your ideas into content worth watching?',
  emailSubject: 'Organic social video production',
  track: { cta: 'organic_page_cta_click', pricing: 'organic_pricing_link_click', email: 'organic_email_click' },
}
