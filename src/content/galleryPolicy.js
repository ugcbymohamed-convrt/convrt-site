/* WHICH VIDEO SLOTS EACH LANGUAGE'S SERVICE PAGES HAVE (one place; owner rules, Nov 2026).

   A service page has two video slots: the `hero` stage (the three-phone stage, up to three videos) and the `gallery` (the horizontal strip lower on the page). Whether a slot exists in a language is a
   product decision, not something the video data should decide: a language whose Spokesperson page has no gallery keeps none however many Spokesperson videos exist, and the moment a gallery is
   approved the only change is the `true` below: the videos that are already classified in src/content/portfolio.js fill it by themselves.

   English: every slot exists (the approved English pages). Anything not listed for a language falls back to `true` (so a new language starts like English until its rules are written here).
   Spanish: UGC hero + gallery; Spokesperson hero stage only (no gallery); Organic Social and SaaS pages carry no videos.
   French:  UGC hero stage and Spokesperson hero stage only (owner placement, 2026-11-25): no gallery strip under either; the SaaS and Organic Social pages carry no videos (text-led).
   The Creator Showcase is NOT governed by this file: it lists every approved video of the language under its content-type filters (portfolio.js `type` and `secondary`). */
export const GALLERY_POLICY = {
  es: {
    ugc: { hero: true, gallery: true },
    spokesperson: { hero: true, gallery: false },
    organic: { hero: false, gallery: false },
    saas: { hero: false, gallery: false },
  },
  fr: {
    ugc: { hero: true, gallery: false },
    spokesperson: { hero: true, gallery: false },
    organic: { hero: false, gallery: false },
    saas: { hero: false, gallery: false },
  },
}

/* THE ORDER OF A HERO STAGE, per language and page (the owner's left / centre / right placement). The stage shows [centre, right, left]: the FIRST id is the large centre phone, the second the
   right phone, the third the left phone (CreatorVideoStage). Ids that are not approved are ignored; videos not listed follow in file order. English and Spanish keep their own orders. */
export const HERO_ORDER = {
  fr: {
    ugc: ['fr-mohamed-comma', 'fr-ugc-hero-1', 'fr-ugc-hero-2'], // centre football jersey · right food supplement · left travel app
    spokesperson: ['fr-ugc-1', 'fr-ugc-hero-3', 'fr-mohamed-skycop'], // centre roofing company · right wealth-management app · left delayed-flight compensation
  },
}
export const heroOrder = (locale, page) => HERO_ORDER[locale]?.[page]

/** Does `locale`'s service page `page` ('ugc' | 'spokesperson' | 'organic' | 'saas') have the slot `slot` ('hero' | 'gallery')? English always does. */
export const galleryEnabled = (locale, page, slot) => locale === 'en' || (GALLERY_POLICY[locale]?.[page]?.[slot] ?? true)
