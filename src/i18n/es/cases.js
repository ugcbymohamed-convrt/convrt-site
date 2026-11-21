/* Spanish copy of the three homepage client panels (src/components/CaseStudies.jsx). Same clients, same videos, same figures: only the words change.
   The Graspo follower counts come from src/lib/siteStats.js (passed in), never retyped. */

import { localizeStat } from '../format.js'

const moreThan = (stat) => (stat.endsWith('+') ? `más de ${localizeStat('es', stat.slice(0, -1))}` : localizeStat('es', stat))

export function esCaseCopy(id, following) {
  switch (id) {
    case 'adscale':
      return {
        tab: 'SaaS',
        title: 'Creatividades largas\nque no se pueden saltar.',
        body: 'Si piensas que las creatividades largas no funcionan, echa un vistazo a estas. No son solo creatividades: generan confianza, transmiten seguridad y demuestran que «sabemos lo que hacemos». Transiciones cuidadas, imágenes llamativas y una narración tan atractiva que casi es imposible saltarlas.',
      }
    case 'elyon':
      return {
        tab: 'E-commerce',
        title: 'Más de 100 creatividades testeadas.\nVarios ganadores encontrados.',
        body: 'Hemos creado más de 100 piezas de contenido con Elyon Dubai. Desde su lanzamiento en 2025, hemos testeado múltiples conceptos y variaciones. Hasta ahora, ya hemos encontrado muchos formatos que están funcionando muy bien para Elyon. Cuando el producto es de calidad, es mucho más fácil crear contenido genuino que conecte con la gente.',
      }
    case 'graspo':
      return {
        tab: 'Impresión',
        title: '6 millones de visualizaciones.\nEn menos de 2 meses.',
        body: `Hemos generado más de 6 millones de visualizaciones para Graspo en menos de 2 meses. Y sí, antes fueron necesarios 6 meses de pruebas de contenido para descubrir qué conecta de verdad y qué no. Hoy, Graspo tiene ${moreThan(following.combined)} seguidores: ${localizeStat('es', following.facebook)} en Facebook, ${localizeStat('es', following.instagram)} en Instagram y ${localizeStat('es', following.tiktok)} en TikTok.`,
      }
    default:
      throw new Error(`esCaseCopy: no Spanish copy for case "${id}"`)
  }
}
