/* The five weekday initials of the organic calendar graphics (M T W T F). In Arabic they are the short forms of the five working days in the same order as the English graphic (Mon to Fri: the UAE week;
   the posts sit in the same slots), so the animation and the layout are identical. */
const AR = ['إث', 'ثل', 'أر', 'خم', 'جم']
export const dayLabel = (locale, letter, index) => (locale === 'ar' ? AR[index] ?? letter : letter)
