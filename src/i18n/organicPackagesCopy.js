/* The three short supporting lines (and the link label) under the two Organic Social package cards, in every language (owner, Nov 2026): replaces five small paragraphs.
   ONE component renders them (src/components/organic/OrganicPackages.jsx); the lines state only what the pricing page already states (scheduling, posting, community management, platforms,
   the initial commitment, VAT, what is not included). `{months}` is the initial commitment from the business data (ORGANIC_COMMITMENT.initialMonths), so the number cannot drift.
   English and Arabic prices are USD, Spanish and French EUR (the cards take them from the business data / per-language pricing; nothing is typed here).
   French and Arabic are used when the French and Arabic Organic pages are merged into this branch (their dictionaries live on their own branches). */
export const ORGANIC_PACKAGES_LINES = {
  en: {
    lines: [
      'Both packages include scheduling, posting and organic community management across Instagram, Facebook and TikTok.',
      '{months}-month initial commitment. Prices exclude VAT. Customer support and paid ad management are not included.',
      'Need a different approach? Let’s build a plan around your brand.',
    ],
    link: 'Compare packages and full scope',
  },
  es: {
    lines: [
      'Ambos paquetes incluyen programación, publicación y gestión de comunidad en Instagram, Facebook y TikTok.',
      'Compromiso inicial de {months} meses. Precios sin IVA. No incluyen atención al cliente ni gestión de anuncios.',
      '¿Necesitas algo distinto? Creamos un plan a tu medida.',
    ],
    link: 'Comparar paquetes y condiciones',
  },
  fr: {
    lines: [
      'Les deux formules incluent la planification, la publication et l’animation de communauté sur Instagram, Facebook et TikTok.',
      'Engagement initial de {months} mois. Prix hors TVA. Support client et gestion publicitaire non inclus.',
      'Un besoin différent ? Créons une formule adaptée à votre marque.',
    ],
    link: 'Comparer les formules et conditions',
  },
  ar: {
    lines: [
      'تشمل الباقتان جدولة المحتوى والنشر وإدارة التفاعل على Instagram وFacebook وTikTok.',
      'الالتزام الأولي {months} أشهر. الأسعار قبل الضريبة، ولا تشمل دعم العملاء أو إدارة الإعلانات المدفوعة.',
      'تحتاج خطة مختلفة؟ خلنا نجهّز لك باقة تناسب علامتك.',
    ],
    link: 'قارن الباقات والتفاصيل',
  },
}
