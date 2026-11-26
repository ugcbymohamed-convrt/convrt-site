/* SPANISH ABOUT PAGE (/es/about): owner-approved editorial copy, Nov 2026 ("Sobre CONVRT Studio"). Unlike the other translated pages this one is NOT a word-for-word translation of the English
   sections: the Spanish page was re-structured (hero, at a glance, services, founder, experience, creators, markets, results, what we include, closing). src/TrustPage.jsx renders it in place
   of the English content when the language is Spanish. It uses the same inline-link syntax as the English content ([[label|/path]]); internal paths are localized when rendered.

   GEO RULES kept (see CLAUDE.md, GEO Work Packages 1 and 2): every figure is read from the business data (not retyped); the four statistics are the founder's combined professional experience, never
   "CONVRT Studio only"; no offices, branches, awards, reviews, ratings, team size or founding date; Almería is named only as the studio's base; no street address; on-location filming is described as
   subject to scope, availability and quotation (never included in standard packages); "160+ creatives" is the production count published on the Elyon case study (claims register id 'elyon-creatives'). */

import { OFFER_PATHS, CREATOR_SHOWCASE_PATH, COMPANY_LINKEDIN_URL, INSTAGRAM_URL } from '../../config.js'
import { BRAND } from '../../seo/businessKnowledge.js'
import { ELYON_PROOF } from '../../content/ugcProof.js'
import { ORGANIC_PROOF } from '../../content/organicSocialPage.js'
import { CONVRT_STATS } from '../../lib/siteStats.js'
import { localizeStat } from '../format.js'

const es = (stat) => localizeStat('es', stat)
const founder = BRAND.founder
const GRASPO = ORGANIC_PROOF.results[0]
const graspoViews = `${es(GRASPO.metric).replace(/ M$/, '')} millones`

