/* FRENCH SERVICE PAGES: NO VIDEOS on the Spokesperson, Organic Social and SaaS pages (owner decision, Nov 2026): text-led, no stage, no gallery, no placeholders. The rule itself now lives in
   src/content/galleryPolicy.js (one table for every language); this constant is derived from it for the French tests and docs. It is false while every French slot of those three pages is off. */
import { galleryEnabled } from '../../content/galleryPolicy.js'

export const FR_SERVICE_PAGE_VIDEOS = ['spokesperson', 'organic', 'saas'].some((page) => ['hero', 'gallery'].some((slot) => galleryEnabled('fr', page, slot)))
