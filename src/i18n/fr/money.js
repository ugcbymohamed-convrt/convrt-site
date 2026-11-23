/* French money notation. The AMOUNT is never computed here: CONVRT prices come from the approved French pricing configuration (src/i18n/fr/pricing.js, EUR, the same
   amounts the owner approved for the Spanish site); this file only formats a number the way a French reader expects.

   EUR:  {amount:3000,currency:'EUR'} → "3 000 €"   (narrow no-break space between thousands, NO-BREAK space before the euro sign, so a price never splits across lines)
   USD:  {amount:3421.25,currency:'USD'} → "3 421,25 USD"   (only for a client's REAL reported result, which was earned in dollars and is never converted; no CONVRT price uses it) */

const NNBSP = ' '
const NBSP = ' '
const groupFr = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP)
const SUFFIX = { EUR: '€', USD: 'USD' }

export function formatMoneyFr(m) {
  const suffix = SUFFIX[m.currency]
  if (!suffix) throw new Error(`formatMoneyFr: unsupported currency ${m.currency}`)
  if (Number.isInteger(m.amount)) return `${groupFr(m.amount)}${NBSP}${suffix}`
  const [whole, cents] = m.amount.toFixed(2).split('.')
  return `${groupFr(whole)},${cents}${NBSP}${suffix}`
}
