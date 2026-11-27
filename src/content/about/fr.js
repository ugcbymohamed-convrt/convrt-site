// FR About page content: the owner's professionally localized copy (CONVRT-FR.md, 27 Nov 2026), copied verbatim.
// GENERATED ONCE from the supplied file; edit only to apply new supplied text. The only additions are the [[label|target]] link tokens, placed on the same words the English About page links.
// Internal targets are localized at render time (hrefFor); external ones come from src/config.js. Shape: see src/components/about/AboutLayout.jsx.
import { COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL, INSTAGRAM_URL } from '../../config.js'
import { CREATOR_FORM } from '../trustPages.js'

export default {
  badge: "À propos de CONVRT",
  h1: { lead: "À propos de", accent: "CONVRT Studio" },
  intro: "CONVRT Studio est un studio créatif dirigé par son fondateur. Nous produisons des publicités UGC avec de vrais créateurs, des vidéos pour les SaaS et les applications, des vidéos spokesperson et du contenu organique pour les réseaux sociaux. Stratégie créative, écriture des scripts, casting, tournage et montage sont réunis au sein d'un même studio, avec une approche axée sur la performance.",
  glance: {
    heading: "CONVRT Studio en bref",
    items: [
      { label: "Notre métier", text: "[[Publicités vidéo UGC|/ugc-video-agency]], [[production vidéo pour les SaaS et les applications|/saas-video-production]], [[vidéos spokesperson|/spokesperson-video-production]] et [[vidéos organiques pour les réseaux sociaux|/social-media-video-production]]." },
      { label: "Nos clients", text: "Exclusivement des entreprises, dans des secteurs variés : SaaS, e-commerce, applications, technologie et produits de grande consommation, notamment. Nous travaillons avec des clients à l'international, notamment en Europe, au Royaume-Uni, au Moyen-Orient et aux États-Unis." },
      { label: "Notre méthode de production", text: "Stratégie créative, scripts, casting, tournage et montage au sein d'un même studio. Nous collaborons avec des talents internes et des créateurs indépendants. Nos vidéos UGC et spokesperson mettent en scène de vraies personnes, et non des avatars générés par l'IA. Vous découvrez des exemples de réalisations des créateurs avant la production et validez les concepts et les scripts avant le tournage." },
      { label: "Nos lieux de production", text: "Production à distance grâce à notre réseau de créateurs et tournages sur place en Espagne." },
      { label: "Fondateur", text: "CONVRT Studio est dirigé par son fondateur, Mohamed Doukkali Azizi, professionnel indépendant (autónomo) immatriculé en Espagne, sous le statut duquel l'activité est exercée." },
      { label: "Langues", text: "Anglais, espagnol, français et arabe. D'autres langues sont disponibles sur demande, selon la disponibilité des créateurs." },
      { label: "Réalisations clients", text: "Graspo : 10,7 millions de vues organiques sur Facebook et Instagram, de janvier à juin 2026 ([[étude de cas|/case-studies/graspo]]). Elyon Dubai : plus de 160 créas produites, dont une vidéo incarnée par un créateur ayant obtenu un ROAS de 5,28x, selon le client ([[étude de cas|/case-studies/elyon]]). Ces résultats sont propres à chaque client et à la période concernée ; ils ne sont ni représentatifs des résultats habituels ni garantis." },
      { label: "Offres et conditions", text: "Consultez notre [[page Tarifs|/pricing]]." },
      { label: "Retrouvez-nous", text: "Convrt.studio, [[CONVRT Studio sur LinkedIn|" + COMPANY_LINKEDIN_URL + "]] et [[Instagram|" + INSTAGRAM_URL + "]], ainsi que le profil [[LinkedIn|" + FOUNDER_LINKEDIN_URL + "]] de notre fondateur." },
    ],
  },
  what: {
    badge: "Notre métier",
    lead: "Nous créons des vidéos conçues pour capter l'attention, inspirer confiance et inciter à l'action.",
    services: [
      { name: "Publicités vidéo UGC", href: "/ugc-video-agency", text: "Des publicités incarnées par des créateurs pour vos campagnes payantes sur les réseaux sociaux, produites de A à Z." },
      { name: "Production vidéo pour les SaaS et les applications", href: "/saas-video-production", text: "Vidéos explicatives, démonstrations de produits, animations et publicités pour les SaaS, les logiciels et les applications, adaptées à votre brief." },
      { name: "Vidéos spokesperson", href: "/spokesperson-video-production", text: "Des vidéos incarnées par un présentateur pour vos sites web, démonstrations de produits, applications et campagnes publicitaires." },
      { name: "Vidéos organiques pour les réseaux sociaux", href: "/social-media-video-production", text: "Stratégie de contenu, production, publication et gestion de communauté sur Facebook, Instagram et TikTok." },
    ],
    outro: "Les tarifs et conditions de nos offres sont disponibles sur la [[page Tarifs|/pricing]]. Nous travaillons exclusivement avec des entreprises.",
  },
  founder: { badge: "Les coulisses de CONVRT", heading: "Un studio dirigé par son fondateur", paragraphs: [
    "CONVRT Studio est dirigé par son fondateur, Mohamed Doukkali Azizi.",
    "Vous travaillez avec un seul studio, sans avoir à coordonner plusieurs prestataires.",
  ] },
  experience: {
    heading: "L'expérience de notre fondateur",
    // the four figures themselves come from src/lib/siteStats.js; each label is the supplied bullet text after its figure
    labels: { videos: "vidéos produites", views: "de vues générées", clients: "clients accompagnés", returningClients: "de clients récurrents" },
    disclaimer: "Ces chiffres reflètent l'ensemble de l'expérience professionnelle de notre fondateur, y compris les projets réalisés au sein de CONVRT Studio et ses précédents projets de production créative.",
  },
  creators: { badge: "De vraies personnes face caméra", heading: "Comment nous collaborons avec les créateurs", paragraphs: [
    "CONVRT travaille avec des talents internes et des créateurs indépendants. Nous vous recommandons le créateur ou le présentateur le mieux adapté à votre marque et vous présentons des exemples de réalisations pertinents avant la production. Vous pouvez participer à la sélection si vous le souhaitez.",
    "Nous sélectionnons les créateurs en fonction des objectifs de votre campagne, de votre audience cible et des concepts créatifs validés. La participation d'un créateur en particulier dépend de sa disponibilité.",
    "Les créateurs indépendants souhaitant collaborer avec CONVRT peuvent postuler via le [[formulaire dédié aux créateurs|" + CREATOR_FORM + "]]. CONVRT choisit les créateurs avec lesquels il collabore. Une vidéo ne figure dans notre portfolio de créateurs qu'avec l'accord du créateur et la validation de CONVRT.",
    "Nos vidéos UGC et spokesperson bénéficient d'une direction créative et d'un contrôle qualité assurés par des personnes.",
    "Les vidéos de notre [[portfolio de créateurs|/creator-showcase]] sont des exemples de réalisations de créateurs indépendants. Elles illustrent différents styles et approches et ne sont pas nécessairement des productions de CONVRT.",
  ] },
  markets: { badge: "Sans frontières", heading: "Marchés, production et langues", paragraphs: [
    "Nous produisons en anglais, espagnol, français et arabe. D'autres langues sont disponibles sur demande, selon la disponibilité des créateurs. CONVRT Studio est immatriculé en Espagne.",
    "Nous proposons une production vidéo à distance grâce à notre réseau de créateurs, ainsi que des tournages sur place en Espagne. Des tournages dans d'autres pays peuvent être organisés selon les besoins du projet, les disponibilités et sous réserve de validation. Les tournages sur place sont soumis au périmètre du projet, aux disponibilités et, le cas échéant, à un devis.",
  ] },
  scope: { badge: "Périmètre de nos prestations", heading: "Ce que nous proposons, et ce que nous ne proposons pas", items: [
    { title: "Production créative, pas d'achat média", text: "Nous assurons la stratégie créative, l'écriture des scripts, le casting, le tournage, le montage et la livraison de vidéos finalisées, prêtes à être diffusées sur les plateformes. Nous n'achetons pas d'espaces publicitaires et ne gérons pas vos comptes publicitaires : vous gardez la maîtrise de la diffusion et de votre budget. Nous ne garantissons aucun résultat précis : les performances dépendent de votre offre, de votre audience et de votre budget." },
    { title: "Gestion de communauté, pas de service client", text: "Nos offres de contenu organique comprennent la publication sur vos comptes et la gestion de communauté, notamment les interactions avec votre audience et les relations de la marque. Le service client ne fait pas partie de la prestation." },
    { title: "Vidéos finalisées, rushes en option", text: "Chaque vidéo est livrée finalisée et montée professionnellement. Les rushes sont disponibles uniquement en option, en complément des vidéos finalisées, jamais à leur place." },
    { title: "Droits d'utilisation sous licence", text: "Les droits d'utilisation définissent les modalités d'exploitation des vidéos pendant la durée prévue dans votre offre. Ils ne constituent pas une cession de la titularité des droits d'auteur." },
  ] },
  closing: { badge: "Travaillons ensemble", heading: "Créons votre prochaine grande créa", text: "Découvrez notre approche pour les projets [[Graspo|/case-studies/graspo]] et [[Elyon Dubai|/case-studies/elyon]], puis [[contactez-nous|/contact]] ou demandez [[votre stratégie créative offerte (Creative Growth Roadmap)|/creative-growth-roadmap]].", primary: "Obtenez 5 concepts publicitaires offerts", secondary: "Découvrez nos services" },
}
