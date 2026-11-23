import UgcGallery from '../ugc/UgcGallery.jsx'
import { CREATOR_SHOWCASE_PATH } from '../../config.js'
import { selectHomeCreators } from '../../content/portfolio.js'

/* THE ENGLISH HOMEPAGE'S "REAL CREATORS" CAROUSEL (after Services and How It Works).

   It is the same premium creator carousel the service pages use (components/ugc/UgcGallery.jsx: poster first, a video element and stream only after a tap, one video at a time, native horizontal
   scroll with arrows, drag, touch swipe and keyboard, progress bar, edge fades), fed with the eight approved English-language creator videos tagged `homeCreator` in src/content/portfolio.js
   (selectHomeCreators). Nothing here is a placeholder: with fewer than eight approved videos it shows fewer, and with none the section is absent. The standing note under the heading says these
   are independent creators' examples, never CONVRT productions (CREATOR_EXAMPLES_NOTE). The button goes to the existing Creator Showcase page. */
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
}

export default function HomeCreators() {
  return <UgcGallery items={selectHomeCreators()} config={HOME_CREATORS_GALLERY} />
}
