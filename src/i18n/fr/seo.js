/* FRENCH PAGE-LEVEL SEO: title, description and social copy per translated page, keyed by the ENGLISH base path. Same role as SITE_SEO in src/seo/siteSeo.js and ES_SEO.
   Prices come from the French pricing configuration (never retyped).

   Keyword → page decisions (completed French Keyword Planner research, Nov 2026; volumes are rounded, directional estimates, never exact demand, and a blank estimate is not zero):
     /fr/                       broad commercial video production: agence vidéo publicitaire, production vidéo publicitaire, création de contenus  (P1: agence de production vidéo 500, agence création vidéo)
     /fr/ugc-video-agency       agence UGC (P1: "agence ugc" 500, "agence ugc france" 50): the agency-buying intent, one page, no city pages (no French office is claimed)
     /fr/pricing                tarifs UGC / prix de production vidéo (decision-stage terms with no measured volume, still buyer-relevant)
     /fr/creator-showcase       exemples de vidéos UGC de créateurs francophones
   /fr/spokesperson-video-production   vidéo Spokesperson (seed "vidéo porte parole", "vidéo avec présentateur": no measured volume; adjacent "vidéo présentation entreprise" 500). Own page: the
                                       presenter-led, scripted video for site, demos, apps and ads, never "agence UGC"
   /fr/saas-video-production           vidéo explicative SaaS (seeds "vidéo explicative saas", "vidéo démonstration logiciel", "agence vidéo saas": no measured volume): explainers, product demos, animated videos
   /fr/social-media-video-production   vidéos pour les réseaux sociaux, contenu organique ("agence vidéo réseaux sociaux" 50, "agence production vidéo réseaux sociaux" seed): short-form organic video, never paid UGC
   Distinct primary keyword per page: FR_PRIMARY_KEYWORDS below (tests/french-services.test.mjs checks each one is in its page's title and H1 and that no page borrows another's).
   The homepage deliberately does NOT target "agence UGC" as its primary phrase, so the two pages do not compete; it introduces UGC and links to the dedicated page. */

