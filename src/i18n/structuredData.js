/* Locale-aware JSON-LD entry point. English graphs stay in src/seo/structuredData.js (unchanged); other languages are built in src/i18n/<locale>/structuredData.js. */
import { localizedJsonLd as es } from './es/structuredData.js'
import { localizedJsonLd as ar } from './ar/structuredData.js'

export function localizedJsonLd(locale, basePath, seo) {
  if (locale === 'es') return es(locale, basePath, seo)
  if (locale === 'ar') return ar(locale, basePath, seo)
  return undefined
}
