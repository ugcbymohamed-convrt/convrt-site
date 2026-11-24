import { CREATOR_SHOWCASE_PATH } from '../../config.js'

/* Arabic H1 and secondary CTA of the UGC service hero (the only Arabic service page in this phase). Editorial Arabic, not word-for-word: fixed first line that carries the
   search intent ("فيديوهات UGC"), then a last line whose final word rolls ("مصمّمة كي تُقنع."). The server HTML holds only the FIRST rolling word, so the indexable H1 is stable:
   «فيديوهات UGC بمشاركة صُنّاع محتوى حقيقيين. مصمّمة كي تُقنع.» No performance guarantee: the verbs describe the creative's purpose, not a result.
   `secondary` replaces the English CTA object: the label is the approved Arabic one and the href is the English path (localized when rendered) or an in-page anchor. */
export const AR_HERO = {
  'ugc-h1': {
    lines: [['فيديوهات', 'UGC', 'حقيقية.']],
    lead: ['مصمّمة', 'كي'],
    words: ['تلفت الانتباه', 'تُقنع جمهورك', 'تُلهم متابعيك'],
    sizer: 'تُلهم متابعيك.',
    secondary: { label: 'مكتبة الفيديوهات', href: CREATOR_SHOWCASE_PATH },
  },
  'spokesperson-h1': {
    lines: [['فيديوهات', 'Spokesperson.'], ['بوجوه', 'حقيقية']],
    lead: ['ورسائل'],
    words: ['واضحة', 'مقنعة', 'مباشرة'],
    sizer: 'مقنعة.',
    secondary: { label: 'مكتبة الفيديوهات', href: CREATOR_SHOWCASE_PATH },
  },
  'organic-h1': {
    lines: [['فيديوهات', 'للسوشيال', 'ميديا']],
    lead: ['تستحق'],
    words: ['المتابعة', 'المشاهدة', 'الاهتمام'],
    sizer: 'الاهتمام.',
    secondary: { label: 'كيف نعمل', href: '#how-it-works' },
  },
  'saas-h1': {
    lines: [['فيديوهات', 'SaaS']],
    lead: ['تشرح', 'منتجك'],
    words: ['بوضوح', 'ببساطة', 'بسهولة'],
    sizer: 'ببساطة.',
    secondary: { label: 'شاهد الصيغ', href: '#saas-formats' },
  },
}
