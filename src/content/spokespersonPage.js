/* Content for /spokesperson-video-production. Pure data: the page (src/SpokespersonVideoPage.jsx) feeds each block to the same
   configuration-driven components the UGC page uses (UgcHero, ProcessSection, UgcGallery, UgcFAQ, UgcFinalCTA).

   RULES
   • No price, turnaround, revision allowance or usage right is typed here. Commercial facts live in src/seo/businessKnowledge.js.
   • No result, statistic or testimonial exists for spokesperson work yet: SPOKESPERSON_PROOF is EMPTY on purpose. Add an entry only when the
     owner has verified it for a spokesperson project and has permission to publish it. Do NOT reuse the UGC page's Elyon 5.28x or its two
     testimonials (src/content/ugcProof.js): they describe UGC work.
   • The videos come from src/content/portfolio.js (type: 'spokesperson'), never from here. */

import { OFFER_PATHS, CREATOR_SHOWCASE_PATH } from '../config.js'
import { USAGE_RIGHTS, PRODUCTION_LANGUAGES } from '../seo/businessKnowledge.js'

export const SPOKESPERSON_PATH_LABEL = 'Spokesperson Video Production'

/* 1. HERO. H1 in the HTML: "Human-led spokesperson videos. Built to communicate. Made to convrt." The last word rolls (convrt, explain, connect,
   persuade); every one completes "Made to ___." and the prerendered HTML holds only "convrt.". */
export const SPOKESPERSON_HERO = {
  id: 'spokesperson-h1',
  lines: [
    ['Human-led', 'spokesperson', 'videos.'],
    ['Built', 'to', 'communicate.'],
  ],
  lead: ['Made', 'to'],
  words: ['convrt', 'explain', 'connect', 'persuade'],
  sizer: 'persuade.',
  description:
    'Professional, multilingual spokesperson videos featuring real people on camera. From SaaS demos and product presentations to website videos and paid ads, we handle scripting, talent selection, filming and editing.',
  primary: { label: 'Get 5 Free Ad Concepts', href: OFFER_PATHS.roadmap },
  /* No scrollTo: this button always goes to /creator-showcase. */
  secondary: { label: 'Explore Videos', href: CREATOR_SHOWCASE_PATH },
  track: { cta: 'spokesperson_page_cta_click', work: 'spokesperson_explore_videos_click' },
  stageLabel: 'Spokesperson videos',
  stagePrefix: 'spokesperson',
  /* Empty phones stay EMPTY on preview hosts too: no stand-in portraits, no UGC footage. */
  previewPortraits: false,
}

/* 2. HOW IT WORKS: four stages. The scenes are in src/components/spokesperson/SpokespersonScenes.jsx. */
export const SPOKESPERSON_STAGES = [
  { id: 'brief', title: 'Brief & Message', text: 'We learn your brand, product, audience and goal, then shape the message and the presentation angles worth filming.' },
  { id: 'presenter', title: 'Presenter & Script', text: 'We recommend presenters who fit your brand and write the script. You approve both before anything is filmed.' },
  { id: 'filming', title: 'Filming & Editing', text: 'Your presenter delivers the script on camera. We edit, caption and finish every video.' },
  { id: 'delivery', title: 'Delivery & Distribution', text: 'You receive finished videos prepared for your website, paid advertising, product presentations and social media.' },
]

export const SPOKESPERSON_PROCESS = {
  id: 'how-it-works',
  headingId: 'spokesperson-process-heading',
  eyebrow: 'How it works',
  title: 'How we produce spokesperson videos.',
  intro: 'Four stages, from brief to finished video, with your approval of the presenter and script before filming.',
}

/* 3. ONE MESSAGE, DIFFERENT WAYS TO DELIVER IT. Three production styles. Nothing here says a package includes all three. */
export const SPOKESPERSON_STYLES = {
  eyebrow: 'Spokesperson formats',
  title: 'One message. Different ways to deliver it.',
  steps: [
    { id: 'explain', short: 'Product Explanation', title: 'Product Explanation', text: 'A presenter explains your product or service clearly, straight to camera.' },
    { id: 'demo', short: 'Demonstration', title: 'Demonstration', text: 'A presenter walks viewers through a product, a software interface or a customer problem.' },
    { id: 'promo', short: 'Promotional Creative', title: 'Promotional Creative', text: 'A presenter delivers a persuasive promotional message for paid advertising and marketing.' },
  ],
  note: 'Illustration only. Which styles a project uses, and what is delivered, depends on your package or custom brief.',
}

/* 4. SHOWCASE (the horizontal gallery). */
export const SPOKESPERSON_GALLERY = {
  id: 'spokesperson-videos',
  headingId: 'spokesperson-videos-heading',
  eyebrow: 'Spokesperson showcase',
  title: 'See spokespersons in action.',
  intro: 'Explore different presentation styles, languages and approaches for explaining products, promoting offers and communicating with customers.',
  ariaLabel: 'Spokesperson video examples. Scroll sideways to see more.',
  badge: 'Spokesperson',
  /* /creator-showcase has no service filter yet, so this goes to the whole Creator Showcase. Point it at a filtered view only once one exists. */
  cta: { label: 'Explore Spokesperson Videos', href: CREATOR_SHOWCASE_PATH },
  track: 'spokesperson',
  samplePortraits: null,
  sampleNote: 'Layout preview only: your approved spokesperson videos replace these empty frames. This never shows on the live site.',
}

/* 5. PROOF. Verified spokesperson-specific material only. Both lists are empty today, so the page shows the compact "what to expect" strip
   below (published business terms, not results). Shape of an entry:
     results:      { id, brand, category, metric, metricLabel, context, disclaimer, href? }   a client-reported figure and its honest qualifiers
     testimonials: { id, brand, category, quote, logo?: { src, alt, w, h } }                    verbatim, attributed, with permission */
export const SPOKESPERSON_PROOF = { results: [], testimonials: [] }

export const SPOKESPERSON_EXPECTATIONS = {
  eyebrow: 'What to expect',
  title: 'A clear process, with your approval at every key step.',
  items: [
    { id: 'presenters', title: 'Real human presenters', text: 'Professional presenters on camera, with human creative direction and quality control.' },
    { id: 'approval', title: 'You approve before filming', text: 'You review and approve the presenter and the script before anything is filmed.' },
    { id: 'languages', title: 'Multilingual production', text: `${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}, with other languages on request.` },
    { id: 'usage', title: 'Clear usage terms', text: `Standard packages include ${USAGE_RIGHTS.includedMonths} months of ${USAGE_RIGHTS.scope.toLowerCase()} usage rights.` },
  ],
  link: { label: 'See pricing and terms', href: '/pricing#packages' },
}

/* 6. FINAL CTA. (The FAQ list is src/seo/spokespersonFaq.js; the page composes its heading.) */
export const SPOKESPERSON_CTA = {
  id: 'spokesperson-cta-heading',
  title: 'Ready to put the right face behind your message?',
  emailSubject: 'Spokesperson video production',
  track: { cta: 'spokesperson_page_cta_click', pricing: 'spokesperson_pricing_link_click', email: 'spokesperson_email_click' },
}
