/* ARABIC PAGE-LEVEL SEO: title, description and social copy per translated page, keyed by the ENGLISH base path. Same role as src/i18n/es/seo.js.
   ONE Arabic website serves the UAE and Saudi Arabia (hreflang "ar", never ar-AE / ar-SA; no country pages). Prices come from the business data, never retyped.

   Keyword → page decisions (docs/multilingual-arabic.md; research: owner's UAE + Saudi Arabic Keyword Planner exports). Volumes are rounded, directional Google estimates, never summed:
     /ar/                       umbrella: إنتاج فيديوهات إعلانية، محتوى للسوشيال ميديا، فيديوهات Spokesperson، إعلانات فيديو للعلامات التجارية
     /ar/ugc-video-agency       وكالة UGC · إنتاج فيديوهات UGC · تصوير فيديوهات UGC · صناعة محتوى UGC · إعلانات UGC
     /ar/pricing                أسعار فيديوهات UGC · حقوق الاستخدام
   The Saudi "تصميم اعلانات سناب شات" query (500, ambiguous intent: design / video / media buying) is NOT a target: CONVRT does not manage ad accounts.

   Titles ~60 characters, descriptions ~150: natural Gulf-friendly Modern Standard Arabic, no performance guarantee, no office claim. */

import { SPRINT, USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { priceOf, formatPrice } from '../pricing.js'

/* Arabic share image. The default OG image (public/og/convrt-og.png) has ENGLISH text burned into it; Arabic pages reuse it until public/og/convrt-og-ar.png (1200x630 PNG) exists.
   Set AR_OG_IMAGE_READY to true then: every Arabic page switches by itself (tests/i18n.test.mjs checks the file). */
export const AR_OG_IMAGE_READY = false
export const AR_OG_IMAGE_PATH = '/og/convrt-og-ar.png'

export const AR_OG_IMAGE_ALT = 'CONVRT: فيديوهات إعلانية مصمّمة لجذب الانتباه. إعلانات UGC وفيديوهات Spokesperson ومحتوى للسوشيال ميديا وفيديوهات شرح المنتجات.'

export const AR_SEO = {
  '/': {
    title: 'إنتاج فيديوهات إعلانية وUGC للعلامات التجارية | CONVRT',
    description:
      'نُنتج فيديوهات UGC وفيديوهات Spokesperson ومحتوى للسوشيال ميديا بمشاركة صُنّاع محتوى حقيقيين، لإعلانات الشركات والمتاجر الإلكترونية والتطبيقات وفرق التسويق في الإمارات والسعودية وغيرها.',
    ogTitle: 'CONVRT: فيديوهات إعلانية مصمّمة لجذب الانتباه',
    ogDescription: 'إعلانات UGC، وفيديوهات Spokesperson، ومحتوى للسوشيال ميديا، واستراتيجية إبداعية لعلامتك التجارية.',
  },
  '/ugc-video-agency': {
    title: 'وكالة UGC | إنتاج فيديوهات UGC للإعلانات | CONVRT',
    description: `إنتاج فيديوهات UGC للإعلانات مع صُنّاع محتوى حقيقيين، من الفكرة حتى التسليم. باقات تبدأ من ${formatPrice('ar', priceOf('ar', SPRINT.monthly))} شهريًا (USD)، مع ${USAGE_RIGHTS.includedMonths} أشهر من حقوق الاستخدام عالميًا.`,
    ogTitle: 'CONVRT: إنتاج فيديوهات UGC لإعلانات علامتك التجارية',
    ogDescription: 'إعلانات UGC بمشاركة صُنّاع محتوى حقيقيين، مع أسعار وحقوق استخدام واضحة.',
  },
  '/spokesperson-video-production': {
    title: 'فيديوهات Spokesperson | إنتاج فيديو إعلاني بمقدّم | CONVRT',
    description: 'إنتاج فيديوهات Spokesperson بمقدّمين حقيقيين للإعلانات والعروض التوضيحية ورسائل العلامة التجارية، من النص حتى التسليم، مع نماذج فيديو بالعربية وحقوق استخدام واضحة.',
    ogTitle: 'CONVRT: فيديوهات Spokesperson لعلامتك التجارية',
    ogDescription: 'فيديو إعلاني بمقدّم حقيقي يشرح عرضك ويبني الثقة، من الفكرة حتى التسليم.',
  },
  '/social-media-video-production': {
    title: 'إنتاج فيديوهات للسوشيال ميديا | محتوى عضوي | CONVRT',
    description: 'إنتاج فيديوهات للسوشيال ميديا ومحتوى عضوي قصير بانتظام: تخطيط وتصوير ومونتاج وتسليم. نماذج حقيقية من عمل CONVRT مع Graspo، وباقتا Organic Light وOrganic Growth.',
    ogTitle: 'CONVRT: فيديوهات للسوشيال ميديا تجذب الانتباه',
    ogDescription: 'محتوى عضوي قصير يُخطَّط ويُنتَج ويُسلَّم بانتظام، مع أمثلة حقيقية من عمل CONVRT.',
  },
  '/saas-video-production': {
    title: 'فيديوهات شرح التطبيقات ومنتجات SaaS | فيديو توضيحي | CONVRT',
    description: 'إنتاج فيديوهات شرح التطبيقات والمنتجات الرقمية لشركات SaaS: فيديوهات توضيحية وعروض المنتج وجولات داخل التطبيق وإعلانات فيديو، بنطاق مخصص لكل مشروع.',
    ogTitle: 'CONVRT: فيديوهات شرح التطبيقات ومنتجات SaaS',
    ogDescription: 'فيديوهات توضيحية وعروض منتج تجعل البرمجيات أسهل فهمًا، من الموجز حتى التسليم.',
  },
  '/case-studies/graspo': {
    title: 'دراسة حالة Graspo: محتوى عضوي بالعربية لشركة طباعة | CONVRT',
    description: 'كيف بنت CONVRT حضورًا عضويًا عربيًا لشركة Graspo للطباعة على السوشيال ميديا: 10.7 مليون مشاهدة عضوية على فيسبوك وإنستغرام من يناير إلى يونيو 2026.',
    ogTitle: 'Graspo × CONVRT: من خبرة الطباعة إلى 10.7 مليون مشاهدة عضوية',
    ogDescription: 'دراسة حالة عن إنتاج المحتوى العضوي لشركة Graspo، مع أمثلة الفيديو وأرقام المشاهدات الموثّقة.',
  },
  '/pricing': {
    title: 'أسعار فيديوهات UGC وباقات الإنتاج الإعلاني | CONVRT',
    description:
      'باقات CONVRT لإنتاج فيديوهات UGC والمحتوى الإعلاني والسوشيال ميديا: أسعار واضحة بالدولار الأمريكي، وما تشمله كل باقة، وحقوق الاستخدام، وسياسة المراجعات.',
  },
  '/creator-showcase': {
    title: 'نماذج فيديوهات UGC من صُنّاع محتوى | CONVRT',
    description:
      'تصفّح نماذج فيديوهات UGC من صُنّاع محتوى مستقلين تتحدث بالعربية، لتتعرّف على أساليب الأداء والأفكار الإبداعية. أعمال صُنّاع مستقلين وليست كلها من إنتاج CONVRT.',
    ogTitle: 'معرض صُنّاع المحتوى لدى CONVRT: نماذج فيديوهات UGC',
    ogDescription: 'فيديوهات حقيقية من صُنّاع محتوى مستقلين، تعرض أساليب مختلفة في تقديم المنتجات والخدمات.',
  },
  '/creative-growth-roadmap': {
    title: 'خطة نمو إبداعية مجانية | 5 أفكار إعلانية مخصصة | CONVRT',
    description:
      'اطلب 5 أفكار إعلانية مخصصة لعلامتك التجارية: زوايا إبداعية وأفكار افتتاحية وتوصيات للاختبار من CONVRT، تُعرض في جلسة استراتيجية مجانية.',
  },
  '/risk-free-trial': {
    title: 'فيديو مجاني واحد: جرّب إنتاج CONVRT',
    description:
      'قدّم طلبًا للحصول على فيديو تجريبي مجاني تنتجه CONVRT مع نسختين بافتتاحيتين مختلفتين للاختبار. تُراجَع كل طلبات التقديم، والعرض خاضع للموافقة وشروط البرنامج.',
  },
}
