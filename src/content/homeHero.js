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
    industry: 'other',
    languages: ['en'],
    caption: 'CONVRT UGC ad example.',
    poster: '/portfolio/home-hero.webp',
    source: { cloudflareId: '20c642c760e1937953fc33e98f3d859f' },
    approval,
  },
  {
    id: 'home-hero-ugc-1',
    creatorId: 'cv-hero-1',
    industry: 'other',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 1.',
    poster: '/portfolio/ugc-hero-1.webp',
    source: { cloudflareId: '33a4063ee0e8dafe3379f0a97817036e' },
    approval,
  },
  {
    id: 'home-hero-ugc-2',
    creatorId: 'cv-hero-2',
    industry: 'other',
    languages: ['en'],
    caption: 'Creator-led UGC ad example 2.',
    poster: '/portfolio/ugc-hero-2.webp',
    source: { cloudflareId: '63446474698139b4ac17c1f053212242' },
    approval,
  },
]
