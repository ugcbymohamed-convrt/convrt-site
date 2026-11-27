import ENGLISH_ABOUT from '../../content/about/english.js'
import AboutLayout from './AboutLayout.jsx'

/* ABOUT, English (/about): the shared premium layout (AboutLayout.jsx) fed with the unchanged English words (src/content/about/english.js, an adapter over TRUST_CONTENT.about in src/content/trustPages.js). */
export default function EnglishAbout() {
  return <AboutLayout content={ENGLISH_ABOUT} locale="en" />
}
