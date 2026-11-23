/* THE PORTFOLIO. This is the ONE file every video on the site comes from.

   Three pages read it, each through its own selector (see "WHERE A VIDEO APPEARS" below), so a video is added here once:

     /creator-showcase           the Creator Showcase: every approved video, filterable by industry (E-commerce, SaaS, Services, Other)   selectOurWork()
     /ugc-video-agency   the approved UGC videos: the three-phone hero stage + the gallery under it          selectHero() / selectGallery()
     /spokesperson-video-production   the approved SPOKESPERSON videos, same two slots                       selectSpokespersonHero() / selectSpokespersonGallery()
     /social-media-video-production   the approved ORGANIC social videos, same two slots + a content-style filter selectOrganicHero() / selectOrganicGallery()
     homepage showcase   the client panels (Adscale, Elyon, Graspo): the videos tagged with that client        selectShowcase('elyon')

   HOW TO ADD A VIDEO (no code changes needed): add an object at the TOP of PORTFOLIO below (newest first: /creator-showcase and the UGC gallery
   keep this order).

     {
       id: 'saas-onboarding-demo-en',          // unique, lowercase letters, digits and hyphens
       title: 'Short title shown on the card', // optional. Falls back to caption. Keep it short: it is the headline of the card.
       caption: 'One honest sentence describing the video.',   // required. Also the accessible name.
       type: 'ugc',                            // ugc | spokesperson | organic | saas | demo | testimonial | interview | social | ad  (see TYPE_LABELS). Default 'ugc'.
                                               // type decides which SERVICE page may show the video: 'ugc' only on the UGC page, 'spokesperson' only on the
                                               // Spokesperson page, 'organic' only on the Organic Social page, 'saas' only on the SaaS page (plus anything listed in `alsoOn`). A video is never shown on a service page because
                                               // someone speaks on camera in it. ('social' is the homepage client showcase's type and never reaches a service page.)
       style: 'educational',                   // ORGANIC videos only, optional: educational | entertaining | product | founder (ORGANIC_STYLES). Drives the filter on the
                                               // Organic Social page. Set it ONLY once the owner has confirmed how the video should be classified.
       format: 'demo',                         // SaaS-page videos only, optional: explainer | demo | presenter | animated | ad (SAAS_FORMATS). Drives the optional filter on the
                                               // SaaS page. Set it ONLY once the owner has confirmed how the video should be classified.
       alsoOn: { saas: 'gallery' },            // optional: ALSO show this video on another service page ('ugc' | 'spokesperson' | 'organic' | 'saas'), with its placement there
                                               // ('hero' | 'gallery'). Only for a video the owner approved for that page, e.g. a presenter demonstrating software on both the
                                               // Spokesperson and SaaS pages. A video is never added to a service page because of what it shows.
       industry: 'saas',                       // saas | ecommerce | services | other | 'unclassified'. This is what files the video under a tab. Only a
                                               // CONFIRMED industry goes here; while it is unknown use 'unclassified' (or omit it): such a video is in All Work
                                               // but under no tab, and never under Other. 'other' means "confirmed: none of the above". Any other slug
                                               // (beauty, finance ...) is a confirmed industry that groups under the Other tab and shows its own name on the card.
       languages: ['en'],                      // ISO 639-1 codes of the spoken language(s). Optional: leave it out until confirmed (no badge is shown).
       onlyIn: ['es'],                         // optional: limit the video to a language site. A Spanish creator's video uses languages: ['es'] AND onlyIn: ['es'] so it shows on /es/ pages only
                                               // (the Spanish Showcase and the matching Spanish service galleries) and never changes an English page. See docs/multilingual-spanish-videos.md.
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
       homeCreator: 3,                         // optional, ENGLISH homepage only: this video is in the homepage's "Real creators" carousel, in this position (1 = first). Only an approved video
                                               // (full approval) whose spoken language is confirmed English is shown; nothing else is needed. See selectHomeCreators().
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
     the approved videos whose type is 'spokesperson'; /social-media-video-production shows the approved videos whose type is 'organic'; /saas-video-production shows
     the approved videos whose type is 'saas' plus any video that lists the page in `alsoOn`. Nothing else to do. The service pages never share a video unless an entry says so.
   • A homepage client panel shows the videos tagged with its `showcase` key whose status is 'approved' (the client case studies are
     brand-approved, not creator-portfolio material). A video with portfolioUse false therefore stays OFF /creator-showcase and the UGC page.
   • A new video classified by industry reaches /creator-showcase and (if it is UGC) the UGC page on its own. The homepage panels are per
     client, each with its own story, so a video appears there only when you add its `showcase` tag.

   RULES
   • No placeholder, stock or unapproved material, ever. An empty list is a valid, fully working state on every page.
   • A creator's name is personal data: it is shown only when creator.showName is true. creatorId is never shown.
   • A category with no approved video never appears as a tab on /creator-showcase.
   • tests/ugc-page.test.mjs and tests/creator-showcase.test.mjs validate every entry (unique ids, valid codes, source, permission flags). */

import { currentLocale } from '../i18n/locale.js'
import { DEFAULT_LOCALE } from '../i18n/locales.js'
import { streamPoster } from './posterFrames.js'
import { ES_LANGUAGE_LABELS, ES_INDUSTRY_LABELS, ES_TYPE_LABELS, ES_PRODUCTION_LABELS, captionEs } from '../i18n/es/labels.js'

const ES_APPROVAL = { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'CONVRT owner (confirmed in chat)', approvedOn: '2026-11-22' }

