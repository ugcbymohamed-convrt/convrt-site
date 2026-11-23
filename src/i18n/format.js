/* Number formatting for stats that live in English notation in src/lib/siteStats.js ("1,200+", "40M+", "10.7M", "22K").
   The VALUE is never changed, only its notation for the reader: Spanish uses "." for thousands and "," for decimals, "mil" for K and "M" for millions.
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
  if (locale !== 'es') return text
  const m = String(text).match(NUM)
  if (!m) return text
  const [, raw, unit, times, plus] = m
  const [whole, dec] = raw.replace(/,/g, '').split('.')
  const wholeEs = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const num = dec ? `${wholeEs},${dec}` : wholeEs
  const u = unit === 'K' ? ' mil' : unit === 'M' ? ' M' : ''
  return `${num}${u}${times}${plus}`
}
