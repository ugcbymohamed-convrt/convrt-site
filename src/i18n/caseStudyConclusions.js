/* The closing section of each case study, per language (owner brief, 2026-11-26). Read by src/components/graspo/GraspoResult.jsx and src/components/elyon/ElyonResult.jsx, rendered by the shared
   src/components/caseStudies/CaseStudyConclusion.jsx. The figures themselves (10.7M, 75, 26, 10, 5.28x, 160+, 4) are NOT stored here: they come from src/caseStudies/data.js, so a figure can never be
   retyped differently from the page above it; only their labels are written per language.

   headline: [{ text, accent? }] segments; the accent segment takes the theme colour (Graspo lime, Elyon champagne gold).
   English keeps its approved sentences (the long Graspo paragraph is only split: the figures it listed now sit in the summary tiles). Spanish follows the owner's wording of 2026-11-26. French and Arabic reuse
   the approved sentences of their own dictionaries (src/i18n/fr/dict-casestudies.js, src/i18n/ar/dict-graspo.js), split the same way; the Arabic wording keeps the Modern Standard editorial direction and "غراسبو".
   The Elyon Arabic block is rendered by /ar/case-studies/elyon (the Arabic study exists since Nov 2026); it writes the client «إيليون دبي», keeps the 5.28× scoped to ONE standout creative and states that it is
   client-reported, not an average and not a guarantee, like the English, Spanish and French blocks. */

