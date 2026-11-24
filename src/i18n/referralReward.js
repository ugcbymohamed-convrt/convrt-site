/* REFERRAL PROGRAM AMOUNTS PER LANGUAGE (one place; the dictionaries carry tokens, never a typed amount).

   The English referral page defines the program in US dollars: Standard Referral Partner $150 (cash or production credit); Agency & Strategic Partner 10 % of the first qualifying
   project payment, capped at $500 per referred client (docs/referral-program-setup.md, src/components/referrals/*).

   EUR markets (Spanish, French): the owner asked in chat (2026-11-24) for the Standard reward to read 150 € instead of $150 and CONFIRMED it as approved for these markets. The 10 % commission, its cap and the eligibility terms are NOT
   changed (the cap stays 500 USD, the example stays 5,000 USD). This is a locale-specific commercial offer: the central policy documents (docs/referral-program-setup.md, docs/partner-kit.md,
   the tracker template) still say $150 only, so the euro payout setup (kit, tracker) is an operations to-do recorded in docs/multilingual-referrals-fr-ar.md.
   English and Arabic keep the US-dollar amounts exactly as approved.

   Tokens used in dictionary values:  {{reward:standard}}  {{reward:cap}}  {{reward:example}} */

const NB = ' '
export const REFERRAL_REWARDS = {
  es: { standard: `150${NB}€`, cap: `500${NB}USD`, example: `5.000${NB}USD` },
  fr: { standard: `150${NB}€`, cap: `500${NB}USD`, example: `5${NB}000${NB}USD` },
}

/* The big figure on the Standard reward card. English and Arabic: the original "$150". */
export const standardRewardCard = (locale) => (REFERRAL_REWARDS[locale] ? REFERRAL_REWARDS[locale].standard : '$150')

export const hasRewardTokens = (text) => text.includes('{{reward:')
export function resolveRewardTokens(locale, text) {
  const t = REFERRAL_REWARDS[locale]
  return text.replace(/\{\{reward:(\w+)\}\}/g, (_, k) => {
    if (!t || !(k in t)) throw new Error(`no referral reward "${k}" for ${locale}`)
    return t[k]
  })
}
