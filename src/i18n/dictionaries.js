/* Merges the per-area dictionaries of each locale. English has none (the English text IS the key). */
import es from './es/index.js'
import fr from './fr/index.js'
import ar from './ar/index.js'

export const DICTIONARIES = { es, fr, ar }

/* The browser build replaces this module with dictionaries.lazy.js, which loads one language on demand. Here (server render, build, tests) everything is loaded
   already, so this is a no-op with the same name. */
export const ensureDictionary = async () => {}
