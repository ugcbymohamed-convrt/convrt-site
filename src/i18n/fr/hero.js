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

/* THE FRENCH HOMEPAGE HERO: the English hero's structure exactly (headline, description, offer line, two CTAs, then the free offers underneath), with short French copy.
   One-line offer label (« 5 concepts publicitaires offerts »): five personalized ad CONCEPTS, never five produced videos. CTA « Recevoir 5 concepts gratuits » (the label of primaryAction('fr'), in
   dict-shell.js). The 1 free video offer is the real, translated application; the 10 free hooks have no French version yet, so that card is shown as « Bientôt disponible » and is not a link. */
export const FR_HOME_HERO = {
  offerLine: ['5 concepts publicitaires', 'offerts'], // the second part is set in lime
  offersLabel: 'Pas encore prêt ? Deux autres façons de commencer, gratuitement.',
  offers: {
    video: { title: ['1 vidéo', 'GRATUITE'], description: 'Testez notre production sans risque.', cta: 'Voir si vous êtes éligible' },
    hooks: { title: ['10 hooks pub', 'GRATUITS'], description: 'Des accroches inédites pour vos prochaines pubs.', cta: 'Bientôt disponible' },
  },
}
