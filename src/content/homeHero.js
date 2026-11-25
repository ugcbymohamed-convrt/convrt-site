/* The three videos in the homepage hero stage (the same CreatorVideoStage as the /ugc-video-agency hero).

   First item = the large centre phone, the other two sit behind it. Each item has the shape the stage reads (id, caption, languages,
   industry, source.cloudflareId, poster). Thumbnails are hand-picked frames with the creator in view (public/portfolio/*.webp).

   Kept in its own file so the homepage does not depend on the UGC page's portfolio data. Hero 1 and Hero 2 are the same two Cloudflare
   Stream videos as the first two phones of the UGC page hero; the centre video is the one the homepage has always shown. */

const approval = { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'CONVRT owner (confirmed in chat)', approvedOn: '2026-11-19' }

export const HOME_HERO = [
  {
    id: 'home-hero-main',
    creatorId: 'cv-home-hero',
    industry: 'unclassified',
    languages: ['en'],
    caption: 'CONVRT UGC ad example.',
    poster: '/portfolio/home-hero.webp',
    source: { cloudflareId: '20c642c760e1937953fc33e98f3d859f' },
    approval,
  },
  {
    id: 'home-hero-ugc-1',
    creatorId: 'cv-hero-1',
    industry: 'unclassified',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 1.',
    poster: '/portfolio/ugc-hero-1.webp',
    source: { cloudflareId: '33a4063ee0e8dafe3379f0a97817036e' },
    approval,
  },
  {
    id: 'home-hero-ugc-2',
    creatorId: 'cv-hero-2',
    industry: 'unclassified',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 2.',
    poster: '/portfolio/ugc-hero-2.webp',
    source: { cloudflareId: '63446474698139b4ac17c1f053212242' },
    approval,
  },
]

/* The Spanish homepage hero (owner folder ~/Desktop/SPANISH/Main Page, Front / Left / Right; owner confirmed in chat on 2026-11-22 that these are approved and consented).
   - Front (the large centre phone) is now the Spanish version of the CONVRT ad (see the entry below); it used to be the English ad, which the English homepage still shows.
   - Left and Right are byte-identical to the Spanish UGC videos es-ugc-2 and es-ugc-1 in src/content/portfolio.js (the same Stream videos, uploaded once), so they carry the same Spanish captions.
   English keeps HOME_HERO unchanged. */
export const HOME_HERO_ES = [
  /* Front (centre phone): the Spanish version of the CONVRT ad, ~/Downloads/CONVRT_AD_SPANISH_FINAL.mp4 (1080x1920, 52.8 s, Spanish speech and captions), uploaded to Cloudflare Stream on 2026-11-22
     at the owner's request ("replace the front hero main page video with this localized one"). It replaces the English ad that the Spanish homepage showed before (HOME_HERO[0], still the English homepage's). */
  {
    id: 'home-hero-es-main',
    creatorId: 'cv-home-hero',
    industry: 'unclassified',
    languages: ['es'],
    caption: 'CONVRT UGC ad example.',
    poster: '/portfolio/es-home-hero.webp',
    source: { cloudflareId: '2833c72764ffb5cc73f001565ca32954' },
    approval: { ...approval, approvedOn: '2026-11-22' },
  },
  {
    id: 'home-hero-es-left',
    creatorId: 'es-c01',
    industry: 'unclassified',
    languages: ['es'],
    caption: 'Vivienda con piscina: recorrido de una creadora.',
    poster: '/portfolio/es-ugc-2.webp',
    source: { cloudflareId: '3e6b7af68da8f3258c2d6f4893b142bd' },
    approval: { ...approval, approvedOn: '2026-11-22' },
  },
  {
    id: 'home-hero-es-right',
    creatorId: 'es-c02',
    industry: 'unclassified',
    languages: ['es'],
    caption: 'Café de especialidad: producto y creador a cámara.',
    poster: '/portfolio/es-ugc-1.webp',
    source: { cloudflareId: '04b0b9817dea7ad5f29e67d98499e8a4' },
    approval: { ...approval, approvedOn: '2026-11-22' },
  },
]

/* The Arabic homepage hero: three videos. THE CENTRE (FEATURED) PHONE is CONVRT_AD_GULF_ARABIC_FINAL.mp4, which the owner supplied on 2026-11-24 to replace the previous centre video (1080x1920, 61 s, H.264 + AAC;
   uploaded to Cloudflare Stream the same day as AR-HERO-GULF-FINAL; the original file is untouched on the owner's Desktop). The two side phones are the approved Arabic-speaking creator videos that were already there
   (the same Stream videos and posters as the Arabic UGC hero in src/content/portfolio.js). The replaced centre video (ar-c01) is still on the Arabic UGC page. Who presents the new video, who made it and whether the
   presenter has consented are NOT recorded, so no name, brand, production credit or date is stated; the caption describes only the footage. Spoken language is set from the Arabic on-screen captions (the opening
   frames also carry an English comment overlay). English keeps HOME_HERO unchanged. */
