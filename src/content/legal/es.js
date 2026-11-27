/* SPANISH LEGAL DOCUMENTS (Política de privacidad, Términos y condiciones, Aviso legal): a faithful translation of the English documents in src/content/trustPages.js, FOR OWNER AND LEGAL REVIEW.
   NOT legally certified or independently validated; not published until the owner approves them (release gate in src/i18n/release.js).

   Same structure as the English source, clause for clause: same sections in the same order, same paragraphs and list items, same link targets, numbers, identifiers, dates and periods.
   Nothing is added, omitted, summarised or "improved": no English-precedence clause, no new legal basis, no new retention period, no change of governing law or jurisdiction.
   `c` is legalContext() (src/content/legal/context.js). Inline links: [[etiqueta|destino]]. Review notes: CONVRT/Claude/contact-legal-review/notes-es.json. */

const MONTHS = { January: 'enero', February: 'febrero', March: 'marzo', April: 'abril', May: 'mayo', June: 'junio', July: 'julio', August: 'agosto', September: 'septiembre', October: 'octubre', November: 'noviembre', December: 'diciembre' }
/* "21 November 2026" → "21 de noviembre de 2026" (the SAME date, never today's). */
const esDate = (en) => en.replace(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/, (m, d, mo, y) => (MONTHS[mo] ? `${d} de ${MONTHS[mo]} de ${y}` : m))

