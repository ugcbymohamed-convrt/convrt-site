/* ONE MENU MODEL FOR EVERY LANGUAGE (owner, Nov 2026): the header menu, the mobile menu and the footer menu list the same entries in the same order in English, Spanish, French and Arabic.
   An entry appears in a language only when the page it opens is translated there (src/i18n/registry.js); an untranslated page is never linked from a translated menu (Blog, today). */
import { hasTranslation } from './registry.js'
import { flowAvailable } from './cta.js'
import { REFERRALS_PATH, BLOG_PATH } from '../config.js'
import { isLive } from './locales.js'

/* The label of the referral link: [plain words, lime accent word]. The same destination (/referrals) in every language; the English label is "Refer & Earn". */
export const REFERRAL_LABELS = {
  en: ['Refer &', 'Earn'],
  es: ['Recomienda y', 'gana'],
  fr: ['Parrainez et', 'gagnez'],
  ar: ['رشّحنا', 'واكسب'],
}

export const HOME_LABELS = { en: 'CONVRT — home', es: 'CONVRT — inicio', fr: 'CONVRT — accueil', ar: 'CONVRT — الرئيسية' }

/* Is a menu entry that opens `path` (an English base path; undefined for an in-page anchor) listed in this language?
   • A LIVE language lists an entry only when that page is translated there (Spanish has no Blog, so its menu has none).
   • A language still IN REVIEW (French, Arabic on this branch: they hold only the referral page, their full translations are on their own branches) keeps the same menu as English, so the
     component looks and behaves the same; an entry whose page is not translated opens the English page (localHref falls back). The Blog is never listed outside English. */
export const menuHas = (locale, path) => !path || locale === 'en' || hasTranslation(locale, path) || (!isLive(locale) && path !== BLOG_PATH)

export const showReferralLink = (locale) => locale === 'en' || (hasTranslation(locale, REFERRALS_PATH) && flowAvailable(locale, 'referrals'))
