/* THE ENGLISH HOMEPAGE'S INDUSTRY SHOWCASE (src/components/home/IndustryShowcase.jsx).

   Two industries, in this fixed order (SaaS · E-commerce), each with ONE documented client. Every statement below already appears on the live homepage, in the published case studies
   (/case-studies/elyon, /case-studies/graspo) or in the client's own review (src/content/reviews.js); nothing is new, estimated or invented.

   VERIFIED MAPPING (Nov 2026)
   • SaaS → Adscale. The homepage's SaaS tab has always shown Adscale (long-form creatives); src/content/portfolio.js records the same ("Industry is the one on the homepage tab (Adscale SaaS)") and Adscale's own
     review is filed "SaaS · Paid Social". There is NO Adscale case-study page and NO measured result on record, so this entry has neither: it links to the SaaS service page instead. Do not add a
     figure or a case-study link until one exists.
   • E-commerce → Elyon Dubai (case study: /case-studies/elyon).
   • Printing → Graspo was REMOVED from the homepage on the owner's request (2026-11-24); Graspo's case study, its videos and its place on the Organic Social page are unchanged.

   Videos are NOT listed here: they are the portfolio entries tagged `showcase: '<clientId>'` in src/content/portfolio.js (the first three, in file order). */
export const SHOWCASE_INDUSTRIES = [
  {
    id: 'saas',
    number: '01',
    label: 'SaaS',
    clientId: 'adscale',
    client: 'Adscale',
    logo: { src: '/clients/adscale.png', alt: 'Adscale', w: 531, h: 149, height: 46 },
    selectorHeight: 22,
    headline: "Long-form creatives that can't be skipped.",
    text: 'Aesthetic transitions, catchy visuals and a delivery so engaging that long creatives build trust instead of getting scrolled past.',
    link: { href: '/saas-video-production', label: 'Explore SaaS video production' },
    accent: '#3b82f6',
  },
  {
    id: 'ecommerce',
    number: '02',
    label: 'E-commerce',
    clientId: 'elyon',
    client: 'Elyon Dubai',
    logo: { src: '/clients/elyon.png', alt: 'Elyon Dubai', w: 600, h: 226, height: 56 },
    selectorHeight: 30,
    headline: '100+ creatives tested. Multiple winners found.',
    text: "Over 100 pieces of content since Elyon's 2025 launch, testing concepts and variations to find the formats that work.",
    link: { href: '/case-studies/elyon', label: 'Read the Elyon Dubai case study' },
    accent: '#f59e0b',
  },
]

/* The case studies that exist, always linked (crawlable) whichever industry is open. (The English homepage no longer draws this list: its destinations are in the visually hidden client navigation of
   IndustryShowcase.jsx; kept for other uses.) */
export const SHOWCASE_CASE_STUDY_LINKS = [
  { href: '/case-studies/elyon', label: 'Elyon Dubai' },
  { href: '/case-studies/graspo', label: 'Graspo' },
]