import { SPRINT, USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { priceOf, formatPrice, isPricingApproved } from '../pricing.js'

/* French share image. The default OG image (public/og/convrt-og.png) has ENGLISH text burned into it, so French pages reuse it only until a French version exists. Add
   public/og/convrt-og-fr.png (1200x630 PNG, same layout) and set this to true: every French page then switches by itself.
   tests/i18n.test.mjs checks that the file exists, is 1200x630 PNG, whenever this is true. */
export const FR_OG_IMAGE_READY = true // public/og/convrt-og-fr.png: same layout as the English image, French text (rendered from HTML with the site's Inter font)
export const FR_OG_IMAGE_PATH = '/og/convrt-og-fr.png'

export const FR_OG_IMAGE_ALT = 'CONVRT : des vidéos publicitaires pensées pour capter l’attention. Publicités UGC, vidéos Spokesperson et contenus pour les réseaux sociaux.'

/* The primary keyword of each French service page (one each, so the pages never compete: « agence UGC » belongs to /fr/ugc-video-agency only). The rounded Keyword Planner volumes, when
   any, are in the header above; most of these seeds have none, so no volume is quoted anywhere. */
export const FR_PRIMARY_KEYWORDS = {
  '/ugc-video-agency': 'agence UGC',
  '/spokesperson-video-production': 'Spokesperson', // the owner's service term (2026-11-24); « porte-parole » stays in the description for the search term
  '/saas-video-production': 'vidéo explicative SaaS',
  '/social-media-video-production': 'réseaux sociaux',
}

export const FR_SEO = {
  '/': {
    title: 'Agence vidéo publicitaire et création de contenus | CONVRT',
    description:
      'Production vidéo publicitaire pour les marques : publicités UGC, vidéos Spokesperson et contenus pour les réseaux sociaux, de la stratégie créative au montage.',
    ogTitle: 'CONVRT : des vidéos publicitaires pensées pour capter l’attention',
    ogDescription: 'Publicités UGC, vidéos Spokesperson, contenus pour les réseaux sociaux et stratégie créative, pour des campagnes qui se démarquent.',
  },
  '/ugc-video-agency': {
    title: 'Agence UGC : vidéos UGC pour vos publicités | CONVRT',
    // The "dès X/mois" price appears only while the EUR pricing is approved; the amounts are the owner-approved ones (src/i18n/fr/pricing.js).
    description: isPricingApproved('fr')
      ? `Agence UGC : production de vidéos UGC pour vos publicités sur les réseaux sociaux, de la stratégie au montage. Offres dès ${formatPrice('fr', priceOf('fr', SPRINT.monthly))} HT/mois, avec ${USAGE_RIGHTS.includedMonths} mois de droits d’utilisation mondiaux inclus.`
      : `Agence UGC : production de vidéos UGC pour vos publicités sur les réseaux sociaux, de la stratégie au montage. Offres mensuelles et ponctuelles, avec ${USAGE_RIGHTS.includedMonths} mois de droits d’utilisation mondiaux inclus.`,
    ogTitle: 'CONVRT : des publicités UGC pensées pour les réseaux sociaux payants',
    ogDescription: 'Des publicités UGC portées par de vrais créateurs, produites de A à Z, avec des tarifs et des droits d’utilisation transparents.',
  },
  '/spokesperson-video-production': {
    title: 'Vidéo Spokesperson : de vrais présentateurs | CONVRT',
    description:
      'Production de vidéos Spokesperson : de vrais porte-parole face caméra, en plusieurs langues, pour votre site, vos démos produit, vos applications et vos publicités. Du script au montage.',
    ogTitle: 'CONVRT : production de vidéos Spokesperson',
    ogDescription: 'Des vidéos Spokesperson portées par de vrais présentateurs, en plusieurs langues, pour votre site, vos démos produit, vos applications et vos publicités.',
  },
  '/saas-video-production': {
    title: 'Vidéo explicative SaaS : démos produit et publicités | CONVRT',
    description:
      'Production vidéo SaaS pour les éditeurs de logiciels et d’applications : vidéos explicatives, démonstrations produit, vidéos animées et publicités, du concept à la livraison.',
    ogTitle: 'CONVRT : production vidéo SaaS pour les éditeurs de logiciels et d’applications',
    ogDescription: 'Vidéos explicatives, démonstrations produit, vidéos animées et publicités pour les logiciels : stratégie, script, présentateurs, motion design et montage au même endroit.',
  },
  '/social-media-video-production': {
    title: 'Vidéos pour les réseaux sociaux : contenu organique | CONVRT',
    description:
      'Production de vidéos organiques pour les réseaux sociaux : contenu court porté par des humains, de la stratégie à la publication et à l’animation de communauté sur Facebook, Instagram et TikTok.',
    ogTitle: 'CONVRT : production et gestion de vidéos organiques pour les réseaux sociaux',
    ogDescription: 'Des vidéos courtes portées par des humains pour vos réseaux sociaux, de la stratégie de contenu et du script au tournage, au montage, à la publication et à l’animation de communauté.',
  },
  '/pricing': {
    title: 'Tarifs UGC et production vidéo publicitaire | CONVRT',
    description:
      'Les offres de production UGC, publicités vidéo et contenus pour les réseaux sociaux de CONVRT : prix en euros hors taxes, livrables, droits d’utilisation et politique de révisions.',
  },
  '/creator-showcase': {
    title: 'Exemples de vidéos UGC de créateurs francophones | CONVRT',
    description:
      'Découvrez des exemples de vidéos UGC réalisés par des créateurs francophones indépendants : produits, applications et services. Ce ne sont pas des productions CONVRT.',
    ogTitle: 'Creator Showcase CONVRT : exemples de vidéos UGC francophones',
    ogDescription: 'De vraies vidéos de créateurs francophones indépendants, pour comparer les styles et les approches créatives.',
  },
  '/case-studies/graspo': {
    title: 'Étude de cas Graspo : 10,7 M de vues organiques | CONVRT',
    description:
      'Comment CONVRT a développé la présence organique de Graspo sur les marchés arabophones : 10,7 M de vues organiques, 3,4 M de comptes touchés et 75 prospects entrants, de janvier à juin 2026.',
    ogTitle: 'Graspo × CONVRT : de l’expertise en impression à 10,7 M de vues organiques',
    ogDescription: 'Une étude de cas de gestion de contenu pour les réseaux sociaux : stratégie, production et suivi des demandes entrantes sur les marchés arabophones.',
  },
  '/case-studies/elyon': {
    title: 'Étude de cas Elyon Dubai : publicités avec créateurs | CONVRT',
    description:
      'Comment CONVRT a bâti un système de publicités avec créateurs pour Elyon Dubai : plus de 160 créations, des interviews de rue et une vidéo avec un ROAS de 5,28× déclaré par le client.',
    ogTitle: 'Elyon Dubai × CONVRT : des créations publicitaires pour une marque de parfums de luxe',
    ogDescription: 'Des publicités avec créateurs, des interviews de rue et des tests créatifs continus, transformés en achats mesurables pour Elyon Dubai.',
  },
  // Same content as /fr/case-studies/graspo (the default study, exactly as in English): a duplicate that points at the original.
  '/case-studies': {
    title: 'Études de cas : Graspo et Elyon Dubai | CONVRT',
    description: 'Deux études de cas CONVRT : le contenu organique de Graspo sur les marchés arabophones et les publicités avec créateurs d’Elyon Dubai.',
  },
  '/referrals': {
    title: 'Programme de parrainage CONVRT : gagnez des récompenses',
    description:
      'Recommandez des marques SaaS et e-commerce à CONVRT, gagnez des récompenses pour chaque mise en relation aboutie et offrez à vos contacts une amélioration créative exclusive.',
  },
  '/creative-growth-roadmap': {
    title: 'Stratégie créative offerte : 5 concepts publicitaires | CONVRT',
    description:
      'Recevez cinq concepts publicitaires pensés pour votre marque : angles créatifs, hooks et recommandations de test, présentés lors d’une session stratégique offerte.',
  },
  '/risk-free-trial': {
    title: '1 vidéo offerte : testez notre production | CONVRT',
    description:
      'Candidatez pour recevoir une vidéo de test produite par CONVRT, avec deux variantes de hook à tester. Chaque candidature est examinée et l’offre reste soumise à validation et aux conditions du programme.',
  },
}
