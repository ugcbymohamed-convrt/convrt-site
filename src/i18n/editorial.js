/* LOCALE EDITORIAL DATA. One lookup that says, for each non-English language, which hand-written editorial pieces exist (the headings, intros and notes that are NOT word-for-word
   translations of an English string) and how the portfolio vocabulary reads. Components ask `editorial(locale)` instead of testing for a particular language, so a new language
   needs one entry here, not a new `if` in every component. English has no entry: the English pages are untouched by construction. */

import { currentLocale } from './locale.js'
import * as ES from './es/labels.js'
import * as FR from './fr/labels.js'
import { formatMoneyEs } from './es/money.js'
import { formatMoneyFr } from './fr/money.js'
import { FR_QUOTE_TRANSLATIONS, FR_REVIEW_EXCERPTS } from './fr/quotes.js'
import { AR_SECTION_INTROS } from './ar/labels.js'

export const EDITORIAL = {
  es: {
    languageLabels: ES.ES_LANGUAGE_LABELS, industryLabels: ES.ES_INDUSTRY_LABELS, typeLabels: ES.ES_TYPE_LABELS, productionLabels: ES.ES_PRODUCTION_LABELS,
    caption: ES.captionEs, faqTitles: ES.ES_FAQ_TITLES, stageTitles: ES.ES_STAGE_TITLES, finalCta: ES.ES_FINAL_CTA, sectionIntros: ES.ES_SECTION_INTROS,
    testimonialsNote: null, formatMoney: formatMoneyEs, homeLabel: 'CONVRT — inicio', quoteLang: 'en',
    turnaround: (a, b) => `${a.days} días laborables para ${a.name} y ${b.days} para ${b.name}, a partir de la aprobación de los conceptos y guiones, no desde el pago.`,
  },
  fr: {
    languageLabels: FR.FR_LANGUAGE_LABELS, industryLabels: FR.FR_INDUSTRY_LABELS, typeLabels: FR.FR_TYPE_LABELS, productionLabels: FR.FR_PRODUCTION_LABELS,
    caption: FR.captionFr, faqTitles: FR.FR_FAQ_TITLES, stageTitles: FR.FR_STAGE_TITLES, finalCta: FR.FR_FINAL_CTA, sectionIntros: FR.FR_SECTION_INTROS,
    testimonialsNote: null, formatMoney: formatMoneyFr, homeLabel: 'CONVRT — accueil', quoteLang: 'en',
    fallbackNote: 'en anglais',
    hideFounderOnCards: true, // the founder's videos carry no name line on the cards (the « N of these videos are by the founder » note under the filters was removed, owner 2026-11-24; the attribution stays in the data)
    headingBreak: true, // the Creator Showcase H1 breaks after « Explorez notre » (second segment on its own line from sm up)
    showcaseIntro: 'Découvrez différents styles de vidéos UGC réalisés par de vrais créateurs.',
    sameLabels: { Creator: 'Même créateur', Offer: 'Même offre', CTA: 'Même CTA' }, // the testing diagram's « same … » pills read « Même créateur » in French
    wholeSentenceLists: true, // lists inside a sentence are translated as one sentence (French articles and elision), see OrganicPackages.jsx
    quoteTranslations: FR_QUOTE_TRANSLATIONS, reviewExcerpts: FR_REVIEW_EXCERPTS, reviewsEyebrow: 'Des collaborations qui durent', reviewsHeading: 'Ce que nos clients disent de nous.',
    /* The block under the Creator Showcase library (components/ourwork/ShowcaseFormats.jsx): the same structure as English (heading, intro, four service cards, case-study line), owner-written copy (2026-11-26).
       `caseLine` is [text | { link: 'organic' | 'ugc', text }] so each phrase links to its own localized study. */
    showcaseGuide: {
      heading: 'Ce que vous trouverez dans notre galerie de créateurs',
      intro: 'Notre galerie rassemble des vidéos de créateurs indépendants, pour vous permettre de découvrir différents styles, formats et approches créatives avant de lancer votre projet. Explorez les vidéos par secteur : e-commerce, SaaS et applications, services et contenu organique.',
      cards: {
        ugc: { title: 'Vidéos UGC', text: 'Des vidéos naturelles réalisées par de vrais créateurs, adaptées aux campagnes publicitaires sur les réseaux sociaux.', label: 'Production de vidéos UGC' },
        spokesperson: { title: 'Vidéos Spokesperson', text: 'Des présentateurs qui expliquent votre produit ou transmettent le message de votre marque directement face caméra.', label: 'Production de vidéos Spokesperson' },
        saas: { title: 'Vidéos pour logiciels et applications', text: 'Des vidéos réalisées avec des créateurs pour présenter des logiciels et des applications. Nous produisons également des vidéos explicatives et des démonstrations produit adaptées à chaque projet.', label: 'Production vidéo pour SaaS et applications' },
        organic: { title: 'Contenu organique', text: 'Des vidéos courtes pensées pour alimenter les réseaux sociaux de votre marque.', label: 'Production de contenu organique' },
      },
      caseLine: ['Découvrez également nos études de cas consacrées au ', { link: 'organic', text: 'contenu organique' }, ' et aux ', { link: 'ugc', text: 'campagnes publicitaires UGC' }, '.'],
    },
    turnaround: (a, b) => `${a.days} jours ouvrés pour ${a.name} et ${b.days} pour ${b.name}, à compter de la validation des concepts et des scripts, et non du paiement.`,
  },
  // Arabic: its own components carry the Arabic vocabulary; only the intros are shared editorial data. No "originally written in English" line: the Arabic reviews are shown as approved Arabic text (owner, 2026-11-25).
  ar: {
    sectionIntros: AR_SECTION_INTROS, faqTitles: {}, stageTitles: {}, testimonialsNote: null, homeLabel: 'CONVRT — الرئيسية', quoteLang: 'en',
    /* Arabic: same structure as English; owner-written Modern Standard Arabic (2026-11-26). There is no Arabic Elyon study, so the UGC phrase links the English one and says so (the site's « (en anglais) » convention). */
    showcaseGuide: {
      heading: 'ماذا ستجد في مكتبة صناع المحتوى؟',
      intro: 'تضم مكتبتنا نماذج من أعمال صناع محتوى مستقلين، لتتمكن من استكشاف أساليب التصوير وأنواع الفيديوهات والأفكار الإبداعية المختلفة قبل بدء مشروعك. تصفّح الفيديوهات حسب المجال: التجارة الإلكترونية، وبرامج SaaS والتطبيقات، والخدمات، والمحتوى العضوي.',
      cards: {
        ugc: { title: 'فيديوهات UGC', text: 'فيديوهات بأسلوب طبيعي يقدمها صناع محتوى حقيقيون، وتناسب الحملات الإعلانية على منصات التواصل الاجتماعي.', label: 'إنتاج فيديوهات UGC' },
        spokesperson: { title: 'فيديوهات Spokesperson', text: 'فيديوهات يقدمها أشخاص محترفون لشرح منتجك أو إيصال رسالة علامتك التجارية مباشرة أمام الكاميرا.', label: 'إنتاج فيديوهات Spokesperson' },
        saas: { title: 'فيديوهات البرامج والتطبيقات', text: 'فيديوهات يقدمها صناع المحتوى للتعريف بالبرامج والتطبيقات، إلى جانب فيديوهات الشرح وعرض خصائص المنتج، حسب متطلبات كل مشروع.', label: 'إنتاج فيديوهات برامج SaaS والتطبيقات' },
        organic: { title: 'المحتوى العضوي', text: 'فيديوهات قصيرة مصممة خصيصًا لحسابات علامتك التجارية على منصات التواصل الاجتماعي.', label: 'إنتاج المحتوى العضوي' },
      },
      caseLine: ['اطّلع أيضًا على دراسات الحالة الخاصة بمشاريعنا في ', { link: 'organic', text: 'المحتوى العضوي' }, ' و', { link: 'ugc', text: 'الحملات الإعلانية باستخدام فيديوهات UGC', note: ' (بالإنجليزية)' }, '.'],
    },
  },
}

/* The editorial data of a language, or null for English (and any language without data). */
export const editorial = (locale = currentLocale()) => EDITORIAL[locale] ?? null