export const PORTFOLIO = [
  /* ── SPANISH VIDEOS (owner folders ~/Desktop/SPANISH: UGC, Spokesperson; uploaded to Cloudflare Stream 2026-11-22) ─────────────────────────────────────────────────────────────
     Spanish-only entries: `languages: ['es']` + `onlyIn: ['es']`, so they appear on /es/ pages only (the Spanish Showcase and the UGC / Spokesperson galleries and heroes) and never change an English page.
     The owner confirmed in chat (2026-11-22) that all 18 are approved for the website and that the creators agreed to portfolio display. Creators are identified only by opaque ids (the name-to-id
     map is kept privately, outside the repository); creator names, brands and production credits are NOT shown (no showName / brandDisplay / creditDisplay). Titles describe only what the footage
     shows. No uploadDate is recorded, so these entries emit no VideoObject structured data. `type` follows the owner's folder: UGC/ → 'ugc', Spokesperson/ → 'spokesperson'; HERO-* files are the hero stage. */
  {
    id: 'es-ugc-hero-1',
    title: 'Unboxing y demostración de producto',
    caption: 'Unboxing y demostración de producto.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '6c04c13dbb9ff7042f30e028b7394fe6' },
    poster: '/portfolio/es-ugc-hero-1.webp',
    creatorId: 'es-c01',
    category: 'UGC · Anuncio con creador',
    placement: 'hero',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-hero-2',
    title: 'Dos creadoras presentando un servicio',
    caption: 'Dos creadoras presentando un servicio.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '816d316906f79fe216d6f62079a0047f' },
    poster: '/portfolio/es-ugc-hero-2.webp',
    creatorId: 'es-c03',
    category: 'UGC · Anuncio con creador',
    placement: 'hero',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-hero-3',
    title: 'Presentación de una colección de gafas',
    caption: 'Presentación de una colección de gafas.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '75e7a204d0d4d2c75fe1ad19f0348461' },
    poster: '/portfolio/es-ugc-hero-3.webp',
    creatorId: 'es-c04',
    category: 'UGC · Anuncio con creador',
    placement: 'hero',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-1',
    title: 'Café de especialidad: demostración de producto a cámara',
    caption: 'Café de especialidad: demostración de producto a cámara.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '04b0b9817dea7ad5f29e67d98499e8a4' },
    poster: '/portfolio/es-ugc-1.webp',
    creatorId: 'es-c02',
    category: 'UGC · Anuncio con creador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-2',
    title: 'Recorrido por una vivienda con piscina',
    caption: 'Recorrido por una vivienda con piscina.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '3e6b7af68da8f3258c2d6f4893b142bd' },
    poster: '/portfolio/es-ugc-2.webp',
    creatorId: 'es-c01',
    category: 'UGC · Anuncio con creador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-3',
    title: 'Viaje por paisajes con una aplicación en el móvil',
    caption: 'Viaje por paisajes con una aplicación en el móvil.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: 'c118345b54c4a9a6fc3a319b2a66e5db' },
    poster: '/portfolio/es-ugc-3.webp',
    creatorId: 'es-c03',
    category: 'UGC · Anuncio con creador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-4',
    title: 'Creadora mostrando los detalles de una prenda',
    caption: 'Creadora mostrando los detalles de una prenda.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: 'f4739a0bd536b672933a522bb5a6b779' },
    poster: '/portfolio/es-ugc-4.webp',
    creatorId: 'es-c05',
    category: 'UGC · Anuncio con creador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-5',
    title: 'Creador explicando una solución digital con apoyo visual',
    caption: 'Creador explicando una solución digital con apoyo visual.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '3866056a8606c49abad3aa2e7dfee6f6' },
    poster: '/portfolio/es-ugc-5.webp',
    creatorId: 'es-c02',
    category: 'UGC · Anuncio con creador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-ugc-6',
    title: 'Rutina diaria con un reloj inteligente',
    caption: 'Rutina diaria con un reloj inteligente.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '8766cb0a94b775b2c9bc50005d03fb9c' },
    poster: '/portfolio/es-ugc-6.webp',
    creatorId: 'es-c03',
    category: 'UGC · Anuncio con creador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-hero-1',
    title: 'Spokesperson hablando a cámara en exteriores',
    caption: 'Presentador hablando a cámara en exteriores.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '6426e524291b27be4e42a93f51155029' },
    poster: '/portfolio/es-spokesperson-hero-1.webp',
    creatorId: 'es-c02',
    category: 'Presentador · Vídeo con presentador',
    placement: 'hero',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-hero-2',
    title: 'Presentadora explicando una aplicación con su portátil',
    caption: 'Presentadora explicando una aplicación con su portátil.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '654557e3f08432a3b05cf115d05b0c0d' },
    poster: '/portfolio/es-spokesperson-hero-2.webp',
    creatorId: 'es-c01',
    category: 'Presentador · Vídeo con presentador',
    placement: 'hero',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-hero-3',
    title: 'Presentadora respondiendo preguntas con textos en pantalla',
    caption: 'Presentadora respondiendo preguntas con textos en pantalla.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '1941b043cd48c685b59f4c3299003daa' },
    poster: '/portfolio/es-spokesperson-hero-3.webp',
    creatorId: 'es-c05',
    category: 'Presentador · Vídeo con presentador',
    placement: 'hero',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-1',
    title: 'Spokesperson explicando un servicio profesional',
    caption: 'Spokesperson explicando un servicio profesional.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: 'fff13512cc21b7386a7b0a998e06047c' },
    poster: '/portfolio/es-spokesperson-1.webp',
    creatorId: 'es-c02',
    category: 'Presentador · Vídeo con presentador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-2',
    title: 'Presentadora en exteriores con imágenes de cocina',
    caption: 'Presentadora en exteriores con imágenes de cocina.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: 'b5c4b83376e5a02b0f0d87de7bd17f30' },
    poster: '/portfolio/es-spokesperson-2.webp',
    creatorId: 'es-c04',
    category: 'Presentador · Vídeo con presentador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-3',
    title: 'Spokesperson con auriculares en formato pódcast',
    caption: 'Spokesperson con auriculares en formato pódcast.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: 'f7a739320888ea494053b02f6eb84989' },
    poster: '/portfolio/es-spokesperson-3.webp',
    creatorId: 'es-c06',
    category: 'Presentador · Vídeo con presentador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-4',
    title: 'Presentadora en su escritorio con textos en pantalla',
    caption: 'Presentadora en su escritorio con textos en pantalla.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: 'c3adc98013a1a85a8b5bf6f6c410818f' },
    poster: '/portfolio/es-spokesperson-4.webp',
    creatorId: 'es-c05',
    category: 'Presentador · Vídeo con presentador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-5',
    title: 'Spokesperson en estudio con rótulos animados',
    caption: 'Spokesperson en estudio con rótulos animados.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '9e721f7dfa716703db3c3aa731d34e48' },
    poster: '/portfolio/es-spokesperson-5.webp',
    creatorId: 'es-c02',
    category: 'Presentador · Vídeo con presentador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  {
    id: 'es-spokesperson-6',
    title: 'Presentadora en interior con subtítulos animados',
    caption: 'Presentadora en interior con subtítulos animados.',
    type: 'spokesperson',
    industry: 'unclassified',
    languages: ['es'],
    onlyIn: ['es'],
    source: { cloudflareId: '4af34968812800c11e7c6f4121f65d9e' },
    poster: '/portfolio/es-spokesperson-6.webp',
    creatorId: 'es-c04',
    category: 'Presentador · Vídeo con presentador',
    placement: 'gallery',
    approval: ES_APPROVAL,
  },
  /* SAAS SLOTS (/saas-video-production): EMPTY ON PURPOSE, awaiting the owner's approved SaaS videos. No UGC, Spokesperson, Organic or homepage-client video may stand in
     for them, and no Cloudflare id is invented: to fill a slot, paste this entry (with a real Cloudflare id) at the top of this list:
       THREE-PHONE HERO STAGE  placement: 'hero'      (first = the large centre phone, at most 3)
         hero slot 1 (centre): a human-led SaaS product explainer      hero slot 2: a software demonstration or app walkthrough      hero slot 3: an animated / motion-graphics SaaS video
         (the order is a recommendation: the stage shows whatever is approved, in this order)
       GALLERY                 placement: 'gallery'   (everything else, at most 10; four across on desktop)
     {
       id: 'saas-hero-1', title: '…', caption: 'One honest sentence.', type: 'saas', format: 'presenter',   // format only once confirmed
       industry: 'saas', languages: ['en'], source: { cloudflareId: '…' }, poster: '/portfolio/saas-hero-1.webp',
       creatorId: 'cv-saas-hero-1', category: 'SaaS · Product explainer', placement: 'hero',
       approval: { status: 'approved', portfolioUse: true, creatorConsent: true, approvedBy: 'CONVRT owner (confirmed in chat)', approvedOn: 'YYYY-MM-DD' },
     }
     A video that genuinely belongs on two service pages keeps ONE entry and adds `alsoOn`, e.g. a spokesperson video: type: 'spokesperson', alsoOn: { saas: 'gallery' }.
     Set `production: 'convrt'` only if CONVRT produced it. An independent creator's example is never presented as a CONVRT production. */
  /* SaaS page videos (/saas-video-production), from the owner's SaaS folder (Desktop > UGC PAGE VIDEOS > SaaS, 2026-11-20). These are independent creators' UGC examples for software
     brands (not explainers, demos or CONVRT-produced work): titles are neutral placeholders, languages and production attribution are unconfirmed, and no brand or credit is shown.
     Hero stage, centre first: saas-creator-1, saas-creator-2, then creator-04 (alsoOn). Gallery, all via alsoOn: creator-15, creator-10 and the three clips that are now Spokesperson entries (Norton, CTA1, HOOK1). */
  {
    id: 'saas-creator-1',
    title: 'Creator at Desk — File Management App Demo',
    caption: 'Creator at Desk — File Management App Demo.',
    type: 'saas',
    industry: 'saas',
    source: { cloudflareId: '80fc999238285c7f73757c78d9bcd8e7' },
    poster: '/portfolio/saas-creator-1.webp',
    creatorId: 'cv-saas-creator-1',
    category: 'SaaS · Creator example',
    placement: 'gallery',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'saas-creator-2',
    title: 'Presenter-Led Ad for a Moving-Planner App',
    caption: 'Presenter-Led Ad for a Moving-Planner App.',
    type: 'saas',
    industry: 'saas',
    source: { cloudflareId: '0b429c9cebb978105af85bdfb766d992' },
    poster: '/portfolio/saas-creator-2.webp',
    creatorId: 'cv-saas-creator-2',
    category: 'SaaS · Creator example',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  /* Organic Social page videos (/social-media-video-production). Supplied by the owner on 2026-11-20 (Desktop > Organic page videos: HERO1-3 = the three-phone stage,
     DOWN-SECTION-1-4 = the gallery). type 'organic' is the ONLY thing that sends a video to that page. Titles and captions are neutral placeholders. The owner confirmed in chat
     (2026-11-20) that languages ['en'] and industry 'other' are correct for all seven. No brand, creator name, production credit or content `style` was supplied, so none is set
     (the style filter stays hidden until at least two styles are confirmed). Still open: creator consent wording and whether each is a CONVRT production. To add more later, copy an entry below (hero slots: placement 'hero', first = the centre phone, at most 3; everything else = the gallery, at most 10).
     A video made by an independent creator is shown only with the creator's consent and is never presented as a CONVRT production unless it is one. */
  /* DISPLAY ORDER of the portfolio videos (also the order of the UGC gallery). It is deliberately mixed so that the same creator never appears
     twice in a row, in All Work or in any industry tab. When you add videos, interleave them rather than appending a run from one creator.
     The "creator-NN" videos come from the Creator Showcase folder (creator-01, 03, 07, 13, 14 and 18 were duplicates of spokesperson videos and now exist only as spokesperson entries): industry = the folder each file was in (E-commerce, Service, SaaS); titles are
     placeholders, languages and production attribution are unconfirmed, and no brand or credit is shown. */
  /* Spokesperson videos (shown on /spokesperson-video-production and in the Creator Showcase; they sit among the UGC videos in the display order below, in the order the Spokesperson page needs within its hero and gallery). Supplied by the owner on 2026-11-19 (Desktop > UGC PAGE VIDEOS > Spokesperson videos: HERO1-3,
     SECTION, SECTION2-4); the owner titled the three hero files. type 'spokesperson' is the ONLY thing that sends a video to that page. Captions are neutral
     placeholders, languages are assumed from the on-screen captions and the industry of six of them is the Creator Showcase folder they were also in (they are the SAME videos as the former creator-01/03/07/13/14/18, which were removed so the Showcase shows each video once); SECTION 4 is 'unclassified'. No production attribution. No brand is named. */
  {
    id: 'spokesperson-gal-1',
    title: 'Presenter-Led Software Explainer With Screen Footage',
    caption: 'Presenter-Led Software Explainer With Screen Footage.',
    type: 'spokesperson',
    industry: 'saas',
    languages: ['en'],
    source: { cloudflareId: 'e767742bb12024437e9df368cedbfba2' },
    poster: '/portfolio/spokesperson-gal-1.webp',
    creatorId: 'cv-spokesperson-gal-1',
    alsoOn: { saas: 'hero' },
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
    title: 'Direct-to-Camera Presenter — Captioned Talking Head',
    caption: 'Direct-to-Camera Presenter — Captioned Talking Head.',
    type: 'spokesperson',
    industry: 'services',
    languages: ['en'],
    source: { cloudflareId: 'adbf89cb6c07bb06e708c2a03e4cf2f6' },
    poster: '/portfolio/spokesperson-gal-2.webp',
    creatorId: 'cv-spokesperson-gal-2',
    homeCreator: 8,
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
    id: 'organic-hero-1',
    title: 'Educational Short — Hook, Content, Offer Framework',
    caption: 'Educational Short — Hook, Content, Offer Framework.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: 'cc23b5a0e85bdbadf89a7e097891a622' },
    poster: '/portfolio/organic-hero-1.webp',
    creatorId: 'cv-organic-hero-1',
    category: 'Organic social · Short-form video',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'creator-17',
    title: 'Beach Creator — Tipping App Introduction',
    caption: 'Beach Creator — Tipping App Introduction.',
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
    id: 'spokesperson-gal-3',
    title: 'Selfie-Style Presenter Outdoors — Captioned Video',
    caption: 'Selfie-Style Presenter Outdoors — Captioned Video.',
    type: 'spokesperson',
    industry: 'saas',
    languages: ['en'],
    source: { cloudflareId: '250a9cb5f26c74728d775086879251d1' },
    poster: '/portfolio/spokesperson-gal-3.webp',
    creatorId: 'cv-spokesperson-gal-3',
    alsoOn: { saas: 'gallery' },
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
    id: 'ugc-gal-5',
    title: 'Creator Introduction — UGC Creator Experience',
    caption: 'Creator Introduction — UGC Creator Experience.',
    type: 'ugc',
    industry: 'unclassified',
    // TO VERIFY: the on-screen captions mix English with a Spanish word ("también"); confirm the spoken language(s) before relying on this value.
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
    id: 'spokesperson-hero-1',
    title: 'Presenter Explainer — Writing Tone Software Feature',
    caption: 'Presenter Explainer — Writing Tone Software Feature.',
    type: 'spokesperson',
    industry: 'saas',
    languages: ['en'],
    source: { cloudflareId: 'b3db228064bde5cd076d22d9c938c2b0' },
    poster: '/portfolio/spokesperson-hero-1.webp',
    creatorId: 'cv-spokesperson-hero-1',
    homeCreator: 4,
    alsoOn: { saas: 'gallery' },
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
    id: 'organic-hero-2',
    title: 'Skit Short — Pricing Conversation on a Phone',
    caption: 'Skit Short — Pricing Conversation on a Phone.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: '7c4675614e9381fe40ae686f5cfb3a00' },
    poster: '/portfolio/organic-hero-2.webp',
    creatorId: 'cv-organic-hero-2',
    category: 'Organic social · Short-form video',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'ugc-gal-7',
    title: 'Supplement Capsules — Product Pitch With B-Roll',
    caption: 'Supplement Capsules — Product Pitch With B-Roll.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: '749e2ad503f5db79d69086a47c59edd0' },
    poster: '/portfolio/ugc-gal-7.webp',
    creatorId: 'cv-gal-7',
    homeCreator: 3,
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
    id: 'spokesperson-gal-4',
    title: 'Direct-to-Camera Presenter — Garage Setting',
    caption: 'Direct-to-Camera Presenter — Garage Setting.',
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
  {
    id: 'creator-04',
    title: 'Studio Creator — Customer-Tracking Software Pitch',
    caption: 'Studio Creator — Customer-Tracking Software Pitch.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: 'cd6654c2daf9e65bb1a1db2588a86f44' },
    poster: '/portfolio/creator-04.webp',
    creatorId: 'cv-creator-04',
    alsoOn: { saas: 'hero' },
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
    title: 'Couple Presenting — Wedding Planning Service',
    caption: 'Couple Presenting — Wedding Planning Service.',
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
    id: 'organic-hero-3',
    title: 'POV Skit — Filming Too Many UGC Videos',
    caption: 'POV Skit — Filming Too Many UGC Videos.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: 'd9613dac26e702b0f7edc1acca8e73ea' },
    poster: '/portfolio/organic-hero-3.webp',
    creatorId: 'cv-organic-hero-3',
    category: 'Organic social · Short-form video',
    placement: 'hero',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'creator-08',
    title: 'Presenter Demonstration — Interest Rates With Cups',
    caption: 'Presenter Demonstration — Interest Rates With Cups.',
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
    id: 'creator-15',
    title: 'Cabin Creator — Captioned Talking Head',
    caption: 'Cabin Creator — Captioned Talking Head.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: '0d98f3a55ebd26c9b400e348d02972d9' },
    poster: '/portfolio/creator-15.webp',
    creatorId: 'cv-creator-15',
    alsoOn: { saas: 'gallery' },
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
    title: 'Desk Presenter — Book-Scanning Gadget Demo',
    caption: 'Desk Presenter — Book-Scanning Gadget Demo.',
    type: 'ugc',
    industry: 'saas',
    source: { cloudflareId: '93584825751798b27840b85a2ad43a6a' },
    poster: '/portfolio/creator-10.webp',
    creatorId: 'cv-creator-10',
    alsoOn: { saas: 'gallery' },
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
    id: 'organic-gal-1',
    title: 'Animated Short — Ad Frequency, Hooks and Offers',
    caption: 'Animated Short — Ad Frequency, Hooks and Offers.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: '2bb321f0b45175d4b4a0b6e3f79206c9' },
    poster: '/portfolio/organic-gal-1.webp',
    creatorId: 'cv-organic-gal-1',
    category: 'Organic social · Short-form video',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'ugc-hero-1',
    title: 'Moving-Planner App Ad — Presenter With Captions',
    caption: 'Moving-Planner App Ad — Presenter With Captions.',
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
    title: 'Skit-Style Ad — Home Health-Screening Test',
    caption: 'Skit-Style Ad — Home Health-Screening Test.',
    type: 'ugc',
    industry: 'services',
    source: { cloudflareId: '3058e60f87200babb0b6c60606923e1b' },
    poster: '/portfolio/creator-05.webp',
    creatorId: 'cv-creator-05',
    category: 'UGC · Paid social',
    // ON HOLD (owner instruction, 2026-11-21): the footage ends on a third-party health-screening test's regulatory risk-information slate. No record exists that the brand's content
    // may be shown publicly, so the video is withheld from every page. Nothing is deleted: set `status` back to 'approved' once the owner confirms display authorization.
    approval: {
      status: 'on-hold',
      holdReason: 'Third-party regulated brand content (health-screening test risk slate): public-display authorization not recorded.',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-19',
    },
  },
  {
    id: 'ugc-gal-1',
    title: 'Skincare Product Demonstration — Cream and Serum',
    caption: 'Skincare Product Demonstration — Cream and Serum.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: 'c8914f7a0db3ac9f5ffd0721115dbe20' },
    poster: '/portfolio/ugc-gal-1.webp',
    creatorId: 'cv-gal-1',
    homeCreator: 2,
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
    id: 'organic-gal-2',
    title: 'POV Skit — AI Selling to a Human',
    caption: 'POV Skit — AI Selling to a Human.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: 'c7c85203ea049a339796bffbef6f1b06' },
    poster: '/portfolio/organic-gal-2.webp',
    creatorId: 'cv-organic-gal-2',
    category: 'Organic social · Short-form video',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'spokesperson-hero-2',
    title: 'Presenter — Book Recommendations With On-Screen Covers',
    caption: 'Presenter — Book Recommendations With On-Screen Covers.',
    type: 'spokesperson',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: 'c0c30e58489efad67789cdba1b58df23' },
    poster: '/portfolio/spokesperson-hero-2.webp',
    creatorId: 'cv-spokesperson-hero-2',
    homeCreator: 1,
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
    id: 'creator-06',
    title: 'Podcast-Style Presenter at a Microphone',
    caption: 'Podcast-Style Presenter at a Microphone.',
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
    title: 'Travel Battery Organizer — Product Demonstration',
    caption: 'Travel Battery Organizer — Product Demonstration.',
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
    id: 'spokesperson-hero-3',
    title: 'Direct-to-Camera Presenter — Filmed in a Car',
    caption: 'Direct-to-Camera Presenter — Filmed in a Car.',
    type: 'spokesperson',
    industry: 'services',
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
    id: 'creator-16',
    title: 'Two-Person Dialogue Skit — Outdoor Café',
    caption: 'Two-Person Dialogue Skit — Outdoor Café.',
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
    id: 'organic-gal-3',
    title: 'POV Skit — AI Trying to Relate',
    caption: 'POV Skit — AI Trying to Relate.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: 'e67c49d0d1cff6e3f160b4dbe6b1cea1' },
    poster: '/portfolio/organic-gal-3.webp',
    creatorId: 'cv-organic-gal-3',
    category: 'Organic social · Short-form video',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'ugc-gal-4',
    title: 'Leather Bag Product Demonstration on the Beach',
    caption: 'Leather Bag Product Demonstration on the Beach.',
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
    title: 'Cat Collar Product Demonstration',
    caption: 'Cat Collar Product Demonstration.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: '1188b4341860779830fa7365b1442959' },
    poster: '/portfolio/ugc-gal-3.webp',
    creatorId: 'cv-gal-3',
    homeCreator: 5,
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
    title: 'Creator Reel — Several Character Styles',
    caption: 'Creator Reel — Several Character Styles.',
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
    id: 'organic-gal-4',
    title: 'POV Skit — Your Phone Heard One Conversation',
    caption: 'POV Skit — Your Phone Heard One Conversation.',
    type: 'organic',
    industry: 'other',
    languages: ['en'],
    source: { cloudflareId: 'c8ed4698b9b20ccb49b84c2a5977d008' },
    poster: '/portfolio/organic-gal-4.webp',
    creatorId: 'cv-organic-gal-4',
    category: 'Organic social · Short-form video',
    approval: {
      status: 'approved',
      portfolioUse: true,
      creatorConsent: true,
      approvedBy: 'CONVRT owner (confirmed in chat)',
      approvedOn: '2026-11-20',
    },
  },
  {
    id: 'creator-02',
    title: 'Car-Seat Creator Ad — Selling Without Broker Fees',
    caption: 'Car-Seat Creator Ad — Selling Without Broker Fees.',
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
    title: 'Hunting-Themed Outdoor Creator Video',
    caption: 'Hunting-Themed Outdoor Creator Video.',
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
    id: 'ugc-gal-6',
    title: 'Face Wash and Shave Bar — Product Demonstration',
    caption: 'Face Wash and Shave Bar — Product Demonstration.',
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
    title: 'Outdoor Direct-to-Camera Creator Video',
    caption: 'Outdoor Direct-to-Camera Creator Video.',
    type: 'ugc',
    industry: 'unclassified',
    languages: ['en'],
    source: { cloudflareId: 'ff256a4643515d29b61c1f210c06476d' },
    poster: '/portfolio/ugc-gal-2.webp',
    creatorId: 'cv-gal-2',
    homeCreator: 6,
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
    title: 'Meal-Kit Unboxing and Cooking Demonstration',
    caption: 'Meal-Kit Unboxing and Cooking Demonstration.',
    type: 'ugc',
    industry: 'ecommerce',
    languages: ['en'],
    source: { cloudflareId: '1fc1374cdfe428d10bfc40ad4eff9693' },
    poster: '/portfolio/ugc-hero-3.webp',
    creatorId: 'cv-hero-3',
    homeCreator: 7,
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
    title: 'Software Demo — Meeting Turned Into a Follow-Up Email',
    caption: 'Software Demo — Meeting Turned Into a Follow-Up Email.',
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
  ugc: 'UGC', spokesperson: 'Spokesperson', organic: 'Organic social', saas: 'SaaS video', demo: 'Product demo', testimonial: 'Testimonial', interview: 'Street interview',
  social: 'Organic social', ad: 'Ad creative',
}

/* Suggested content styles for the Organic Social gallery filter. They are a presentation aid, NOT a verified classification: a video carries a `style`
   only after the owner has confirmed it, and a style with no approved video never appears as a filter. */
export const ORGANIC_STYLES = [
  { id: 'educational', label: 'Educational' },
  { id: 'entertaining', label: 'Entertaining' },
  { id: 'product', label: 'Product-focused' },
  { id: 'founder', label: 'Founder-led' },
]
export const organicStyleLabel = (id) => ORGANIC_STYLES.find((s) => s.id === id)?.label ?? null

/* The service pages that can show a video (src/routes.js): a video belongs to the page named by its `type` and, optionally, to the others in `alsoOn`. */
export const SERVICE_PAGES = ['ugc', 'spokesperson', 'organic', 'saas']

/* Suggested video formats for the SaaS gallery filter. Like ORGANIC_STYLES they are a presentation aid, NOT a verified classification: a video carries a `format`
   only after the owner has confirmed it, and a format with no approved video never appears as a filter. */
export const SAAS_FORMATS = [
  { id: 'explainer', label: 'Product explainers' },
  { id: 'demo', label: 'Product demos' },
  { id: 'presenter', label: 'Human-led' },
  { id: 'animated', label: 'Animated' },
  { id: 'ad', label: 'Ads' },
]
export const saasFormatLabel = (id) => SAAS_FORMATS.find((f) => f.id === id)?.label ?? null

const titleCase = (slug) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
/* The label helpers below speak the language of the page being rendered (from the URL; English everywhere unless the page is /es/…). The data itself stays English. */
const isEs = () => currentLocale() === 'es'
export const languageLabel = (code) => (isEs() ? ES_LANGUAGE_LABELS[code] : LANGUAGE_LABELS[code]) ?? code.toUpperCase()

/* An industry that has not been confirmed. It is internal: it is never shown as a label and never becomes a tab. */
export const UNCLASSIFIED = 'unclassified'
export const isClassified = (item) => Boolean(item.industry) && item.industry !== UNCLASSIFIED
/* '' for an unconfirmed industry, so nothing is displayed (callers drop empty labels). */
export const industryLabel = (slug) => (!slug || slug === UNCLASSIFIED ? '' : (isEs() ? ES_INDUSTRY_LABELS[slug] : INDUSTRY_LABELS[slug]) ?? titleCase(slug))
export const typeOf = (item) => item.type
export const typeLabel = (item) => (item.type ? (isEs() ? ES_TYPE_LABELS[item.type] : TYPE_LABELS[item.type]) ?? titleCase(item.type) : '')
/* A video's caption in the page's language: generic captions ("UGC ad example 5.") are translated; a hand-written one is shown as written. */
/* LANGUAGE-SPECIFIC COPY. An entry may carry `i18n: { es: { title, caption } }`: copy WRITTEN for that language's page (the Spanish Showcase has its own creators and videos, not translations of the English
   ones). Resolution on a /es/ page: the entry's own `i18n.es` text, else (for the generic placeholder captions only) the pattern translation, else the entry's own text as written. */
const own = (item, field) => (isEs() ? item.i18n?.es?.[field] : undefined)
export const captionOf = (item) => own(item, 'caption') ?? (isEs() ? captionEs(item.caption) ?? item.caption : item.caption)
export const titleOf = (item) => own(item, 'title') ?? (isEs() ? captionEs(item.title ?? item.caption) ?? item.title ?? item.caption : item.title ?? item.caption)

/* PRODUCTION ATTRIBUTION. 'independent' = a creator's own example; 'convrt' = produced through CONVRT; unset = unknown (nothing is claimed). */
export const PRODUCTION_LABELS = { independent: 'Independent creator', convrt: 'Produced by CONVRT' }
export const productionLabel = (item) => (isEs() ? ES_PRODUCTION_LABELS : PRODUCTION_LABELS)[item.production] ?? ''
export const isConvrtProduction = (item) => item.production === 'convrt'

/* Brand name and credit line: shown only with the explicit permission recorded in the approval. */
export const brandLabel = (item) => (item.brand && item.approval?.brandDisplay === true ? item.brand : null)
export const creditLabel = (item) => (item.productionCredit && item.approval?.creditDisplay === true ? item.productionCredit : null)

/* Does this video belong on a service page? Only through its own `type` or an explicit `alsoOn` entry, never because of what it shows. */
export const servesPage = (item, page) => item.type === page || Boolean(item.alsoOn && typeof item.alsoOn === 'object' && item.alsoOn[page])
/* Where it sits on that page: its own `placement` on the page its type names, the `alsoOn` placement on any other. */
export const placementOn = (item, page) => (item.type === page ? item.placement : item.alsoOn?.[page])

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
  if (item.i18n !== undefined) {
    const ok = item.i18n && typeof item.i18n === 'object' && !Array.isArray(item.i18n) && Object.entries(item.i18n).every(([l, v]) => /^[a-z]{2}$/.test(l) && v && typeof v === 'object' && Object.entries(v).every(([k, t]) => ['title', 'caption'].includes(k) && typeof t === 'string' && t.trim()))
    if (!ok) p.push('i18n must be { <2-letter language>: { title?, caption? } } with non-empty strings')
  }
  if (item.type !== undefined && !/^[a-z][a-z0-9-]*$/.test(item.type)) p.push('type must be a lowercase slug')
  if (item.industry !== undefined && !/^[a-z][a-z0-9-]*$/.test(item.industry)) p.push("industry must be a lowercase slug (or 'unclassified')")
  if (item.production !== undefined && !(item.production in PRODUCTION_LABELS)) p.push("production must be 'independent' or 'convrt' (leave it out when unknown)")
  if (item.productionCredit !== undefined && (typeof item.productionCredit !== 'string' || !item.productionCredit.trim())) p.push('productionCredit must be a non-empty string')
  const langsOk = Array.isArray(item.languages) && item.languages.length > 0 && item.languages.every((l) => /^[a-z]{2}$/.test(l))
  if (item.languages !== undefined && !langsOk) p.push('languages must be a non-empty list of 2-letter ISO 639-1 codes')
  if (item.onlyIn !== undefined) {
    const ok = Array.isArray(item.onlyIn) && item.onlyIn.length > 0 && item.onlyIn.every((l) => /^[a-z]{2}$/.test(l))
    if (!ok) p.push('onlyIn must be a non-empty list of 2-letter language codes (the language sites that may show this video)')
    else if (!item.onlyIn.includes('en') && !item.onlyIn.every((l) => (item.languages ?? []).includes(l))) p.push('onlyIn: a video limited to other languages must list those languages in `languages` (its confirmed spoken language)')
  }
  const hasCf = Boolean(item.source?.cloudflareId)
  const hasMp4 = Boolean(item.source?.mp4)
  if (hasCf === hasMp4) p.push('source needs exactly one of cloudflareId or mp4')
  if (item.style !== undefined && !ORGANIC_STYLES.some((st) => st.id === item.style)) p.push(`style must be one of: ${ORGANIC_STYLES.map((st) => st.id).join(', ')}`)
  if (item.style !== undefined && item.type !== 'organic') p.push("style is only for type 'organic'")
  if (item.format !== undefined && !SAAS_FORMATS.some((f) => f.id === item.format)) p.push(`format must be one of: ${SAAS_FORMATS.map((f) => f.id).join(', ')}`)
  if (item.format !== undefined && !servesPage(item, 'saas')) p.push("format is only for videos shown on the SaaS page (type 'saas' or alsoOn.saas)")
  if (item.alsoOn !== undefined) {
    const entries = item.alsoOn && typeof item.alsoOn === 'object' && !Array.isArray(item.alsoOn) ? Object.entries(item.alsoOn) : null
    if (!entries) p.push('alsoOn must be an object: { servicePage: placement }')
    else for (const [page, where] of entries) {
      if (!SERVICE_PAGES.includes(page)) p.push(`alsoOn.${page}: unknown service page (use ${SERVICE_PAGES.join(', ')})`)
      else if (page === item.type) p.push(`alsoOn.${page}: the video already belongs to that page through its type`)
      if (where !== 'hero' && where !== 'gallery') p.push(`alsoOn.${page} must be 'hero' or 'gallery'`)
    }
  }
  if (item.placement !== undefined && item.placement !== 'hero' && item.placement !== 'gallery') p.push("placement must be 'hero' or 'gallery'")
  if (item.showcase !== undefined && !/^[a-z][a-z0-9-]*$/.test(item.showcase)) p.push('showcase must be a lowercase slug')
  if (item.homeCreator !== undefined && !(Number.isInteger(item.homeCreator) && item.homeCreator >= 1 && item.homeCreator <= 20)) p.push('homeCreator must be a whole number from 1 to 20 (its position in the homepage creator carousel)')
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
/* forPageLanguage(): on a page in another language ONLY videos whose confirmed spoken `languages` include that language are shown (the page components apply it to what the selectors return):
   the Spanish pages never show the English library, and a video with no recorded language is never guessed into a language. English is unchanged. It is NOT applied inside the selectors, because
   module-level code (the SEO manifest's `indexable` flags) must stay language-independent. */
export const forPageLanguage = (items) => (currentLocale() === 'en' ? items : items.filter((i) => (i.languages ?? []).includes(currentLocale())))
/* `onlyIn: ['es']` limits a video to the Spanish site: it is then invisible to every English-facing consumer (English pages, the English indexable flags, English JSON-LD), so adding a
   Spanish-only video can never change an English page. With no `onlyIn` a video behaves exactly as before. */
const shownIn = (item, locale) => !item.onlyIn || item.onlyIn.includes(locale)
/* The English library: what module-level, language-independent code (the SEO manifest) must read. */
export const ENGLISH_LIBRARY = PORTFOLIO.filter((i) => shownIn(i, DEFAULT_LOCALE))
/* Always the library of the page being rendered: English pages (and anything evaluated without a page) never see Spanish-only videos. */
export const selectDisplayable = (items = PORTFOLIO) => items.filter((i) => shownIn(i, currentLocale()) && isDisplayable(i))
/* Approved videos for a language, independent of the page being rendered (used by the release gate, the sitemap and the tests). */
export const displayableFor = (locale, items = PORTFOLIO) => items.filter(isDisplayable).filter((i) => shownIn(i, locale) && (locale === 'en' || (i.languages ?? []).includes(locale)))

/* /creator-showcase: everything approved for the portfolio. */
export const selectOurWork = selectDisplayable

/* /ugc-video-agency: approved UGC videos, split into the hero stage (placement 'hero') and the gallery under it (everything else). */
const selectUgc = (items) => selectDisplayable(items).filter((i) => servesPage(i, 'ugc'))
export const selectHero = (items = PORTFOLIO) => selectUgc(items).filter((i) => placementOn(i, 'ugc') === 'hero')
export const selectGallery = (items = PORTFOLIO) => selectUgc(items).filter((i) => placementOn(i, 'ugc') !== 'hero')

/* /spokesperson-video-production: approved videos whose type is explicitly 'spokesperson', split the same way (hero stage / gallery). A UGC video can never
   appear here and a spokesperson video can never appear on the UGC page: the type is the only switch, and there is no fallback to the other list. */
const selectSpokesperson = (items) => selectDisplayable(items).filter((i) => servesPage(i, 'spokesperson'))
export const selectSpokespersonHero = (items = PORTFOLIO) => selectSpokesperson(items).filter((i) => placementOn(i, 'spokesperson') === 'hero')
export const selectSpokespersonGallery = (items = PORTFOLIO) => selectSpokesperson(items).filter((i) => placementOn(i, 'spokesperson') !== 'hero')

/* /social-media-video-production: approved videos whose type is explicitly 'organic', split the same way. Like the spokesperson list there is no fallback: no UGC,
   spokesperson or homepage-client ('social') video can appear here, and an organic video can never appear on the other service pages. */
const selectOrganic = (items) => selectDisplayable(items).filter((i) => servesPage(i, 'organic'))
export const selectOrganicHero = (items = PORTFOLIO) => selectOrganic(items).filter((i) => placementOn(i, 'organic') === 'hero')
export const selectOrganicGallery = (items = PORTFOLIO) => selectOrganic(items).filter((i) => placementOn(i, 'organic') !== 'hero')

/* /saas-video-production: approved videos whose type is explicitly 'saas', plus any approved video that lists `alsoOn.saas` (e.g. a presenter demonstrating software that the
   owner approved for both the Spokesperson and SaaS pages). Split the same way (hero stage / gallery). No fallback: UGC, organic and homepage-client ('social') videos never
   appear here, and a spokesperson video appears only when its entry says so. */
const selectSaas = (items) => selectDisplayable(items).filter((i) => servesPage(i, 'saas'))
export const selectSaasHero = (items = PORTFOLIO) => selectSaas(items).filter((i) => placementOn(i, 'saas') === 'hero')
export const selectSaasGallery = (items = PORTFOLIO) => selectSaas(items).filter((i) => placementOn(i, 'saas') !== 'hero')

/* The English homepage "Real creators" carousel: approved videos (full approval: portfolio use AND creator consent) tagged `homeCreator`, whose spoken language is CONFIRMED English (a video
   with no recorded language is never guessed into the list), in `homeCreator` order. Nothing is invented to fill a gap: fewer than eight approved videos simply show fewer. */
export const HOME_CREATORS_MAX = 8
export const selectHomeCreators = (items = PORTFOLIO) =>
  selectDisplayable(items)
    .filter((i) => i.homeCreator !== undefined && (i.languages ?? []).includes('en'))
    .sort((a, b) => a.homeCreator - b.homeCreator)
    .slice(0, HOME_CREATORS_MAX)

/* A service page may fix the order of some of its videos without touching the shared file order (which /creator-showcase and the UGC gallery use): the listed ids come first, in the
   listed order, and every other video follows in its usual order. Ids that are not in `items` are ignored. */
export const orderedBy = (items, ids = []) => {
  const rank = (i) => { const r = ids.indexOf(i.id); return r === -1 ? Infinity : r }
  return items.map((item, index) => ({ item, index })).sort((a, b) => (rank(a.item) - rank(b.item)) || (a.index - b.index)).map((x) => x.item)
}

/* Homepage client panel `id` ('adscale' | 'elyon' | 'graspo'). */
export const selectShowcase = (id, items = PORTFOLIO) => items.filter((i) => shownIn(i, currentLocale()) && isShowcaseable(i) && i.showcase === id)

/* Name shown on a card: only with explicit permission. */
export const creatorLabel = (item) => (item.creator?.showName === true && item.creator?.displayName ? item.creator.displayName : null)

export const posterUrl = (item) => item.poster ?? streamPoster(item.source.cloudflareId, { height: 720 })
export const hlsUrl = (item) => `https://videodelivery.net/${item.source.cloudflareId}/manifest/video.m3u8`

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   CATEGORIES: the four industry groups of /creator-showcase, plus the Spokesperson type filter (All Work is the combined view, not a category).
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
  /* A TYPE filter, not an industry: every video whose type is 'spokesperson', whatever its industry (a SaaS spokesperson video is under both SaaS and
     Spokesperson). It has a tab only while at least one such video is approved. */
  { id: 'spokesperson', label: 'Spokesperson', color: '#ff6a4d', byType: 'spokesperson' },
]
/* The UGC TYPE filter exists only on the Spanish page: its videos are all 'unclassified' by industry, so without it the Spanish library offered only All + Spokesperson. It is NOT in
   CATEGORIES, so the English tabs (and tests/creator-showcase.test.mjs) are unchanged; it sits between the industry tabs and Spokesperson. */
const ES_UGC_CATEGORY = { id: 'ugc', label: 'UGC', color: '#d5ff40', byType: 'ugc' }
export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))
const CATEGORY_ORDER = CATEGORIES.map((c) => c.id)
const CATEGORY_OF_INDUSTRY = { saas: 'saas', technology: 'saas', ecommerce: 'ecommerce', services: 'services' }
export const categoryOf = (item) => (isClassified(item) ? CATEGORY_OF_INDUSTRY[item.industry] ?? 'other' : null)

