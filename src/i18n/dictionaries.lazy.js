/* BROWSER version of src/i18n/dictionaries.js (the build swaps it in for the client bundle only: vite.config.js → lazyDictionaries()).

   The server render, the build and the tests import the real dictionaries.js, which holds all three translated dictionaries (≈ 885 KB of source). Shipping all of
   them to every visitor made the entry script 1.18 MB (technical audit F5-2). Here a page loads ONLY its own language's dictionary, as one separate chunk
   (`dict-es`, `dict-fr`, `dict-ar`), BEFORE React hydrates (src/main.jsx awaits ensureDictionary()), so the first client render equals the server render and
   there is no untranslated flash and no hydration mismatch. English visitors download none. The static HTML of translated pages preloads their chunk
   (vite-plugin-static-routes.js), so the request starts with the HTML instead of after the entry script has run.

   A language switch is an ordinary link to another URL (src/i18n/switch.js), so a page never needs two dictionaries. */

export const DICTIONARIES = {}

const LOADERS = {
  es: () => import('./es/index.js'),
  fr: () => import('./fr/index.js'),
  ar: () => import('./ar/index.js'),
}

/* Resolves once the dictionary of `locale` is available to translate(). Safe to call for English and for a locale that is already loaded. */
export async function ensureDictionary(locale) {
  if (DICTIONARIES[locale] || !LOADERS[locale]) return
  DICTIONARIES[locale] = (await LOADERS[locale]()).default
}
