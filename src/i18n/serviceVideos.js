/* The videos a SERVICE page (UGC, spokesperson, organic social, SaaS) may show in its page's language and slot ('hero' or 'gallery'). English: exactly forPageLanguage() as before. A language whose page has
   no such slot (src/content/galleryPolicy.js) gets none, so the stage turns text-led or the gallery is absent (no empty gap, no placeholder), whatever the portfolio holds. */
import { forPageLanguage } from '../content/portfolio.js'
import { galleryEnabled } from '../content/galleryPolicy.js'
import { currentLocale } from './locale.js'

export const serviceVideos = (items, page, slot) => (page && slot && !galleryEnabled(currentLocale(), page, slot) ? [] : forPageLanguage(items))
