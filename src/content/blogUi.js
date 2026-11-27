/* The words around a blog article (breadcrumb, "By", "Updated", table of contents, FAQ heading, related articles, the closing call to action, the not-found state, the index masthead),
   in each language an article can be written in. This is interface text, never article text: articles live in src/content/blog/. English is exactly what the English blog always showed.
   CTA wording reuses the site's approved labels (the free offer's name and button in each language). */
import { currentLocale } from '../i18n/locale.js'

export const BLOG_UI = {
  en: {
    home: 'Home', blog: 'Blog', theBlog: 'The CONVRT Blog', breadcrumb: 'Breadcrumb', by: 'By', updated: 'Updated', read: 'Read',
    inThisArticle: 'In this article', faqTitle: 'Frequently asked questions', keepReading: 'Keep reading', articleNav: 'Article navigation', loading: 'Loading article',
    draftNotice: 'Draft preview — only visible while running locally. This article is not published.',
    roadmapHeadline: ['Want Ad Concepts ', 'Built for Your Brand?'], roadmapCopy: 'Get five personalized video ad concepts worth testing, in our free Creative Growth Roadmap.', roadmapCta: 'Get My Free Creative Roadmap',
    notFoundTitle: 'Article not found', notFoundText: 'That article isn’t published. Browse everything we’ve got on the CONVRT Blog.', notFoundCta: 'Back to the Blog', notFoundHead: 'Article not found | CONVRT Blog', notFoundDescription: 'This article could not be found.',
    indexTitle: 'CONVRT Blog | Video Ads, UGC & Creative Strategy', indexDescription: 'Explore CONVRT Insights for practical guides on UGC video ads, SaaS marketing, e-commerce creative, and performance-focused video strategy.', indexName: 'CONVRT Blog',
    dateLocale: 'en-US',
  },
  es: {
    home: 'Inicio', blog: 'Blog', theBlog: 'El blog de CONVRT', breadcrumb: 'Migas de pan', by: 'Por', updated: 'Actualizado', read: 'Leer',
    inThisArticle: 'En este artículo', faqTitle: 'Preguntas frecuentes', keepReading: 'Sigue leyendo', articleNav: 'Navegación del artículo', loading: 'Cargando el artículo',
    draftNotice: 'Vista previa de borrador: solo visible en local. Este artículo no está publicado.',
    roadmapHeadline: ['¿Quieres conceptos de anuncios ', 'pensados para tu marca?'], roadmapCopy: 'Recibe cinco conceptos de anuncios en vídeo personalizados que merece la pena testar, con nuestros 5 conceptos publicitarios gratis.', roadmapCta: 'Consigue 5 conceptos gratis',
    notFoundTitle: 'Artículo no encontrado', notFoundText: 'Ese artículo no está publicado. Descubre todo lo que tenemos en el blog de CONVRT.', notFoundCta: 'Volver al blog', notFoundHead: 'Artículo no encontrado | Blog de CONVRT', notFoundDescription: 'No se ha podido encontrar este artículo.',
    indexTitle: 'Blog de CONVRT | Anuncios en vídeo, UGC y estrategia creativa', indexDescription: 'Guías prácticas sobre anuncios UGC en vídeo, marketing para SaaS, creatividad para e-commerce y estrategia de vídeo orientada al rendimiento.', indexName: 'Blog de CONVRT',
    dateLocale: 'es-ES',
  },
  fr: {
    home: 'Accueil', blog: 'Blog', theBlog: 'Le blog CONVRT', breadcrumb: 'Fil d’Ariane', by: 'Par', updated: 'Mis à jour le', read: 'Lire',
    inThisArticle: 'Dans cet article', faqTitle: 'Questions fréquentes', keepReading: 'Continuer la lecture', articleNav: 'Navigation de l’article', loading: 'Chargement de l’article',
    draftNotice: 'Aperçu du brouillon : visible uniquement en local. Cet article n’est pas publié.',
    roadmapHeadline: ['Envie de concepts publicitaires ', 'pensés pour votre marque ?'], roadmapCopy: 'Recevez cinq concepts de publicités vidéo personnalisés, à tester, avec notre stratégie créative offerte.', roadmapCta: 'Recevoir mes 5 concepts gratuits',
    notFoundTitle: 'Article introuvable', notFoundText: 'Cet article n’est pas publié. Parcourez tout ce que nous avons sur le blog CONVRT.', notFoundCta: 'Retour au blog', notFoundHead: 'Article introuvable | Blog CONVRT', notFoundDescription: 'Cet article est introuvable.',
    indexTitle: 'Blog CONVRT | Publicités vidéo, UGC et stratégie créative', indexDescription: 'Des guides pratiques sur les publicités vidéo UGC, le marketing SaaS, la création pour l’e-commerce et la stratégie vidéo orientée performance.', indexName: 'Blog CONVRT',
    dateLocale: 'fr-FR',
  },
  ar: {
    home: 'الرئيسية', blog: 'المدونة', theBlog: 'مدونة CONVRT', breadcrumb: 'مسار التنقل', by: 'بقلم', updated: 'آخر تحديث', read: 'اقرأ',
    inThisArticle: 'في هذا المقال', faqTitle: 'الأسئلة الشائعة', keepReading: 'تابع القراءة', articleNav: 'التنقل في المقال', loading: 'جارٍ تحميل المقال',
    draftNotice: 'معاينة مسودة: تظهر محليًا فقط. هذا المقال غير منشور.',
    roadmapHeadline: ['هل تريد أفكارًا إعلانية ', 'مصمّمة لعلامتك التجارية؟'], roadmapCopy: 'احصل على خمس أفكار إعلانية بالفيديو مخصّصة لعلامتك وتستحق الاختبار، ضمن خطة نمو إبداعية مجانية.', roadmapCta: 'احصل على 5 أفكار إعلانية مجانًا',
    notFoundTitle: 'المقال غير موجود', notFoundText: 'هذا المقال غير منشور. تصفّح كل ما لدينا في مدونة CONVRT.', notFoundCta: 'العودة إلى المدونة', notFoundHead: 'المقال غير موجود | مدونة CONVRT', notFoundDescription: 'تعذّر العثور على هذا المقال.',
    indexTitle: 'مدونة CONVRT | إعلانات UGC وإنتاج الفيديو واستراتيجية المحتوى', indexDescription: 'أفكار ونصائح عن إعلانات UGC، وإنتاج الفيديو، واستراتيجية المحتوى للعلامات التجارية.', indexName: 'مدونة CONVRT',
    dateLocale: 'ar-AE-u-nu-latn',
  },
}

/* The interface text of a language; any language without an entry falls back to English. */
export const blogUi = (locale = currentLocale()) => BLOG_UI[locale] ?? BLOG_UI.en
