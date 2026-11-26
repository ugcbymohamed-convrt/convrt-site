/* The approved names of the five trust and legal pages, in each language, and where a link to each one points.

   • About / Contact are translated in all four languages.
   • Privacy Policy / Terms and Conditions / Legal Notice exist in Spanish, French and Arabic too, but a link goes to the visitor's own language ONLY once the translation is approved
     (isReleased, src/i18n/release.js: LEGAL_TRANSLATIONS_APPROVED in src/config.js). Until then the link goes to the English document and says so ("(in English)"), exactly as before.
     On Vercel preview deployments and localhost the footer shows the final, localized state after hydration (usePreviewHost), so the owner can review the footer and the form links
     in each language without the unapproved translation being linked on the live site. */

import { usePreviewHost } from '../lib/previewHost.js'
import { PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH, ABOUT_PATH, CONTACT_PATH } from '../config.js'
import { currentLocale } from './locale.js'
import { DEFAULT_LOCALE } from './locales.js'
import { localizedPath } from './paths.js'
import { hasTranslation } from './registry.js'
import { isReleased } from './release.js'
import { translate } from './tr.js'

export const TRUST_NAMES = {
  en: { about: 'About CONVRT', contact: 'Contact', privacy: 'Privacy Policy', terms: 'Terms and Conditions', legalNotice: 'Legal Notice' },
  es: { about: 'Sobre nosotros', contact: 'Contacto', privacy: 'Política de privacidad', terms: 'Términos y condiciones', legalNotice: 'Aviso legal' },
  fr: { about: 'À propos', contact: 'Contact', privacy: 'Politique de confidentialité', terms: 'Conditions générales', legalNotice: 'Mentions légales' },
  ar: { about: 'من نحن', contact: 'تواصل معنا', privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', legalNotice: 'الإشعار القانوني' },
}
export const TRUST_KEY_PATH = { about: ABOUT_PATH, contact: CONTACT_PATH, privacy: PRIVACY_PATH, terms: TERMS_PATH, legalNotice: LEGAL_NOTICE_PATH }
export const LEGAL_KEYS = ['privacy', 'terms', 'legalNotice']

/* { href, label, lang } for one trust page seen from `locale`. `reviewPreview` = show the final localized state although the legal translation is still held (preview deployments). */
export function trustLink(key, locale = currentLocale(), reviewPreview = false) {
  const basePath = TRUST_KEY_PATH[key]
  const name = (TRUST_NAMES[locale] ?? TRUST_NAMES.en)[key]
  const available = locale === DEFAULT_LOCALE || isReleased(locale, basePath) || (reviewPreview && hasTranslation(locale, basePath))
  if (available) return { href: localizedPath(locale, basePath), label: name, lang: undefined }
  // The English document, labelled as such (the language of the target is declared with lang="en").
  return { href: basePath, label: `${name} ${translate(locale, '(in English)')}`, lang: 'en' }
}

export function useTrustLinks() {
  const preview = usePreviewHost()
  const locale = currentLocale()
  return (key) => trustLink(key, locale, preview)
}
