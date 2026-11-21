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
  ugc: 'UGC', spokesperson: 'Presentador', organic: 'Social orgánico', saas: 'Vídeo para SaaS', demo: 'Demo de producto', testimonial: 'Testimonio',
  interview: 'Entrevista en la calle', social: 'Social orgánico', ad: 'Creatividad publicitaria',
}

export const ES_PRODUCTION_LABELS = { independent: 'Creador independiente', convrt: 'Producido por CONVRT' }

export const ES_CATEGORY_LABELS = { all: 'Todo el trabajo', ecommerce: 'E-commerce', saas: 'SaaS', services: 'Servicios', other: 'Otros', spokesperson: 'Presentador' }

export const ES_ORGANIC_STYLE_LABELS = { educational: 'Educativo', entertaining: 'Entretenido', product: 'Centrado en el producto', founder: 'Con el fundador' }
export const ES_SAAS_FORMAT_LABELS = { explainer: 'Explicativos de producto', demo: 'Demos de producto', presenter: 'Con presentador', animated: 'Animados', ad: 'Anuncios' }

const CAPTION_PATTERNS = [
  [/^CONVRT UGC ad example\.?$/, () => 'Ejemplo de anuncio UGC de CONVRT.'],
  [/^Creator-led UGC ad example (\d+)\.?$/, (n) => `Ejemplo de anuncio UGC con creador ${n}.`],
  [/^UGC ad example (\d+)\.?$/, (n) => `Ejemplo de anuncio UGC ${n}.`],
  [/^Spokesperson video example (\d+)\.?$/, (n) => `Ejemplo de vídeo con presentador ${n}.`],
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
