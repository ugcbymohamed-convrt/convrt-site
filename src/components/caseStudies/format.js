/* Notation helpers for the case studies. They change only HOW a figure is written for the reader (Spanish: "10,7 M", "14,2 %", "3.421,25 USD"), never its value.
   English returns the text exactly as authored, so the English pages are byte-identical. Call them at render time (the locale comes from the URL). */
import { createElement } from 'react'
import { currentLocale } from '../../i18n/locale.js'
import { DEFAULT_LOCALE } from '../../i18n/locales.js'
import { localizeStat } from '../../i18n/format.js'
import { formatMoneyEs } from '../../i18n/es/money.js'
import { formatMoneyFr } from '../../i18n/fr/money.js'
import { formatMoneyAr } from '../../i18n/ar/money.js'

export const NB = ' '
export const isEnglish = () => currentLocale() === DEFAULT_LOCALE

/* "10.7M" → "10,7 M", "5.28x" → "5,28x", "295K" → "295 mil". */
export const stat = (text) => localizeStat(currentLocale(), text)

/* A percentage: "14.2%" → "14,2 %" (non-breaking space, as on the rest of the Spanish site). */
export const pct = (n) => (isEnglish() ? `${n}%` : `${String(n).replace('.', ',')}${NB}%`)

/* A USD amount the client reported ({ en: '$3,421.25', usd: 3421.25 }): English as authored; Spanish "3.421,25 USD"; French "3 421,25 USD" (narrow no-break space, fr/money.js); Arabic "$3,421.25" (Western digits, dollar sign first, like the rest of the Arabic site).
   Never converted to another currency. */
export const usd = (m) => {
  if (isEnglish()) return m.en
  const locale = currentLocale()
  const money = { amount: m.usd, currency: 'USD' }
  return locale === 'ar' ? formatMoneyAr(money) : locale === 'fr' ? formatMoneyFr(money) : formatMoneyEs(money)
}

/* Class names: the English string passes through unchanged when every extra is falsy (no stray spaces), so Spanish-only layout tweaks never alter the English HTML. */
/* A figure written with a trailing sign ("160+", "5.28×", "5.10× ROAS") must keep its authored order inside right-to-left text: the bidi algorithm would otherwise move the sign to the other side of the digits ("×5.28").
   In Arabic the figure is wrapped in a left-to-right isolate; every other language returns the text untouched (identical HTML). */
export const ltrRun = (text) => (currentLocale() === 'ar' ? createElement('bdi', { dir: 'ltr' }, text) : text)

export const cx = (...parts) => parts.filter(Boolean).join(' ')
