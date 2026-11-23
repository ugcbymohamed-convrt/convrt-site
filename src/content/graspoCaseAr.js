/* THE ARABIC GRASPO CASE STUDY (/ar/case-studies/graspo): the Arabic adaptation of the published English study (src/components/graspo/*). Written in Arabic directly (this page has no English twin sentence by
   sentence; the facts are the English page's).

   WHAT IS USED. Only figures and statements that the English study already publishes and sources: the Meta Business Suite numbers for Jan 1 to Jun 19 2026 (10.7M views = Instagram 6,275,727 + Facebook 4,385,948,
   3.4M accounts reached, 65K interactions), the per-video views mapped by Stream id (src/components/graspo/GraspoShowcase.jsx: 7.5M, 1.2M, 295K), the top-content list (GraspoDistribution.jsx), the four
   challenge points and the four strategy pillars, and the owner-confirmed following counts (src/lib/siteStats.js GRASPO_FOLLOWING).
   WHAT IS LEFT OUT ON PURPOSE. The English study's lead figures (75 inbound leads, 26 high-priority, 10 advanced), the funnel, the lead examples and the lead composition: their evidence (an internal inbound tracker and
   client-reported messages) is not part of this Arabic page, so no lead, ROAS, revenue or conversion claim is made here. The views-over-time curve is an illustration of a chart shape and is not reproduced.
   The owner's brief mentioned videos of about "7M, 5M and 3M" views: the records support 7.5M, 1.2M and 295K (and 1.9M in the top-content list), so those are the figures shown. */
import { GRASPO_FOLLOWING } from '../lib/siteStats.js'

export const IG_VIEWS = 6_275_727
export const FB_VIEWS = 4_385_948