/* Order = the stage order: the centre phone, then the phone on the RIGHT of the screen, then the one on the LEFT (CreatorVideoStage). The owner (2026-11-25): chocolate on the left, the digital-service creator on the right. */
export const HOME_HERO_AR = [
  {
    id: 'home-hero-ar-main',
    creatorId: 'ar-hero-gulf-c',
    industry: 'unclassified',
    languages: ['ar'],
    caption: 'مقدّم يتحدث أمام الكاميرا في أماكن مختلفة، مع عناوين عربية مكتوبة على الشاشة.',
    poster: '/portfolio/ar-hero-gulf.webp',
    source: { cloudflareId: 'afdb58ebb92354534b513dabca0d64f5' },
    approval: { ...approval, approvedBy: 'CONVRT owner (2026-11-24: supplied ARABIC-with-Dubbed-Text.mp4 as the Arabic hero video)', approvedOn: '2026-11-24' },
  },
  {
    id: 'home-hero-ar-right',
    creatorId: 'ar-c01',
    industry: 'unclassified',
    languages: ['ar'],
    caption: 'صانع محتوى يشرح خدمة رقمية أمام الكاميرا.',
    poster: '/portfolio/ar-ugc-hero-1.webp',
    source: { cloudflareId: '442dfb5fe6a49dffd032ecd920414512' },
    approval: { ...approval, approvedBy: 'CONVRT owner (2026-11-25, Videos Placement folder: Home Page - Hero, right)', approvedOn: '2026-11-25' },
  },
  {
    id: 'home-hero-ar-left',
    creatorId: 'ar-c05',
    industry: 'unclassified',
    languages: ['ar'],
    caption: 'عرض منتجات شوكولاتة في الهواء الطلق.',
    poster: '/portfolio/ar-ugc-5.webp',
    source: { cloudflareId: '10c436de7f9b0c5bfbdee723aff56659' },
    approval: { ...approval, approvedBy: 'CONVRT owner (2026-11-25, Videos Placement folder: Home Page - Hero, left)', approvedOn: '2026-11-25' },
  },
]

/* The French homepage hero. Same structure as the English hero; only the language and the three videos differ (they are data here, never hard-coded in the layout: to swap one, change its entry).
   - FRONT (the large centre phone): the FRENCH-DUBBED version of the CONVRT advertisement, ~/Downloads/CONVRT_French_Premium_FR_V2.mp4 (1080x1920, 52.8 s), uploaded to Cloudflare Stream on 2026-11-23 at the owner's
     request. It replaces the earlier French centre video. The Comma video is NOT the hero: it lives in the French creator carousel and showcase.
   - LEFT phone: the roofing-company presentation (fr-ugc-1) and RIGHT phone: the food-supplement presentation (fr-ugc-hero-1) (the stage shows the array as [centre, right, left], so the supplement is listed first), the owner's placement of 2026-11-25 (replacing the temporary 2026-11-23 choices). The front stays the dubbed ad.
     Left and right are the same Stream videos as the French UGC page's hero phones (uploaded once). They are creators' own examples, not CONVRT productions; the page says so under the stage (CREATOR_EXAMPLES_NOTE).
   English and Spanish keep their own heroes. */
const frApproval = { ...approval, approvedOn: '2026-11-23' }
export const HOME_HERO_FR = [
  { id: 'home-hero-fr-main', creatorId: 'cv-home-hero', industry: 'unclassified', languages: ['fr'], caption: 'Publicité CONVRT, version française.', poster: '/portfolio/fr-home-hero.webp', source: { cloudflareId: 'ce7f495642b90a531e44f17b8e7454c5' }, approval: frApproval },
  { id: 'home-hero-fr-right', creatorId: 'fr-c01', industry: 'unclassified', languages: ['fr'], caption: 'Présentation d’un complément alimentaire.', poster: '/portfolio/fr-ugc-hero-1.webp', source: { cloudflareId: 'c1dd083d5550608a139f656670bd77a5' }, approval: frApproval },
  { id: 'home-hero-fr-left', creatorId: 'fr-c02', industry: 'unclassified', languages: ['fr'], caption: 'Présentation d’une entreprise de toiture.', poster: '/portfolio/fr-ugc-1.webp', source: { cloudflareId: '7c681c012def2539e7c32c99889d8662' }, approval: frApproval },
]