export default function LEGAL_ES(c) {
  const dates = { privacy: esDate(c.englishDates.privacy), terms: esDate(c.englishDates.terms), legalNotice: esDate(c.englishDates.legalNotice) }
  const mail = c.mail
  const op = c.operator
  const structure = 'profesional autónomo registrado en España' // "a self-employed professional (autónomo) registered in Spain"
  const address = op.address.replace(/, Spain$/, ', España')
  const L = c.links
  const privacyLabel = 'Política de privacidad'
  const termsLabel = 'Términos y condiciones'
  const noticeLabel = 'Aviso legal'
  const taxStatement = 'Todos los precios excluyen el IVA. Los impuestos aplicables se calcularán en función de la ubicación y la situación fiscal de tu empresa.'

  /* Identical in the Privacy Policy and the Legal Notice (English: operatorDetails()). */
  const operatorDetails = [
    `Nombre comercial: ${op.tradingName}`,
    `Titular: ${op.name}, ${structure}`,
    `Número de identificación fiscal (NIF): ${op.taxId}`,
    `Domicilio postal: ${address}`,
    `Correo electrónico: ${mail}`,
    `Otras vías de contacto directo: [[formulario de contacto|${L.contact}]] y [[CONVRT Studio en LinkedIn|${L.companyLinkedin}]]`,
  ]

  const privacy = {
    h1: privacyLabel,
    intro: `Cómo trata CONVRT Studio la información personal en www.convrt.studio. Última actualización: ${dates.privacy}.`,
    sections: [
      {
        heading: 'Quién es responsable de tu información',
        body: [
          `El sitio web www.convrt.studio está gestionado por ${op.name}, ${structure}, que opera con el nombre comercial ${op.tradingName} («CONVRT», «nosotros»). Decidimos cómo y para qué se utiliza la información descrita a continuación (somos el «responsable del tratamiento»).`,
          { list: operatorDetails },
          `Para cualquier cuestión sobre esta política o sobre tu información, escribe a ${mail}. Los datos completos del titular figuran en nuestro [[${noticeLabel}|${L.legalNotice}]].`,
        ],
      },
      {
        heading: 'Qué abarca esta política',
        body: [
          'A los visitantes y a las personas que nos hacen consultas en este sitio web. Está redactada para contactos profesionales: nuestros servicios se ofrecen a empresas, no a consumidores. Los creadores freelance que envían trabajos a través de nuestra página privada de incorporación reciben un aviso de privacidad aparte en ese paso.',
        ],
      },
      {
        heading: 'Qué recogemos, para qué y con qué base jurídica',
        body: [
          'Cada punto siguiente indica qué recogemos, para qué y en qué base jurídica nos apoyamos.',
          { list: [
            'Hoja de Ruta de Crecimiento Creativo gratuita. Respondes a cinco preguntas breves en tu navegador para comprobar el encaje. Tus respuestas permanecen en tu navegador y se usan solo para esa comprobación; no se nos envían. Si encajas, puedes reservar una llamada en Calendly (véase «Reserva de una llamada»).',
            'Hooks publicitarios gratuitos. Recogemos tu dirección de correo electrónico y el sector que eliges, y los usamos para enviarte los hooks que has pedido. Base: tu solicitud. Podemos pedirte que confirmes antes tu correo electrónico. Recibir los hooks no te añade a nuestra lista de marketing.',
            'Solicitud de vídeo gratuito. Recogemos tu nombre, tu correo electrónico profesional, el sitio web de tu empresa, tus respuestas sobre tu negocio (tipo de negocio, rango de inversión mensual en publicidad, vídeos al mes, tipo de vídeo, plazos, interés en una producción continuada) y una descripción opcional, para revisar la solicitud y ponernos en contacto contigo al respecto. Base: las medidas que nos pides adoptar antes de un acuerdo y nuestro interés legítimo en gestionar la oferta. Recibimos un aviso por correo electrónico de cada solicitud a través de nuestro proveedor de envío de correo, Resend.',
            'Programa de socios recomendadores. Recogemos tu nombre, tu correo electrónico, el tipo de socio, el programa elegido y, opcionalmente, el nombre de tu empresa o agencia y tu sitio web o perfil de LinkedIn, para revisar tu solicitud y ponernos en contacto contigo al respecto. Base: la misma que en la solicitud de vídeo gratuito. El formulario incluye una casilla obligatoria que confirma que podemos usar estos datos con ese fin.',
            'Formulario de consulta general. En la página de Contacto recogemos tu nombre, tu correo electrónico, el nombre de tu marca o empresa, el servicio que te interesa, tu mensaje y tu confirmación de que has leído esta política y, opcionalmente, tu sitio web o perfil social y un rango de presupuesto estimado. Nos enviamos estos datos por correo electrónico y los usamos para responderte, para decidir si podemos ayudarte y cómo, y para preparar una propuesta si la pides. No se añaden a nuestra lista de marketing. Base: las medidas que nos pides adoptar antes de un acuerdo y nuestro interés legítimo en atender consultas comerciales.',
            'Solicitud de proyecto. Cuando solicitas un paquete recogemos tu nombre, tu correo electrónico, el nombre de tu marca o empresa, tu sitio web o perfil social, el paquete que has seleccionado, tus respuestas sobre tu proyecto (una descripción y un objetivo, tu inversión publicitaria o tu actividad actual en redes sociales, en los proyectos personalizados el tipo de producción y un presupuesto estimado, en qué plazo estás listo, la fecha de inicio deseada y los idiomas de producción) y tu confirmación de que entiendes las condiciones del paquete. También registramos el idioma de la página, la página de la que vienes y, si has llegado por un enlace de campaña, sus datos de campaña (utm_source, utm_medium, utm_campaign, utm_content y utm_term) y, solo si has aceptado la analítica, la primera página de tu visita. Nos enviamos estos datos por correo electrónico para revisar tu solicitud y decidir personalmente el siguiente paso. El precio que se muestra procede de nuestros propios precios, nunca de tu navegador. La solicitud no es una compra ni autoriza ningún pago. No se añaden a nuestra lista de marketing. Base: la misma que en el formulario de consulta general.',
            'Correo electrónico y llamadas. Si nos escribes o reservas una llamada, usamos lo que nos envías para responderte y trabajar contigo. Base: tu solicitud y nuestro interés legítimo en atender consultas profesionales.',
            'Datos técnicos. Nuestro proveedor de alojamiento, Vercel, trata tu dirección IP y los datos de la petición para servir el sitio web y mantenerlo seguro. Los vídeos del sitio se entregan a través de Cloudflare Stream. Base: nuestro interés legítimo en un sitio web seguro y que funcione.',
            'Formulario para creadores. El enlace para creadores freelance abre un Formulario de Google; lo que introduces allí se gestiona a través de Google Forms.',
            'Registros contables y legales. Si te conviertes en cliente, conservamos los contratos, las facturas y los registros que exige la ley. Base: obligación legal y ejecución del contrato.',
          ] },
        ],
      },
      {
        heading: 'Correos de marketing (opcionales e independientes de todo lo demás)',
        body: [
          'Enviamos correos promocionales (consejos creativos y ofertas) solo si marcas la casilla opcional que aparece junto a algunos de nuestros formularios (no el formulario de consulta general ni la solicitud de proyecto). La casilla nunca está marcada de antemano y puedes enviar todos los formularios sin marcarla. No marcarla nunca afecta a tu solicitud, al recurso que has pedido ni a ninguna respuesta nuestra.',
          `El texto que aceptas es (texto en inglés): "${c.marketingConsentText}" Mantenemos separadas las solicitudes y peticiones de nuestra lista de marketing. Cuando marcas la casilla registramos que has dado tu consentimiento, la fecha y la hora, el formulario que has utilizado y la versión del texto que has visto (actualmente ${c.marketingConsentVersion}), y añadimos tu dirección a la lista de marketing. Base: tu consentimiento.`,
          'Los correos sobre tu solicitud, el recurso que has pedido, una reserva o un proyecto que tengas con nosotros son mensajes de servicio, no de marketing, y no quedan cubiertos por esta elección.',
          'Puedes retirar tu consentimiento en cualquier momento y sin coste: usa el enlace para darte de baja que incluye cualquier correo de marketing (todos incluyen uno e indican quiénes somos) o escríbenos. Darte de baja detiene los correos promocionales; conservamos un registro mínimo de que te has dado de baja para no volver a escribirte. No afecta a ninguna solicitud que hayas hecho.',
        ],
      },
      {
        heading: 'Reserva de una llamada',
        body: [
          'No ofrecemos un calendario de reservas abierto. Si te invitamos a reservar una llamada (por ejemplo, después de que completes nuestra Hoja de Ruta de Crecimiento Creativo gratuita y encajes, o después de que respondamos a tu consulta), el calendario de reservas lo proporciona Calendly, una empresa independiente. El enlace de reserva abre Calendly en una pestaña nueva; también puedes escribirnos. Calendly recoge los datos que introduces allí (como tu nombre, tu correo electrónico y tus respuestas) conforme a su propio aviso de privacidad, y nosotros recibimos los datos de la reserva y los usamos para celebrar la llamada y hacer su seguimiento.',
          'No cargamos Calendly en este sitio web: no se carga nada de Calendly en nuestras páginas. Cuando abres el enlace de reserva, estás en el sitio web propio de Calendly, donde Calendly y los servicios que utiliza (incluidos sus proveedores de pagos y de monitorización) pueden instalar cookies propias conforme al aviso de cookies de Calendly. No las controlamos. Si prefieres, puedes escribirnos.',
        ],
      },
      {
        heading: 'Cookies y almacenamiento del navegador',
        body: c.analyticsActive
          ? [
              'Opciones de cookies en este sitio web: el almacenamiento estrictamente necesario está siempre activado; las cookies de analítica y las cookies de marketing (publicidad) están desactivadas salvo que las actives. El banner de cookies te permite aceptarlas todas, rechazarlas todas o elegir categorías, y puedes cambiar o retirar tu elección en cualquier momento con el enlace «Configuración de cookies» del pie de página. Retirar tu elección detiene los eventos de analítica y elimina las cookies de Google de este sitio. Hoy el sitio no instala cookies de publicidad. Estas opciones se refieren solo a las cookies; los correos de marketing son una elección aparte en nuestros formularios.',
            ]
          : [
              'Por ahora este sitio web no instala cookies de analítica ni de publicidad y no muestra ningún banner de cookies: Google Analytics no está activo (véase «Analítica»). Si lo activamos, aparecerá antes un banner de cookies, la analítica funcionará solo si lo aceptas y podrás cambiar o retirar tu elección en cualquier momento. Las opciones de cookies se refieren solo a las cookies; los correos de marketing son una elección aparte en nuestros formularios.',
            ],
      },
      {
        heading: 'Almacenamiento del navegador que utilizamos',
        body: [
          'El almacenamiento de tu navegador en este sitio permanece en tu dispositivo:',
          { list: [
            'convrt_consent_v1 (se conserva hasta que lo cambies o borres los datos de tu navegador): tu elección sobre las cookies.',
            'convrt_language (se conserva hasta que borres los datos de tu navegador): el idioma que has elegido a propósito (inglés, español, francés o árabe), o que has cerrado la sugerencia de idioma, para que no volvamos a preguntarte. Nunca se nos envía y nunca cambia lo que muestra una página. La propia sugerencia aparece solo a los visitantes cuya petición procede de España (español), de Francia o de otro país francófono (francés), o de un país de habla árabe (árabe): nuestro proveedor de alojamiento (Vercel) comunica a nuestro servidor el país de la petición, nuestro servidor responde únicamente sí o no y no almacena nada, y nunca se solicita la ubicación de tu navegador.',
            'convrt_scale_attribution (solo esta pestaña del navegador): los datos de campaña del enlace por el que has llegado (utm_source, utm_medium, utm_campaign, utm_content y utm_term), para poder transmitirlos a nuestro enlace de reservas o incluirlos en una solicitud que nos envíes. No almacenamos identificadores de clics publicitarios (como gclid o fbclid).',
            'convrt_calendly_requested (solo esta sesión del navegador): que has pedido ver el calendario de reservas.',
            'convrt_landing_page (solo esta sesión del navegador, y solo si aceptas la analítica): la primera página de tu visita, que se usa para ver qué páginas dan lugar a consultas.',
            'Cookies de Google Analytics _ga y _ga_<container ID>, solo si aceptas la analítica: Google documenta para ellas una duración de hasta dos años.',
          ] },
          'El calendario de reservas y cualquier otro servicio de terceros incorporado instalan cookies propias, conforme a sus propios avisos.',
        ],
      },
      {
        heading: 'Analítica',
        body: [
          c.analyticsActive
            ? 'Este sitio web utiliza Google Analytics, a través de Google Tag Manager, para ver qué páginas se visitan y cuáles dan lugar a consultas, pero solo si aceptas las cookies de analítica.'
            : 'Google Analytics, a través de Google Tag Manager, no está activo hoy en este sitio web: no se carga nada de Google y no se instalan cookies de analítica. Tenemos la intención de activarlo en el futuro. Cuando lo hagamos, funcionará solo si aceptas las cookies de analítica, y los puntos siguientes describen cómo.',
          'Los eventos de analítica registran visitas a páginas y acciones como hacer clic en una llamada a la acción o completar un formulario. Nunca incluyen tu nombre, tu correo electrónico ni nada de lo que escribas en un formulario. Nuestros ajustes de Google Analytics son: señales de Google desactivadas, recogida de datos facilitados por el usuario desactivada, seguimiento automático de la interacción con formularios desactivado, visitas a páginas por el historial del navegador desactivadas, y datos de eventos y de usuarios conservados durante 14 meses con «restablecer con nueva actividad» desactivado.',
        ],
      },
      {
        heading: 'Con quién compartimos información',
        body: [
          'Solo con proveedores de servicios que la tratan por nuestra cuenta, conforme a sus propios términos estándar y avisos de privacidad: MailerLite (registros de solicitudes, peticiones y lista de correo, y envío de nuestros correos), Resend (avisos por correo electrónico para nosotros cuando alguien presenta una solicitud o envía una consulta), Calendly (reservas, solo si te invitamos a reservar), Vercel (alojamiento), Cloudflare (entrega de vídeo) y Google (nuestro correo electrónico profesional, el formulario de Google para creadores independientes y, una vez activada la analítica y solo si la aceptas, la analítica). No tenemos ninguna otra base de datos de clientes ni CRM. No vendemos información personal.',
        ],
      },
      {
        heading: 'Transferencias fuera del Espacio Económico Europeo',
        body: [
          'Algunos de estos proveedores son empresas estadounidenses o tratan información en Estados Unidos. Según su propia documentación publicada, Resend almacena los datos de sus clientes en Estados Unidos, sea cual sea la región de envío seleccionada, y está certificada en el Marco de Privacidad de Datos UE-EE. UU.; Calendly tiene su sede en Estados Unidos y se apoya en el Marco de Privacidad de Datos UE-EE. UU., con las Cláusulas Contractuales Tipo de la UE como alternativa; y los términos de tratamiento de datos de Cloudflare se apoyan en el Marco de Privacidad de Datos UE-EE. UU., con las Cláusulas Contractuales Tipo como alternativa.',
          'Las funciones de nuestro sitio web se ejecutan en Fráncfort (Alemania), en Vercel, una empresa estadounidense; las páginas y los archivos del sitio web se entregan a través de la red global de Vercel. Según su propia documentación publicada, Vercel y Google se apoyan en el Marco de Privacidad de Datos UE-EE. UU. y en las Cláusulas Contractuales Tipo. En el caso de MailerLite todavía no hemos confirmado todos los lugares donde se almacena la información ni la garantía de transferencia que se aplica. Puedes pedirnos, en la dirección indicada más arriba, lo que sabemos.',
        ],
      },
      {
        heading: 'Cuánto tiempo la conservamos',
        body: [
          'Estos son nuestros plazos de conservación. Los aplicamos revisando nuestros registros periódicamente:',
          { list: [
            'Solicitudes, consultas y solicitudes de proyecto (incluidas las copias conservadas en nuestra bandeja de correo electrónico) que no dan lugar a un proyecto: 12 meses desde nuestro último contacto relevante contigo.',
            'Registros de reservas: 12 meses, salvo que una relación comercial en curso justifique conservarlos más tiempo.',
            'Lista de correo de marketing: hasta que retires tu consentimiento o te des de baja, con una revisión periódica de las direcciones inactivas.',
            'Contratos, facturas y registros contables: el tiempo que exija la legislación española.',
            'Datos de eventos y de usuarios de Google Analytics (una vez activada la analítica): 14 meses.',
          ] },
        ],
      },
      {
        heading: 'Tus derechos y cómo presentar una reclamación',
        body: [
          'Puedes pedirnos que te demos acceso a tu información personal, que la rectifiquemos o la suprimamos, que limitemos su uso o que nos opongamos a él, y recibir una copia en un formato portable. Cuando nos basamos en el consentimiento, puedes retirarlo en cualquier momento, por ejemplo dándote de baja de un correo o cambiando tu configuración de cookies; retirarlo no afecta a lo que hicimos antes.',
          `Para ejercer estos derechos, escribe a ${mail}. Te responderemos dentro del plazo que permita la ley.`,
          'Puedes presentar una reclamación ante la autoridad española de protección de datos, la Agencia Española de Protección de Datos (AEPD), en www.aepd.es, o ante la autoridad del país en el que vives o trabajas.',
        ],
      },
      {
        heading: 'Seguridad y menores',
        body: ['Utilizamos proveedores de confianza y limitamos quién puede ver las solicitudes, pero ningún sistema es completamente seguro. El sitio web está pensado para usuarios profesionales y no se dirige a menores.'],
      },
      {
        heading: 'Cambios',
        body: [`Podemos actualizar esta política y cambiaremos la fecha cuando lo hagamos. Relacionado: nuestros [[${termsLabel}|${L.terms}]] y nuestro [[${noticeLabel}|${L.legalNotice}]].`],
      },
    ],
  }

  const terms = {
    h1: termsLabel,
    intro: `Los términos para utilizar el sitio web de CONVRT Studio y sus ofertas gratuitas, y nuestras condiciones comerciales generales para los paquetes de pago. Última actualización: ${dates.terms}.`,
    sections: [
      {
        heading: 'Sobre estos términos',
        body: [
          `Al utilizar www.convrt.studio aceptas estos términos. El sitio está gestionado por ${op.name}, que opera con el nombre comercial ${op.tradingName}; los datos completos del titular figuran en el [[${noticeLabel}|${L.legalNotice}]]. Estos términos están dirigidos a empresas: nuestros servicios se ofrecen únicamente a empresas y el sitio web no está pensado para consumidores. Consulta también nuestra [[${privacyLabel}|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Uso del sitio web',
        body: [
          'Puedes utilizar el sitio web para informarte sobre nuestros servicios y para ponerte en contacto con nosotros o solicitar nuestras ofertas. No hagas un uso indebido de él: no intentes interrumpirlo ni acceder a él sin autorización, no envíes información falsa o engañosa a través de sus formularios y no lo utilices para enviarnos material comercial no solicitado.',
        ],
      },
      {
        heading: 'Consultas y solicitudes',
        body: [
          `Enviar una consulta o una solicitud no crea ningún contrato ni obliga a ninguna de las partes. Revisamos las solicitudes nosotros mismos, podemos rechazar cualquiera de ellas o no responder, y no prometemos ningún plazo de respuesta. Facilita información veraz. Presentar una solicitud, o confirmar que has leído la información sobre un paquete, no constituye un acuerdo de compra vinculante ni autoriza ningún pago. La forma en que la utilizamos se describe en la [[${privacyLabel}|${L.privacy}]].`,
        ],
      },
      {
        heading: 'Oferta gratuita de conceptos creativos',
        body: [
          'La Hoja de Ruta de Crecimiento Creativo gratuita ofrece cinco conceptos publicitarios personalizados, presentados en una llamada, para las empresas que encajan. No incluye la producción de los anuncios, no existe ninguna obligación de contratar a CONVRT y los conceptos se facilitan para que los evalúes.',
        ],
      },
      {
        heading: 'Requisitos de la producción de vídeo gratuita',
        body: [
          'La producción de vídeo gratuita se concede mediante solicitud y es limitada. Revisamos todas las solicitudes e invitamos a las empresas que mejor encajan a una llamada breve antes de que nada pase a producción. Las ofertas están sujetas al encaje y a las condiciones de producción, y no garantizamos que una solicitud vaya a ser aceptada. La oferta incluye un vídeo y dos variaciones de hook adicionales; el alcance final se confirma por escrito con la empresa seleccionada.',
        ],
      },
      {
        heading: 'Hooks publicitarios gratuitos y otros recursos gratuitos',
        body: ['Los hooks publicitarios gratuitos se envían por correo electrónico a la dirección que facilitas. Son una inspiración creativa de carácter general y se facilitan tal como están.'],
      },
      {
        heading: 'Nuestros servicios y cómo se acuerdan',
        body: [
          `Los paquetes y precios de este sitio describen cómo trabajamos habitualmente. Un encargo de pago solo comienza cuando hemos acordado por escrito el alcance, el precio y las condiciones. ${taxStatement}`,
          'Los proyectos a medida, incluidas las demos y los vídeos explicativos para SaaS y aplicaciones, se definen de forma individual.',
        ],
      },
      {
        heading: 'Pago',
        body: [
          'Los paquetes de producción únicos se pagan íntegramente por adelantado, salvo que se acuerde otra cosa por escrito. Los paquetes mensuales se facturan mensualmente por adelantado. Las facturas deben pagarse en el plazo de siete días naturales desde la fecha de la factura, salvo que se acuerde otra cosa por escrito.',
          'La producción no comienza hasta que se haya recibido el pago inicial requerido. Si un pago está vencido, podemos pausar la producción y ajustar los plazos de entrega. Nada de lo dispuesto en estos términos limita los derechos que tengamos conforme a la ley aplicable en relación con los pagos atrasados.',
        ],
      },
      {
        heading: 'Compromisos, cancelación y reembolsos',
        body: [
          'Los paquetes mensuales Creative Testing Sprint y Sprint Plus tienen un compromiso inicial de tres meses. Los paquetes Organic Light y Organic Growth tienen un compromiso inicial de seis meses. Transcurrido el compromiso inicial, los paquetes mensuales continúan mes a mes, salvo que se acuerde otra cosa por escrito.',
          'Cancelar un paquete mensual exige un preaviso por escrito de al menos 30 días naturales antes de la fecha de renovación aplicable. La cancelación no puede surtir efecto antes de que se haya cumplido el compromiso inicial, salvo que se acuerde otra cosa por escrito, y no elimina ninguna obligación de pago que ya esté pendiente.',
          'Los paquetes de producción únicos no se renuevan automáticamente. Si cancelas antes de que comience el trabajo, te reembolsaremos el importe abonado, descontando los costes no recuperables acordados en los que ya se haya incurrido. Si cancelas después de que haya comenzado el trabajo, tenemos derecho al pago del trabajo ya realizado y de los costes de producción no recuperables acordados, incluidas las contrataciones de creadores y otros gastos comprometidos, y se reembolsará cualquier saldo restante que proceda.',
          'El trabajo finalizado y entregado no es reembolsable por el mero hecho de que cambies de opinión o de que el contenido no logre los resultados de marketing que querías. Estas disposiciones no limitan ningún derecho ni recurso legal imperativo.',
        ],
      },
      {
        heading: 'Tus responsabilidades, plazos y retrasos',
        body: [
          'Eres responsable de facilitar la información, los materiales y las aprobaciones razonablemente necesarios para completar tu proyecto. Según el proyecto, esto puede incluir:',
          { list: [
            'muestras de producto y envío puntual del producto;',
            'directrices y recursos de marca;',
            'información veraz sobre el producto o el servicio;',
            'accesos, permisos y materiales de apoyo pertinentes;',
            'comentarios y aprobaciones;',
            'confirmación de que los materiales que facilitas y tus afirmaciones publicitarias pueden utilizarse legalmente.',
          ] },
          'Los plazos de producción de los paquetes Creative Testing comienzan una vez que se ha recibido el pago requerido, los materiales y productos necesarios están disponibles y se han aprobado los conceptos y guiones correspondientes. Los retrasos en la recepción de productos, información, comentarios o aprobaciones pueden ampliar los plazos de producción y de entrega, y CONVRT no es responsable de los retrasos en la entrega causados por no haber facilitado a tiempo los materiales o las aprobaciones necesarios.',
          'Cualquier coste adicional derivado de cambios o retrasos significativos solicitados por el cliente se te comunicará y se acordará antes de incurrir en él.',
        ],
      },
      {
        heading: 'Revisiones',
        body: [
          'Cada paquete Creative Testing incluye dos rondas de revisión por concepto, tal como se indica en la página de tarifas. Las revisiones incluidas abarcan ajustes razonables dentro del briefing acordado originalmente. Se pueden contratar revisiones adicionales con un coste extra, acordado contigo antes de que comience el trabajo adicional.',
          'Los cambios en conceptos, guiones o dirección creativa aprobados, o en el alcance del proyecto, que requieran una producción adicional sustancial o volver a rodar pueden presupuestarse por separado. Las correcciones necesarias porque CONVRT no siguió el briefing acordado no cuentan para tus revisiones incluidas.',
        ],
      },
      {
        heading: 'Creator Showcase',
        body: ['Los vídeos del Creator Showcase y de las galerías de las páginas de servicios son ejemplos de creadores independientes. Se muestran para ilustrar estilos y enfoques y no son necesariamente producciones de CONVRT.'],
      },
      {
        heading: 'Derechos de uso',
        body: [
          `Cuando un paquete incluye derechos de uso, estos conceden una licencia sobre cómo puedes utilizar los vídeos finalizados (por ejemplo, ${c.usageMonths} meses de uso en todo el mundo en nuestros paquetes estándar). No suponen una transmisión de la titularidad de los derechos de autor. Los términos exactos se establecen en tu acuerdo.`,
        ],
      },
      {
        heading: 'Contenido del sitio web y propiedad intelectual',
        body: [
          'Los textos, el diseño, el logotipo, las marcas y el material audiovisual original de este sitio pertenecen a CONVRT o a las personas que los han creado y no pueden copiarse, reutilizarse ni adaptarse sin permiso, salvo en la medida en que la ley lo permita. Los vídeos que se muestran en el sitio siguen siendo propiedad de sus titulares y se muestran con su permiso. Los enlaces a servicios de terceros se facilitan por comodidad; no somos responsables de su contenido ni de sus prácticas.',
        ],
      },
      {
        heading: 'Sin garantía de resultados',
        body: ['Nunca garantizamos resultados empresariales ni publicitarios concretos, como ventas, leads, retorno de la inversión publicitaria o crecimiento de la audiencia. El rendimiento depende de factores como tu oferta, tu audiencia, tu presupuesto y la plataforma. Los ejemplos y los casos de éxito de este sitio muestran lo que ocurrió en las empresas de que se trata y no son una promesa de que vayas a obtener lo mismo.'],
      },
      {
        heading: 'Responsabilidad',
        body: [
          'El sitio web y su contenido se ofrecen tal como están. En la medida en que la ley lo permita, CONVRT no responde de los daños indirectos o consecuentes, ni de la pérdida de beneficios, de ingresos o de datos, derivados del uso del sitio web o de haber confiado en su contenido, y su responsabilidad total por el uso del sitio web se limita al daño directo. Nada de lo dispuesto en estos términos limita la responsabilidad que no pueda limitarse por ley.',
        ],
      },
      {
        heading: 'Legislación aplicable y controversias',
        body: ['Estos términos se rigen por la ley española. Las controversias entre CONVRT y un usuario profesional se someten a los juzgados y tribunales españoles competentes.'],
      },
      {
        heading: 'Términos del sitio web y acuerdos de cliente firmados',
        body: [
          'Estos términos regulan el uso del sitio web y nuestras ofertas gratuitas, y establecen nuestro marco comercial general para los paquetes de pago. No impiden acuerdos negociados individualmente: un proyecto de pago se rige por el acuerdo, el pedido o la propuesta por escrito que ambas partes acepten para él. Si un acuerdo por escrito pactado individualmente entra en conflicto con estos términos, prevalece para ese proyecto, sin perjuicio de la ley imperativa aplicable.',
        ],
      },
      {
        heading: 'Cambios y contacto',
        body: [`Podemos actualizar estos términos y cambiaremos la fecha cuando lo hagamos. Consultas: ${mail}.`],
      },
    ],
  }

  const legalNotice = {
    h1: noticeLabel,
    intro: `La información sobre el titular de www.convrt.studio que la legislación española (Ley 34/2002, de servicios de la sociedad de la información, art. 10) exige que un sitio web comercial ponga a disposición de los usuarios. Última actualización: ${dates.legalNotice}.`,
    sections: [
      {
        heading: 'Titular del sitio web',
        body: [{ list: operatorDetails }],
      },
      {
        heading: 'Actividad y destinatarios',
        body: [
          'CONVRT Studio es un estudio creativo liderado por su fundador que produce vídeos UGC, vídeos para SaaS y aplicaciones, vídeos Spokesperson y vídeo orgánico para redes sociales para empresas. Sus servicios se ofrecen únicamente a empresas, no a consumidores.',
        ],
      },
      {
        heading: 'Precios e impuestos',
        body: [`Los precios que se muestran en este sitio web se expresan en dólares estadounidenses (USD) o en euros (EUR), según se indique en la página correspondiente. La moneda aplicable, los precios y las condiciones de pago se confirmarán en el acuerdo de proyecto por escrito. ${taxStatement} Consulta la [[página de tarifas|${L.pricing}]].`],
      },
      {
        heading: 'Propiedad intelectual',
        body: [
          'Los textos, el diseño, el logotipo, las marcas y el material audiovisual original de este sitio web pertenecen a CONVRT o a las personas que los han creado y no pueden copiarse, reutilizarse ni adaptarse sin permiso, salvo en la medida en que la ley lo permita. Los vídeos que se muestran en el Creator Showcase son ejemplos de creadores independientes y siguen siendo propiedad de sus titulares.',
        ],
      },
      {
        heading: 'Contenido y enlaces',
        body: [
          'Publicamos la información de este sitio web de buena fe y podemos modificarla en cualquier momento. No garantiza ningún resultado. Los enlaces a otros sitios web se facilitan por comodidad; no somos responsables de su contenido.',
        ],
      },
      {
        heading: 'Datos personales y cookies',
        body: [`La forma en que tratamos la información personal, las cookies y el almacenamiento del navegador se explica en la [[${privacyLabel}|${L.privacy}]].`],
      },
      {
        heading: 'Términos, legislación aplicable y jurisdicción',
        body: [`El uso del sitio web y de las ofertas gratuitas se rige por nuestros [[${termsLabel}|${L.terms}]]. Se aplica la ley española y las controversias entre CONVRT y un usuario profesional se someten a los juzgados y tribunales españoles competentes.`],
      },
    ],
  }

  return { privacy, terms, legalNotice }
}
