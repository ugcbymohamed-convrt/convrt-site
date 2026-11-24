/* The videos a SERVICE page (spokesperson, organic social, SaaS) may show in its page's language. English and Spanish: exactly forPageLanguage() as before. A language whose service pages
   are video-less (French: src/i18n/fr/servicePages.js) gets none, so the hero is text-led and the gallery is absent (no empty gap, no placeholder). */
import { forPageLanguage } from '../content/portfolio.js'
import { currentLocale } from './locale.js'
import { FR_SERVICE_PAGE_VIDEOS } from './fr/servicePages.js'

const VIDEOS_ENABLED = { fr: FR_SERVICE_PAGE_VIDEOS }

export const serviceVideos = (items) => (VIDEOS_ENABLED[currentLocale()] === false ? [] : forPageLanguage(items))
