/* Money in the page's language. The AMOUNT and the CURRENCY are always the business data's (USD); only the notation follows the reader ("$3,000" / "3.000 USD").
   formatMoney() in src/seo/businessKnowledge.js stays English-notation (it also builds the English keys of the dictionary and the English JSON-LD). */
import { formatMoney } from '../seo/businessKnowledge.js'
import { formatMoneyEs } from './es/money.js'
import { currentLocale } from './locale.js'

export const money = (m, locale = currentLocale()) => (locale === 'es' ? formatMoneyEs(m) : formatMoney(m))
