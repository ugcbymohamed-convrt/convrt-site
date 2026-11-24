import { CREATOR_SHOWCASE_PATH } from '../../config.js'

/* Spanish H1 and secondary CTA of each service hero. The English H1s are "Human-led UGC ads. Built for paid social. to convrt." and so on; the Spanish headlines are NOT
   word-for-word (owner-approved editorial copy, Nov 2026): they keep the rhythm (fixed lines, then a last line whose final word rolls). The server HTML holds only the first
   rolling word, so the indexable H1 is stable ("Creados para convertir.", "Mensajes que conectan.", ...).
   `secondary` replaces the English CTA object: the label is the approved Spanish one and the href is the English path (localized when rendered) or an in-page anchor. */
export const ES_HERO = {
  'ugc-h1': {
    lines: [['Vídeos', 'UGC'], ['con', 'personas', 'reales.']],
    lead: ['Hechos', 'para'],
    words: ['destacar', 'convertir', 'conectar'],
    sizer: 'convertir.',
    secondary: { label: 'Explorar vídeos UGC', href: CREATOR_SHOWCASE_PATH },
  },
  'spokesperson-h1': {
    lines: [['Vídeos', 'Spokesperson'], ['con', 'personas', 'reales.']],
    lead: ['Mensajes', 'que'],
    words: ['conectan', 'convencen', 'explican'],
    sizer: 'convencen.',
    // the Spanish page has no example-video gallery: the secondary CTA goes to the process section
    secondary: { label: 'Cómo trabajamos', href: '#how-it-works' },
  },
  'organic-h1': {
    lines: [['Vídeos', 'para', 'redes', 'sociales']],
    lead: ['que', 'merecen', 'la', 'pena'],
    words: ['ver', 'seguir', 'guardar'],
    sizer: 'guardar.',
    secondary: { label: 'Cómo trabajamos', href: '#how-it-works' },
  },
  'saas-h1': {
    lines: [['Vídeos', 'para', 'SaaS'], ['que', 'hacen', 'tu', 'producto']],
    lead: ['fácil', 'de'],
    words: ['entender', 'explicar', 'recordar'],
    sizer: 'explicar.',
    secondary: { label: 'Explorar formatos', href: '#saas-formats' },
  },
}
