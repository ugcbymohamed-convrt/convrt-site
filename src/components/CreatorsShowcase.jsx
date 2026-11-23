import { CREATOR_SHOWCASE_PATH } from '../config.js'
import UgcGallery from './ugc/UgcGallery.jsx'
import { homeCreatorVideos } from '../content/homeCreators.js'
import { currentLocale } from '../i18n/locale.js'

/* SPANISH HOMEPAGE: "Creadores que destacan. A tu alcance." A premium carousel of eight real Spanish-language creator videos (src/content/homeCreators.js), built on the same gallery the service pages
   use: portrait poster cards, ONE player only after a click (nothing but same-origin posters loads up front), swipe/drag/arrow-key scrolling, an honest "independent creators" note and a link to the full
   Creator Showcase. English keeps its case-study panels (src/components/CaseStudies.jsx), so this renders nothing there. The English strings are the dictionary keys (src/i18n/es/dict-home.js). */

const CONFIG = {
  id: 'creators',
  headingId: 'creators-heading',
  eyebrow: 'Our creators',
  title: 'Creators who stand out. Within reach.',
  intro: 'Discover real creators and videos that bring brands to life.',
  ariaLabel: 'Spanish creator videos. Scroll sideways to see more.',
  badge: 'UGC',
  badgeByType: true,
  cta: { label: 'Meet more creators', href: CREATOR_SHOWCASE_PATH },
  track: 'home_creators',
  samplePortraits: null,
}

export default function CreatorsShowcase() {
  const locale = currentLocale()
  if (locale === 'en') return null
  const items = homeCreatorVideos(locale)
  if (!items.length) return null
  return <UgcGallery items={items} config={CONFIG} />
}
