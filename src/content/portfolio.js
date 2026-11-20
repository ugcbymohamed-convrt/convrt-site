/* THE PORTFOLIO. This is the ONE file every video on the site comes from.

   Three pages read it, each through its own selector (see "WHERE A VIDEO APPEARS" below), so a video is added here once:

     /creator-showcase           the Creator Showcase: every approved video, filterable by industry (E-commerce, SaaS, Services, Other)   selectOurWork()
     /ugc-video-agency   the approved UGC videos: the three-phone hero stage + the gallery under it          selectHero() / selectGallery()
     /spokesperson-video-production   the approved SPOKESPERSON videos, same two slots                       selectSpokespersonHero() / selectSpokespersonGallery()
     homepage showcase   the client panels (Adscale, Elyon, Graspo): the videos tagged with that client        selectShowcase('elyon')

   HOW TO ADD A VIDEO (no code changes needed): add an object at the TOP of PORTFOLIO below (newest first: /creator-showcase and the UGC gallery
   keep this order).

     {
       id: 'saas-onboarding-demo-en',          // unique, lowercase letters, digits and hyphens
       title: 'Short title shown on the card', // optional. Falls back to caption. Keep it short: it is the headline of the card.
       caption: 'One honest sentence describing the video.',   // required. Also the accessible name.
       type: 'ugc',                            // ugc | spokesperson | demo | testimonial | interview | social | ad  (see TYPE_LABELS). Default 'ugc'.
                                               // type decides which SERVICE page may show the video: 'ugc' only on the UGC page, 'spokesperson' only on the
                                               // Spokesperson page. A video is never shown on a service page because someone speaks on camera in it.
       industry: 'saas',                       // saas | ecommerce | services | other | 'unclassified'. This is what files the video under a tab. Only a
                                               // CONFIRMED industry goes here; while it is unknown use 'unclassified' (or omit it): such a video is in All Work
                                               // but under no tab, and never under Other. 'other' means "confirmed: none of the above". Any other slug
                                               // (beauty, finance ...) is a confirmed industry that groups under the Other tab and shows its own name on the card.
       languages: ['en'],                      // ISO 639-1 codes of the spoken language(s). Optional: leave it out until confirmed (no badge is shown).
       production: 'independent',              // optional, and unknown unless confirmed: 'independent' = a creator's own example, supplied to show their
                                               // capabilities (CONVRT did not necessarily produce it) | 'convrt' = produced through CONVRT. Leave it out when unknown.
                                               // The Creator Showcase never calls a video CONVRT's work unless this is 'convrt'.
       source: { cloudflareId: '…' },          // Cloudflare Stream id (HLS)…  or  { mp4: '/videos/….mp4' } (an mp4 needs a poster)
       poster: '/portfolio/….webp',            // optional for Cloudflare (the 0 s frame is used); recommended: 540×960 webp of the best frame
       creatorId: 'c017',                      // required, opaque internal identifier. Never displayed.
       brand: 'Brand name',                    // optional. Shown ONLY when approval.brandDisplay === true (the brand's permission).
       productionCredit: 'Credit line',        // optional. Shown ONLY when approval.creditDisplay === true. Never invent one.
       creator: { displayName: 'First name', showName: true },   // optional. The name is shown ONLY when showName is true.
       category: 'UGC · Paid social',          // optional free label (the UGC hero stage uses it)
       placement: 'gallery',                   // UGC and Spokesperson pages: 'hero' = the three-phone stage (first hero item = the large centre phone, at most 3),
                                               // 'gallery' (default) = the horizontal gallery under it (at most 10)
       showcase: 'elyon',                      // homepage only: tag a video with a client panel ('adscale' | 'elyon' | 'graspo') to show it there
       caseStudyHref: '/case-studies/…',       // optional related case study
       uploadDate: '2026-11-20',               // optional, but REQUIRED for structured data: only videos with a real upload date get VideoObject markup
       description: 'A fuller description.',   // optional, used by VideoObject markup (falls back to caption)
       approval: {
         status: 'approved',                   // anything else keeps the video off the site
         portfolioUse: true,                   // the brand/owner approved this video for CONVRT's website portfolio
         creatorConsent: true,                 // the creator agreed to portfolio display
         brandDisplay: true,                   // optional: the brand agreed to being named next to the video
         creditDisplay: true,                  // optional: the production credit may be shown
         approvedBy: 'Name of the CONVRT owner who confirmed it',
         approvedOn: '2026-11-20',
       },
     }

   WHERE A VIDEO APPEARS
   • /creator-showcase and the UGC page need the FULL approval: status 'approved' AND portfolioUse === true AND creatorConsent === true.
     Approval to produce or deliver a video is NOT portfolio permission.
   • /creator-showcase shows every approved video. /ugc-video-agency shows the approved videos whose type is 'ugc'; /spokesperson-video-production shows
     the approved videos whose type is 'spokesperson'. Nothing else to do. The two service pages never share a video.
   • A homepage client panel shows the videos tagged with its `showcase` key whose status is 'approved' (the client case studies are
     brand-approved, not creator-portfolio material). A video with portfolioUse false therefore stays OFF /creator-showcase and the UGC page.
   • A new video classified by industry reaches /creator-showcase and (if it is UGC) the UGC page on its own. The homepage panels are per
     client, each with its own story, so a video appears there only when you add its `showcase` tag.

   RULES
   • No placeholder, stock or unapproved material, ever. An empty list is a valid, fully working state on every page.
   • A creator's name is personal data: it is shown only when creator.showName is true. creatorId is never shown.
   • A category with no approved video never appears as a tab on /creator-showcase.
   • tests/ugc-page.test.mjs and tests/creator-showcase.test.mjs validate every entry (unique ids, valid codes, source, permission flags). */

