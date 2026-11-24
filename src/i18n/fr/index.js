/* The French dictionary: English string → French, merged from the per-area files. At present it holds the shared page shell (menu, footer, consent) and the Referral Partner Program page,
   the only French page on this branch (docs/multilingual-referrals-fr-ar.md). The full French translation lives on its own branch; merge its dictionaries here when that branch is released. */
import shell from './dict-shell.js'
import referrals from './dict-referrals.js'

export default { ...shell, ...referrals }
export const PARTS = { shell, referrals }
