/* ONE MENU MODEL FOR EVERY LANGUAGE (owner, Nov 2026): the header menu, the mobile menu and the footer menu list the same entries in the same order in English, Spanish, French and Arabic.
   An entry appears in a language only when the page it opens is translated there (src/i18n/registry.js); an untranslated page is never linked from a translated menu (Blog, today). */
import { hasTranslation } from './registry.js'
import { flowAvailable } from './cta.js'
import { REFERRALS_PATH } from '../config.js'

/* The label of the referral link: [plain words, lime accent word]. The same destination (/referrals) in every language; the English label is "Refer & Earn". */
export const REFERRAL_LABELS = {
  en: ['Refer &', 'Earn'],
  es: ['Recomienda y', 'gana'],
  fr: ['Parrainez et', 'gagnez'],
  ar: ['رشّحنا', 'واكسب'],
}

export const HOME_LABELS = { en: 'CONVRT — home', es: 'CONVRT — inicio', fr: 'CONVRT — accueil', ar: 'CONVRT — الرئيسية' }

/* Is a menu entry that opens `path` (an English base path; undefined for an in-page anchor) available in this language? */
export const menuHas = (locale, path) => !path || locale === 'en' || hasTranslation(locale, path)

export const showReferralLink = (locale) => locale === 'en' || (hasTranslation(locale, REFERRALS_PATH) && flowAvailable(locale, 'referrals'))