export const PORTFOLIO = [
  /* Spokesperson page videos (/spokesperson-video-production). Supplied by the owner on 2026-11-19 (Desktop > UGC PAGE VIDEOS > Spokesperson videos: HERO1-3,
     SECTION, SECTION2-4); the owner titled the three hero files. type 'spokesperson' is the ONLY thing that sends a video to that page. Captions are neutral
     placeholders, languages are assumed from the on-screen captions and the industry is 'unclassified' until the owner confirms it (no production attribution either). No brand is named. */
  {
    id: 'spokesperson-hero-1',
    title: 'Spokesperson video example 1',
    caption: 'Spokesperson video example 1.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'b3db228064bde5cd076d22d9c938c2b0' },
    poster: '/portfolio/spokesperson-hero-1.webp',
    creatorId: 'cv-spokesperson-hero-1',
    category: 'Spokesperson · Presenter-led video',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'spokesperson-hero-2',
    title: 'Spokesperson video example 2',
    caption: 'Spokesperson video example 2.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'c0c30e58489efad67789cdba1b58df23' },
    poster: '/portfolio/spokesperson-hero-2.webp',
    creatorId: 'cv-spokesperson-hero-2',
    category: 'Spokesperson · Presenter-led video',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'spokesperson-hero-3',
    title: 'Spokesperson video example 3',
    caption: 'Spokesperson video example 3.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '0d3a810ee068bd311f13ffd4d7a7f3d6' },
    poster: '/portfolio/spokesperson-hero-3.webp',
    creatorId: 'cv-spokesperson-hero-3',
    category: 'Spokesperson · Presenter-led video',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'spokesperson-gal-1',
    title: 'Spokesperson video example 4',
    caption: 'Spokesperson video example 4.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'e767742bb12024437e9df368cedbfba2' },
    poster: '/portfolio/spokesperson-gal-1.webp',
    creatorId: 'cv-spokesperson-gal-1',
    category: 'Spokesperson · Presenter-led video',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'spokesperson-gal-2',
    title: 'Spokesperson video example 5',
    caption: 'Spokesperson video example 5.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'adbf89cb6c07bb06e708c2a03e4cf2f6' },
    poster: '/portfolio/spokesperson-gal-2.webp',
    creatorId: 'cv-spokesperson-gal-2',
    category: 'Spokesperson · Presenter-led video',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'spokesperson-gal-3',
    title: 'Spokesperson video example 6',
    caption: 'Spokesperson video example 6.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '250a9cb5f26c74728d775086879251d1' },
    poster: '/portfolio/spokesperson-gal-3.webp',
    creatorId: 'cv-spokesperson-gal-3',
    category: 'Spokesperson · Presenter-led video',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'spokesperson-gal-4',
    title: 'Spokesperson video example 7',
    caption: 'Spokesperson video example 7.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'a71733d42f59d1cec7034c1daa0258ea' },
    poster: '/portfolio/spokesperson-gal-4.webp',
    creatorId: 'cv-spokesperson-gal-4',
    category: 'Spokesperson · Presenter-led video',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  /* DISPLAY ORDER of the portfolio videos (also the order of the UGC gallery). It is deliberately mixed so that the same creator never appears
     twice in a row, in All Work or in any industry tab. When you add videos, interleave them rather than appending a run from one creator.
     The 18 "creator-NN" videos come from the Creator Showcase folder: industry = the folder each file was in (E-commerce, Service, SaaS); titles are
     placeholders, languages and production attribution are unconfirmed, and no brand or credit is shown. */
  {
    id: 'creator-17',
    title: 'UGC ad example 25',
    caption: 'UGC ad example 25.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: '1861992017574fb69bdf5c4db91e56d2' },
    poster: '/portfolio/creator-17.webp',
    creatorId: 'cv-creator-17',
    category: 'UGC · Paid social',
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
    title: 'UGC ad example 5',
    caption: 'UGC ad example 5.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '3a41e0f797a707576ff9af9fb9fb6a81' },
    poster: '/portfolio/ugc-gal-5.webp',
    creatorId: 'cv-gal-5',
    category: 'UGC · Paid social',
    placement: 'gallery',
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
    title: 'UGC ad example 7',
    caption: 'UGC ad example 7.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: '749e2ad503f5db79d69086a47c59edd0' },
    poster: '/portfolio/ugc-gal-7.webp',
    creatorId: 'cv-gal-7',
    category: 'UGC · Paid social',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-07',
    title: 'UGC ad example 15',
    caption: 'UGC ad example 15.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: '32c0e72d46cf8b146efa949fb17a198c' },
    poster: '/portfolio/creator-07.webp',
    creatorId: 'cv-creator-07',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-01',
    title: 'UGC ad example 9',
    caption: 'UGC ad example 9.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: 'ffad7162bfb022a28724989d06618786' },
    poster: '/portfolio/creator-01.webp',
    creatorId: 'cv-creator-01',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-04',
    title: 'UGC ad example 12',
    caption: 'UGC ad example 12.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: 'cd6654c2daf9e65bb1a1db2588a86f44' },
    poster: '/portfolio/creator-04.webp',
    creatorId: 'cv-creator-04',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-13',
    title: 'UGC ad example 21',
    caption: 'UGC ad example 21.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: '8e51ea0f1a74d31a7eae3dd3eaf8aafa' },
    poster: '/portfolio/creator-13.webp',
    creatorId: 'cv-creator-13',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-11',
    title: 'UGC ad example 19',
    caption: 'UGC ad example 19.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: 'fc89d8e3119f2480e3bfaf1e19e20326' },
    poster: '/portfolio/creator-11.webp',
    creatorId: 'cv-creator-11',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-08',
    title: 'UGC ad example 16',
    caption: 'UGC ad example 16.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: 'f1e725634fe6bd8b059048a33612658d' },
    poster: '/portfolio/creator-08.webp',
    creatorId: 'cv-creator-08',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-14',
    title: 'UGC ad example 22',
    caption: 'UGC ad example 22.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: '2b65a14aa3b9eef2fd3459017d31ef5b' },
    poster: '/portfolio/creator-14.webp',
    creatorId: 'cv-creator-14',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-15',
    title: 'UGC ad example 23',
    caption: 'UGC ad example 23.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: '0d98f3a55ebd26c9b400e348d02972d9' },
    poster: '/portfolio/creator-15.webp',
    creatorId: 'cv-creator-15',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-10',
    title: 'UGC ad example 18',
    caption: 'UGC ad example 18.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: '93584825751798b27840b85a2ad43a6a' },
    poster: '/portfolio/creator-10.webp',
    creatorId: 'cv-creator-10',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-hero-1',
    title: 'Creator-led UGC ad example 1',
    caption: 'Creator-led UGC ad example 1.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '33a4063ee0e8dafe3379f0a97817036e' },
    poster: '/portfolio/ugc-hero-1.webp',
    creatorId: 'cv-hero-1',
    category: 'UGC · Paid social',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-05',
    title: 'UGC ad example 13',
    caption: 'UGC ad example 13.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: '3058e60f87200babb0b6c60606923e1b' },
    poster: '/portfolio/creator-05.webp',
    creatorId: 'cv-creator-05',
    category: 'UGC · Paid social',
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
    title: 'UGC ad example 1',
    caption: 'UGC ad example 1.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: 'c8914f7a0db3ac9f5ffd0721115dbe20' },
    poster: '/portfolio/ugc-gal-1.webp',
    creatorId: 'cv-gal-1',
    category: 'UGC · Paid social',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-06',
    title: 'UGC ad example 14',
    caption: 'UGC ad example 14.',
    type: 'ugc',
    industry: 'ecommerce',
    source: { cloudflareId: '8d8051df7b4e99d1fed68fc3dea44f4d' },
    poster: '/portfolio/creator-06.webp',
    creatorId: 'cv-creator-06',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-09',
    title: 'UGC ad example 17',
    caption: 'UGC ad example 17.',
    type: 'ugc',
    industry: 'ecommerce',
    source: { cloudflareId: '424622b3fffd8a0a2a20ad6bf274a0db' },
    poster: '/portfolio/creator-09.webp',
    creatorId: 'cv-creator-09',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-16',
    title: 'UGC ad example 24',
    caption: 'UGC ad example 24.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: '6e56f6abcb371853fe557c52a7eb494a' },
    poster: '/portfolio/creator-16.webp',
    creatorId: 'cv-creator-16',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-18',
    title: 'UGC ad example 26',
    caption: 'UGC ad example 26.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: 'e749f28f503510a435fb4ba8a0a5fa56' },
    poster: '/portfolio/creator-18.webp',
    creatorId: 'cv-creator-18',
    category: 'UGC · Paid social',
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
    title: 'UGC ad example 4',
    caption: 'UGC ad example 4.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '79b1cd5d22e9f13587ab547e438e29ef' },
    poster: '/portfolio/ugc-gal-4.webp',
    creatorId: 'cv-gal-4',
    category: 'UGC · Paid social',
    placement: 'gallery',
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
    title: 'UGC ad example 3',
    caption: 'UGC ad example 3.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: '1188b4341860779830fa7365b1442959' },
    poster: '/portfolio/ugc-gal-3.webp',
    creatorId: 'cv-gal-3',
    category: 'UGC · Paid social',
    placement: 'gallery',
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
    title: 'Creator-led UGC ad example 2',
    caption: 'Creator-led UGC ad example 2.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '63446474698139b4ac17c1f053212242' },
    poster: '/portfolio/ugc-hero-2.webp',
    creatorId: 'cv-hero-2',
    category: 'UGC · Paid social',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-02',
    title: 'UGC ad example 10',
    caption: 'UGC ad example 10.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: '9bbc90204d84630436a29bdd9ef3be17' },
    poster: '/portfolio/creator-02.webp',
    creatorId: 'cv-creator-02',
    category: 'UGC · Paid social',
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
    title: 'UGC ad example 8',
    caption: 'UGC ad example 8.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: 'b73842a409de5f4f6ae9d72733ea1152' },
    poster: '/portfolio/ugc-gal-8.webp',
    creatorId: 'cv-gal-8',
    category: 'UGC · Paid social',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-03',
    title: 'UGC ad example 11',
    caption: 'UGC ad example 11.',
    type: 'ugc',
    industry: 'ecommerce',
    source: { cloudflareId: '4769852f1d5efc10c64502f8a2a679e1' },
    poster: '/portfolio/creator-03.webp',
    creatorId: 'cv-creator-03',
    category: 'UGC · Paid social',
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
    title: 'UGC ad example 6',
    caption: 'UGC ad example 6.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: '8b15247d9a422614898b8bbb54591025' },
    poster: '/portfolio/ugc-gal-6.webp',
    creatorId: 'cv-gal-6',
    category: 'UGC · Paid social',
    placement: 'gallery',
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
    title: 'UGC ad example 2',
    caption: 'UGC ad example 2.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'ff256a4643515d29b61c1f210c06476d' },
    poster: '/portfolio/ugc-gal-2.webp',
    creatorId: 'cv-gal-2',
    category: 'UGC · Paid social',
    placement: 'gallery',
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
    title: 'Creator-led UGC ad example 3',
    caption: 'Creator-led UGC ad example 3.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: '1fc1374cdfe428d10bfc40ad4eff9693' },
    poster: '/portfolio/ugc-hero-3.webp',
    creatorId: 'cv-hero-3',
    category: 'UGC · Paid social',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'creator-12',
    title: 'UGC ad example 20',
    caption: 'UGC ad example 20.',
    type: 'ugc',
    industry: 'ecommerce',
    source: { cloudflareId: '5fc046452d354eba0cff717239c4bee8' },
    poster: '/portfolio/creator-12.webp',
    creatorId: 'cv-creator-12',
    category: 'UGC · Paid social',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },

  /* Homepage client panels. These videos were live in the homepage case-study showcase before this file existed, so they are recorded here
     with the same media. The owner decided they are NOT creator-portfolio material, so portfolioUse / creatorConsent are false: they stay
     off /creator-showcase and the UGC page. To list one on /creator-showcase, confirm the brand's and the creator's permission and set both flags to true
     (then fill in its languages and a real title). creatorId below is an internal placeholder; type and production are unconfirmed. Industry is the one on the homepage tab (Adscale SaaS, Elyon E-commerce); Graspo's is unconfirmed. */
  {
    id: 'showcase-adscale-1',
    caption: 'Adscale creative 1.',
    industry: 'saas',
    source: { cloudflareId: '8d4dbbeabac272bddb23068c91037af8' },
    creatorId: 'cs-adscale-1',
    brand: 'Adscale',
    showcase: 'adscale',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-adscale-2',
    caption: 'Adscale creative 2.',
    industry: 'saas',
    source: { cloudflareId: '08abef50c734085f25f345cdde4b1e33' },
    poster: '/showcase/adscale-agentic-poster.webp',
    creatorId: 'cs-adscale-2',
    brand: 'Adscale',
    showcase: 'adscale',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-adscale-3',
    caption: 'Adscale creative 3.',
    industry: 'saas',
    source: { mp4: '/showcase/adscale-creator.mp4' },
    poster: '/showcase/adscale-creator-poster.webp',
    creatorId: 'cs-adscale-3',
    brand: 'Adscale',
    showcase: 'adscale',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-elyon-1',
    caption: 'Elyon Dubai creative 1.',
    industry: 'ecommerce',
    source: { cloudflareId: 'fa02007b36fae2b3bb68c97cdd00e9fc' },
    creatorId: 'cs-elyon-1',
    brand: 'Elyon Dubai',
    showcase: 'elyon',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-elyon-2',
    caption: 'Elyon Dubai creative 2.',
    industry: 'ecommerce',
    source: { cloudflareId: '0905b814e2ba3950197b5bfe1cefae38' },
    creatorId: 'cs-elyon-2',
    brand: 'Elyon Dubai',
    showcase: 'elyon',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-elyon-3',
    caption: 'Elyon Dubai creative 3.',
    industry: 'ecommerce',
    source: { cloudflareId: '9e6cb8438c9b0c1ab8b55953718eddde' },
    creatorId: 'cs-elyon-3',
    brand: 'Elyon Dubai',
    showcase: 'elyon',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-graspo-1',
    caption: 'Graspo creative 1.',
    industry: 'unclassified',
    source: { cloudflareId: '15dd5505109f6821ccdcb13fc3cdc1fd' },
    creatorId: 'cs-graspo-1',
    brand: 'Graspo',
    showcase: 'graspo',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-graspo-2',
    caption: 'Graspo creative 2.',
    industry: 'unclassified',
    source: { cloudflareId: '3616606e3ca6d1a85c8a57d7cc2f656f' },
    creatorId: 'cs-graspo-2',
    brand: 'Graspo',
    showcase: 'graspo',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
  {
    id: 'showcase-graspo-3',
    caption: 'Graspo creative 3.',
    industry: 'unclassified',
    source: { cloudflareId: 'c1379ace38f2fa19ef2a45de1bb5d4b1' },
    creatorId: 'cs-graspo-3',
    brand: 'Graspo',
    showcase: 'graspo',
    approval: {
      status: 'approved',
      portfolioUse: false,
      creatorConsent: false,
      approvedBy: 'Already live in the homepage case-study showcase (existing)',
    },
  },
]

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   LABELS. Unknown codes or slugs still work (they fall back to the code / a title-cased slug).
   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
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

/* What kind of video it is. Only videos explicitly typed 'ugc' reach the UGC page (an unset type is unknown, not UGC). */
export const TYPE_LABELS = {
  ugc: 'UGC', spokesperson: 'Spokesperson', demo: 'Product demo', testimonial: 'Testimonial', interview: 'Street interview',
  social: 'Organic social', ad: 'Ad creative',
}

const titleCase = (slug) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
export const languageLabel = (code) => LANGUAGE_LABELS[code] ?? code.toUpperCase()

/* An industry that has not been confirmed. It is internal: it is never shown as a label and never becomes a tab. */
export const UNCLASSIFIED = 'unclassified'
export const isClassified = (item) => Boolean(item.industry) && item.industry !== UNCLASSIFIED
/* '' for an unconfirmed industry, so nothing is displayed (callers drop empty labels). */
export const industryLabel = (slug) => (!slug || slug === UNCLASSIFIED ? '' : INDUSTRY_LABELS[slug] ?? titleCase(slug))
export const typeOf = (item) => item.type
export const typeLabel = (item) => (item.type ? TYPE_LABELS[item.type] ?? titleCase(item.type) : '')
export const titleOf = (item) => item.title ?? item.caption

/* PRODUCTION ATTRIBUTION. 'independent' = a creator's own example; 'convrt' = produced through CONVRT; unset = unknown (nothing is claimed). */
export const PRODUCTION_LABELS = { independent: 'Independent creator', convrt: 'Produced by CONVRT' }
export const productionLabel = (item) => PRODUCTION_LABELS[item.production] ?? ''
export const isConvrtProduction = (item) => item.production === 'convrt'

/* Brand name and credit line: shown only with the explicit permission recorded in the approval. */
export const brandLabel = (item) => (item.brand && item.approval?.brandDisplay === true ? item.brand : null)
export const creditLabel = (item) => (item.productionCredit && item.approval?.creditDisplay === true ? item.productionCredit : null)

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   VALIDATION AND THE PERMISSION GATES
   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
/* Problems with one entry (empty array = valid). Used by the tests and by every gate below. */
export function portfolioProblems(item) {
  const p = []
  const a = item?.approval
  if (!item || typeof item !== 'object') return ['not an object']
  if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id ?? '')) p.push('id must be lowercase letters, digits and hyphens')
  if (!item.creatorId || typeof item.creatorId !== 'string') p.push('creatorId is required')
  if (!item.caption || typeof item.caption !== 'string') p.push('caption is required')
  if (item.title !== undefined && (typeof item.title !== 'string' || !item.title.trim())) p.push('title must be a non-empty string')
  if (item.type !== undefined && !/^[a-z][a-z0-9-]*$/.test(item.type)) p.push('type must be a lowercase slug')
  if (item.industry !== undefined && !/^[a-z][a-z0-9-]*$/.test(item.industry)) p.push("industry must be a lowercase slug (or 'unclassified')")
  if (item.production !== undefined && !(item.production in PRODUCTION_LABELS)) p.push("production must be 'independent' or 'convrt' (leave it out when unknown)")
  if (item.productionCredit !== undefined && (typeof item.productionCredit !== 'string' || !item.productionCredit.trim())) p.push('productionCredit must be a non-empty string')
  const langsOk = Array.isArray(item.languages) && item.languages.length > 0 && item.languages.every((l) => /^[a-z]{2}$/.test(l))
  if (item.languages !== undefined && !langsOk) p.push('languages must be a non-empty list of 2-letter ISO 639-1 codes')
  const hasCf = Boolean(item.source?.cloudflareId)
  const hasMp4 = Boolean(item.source?.mp4)
  if (hasCf === hasMp4) p.push('source needs exactly one of cloudflareId or mp4')
  if (item.placement !== undefined && item.placement !== 'hero' && item.placement !== 'gallery') p.push("placement must be 'hero' or 'gallery'")
  if (item.showcase !== undefined && !/^[a-z][a-z0-9-]*$/.test(item.showcase)) p.push('showcase must be a lowercase slug')
  if (item.uploadDate !== undefined && !/^\d{4}-\d{2}-\d{2}(T[\d:.+Z-]+)?$/.test(item.uploadDate)) p.push('uploadDate must be an ISO date (YYYY-MM-DD)')
  if (hasMp4 && !item.poster) p.push('an mp4 source needs a poster image')
  if (!a || typeof a !== 'object') p.push('approval is required')
  return p
}

