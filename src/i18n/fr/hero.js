import { CREATOR_SHOWCASE_PATH } from '../../config.js'

/* French H1 and secondary CTA of the UGC service hero (the only French service page). The English H1 is "Human-led UGC ads. Built for paid social. to convrt."; the French headline is
   NOT word-for-word. It follows the search intent of the page (the agency-buying query "agence UGC") and keeps the hero's mechanics: fixed lines, then a last line whose final word
   rolls. The server HTML holds only the first rolling word, so the indexable H1 is stable: "Agence UGC : des vidéos authentiques pour vos publicités."
   A non-breaking space keeps the colon attached to "UGC" (French typography puts a space before « : »). */
export const FR_HERO = {
  'ugc-h1': {
    lines: [['Agence', 'UGC :'], ['des', 'vidéos', 'qui']],
    lead: [],
    words: ['captent l’attention', 'marquent les esprits', 'donnent envie'],
    sizer: 'marquent les esprits.',
    secondary: { label: 'Explorer les vidéos UGC', href: CREATOR_SHOWCASE_PATH },
  },
  /* The three other French service pages (no video stage: the hero is text-led, see UgcHero). Native headlines, not word for word. Each H1 carries its page's primary keyword
     (FR_PRIMARY_KEYWORDS in seo.js) and none borrows « agence UGC ». The server HTML holds only the first rolling word. The secondary button goes to the in-page section, never to a
     video gallery. A   keeps the colon attached to the word before it. */
  'spokesperson-h1': {
    lines: [['Vidéos', 'Spokesperson :'], ['donnez', 'un', 'visage']],
    lead: ['à'],
    words: ['votre message', 'votre marque', 'votre produit'],
    sizer: 'votre message.',
    secondary: { label: 'Découvrir notre méthode', href: '#how-it-works' },
  },
  'saas-h1': {
    lines: [['Vidéos', 'SaaS :'], ['rendez', 'votre', 'produit']],
    lead: ['facile', 'à'],
    words: ['comprendre', 'expliquer', 'essayer'],
    sizer: 'comprendre.',
    secondary: { label: 'Voir les formats', href: '#saas-formats' },
  },
  'organic-h1': {
    lines: [['Des', 'vidéos', 'pour', 'les', 'réseaux', 'sociaux'], ['qui', 'donnent', 'envie', 'de', 'suivre']],
    lead: [],
    words: ['votre marque', 'vos idées', 'votre expertise'],
    sizer: 'votre expertise.',
    secondary: { label: 'Découvrir notre méthode', href: '#how-it-works' },
  },
}

/* THE FRENCH HOMEPAGE HERO: the English hero's structure exactly (headline, description, offer line, two CTAs, then the free offers underneath), with short French copy.
   One-line offer label (« 5 concepts publicitaires offerts »): five personalized ad CONCEPTS, never five produced videos. CTA « Recevoir 5 concepts gratuits » (the label of primaryAction('fr'), in
   dict-shell.js). The 1 free video offer is the real, translated application; the 10 free hooks have no French version yet, so that card is shown as « Bientôt disponible » and is not a link. */
export const FR_HOME_HERO = {
  offerLine: ['5 concepts publicitaires', 'offerts'], // the second part is set in lime
  offersLabel: 'Pas encore prêt ? Deux autres façons de commencer, gratuitement.',
  offers: {
    video: { title: ['1 vidéo', 'OFFERTE'], description: 'Testez notre production sans engagement.', cta: 'Vérifier mon éligibilité' },
    hooks: { title: ['10 hooks', 'GRATUITS'], description: 'Des idées d’accroches pour vos prochaines publicités.', cta: 'Bientôt disponible' },
  },
}
