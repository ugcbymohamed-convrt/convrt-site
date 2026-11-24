/* Per-language EDITORIAL extras of the shared service-page components: short lines a language adds or replaces on top of the dictionary (the English source has no such line).
   Only languages that have extras are listed; a component asks `editorial(locale)?.X` and renders nothing when there is none, so English is never affected. */
import { ES_FAQ_TITLES, ES_SECTION_INTROS, ES_STAGE_TITLES, ES_FINAL_CTA } from './es/labels.js'
import { AR_SECTION_INTROS } from './ar/labels.js'

const EDITORIAL = {
  es: { FAQ_TITLES: ES_FAQ_TITLES, SECTION_INTROS: ES_SECTION_INTROS, STAGE_TITLES: ES_STAGE_TITLES, FINAL_CTA: ES_FINAL_CTA },
  ar: { SECTION_INTROS: AR_SECTION_INTROS }, // no "originally written in English" line: the Arabic reviews are shown as approved Arabic text (owner, 2026-11-25)
}
export const editorial = (locale) => EDITORIAL[locale] ?? null