/* THE gate between data and /creator-showcase and the UGC page: full approval, portfolio permission AND creator consent. */
export function isDisplayable(item) {
  if (portfolioProblems(item).length) return false
  const a = item.approval
  return a.status === 'approved' && a.portfolioUse === true && a.creatorConsent === true
}

/* The gate for a homepage client panel: a valid, approved video tagged with that client. It does NOT imply portfolio permission. */
export const isShowcaseable = (item) => portfolioProblems(item).length === 0 && item.approval.status === 'approved' && Boolean(item.showcase)

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   SELECTORS: one per page. Order is the order of PORTFOLIO.
   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export const selectDisplayable = (items = PORTFOLIO) => items.filter(isDisplayable)

/* /creator-showcase: everything approved for the portfolio. */
export const selectOurWork = selectDisplayable

/* /ugc-video-agency: approved UGC videos, split into the hero stage (placement 'hero') and the gallery under it (everything else). */
const selectUgc = (items) => selectDisplayable(items).filter((i) => i.type === 'ugc')
export const selectHero = (items = PORTFOLIO) => selectUgc(items).filter((i) => i.placement === 'hero')
export const selectGallery = (items = PORTFOLIO) => selectUgc(items).filter((i) => i.placement !== 'hero')

/* /spokesperson-video-production: approved videos whose type is explicitly 'spokesperson', split the same way (hero stage / gallery). A UGC video can never
   appear here and a spokesperson video can never appear on the UGC page: the type is the only switch, and there is no fallback to the other list. */
