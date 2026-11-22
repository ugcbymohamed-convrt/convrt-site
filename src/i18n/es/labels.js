/* Spanish labels for the portfolio vocabulary (src/content/portfolio.js): languages, industries, video types, production credit lines and the
   caption patterns of the generic captions used today ("UGC ad example 5."). A caption that matches no pattern (a real, hand-written one added later) is
   shown as written, in its original language, and flagged lang="en" by the components that print it. */

export const ES_LANGUAGE_LABELS = {
  en: 'Inglés', es: 'Español', fr: 'Francés', ar: 'Árabe', de: 'Alemán', it: 'Italiano', pt: 'Portugués', nl: 'Neerlandés',
  tr: 'Turco', ru: 'Ruso', pl: 'Polaco', hi: 'Hindi', ur: 'Urdu', zh: 'Chino', ja: 'Japonés', ko: 'Coreano',
  he: 'Hebreo', sv: 'Sueco', da: 'Danés', fi: 'Finés', el: 'Griego', ro: 'Rumano', cs: 'Checo', id: 'Indonesio',
}

export const ES_INDUSTRY_LABELS = {
  saas: 'SaaS', ecommerce: 'E-commerce', app: 'Apps', technology: 'Tecnología', consumer: 'Productos de consumo',
  beauty: 'Belleza', health: 'Salud y bienestar', fashion: 'Moda', food: 'Alimentación y bebidas', finance: 'Finanzas',
  education: 'Educación', travel: 'Viajes', home: 'Hogar y estilo de vida', services: 'Servicios',
}

export const ES_TYPE_LABELS = {
  ugc: 'UGC', spokesperson: 'Spokesperson', organic: 'Social orgánico', saas: 'Vídeo para SaaS', demo: 'Demo de producto', testimonial: 'Testimonio',
  interview: 'Entrevista en la calle', social: 'Social orgánico', ad: 'Creativo publicitario',
}

export const ES_PRODUCTION_LABELS = { independent: 'Creador independiente', convrt: 'Producido por CONVRT' }

export const ES_CATEGORY_LABELS = { all: 'Todo el trabajo', ecommerce: 'E-commerce', saas: 'SaaS', services: 'Servicios', other: 'Otros', spokesperson: 'Spokesperson' }

export const ES_ORGANIC_STYLE_LABELS = { educational: 'Educativo', entertaining: 'Entretenido', product: 'Centrado en el producto', founder: 'Con el fundador' }
export const ES_SAAS_FORMAT_LABELS = { explainer: 'Explicativos de producto', demo: 'Demos de producto', presenter: 'Spokesperson', animated: 'Animados', ad: 'Anuncios' }

const CAPTION_PATTERNS = [
  [/^CONVRT UGC ad example\.?$/, () => 'Ejemplo de anuncio UGC de CONVRT.'],
  [/^Creator-led UGC ad example (\d+)\.?$/, (n) => `Ejemplo de anuncio UGC con creador ${n}.`],
  [/^UGC ad example (\d+)\.?$/, (n) => `Ejemplo de anuncio UGC ${n}.`],
  [/^Spokesperson video example (\d+)\.?$/, (n) => `Ejemplo de vídeo Spokesperson ${n}.`],
  [/^Organic social video example (\d+)\.?$/, (n) => `Ejemplo de vídeo orgánico para redes sociales ${n}.`],
  [/^SaaS creator example (\d+)\.?$/, (n) => `Ejemplo de creador para SaaS ${n}.`],
]

/* Spanish caption for a generic English caption, or null when the caption is hand-written (then it is shown as it is). */
export function captionEs(caption) {
  for (const [re, fn] of CAPTION_PATTERNS) {
    const m = caption.match(re)
    if (m) return fn(m[1])
  }
  return null
}

/* Spanish FAQ headings (owner-approved editorial copy): [plain words, lime-accent words] per FAQ prefix. Used by src/components/ugc/UgcFAQ.jsx in Spanish only. */
export const ES_FAQ_TITLES = {
  ugc: ['Todo lo que necesitas saber', 'sobre nuestros vídeos UGC.'],
  spokesperson: ['Todo lo que necesitas saber', 'sobre nuestros vídeos Spokesperson.'],
  saas: ['Todo lo que necesitas saber', 'sobre nuestros vídeos para SaaS.'],
  organic: ['Todo lo que necesitas saber', 'sobre nuestro contenido orgánico.'],
  pricing: ['Resolvemos tus dudas', 'sobre paquetes y tarifas.'],
}

/* Spanish stage titles that differ per page although the English key is shared (e.g. "Delivery & Distribution" is on both the Spokesperson and SaaS pages). Keyed by the process section's
   headingId, then by stage id. Applied by ProcessSection in Spanish only; a stage that is not listed keeps its dictionary title. */
export const ES_STAGE_TITLES = {
  'spokesperson-process-heading': { filming: 'Grabamos y editamos', delivery: 'Entregamos los vídeos finales' },
  'saas-process-heading': { delivery: 'Entregamos las versiones finales' },
}

/* The short paragraph under each service page's final-CTA headline (and, for UGC, its own note line) in Spanish editorial copy, Nov 2026. English pages have none. Keyed by the final CTA's id. */
export const ES_FINAL_CTA = {
  'ugc-cta-heading': {
    text: 'Cuéntanos qué hace tu marca y te presentaremos cinco ideas publicitarias adaptadas a tu negocio en una sesión estratégica gratuita.',
    note: 'Disponible para marcas que cumplan los requisitos del programa. Sin compromiso.',
  },
  'spokesperson-cta-heading': { text: 'Cuéntanos qué quieres comunicar y te ayudaremos a encontrar el presentador, el enfoque y el formato que mejor encajan con tu marca.' },
  'saas-cta-heading': { text: 'Cuéntanos qué hace tu producto y qué quieres comunicar. Te ayudaremos a encontrar el formato y el enfoque creativo adecuados.' },
  'organic-cta-heading': { text: 'Cuéntanos qué quieres conseguir con tus redes sociales. Te ayudaremos a definir una estrategia de contenido y un plan de producción que encajen con tu marca.' },
}

/* One-sentence introductions under the heading of four interactive sections and the UGC FAQ (Spanish editorial copy). English has none, so they render in Spanish only. */
export const ES_SECTION_INTROS = {
  'ugc-testing': 'No necesitas cambiar todo el anuncio para descubrir qué funciona. Creamos distintas versiones de una misma idea para que puedas comparar elementos creativos de forma más estructurada.',
  'spokesperson-formats': 'No todos los vídeos necesitan el mismo enfoque. Adaptamos el guion, el estilo de presentación y los recursos visuales a lo que tu marca quiere comunicar.',
  'saas-formats': 'No todos los vídeos de SaaS tienen que cumplir la misma función. Elegimos el formato según tu producto, tu público y el objetivo que quieras conseguir.',
  'organic-content-system': 'Una presencia constante en redes empieza por tener claro qué quieres contar, a quién se lo cuentas y para qué.',
  'ugc-faq': 'Resolvemos las dudas más habituales antes de empezar un proyecto.',
}

/* Visible note under the UGC page's client testimonials (their wording is kept in the original English). */
export const ES_TESTIMONIALS_NOTE = 'Opiniones de clientes reproducidas en su idioma original.'
