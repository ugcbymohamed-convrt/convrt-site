/* Generates the USD → EUR PRICING APPROVAL TABLE for the Spanish site from the same list the site uses (src/i18n/pricing.js), so it can never miss a price.
   The EUR column is BLANK on purpose: only the owner sets a euro price (no conversion, no reuse of the USD number).
       node scripts/es-eur-approval-table.mjs            print the table (markdown)
       node scripts/es-eur-approval-table.mjs --write    also write docs/multilingual-spanish-eur-pricing-approval.csv
   After approval: type each amount into src/i18n/es/pricing.js, set status 'approved' + approvedBy + approvedOn. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SPRINT, SPRINT_PLUS, ORGANIC, RAW_FOOTAGE, formatMoney, packageEquation, pricePerVariation } from '../src/seo/businessKnowledge.js'
import { PRICE_ITEMS } from '../src/i18n/pricing.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const TYPE = (k) => (k.includes('.ext') ? 'Usage-rights extension' : k === 'rawFootage' ? 'Add-on' : k.startsWith('organic') ? 'Organic package' : 'Paid package')
const COVERS = (k) => {
  const pkg = k.startsWith('sprintPlus') ? SPRINT_PLUS : k.startsWith('sprint') ? SPRINT : null
  if (k.includes('.ext')) return `Extends usage rights for the ENTIRE creative batch (${packageEquation(pkg)}) by ${k.match(/ext(\d+)/)[1]} months; excludes VAT`
  if (pkg) return `${packageEquation(pkg)}; ${pkg.usageMonthsIncluded} months of usage rights included; ${pkg.turnaroundBusinessDays} business days; up to ${pkg.maxCreators} creators; ${k.endsWith('monthly') ? 'monthly billing (6-month initial commitment)' : 'one-off, no recurring commitment'}`
  if (k === 'rawFootage') return `Optional add-on per ${RAW_FOOTAGE.per}, only alongside finished edited videos`
  const o = k.startsWith('organicLight') ? ORGANIC.light : ORGANIC.growth
  return `${o.cadence}; monthly (initial commitment as published)`
}
const WHERE = (k) => (k.includes('.ext') ? 'Pricing: usage-rights table; Pricing FAQ' : k === 'rawFootage' ? 'Pricing: details list; Pricing and UGC FAQs; Pricing JSON-LD' : k.startsWith('organic') ? 'Pricing cards; Organic page packages; Pricing and Organic FAQs; JSON-LD' : 'Pricing cards; UGC page; Spokesperson FAQ; FAQs; JSON-LD Offers; UGC meta description (monthly Sprint)')
const rows = PRICE_ITEMS.map((i, n) => ({ n: n + 1, key: i.key, item: i.label, type: TYPE(i.key), usd: formatMoney(i.usd), covers: COVERS(i.key), where: WHERE(i.key) }))

const derived = PRICE_ITEMS.filter((i) => i.perVariationOf).map((i) => ({ key: i.key, usd: pricePerVariation(i.perVariationOf, i.key.endsWith('monthly') ? 'monthly' : 'oneOff').text, divisor: i.perVariationOf.variations }))

if (process.argv.includes('--write')) {
  const esc = (s) => `"${String(s).replace(/"/g, '""')}"`
  const csv = [['#', 'Key', 'Item', 'Type', 'Current English price (USD)', 'What it covers (unchanged)', 'Where it appears (Spanish)', 'APPROVED EUR AMOUNT (owner fills in)', 'Notes']]
    .concat(rows.map((r) => [r.n, r.key, r.item, r.type, r.usd, r.covers, r.where, '', '']))
    .map((r) => r.map(esc).join(',')).join('\n')
  fs.writeFileSync(path.join(ROOT, 'docs/multilingual-spanish-eur-pricing-approval.csv'), csv + '\n')
}
console.log('| # | Item | Type | Current USD (English site) | Approved EUR (owner) |\n|---|---|---|---|---|')
for (const r of rows) console.log(`| ${r.n} | ${r.item} | ${r.type} | ${r.usd} |  |`)
console.log('\nDerived (computed from the approved EUR amount ÷ finished ad versions, rounded to whole euros; shown for confirmation, not separately priced):')
for (const d of derived) console.log(`- ${d.key}: today ${d.usd} per variation in USD → EUR amount ÷ ${d.divisor}`)
