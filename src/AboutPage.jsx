import { currentLocale } from './i18n/locale.js'
import EnglishAbout from './components/about/EnglishAbout.jsx'
import AboutLayout from './components/about/AboutLayout.jsx'
import ABOUT_ES from './content/about/es.js'
import ABOUT_FR from './content/about/fr.js'
import ABOUT_AR from './content/about/ar.js'

/* ABOUT (/about, /es/about, /fr/about, /ar/about): ONE premium layout (src/components/about/AboutLayout.jsx) in four languages.
   English: the unchanged English words (src/content/about/english.js over TRUST_CONTENT.about in src/content/trustPages.js).
   Spanish, French, Arabic: the owner's professionally localized copy, copied verbatim (src/content/about/es.js, fr.js, ar.js; supplied 27 Nov 2026). Change those words only when the owner supplies new text.

   Rules kept (CLAUDE.md, GEO Work Packages 1-2): the four figures are the FOUNDER's combined professional experience and the disclosure is always printed under them; no offices, awards, ratings, team members,
   certifications or client claims are added; multilingual production is a capability, not a promise that every creator speaks every language. */

const CONTENT = { es: ABOUT_ES, fr: ABOUT_FR, ar: ABOUT_AR }

export default function AboutPage() {
  const locale = currentLocale()
  if (locale === 'en' || !CONTENT[locale]) return <EnglishAbout />
  return <AboutLayout content={CONTENT[locale]} locale={locale} />
}
