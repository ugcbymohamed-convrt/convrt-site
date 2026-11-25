import { localizeConfig } from './content.js'
import { ES_HERO } from './es/hero.js'
import { FR_HERO } from './fr/hero.js'
import { AR_HERO } from './ar/hero.js'

const BY_LOCALE = { es: ES_HERO, fr: FR_HERO, ar: AR_HERO }

/* A service-page hero config in the page's language (English: the config itself). Text goes through the dictionary; the H1 words come from src/i18n/<locale>/hero.js. */
export function localizeHero(config, locale) {
  if (locale === 'en') return config
  const overrides = BY_LOCALE[locale]?.[config.id]
  if (!overrides) throw new Error(`localizeHero: no ${locale} H1 for hero "${config.id}"`)
  return localizeConfig(config, locale, overrides)
}
