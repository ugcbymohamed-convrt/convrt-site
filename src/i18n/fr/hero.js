import { CREATOR_SHOWCASE_PATH } from '../../config.js'

/* French H1 and secondary CTA of the UGC service hero (the only French service page). The English H1 is "Human-led UGC ads. Built for paid social. to convrt."; the French headline is
   NOT word-for-word. It follows the search intent of the page (the agency-buying query "agence UGC") and keeps the hero's mechanics: fixed lines, then a last line whose final word
   rolls. The server HTML holds only the first rolling word, so the indexable H1 is stable: "Agence UGC : des vidéos authentiques pour vos publicités."
   A non-breaking space keeps the colon attached to "UGC" (French typography puts a space before « : »). */
export const FR_HERO = {
  'ugc-h1': {
    lines: [['Agence', 'UGC :'], ['des', 'vidéos', 'authentiques']],
    lead: ['pour', 'vos'],
    words: ['publicités', 'campagnes', 'lancements'],
    sizer: 'lancements.',
    secondary: { label: 'Voir les exemples UGC', href: CREATOR_SHOWCASE_PATH },
  },
  /* The three other French service pages (no video stage: the hero is text-led, see UgcHero). Native headlines, not word for word. Each H1 carries its page's primary keyword
     (FR_PRIMARY_KEYWORDS in seo.js) and none borrows « agence UGC ». The server HTML holds only the first rolling word. The secondary button goes to the in-page section, never to a
     video gallery. A   keeps the colon attached to the word before it. */
  'spokesperson-h1': {
    lines: [['Vidéos', 'avec', 'porte-parole :'], ['de', 'vrais', 'présentateurs']],
    lead: ['pour'],
    words: ['convaincre', 'expliquer', 'présenter', 'démontrer'],
    sizer: 'convaincre.',
    secondary: { label: 'Voir comment nous travaillons', href: '#how-it-works' },
  },
  'saas-h1': {
    lines: [['Vidéos', 'explicatives', 'SaaS :'], ['conçues', 'pour', 'expliquer']],
    lead: ['et'],
    words: ['convaincre', 'engager', 'captiver'],
    sizer: 'convaincre.',
    secondary: { label: 'Voir les formats', href: '#saas-formats' },
  },
  'organic-h1': {
    lines: [['Vidéos', 'pour', 'les', 'réseaux', 'sociaux :'], ['du', 'contenu', 'organique', 'pensé']],
    lead: ['pour'],
    words: ['engager', 'inspirer', 'convaincre'],
    sizer: 'convaincre.',
    secondary: { label: 'Voir comment nous travaillons', href: '#how-it-works' },
  },
}
