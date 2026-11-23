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
}
