import { TRUST_CONTENT } from '../trustPages.js'

/* ENGLISH About page content, in the SAME normalized shape as src/content/about/{es,fr,ar}.js (see src/components/about/AboutLayout.jsx).

   THE ENGLISH WORDS ARE UNCHANGED. Every sentence comes from the existing source, TRUST_CONTENT.about in src/content/trustPages.js (the GEO-clarity text), found by its heading, so the tests that pin that text, and the
   JSON-LD built from it, keep reading the same words. Only the layout-only labels (the badges, the figure captions, the two button labels) are written here: they are the English counterparts of the labels the other
   languages carry in their own content modules. No new claim is added. */

const about = TRUST_CONTENT.about
const section = (heading) => {
  const s = about.sections.find((x) => x.heading === heading)
  if (!s) throw new Error(`About: section "${heading}" is missing from TRUST_CONTENT.about`)
  return s
}
const strings = (s) => s.body.filter((b) => typeof b === 'string')
const list = (s) => s.body.find((b) => typeof b !== 'string').list

const GLANCE = section('CONVRT Studio at a glance')
const WHAT = section('What we do')
const FOUNDER = section('A founder-led studio')
const EXPERIENCE = section("The founder's experience")
const CREATORS = section('How we work with creators')
const MARKETS = section('Markets, production and languages')
const SCOPE = section('What we provide, and what we do not')
const CLOSING = section("Let's build your next great creative.")

/* A fragment that followed a colon in the text version starts a card, so its first letter is capitalised (display only). */
const cap = (s) => (/^[a-z]/.test(s) ? s[0].toUpperCase() + s.slice(1) : s)
/* "Label: text" → { label, text } (the label is everything before the first colon). */
const splitLabel = (s) => { const i = s.indexOf(': '); return { label: s.slice(0, i), text: cap(s.slice(i + 2)) } }
/* "Title. Rest of the paragraph." → { title, text } (the English card prints the title followed by its full stop, `mark`; the localized titles are printed as supplied). */
const splitTitle = (s) => { const i = s.indexOf('. '); return { title: s.slice(0, i), mark: '.', text: s.slice(i + 2) } }

export default {
  badge: 'About CONVRT',
  h1: { lead: 'About', accent: 'CONVRT Studio' },
  intro: about.intro,
  glance: { heading: GLANCE.heading, items: list(GLANCE).map(splitLabel) },
  what: {
    badge: WHAT.heading,
    lead: strings(WHAT)[0],
    services: list(WHAT).map((li) => { const m = li.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]: (.*)$/); return { name: m[1], href: m[2], text: cap(m[3]) } }),
    outro: strings(WHAT)[1],
  },
  founder: { badge: 'Behind CONVRT', heading: FOUNDER.heading, paragraphs: strings(FOUNDER) },
  experience: {
    heading: EXPERIENCE.heading,
    labels: { videos: 'videos produced', views: 'views generated', clients: 'clients served', returningClients: 'returning clients' },
    disclaimer: strings(EXPERIENCE)[0],
  },
  creators: { badge: 'Real people on camera', heading: CREATORS.heading, paragraphs: strings(CREATORS) },
  markets: { badge: 'Without borders', heading: MARKETS.heading, paragraphs: strings(MARKETS) },
  scope: { badge: 'Scope', heading: SCOPE.heading, items: strings(SCOPE).map(splitTitle) },
  closing: { badge: 'Work with us', heading: CLOSING.heading, text: strings(CLOSING)[0], primary: 'Get 5 Free Ad Concepts', secondary: 'Explore our services' },
}
