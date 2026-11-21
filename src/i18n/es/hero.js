/* Spanish H1 of each service hero: the fixed lines, the words before the rolling word, the rolling words and the width-reserving word. The English H1s are
   "Human-led UGC ads. Built for paid social. Made to convrt." and so on; these are NOT word-for-word: they keep the rhythm (two statements, then "Hecho para ___.")
   and the playful last word that rolls. The server HTML holds only the first rolling word ("convertir."), so the indexable H1 is stable. */
export const ES_HERO = {
  'ugc-h1': {
    lines: [['Anuncios', 'UGC', 'con', 'personas', 'reales.'], ['Pensados', 'para', 'redes', 'sociales', 'de', 'pago.']],
    lead: ['Hechos', 'para'],
    words: ['convertir', 'conectar', 'vender', 'resonar'],
    sizer: 'convertir.',
  },
  'spokesperson-h1': {
    lines: [['Vídeos', 'con', 'presentadores', 'reales.'], ['Creados', 'para', 'comunicar.']],
    lead: ['Hechos', 'para'],
    words: ['convertir', 'explicar', 'conectar', 'persuadir'],
    sizer: 'persuadir.',
  },
  'organic-h1': {
    lines: [['Vídeos', 'orgánicos', 'para', 'redes.'], ['Creados', 'para', 'enganchar.']],
    lead: ['Hechos', 'para'],
    words: ['convertir', 'conectar', 'inspirar', 'resonar'],
    sizer: 'convertir.',
  },
  'saas-h1': {
    lines: [['Vídeos', 'para', 'SaaS.'], ['Creados', 'para', 'explicar.']],
    lead: ['Hechos', 'para'],
    words: ['convertir', 'enganchar', 'conectar'],
    sizer: 'enganchar.',
  },
}
