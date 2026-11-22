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
    source: { cloudflareId: '5904f4189ee4726cb4d7e4272a8b915b' },
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
