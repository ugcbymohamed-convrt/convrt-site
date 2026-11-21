/* Spanish money formatting. ALL CONVRT pricing stays in US dollars (owner decision); only the NUMBER FORMAT follows Spanish convention, so a Spanish
   reader is never left guessing which currency "$3,000" means: "3.000 USD" (thousands separator ".", currency code after the amount).
   Amounts always come from src/seo/businessKnowledge.js, never retyped. */

const groupEs = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** {amount:3000,currency:'USD'} → "3.000 USD";  {amount:937.5} → "937,50 USD" */
export function formatMoneyEs(m) {
  if (m.currency !== 'USD') throw new Error('formatMoneyEs: all CONVRT pricing is in USD')
  if (Number.isInteger(m.amount)) return `${groupEs(m.amount)} USD`
  const [whole, cents] = m.amount.toFixed(2).split('.')
  return `${groupEs(whole)},${cents} USD`
}

/** Whole-dollar per-unit price, like English pricePerVariation().text ("$200") → "200 USD" */
export const formatWholeUsdEs = (amount) => `${groupEs(Math.round(amount))} USD`
