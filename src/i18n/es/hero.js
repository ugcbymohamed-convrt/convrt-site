import { CREATOR_SHOWCASE_PATH } from '../../config.js'

/* Spanish H1 and secondary CTA of each service hero. The English H1s are "Human-led UGC ads. Built for paid social. to convrt." and so on; the Spanish headlines are NOT
   word-for-word (owner-approved editorial copy, Nov 2026): they keep the rhythm (fixed lines, then a last line whose final word rolls). The server HTML holds only the first
   rolling word, so the indexable H1 is stable ("Creados para convertir.", "Mensajes que conectan.", ...).
   `secondary` replaces the English CTA object: the label is the approved Spanish one and the href is the English path (localized when rendered) or an in-page anchor. */
export const ES_HERO = {
  'ugc-h1': {
    lines: [['UGC', 'con', 'personas', 'reales.'], ['Para', 'tus', 'anuncios.']],
    lead: ['Para'],
    words: ['conectar', 'convertir', 'destacar'],
    sizer: 'convertir.',
    secondary: { label: 'Ver ejemplos UGC', href: CREATOR_SHOWCASE_PATH },
  },
  'spokesperson-h1': {
    lines: [['Vídeos', 'Spokesperson.'], ['Personas', 'reales.']],
    lead: ['Mensajes', 'que'],
    words: ['conectan', 'convencen', 'explican'],
    sizer: 'convencen.',
    secondary: { label: 'Ver vídeos', href: CREATOR_SHOWCASE_PATH },
  },
  'organic-h1': {
    lines: [['Vídeos', 'orgánicos', 'para', 'redes.'], ['Contenido', 'que', 'engancha.']],
    lead: ['Una', 'marca', 'que'],
    words: ['conecta', 'inspira', 'destaca'],
    sizer: 'conecta.',
    secondary: { label: 'Cómo trabajamos', href: '#how-it-works' },
  },
  'saas-h1': {
    lines: [['Vídeos', 'para', 'SaaS.'], ['Fáciles', 'de', 'entender.']],
    lead: ['Diseñados', 'para'],
    words: ['convertir', 'explicar', 'enganchar'],
    sizer: 'enganchar.',
    secondary: { label: 'Ver formatos', href: '#saas-formats' },
  },
}