/* French typography: a no-break space before : ; ! ? and after « so a line never starts with a colon. Applied to the French blocks only. */
const nb = (s) => s.replace(/ ([:;!?»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
const frBlock = (b) => ({ ...b, headline: b.headline.map((h) => ({ ...h, text: nb(h.text) })), lead: nb(b.lead), strategy: nb(b.strategy), ctaLead: nb(b.ctaLead), note: b.note && nb(b.note), labels: b.labels.map(nb) })

export const GRASPO_CONCLUSION = {
  en: {
    badge: 'The Bigger Result',
    headline: [{ text: 'Social media stopped being a publishing channel and became a ' }, { text: 'market-entry engine.', accent: true }],
    lead: 'Over six months, Graspo went from limited visibility in Arabic-speaking markets to 10.7M organic views and a recognizable presence in Saudi Arabia, Iraq, Morocco, Egypt and across the wider MENA region. More importantly, that attention landed with the right people: publishers, print agencies and buyers who found Graspo through the content itself.',
    labels: ['Total views', 'Unique inbound leads', 'High-priority opportunities', 'Advanced / quotation-stage'],
    note: null,
    strategy: 'None of this required paid amplification. It required a content system: strategy, Arabic-first production, and inbound handling working as one operation instead of three disconnected efforts.',
    ctaLead: 'See how we can help you generate business opportunities through organic content.',
    service: 'Organic social video production and management',
    pricing: 'Compare the organic packages',
  },
  es: {
    badge: 'El resultado',
    headline: [{ text: 'De publicar contenido a ' }, { text: 'generar demanda.', accent: true }],
    lead: 'En menos de seis meses, Graspo amplió su presencia en los mercados árabes, alcanzó 10,7 millones de visualizaciones y recibió 75 contactos comerciales. De ellos, 26 fueron clasificados como prioritarios y 10 llegaron a una fase avanzada de negociación o seguimiento comercial.',
    labels: ['Visualizaciones totales', 'Contactos comerciales', 'Oportunidades prioritarias', 'En fase avanzada'],
    note: 'Distribución orgánica, sin promoción de pago. No todas las visualizaciones ni todos los contactos se tradujeron en ventas.',
    strategy: 'Estos resultados reflejan el valor de combinar una estrategia clara, contenido diseñado específicamente para el público árabe y una gestión organizada de las oportunidades comerciales.',
    ctaLead: 'Descubre cómo podemos ayudarte a generar oportunidades comerciales a través del contenido orgánico.',
    service: 'Producción y gestión de contenido orgánico',
    pricing: 'Ver las tarifas de contenido orgánico',
  },
  fr: frBlock({
    badge: 'Les résultats',
    headline: [{ text: 'Du contenu qui attire l’attention aux ' }, { text: 'opportunités commerciales.', accent: true }],
    lead: 'En moins de six mois, Graspo a renforcé sa présence sur les marchés arabophones, généré 10,7 millions de vues et reçu 75 demandes commerciales distinctes. Parmi elles, 26 ont été identifiées comme prioritaires et 10 ont atteint un stade avancé du suivi commercial.',
    labels: ['Vues totales', 'Demandes commerciales distinctes', 'Opportunités prioritaires', 'Stade avancé du suivi'],
    note: null,
    strategy: 'Ces résultats illustrent l’intérêt d’une approche qui associe stratégie, production de contenu pensé pour le public arabophone et suivi structuré des demandes commerciales.',
    ctaLead: 'Découvrez comment nous pouvons développer votre visibilité et générer des opportunités commerciales grâce au contenu organique.',
    service: 'Découvrir notre service de production de contenu organique',
    pricing: 'Voir nos formules de contenu organique',
  }),
  ar: {
    badge: 'النتيجة الأشمل',
    headline: [{ text: 'من المحتوى الرقمي إلى ' }, { text: 'حضور تجاري في أسواق جديدة.', accent: true }],
    lead: 'خلال أقل من ستة أشهر، انتقلت غراسبو من حضور محدود في الأسواق الناطقة بالعربية إلى 10.7 مليون مشاهدة، ووصل محتواها إلى جمهور في السعودية والعراق والمغرب ومصر ودول أخرى في المنطقة. والأهم أن هذا الاهتمام تحول إلى فرص تجارية: شملت المراحل المتقدمة إعداد عروض الأسعار أو إرسالها، وإرسال العينات، والتواصل المباشر مع فريق المبيعات عبر واتساب.',
    labels: ['إجمالي المشاهدات', 'عملاء محتملون', 'فرص تجارية ذات أولوية عالية', 'فرص في مراحل متقدمة'],
    note: null,
    strategy: 'تحققت هذه النتائج بفضل استراتيجية محتوى متكاملة جمعت بين التخطيط، وإنتاج محتوى مخصص للجمهور العربي، ومتابعة الاستفسارات التجارية. وقد جاءت مشاهدات إنستغرام البالغة 6.27 مليون من الوصول العضوي، دون أي إنفاق على الترويج المدفوع.',
    ctaLead: 'اكتشف كيف نساعدك على تحقيق فرص تجارية من خلال المحتوى العضوي.',
    service: 'إنتاج محتوى منصات التواصل الاجتماعي وإدارته',
    pricing: 'باقات المحتوى العضوي',
  },
}

/* labels: [peak ROAS, its qualifier, creatives produced, production locations]. `note` is the standing qualification of the ROAS figure: client-reported, specific creatives, not an average, not a guarantee. */
export const ELYON_CONCLUSION = {
  en: {
    badge: 'The Takeaway',
    headline: [{ text: "A premium brand doesn't need " }, { text: '"UGC-looking UGC."', accent: true }],
    lead: 'It needs native creative that protects the brand while still performing like paid social. For Elyon, that became a repeatable system of street interviews, creator-led ads and performance concepts across multiple locations.',
    labels: ['Peak ROAS', 'On a single standout creative, during the early learning phase', 'Creatives produced', 'Production locations'],
    note: 'ROAS figures are reported by the client and relate to specific creatives and moments. They are not an average across all campaigns and not a guarantee.',
    strategy: 'Even during an early learning phase, individual creatives reached as high as 5.28x ROAS. The bigger win was building a system capable of producing and iterating more of them.',
    ctaLead: 'Elyon Dubai is an example of our UGC video production.',
    service: 'See how our UGC video production works',
    pricing: 'Compare the UGC packages',
  },
  es: {
    badge: 'La conclusión',
    headline: [{ text: 'Una marca premium necesita anuncios que estén ' }, { text: 'a su altura.', accent: true }],
    lead: 'Para Elyon Dubai, combinamos la identidad de una marca de lujo con vídeos de creadores, entrevistas en la calle y una estrategia de producción continua para desarrollar nuevos creativos publicitarios.',
    labels: ['ROAS máximo', 'En un único creativo destacado, durante la fase inicial de aprendizaje', 'Creativos producidos', 'Localizaciones de producción'],
    note: 'Los datos de ROAS los comunica el cliente y corresponden a creativos y momentos concretos. No son una media de todas las campañas ni constituyen una garantía.',
    strategy: 'Durante la fase inicial de aprendizaje, algunos creativos alcanzaron un ROAS de hasta 5,28x. Más allá de ese resultado, desarrollamos un sistema de producción que permite seguir probando, mejorando y creando nuevos anuncios.',
    ctaLead: 'Elyon Dubai es un ejemplo de nuestra producción de vídeos UGC.',
    service: 'Descubrir nuestra producción de vídeos UGC',
    pricing: 'Ver las tarifas de producción UGC',
  },
  fr: frBlock({
    badge: 'La conclusion',
    headline: [{ text: 'Une marque premium mérite des créas ' }, { text: 'à sa hauteur.', accent: true }],
    lead: 'Pour Elyon Dubai, nous avons associé l’identité d’une marque de luxe à des vidéos de créateurs, des interviews de rue et une stratégie de production continue permettant de développer et de tester de nouvelles créas.',
    labels: ['ROAS maximal', 'Sur certaines créas, dès la phase initiale de test', 'Créas produites', 'Lieux de production'],
    note: 'Les chiffres de ROAS sont communiqués par le client et concernent des créas et des moments précis. Ils ne sont pas une moyenne de toutes les campagnes et ne constituent pas une garantie.',
    strategy: 'Dès la phase initiale de test, certaines créas ont atteint un ROAS allant jusqu’à 5,28x. Au-delà de ces performances, nous avons mis en place une approche qui permet de tester, d’améliorer et de produire de nouvelles publicités en continu.',
    ctaLead: 'Elyon Dubai est un exemple de notre production de vidéos UGC.',
    service: 'Découvrir notre production de vidéos UGC',
    pricing: 'Voir nos formules UGC',
  }),
  ar: {
    badge: 'الخلاصة',
    headline: [{ text: 'العلامة الفاخرة تستحق إعلانات ' }, { text: 'تليق بها.', accent: true }],
    // The owner's Arabic copy (2026-11-26), word for word. `lead` and `strategy` are lists of paragraphs (CaseStudyConclusion draws one <p> each).
    lead: ['لم تكن إيليون دبي بحاجة إلى فيديوهات UGC تقليدية، بل إلى محتوى يتناسب مع طبيعة منصات التواصل الاجتماعي، ويحافظ في الوقت نفسه على فخامة العلامة ويحقق نتائج إعلانية ملموسة.', 'حققنا ذلك من خلال استراتيجية إنتاج مستمرة تجمع بين المقابلات في الشارع وفيديوهات صناع المحتوى والكونسيبتات الإعلانية، مع التصوير في مواقع متنوعة.'],
    labels: ['أعلى ROAS', 'لفيديو إعلاني واحد', 'فيديو ونسخة إعلانية', 'مدن للتصوير'],
    note: 'أرقام ROAS مستندة إلى النتائج التي شاركها العميل، وتخص إعلانات وفترات محددة. ولا تمثل متوسط أداء جميع الحملات أو ضمانًا لنتائج مماثلة.',
    strategy: ['منذ المراحل الأولى للتعاون، حققت بعض الإعلانات نتائج مميزة، وصل فيها العائد على الإنفاق الإعلاني إلى 5.28x.', 'لكن الإنجاز الأهم كان بناء منظومة إنتاج تتيح لنا الاستفادة من الإعلانات الناجحة وتطوير المزيد من الكونسيبتات والنسخ الإعلانية باستمرار.'],
    ctaLead: 'هل تبحث عن إعلانات تجمع بين جودة الإنتاج والأداء؟',
    service: 'اكتشف خدماتنا في إنتاج فيديوهات UGC',
    pricing: 'اطّلع على باقات إنتاج فيديوهات UGC',
  },
}
