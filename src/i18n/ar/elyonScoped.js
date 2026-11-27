/* ARABIC WORDING THAT BELONGS TO THE ELYON DUBAI STUDY ONLY (owner copy, 2026-11-26).

   The Arabic dictionary is keyed by the English sentence, and a few of the owner's Elyon sentences share their English key with a DIFFERENT, already approved Arabic wording elsewhere on the Arabic site
   (for example «Industry» is «القطاع» on the Graspo study and «المجال» here). Those words live here, scoped by the section that draws them ("hero|Industry"), so neither page changes the other.
   The Elyon components ask for them with elyonAr(scope|English); every other language (and any key not listed) falls back to the normal tr() lookup, so English, Spanish and French are untouched. */

import { currentLocale } from '../locale.js'

export const ELYON_AR = {
  // hero: tags and the four project facts
  'hero|Creative Testing': 'اختبار الإعلانات',
  'hero|Elyon Dubai': 'إيليون دبي',
  'hero|Industry': 'المجال',
  'hero|Market': 'السوق',
  // the two performance snapshots
  'performance|Average ROAS': 'متوسط ROAS',
  'performance|Purchases': 'عمليات شراء',
  'performance|ROAS': 'العائد على الإنفاق الإعلاني (ROAS)',
  // the three videos, in the order they are shown
  'showcase|Video 1': 'الفيديو الأول',
  'showcase|Video 2': 'الفيديو الثاني',
  'showcase|Video 3': 'الفيديو الثالث',
  // the "next case study" card on the Elyon page
  'next|View case study': 'شاهد دراسة الحالة',
}

/* The Elyon-scoped Arabic wording for `key`, or undefined (not Arabic, or no scoped wording). Use as: elyonAr('hero|Industry') ?? tr('Industry'). */
export const elyonAr = (key) => (currentLocale() === 'ar' ? ELYON_AR[key] : undefined)

/* The final call-to-action section of the Elyon page (src/components/FinalCTA.jsx, `arCopy`): the owner's wording for this page. Keys are the English sentences FinalCTA translates.
   The primary button is the free Creative Growth Roadmap (its link already is: src/i18n/cta.js), never a calendar. The shared footer is NOT here: it keeps its shared Arabic. */
export const ELYON_FINAL_CTA_AR = {
  "Let's create together": 'لنبدع معًا',
  'better creatives.': 'إعلانات أفضل.',
  'Whether you need paid social creatives, UGC, spokesperson ads, or a long-term creative partner, we build content designed for modern attention.': 'سواء كنت تبحث عن فيديوهات لحملاتك الإعلانية، أو فيديوهات UGC وSpokesperson، أو شريك إبداعي على المدى الطويل، نصنع محتوى يجذب انتباه جمهورك ويبرز قيمة علامتك التجارية.',
  'Book a Creative Call': 'احصل على 5 أفكار إعلانية مجانًا',
  'of clients return for more': 'من العملاء يعودون للعمل معنا',
  [`Our founder's combined professional experience, including CONVRT Studio and other professional creative production work.`]: 'تعكس هذه الأرقام إجمالي الخبرة المهنية لمؤسس الاستوديو، بما يشمل أعماله في CONVRT Studio ومشاريعه الأخرى في إنتاج المحتوى الإبداعي.',
}
