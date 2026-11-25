/* FRENCH SERVICE PAGES: NO VIDEOS on the Organic Social and SaaS pages (owner decision, Nov 2026): text-led, no stage, no gallery, no placeholders. (Spokesperson and UGC have a hero stage only, owner 2026-11-25.) The rule itself now lives in
   src/content/galleryPolicy.js (one table for every language); this constant is derived from it for the French tests and docs. It is false while every French slot of those two pages is off. */
import { galleryEnabled } from '../../content/galleryPolicy.js'

export const FR_SERVICE_PAGE_VIDEOS = ['organic', 'saas'].some((page) => ['hero', 'gallery'].some((slot) => galleryEnabled('fr', page, slot)))