const selectSpokesperson = (items) => selectDisplayable(items).filter((i) => typeOf(i) === 'spokesperson')
export const selectSpokespersonHero = (items = PORTFOLIO) => selectSpokesperson(items).filter((i) => i.placement === 'hero')
export const selectSpokespersonGallery = (items = PORTFOLIO) => selectSpokesperson(items).filter((i) => i.placement !== 'hero')

/* Homepage client panel `id` ('adscale' | 'elyon' | 'graspo'). */
export const selectShowcase = (id, items = PORTFOLIO) => items.filter((i) => isShowcaseable(i) && i.showcase === id)

/* Name shown on a card: only with explicit permission. */
export const creatorLabel = (item) => (item.creator?.showName === true && item.creator?.displayName ? item.creator.displayName : null)

export const posterUrl = (item) => item.poster ?? `https://videodelivery.net/${item.source.cloudflareId}/thumbnails/thumbnail.jpg?time=0s&height=720`
export const hlsUrl = (item) => `https://videodelivery.net/${item.source.cloudflareId}/manifest/video.m3u8`

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   CATEGORIES: the four industry groups of /creator-showcase (All Work is the combined view, not a category).
   Colours reuse the site's tokens where one fits (tailwind.config.js: lime, magenta, amber); SaaS and Services use the lighter
   violet / turquoise the brief proposed, because the darker violet token is too dim for small labels on the dark canvas.
   An industry slug not listed in CATEGORY_OF_INDUSTRY (beauty, finance ...) is a confirmed industry that groups under Other; the card still
   shows its specific name. An UNCLASSIFIED video (industry 'unclassified' or none) belongs to NO category: it is in All Work only, never Other.
   ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
