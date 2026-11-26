/* ABOUT PAGE COPY in Spanish, French and Arabic (src/AboutPage.jsx): the owner-supplied, approved text (26 Nov 2026), character for character. Headlines are split into a plain part and an
   emphasised (lime) part only where the sentence ends naturally; joined, they are the supplied wording. The English About page is unchanged (src/content/trustPages.js, rendered by src/TrustPage.jsx).

   FIGURES: the four numbers are NOT typed here. They come from CONVRT_STATS (src/lib/siteStats.js, the single source: the founder's combined professional experience, never CONVRT-Studio-only)
   through localizeStat(); this file holds only their labels and the supplied disclosure. tests/about-localized.test.mjs proves the rendered figures equal the ones in the supplied copy
   (Spanish, French and Arabic notation).

   FOUNDER NAME: the supplied copy names the founder "Mohamed Doukkali" (Spanish, French) and «محمد الدكالي» (Arabic). The legal name is "Mohamed Doukkali Azizi" (src/content/operator.js) and no established Arabic
   spelling exists in the repository: both are flagged for the owner's confirmation in docs/contact-about-legal-localization.md. */

export const ABOUT_COPY = {
  es: {
    hero: {
      badge: 'SOBRE CONVRT',
      h1: ['Creatividad con estrategia.', 'Contenido con propósito.'],
      body: [
        'Somos un estudio creativo especializado en producir vídeos que captan la atención, transmiten el valor de una marca y contribuyen a mejorar sus resultados.',
        'Combinamos estrategia, creadores de contenido y producción audiovisual para desarrollar creativos que conectan con el público actual.',
      ],
    },
    philosophy: {
      badge: 'NUESTRA FILOSOFÍA',
      h2: ['No se trata de producir más.', 'Se trata de producir mejor.'],
      lead: 'Cada vídeo empieza con una pregunta: ¿qué queremos conseguir?',
      body: ['No creemos en producir contenido sin una dirección clara. Investigamos, desarrollamos conceptos, identificamos los mensajes adecuados y damos vida a cada idea con los creadores y formatos que mejor encajan con tu marca.'],
      closing: 'Porque un buen vídeo no solo tiene que verse bien. Tiene que cumplir una función.',
    },
    approach: {
      badge: 'NUESTRO ENFOQUE',
      h2: ['De la estrategia', 'a la pantalla.'],
      items: [
        { title: 'Estrategia antes de producir', text: 'Analizamos tu producto, tu audiencia y tus objetivos antes de desarrollar los conceptos creativos.' },
        { title: 'Creadores reales', text: 'Trabajamos con creadores y presentadores seleccionados según las necesidades de cada proyecto, para conseguir una comunicación natural y auténtica.' },
        { title: 'Contenido pensado para obtener resultados', text: 'Desarrollamos distintos conceptos, hooks y variantes para identificar qué mensajes conectan mejor con tu audiencia.' },
        { title: 'Producción multilingüe', text: 'Creamos contenido en diferentes idiomas, adaptando el mensaje, el tono y la comunicación a cada mercado.' },
      ],
    },
    behind: {
      badge: 'DETRÁS DE CONVRT',
      h2: ['La experiencia de un creador.', 'La visión de un estudio creativo.'],
      body: [
        'CONVRT nace de la experiencia de su fundador, Mohamed Doukkali, tras años trabajando directamente con marcas y produciendo contenido para empresas de distintos sectores y mercados.',
        'Esa experiencia nos ha permitido construir un modelo de producción que combina estrategia creativa, selección de talento, producción audiovisual y aprendizaje continuo.',
        'Nuestro objetivo es convertirnos en el aliado creativo de las marcas que buscan algo más que un proveedor de vídeos.',
      ],
    },
    figures: {
      badge: 'NUESTRA EXPERIENCIA EN CIFRAS',
      labels: { videos: 'vídeos producidos', views: 'visualizaciones', clients: 'clientes', returningClients: 'de clientes recurrentes' },
      footnote: 'Estas cifras reflejan la trayectoria profesional de nuestro fundador, incluyendo CONVRT Studio y otros proyectos de producción creativa.',
    },
    borderless: {
      badge: 'SIN FRONTERAS',
      h2: ['Diferentes mercados.', 'Una misma exigencia.'],
      body: [
        'Trabajamos con marcas de Europa, Reino Unido, Estados Unidos y Oriente Medio, desarrollando contenido adaptado a diferentes audiencias, idiomas y contextos culturales.',
        'Creemos que una buena estrategia creativa debe ir más allá de la traducción. Debe entender cómo piensa, habla y consume contenido cada audiencia.',
      ],
    },
    cta: {
      badge: 'TRABAJEMOS JUNTOS',
      h2: ['Tu próximo gran creativo', 'empieza con una idea.'],
      body: 'Cuéntanos qué quieres conseguir. Nosotros te ayudamos a encontrar la dirección creativa adecuada.',
      primary: 'Consigue 5 conceptos gratis',
      secondary: 'Descubre nuestros servicios',
    },
    breadcrumbLabel: 'Sobre nosotros',
  },

  fr: {
    hero: {
      badge: 'À PROPOS DE CONVRT',
      h1: ['De la créativité. De la stratégie.', 'Un objectif.'],
      body: [
        'CONVRT est un studio créatif spécialisé dans la production de vidéos pensées pour capter l’attention, mettre en valeur les marques et contribuer à leurs performances.',
        'Nous associons stratégie créative, créateurs de contenu et production vidéo pour développer des créas adaptées aux usages et aux attentes du public actuel.',
      ],
    },
    philosophy: {
      badge: 'NOTRE PHILOSOPHIE',
      h2: ['Produire plus n’est pas le but.', 'Produire mieux, oui.'],
      lead: 'Chaque vidéo commence par une question : quel résultat voulons-nous obtenir ?',
      body: ['Nous ne croyons pas au contenu produit sans direction claire. Nous analysons, développons des concepts, identifions les bons messages et donnons vie à chaque idée avec les créateurs et les formats les plus adaptés à votre marque.'],
      closing: 'Une bonne vidéo ne doit pas seulement être esthétique. Elle doit avoir une raison d’être.',
    },
    approach: {
      badge: 'NOTRE APPROCHE',
      h2: ['De la stratégie', 'à l’écran.'],
      items: [
        { title: 'La stratégie avant la production', text: 'Nous étudions votre produit, votre audience et vos objectifs avant de développer les concepts créatifs.' },
        { title: 'De vrais créateurs', text: 'Nous sélectionnons des créateurs et des présentateurs en fonction des besoins de chaque projet, pour une communication naturelle et authentique.' },
        { title: 'Des créas pensées pour performer', text: 'Nous développons différents concepts, hooks et variantes afin d’identifier les messages qui trouvent le meilleur écho auprès de votre audience.' },
        { title: 'Une production multilingue', text: 'Nous créons du contenu dans plusieurs langues, en adaptant le message, le ton et la communication à chaque marché.' },
      ],
    },
    behind: {
      badge: 'DERRIÈRE CONVRT',
      h2: ['L’expérience d’un créateur.', 'La vision d’un studio.'],
      body: [
        'CONVRT est né de l’expérience de son fondateur, Mohamed Doukkali, après plusieurs années passées à collaborer directement avec des marques et à produire du contenu pour des entreprises de différents secteurs et marchés.',
        'Cette expérience nous a permis de développer une approche qui associe stratégie créative, sélection des talents, production vidéo et amélioration continue.',
        'Notre ambition est de devenir le partenaire créatif des marques qui recherchent bien plus qu’un simple prestataire vidéo.',
      ],
    },
    figures: {
      badge: 'NOTRE EXPÉRIENCE EN CHIFFRES',
      labels: { videos: 'vidéos produites', views: 'de vues', clients: 'clients', returningClients: 'de clients récurrents' },
      footnote: 'Ces chiffres reflètent l’ensemble du parcours professionnel de notre fondateur, incluant CONVRT Studio et d’autres projets de production créative.',
    },
    borderless: {
      badge: 'SANS FRONTIÈRES',
      h2: ['Des marchés différents.', 'La même exigence.'],
      body: [
        'Nous collaborons avec des marques en Europe, au Royaume-Uni, aux États-Unis et au Moyen-Orient, en développant des contenus adaptés à différentes audiences, langues et cultures.',
        'Une bonne stratégie créative ne se limite pas à la traduction. Elle doit tenir compte de la façon dont chaque audience communique, découvre et consomme du contenu.',
      ],
    },
    cta: {
      badge: 'TRAVAILLONS ENSEMBLE',
      h2: ['Votre prochaine créa', 'commence par une idée.'],
      body: 'Parlez-nous de vos objectifs. Nous vous aiderons à trouver la bonne direction créative.',
      primary: 'Obtenez 5 concepts gratuits',
      secondary: 'Découvrez nos services',
    },
    breadcrumbLabel: 'À propos',
  },

  ar: {
    hero: {
      badge: 'عن CONVRT',
      h1: ['إبداع مدروس.', 'محتوى له هدف.'],
      body: [
        'CONVRT استوديو إبداعي متخصص في إنتاج فيديوهات تجذب الانتباه، وتبرز قيمة العلامات التجارية، وتساهم في تحسين نتائجها التسويقية.',
        'نجمع بين الاستراتيجية الإبداعية وصناع المحتوى والإنتاج الاحترافي لنقدم فيديوهات تتناسب مع اهتمامات الجمهور وطريقة استهلاكه للمحتوى اليوم.',
      ],
    },
    philosophy: {
      badge: 'فلسفتنا',
      h2: ['الهدف ليس إنتاج المزيد من المحتوى،', 'بل إنتاج محتوى أفضل.'],
      lead: 'كل فيديو يبدأ بسؤال: ما الهدف الذي نريد تحقيقه؟',
      body: ['نؤمن بأن المحتوى الناجح يبدأ باستراتيجية واضحة. ندرس المنتج والجمهور، ونطوّر الأفكار الإبداعية، ونختار الرسائل وصناع المحتوى وأسلوب الإنتاج الأنسب لكل علامة تجارية.'],
      closing: 'فالفيديو الجيد لا يقتصر على جودة التصوير والمونتاج، بل يجب أن يخدم هدفًا واضحًا.',
    },
    approach: {
      badge: 'أسلوب عملنا',
      h2: ['من الاستراتيجية', 'إلى الشاشة.'],
      items: [
        { title: 'الاستراتيجية قبل الإنتاج', text: 'ندرس منتجك وجمهورك وأهدافك قبل تطوير الكونسيبتات الإعلانية.' },
        { title: 'صناع محتوى حقيقيون', text: 'نختار صناع المحتوى ومقدمي الفيديوهات بما يناسب طبيعة كل مشروع، لنقدم محتوى بأسلوب طبيعي ومقنع.' },
        { title: 'محتوى يركز على النتائج', text: 'نطوّر كونسيبتات وهوكات ونسخًا إعلانية مختلفة لاختبار الرسائل الأكثر تأثيرًا على جمهورك.' },
        { title: 'إنتاج متعدد اللغات', text: 'ننتج محتوى بلغات مختلفة، مع مراعاة خصوصية كل سوق وطريقة التواصل مع جمهوره.' },
      ],
    },
    behind: {
      badge: 'خلف CONVRT',
      h2: ['خبرة صانع محتوى.', 'ورؤية استوديو إبداعي.'],
      body: [
        'تأسس CONVRT انطلاقًا من خبرة مؤسسه، محمد الدكالي، بعد سنوات من العمل المباشر مع العلامات التجارية وإنتاج المحتوى لشركات في مجالات وأسواق مختلفة.',
        'ومن خلال هذه الخبرة، طورنا أسلوب عمل يجمع بين الاستراتيجية الإبداعية واختيار المواهب والإنتاج الاحترافي والتحسين المستمر.',
        'هدفنا أن نكون شريكًا إبداعيًا للعلامات التجارية التي تبحث عن أكثر من مجرد إنتاج الفيديوهات.',
      ],
    },
    figures: {
      badge: 'خبرتنا بالأرقام',
      labels: { videos: 'فيديو تم إنتاجه', views: 'مشاهدات', clients: 'عميل', returningClients: 'عملاء يعودون للعمل معنا' },
      footnote: 'تعكس هذه الأرقام إجمالي الخبرة المهنية لمؤسس الاستوديو، بما يشمل أعماله في CONVRT Studio ومشاريعه الأخرى في إنتاج المحتوى الإبداعي.',
    },
    borderless: {
      badge: 'إبداع بلا حدود',
      h2: ['أسواق مختلفة.', 'ومعايير جودة واحدة.'],
      body: [
        'نعمل مع علامات تجارية في أوروبا والمملكة المتحدة والولايات المتحدة والشرق الأوسط، وننتج محتوى يتناسب مع اختلاف اللغات والثقافات والجمهور المستهدف.',
        'فالتواصل مع جمهور جديد لا يعتمد على الترجمة وحدها، بل على فهم ثقافته ولغته وطريقة تفاعله مع المحتوى.',
      ],
    },
    cta: {
      badge: 'لنعمل معًا',
      h2: ['إعلانك القادم', 'يبدأ بفكرة.'],
      body: 'أخبرنا عن أهدافك، وسنساعدك في تحديد التوجه الإبداعي المناسب لعلامتك التجارية.',
      primary: 'احصل على 5 أفكار إعلانية مجانًا',
      secondary: 'اكتشف خدماتنا',
    },
    breadcrumbLabel: 'من نحن',
  },
}
