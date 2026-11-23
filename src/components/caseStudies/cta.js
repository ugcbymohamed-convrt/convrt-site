/* The primary button of a case-study hero. English keeps "Book a Creative Call" → the Roadmap (unchanged). Other languages use the language's own primary action
   (src/i18n/cta.js: Spanish "5 conceptos gratis" → /es/creative-growth-roadmap). */
import { OFFER_PATHS } from '../../config.js'
import { currentLocale } from '../../i18n/locale.js'
import { DEFAULT_LOCALE } from '../../i18n/locales.js'
import { primaryAction } from '../../i18n/cta.js'
import { tr } from '../../i18n/tr.js'

export function heroCta() {
  const locale = currentLocale()
  if (locale === DEFAULT_LOCALE) return { href: OFFER_PATHS.roadmap, label: 'Book a Creative Call', attrs: {}, event: null }
  const a = primaryAction(locale)
  return { href: a.href, label: tr(a.label), attrs: a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}, event: a.event }
}
