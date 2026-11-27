/* SPANISH LEGAL DOCUMENTS (Política de privacidad, Términos y condiciones, Aviso legal).
   SOURCE (owner decision, 27 Nov 2026): the owner's professionally localized copy (CONVRT-ES.md), implemented VERBATIM. It replaces the previous translation. It is a translation of the English documents in
   src/content/trustPages.js; it is NOT legally certified or independently validated, and it is not a change to the approved commercial policies. Published only when the owner approves them
   (release gate in src/i18n/release.js, LEGAL_TRANSLATIONS_APPROVED in src/config.js).

   Same structure as the English source, clause for clause: same sections in the same order, same paragraphs and list items, same link targets, numbers, identifiers, dates and periods (proven by
   tests/legal-translations.test.mjs and scripts/legal-structure-check.mjs). Nothing here is rewritten: the owner's wording is kept; only machine-readable parts come from the code
   (operator details, the e-mail token, link targets, dates, the consent version) and link markup was added to the same words where the English text has a link.
   `c` is legalContext() (src/content/legal/context.js). Inline links: [[etiqueta|destino]]. Review notes: CONVRT/Claude/contact-legal-review/notes-es.json.
   The inactive-analytics wording (cookies and analytics paragraphs when Google Analytics is not configured) was NOT part of the supplied copy and is kept from the previous translation. */

const MONTHS = { January: 'enero', February: 'febrero', March: 'marzo', April: 'abril', May: 'mayo', June: 'junio', July: 'julio', August: 'agosto', September: 'septiembre', October: 'octubre', November: 'noviembre', December: 'diciembre' }
/* "27 November 2026" → "27 de noviembre de 2026" (the SAME date as the English document). */
const esDate = (en) => en.replace(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/, (m, d, mo, y) => (MONTHS[mo] ? `${d} de ${MONTHS[mo]} de ${y}` : m))

