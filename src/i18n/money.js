/* Money in the page's language. English: the business data's USD price in English notation ("$3,000"). Any other language: THAT language's own approved price for the same item,
   looked up by the business-data price object (src/i18n/pricing.js); never the USD amount, never a conversion. formatMoney() in src/seo/businessKnowledge.js stays English-notation
   (it also builds the English keys of the dictionary and the English JSON-LD). */
import { formatMoney } from '../seo/businessKnowledge.js'
import { currentLocale } from './locale.js'
import { DEFAULT_LOCALE } from './locales.js'
import { priceOf, formatPrice } from './pricing.js'

export const money = (m, locale = currentLocale()) => (locale === DEFAULT_LOCALE ? formatMoney(m) : formatPrice(locale, priceOf(locale, m)))
