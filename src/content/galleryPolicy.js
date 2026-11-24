/* WHICH VIDEO SLOTS EACH LANGUAGE'S SERVICE PAGES HAVE (one place; owner rules, Nov 2026).

   A service page has two video slots: the `hero` stage (the three-phone stage, up to three videos) and the `gallery` (the horizontal strip lower on the page). Whether a slot exists in a language is a
   product decision, not something the video data should decide: a language whose Spokesperson page has no gallery keeps none however many Spokesperson videos exist, and the moment a gallery is
   approved the only change is the `true` below: the videos that are already classified in src/content/portfolio.js fill it by themselves.

   English: every slot exists (the approved English pages). Anything not listed for a language falls back to `true` (so a new language starts like English until its rules are written here).
   Spanish: UGC hero + gallery; Spokesperson hero stage only (no gallery); Organic Social and SaaS pages carry no videos.
   French:  UGC hero + gallery; the three other service pages are text-led (no stage, no gallery).
   The Creator Showcase is NOT governed by this file: it lists every approved video of the language under its content-type filters (portfolio.js `type` and `secondary`). */
export const GALLERY_POLICY = {
  es: {
    ugc: { hero: true, gallery: true },
    spokesperson: { hero: true, gallery: false },
    organic: { hero: false, gallery: false },
    saas: { hero: false, gallery: false },
  },
  fr: {
    ugc: { hero: true, gallery: true },
    spokesperson: { hero: false, gallery: false },
    organic: { hero: false, gallery: false },
    saas: { hero: false, gallery: false },
  },
}

/** Does `locale`'s service page `page` ('ugc' | 'spokesperson' | 'organic' | 'saas') have the slot `slot` ('hero' | 'gallery')? English always does. */
export const galleryEnabled = (locale, page, slot) => locale === 'en' || (GALLERY_POLICY[locale]?.[page]?.[slot] ?? true)
