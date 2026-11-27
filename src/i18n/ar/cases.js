/* Arabic copy of the three homepage client panels (src/components/CaseStudies.jsx). Same clients, same videos, same figures and the same claims as the approved English: only the words change.
   No new result is stated (the English "winners", "6 million views", "100+" and the follower counts are the existing published ones). The Graspo follower counts come from src/lib/siteStats.js (passed in), never retyped. */

import { localizeStat } from '../format.js'

const moreThan = (stat) => (stat.endsWith('+') ? `أكثر من ${localizeStat('ar', stat.slice(0, -1))}` : localizeStat('ar', stat))

export function arCaseCopy(id, following) {
  switch (id) {
    case 'adscale':
      return {
        tab: 'SaaS',
        title: 'إعلانات طويلة\nلا يمكن تخطّيها.',
        body: 'إن كنت تظن أن الإعلانات الطويلة لا مكان لها، فشاهد هذه الأمثلة. هي ليست مجرد إعلانات: إنها تبني الثقة، وتنضح بالثقة بالنفس، وتُظهر أننا نعرف ما نفعله. انتقالات جمالية، ومشاهد لافتة، وأسلوب تقديم جذّاب إلى حدّ يجعل تخطّيها شبه مستحيل.',
      }
    case 'elyon':
      return {
        tab: 'التجارة الإلكترونية',
        title: 'اختبرنا أكثر من 100 إعلان.\nووجدنا عدة إعلانات ناجحة.',
        body: 'أنتجنا أكثر من 100 قطعة محتوى مع إيليون دبي. ومنذ إطلاقها عام 2025 اختبرنا أفكارًا ونسخًا متعددة، ووجدنا حتى الآن عدة صيغ تحقق أداءً قويًا لدى إيليون. وحين يكون المنتج بجودة عالية، يصبح من الأسهل بكثير صناعة محتوى صادق يتفاعل معه الناس.',
      }
    case 'graspo':
      return {
        tab: 'الطباعة',
        title: '6 ملايين مشاهدة.\nفي أقل من شهرين.',
        body: `حققنا أكثر من 6 ملايين مشاهدة لصالح Graspo في أقل من شهرين. ونعم، احتجنا قبل ذلك إلى 6 أشهر من اختبار المحتوى لنعرف ما الذي ينجح فعلًا وما الذي لا ينجح. اليوم لدى Graspo ${moreThan(following.combined)} متابع: ${localizeStat('ar', following.facebook)} على فيسبوك و${localizeStat('ar', following.instagram)} على إنستغرام و${localizeStat('ar', following.tiktok)} على تيك توك.`,
      }
    default:
      throw new Error(`arCaseCopy: no Arabic copy for case "${id}"`)
  }
}
