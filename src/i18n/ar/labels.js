/* Arabic labels for the portfolio vocabulary (src/content/portfolio.js) and the small editorial lines that the Arabic pages add or replace. Written for the one shared Arabic site (UAE + Saudi Arabia).
   A caption written in Arabic (every Arabic portfolio entry) is shown as written; a generic English caption pattern is translated. */

export const AR_LANGUAGE_LABELS = {
  en: 'الإنجليزية', es: 'الإسبانية', fr: 'الفرنسية', ar: 'العربية', de: 'الألمانية', it: 'الإيطالية', pt: 'البرتغالية', nl: 'الهولندية',
  tr: 'التركية', ru: 'الروسية', pl: 'البولندية', hi: 'الهندية', ur: 'الأردية', zh: 'الصينية', ja: 'اليابانية', ko: 'الكورية',
  he: 'العبرية', sv: 'السويدية', da: 'الدنماركية', fi: 'الفنلندية', el: 'اليونانية', ro: 'الرومانية', cs: 'التشيكية', id: 'الإندونيسية',
}

export const AR_INDUSTRY_LABELS = {
  saas: 'SaaS', ecommerce: 'التجارة الإلكترونية', app: 'التطبيقات', technology: 'التقنية', consumer: 'المنتجات الاستهلاكية',
  beauty: 'الجمال', health: 'الصحة والعافية', fashion: 'الأزياء', food: 'الأطعمة والمشروبات', finance: 'التمويل',
  education: 'التعليم', travel: 'السفر', home: 'المنزل ونمط الحياة', services: 'الخدمات',
}

export const AR_TYPE_LABELS = {
  ugc: 'UGC', spokesperson: 'فيديو بمقدّم', organic: 'محتوى عضوي', saas: 'فيديو SaaS', demo: 'عرض توضيحي للمنتج', testimonial: 'شهادة عميل',
  interview: 'مقابلة في الشارع', social: 'محتوى عضوي', ad: 'مادة إعلانية',
}

export const AR_PRODUCTION_LABELS = { independent: 'صانع محتوى مستقل', convrt: 'من إنتاج CONVRT' }

const CAPTION_PATTERNS = [
  [/^CONVRT UGC ad example\.?$/, () => 'نموذج إعلان UGC من CONVRT.'],
  [/^Creator-led UGC ad example (\d+)\.?$/, (n) => `نموذج إعلان UGC بمشاركة صانع محتوى ${n}.`],
  [/^UGC ad example (\d+)\.?$/, (n) => `نموذج إعلان UGC ${n}.`],
  [/^Spokesperson video example (\d+)\.?$/, (n) => `نموذج فيديو بمقدّم ${n}.`],
  [/^Organic social video example (\d+)\.?$/, (n) => `نموذج فيديو عضوي للسوشيال ميديا ${n}.`],
  [/^SaaS creator example (\d+)\.?$/, (n) => `نموذج صانع محتوى لشركات SaaS ${n}.`],
]

/* Arabic caption for a generic English caption, or null when the caption is hand-written (then it is shown as it is). */
export function captionAr(caption) {
  for (const [re, fn] of CAPTION_PATTERNS) {
    const m = caption.match(re)
    if (m) return fn(m[1])
  }
  return null
}

/* One-sentence introductions under the heading of two sections (Arabic editorial copy; English has none). */
export const AR_SECTION_INTROS = {
  'ugc-testing': 'مو لازم تغيّر الإعلان كامل عشان تعرف وش ينجح. نجهّز نسخًا مختلفة من الفكرة نفسها، حتى تقدر تقارن النتائج بشكل أوضح.',
  'ugc-faq': 'من الأسعار وحقوق الاستخدام إلى اختيار الصناع وطريقة الإنتاج.',
}
