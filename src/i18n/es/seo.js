/* SPANISH PAGE-LEVEL SEO: title, description and social copy per translated page, keyed by the ENGLISH base path.
   Same role as SITE_SEO in src/seo/siteSeo.js. Prices come from the business data (never retyped).

   Keyword → page decisions (see docs/multilingual-spanish-seo-map.md): every page has ONE distinct primary Spanish intent so the pages do not compete:
     /es/                                  agencia UGC (umbrella: UGC + presentador + redes sociales)
     /es/ugc-video-agency                  vídeos UGC para anuncios / producción de vídeos UGC
     /es/spokesperson-video-production     vídeos con presentador / portavoz
     /es/social-media-video-production     agencia de contenidos en vídeo para redes sociales
     /es/saas-video-production             vídeos explicativos y demos para SaaS
     /es/pricing                           tarifas UGC / precios de producción de vídeo
   Keyword Planner volumes are rounded, directional estimates, never precise demand. */

import { SPRINT, USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { priceOf, formatPrice, isPricingApproved } from '../pricing.js'

/* Spanish share image. The default OG image (public/og/convrt-og.png) has ENGLISH text burned into it, so Spanish pages reuse it only until a Spanish version exists. Add
   public/og/convrt-og-es.png (1200x630 PNG, same layout; suggested text in docs/multilingual-spanish-release.md) and set this to true: every Spanish page then switches by itself.
   tests/i18n.test.mjs checks that the file exists, is 1200x630 PNG, whenever this is true. */
export const ES_OG_IMAGE_READY = false
export const ES_OG_IMAGE_PATH = '/og/convrt-og-es.png'

export const ES_OG_IMAGE_ALT = 'CONVRT: creatividades de alto rendimiento diseñadas para convertir. Anuncios UGC, vídeos para SaaS, vídeos con presentador y contenido orgánico para redes sociales.'

export const ES_SEO = {
  '/': {
    title: 'Agencia UGC y de vídeos publicitarios para marcas | CONVRT',
    description:
      'Agencia de vídeo con creadores reales: anuncios UGC, vídeos con presentador y contenido para redes sociales, para marcas SaaS, e-commerce y apps. En español, inglés, francés y árabe.',
    ogTitle: 'CONVRT: creatividades de alto rendimiento que convierten',
    ogDescription: 'Anuncios UGC, vídeos con presentador, contenido orgánico y estrategia creativa, pensados para frenar el scroll y generar acción.',
  },
  '/ugc-video-agency': {
    title: 'Vídeos UGC para anuncios | Producción con creadores | CONVRT',
    // The "desde X/mes" price appears only once the owner has approved the EUR amount; until then the description makes no price claim.
    description: isPricingApproved('es')
      ? `Producción de vídeos UGC para anuncios en redes sociales, de principio a fin. Paquetes desde ${formatPrice('es', priceOf('es', SPRINT.monthly))}/mes, con ${USAGE_RIGHTS.includedMonths} meses de derechos de uso mundiales incluidos.`
      : `Producción de vídeos UGC para anuncios en redes sociales, de principio a fin. Paquetes mensuales y puntuales, con ${USAGE_RIGHTS.includedMonths} meses de derechos de uso mundiales incluidos.`,
    ogTitle: 'CONVRT: anuncios UGC pensados para redes sociales de pago',
    ogDescription: 'Anuncios UGC con creadores reales, producidos de principio a fin, con precios y derechos de uso transparentes.',
  },
  '/spokesperson-video-production': {
    title: 'Vídeos con presentador y portavoz para marcas | CONVRT',
    description:
      'Vídeos con presentadores humanos reales para webs, demos de producto, apps y publicidad de pago. Producción multilingüe, del guion al montaje final.',
    ogTitle: 'CONVRT: producción de vídeos con presentador profesional',
    ogDescription: 'Vídeos con presentador humano y multilingües para webs, demos de producto, apps y publicidad de pago, del guion al montaje final.',
  },
  '/social-media-video-production': {
    title: 'Agencia de contenidos en vídeo para redes sociales | CONVRT',
    description:
      'Vídeo corto para redes sociales orgánicas en Instagram, TikTok y Facebook: estrategia, grabación, edición, publicación y gestión de comunidad.',
    ogTitle: 'CONVRT: producción y gestión de vídeo orgánico para redes sociales',
    ogDescription: 'Vídeos cortos con creadores reales para redes sociales orgánicas: estrategia, guion, grabación, edición, publicación y gestión de comunidad.',
  },
  '/saas-video-production': {
    title: 'Vídeos explicativos y demos para SaaS | CONVRT',
    description:
      'Producción de vídeo para software y apps: explicativos, demos de producto, vídeos animados y anuncios de rendimiento, del concepto a la entrega, con personas reales.',
    ogTitle: 'CONVRT: producción de vídeo para marcas de software y apps',
    ogDescription: 'Explicativos, demos de producto, vídeos animados y anuncios para empresas de software, con estrategia, guion, presentadores, motion graphics y edición en un solo lugar.',
  },
  '/pricing': {
    title: 'Tarifas UGC y precios de producción de vídeo | CONVRT',
    description:
      'Paquetes de producción de UGC, anuncios en vídeo y contenido para redes sociales de CONVRT: precios claros en euros, entregables, derechos de uso y política de revisiones.',
  },
  '/creator-showcase': {
    title: 'Ejemplos de vídeos UGC de creadores | CONVRT',
    description:
      'Explora ejemplos de vídeos UGC de creadores independientes en e-commerce, SaaS, servicios y otros sectores. Descubre estilos y enfoques creativos distintos.',
    ogTitle: 'Creator Showcase de CONVRT: ejemplos de vídeos UGC',
    ogDescription: 'Vídeos reales de creadores en e-commerce, SaaS, servicios y más. Ejemplos de creadores independientes.',
  },
  '/about': {
    title: 'Sobre CONVRT | Estudio de vídeo liderado por su fundador',
    description:
      'Estudio creativo liderado por su fundador que produce anuncios UGC, vídeos para SaaS, vídeos con presentador y contenido orgánico para redes sociales en español, inglés, francés y árabe.',
  },
  '/creative-growth-roadmap': {
    title: 'Hoja de ruta de crecimiento creativo gratuita | CONVRT',
    description:
      'Solicita cinco conceptos publicitarios personalizados para tu marca. Ángulos creativos, ganchos y recomendaciones de testeo de CONVRT, presentados en una sesión estratégica gratuita.',
  },
  '/contact': {
    title: 'Contacto | Habla con el estudio de CONVRT',
    description:
      'Contacta con CONVRT por correo, reserva una llamada creativa o solicita la Hoja de Ruta de Crecimiento Creativo gratuita. Estudio de vídeo liderado por su fundador para SaaS, e-commerce y apps.',
  },
}