export const ES_ABOUT = {
  h1: 'Ideas que conectan. Vídeos que convierten.',
  intro:
    'CONVRT Studio es un estudio creativo especializado en anuncios UGC, vídeos Spokesperson, producción de vídeos para SaaS y aplicaciones y contenido orgánico para redes sociales. Ayudamos a marcas y empresas a transformar sus ideas en vídeos con un propósito claro. Nos encargamos de la estrategia, los guiones, la selección de creadores, la grabación y la edición, para que todo el proceso creativo esté coordinado desde un mismo lugar. Somos un estudio dirigido por su fundador, con base en Almería, España, y colaboramos con marcas de distintos sectores y mercados internacionales.',
  sections: [
    {
      heading: 'Qué hacemos y cómo trabajamos',
      body: [
        { list: [
          'Nuestros servicios: producción de [[anuncios UGC|/ugc-video-agency]], [[vídeos para SaaS y aplicaciones|/saas-video-production]], [[vídeos Spokesperson|/spokesperson-video-production]] y [[contenido orgánico para redes sociales|/social-media-video-production]].',
          'Nuestros clientes: trabajamos exclusivamente con empresas, entre ellas marcas de e-commerce, SaaS, aplicaciones, tecnología y productos de consumo, además de otros sectores.',
          'Nuestro proceso: estrategia creativa, conceptos, guiones, selección de creadores, grabación, edición y entrega de los vídeos finales.',
          'Nuestros creadores: trabajamos con personas reales ante la cámara y una red de creadores y presentadores independientes. El talento se selecciona según las necesidades de cada proyecto.',
          'Dónde trabajamos: producción remota para clientes internacionales y rodajes presenciales en España. Los rodajes en otros países pueden organizarse según el alcance y la disponibilidad.',
          'Idiomas: español, inglés, francés y árabe. Otros idiomas, bajo petición y según disponibilidad.',
          `Quién está detrás: CONVRT Studio está dirigido por ${founder.name}, su fundador, que desarrolla la actividad como profesional autónomo registrado en España.`,
          `Nuestros proyectos: entre nuestros trabajos documentados se encuentran los proyectos realizados para Graspo y Elyon Dubai, cuyos resultados se explican en sus respectivos casos de éxito ([[Graspo|${GRASPO.href}]] · [[Elyon Dubai|${ELYON_PROOF.caseStudyHref}]]).`,
          'Tarifas y condiciones: puedes consultar nuestros paquetes, precios y condiciones en la página de [[tarifas|/pricing]].',
        ] },
      ],
    },
    {
      heading: 'Un estudio. Cuatro formas de dar vida a tus ideas.',
      body: [
        { list: [
          'Anuncios UGC: creamos anuncios con personas reales, pensados para conectar con tu público y testear diferentes mensajes y enfoques en campañas de pago. Nos encargamos de todo el proceso: conceptos, guiones, creadores, grabación y edición. [[Descubrir nuestros anuncios UGC|/ugc-video-agency]]',
          'Producción de vídeos para SaaS y aplicaciones: transformamos funcionalidades y conceptos de software o de apps en vídeos fáciles de entender. Producimos vídeos explicativos, demostraciones de producto, animaciones y anuncios adaptados a las necesidades de cada marca. [[Descubrir nuestros vídeos para SaaS y aplicaciones|/saas-video-production]]',
          'Vídeos Spokesperson: trabajamos con presentadores profesionales para comunicar mensajes de marca, presentar productos, explicar servicios y protagonizar anuncios. Seleccionamos el talento y desarrollamos los guiones para cada proyecto. [[Descubrir nuestros vídeos Spokesperson|/spokesperson-video-production]]',
          'Contenido orgánico para redes sociales: ayudamos a las marcas a mantener una presencia constante en redes sociales mediante estrategia de contenido, producción de vídeos, planificación, publicación y gestión de comunidad, según el paquete contratado. [[Descubrir nuestro servicio de contenido orgánico|/social-media-video-production]]',
        ] },
      ],
    },
    {
      heading: 'CONVRT nace de la experiencia de crear vídeos para marcas',
      body: [
        `CONVRT Studio está dirigido por su fundador, ${founder.name}.`,
        'Su experiencia en la producción de vídeos y contenido publicitario es la base de nuestro enfoque: entender qué necesita comunicar cada marca, encontrar una idea clara y convertirla en un vídeo bien ejecutado.',
        'Gestionamos la estrategia, los guiones, la selección de creadores, la producción y la edición desde un mismo estudio. Así, cada proyecto mantiene una dirección creativa coherente sin que el cliente tenga que coordinar a distintos proveedores por separado.',
        'CONVRT opera como actividad profesional autónoma registrada en España.',
        `Enlaces: [[CONVRT Studio en LinkedIn|${COMPANY_LINKEDIN_URL}]] · [[Instagram|${INSTAGRAM_URL}]] · [[LinkedIn del fundador|${founder.linkedin}]]`,
      ],
    },
    {
      heading: 'Experiencia construida vídeo a vídeo',
      body: [
        `Las cifras que aparecen en este sitio (más de ${es(CONVRT_STATS.videos).replace('+', '')} vídeos producidos, más de ${es(CONVRT_STATS.clients).replace('+', '')} clientes atendidos, más de ${es(CONVRT_STATS.views).replace('+', '')} de visualizaciones generadas y más del ${es(CONVRT_STATS.returningClients).replace('+', '').replace('%', ' %')} de clientes recurrentes) corresponden a la experiencia profesional combinada de nuestro fundador, tanto a través de CONVRT Studio como de otros proyectos profesionales de producción creativa.`,
        'No representan exclusivamente proyectos realizados bajo la marca CONVRT Studio.',
        'Los resultados de clientes concretos se detallan por separado en nuestros casos de éxito, junto con sus fuentes, periodos y condiciones.',
      ],
    },
    {
      heading: 'La persona adecuada para cada mensaje',
      body: [
        'No todos los vídeos necesitan el mismo tipo de creador. Según tu marca, tu público y el mensaje que quieras transmitir, buscamos perfiles que encajen con el proyecto y te mostramos ejemplos de su trabajo antes de producir.',
        'Creadores y presentadores reales. Trabajamos con una red de creadores y presentadores, incluidos colaboradores independientes. Nuestros anuncios UGC y vídeos Spokesperson cuentan con personas reales ante la cámara, con dirección creativa y supervisión humana. No los sustituimos por avatares generados por inteligencia artificial.',
        'Tú participas en la elección. Te recomendamos perfiles adecuados para tu proyecto y puedes revisar las propuestas antes de la grabación. Los conceptos y guiones también pasan por tu aprobación antes de producir. La selección definitiva está sujeta a la disponibilidad de cada creador y a las condiciones acordadas.',
        `Una biblioteca para explorar estilos. Nuestro [[Creator Showcase|${CREATOR_SHOWCASE_PATH}]] reúne muestras de creadores independientes que nos permiten enseñar diferentes estilos de comunicación y presentación. Los vídeos se incorporan con la autorización correspondiente y no representan necesariamente trabajos producidos por CONVRT. [[Explorar creadores|${CREATOR_SHOWCASE_PATH}]]`,
      ],
    },
    {
      heading: 'Producción internacional. Atención personalizada.',
      body: [
        'Trabajamos con empresas de España, Europa, Reino Unido, Estados Unidos, Oriente Medio y otros mercados internacionales.',
        'Nuestra red de creadores nos permite coordinar producciones remotas en distintos idiomas y adaptar los vídeos al público al que se dirige cada marca.',
        'Ofrecemos producción en español, inglés, francés y árabe, además de otros idiomas según disponibilidad.',
        'También realizamos rodajes presenciales en España, sujetos al alcance del proyecto, a la disponibilidad y, cuando proceda, a presupuesto. Las producciones en otras localizaciones se estudian individualmente, según las necesidades, el presupuesto y la disponibilidad del proyecto.',
        'CONVRT Studio tiene su base en Almería, España.',
      ],
    },
    {
      heading: 'Proyectos reales, resultados con contexto',
      body: [
        `Graspo: ${graspoViews} de visualizaciones orgánicas. Desarrollamos una estrategia de contenido orgánico en Facebook e Instagram dirigida al público de habla árabe para Graspo, una empresa europea del sector de la impresión. El resultado corresponde al periodo comprendido entre enero y junio de 2026 y se documenta en su caso de éxito. [[Leer el caso de Graspo|${GRASPO.href}]]`,
        `Elyon Dubai: ${es(ELYON_PROOF.roas)} de ROAS comunicado por el cliente. En el trabajo documentado con Elyon Dubai, que incluye más de ${es(ELYON_PROOF.creativesProduced).replace('+', '')} creativos producidos, uno de los anuncios UGC obtuvo un ROAS de ${es(ELYON_PROOF.roas)} según los datos facilitados por el cliente. Se trata del resultado de una pieza concreta, no de una media de campaña ni de una garantía de rendimiento. [[Leer el caso de Elyon Dubai (en inglés)|${ELYON_PROOF.caseStudyHref}]]`,
        'Los resultados corresponden a proyectos y periodos concretos. No son resultados habituales ni están garantizados.',
      ],
    },
    {
      heading: 'Todo claro desde el principio',
      body: [
        'Producción creativa, no gestión publicitaria. Nos encargamos de los conceptos, los guiones, los creadores, la grabación y la edición. No compramos medios ni gestionamos la inversión en tus campañas publicitarias. Tú mantienes el control sobre dónde se distribuyen los vídeos y cuánto inviertes.',
        'Gestión de comunidad, no atención al cliente. Nuestros paquetes de contenido orgánico pueden incluir programación, publicación e interacción con la comunidad. La atención al cliente y la resolución de incidencias comerciales no forman parte de este servicio.',
        'Vídeos finales, con material en bruto opcional. Entregamos vídeos editados y preparados para los formatos acordados. El material original de grabación puede solicitarse como complemento cuando esté disponible y se haya acordado, pero no sustituye la entrega de los vídeos terminados.',
        'Derechos de uso definidos. Los paquetes incluyen condiciones de licencia que establecen cómo y durante cuánto tiempo pueden utilizarse los vídeos. Los derechos de uso no implican automáticamente la cesión de la propiedad intelectual. Puedes consultar los plazos, las ampliaciones disponibles y las condiciones en nuestra página de [[tarifas|/pricing]].',
        'Sin promesas de resultados imposibles. Nos comprometemos con el proceso creativo y los entregables acordados, no con una cifra garantizada de visualizaciones, ventas o rentabilidad. El rendimiento depende también de la oferta, la audiencia, la distribución y otros factores que van más allá de la producción del vídeo.',
      ],
    },
    {
      heading: '¿Tienes un proyecto en mente? Hablemos.',
      body: [
        `Explora nuestros trabajos, cuéntanos qué necesitas y descubramos cómo podemos ayudarte a convertir tus ideas en vídeos. [[Ver el caso de Graspo|${GRASPO.href}]] · [[Ver el caso de Elyon|${ELYON_PROOF.caseStudyHref}]]`,
        `[[Contactar con CONVRT|/contact]] · [[5 conceptos gratis|${OFFER_PATHS.roadmap}]]`,
      ],
    },
  ],
}
