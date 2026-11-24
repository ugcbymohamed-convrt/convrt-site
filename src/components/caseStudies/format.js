/* Notation helpers for the case studies. They change only HOW a figure is written for the reader (Spanish: "10,7 M", "14,2 %", "3.421,25 USD"), never its value.
   English returns the text exactly as authored, so the English pages are byte-identical. Call them at render time (the locale comes from the URL). */
import { currentLocale } from '../../i18n/locale.js'
import { DEFAULT_LOCALE } from '../../i18n/locales.js'
import { localizeStat } from '../../i18n/format.js'
import { formatMoneyEs } from '../../i18n/es/money.js'

export const NB = ' '
export const isEnglish = () => currentLocale() === DEFAULT_LOCALE

/* "10.7M" → "10,7 M", "5.28x" → "5,28x", "295K" → "295 mil". */
export const stat = (text) => localizeStat(currentLocale(), text)

/* A percentage: "14.2%" → "14,2 %" (non-breaking space, as on the rest of the Spanish site). */
export const pct = (n) => (isEnglish() ? `${n}%` : `${String(n).replace('.', ',')}${NB}%`)

/* A USD amount the client reported ({ en: '$3,421.25', usd: 3421.25 }): English as authored; Spanish "3.421,25 USD". Never converted to another currency. */
export const usd = (m) => (isEnglish() ? m.en : formatMoneyEs({ amount: m.usd, currency: 'USD' }))

/* Class names: the English string passes through unchanged when every extra is falsy (no stray spaces), so Spanish-only layout tweaks never alter the English HTML. */
export const cx = (...parts) => parts.filter(Boolean).join(' ')
