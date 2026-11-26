/* CONTACT PAGE COPY, all four languages, in ONE place (owner-supplied and approved, 26 Nov 2026). The page component (src/components/contact/ContactPage.jsx) is one reusable component:
   it reads the copy of the page's language from here and nothing else is language-specific.

   Everything marked "APPROVED" below is the owner's exact wording, character for character. Everything marked "UNAPPROVED MICROCOPY" is the small functional text the supplied copy
   does not cover (field-level error messages, the "sending" state, the consent checkbox, the label of the founder's LinkedIn link, the heading above the connection cards, the
   "optional" tag, the success-screen navigation): it is written in the same register, follows the existing site translations where one exists, and is listed for the owner's review
   in docs/contact-about-legal-localization.md.

   Terminology rules kept: Spanish "creativos" (never "creatividades") and "hook" (never "gancho"); French "créas" and "hook" (never "accroche" for an ad hook); Arabic is clear Modern
   Standard Arabic with no dialect and no VAT wording. */

const NB = ' '

export const CONTACT_COPY = {
  en: {
    badge: 'GET IN TOUCH', // APPROVED
    h1: { lead: "Let's talk about", accent: 'your project.', tail: '' },
    intro: 'Whether you need paid social creatives, UGC videos, spokesperson ads or a long-term creative partner, we create content designed to capture attention in a world that never stops scrolling.',
    formHeading: 'Tell us what you have in mind.',
    labels: { fullName: 'Full name', email: 'Email address', company: 'Brand or company', website: 'Website or social media', service: "Service you're interested in", budget: 'Estimated budget', message: 'Tell us about your project' },
    placeholders: { fullName: 'Your full name', email: 'you@yourbrand.com', company: 'Your brand or company name', website: 'https://', service: 'Select a service', budget: 'Select your budget', message: 'What are you looking to achieve?' },
    services: { ugc: 'UGC Videos', spokesperson: 'Spokesperson Videos', organic: 'Organic Social Video', saas: 'SaaS & App Videos', custom: 'Custom Project', unsure: 'Not sure yet' },
    submit: 'Send your inquiry',
    submitNote: "We'll review your inquiry and get back to you with the next steps.",
    emailHeading: 'Prefer email?',
    connectHeading: 'Other ways to connect', // UNAPPROVED MICROCOPY (the supplied copy gives the label in English only)
    cards: { linkedin: 'Follow us on LinkedIn', instagram: 'Find us on Instagram', creators: 'Join our creator network', referrals: 'Refer & Earn' },
    founderLinkedin: 'Founder: Mohamed Doukkali Azizi on LinkedIn', // UNAPPROVED MICROCOPY
    faq: { lead: 'Things brands', accent: 'usually ask.' }, // APPROVED heading (split for the lime accent)
    successHeading: 'Inquiry received.',
    successMessage: "Thank you for getting in touch. We'll review your inquiry and get back to you with the next steps.",
    errorMessage: 'Something went wrong while sending your inquiry. Please try again or contact us by email.',
    // ── UNAPPROVED MICROCOPY ───────────────────────────────────────────
    optional: 'Optional',
    sending: 'Sending…',
    consent: 'I agree that CONVRT may store the details I’ve entered and use them to review my inquiry and contact me about it.',
    privacySee: 'See the', privacyLabel: 'Privacy Policy',
    backHome: 'Back to home',
    honeypotLabel: 'Leave this field empty',
    errors: {
      required: 'This field is required.', invalid: 'Please check this answer.', tooLong: 'That is too long.', tooShort: 'Please add a little more detail.',
      email: 'Enter a valid email address.', website: 'Enter a website address, a social profile link or an @handle.', consent: 'Please tick the box to continue.', service: 'Select a service.',
    },
    formLabel: 'General inquiry form',
    breadcrumbHome: 'Home',
    budgets: { 'under-5k': 'Under $5,000', '5k-20k': '$5,000–$20,000', '20k-plus': '$20,000+', unsure: 'Not sure yet' },
  },

  es: {
    badge: 'CONTACTO',
    h1: { lead: 'Hablemos de', accent: 'tu proyecto.', tail: '' },
    intro: 'Tanto si necesitas creativos para campañas en redes sociales, vídeos UGC, anuncios con spokesperson o un aliado creativo a largo plazo, creamos contenido diseñado para captar la atención del público actual.',
    formHeading: 'Cuéntanos qué tienes en mente.',
    labels: { fullName: 'Nombre completo', email: 'Correo electrónico', company: 'Marca o empresa', website: 'Web o redes sociales', service: 'Servicio que te interesa', budget: 'Presupuesto estimado', message: 'Cuéntanos sobre tu proyecto' },
    placeholders: { fullName: 'Tu nombre completo', email: 'tu@tumarca.com', company: 'Nombre de tu marca o empresa', website: 'https://', service: 'Selecciona un servicio', budget: 'Selecciona tu presupuesto', message: '¿Qué quieres conseguir con tu proyecto?' },
    services: { ugc: 'Vídeos UGC', spokesperson: 'Vídeos Spokesperson', organic: 'Contenido orgánico para redes sociales', saas: 'Vídeos para SaaS y aplicaciones', custom: 'Proyecto a medida', unsure: 'Todavía no lo tengo claro' },
    submit: 'Enviar consulta',
    submitNote: 'Revisaremos tu consulta y nos pondremos en contacto contigo para definir los próximos pasos.',
    emailHeading: '¿Prefieres escribirnos por email?',
    connectHeading: 'Otras formas de conectar',
    cards: { linkedin: 'Síguenos en LinkedIn', instagram: 'Encuéntranos en Instagram', creators: 'Únete a nuestra red de creadores', referrals: 'Recomienda y gana' },
    founderLinkedin: 'Fundador: Mohamed Doukkali Azizi en LinkedIn',
    faq: { lead: 'Lo que suelen preguntarnos', accent: 'las marcas.' },
    successHeading: 'Consulta recibida.',
    successMessage: 'Gracias por contactar con nosotros. Revisaremos tu consulta y nos pondremos en contacto contigo para definir los próximos pasos.',
    errorMessage: 'No hemos podido enviar tu consulta. Inténtalo de nuevo o ponte en contacto con nosotros por email.',
    optional: 'Opcional',
    sending: 'Enviando…',
    consent: 'Acepto que CONVRT guarde los datos que he introducido y los utilice para revisar mi consulta y ponerse en contacto conmigo.',
    privacySee: 'Consulta la', privacyLabel: 'Política de privacidad',
    backHome: 'Volver al inicio',
    honeypotLabel: 'Deja este campo vacío',
    errors: {
      required: 'Este campo es obligatorio.', invalid: 'Revisa esta respuesta.', tooLong: 'El texto es demasiado largo.', tooShort: 'Añade un poco más de detalle.',
      email: 'Introduce un correo electrónico válido.', website: 'Introduce una dirección web, el enlace a un perfil social o un @usuario.', consent: 'Marca la casilla para continuar.', service: 'Selecciona un servicio.',
    },
    formLabel: 'Formulario de consulta general',
    breadcrumbHome: 'Inicio',
    budgets: { 'under-5k': `Menos de 5.000${NB}€`, '5k-20k': `Entre 5.000${NB}€ y 20.000${NB}€`, '20k-plus': `Más de 20.000${NB}€`, unsure: 'Todavía no lo tengo claro' },
  },

  fr: {
    badge: 'CONTACT',
    h1: { lead: 'Parlons de', accent: 'votre projet.', tail: '' },
    intro: 'Que vous ayez besoin de créas pour vos campagnes sur les réseaux sociaux, de vidéos UGC, de vidéos spokesperson ou d’un partenaire créatif sur le long terme, nous créons du contenu pensé pour capter l’attention dans un monde où tout défile.',
    formHeading: 'Parlez-nous de votre projet.',
    labels: { fullName: 'Nom complet', email: 'Adresse e-mail', company: 'Marque ou entreprise', website: 'Site web ou réseaux sociaux', service: 'Service souhaité', budget: 'Budget estimé', message: 'Décrivez votre projet' },
    placeholders: { fullName: 'Votre nom complet', email: 'vous@votremarque.com', company: 'Nom de votre marque ou entreprise', website: 'https://', service: 'Sélectionnez un service', budget: 'Sélectionnez votre budget', message: 'Quels sont vos objectifs ?' },
    services: { ugc: 'Vidéos UGC', spokesperson: 'Vidéos Spokesperson', organic: 'Contenu organique pour les réseaux sociaux', saas: 'Vidéos SaaS et applications', custom: 'Projet sur mesure', unsure: 'Je ne sais pas encore' },
    submit: 'Envoyer ma demande',
    submitNote: 'Nous étudierons votre demande avant de revenir vers vous pour définir la suite.',
    emailHeading: 'Vous préférez nous écrire ?',
    connectHeading: 'Autres façons de nous retrouver',
    cards: { linkedin: 'Suivez-nous sur LinkedIn', instagram: 'Retrouvez-nous sur Instagram', creators: 'Rejoignez notre réseau de créateurs', referrals: 'Recommandez et gagnez' },
    founderLinkedin: 'Fondateur : Mohamed Doukkali Azizi sur LinkedIn',
    faq: { lead: 'Les questions que les marques', accent: 'nous posent souvent.' },
    successHeading: 'Demande reçue.',
    successMessage: 'Merci de nous avoir contactés. Nous allons étudier votre demande et revenir vers vous pour définir la suite.',
    errorMessage: 'Votre demande n’a pas pu être envoyée. Veuillez réessayer ou nous contacter par e-mail.',
    optional: 'Facultatif',
    sending: 'Envoi en cours…',
    consent: 'J’accepte que CONVRT conserve les informations que j’ai saisies et les utilise pour étudier ma demande et me contacter à ce sujet.',
    privacySee: 'Consultez la', privacyLabel: 'Politique de confidentialité',
    backHome: 'Retour à l’accueil',
    honeypotLabel: 'Laissez ce champ vide',
    errors: {
      required: 'Ce champ est obligatoire.', invalid: 'Veuillez vérifier cette réponse.', tooLong: 'Ce texte est trop long.', tooShort: 'Ajoutez un peu plus de détails.',
      email: 'Saisissez une adresse e-mail valide.', website: 'Saisissez une adresse de site, un lien de profil ou un @identifiant.', consent: 'Veuillez cocher la case pour continuer.', service: 'Sélectionnez un service.',
    },
    formLabel: 'Formulaire de demande générale',
    breadcrumbHome: 'Accueil',
    budgets: { 'under-5k': `Moins de 5${NB}000${NB}€`, '5k-20k': `De 5${NB}000 à 20${NB}000${NB}€`, '20k-plus': `Plus de 20${NB}000${NB}€`, unsure: 'Je ne sais pas encore' },
  },

  ar: {
    badge: 'تواصل معنا',
    h1: { lead: 'لنتحدث عن', accent: 'مشروعك', tail: '.' },
    intro: 'سواء كنت تبحث عن فيديوهات لحملاتك الإعلانية، أو فيديوهات UGC وSpokesperson، أو شريك إبداعي على المدى الطويل، نصنع محتوى يجذب انتباه جمهورك ويبرز قيمة علامتك التجارية.',
    formHeading: 'أخبرنا عن مشروعك.',
    labels: { fullName: 'الاسم الكامل', email: 'البريد الإلكتروني', company: 'العلامة التجارية أو الشركة', website: 'الموقع الإلكتروني أو حسابات التواصل الاجتماعي', service: 'الخدمة المطلوبة', budget: 'الميزانية التقديرية', message: 'أخبرنا عن تفاصيل مشروعك' },
    placeholders: { fullName: 'اسمك الكامل', email: 'you@yourbrand.com', company: 'اسم العلامة التجارية أو الشركة', website: 'https://', service: 'اختر الخدمة المناسبة', budget: 'حدد الميزانية التقديرية', message: 'ما الأهداف التي ترغب في تحقيقها؟' },
    services: { ugc: 'فيديوهات UGC', spokesperson: 'فيديوهات Spokesperson', organic: 'المحتوى العضوي لمنصات التواصل الاجتماعي', saas: 'فيديوهات برامج SaaS والتطبيقات', custom: 'مشروع مخصص', unsure: 'لم أحدد بعد' },
    submit: 'إرسال الطلب',
    submitNote: 'سنراجع طلبك ونتواصل معك لتحديد الخطوات التالية.',
    emailHeading: 'تفضل التواصل عبر البريد الإلكتروني؟',
    connectHeading: 'طرق أخرى للتواصل',
    cards: { linkedin: 'تابعنا على LinkedIn', instagram: 'تابعنا على Instagram', creators: 'انضم إلى شبكة صناع المحتوى', referrals: 'رشّح عميلًا واربح' },
    founderLinkedin: 'المؤسس: Mohamed Doukkali Azizi على LinkedIn',
    faq: { lead: 'الأسئلة التي تطرحها', accent: 'العلامات التجارية عادةً.' },
    successHeading: 'تم استلام طلبك.',
    successMessage: 'شكرًا لتواصلك معنا. سنراجع طلبك ونتواصل معك لتحديد الخطوات التالية.',
    errorMessage: 'تعذر إرسال طلبك. يرجى المحاولة مرة أخرى أو التواصل معنا عبر البريد الإلكتروني.',
    optional: 'اختياري',
    sending: 'جارٍ الإرسال…',
    consent: 'أوافق على أن تحتفظ CONVRT بالبيانات التي أدخلتها وتستخدمها لمراجعة طلبي والتواصل معي بشأنه.',
    privacySee: 'اطّلع على', privacyLabel: 'سياسة الخصوصية',
    backHome: 'العودة إلى الصفحة الرئيسية',
    honeypotLabel: 'اترك هذا الحقل فارغًا',
    errors: {
      required: 'هذا الحقل مطلوب.', invalid: 'يرجى مراجعة هذه الإجابة.', tooLong: 'النص طويل جدًا.', tooShort: 'يرجى إضافة مزيد من التفاصيل.',
      email: 'أدخل بريدًا إلكترونيًا صحيحًا.', website: 'أدخل عنوان موقع أو رابط حساب أو اسم مستخدم يبدأ بـ @.', consent: 'يرجى تحديد المربع للمتابعة.', service: 'اختر الخدمة.',
    },
    formLabel: 'نموذج الاستفسار العام',
    breadcrumbHome: 'الرئيسية',
    budgets: { 'under-5k': 'أقل من 5,000 دولار', '5k-20k': 'من 5,000 إلى 20,000 دولار', '20k-plus': 'أكثر من 20,000 دولار', unsure: 'لم أحدد بعد' },
  },
}

/* The words the visitor reads for a field-level error code. */
export function errorText(copy, field, code) {
  if (code === 'required') return field === 'consent' || field === 'service' ? copy.errors[field] : copy.errors.required
  if (code === 'invalid') return field === 'email' || field === 'website' ? copy.errors[field] : copy.errors.invalid
  return copy.errors[code] ?? copy.errors.invalid
}