export const ALL_CATEGORY = { id: 'all', label: 'All Work', color: '#d5ff40' }
export const CATEGORIES = [
  { id: 'ecommerce', label: 'E-commerce', color: '#ec4899' },
  { id: 'saas', label: 'SaaS', color: '#9a7aff' },
  { id: 'services', label: 'Services', color: '#34c9c0' },
  { id: 'other', label: 'Other', color: '#ffb547' },
]
export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))
const CATEGORY_ORDER = CATEGORIES.map((c) => c.id)
const CATEGORY_OF_INDUSTRY = { saas: 'saas', technology: 'saas', ecommerce: 'ecommerce', services: 'services' }
export const categoryOf = (item) => (isClassified(item) ? CATEGORY_OF_INDUSTRY[item.industry] ?? 'other' : null)

/* The tabs /creator-showcase offers: All Work, then each category that has at least one classified video (an empty category is hidden). */
export const availableCategories = (items) => {
  const present = new Set(items.map(categoryOf))
  return [ALL_CATEGORY, ...CATEGORIES.filter((c) => present.has(c.id))]
}
export const countIn = (items, categoryId) => (categoryId === 'all' ? items.length : items.filter((i) => categoryOf(i) === categoryId).length)
export const filterByCategory = (items, categoryId) => (categoryId === 'all' ? items : items.filter((i) => categoryOf(i) === categoryId))

/* Filter facets (the UGC portfolio grid). A facet is offered only when it has two or more distinct values. */
export function buildFacets(items) {
  const count = (values) => values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map())
  const langs = count(items.flatMap((i) => i.languages ?? []))
  const cats = count(items.map(categoryOf).filter(Boolean))
  const languageList = [...langs.entries()].map(([value, n]) => ({ value, label: languageLabel(value), count: n })).sort((a, b) => a.label.localeCompare(b.label))
  const categoryList = CATEGORY_ORDER.filter((c) => cats.has(c)).map((value) => ({ value, label: CATEGORY_LABELS[value], count: cats.get(value) }))
  return {
    language: langs.size >= 2 ? languageList : [],
    category: cats.size >= 2 ? categoryList : [],
  }
}

export const matchesFilters = (item, { language = null, category = null } = {}) =>
  (!language || (item.languages ?? []).includes(language)) && (!category || categoryOf(item) === category)
