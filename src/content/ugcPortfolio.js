/* The creator portfolio on /ugc-video-agency. This file is the ONLY place portfolio videos live.

   HOW TO ADD A VIDEO (no code changes needed): append an object to UGC_PORTFOLIO below.

     {
       id: 'creator-017-skincare-es',          // unique, lowercase, url-safe
       creatorId: 'c017',                      // opaque internal identifier. Never displayed.
       brand: 'Brand name',                    // optional. Only with the brand's permission.
       category: 'Skincare · Paid social',     // optional label shown on the card (a sample category is fine)
       industry: 'beauty',                     // filterable. Any lowercase slug; see INDUSTRY_LABELS.
       languages: ['es'],                      // ISO 639-1 codes of the spoken language(s). Filterable.
       caption: 'One honest sentence describing the video.',   // required. Also the accessible name.
       source: { cloudflareId: '…' },          // Cloudflare Stream id (HLS)…  or  { mp4: '/videos/….mp4' }
       poster: '/portfolio/….webp',            // required for mp4. For Cloudflare it overrides the auto thumbnail (frame at 0 s): use it to show the
                                               // creator at their best moment (UGC page videos: public/portfolio/ugc-<slot>.webp, 540×960)
       creator: { displayName: 'First name', showName: true },   // optional. The name is shown ONLY when showName is true.
       placement: 'gallery',                   // 'hero' = the three-phone stage at the top (first hero item = the large centre phone,
                                               // at most 3 shown); 'gallery' (the default) = the horizontal section below (at most 10)
       caseStudyHref: '/case-studies/…',       // optional related case study
       approval: {
         status: 'approved',                   // anything else keeps the video off the site
         portfolioUse: true,                   // the brand/owner approved this video for CONVRT's website portfolio
         creatorConsent: true,                 // the creator agreed to portfolio display
         approvedBy: 'Name of the CONVRT owner who confirmed it',
         approvedOn: '2026-11-20',
       },
     }

   RULES
   • A video renders ONLY when approval.status === 'approved' AND approval.portfolioUse === true AND
     approval.creatorConsent === true. Approval to produce or deliver a video is NOT portfolio permission.
   • No placeholder, stock or unapproved material, ever. With no approved videos the page shows a brand-consistent
     state of the page (no portfolio section, a text-led hero), so an empty list is a valid, fully working state.
   • A creator's name is personal data: it is shown only when creator.showName is true.
   • Filters are generated from this data and appear only when a facet has two or more values. The category toggles are
     SaaS, E-commerce, Apps and Other (every other industry slug groups under Other; the card still shows the specific industry).
     A category with no approved video never appears.
   • tests/ugc-page.test.mjs validates every entry (unique ids, valid codes, source, permission flags). */

