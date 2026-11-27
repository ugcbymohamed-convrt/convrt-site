// ES About page content: the owner's professionally localized copy (CONVRT-ES.md, 27 Nov 2026), copied verbatim.
// GENERATED ONCE from the supplied file; edit only to apply new supplied text. The only additions are the [[label|target]] link tokens, placed on the same words the English About page links.
// Internal targets are localized at render time (hrefFor); external ones come from src/config.js. Shape: see src/components/about/AboutLayout.jsx.
import { COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL, INSTAGRAM_URL } from '../../config.js'
import { CREATOR_FORM } from '../trustPages.js'

export default {
  badge: "Sobre CONVRT",
  h1: { lead: "Sobre", accent: "CONVRT Studio" },
  intro: "CONVRT Studio es un estudio creativo dirigido por su fundador. Producimos anuncios UGC con personas reales, vídeos para SaaS y aplicaciones, vídeos con presentador y contenido orgánico para redes sociales. Reunimos estrategia creativa, guion, selección de creadores, rodaje y edición en un solo equipo, con un enfoque creativo orientado a resultados.",
  glance: {
    heading: "CONVRT Studio de un vistazo",
    items: [
      { label: "Qué hacemos", text: "[[Anuncios UGC en vídeo|/ugc-video-agency]], [[producción de vídeos para SaaS y aplicaciones|/saas-video-production]], [[vídeos con presentador|/spokesperson-video-production]] y [[vídeos orgánicos para redes sociales|/social-media-video-production]]." },
      { label: "Para quién trabajamos", text: "Exclusivamente para empresas de distintos sectores, como SaaS, comercio electrónico, aplicaciones, tecnología y productos de consumo. Trabajamos con clientes internacionales, entre otros, en Europa, Reino Unido, Oriente Medio y Estados Unidos." },
      { label: "Cómo producimos", text: "Estrategia creativa, guiones, selección de creadores, rodaje y edición en un solo estudio. Colaboramos con talento propio y creadores independientes. Nuestros vídeos UGC y con presentador muestran a personas reales ante la cámara, no avatares generados por IA. Antes de producir, puedes ver trabajos relevantes de los creadores y aprobar los conceptos y guiones antes de que comience el rodaje." },
      { label: "Dónde producimos", text: "Producción remota a través de nuestra red de creadores y rodajes presenciales en España." },
      { label: "Fundador", text: "CONVRT Studio está dirigido por su fundador, Mohamed Doukkali Azizi, profesional autónomo registrado en España bajo cuyo nombre se desarrolla la actividad." },
      { label: "Idiomas", text: "Inglés, español, francés y árabe. Otros idiomas bajo petición, según la disponibilidad de los creadores." },
      { label: "Proyectos de clientes", text: "Graspo: 10,7 millones de visualizaciones orgánicas en Facebook e Instagram, de enero a junio de 2026 ([[caso de éxito|/case-studies/graspo]]). Elyon Dubai: más de 160 creatividades producidas, entre ellas un vídeo con creador que obtuvo un ROAS de 5,28x según el cliente ([[caso de éxito|/case-studies/elyon]]). Los resultados corresponden a cada cliente y periodo concretos; no representan resultados habituales ni están garantizados." },
      { label: "Packs y condiciones", text: "Consulta la [[página de precios|/pricing]]." },
      { label: "Dónde encontrarnos", text: "Convrt.studio, [[CONVRT Studio en LinkedIn|" + COMPANY_LINKEDIN_URL + "]] e [[Instagram|" + INSTAGRAM_URL + "]] y el perfil del fundador en [[LinkedIn|" + FOUNDER_LINKEDIN_URL + "]]." },
    ],
  },
  what: {
    badge: "Qué hacemos",
    lead: "Creamos contenido en vídeo diseñado para captar la atención, generar confianza e impulsar la acción.",
    services: [
      { name: "Anuncios UGC en vídeo", href: "/ugc-video-agency", text: "Anuncios protagonizados por creadores para campañas de pago en redes sociales, con producción integral." },
      { name: "Producción de vídeos para SaaS y aplicaciones", href: "/saas-video-production", text: "Vídeos explicativos, demostraciones de producto, animaciones y anuncios para marcas de SaaS, software y aplicaciones, adaptados a tu brief." },
      { name: "Vídeos con presentador (spokesperson)", href: "/spokesperson-video-production", text: "Vídeos protagonizados por un presentador para páginas web, demostraciones de producto, aplicaciones y campañas publicitarias." },
      { name: "Vídeo orgánico para redes sociales", href: "/social-media-video-production", text: "Estrategia de contenidos, producción, publicación y gestión de comunidades en Facebook, Instagram y TikTok." },
    ],
    outro: "Los precios y condiciones de los packs están disponibles en nuestra [[página de precios|/pricing]]. Trabajamos exclusivamente con empresas.",
  },
  founder: { badge: "Detrás de CONVRT", heading: "Un estudio dirigido por su fundador", paragraphs: [
    "CONVRT Studio está dirigido por su fundador, Mohamed Doukkali Azizi.",
    "Trabajas con un único estudio, sin tener que coordinar a varios proveedores.",
  ] },
  experience: {
    heading: "La experiencia de nuestro fundador",
    // the four figures themselves come from src/lib/siteStats.js; each label is the supplied bullet text after its figure
    labels: { videos: "vídeos producidos", views: "de visualizaciones generadas", clients: "clientes atendidos", returningClients: "de clientes recurrentes" },
    disclaimer: "Estas cifras reflejan la trayectoria profesional de nuestro fundador, incluidos los trabajos realizados a través de CONVRT Studio y sus proyectos anteriores de producción creativa.",
  },
  creators: { badge: "Personas reales ante la cámara", heading: "Cómo trabajamos con los creadores", paragraphs: [
    "CONVRT colabora con talento propio y creadores independientes. Te recomendamos al creador o presentador que mejor encaje con tu marca y compartimos muestras de trabajos relevantes antes de producir. Si lo deseas, puedes participar en la selección.",
    "Seleccionamos a los creadores en función de los objetivos de tu campaña, tu público objetivo y los conceptos creativos aprobados. La participación de un creador concreto está sujeta a su disponibilidad.",
    "Los creadores independientes interesados en colaborar con CONVRT pueden presentar su solicitud a través del [[formulario para creadores|" + CREATOR_FORM + "]]. CONVRT decide con quién colabora. Los vídeos solo se incorporan a nuestro escaparate de creadores con el consentimiento del creador y la aprobación de CONVRT.",
    "Nuestros vídeos UGC y con presentador se realizan con dirección creativa y control de calidad a cargo de personas.",
    "Los vídeos del [[escaparate de creadores|/creator-showcase]] son muestras de trabajos de creadores independientes. Ilustran distintos estilos y enfoques y no son necesariamente producciones de CONVRT.",
  ] },
  markets: { badge: "Sin fronteras", heading: "Mercados, producción e idiomas", paragraphs: [
    "Producimos en inglés, español, francés y árabe. Otros idiomas están disponibles bajo petición, según la disponibilidad de los creadores. CONVRT Studio está registrado en España.",
    "Ofrecemos producción de vídeo remota a través de nuestra red de creadores y rodajes presenciales en España. También se pueden organizar rodajes en otros países, en función de las necesidades del proyecto, la disponibilidad y la aprobación correspondiente. Los rodajes presenciales están sujetos al alcance del proyecto, la disponibilidad y, cuando proceda, al presupuesto correspondiente.",
  ] },
  scope: { badge: "Alcance de nuestros servicios", heading: "Qué ofrecemos y qué no", items: [
    { title: "Producción creativa, no compra de medios", text: "Ofrecemos estrategia creativa, guiones, selección de creadores, rodaje, edición y vídeos terminados, listos para publicar en las plataformas correspondientes. No compramos espacios publicitarios ni gestionamos tus cuentas de publicidad, por lo que conservas el control de la distribución y la inversión. No garantizamos resultados concretos: el rendimiento depende de tu oferta, tu audiencia y tu presupuesto." },
    { title: "Gestión de comunidades, no atención al cliente", text: "Los packs de contenido orgánico incluyen la publicación en tus cuentas y la gestión de comunidades, que abarca la interacción con la audiencia y las relaciones de la marca. La atención al cliente no forma parte del servicio." },
    { title: "Vídeos terminados, con material en bruto opcional", text: "Todos los vídeos se entregan terminados y editados profesionalmente. El material en bruto solo está disponible como complemento opcional de los vídeos terminados, nunca en sustitución de estos." },
    { title: "Derechos de uso mediante licencia", text: "Los derechos de uso establecen cómo puedes utilizar los vídeos durante el periodo incluido en tu pack. No implican la cesión de la titularidad de los derechos de autor." },
  ] },
  /* Owner's replacement copy (27 Nov 2026), written in his own words, not the supplied professional text. The brand name keeps its two words together (no-break space). */
  closing: { badge: "TRABAJEMOS JUNTOS", heading: "Hablemos de tu próxima campaña", text: "Mira lo que hicimos para [[Graspo|/case-studies/graspo]] y [[Elyon Dubai|/case-studies/elyon]]. Si tienes un proyecto en mente, [[cuéntanos qué necesitas|/contact]]. Y si buscas ideas para empezar, [[pídenos 5 ideas de anuncios para tu marca, gratis|/creative-growth-roadmap]].", primary: "Pide tus 5 ideas gratis", secondary: "Ver servicios" },
}
