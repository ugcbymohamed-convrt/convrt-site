/* French labels for the portfolio vocabulary (src/content/portfolio.js): languages, industries, video types, production credit lines and the caption patterns of the
   generic captions used today ("UGC ad example 5."). A caption that matches no pattern (a real, hand-written one) is shown as written, in its original language. */

export const FR_LANGUAGE_LABELS = {
  en: 'Anglais', es: 'Espagnol', fr: 'Français', ar: 'Arabe', de: 'Allemand', it: 'Italien', pt: 'Portugais', nl: 'Néerlandais',
  tr: 'Turc', ru: 'Russe', pl: 'Polonais', hi: 'Hindi', ur: 'Ourdou', zh: 'Chinois', ja: 'Japonais', ko: 'Coréen',
  he: 'Hébreu', sv: 'Suédois', da: 'Danois', fi: 'Finnois', el: 'Grec', ro: 'Roumain', cs: 'Tchèque', id: 'Indonésien',
}

export const FR_INDUSTRY_LABELS = {
  saas: 'SaaS', ecommerce: 'E-commerce', app: 'Applications', technology: 'Technologie', consumer: 'Produits grand public',
  beauty: 'Beauté', health: 'Santé et bien-être', fashion: 'Mode', food: 'Alimentation et boissons', finance: 'Finance',
  education: 'Éducation', travel: 'Voyage', home: 'Maison et art de vivre', services: 'Services',
}

export const FR_TYPE_LABELS = {
  ugc: 'UGC', spokesperson: 'Porte-parole', organic: 'Social organique', saas: 'Vidéo SaaS', demo: 'Démo produit', testimonial: 'Témoignage',
  interview: 'Micro-trottoir', social: 'Social organique', ad: 'Publicité',
}

export const FR_PRODUCTION_LABELS = { independent: 'Créateur indépendant', convrt: 'Produit par CONVRT' }

export const FR_CATEGORY_LABELS = { all: 'Toutes les réalisations', ecommerce: 'E-commerce', saas: 'SaaS', services: 'Services', other: 'Autres', spokesperson: 'Porte-parole' }

export const FR_ORGANIC_STYLE_LABELS = { educational: 'Pédagogique', entertaining: 'Divertissant', product: 'Centré produit', founder: 'Avec le fondateur' }
export const FR_SAAS_FORMAT_LABELS = { explainer: 'Vidéos explicatives', demo: 'Démos produit', presenter: 'Spokesperson', animated: 'Animées', ad: 'Publicités' }

const CAPTION_PATTERNS = [
  [/^CONVRT UGC ad example\.?$/, () => 'Exemple de publicité UGC CONVRT.'],
  [/^Creator-led UGC ad example (\d+)\.?$/, (n) => `Exemple de publicité UGC portée par un créateur n° ${n}.`],
  [/^UGC ad example (\d+)\.?$/, (n) => `Exemple de publicité UGC n° ${n}.`],
  [/^Spokesperson video example (\d+)\.?$/, (n) => `Exemple de vidéo Spokesperson n° ${n}.`],
  [/^Organic social video example (\d+)\.?$/, (n) => `Exemple de vidéo organique pour les réseaux sociaux n° ${n}.`],
  [/^SaaS creator example (\d+)\.?$/, (n) => `Exemple de créateur pour une offre SaaS n° ${n}.`],
]

/* French caption for a generic English caption, or null when the caption is hand-written (then it is shown as it is). */
export function captionFr(caption) {
  for (const [re, fn] of CAPTION_PATTERNS) {
    const m = caption.match(re)
    if (m) return fn(m[1])
  }
  return null
}

/* French FAQ headings: [plain words, lime-accent words] per FAQ prefix. Used by src/components/ugc/UgcFAQ.jsx and PricingFAQ.jsx in French only. */
export const FR_FAQ_TITLES = {
  ugc: ['Vos questions sur', 'la production UGC.'],
  spokesperson: ['Vos questions sur', 'les vidéos Spokesperson.'],
  saas: ['Vos questions sur', 'les vidéos SaaS.'],
  organic: ['Vos questions sur', 'le contenu organique.'],
  pricing: ['Vos questions sur les offres', 'et les tarifs.'],
}

/* French stage titles that differ per page although the English key is shared. Only the UGC process is built in French, so nothing is overridden. */
export const FR_STAGE_TITLES = {}

/* The short paragraph under the UGC page's final-CTA headline (and its note line) in French editorial copy. English pages have none. Keyed by the final CTA's id. */
export const FR_FINAL_CTA = {
  'ugc-cta-heading': {
    text: 'Présentez-nous votre marque. Nous vous proposerons cinq idées publicitaires lors d’une session stratégique offerte.',
    note: 'Offre réservée aux marques qui remplissent les conditions du programme. Sans engagement.',
  },
  'spokesperson-cta-heading': { text: 'Parlons de votre projet et trouvons la présentation qui lui correspond.' },
  'saas-cta-heading': { text: 'Présentez-nous votre produit. Nous trouverons le format adapté à votre message.' },
  'organic-cta-heading': { text: 'Construisons ensemble une stratégie de contenu qui donne envie de vous suivre.' },
}

/* One-sentence introductions under the heading of interactive sections and the UGC FAQ (French editorial copy). English has none, so they render in French only. */
export const FR_SECTION_INTROS = {
  'ugc-testing': 'Pas besoin de refaire toute une publicité pour tester un nouveau hook. Nous créons des variations pour comparer les éléments qui comptent.',
  'spokesperson-formats': 'Nous adaptons le ton, la présentation et les visuels à votre objectif.',
  'saas-formats': 'Le bon format dépend de votre produit et de votre audience.',
  'organic-content-system': 'Chaque vidéo s’inscrit dans un plan de contenu pensé pour votre audience.',
  'ugc-faq': 'Créateurs, tarifs, droits d’utilisation et déroulement des projets.',
}

/* Visible note under the UGC page's client testimonials (their wording is kept in the original English). */