export const UGC_PORTFOLIO = [
  {
    id: 'ugc-hero-1',
    creatorId: 'cv-hero-1',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 1.',
    placement: 'hero',
    poster: '/portfolio/ugc-hero-1.webp',
    source: { cloudflareId: '33a4063ee0e8dafe3379f0a97817036e' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-hero-2',
    creatorId: 'cv-hero-2',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 2.',
    placement: 'hero',
    poster: '/portfolio/ugc-hero-2.webp',
    source: { cloudflareId: '63446474698139b4ac17c1f053212242' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-hero-3',
    creatorId: 'cv-hero-3',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 3.',
    placement: 'hero',
    poster: '/portfolio/ugc-hero-3.webp',
    source: { cloudflareId: '1fc1374cdfe428d10bfc40ad4eff9693' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-1',
    creatorId: 'cv-gal-1',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 1.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-1.webp',
    source: { cloudflareId: 'c8914f7a0db3ac9f5ffd0721115dbe20' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-8',
    creatorId: 'cv-gal-8',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 8.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-8.webp',
    source: { cloudflareId: 'b73842a409de5f4f6ae9d72733ea1152' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-4',
    creatorId: 'cv-gal-4',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 4.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-4.webp',
    source: { cloudflareId: '79b1cd5d22e9f13587ab547e438e29ef' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-3',
    creatorId: 'cv-gal-3',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 3.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-3.webp',
    source: { cloudflareId: '1188b4341860779830fa7365b1442959' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-5',
    creatorId: 'cv-gal-5',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 5.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-5.webp',
    source: { cloudflareId: '3a41e0f797a707576ff9af9fb9fb6a81' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-7',
    creatorId: 'cv-gal-7',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 7.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-7.webp',
    source: { cloudflareId: '749e2ad503f5db79d69086a47c59edd0' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-2',
    creatorId: 'cv-gal-2',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 2.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-2.webp',
    source: { cloudflareId: 'ff256a4643515d29b61c1f210c06476d' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-6',
    creatorId: 'cv-gal-6',
    category: 'UGC · Paid social',
    industry: 'other',
    languages: ['en'],
    caption: 'UGC ad example 6.',
    placement: 'gallery',
    poster: '/portfolio/ugc-gal-6.webp',
    source: { cloudflareId: '8b15247d9a422614898b8bbb54591025' },
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
]

/* Labels for filter chips and cards. Unknown codes or slugs still work (they fall back to the code / a title-cased slug). */
export const LANGUAGE_LABELS = {
  en: 'English', es: 'Spanish', fr: 'French', ar: 'Arabic', de: 'German', it: 'Italian', pt: 'Portuguese', nl: 'Dutch',
  tr: 'Turkish', ru: 'Russian', pl: 'Polish', hi: 'Hindi', ur: 'Urdu', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
  he: 'Hebrew', sv: 'Swedish', da: 'Danish', fi: 'Finnish', el: 'Greek', ro: 'Romanian', cs: 'Czech', id: 'Indonesian',
}

export const INDUSTRY_LABELS = {
  saas: 'SaaS', ecommerce: 'E-commerce', app: 'Apps', technology: 'Technology', consumer: 'Consumer products',
  beauty: 'Beauty', health: 'Health & wellness', fashion: 'Fashion', food: 'Food & drink', finance: 'Finance',
  education: 'Education', travel: 'Travel', home: 'Home & lifestyle', services: 'Services',
}

const titleCase = (slug) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
export const languageLabel = (code) => LANGUAGE_LABELS[code] ?? code.toUpperCase()
export const industryLabel = (slug) => INDUSTRY_LABELS[slug] ?? titleCase(slug)

/* Problems with one entry (empty array = valid). Used by the tests and by isDisplayable. */
export function portfolioProblems(item) {
  const p = []
  const a = item?.approval
  if (!item || typeof item !== 'object') return ['not an object']
  if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id ?? '')) p.push('id must be lowercase letters, digits and hyphens')
  if (!item.creatorId || typeof item.creatorId !== 'string') p.push('creatorId is required')
  if (!item.caption || typeof item.caption !== 'string') p.push('caption is required')
  if (!item.industry || !/^[a-z][a-z0-9-]*$/.test(item.industry)) p.push('industry must be a lowercase slug')
  if (!Array.isArray(item.languages) || item.languages.length === 0 || !item.languages.every((l) => /^[a-z]{2}$/.test(l))) p.push('languages must be a non-empty list of 2-letter ISO 639-1 codes')
  const hasCf = Boolean(item.source?.cloudflareId)
  const hasMp4 = Boolean(item.source?.mp4)
  if (hasCf === hasMp4) p.push('source needs exactly one of cloudflareId or mp4')
  if (item.placement !== undefined && item.placement !== 'hero' && item.placement !== 'gallery') p.push("placement must be 'hero' or 'gallery'")
  if (hasMp4 && !item.poster) p.push('an mp4 source needs a poster image')
  if (!a || typeof a !== 'object') p.push('approval is required')
  return p
}

/* The ONE gate between data and the public page. */
export function isDisplayable(item) {
  if (portfolioProblems(item).length) return false
  const a = item.approval
  return a.status === 'approved' && a.portfolioUse === true && a.creatorConsent === true
}

export const selectDisplayable = (items = UGC_PORTFOLIO) => items.filter(isDisplayable)

/* Where an approved video appears: the hero stage (placement 'hero') or the gallery below it (everything else). */
export const selectHero = (items = UGC_PORTFOLIO) => selectDisplayable(items).filter((i) => i.placement === 'hero')
export const selectGallery = (items = UGC_PORTFOLIO) => selectDisplayable(items).filter((i) => i.placement !== 'hero')

/* Name shown on a card: only with explicit permission. */
export const creatorLabel = (item) => (item.creator?.showName === true && item.creator?.displayName ? item.creator.displayName : null)

export const posterUrl = (item) => item.poster ?? `https://videodelivery.net/${item.source.cloudflareId}/thumbnails/thumbnail.jpg?time=0s&height=720`
export const hlsUrl = (item) => `https://videodelivery.net/${item.source.cloudflareId}/manifest/video.m3u8`

/* Category toggles: SaaS, E-commerce, Apps and Other. Only categories that have at least one approved video are ever offered. */
export const CATEGORY_LABELS = { saas: 'SaaS', ecommerce: 'E-commerce', app: 'Apps', other: 'Other' }
const CATEGORY_ORDER = ['saas', 'ecommerce', 'app', 'other']
const CATEGORY_OF_INDUSTRY = { saas: 'saas', ecommerce: 'ecommerce', app: 'app', technology: 'app' }
export const categoryOf = (item) => CATEGORY_OF_INDUSTRY[item.industry] ?? 'other'

/* Filter facets. A facet is offered only when it has two or more distinct values (a single value is nothing to filter by). */
export function buildFacets(items) {
  const count = (values) => values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map())
  const langs = count(items.flatMap((i) => i.languages))
  const cats = count(items.map(categoryOf))
  const languageList = [...langs.entries()].map(([value, n]) => ({ value, label: languageLabel(value), count: n })).sort((a, b) => a.label.localeCompare(b.label))
  const categoryList = CATEGORY_ORDER.filter((c) => cats.has(c)).map((value) => ({ value, label: CATEGORY_LABELS[value], count: cats.get(value) }))
  return {
    language: langs.size >= 2 ? languageList : [],
    category: cats.size >= 2 ? categoryList : [],
  }
}

export const matchesFilters = (item, { language = null, category = null } = {}) =>
  (!language || item.languages.includes(language)) && (!category || categoryOf(item) === category)
