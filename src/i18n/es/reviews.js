/* SPANISH CLIENT REVIEWS (homepage "Clientes que vuelven"). Faithful Spanish renderings of the three published reviews in src/content/reviews.js, owner-written and approved on 2026-11-24
   (they replace the earlier translations in testimonials.js on the homepage). The English originals stay untouched in src/content/reviews.js as the provenance record; they are not shown on the
   Spanish page. No rating, outcome or source is added: the brand, industry and "Cliente recurrente" come from the same records as the English homepage.

   `excerpt` is the short line shown first, `highlight` the part picked out in lime (a verbatim part of the excerpt), `full` the complete review behind "Leer la opinión completa". */
export const ES_REVIEWS_COPY = {
  eyebrow: 'Clientes que vuelven',
  heading: 'Colaboraciones que duran',
  repeat: 'Cliente recurrente',
  readFull: 'Leer la opinión completa',
  chooseLabel: 'Elige la opinión de un cliente',
  logoAlt: (brand) => `Logotipo de ${brand}`,
}

export const ES_REVIEWS = {
  adscale: {
    category: 'SaaS · Publicidad en redes sociales',
    excerpt: 'Los vídeos UGC eran justo lo que necesitábamos para impulsar nuestras campañas.',
    highlight: 'impulsar nuestras campañas',
    full: 'Trabajar con Mohamad ha sido un auténtico placer. Es profesional, creativo y entiende perfectamente qué hace que un contenido funcione. Los vídeos UGC que creó eran justo lo que necesitábamos para impulsar nuestras campañas publicitarias. Ya hemos vuelto a contratar sus servicios y queremos seguir colaborando a largo plazo.',
  },
  elyon: {
    category: 'Perfumería de lujo · E-commerce',
    excerpt: 'Vídeos de gran calidad, entregados a tiempo y con una comunicación excelente.',
    highlight: 'gran calidad',
    full: 'Mohamed entendió perfectamente el concepto y la calidad del resultado superó mis expectativas. Los vídeos son de gran calidad, se entregaron a tiempo y la comunicación fue excelente durante todo el proceso. Ya he vuelto a hacer otro pedido y tengo muchas ganas de seguir colaborando.',
  },
  talk360: {
    category: 'Aplicación móvil · Internacional',
    excerpt: 'Con cada colaboración, la calidad sigue mejorando.',
    highlight: 'la calidad sigue mejorando',
    full: 'Los vídeos han vuelto a quedar increíbles. Con cada colaboración, la calidad sigue mejorando. Entrega rápida, comunicación excelente y contenidos que funcionan exactamente como necesitamos. Este es nuestro tercer pedido, y desde luego no será el último.',
  },
}
