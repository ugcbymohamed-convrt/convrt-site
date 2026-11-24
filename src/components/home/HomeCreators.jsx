import UgcGallery from '../ugc/UgcGallery.jsx'
import { CREATOR_SHOWCASE_PATH } from '../../config.js'
import { selectHomeCreators } from '../../content/portfolio.js'
import { T } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'

/* THE ENGLISH HOMEPAGE'S "REAL CREATORS" CAROUSEL (after Services and How It Works).

   It is the same premium creator carousel the service pages use (components/ugc/UgcGallery.jsx: poster first, a video element and stream only after a tap, one video at a time, native horizontal
   scroll with arrows, drag, touch swipe and keyboard, progress bar, edge fades), fed with the eight approved English-language creator videos tagged `homeCreator` in src/content/portfolio.js
   (selectHomeCreators). Nothing here is a placeholder: with fewer than eight approved videos it shows fewer, and with none the section is absent. The long standing note under the heading (CREATOR_EXAMPLES_NOTE) was removed here on the owner's
   instruction (Nov 2026); the videos remain independent creators' examples, never CONVRT productions, and each video's details carry its credit. The button goes to the existing Creator Showcase page. */
export const HOME_CREATORS_GALLERY = {
  id: 'home-creators',
  headingId: 'home-creators-heading',
  eyebrow: 'Our creators',
  title: <span className="block text-balance">Real creators. Real presence. <span className="text-lime">Ready for your brand.</span></span>,
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
