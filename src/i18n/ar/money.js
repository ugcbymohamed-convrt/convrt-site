/* Arabic-site money notation. CONVRT's Arabic site shows the SAME approved USD prices as the English site (owner decision, Nov 2026: one shared Arabic website for the UAE and
   Saudi Arabia, priced in USD; no AED or SAR, no exchange rate, no IP-based currency). This file only formats a number: it never computes or converts an amount.

   {amount:3000,currency:'USD'} → "$3,000"    {amount:937.5,currency:'USD'} → "$937.50"

   Western digits and the dollar sign before the figure keep a price visually intact inside right-to-left text (the sign and the digits form one left-to-right run; see docs/multilingual-arabic.md). */

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export function formatMoneyAr(m) {
  if (m.currency !== 'USD') throw new Error(`formatMoneyAr: the Arabic site shows USD only (got ${m.currency})`)
  if (Number.isInteger(m.amount)) return `$${group(m.amount)}`
  const [whole, cents] = m.amount.toFixed(2).split('.')
  return `$${group(whole)}.${cents}`
}
