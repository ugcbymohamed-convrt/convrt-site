/* LANGUAGE PREFERENCE: the one small first-party record of the language a visitor chose on purpose.

   • Key `convrt_language` in the browser's localStorage (kept across ordinary restarts, never sent to a server, listed in the Privacy Policy's "Browser storage we use").
   • Value: a language code the visitor picked ('en' | 'es') in the language selector or in the language suggestion, or 'dismissed' (they closed the suggestion without choosing).
     Any stored value means "do not suggest a language again".
   • If localStorage is blocked, sessionStorage is tried (the answer is then remembered for the browser session only); if both are blocked nothing is remembered and nothing breaks.
   • It never changes a page, a redirect or what a crawler sees: the language of a page always comes from its URL (src/i18n/locale.js). It is only read to decide whether to offer a suggestion.
   • No IP address, country or identifier is stored. */

export const LANGUAGE_STORAGE_KEY = 'convrt_language'
export const DISMISSED = 'dismissed'
const VALID = /^([a-z]{2}|dismissed)$/

const store = (win, kind) => { try { return win?.[kind] ?? null } catch { return null } }

/* The stored choice ('en', 'es', 'dismissed'), or null when there is none or storage is unavailable. */
export function readLanguageChoice(win = typeof window === 'undefined' ? undefined : window) {
  for (const kind of ['localStorage', 'sessionStorage']) {
    try {
      const v = store(win, kind)?.getItem(LANGUAGE_STORAGE_KEY)
      if (v && VALID.test(v)) return v
    } catch { /* blocked storage: treated as "nothing stored" */ }
  }
  return null
}

function write(value, win) {
  for (const kind of ['localStorage', 'sessionStorage']) {
    try {
      const s = store(win, kind)
      if (!s) continue
      s.setItem(LANGUAGE_STORAGE_KEY, value)
      return true
    } catch { /* try the next storage */ }
  }
  return false
}

/* The visitor chose a language on purpose (selector link or the suggestion's buttons). Returns whether it could be remembered. */
export function rememberLanguage(code, win = typeof window === 'undefined' ? undefined : window) {
  return /^[a-z]{2}$/.test(code) ? write(code, win) : false
}

/* The visitor closed the suggestion without choosing. */
export const rememberDismissal = (win = typeof window === 'undefined' ? undefined : window) => write(DISMISSED, win)