export default function LEGAL_ES(c) {
  const dates = { privacy: esDate(c.englishDates.privacy), terms: esDate(c.englishDates.terms), legalNotice: esDate(c.englishDates.legalNotice) }
  const mail = c.mail
  const op = c.operator
  const structure = 'profesional autónomo registrado en España' // "a self-employed professional (autónomo) registered in Spain"
  const address = op.address.replace(/, Spain$/, ', España')
  const L = c.links
  const privacyLabel = 'Política de privacidad'
  const termsLabel = 'Términos y condiciones' // the owner's decision (27 Nov 2026): the approved page name, also used by the navigation, footer and SEO title; the supplied copy said «Condiciones generales»
  const noticeLabel = 'Aviso legal'

  /* Identical in the Privacy Policy and the Legal Notice (English: operatorDetails()). */
  const operatorDetails = [
    `Nombre comercial: ${op.tradingName}`,
    `Titular: ${op.name}, ${structure}`,
    `Número de identificación fiscal (NIF): ${op.taxId}`,
    `Dirección postal: ${address}`,
    `Correo electrónico: ${mail}`,
    `Otras vías de contacto directo: [[formulario de contacto|${L.contact}]] y [[CONVRT Studio en LinkedIn|${L.companyLinkedin}]]`,
  ]

  const privacy = {
    h1: privacyLabel,
    intro: `Cómo trata CONVRT Studio los datos personales en www.convrt.studio. Última actualización: ${dates.privacy}.`,
    sections: [
      {
        heading: 'Responsable del tratamiento',
        body: [
          `El sitio web www.convrt.studio está operado por ${op.name}, ${structure}, que desarrolla su actividad bajo el nombre comercial ${op.tradingName} («CONVRT», «nosotros»). Determinamos cómo y para qué se utilizan los datos descritos a continuación; somos el responsable del tratamiento.`,
          { list: operatorDetails },
          `Para cualquier cuestión sobre esta política o tus datos, escribe a ${mail}. Los datos completos del titular figuran en nuestro [[${noticeLabel}|${L.legalNotice}]].`,
        ],
      },
      {
        heading: 'Ámbito de esta política',
        body: [
          'Se aplica a las personas que visitan este sitio web o nos envían consultas. Está dirigida a contactos profesionales: nuestros servicios se ofrecen a empresas, no a consumidores. Los creadores independientes que envían trabajos a través de nuestra página privada de incorporación reciben una información de privacidad específica en ese momento.',
        ],
      },
      {
        heading: 'Qué datos recogemos, para qué y con qué base jurídica',
        body: [
          'En cada apartado indicamos los datos recogidos, la finalidad y la base jurídica del tratamiento.',
          { list: [
            'Estrategia creativa gratuita (Creative Growth Roadmap). Respondes a cinco preguntas breves en tu navegador para comprobar si existe un buen encaje. Las respuestas permanecen en tu navegador y solo se utilizan para esa comprobación; no nos las envías. Si encajas, puedes reservar una llamada en Calendly (véase «Reserva de llamadas»).',
            'Hooks publicitarios gratuitos. Recogemos tu dirección de correo electrónico y el sector que seleccionas para enviarte los hooks solicitados. Base: tu solicitud. Es posible que te pidamos confirmar primero tu correo. Recibir los hooks no supone tu incorporación a nuestra lista de marketing.',
            'Solicitud de vídeo gratuito. Recogemos tu nombre, correo profesional, sitio web de la empresa, respuestas sobre tu negocio (tipo de negocio, intervalo de inversión publicitaria mensual, vídeos al mes, tipo de vídeo, plazos e interés en una producción continuada) y una descripción opcional para evaluar tu solicitud y contactarte al respecto. Base: medidas precontractuales que solicitas y nuestro interés legítimo en gestionar la oferta. Recibimos un aviso por correo de cada solicitud a través de Resend, nuestro proveedor de envío de correos.',
            'Programa de colaboradores por recomendación. Recogemos tu nombre, correo electrónico, tipo de colaborador, modalidad elegida y, opcionalmente, nombre de tu empresa o agencia y sitio web o perfil de LinkedIn, para evaluar tu solicitud y contactarte al respecto. Base: la misma que para la solicitud de vídeo gratuito. El formulario incluye una casilla obligatoria que confirma que podemos utilizar estos datos para esa finalidad.',
            'Formulario de consulta general. En la página de Contacto recogemos tu nombre, correo electrónico, nombre de la marca o empresa, servicio de interés, mensaje y confirmación de lectura de esta política y, opcionalmente, tu web o perfil social y un intervalo de presupuesto estimado. Nos enviamos estos datos por correo y los utilizamos para responderte, determinar si podemos ayudarte y de qué manera, y preparar una propuesta si la solicitas. No se incorporan a nuestra lista de marketing. Base: medidas precontractuales que solicitas y nuestro interés legítimo en responder a consultas profesionales.',
            'Solicitud de proyecto. Al solicitar un pack recogemos tu nombre, correo electrónico, nombre de la marca o empresa, web o perfil social, pack elegido, respuestas sobre el proyecto (descripción y objetivo, inversión publicitaria o actividad actual en redes sociales, tipo de producción y presupuesto estimado en proyectos a medida, disponibilidad para comenzar, fecha de inicio deseada e idiomas de producción) y tu confirmación de las condiciones del pack. También registramos el idioma de la página, la página de procedencia y, si llegaste mediante un enlace de campaña, sus parámetros (utm_source, utm_medium, utm_campaign, utm_content y utm_term) y, solo si aceptaste la analítica, la primera página de tu visita. Nos enviamos estos datos por correo para revisar personalmente tu solicitud y decidir el siguiente paso. El precio mostrado procede de nuestras tarifas, nunca de tu navegador. La solicitud no constituye una compra ni autoriza un pago. Los datos no se incorporan a nuestra lista de marketing. Base: la misma que para el formulario de consulta general.',
            'Correos y llamadas. Si nos escribes o reservas una llamada, utilizamos lo que nos envías para responderte y trabajar contigo. Base: tu solicitud y nuestro interés legítimo en atender consultas profesionales.',
            'Datos técnicos. Nuestro proveedor de alojamiento, Vercel, trata tu dirección IP y los datos de las solicitudes para prestar el servicio web y mantener su seguridad. Los vídeos se sirven a través de Cloudflare Stream. Base: nuestro interés legítimo en disponer de un sitio seguro y funcional.',
            'Formulario para creadores. El enlace para creadores independientes abre un formulario de Google; los datos que introduces se gestionan mediante Google Forms.',
            'Registros contables y legales. Si te conviertes en cliente, conservamos los contratos, facturas y registros exigidos por la ley. Base: obligación legal y contrato.',
          ] },
        ],
      },
      {
        heading: 'Correos de marketing (opcionales e independientes)',
        body: [
          'Solo enviamos correos promocionales (consejos creativos y ofertas) si marcas la casilla opcional que aparece junto a algunos formularios (no en el formulario de consulta general ni en la solicitud de proyecto). La casilla nunca está premarcada y puedes enviar todos los formularios sin marcarla. No marcarla no afecta a tu solicitud, al recurso solicitado ni a nuestra respuesta.',
          `El texto al que das tu consentimiento es (texto en inglés): «${c.marketingConsentText}». Mantenemos las solicitudes separadas de nuestra lista de marketing. Al marcar la casilla registramos tu consentimiento, la fecha y hora, el formulario utilizado y la versión del texto mostrado (actualmente ${c.marketingConsentVersion}), y añadimos tu dirección a la lista de marketing. Base: tu consentimiento.`,
          'Los correos sobre tu solicitud, el recurso solicitado, una reserva o un proyecto con nosotros son comunicaciones de servicio, no de marketing, y no dependen de esta elección.',
          'Puedes retirar tu consentimiento en cualquier momento y de forma gratuita: utiliza el enlace de baja de cualquier correo de marketing (todos incluyen dicho enlace e identifican al remitente) o escríbenos. La baja detiene los correos promocionales; conservamos un registro mínimo de la baja para no volver a enviártelos. Esto no afecta a las solicitudes que hayas presentado.',
        ],
      },
      {
        heading: 'Reserva de llamadas',
        body: [
          'No ofrecemos un calendario de reservas abierto. Si te invitamos a reservar una llamada (por ejemplo, tras completar nuestra estrategia creativa gratuita y comprobar que encajas, o después de responder a tu consulta), el calendario lo proporciona Calendly, una empresa independiente. El enlace abre Calendly en una pestaña nueva; también puedes escribirnos por correo. Calendly recoge los datos que introduces allí (como nombre, correo y respuestas) conforme a su propia información de privacidad. Recibimos los datos de la reserva y los utilizamos para realizar la llamada y darle seguimiento.',
          'No cargamos Calendly en este sitio web: ningún recurso de Calendly se carga en nuestras páginas. Al abrir el enlace accedes al sitio de Calendly, donde esta empresa y los servicios que utiliza (incluidos proveedores de pagos y monitorización) pueden instalar sus propias cookies conforme a su aviso de cookies. No las controlamos. Si lo prefieres, puedes escribirnos por correo.',
        ],
      },
      {
        heading: 'Cookies y almacenamiento del navegador',
        body: c.analyticsActive
          ? [
              'En este sitio, el almacenamiento estrictamente necesario está siempre activo; las cookies analíticas y de marketing (publicitarias) están desactivadas salvo que las habilites. El aviso de cookies permite aceptar todas, rechazarlas todas o elegir categorías. Puedes modificar o retirar tu elección en cualquier momento mediante el enlace «Configuración de cookies» del pie de página. Al retirar el consentimiento se detienen los eventos analíticos y se eliminan las cookies de Google de este sitio. Actualmente no instalamos cookies publicitarias. Estas elecciones se refieren solo a las cookies; el correo de marketing es una opción independiente en los formularios.',
            ]
          : [
              'Por ahora este sitio web no instala cookies de analítica ni de publicidad y no muestra ningún banner de cookies: Google Analytics no está activo (véase «Analítica»). Si lo activamos, aparecerá antes un banner de cookies, la analítica funcionará solo si lo aceptas y podrás cambiar o retirar tu elección en cualquier momento. Las opciones de cookies se refieren solo a las cookies; los correos de marketing son una elección aparte en nuestros formularios.',
            ],
      },
      {
        heading: 'Almacenamiento del navegador que utilizamos',
        body: [
          'El almacenamiento de este sitio en tu navegador permanece en tu dispositivo:',
          { list: [
            'convrt_consent_v1 (hasta que cambies tu elección o borres los datos del navegador): tu elección sobre cookies.',
            'convrt_language (hasta que borres los datos del navegador): el idioma que elegiste expresamente (inglés, español, francés o árabe), o el hecho de que cerraste la sugerencia de idioma, para no volver a preguntarte. No se nos envía ni modifica el contenido de una página. La sugerencia solo aparece a visitantes cuya solicitud procede de España (español), Francia u otro país francófono (francés), o un país arabófono (árabe): nuestro proveedor de alojamiento, Vercel, comunica a nuestro servidor el país de procedencia; el servidor solo responde sí o no y no almacena nada. Nunca se solicita la ubicación de tu navegador.',
            'convrt_scale_attribution (solo en esta pestaña): parámetros de campaña del enlace por el que llegaste (utm_source, utm_medium, utm_campaign, utm_content y utm_term), para transmitirlos al enlace de reserva o incluirlos en una solicitud que nos envíes. No almacenamos identificadores de clics publicitarios como gclid o fbclid.',
            'convrt_landing_page (solo durante esta sesión y si aceptas la analítica): primera página de tu visita, para conocer qué páginas generan consultas.',
            'Cookies de Google Analytics _ga y _ga_<container ID>, solo si aceptas la analítica: Google documenta una duración de hasta dos años.',
          ] },
          'Los servicios de terceros integrados, como el reproductor de vídeo, pueden instalar sus propias cookies conforme a sus avisos respectivos.',
        ],
      },
      {
        heading: 'Analítica',
        body: [
          c.analyticsActive
            ? 'Utilizamos Google Analytics a través de Google Tag Manager para saber qué páginas se visitan y cuáles generan consultas, únicamente si aceptas las cookies analíticas.'
            : 'Google Analytics, a través de Google Tag Manager, no está activo hoy en este sitio web: no se carga nada de Google y no se instalan cookies de analítica. Tenemos la intención de activarlo en el futuro. Cuando lo hagamos, funcionará solo si aceptas las cookies de analítica, y los puntos siguientes describen cómo.',
          'Los eventos analíticos registran visitas y acciones como pulsar una llamada a la acción o completar un formulario. Nunca incluyen tu nombre, correo ni datos que escribas en formularios. Nuestra configuración de Google Analytics es: Google signals desactivado, recogida de datos proporcionados por usuarios desactivada, seguimiento automático de interacciones con formularios desactivado, vistas de página por cambios del historial del navegador desactivadas y conservación de datos de eventos y usuarios durante 14 meses, sin restablecer el plazo con cada nueva actividad.',
        ],
      },
      {
        heading: 'Con quién compartimos los datos',
        body: [
          'Solo con proveedores que los gestionan por nuestra cuenta, conforme a sus condiciones y avisos de privacidad: MailerLite (registros de solicitudes, peticiones y listas de correo, y envío de correos), Resend (avisos por correo de solicitudes o consultas), Calendly (reservas, solo si te invitamos a reservar), Vercel (alojamiento), Cloudflare (distribución de vídeo) y Google (correo profesional, formulario para creadores y, cuando la analítica esté activada y solo si la aceptas, analítica). No disponemos de otra base de datos de clientes ni CRM. No vendemos datos personales.',
        ],
      },
      {
        heading: 'Transferencias fuera del Espacio Económico Europeo',
        body: [
          'Algunos proveedores son empresas estadounidenses o tratan datos en Estados Unidos. Según su propia documentación publicada, Resend almacena datos de clientes en Estados Unidos con independencia de la región de envío elegida y está certificado conforme al Marco de Privacidad de Datos UE-EE. UU.; Calendly está situado en Estados Unidos y se basa en dicho marco, con las cláusulas contractuales tipo de la UE como mecanismo alternativo; las condiciones de tratamiento de Cloudflare se basan en ese marco, con las cláusulas contractuales tipo como alternativa.',
          'Las funciones de nuestro sitio se ejecutan en Fráncfort (Alemania), en Vercel, empresa estadounidense; las páginas y archivos se distribuyen a través de su red global. Según su propia documentación publicada, Vercel y Google se basan en el Marco de Privacidad de Datos UE-EE. UU. y en las cláusulas contractuales tipo. En el caso de MailerLite, aún no hemos confirmado todos los lugares de almacenamiento ni la garantía aplicable a las transferencias. Puedes escribirnos a la dirección indicada para conocer la información de que disponemos.',
        ],
      },
      {
        heading: 'Durante cuánto tiempo conservamos los datos',
        body: [
          'Aplicamos estos plazos mediante revisiones periódicas de nuestros registros:',
          { list: [
            'Solicitudes y consultas, incluidas las solicitudes de proyecto y las copias del buzón de correo, que no desembocan en un proyecto: 12 meses desde el último contacto significativo contigo.',
            'Registros de reservas: 12 meses, salvo que una relación comercial vigente justifique conservarlos durante más tiempo.',
            'Lista de marketing: hasta que retires el consentimiento o te des de baja, con revisión periódica de direcciones inactivas.',
            'Contratos, facturas y registros contables: durante el plazo exigido por la legislación española.',
            'Datos de eventos y usuarios de Google Analytics (cuando esté activado): 14 meses.',
          ] },
        ],
      },
      {
        heading: 'Tus derechos y cómo reclamar',
        body: [
          'Puedes solicitarnos acceso, rectificación o supresión de tus datos personales, limitación del tratamiento, oposición al mismo y una copia en formato portable. Cuando el tratamiento se base en tu consentimiento, puedes retirarlo en cualquier momento, por ejemplo, dándote de baja de los correos o cambiando la configuración de cookies. La retirada no afecta al tratamiento anterior.',
          `Para ejercer estos derechos escribe a ${mail}. Responderemos dentro del plazo legal.`,
          'Puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD), en www.aepd.es, o ante la autoridad del país donde residas o trabajes.',
        ],
      },
      {
        heading: 'Seguridad y menores',
        body: ['Utilizamos proveedores de confianza y limitamos el acceso a las solicitudes, pero ningún sistema es completamente seguro. El sitio se dirige a usuarios profesionales y no está destinado a menores.'],
      },
      {
        heading: 'Cambios',
        body: [`Podemos actualizar esta política y modificaremos la fecha cuando lo hagamos. Véanse también nuestros [[${termsLabel}|${L.terms}]] y [[${noticeLabel}|${L.legalNotice}]].`],
      },
    ],
  }

  const terms = {
    h1: termsLabel,
    intro: `Condiciones de uso del sitio web de CONVRT Studio y de sus ofertas gratuitas, y condiciones comerciales generales de los packs de pago. Última actualización: ${dates.terms}.`,
    sections: [
      {
        heading: 'Sobre estas condiciones',
        body: [
          `Al utilizar www.convrt.studio aceptas estas condiciones. El sitio está operado por ${op.name}, que desarrolla su actividad bajo el nombre comercial ${op.tradingName}; los datos completos figuran en el [[${noticeLabel}|${L.legalNotice}]]. Estas condiciones están dirigidas a empresas: nuestros servicios se ofrecen exclusivamente a empresas y el sitio no está destinado a consumidores. Consulta también nuestra [[${privacyLabel}|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Uso del sitio web',
        body: [
          'Puedes utilizar el sitio para informarte sobre nuestros servicios, contactarnos o solicitar nuestras ofertas. No hagas un uso indebido: no intentes interferir en su funcionamiento ni acceder sin autorización, enviar información falsa o engañosa mediante sus formularios ni utilizarlos para enviarnos comunicaciones comerciales no solicitadas.',
        ],
      },
      {
        heading: 'Consultas y solicitudes',
        body: [
          `Enviar una consulta o solicitud no crea un contrato ni obliga a ninguna de las partes. Revisamos personalmente las solicitudes, podemos rechazarlas o no responder y no garantizamos un plazo de respuesta. Facilita información exacta. Enviar una solicitud o confirmar que has leído la información de un pack no constituye un acuerdo de compra vinculante ni autoriza un pago. El tratamiento de estos datos se describe en la [[${privacyLabel}|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Oferta de conceptos creativos gratuitos',
        body: [
          'La estrategia creativa gratuita (Creative Growth Roadmap) ofrece cinco conceptos publicitarios personalizados, presentados en una llamada, para empresas que encajen con la oferta. No incluye la producción de los anuncios, no obliga a contratar a CONVRT y los conceptos se facilitan para tu evaluación.',
        ],
      },
      {
        heading: 'Requisitos para la producción de vídeo gratuita',
        body: [
          'La producción gratuita de vídeo está limitada y requiere solicitud. Revisamos cada solicitud e invitamos a las empresas adecuadas a una breve llamada antes de iniciar la producción. La oferta está sujeta al encaje y a las condiciones de producción; no garantizamos la aceptación de una solicitud. Incluye un vídeo y dos variantes adicionales del hook. El alcance definitivo se confirma por escrito con la empresa seleccionada.',
        ],
      },
      {
        heading: 'Hooks publicitarios y otros recursos gratuitos',
        body: ['Enviamos los hooks gratuitos a la dirección de correo que facilites. Constituyen inspiración creativa de carácter general y se facilitan tal cual.'],
      },
      {
        heading: 'Nuestros servicios y cómo se contratan',
        body: [
          'Los packs y precios del sitio describen nuestra forma habitual de trabajar. Un servicio de pago comienza únicamente cuando hemos acordado por escrito el alcance, el precio y las condiciones. Todos los precios excluyen el IVA. Los impuestos aplicables se calcularán en función de la ubicación y situación fiscal de tu empresa.',
          'Los proyectos a medida, incluidas las demostraciones y los vídeos explicativos para SaaS y aplicaciones, se definen individualmente.',
        ],
      },
      {
        heading: 'Pago',
        body: [
          'Los packs de producción puntuales se abonan íntegramente por adelantado, salvo acuerdo escrito en contrario. Los packs mensuales se facturan mensualmente por adelantado. Las facturas deben abonarse dentro de los siete días naturales siguientes a su fecha de emisión, salvo acuerdo escrito en contrario.',
          'La producción no comienza hasta recibir el pago inicial requerido. Si un pago está vencido, podemos suspender la producción y ajustar los plazos de entrega. Nada de lo dispuesto limita nuestros derechos conforme a la legislación aplicable en materia de morosidad.',
        ],
      },
      {
        heading: 'Compromisos, cancelaciones y reembolsos',
        body: [
          'Los packs mensuales Creative Testing Sprint y Sprint Plus tienen un compromiso inicial de tres meses. Organic Light y Organic Growth tienen un compromiso inicial de seis meses. Transcurrido el compromiso inicial, los packs mensuales continúan mes a mes, salvo acuerdo escrito en contrario.',
          'La cancelación de un pack mensual requiere un preaviso escrito de al menos 30 días naturales antes de la fecha de renovación aplicable. No puede surtir efecto antes de cumplir el compromiso inicial, salvo acuerdo escrito en contrario, y no extingue las obligaciones de pago pendientes.',
          'Los packs puntuales no se renuevan automáticamente. Si cancelas antes de que comience el trabajo, reembolsaremos el importe abonado, descontando los costes no recuperables acordados en los que ya se haya incurrido. Si cancelas después de que haya comenzado el trabajo, tendremos derecho al pago del trabajo realizado y de los costes de producción no recuperables acordados, incluidas las reservas de creadores y otros gastos comprometidos, y se reembolsará el saldo restante que corresponda.',
          'El trabajo terminado y entregado no es reembolsable por el mero hecho de que cambies de opinión o de que el contenido no consiga los resultados de marketing deseados. Estas disposiciones no limitan los derechos ni las vías de reclamación de carácter imperativo.',
        ],
      },
      {
        heading: 'Tus responsabilidades, plazos y retrasos',
        body: [
          'Debes proporcionar la información, los materiales y las aprobaciones razonablemente necesarios para completar tu proyecto. Según el proyecto, pueden incluir:',
          { list: [
            'muestras de producto y envío puntual de los productos;',
            'directrices y recursos de marca;',
            'información exacta sobre productos o servicios;',
            'accesos, permisos y documentación de apoyo pertinentes;',
            'comentarios y aprobaciones;',
            'confirmación de que los materiales aportados y las afirmaciones publicitarias pueden utilizarse legalmente.',
          ] },
          'Los plazos de producción de los packs Creative Testing comienzan cuando se recibe el pago requerido, están disponibles los materiales y productos necesarios y se han aprobado los conceptos y guiones pertinentes. Los retrasos en la recepción de productos, información, comentarios o aprobaciones pueden ampliar los plazos de producción y entrega. CONVRT no responde de retrasos provocados por la falta de entrega puntual de los materiales o aprobaciones necesarios.',
          'Los costes adicionales derivados de cambios sustanciales solicitados por el cliente o de retrasos se te comunicarán y acordarán antes de incurrir en ellos.',
        ],
      },
      {
        heading: 'Revisiones',
        body: [
          'Cada pack Creative Testing incluye dos rondas de revisiones por concepto, tal como se indica en la página de precios. Las revisiones incluidas abarcan ajustes razonables dentro del brief acordado inicialmente. Las revisiones adicionales están disponibles con un coste adicional que se acuerda contigo antes de iniciar el trabajo correspondiente.',
          'Los cambios de conceptos, guiones, dirección creativa o alcance ya aprobados que requieran una producción adicional considerable o un nuevo rodaje podrán presupuestarse por separado. Las correcciones necesarias porque CONVRT no haya respetado el brief acordado no cuentan como revisiones incluidas.',
        ],
      },
      {
        heading: 'Escaparate de creadores',
        body: ['Los vídeos del escaparate de creadores y de las galerías de servicios son muestras de creadores independientes. Se muestran para ilustrar estilos y enfoques y no son necesariamente producciones de CONVRT.'],
      },
      {
        heading: 'Derechos de uso',
        body: [
          `Cuando un pack incluye derechos de uso, estos conceden una licencia sobre cómo utilizar los vídeos terminados (por ejemplo, ${c.usageMonths} meses de uso mundial en los packs estándar). No constituyen una cesión de la titularidad de los derechos de autor. Las condiciones exactas figuran en tu acuerdo.`,
        ],
      },
      {
        heading: 'Contenido del sitio y propiedad intelectual',
        body: [
          'Los textos, el diseño, el logotipo, las marcas y los contenidos originales del sitio pertenecen a CONVRT o a sus autores y no pueden copiarse, reutilizarse ni adaptarse sin permiso, salvo en los casos permitidos por la ley. Los vídeos mostrados siguen siendo propiedad de sus titulares y se muestran con su autorización. Los enlaces a servicios de terceros se ofrecen por comodidad; no respondemos de sus contenidos ni prácticas.',
        ],
      },
      {
        heading: 'Ausencia de garantía de resultados',
        body: ['No garantizamos resultados empresariales o publicitarios concretos, como ventas, leads, retorno de la inversión publicitaria o crecimiento de audiencia. El rendimiento depende de factores como tu oferta, audiencia, presupuesto y plataforma. Los ejemplos y casos de éxito muestran lo ocurrido en las empresas correspondientes y no prometen que obtendrás los mismos resultados.'],
      },
      {
        heading: 'Responsabilidad',
        body: [
          'El sitio web y sus contenidos se facilitan tal cual. En la medida permitida por la ley, CONVRT no responde de daños indirectos o consecuenciales ni de pérdidas de beneficios, ingresos o datos derivados del uso del sitio o de la confianza depositada en su contenido. Su responsabilidad total por el uso del sitio se limita a los daños directos. Nada de lo dispuesto limita la responsabilidad que legalmente no pueda limitarse.',
        ],
      },
      {
        heading: 'Legislación aplicable y litigios',
        body: ['Estas condiciones se rigen por la legislación española. Los litigios entre CONVRT y un usuario profesional se someten a los juzgados y tribunales españoles competentes.'],
      },
      {
        heading: 'Condiciones del sitio y acuerdos individuales con clientes',
        body: [
          'Estas condiciones regulan el uso del sitio y las ofertas gratuitas y establecen nuestro marco comercial general para packs de pago. No impiden acuerdos negociados individualmente: cada proyecto de pago se rige por el acuerdo, pedido o propuesta escritos que ambas partes acepten. Si un acuerdo escrito individualmente negociado entra en conflicto con estas condiciones, prevalece para ese proyecto, sin perjuicio de la legislación imperativa aplicable.',
        ],
      },
      {
        heading: 'Cambios y contacto',
        body: [`Podemos actualizar estas condiciones y modificaremos la fecha cuando lo hagamos. Consultas: ${mail}.`],
      },
    ],
  }

  const legalNotice = {
    h1: noticeLabel,
    intro: `Información sobre el titular de www.convrt.studio que debe estar disponible en un sitio web comercial conforme al artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información. Última actualización: ${dates.legalNotice}.`,
    sections: [
      {
        heading: 'Titular del sitio web',
        body: [{ list: operatorDetails }],
      },
      {
        heading: 'Actividad y destinatarios',
        body: [
          'CONVRT Studio es un estudio creativo dirigido por su fundador que produce vídeos UGC, vídeos para SaaS y aplicaciones, vídeos con presentador y contenido orgánico en vídeo para redes sociales de empresas. Sus servicios se ofrecen exclusivamente a empresas, no a consumidores.',
        ],
      },
      {
        heading: 'Precios e impuestos',
        body: [`Los precios de este sitio se muestran en dólares estadounidenses (USD) o euros (EUR), según se indique en la página correspondiente. La moneda aplicable, el precio y las condiciones de pago se confirmarán en el acuerdo escrito del proyecto. Todos los precios excluyen el IVA. Los impuestos aplicables se calcularán según la ubicación y situación fiscal de tu empresa. Consulta la [[página de precios|${L.pricing}]].`],
      },
      {
        heading: 'Propiedad intelectual',
        body: [
          'Los textos, el diseño, el logotipo, las marcas y los contenidos originales de este sitio pertenecen a CONVRT o a sus autores y no pueden copiarse, reutilizarse ni adaptarse sin permiso, salvo en los casos permitidos por la ley. Los vídeos del escaparate de creadores son muestras de creadores independientes y siguen siendo propiedad de sus titulares.',
        ],
      },
      {
        heading: 'Contenidos y enlaces',
        body: [
          'Publicamos la información del sitio de buena fe y podemos modificarla en cualquier momento. No garantiza ningún resultado. Los enlaces a otros sitios se ofrecen por comodidad; no respondemos de sus contenidos.',
        ],
      },
      {
        heading: 'Datos personales y cookies',
        body: [`El tratamiento de datos personales, las cookies y el almacenamiento del navegador se explican en nuestra [[${privacyLabel}|${L.privacy}]].`],
      },
      {
        heading: 'Condiciones, legislación aplicable y jurisdicción',
        body: [`El uso del sitio y las ofertas gratuitas se rigen por nuestros [[${termsLabel}|${L.terms}]]. Se aplica la legislación española y los litigios entre CONVRT y un usuario profesional se someten a los juzgados y tribunales españoles competentes.`],
      },
    ],
  }

  return { privacy, terms, legalNotice }
}
