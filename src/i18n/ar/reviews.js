/* THE ARABIC CLIENT REVIEWS (homepage section, src/components/home/ClientReviews.jsx).

   The owner asked on 2026-11-23 for the three published English client reviews to be shown in natural Arabic, without a visible "translated" label (this overrides, for this one section, the standing rule
   "never translate a client quote"; the decision is recorded in docs/multilingual-arabic.md). They are TRANSLATIONS OF THE SAME STATEMENTS: same meaning, same client, same company, no added praise, no
   figures, no ratings. `excerpt` is the Arabic of the English excerpt, `full` the Arabic of the complete original (kept behind "اقرأ المراجعة كاملة"); `highlight` is a part of the excerpt picked out
   in lime. Names of people and companies stay as the clients wrote them. A native reader should confirm the wording before Production (owner review list). */
export const AR_REVIEWS = {
  elyon: {
    category: 'عطور فاخرة · تجارة إلكترونية',
    excerpt: 'الفيديوهات عالية الجودة، وسُلّمت في موعدها، وكان التواصل ممتازًا طوال الوقت.',
    highlight: 'عالية الجودة',
    full: 'فهم Mohamed الفكرة جيدًا، وتجاوزت الجودة توقعاتي فعلًا. الفيديوهات عالية الجودة، وسُلّمت في موعدها، وكان التواصل ممتازًا طوال الوقت. لقد طلبتُ مرة أخرى بالفعل، وأتطلع إلى مواصلة هذه الشراكة.',
  },
  adscale: {
    category: 'SaaS · إعلانات السوشيال ميديا المدفوعة',
    excerpt: 'فيديوهات UGC التي أنتجها كانت بالضبط ما نحتاجه لتوسيع نطاق إعلاناتنا.',
    highlight: 'لتوسيع نطاق إعلاناتنا',
    full: 'كان العمل مع Mohamad متعة حقيقية. هو محترف ومبدع، ويفهم فعلًا ما الذي يجعل المحتوى ينجح. فيديوهات UGC التي أنتجها كانت بالضبط ما نحتاجه لتوسيع نطاق إعلاناتنا. عدنا إليه بالفعل في طلب ثانٍ، ونخطط لمواصلة العمل معًا على المدى الطويل.',
  },
  talk360: {
    category: 'تطبيق جوال · دولي',
    excerpt: 'في كل مرة نعمل معًا، تزداد الجودة تحسنًا.',
    highlight: 'تزداد الجودة تحسنًا',
    full: 'الفيديوهات رائعة مرة أخرى. في كل مرة نعمل معًا، تزداد الجودة تحسنًا. تسليم سريع وتواصل ممتاز، والمحتوى يحقق الأداء الذي نحتاجه تمامًا. هذا هو طلبنا الثالث، ولن يكون الأخير.',
  },
}
