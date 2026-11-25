import UgcGallery from '../ugc/UgcGallery.jsx'
import { CREATOR_SHOWCASE_PATH } from '../../config.js'
import { selectHomeCreators } from '../../content/portfolio.js'
import { T, useTr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'

/* THE ENGLISH HOMEPAGE'S "REAL CREATORS" CAROUSEL (after Services and How It Works).

   It is the same premium creator carousel the service pages use (components/ugc/UgcGallery.jsx: poster first, a video element and stream only after a tap, one video at a time, native horizontal
   scroll with arrows, drag, touch swipe and keyboard, progress bar, edge fades), fed with the eight approved English-language creator videos tagged `homeCreator` in src/content/portfolio.js
   (selectHomeCreators). Nothing here is a placeholder: with fewer than eight approved videos it shows fewer, and with none the section is absent. The standing « independent creators' examples » note was removed in every language (owner, 2026-11-24); provenance stays in the data. The button goes to the existing Creator Showcase page. */
function CreatorsTitle() {
  const tr = useTr()
  const stacked = currentLocale() !== 'en' // the longer French / Spanish sentences read as two clean lines; English keeps its single balanced block
  return <span className="block text-balance">{`${tr('Real creators. Real presence.')} `}<span className={stacked ? 'block text-lime' : 'text-lime'}>{tr('Ready for your brand.')}</span></span>
}
export const HOME_CREATORS_GALLERY = {
  id: 'home-creators',
  headingId: 'home-creators-heading',
  eyebrow: 'Our creators',
  title: <CreatorsTitle />, // a component (not literal text) so every language translates its two sentences by lookup
  intro: 'Explore the people and creative styles behind our videos.',
  ariaLabel: 'Creator videos. Scroll sideways to see more.',
  badge: 'Creator',
  cta: { label: 'Explore All Creators', href: CREATOR_SHOWCASE_PATH },
  track: 'home_creators',
  samplePortraits: null,
  sampleNote: '',
  hideNote: true,
}

/* The Arabic homepage's carousel: the same component and design. The heading is built from <T> so the JSX translates; every other line is a string the dictionary translates (UgcGallery -> localizeConfig). */
export const HOME_CREATORS_GALLERY_AR = {
  ...HOME_CREATORS_GALLERY,
  title: <span className="block text-balance"><T>Real creators. Real presence.</T>{' '}<span className="block text-lime sm:inline"><T>Ready for your brand.</T></span></span>,
}

export default function HomeCreators() {
  return <UgcGallery items={selectHomeCreators()} config={currentLocale() === 'ar' ? HOME_CREATORS_GALLERY_AR : HOME_CREATORS_GALLERY} />
}
