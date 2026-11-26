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
  ar: ['رشّح عميلًا و', 'اربح'],
}

/* The Services dropdown, Spanish (owner, Nov 2026): short labels, keyed by the service page's English path. Used by the desktop dropdown AND the mobile menu, so they cannot drift. The page names
   (breadcrumbs, headings) keep their own dictionary entries. Other languages use the dictionary label of each entry. */
export const SERVICE_MENU_LABELS = {
  es: {
    '/ugc-video-agency': 'Vídeos UGC',
    '/spokesperson-video-production': 'Vídeos Spokesperson',
    '/saas-video-production': 'Vídeos para SaaS y aplicaciones',
    '/social-media-video-production': 'Vídeos orgánicos para redes sociales',
  },
  // French (owner, 2026-11-24): the same order as Spanish: UGC, Spokesperson, SaaS, organic.
  fr: {
    '/ugc-video-agency': 'Vidéos UGC',
    '/spokesperson-video-production': 'Vidéos Spokesperson',
    '/saas-video-production': 'Vidéos SaaS et applications',
    '/social-media-video-production': 'Vidéos organiques pour les réseaux',
  },
}

/* The Services dropdown has TWO entries (owner, 2026-11-26): "Paid Social" (a group; hovering or focusing it opens UGC, Spokesperson, SaaS & App) and "Organic Social" (a direct link). The group
   labels, per language. "Paid Social" opens no page of its own: it only groups the three paid-social services. */
export const SERVICE_GROUP_LABELS = {
  en: { paid: 'Paid Social', organic: 'Organic Social' },
  es: { paid: 'Redes sociales de pago', organic: 'Redes sociales orgánicas' },
  fr: { paid: 'Réseaux sociaux payants', organic: 'Réseaux sociaux organiques' },
  ar: { paid: 'سوشيال ميديا مدفوعة', organic: 'سوشيال ميديا عضوية' },
}
export const PAID_SOCIAL_HREFS = ['/ugc-video-agency', '/spokesperson-video-production', '/saas-video-production']
export const ORGANIC_SOCIAL_HREF = '/social-media-video-production'

/* Spanish and French order of the dropdown (owner): UGC, Spokesperson, SaaS, Organic. The other languages keep the English order. */
export const serviceMenuFor = (locale, items) => {
  const order = SERVICE_MENU_LABELS[locale] ? Object.keys(SERVICE_MENU_LABELS[locale]) : null
  return order ? order.map((href) => items.find((m) => m.href === href)).filter(Boolean) : items
}

export const HOME_LABELS = { en: 'CONVRT — home', es: 'CONVRT — inicio', fr: 'CONVRT — accueil', ar: 'CONVRT — الرئيسية' }

/* Is a menu entry that opens `path` (an English base path; undefined for an in-page anchor) listed in this language?
   • A LIVE language lists an entry only when that page is translated there (Spanish has no Blog, so its menu has none).
   • FRENCH lists the Blog (owner, 2026-11-24: Services, Créateurs, Études de cas, Tarifs, Blog, Contact, Parrainez et gagnez); it opens the English blog, and the footer says « (en anglais) ».
   • A language still IN REVIEW (French, Arabic on this branch: they hold only the referral page, their full translations are on their own branches) keeps the same menu as English, so the
     component looks and behaves the same; an entry whose page is not translated opens the English page (localHref falls back). The Blog is never listed outside English. */
export const menuHas = (locale, path) => !path || locale === 'en' || hasTranslation(locale, path) || (!isLive(locale) && path !== BLOG_PATH) || (locale === 'fr' && path === BLOG_PATH)

export const showReferralLink = (locale) => locale === 'en' || (hasTranslation(locale, REFERRALS_PATH) && flowAvailable(locale, 'referrals'))
