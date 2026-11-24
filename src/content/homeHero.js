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

/* The Arabic homepage hero: three videos. THE CENTRE (FEATURED) PHONE is CONVRT_AD_GULF_ARABIC_FINAL.mp4, which the owner supplied on 2026-11-24 to replace the previous centre video (1080x1920, 61 s, H.264 + AAC;
   uploaded to Cloudflare Stream the same day as AR-HERO-GULF-FINAL; the original file is untouched on the owner's Desktop). The two side phones are the approved Arabic-speaking creator videos that were already there
   (the same Stream videos and posters as the Arabic UGC hero in src/content/portfolio.js). The replaced centre video (ar-c01) is still on the Arabic UGC page. Who presents the new video, who made it and whether the
   presenter has consented are NOT recorded, so no name, brand, production credit or date is stated; the caption describes only the footage. Spoken language is set from the Arabic on-screen captions (the opening
   frames also carry an English comment overlay). English keeps HOME_HERO unchanged. */
export const HOME_HERO_AR = [
  {
    id: 'home-hero-ar-main',
    creatorId: 'ar-hero-gulf-c',
    industry: 'unclassified',
    languages: ['ar'],
    caption: 'مقدّم يتحدث بالعربية أمام الكاميرا في أماكن مختلفة، مع عناوين مكتوبة على الشاشة.',
    poster: '/portfolio/ar-hero-gulf.webp',
    source: { cloudflareId: 'b9e0e42256dc09c9f554c6d4f21b4785' },
    approval: { ...approval, approvedBy: 'CONVRT owner (Arabic final revisions, 2026-11-24: supplied this video as the Arabic hero video)', approvedOn: '2026-11-24' },
  },
  {
    id: 'home-hero-ar-left',
    creatorId: 'ar-c02',
    industry: 'unclassified',
    languages: ['ar'],
    caption: 'صانعة محتوى تقدّم خدمة تعليمية أمام الكاميرا.',
    poster: '/portfolio/ar-ugc-hero-2.webp',
    source: { cloudflareId: 'e76683d744c46ecfe8e1fb53b273b926' },
    approval: { ...approval, approvedOn: '2026-11-23' },
  },
  {
    id: 'home-hero-ar-right',
    creatorId: 'ar-c03',
    industry: 'unclassified',
    languages: ['ar'],
    caption: 'صانع محتوى يعرض مزايا منتج برسوم توضيحية.',
    poster: '/portfolio/ar-ugc-hero-3.webp',
    source: { cloudflareId: '7f68e3f6c92e70395cad4876fcb389a8' },
    approval: { ...approval, approvedOn: '2026-11-23' },
  },
]