/* Is the video in the filter `categoryId`? An industry filter by its industry group; the Spokesperson filter by the video's type. */
export const inCategory = (item, categoryId) => {
  const c = CATEGORIES.find((x) => x.id === categoryId) ?? (categoryId === ES_UGC_CATEGORY.id ? ES_UGC_CATEGORY : undefined)
  return c?.byType ? typeOf(item) === c.byType : categoryOf(item) === categoryId
}

/* The tabs /creator-showcase offers: All Work, then each category that has at least one classified video (an empty category is hidden). */
export const availableCategories = (items) => {
  const list = isEs() ? [...CATEGORIES.filter((c) => c.id !== 'spokesperson'), ES_UGC_CATEGORY, ...CATEGORIES.filter((c) => c.id === 'spokesperson')] : CATEGORIES
  return [ALL_CATEGORY, ...list.filter((c) => items.some((i) => inCategory(i, c.id)))]
}
export const countIn = (items, categoryId) => (categoryId === 'all' ? items.length : items.filter((i) => inCategory(i, categoryId)).length)
export const filterByCategory = (items, categoryId) => (categoryId === 'all' ? items : items.filter((i) => inCategory(i, categoryId)))

/* A page in language `locale` shows videos spoken in that language FIRST (a stable sort: everything else keeps its order and stays available). Only a video whose
   `languages` list contains the code moves; a video with no confirmed language is never guessed into any language. English keeps the file order. */
export const prioritizeLanguage = (items, locale) => {
  if (!locale || locale === 'en') return items
  const spoken = items.filter((i) => (i.languages ?? []).includes(locale))
  return spoken.length === 0 ? items : [...spoken, ...items.filter((i) => !(i.languages ?? []).includes(locale))]
}

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