export const GRASPO_AR = {
  eyebrow: 'دراسة حالة · Graspo × CONVRT',
  period: '6 أشهر',
  h1: '10.7 مليون مشاهدة عضوية لشركة Graspo',
  lead: 'Graspo شركة طباعة أوروبية راسخة. بنت CONVRT حضورها العربي على السوشيال ميديا، لتتحول خبرتها في الطباعة إلى ملايين المشاهدات لدى جمهور ناطق بالعربية.',
  facts: [
    { label: 'العميل', value: 'Graspo' },
    { label: 'المجال', value: 'الطباعة والتصنيع' },
    { label: 'السوق', value: 'منطقة MENA، بالعربية' },
    { label: 'فترة التقرير', value: 'يناير – يونيو 2026' },
  ],
  metrics: [
    { value: '10.7M', label: 'إجمالي المشاهدات', sub: 'فيسبوك + إنستغرام' },
    { value: '3.4M', label: 'حسابات وصل إليها المحتوى', sub: 'انتشار عضوي' },
    { value: '65K', label: 'تفاعلات مع المحتوى', sub: 'إعجابات وتعليقات ومشاركات وحفظ' },
  ],
  source: 'المصدر: تحليلات Meta Business Suite، من 1 يناير إلى 19 يونيو 2026.',
  challenge: {
    eyebrow: 'التحدي',
    title: '«انشر أكثر على إنستغرام» لم تكن يومًا استراتيجية.',
    lead: 'ملاءمة حقيقية في أسواق جديدة، تتحول إلى اهتمام تجاري جاد لا إلى إعجابات فقط.',
    points: [
      { title: 'نشاط تقني، لا علامة لنمط الحياة', body: 'الطباعة خدمة معقدة بين الشركات وتقوم على المواصفات. لا يوجد «محتوى» واضح في وزن الورق وطرق التجليد وضبط ألوان الأوفست، إلى أن يجعله أحدهم مثيرًا للاهتمام.' },
      { title: 'حضور محلي محدود في الأسواق العربية', body: 'كانت لدى Graspo قدرة إنتاجية، لكن حضورها في الأسواق الناطقة بالعربية التي أرادت الوصول إليها كان محدودًا. كان لا بد من بناء الوعي من نقطة قريبة من الصفر.' },
      { title: 'الجمهور ليس متصفحين عابرين', body: 'من يهمّ هنا هم الناشرون ومشترو المطبوعات والوكالات وأصحاب الأعمال، لا خلاصة استهلاكية عامة. كان على المحتوى أن يكسب انتباه من يتخذون قرارات الشراء.' },
      { title: 'الانتباه يجب أن يقود إلى شيء', body: 'المشاهدات والمتابعات ليست الهدف لشركة طباعة. كان على المحتوى أن يقرّب العملاء المحتملين الحقيقيين من طلب عرض سعر أو عينة أو حديث مع فريق المبيعات.' },
    ],
  },
  strategy: {
    eyebrow: 'ما نفّذته CONVRT',
    title: 'من الخبرة الصناعية إلى محتوى السوشيال ميديا.',
    lead: 'أدارت CONVRT محتوى Graspo كمنظومة لا كجدول نشر: الاستراتيجية والإنتاج والتوطين ومتابعة الاستفسارات تعمل معًا، ليكون للانتباه وجهة.',
    pillars: [
      { number: '01', tag: 'تعليم', title: 'معرفة طباعة أرادها الناس فعلًا', description: 'الخامات وتقنيات التشطيب وإمكانات الماكينات ومعرفة الإنتاج، تحوّلت إلى محتوى يعلّم بدل أن يكتفي بالاستعراض.' },
      { number: '02', tag: 'عرض', title: 'إنتاج حقيقي لا لقطات جاهزة', description: 'كتب وكتالوجات وماكينات وأعمال منجزة، صُوّرت في أرض المصنع، ليكون مستوى الجودة والحجم شيئًا يراه المشتري لا ادعاءً.' },
      { number: '03', tag: 'توطين', title: 'عربي من البداية لا مترجم', description: 'رسائل مبنية على ثقافة السوق المستهدف ولغته منذ البداية، لا مقتبسة بعد الإنتاج من دليل بالإنجليزية.' },
      { number: '04', tag: 'تحويل', title: 'التعليقات والرسائل الخاصة كمسار مبيعات', description: 'كل استفسار جاد، من طلب عرض سعر أو عينة أو شراكة، يُتابَع ويُؤهَّل ويُوجَّه إلى فريق مبيعات Graspo.' },
    ],
  },
  content: {
    eyebrow: 'المحتوى',
    title: 'ما الذي نُشر فعلًا على الخلاصة.',
    lead: 'فيديوهات قصيرة جاهزة للمنصات، صُنعت لتوقف تمرير شخص قد يحتاج فعلًا إلى طلبية طباعة، لا لتبدو جميلة في معرض أعمال فحسب.',
    note: 'أرقام المشاهدات لكل فيديو من تحليلات Meta Business Suite، من يناير إلى يونيو 2026. لا تعني المشاهدات مبيعات أو عملاء محتملين.',
    labels: { alt: 'لقطة من فيديو عضوي لشركة Graspo', unmute: 'تشغيل الصوت', mute: 'كتم الصوت', views: 'مشاهدة' },
  },
  distribution: {
    eyebrow: 'التوزيع العضوي',
    title: 'لم يحتج المحتوى إلى إنفاق إعلاني ليصل.',
    platformTitle: 'المشاهدات حسب المنصة',
    total: 'الإجمالي 10.7 مليون',
    instagram: 'إنستغرام',
    facebook: 'فيسبوك',
    ofTotal: 'من إجمالي المشاهدات',
    organicBold: '100% عضوي على إنستغرام.',
    organicRest: 'جميع مشاهدات إنستغرام البالغة 6.27 مليون جاءت من الوصول العضوي، دون أي إنفاق على الترويج المدفوع لهذا التوزيع.',
    topTitle: 'أعلى المحتوى مشاهدة',
    top: [
      { views: 7_500_000, label: '7.5 مليون', note: 'خطأ شائع في الطباعة، نُبرزه' },
      { views: 1_900_000, label: '1.9 مليون', note: 'تعرّف على الماكينة في لقطة واحدة' },
      { views: 1_200_000, label: '1.2 مليون', note: 'الجزء الأهم' },
      { views: 84_200, label: '84.2 ألف', note: 'نضع المعيار من أرض المصنع' },
      { views: 31_300, label: '31.3 ألف', note: 'الخطأ الذي لا رجعة فيه' },
    ],
  },
  result: {
    eyebrow: 'النتيجة الأكبر',
    title: ['تحوّلت السوشيال ميديا من قناة نشر إلى', 'محرّك دخول للأسواق.'],
    p1: 'خلال ستة أشهر، انتقلت Graspo من ظهور محدود في الأسواق الناطقة بالعربية إلى 10.7 مليون مشاهدة عضوية وحضور ملحوظ في السعودية والعراق والمغرب ومصر وعبر منطقة MENA الأوسع.',
    p2: 'واليوم يتابع Graspo أكثر من 30 ألف شخص عبر فيسبوك وإنستغرام وتيك توك. ولم يأتِ ذلك من النشر المتقطع، بل من منظومة محتوى: استراتيجية وإنتاج عربي من الأساس ومتابعة للاستفسارات، تعمل كعملية واحدة.',
  },
  links: {
    title: 'تابع القراءة',
    items: [
      { href: '/social-media-video-production', title: 'فيديوهات للسوشيال ميديا', text: 'كيف نخطط ونصوّر ونسلّم المحتوى العضوي، وما تشمله باقتا Organic Light وOrganic Growth.' },
      { href: '/pricing#organic', title: 'باقات المحتوى العضوي', text: 'الأسعار بالدولار الأمريكي، ومدة الالتزام الأولية وما تشمله كل باقة.' },
      { href: '/creator-showcase', title: 'مكتبة الفيديوهات', text: 'فيديوهات من صُنّاع محتوى ومشاريع مختلفة، مع بيان واضح لمصدر كل فيديو.' },
      { href: '/', title: 'الصفحة الرئيسية', text: 'خدماتنا الأربع، وأعمال عملائنا، وكيف نعمل.' },
    ],
  },
  cta: { label: 'احصل على 5 أفكار إعلانية مجانًا', instagramLabel: 'شاهد صفحة Graspo' },
  following: GRASPO_FOLLOWING,
}
