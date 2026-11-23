import { CREATOR_SHOWCASE_PATH } from '../../config.js'

/* Arabic H1 and secondary CTA of the UGC service hero (the only Arabic service page in this phase). Editorial Arabic, not word-for-word: fixed first line that carries the
   search intent ("فيديوهات UGC"), then a last line whose final word rolls ("مصمّمة كي تُقنع."). The server HTML holds only the FIRST rolling word, so the indexable H1 is stable:
   «فيديوهات UGC بمشاركة صُنّاع محتوى حقيقيين. مصمّمة كي تُقنع.» No performance guarantee: the verbs describe the creative's purpose, not a result.
   `secondary` replaces the English CTA object: the label is the approved Arabic one and the href is the English path (localized when rendered) or an in-page anchor. */
export const AR_HERO = {
  'ugc-h1': {
    lines: [['فيديوهات', 'UGC', 'بمشاركة'], ['صُنّاع', 'محتوى', 'حقيقيين.']],
    lead: ['مصمّمة', 'كي'],
    words: ['تُقنع', 'تؤثّر', 'تُلهم'],
    sizer: 'تُقنع.',
    secondary: { label: 'شاهد أعمالنا', href: CREATOR_SHOWCASE_PATH },
  },
}
