/* LOCALE EDITORIAL DATA. One lookup that says, for each non-English language, which hand-written editorial pieces exist (the headings, intros and notes that are NOT word-for-word
   translations of an English string) and how the portfolio vocabulary reads. Components ask `editorial(locale)` instead of testing for a particular language, so a new language
   needs one entry here, not a new `if` in every component. English has no entry: the English pages are untouched by construction. */

import { currentLocale } from './locale.js'
import * as ES from './es/labels.js'
import * as FR from './fr/labels.js'
import { formatMoneyEs } from './es/money.js'
import { formatMoneyFr } from './fr/money.js'
import { FR_QUOTE_TRANSLATIONS, FR_QUOTE_LABELS } from './fr/quotes.js'

export const EDITORIAL = {
  es: {
    languageLabels: ES.ES_LANGUAGE_LABELS, industryLabels: ES.ES_INDUSTRY_LABELS, typeLabels: ES.ES_TYPE_LABELS, productionLabels: ES.ES_PRODUCTION_LABELS,
    caption: ES.captionEs, faqTitles: ES.ES_FAQ_TITLES, stageTitles: ES.ES_STAGE_TITLES, finalCta: ES.ES_FINAL_CTA, sectionIntros: ES.ES_SECTION_INTROS,
    testimonialsNote: ES.ES_TESTIMONIALS_NOTE, formatMoney: formatMoneyEs, homeLabel: 'CONVRT — inicio', quoteLang: 'en',
    turnaround: (a, b) => `${a.days} días laborables para ${a.name} y ${b.days} para ${b.name}, a partir de la aprobación de los conceptos y guiones, no desde el pago.`,
  },
  fr: {
    languageLabels: FR.FR_LANGUAGE_LABELS, industryLabels: FR.FR_INDUSTRY_LABELS, typeLabels: FR.FR_TYPE_LABELS, productionLabels: FR.FR_PRODUCTION_LABELS,
    caption: FR.captionFr, faqTitles: FR.FR_FAQ_TITLES, stageTitles: FR.FR_STAGE_TITLES, finalCta: FR.FR_FINAL_CTA, sectionIntros: FR.FR_SECTION_INTROS,
    testimonialsNote: FR.FR_TESTIMONIALS_NOTE, formatMoney: formatMoneyFr, homeLabel: 'CONVRT — accueil', quoteLang: 'en',
    fallbackNote: 'en anglais',
    quoteTranslations: FR_QUOTE_TRANSLATIONS, quoteLabels: FR_QUOTE_LABELS,
    turnaround: (a, b) => `${a.days} jours ouvrés pour ${a.name} et ${b.days} pour ${b.name}, à compter de la validation des concepts et des scripts, et non du paiement.`,
  },
}

/* The editorial data of a language, or null for English (and any language without data). */
export const editorial = (locale = currentLocale()) => EDITORIAL[locale] ?? null
