/* French typographic spacing, applied to every French dictionary value at lookup time (src/i18n/tr.js), so the dictionary files can be written with ordinary spaces:
   a NO-BREAK space goes before « : ; ? ! » » and after « « », so a punctuation mark never starts a line. Tokens such as {{price:key}} (no space before the colon) are untouched. */
const NBSP = ' '
export const frTypography = (text) => text.replace(/[  ]+([:;?!»])/g, `${NBSP}$1`).replace(/«[  ]+/g, `«${NBSP}`)
