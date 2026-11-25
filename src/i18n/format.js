/* Number formatting for stats that live in English notation in src/lib/siteStats.js ("1,200+", "40M+", "10.7M", "22K").
   The VALUE is never changed, only its notation for the reader: Spanish uses "." for thousands and "," for decimals, "mil" for K and "M" for millions; French
   uses a narrow no-break space for thousands and "," for decimals, "k" for thousands and "M" for millions ("1 200+", "10,7 M", "22 k").
   English returns the string untouched. */

const NUM = /^(\d[\d,]*(?:\.\d+)?)([KM]?)(x?)(\+?)$/

export function localizeStat(locale, text) {
  if (locale === 'ar') {
    // Arabic keeps Western digits and "," / "." separators (one notation for UAE and Saudi readers); only the unit changes: 22K → "22 ألف", 10.7M → "10.7 مليون", 5.28x → "5.28×".
    const a = String(text).match(NUM)
    if (!a) return text
    const [, raw, unit, times, plus] = a
    return `${raw}${unit === 'K' ? ' ألف' : unit === 'M' ? ' مليون' : ''}${times ? '×' : ''}${plus}`
  }
  if (locale === 'fr' && /^\d+%\+?$/.test(String(text))) return String(text).replace('%', '\u00a0%')
  if (locale !== 'es' && locale !== 'fr') return text
  const m = String(text).match(NUM)
  if (!m) return text
  const [, raw, unit, times, plus] = m
  const [whole, dec] = raw.replace(/,/g, '').split('.')
  const sep = locale === 'fr' ? '\u202f' : '.'
  const wholeLoc = whole.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
  const num = dec ? `${wholeLoc},${dec}` : wholeLoc
  const u = unit === 'K' ? (locale === 'fr' ? '\u00a0k' : ' mil') : unit === 'M' ? (locale === 'fr' ? '\u00a0M' : ' M') : ''
  return `${num}${u}${times}${plus}`
}
