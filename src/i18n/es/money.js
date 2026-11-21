/* Spanish money notation. The AMOUNT is never computed here: CONVRT prices come from the approved Spanish pricing configuration (src/i18n/es/pricing.js, EUR); this file only
   formats a number the way a Spanish reader expects.

   EUR:  {amount:3000,currency:'EUR'} → "3.000 €"  (thousands separator ".", decimal ",", the euro sign after the amount, joined by a NON-BREAKING space so a price never splits across lines)
   USD:  {amount:3421.25,currency:'USD'} → "3.421,25 USD"  (only for a client's REAL reported result, which was earned in dollars and is never converted; no CONVRT price uses it) */

const groupEs = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const NBSP = ' '
const SUFFIX = { EUR: '€', USD: 'USD' }

export function formatMoneyEs(m) {
  const suffix = SUFFIX[m.currency]
  if (!suffix) throw new Error(`formatMoneyEs: unsupported currency ${m.currency}`)
  if (Number.isInteger(m.amount)) return `${groupEs(m.amount)}${NBSP}${suffix}`
  const [whole, cents] = m.amount.toFixed(2).split('.')
  return `${groupEs(whole)},${cents}${NBSP}${suffix}`
}
