/* FRENCH PAGE-LEVEL SEO: title, description and social copy per translated page, keyed by the ENGLISH base path. Same role as SITE_SEO in src/seo/siteSeo.js and ES_SEO.
   Prices come from the French pricing configuration (never retyped).

   Keyword → page decisions (completed French Keyword Planner research, Nov 2026; volumes are rounded, directional estimates, never exact demand, and a blank estimate is not zero):
     /fr/                       broad commercial video production: agence vidéo publicitaire, production vidéo publicitaire, création de contenus  (P1: agence de production vidéo 500, agence création vidéo)
     /fr/ugc-video-agency       agence UGC (P1: "agence ugc" 500, "agence ugc france" 50): the agency-buying intent, one page, no city pages (no French office is claimed)
     /fr/pricing                tarifs UGC / prix de production vidéo (decision-stage terms with no measured volume, still buyer-relevant)
     /fr/creator-showcase       exemples de vidéos UGC de créateurs francophones
   The homepage deliberately does NOT target "agence UGC" as its primary phrase, so the two pages do not compete; it introduces UGC and links to the dedicated page. */

import { SPRINT, USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { priceOf, formatPrice, isPricingApproved } from '../pricing.js'

/* French share image. The default OG image (public/og/convrt-og.png) has ENGLISH text burned into it, so French pages reuse it only until a French version exists. Add
   public/og/convrt-og-fr.png (1200x630 PNG, same layout) and set this to true: every French page then switches by itself.
   tests/i18n.test.mjs checks that the file exists, is 1200x630 PNG, whenever this is true. */
export const FR_OG_IMAGE_READY = false
export const FR_OG_IMAGE_PATH = '/og/convrt-og-fr.png'

export const FR_OG_IMAGE_ALT = 'CONVRT : des vidéos publicitaires pensées pour capter l’attention. Publicités UGC, vidéos avec porte-parole et contenus pour les réseaux sociaux.'

export const FR_SEO = {
  '/': {
    title: 'Agence vidéo publicitaire et création de contenus | CONVRT',
    description:
      'Production vidéo publicitaire pour les marques : publicités UGC, vidéos avec porte-parole et contenus pour les réseaux sociaux, de la stratégie créative au montage.',
    ogTitle: 'CONVRT : des vidéos publicitaires pensées pour capter l’attention',
    ogDescription: 'Publicités UGC, vidéos avec porte-parole, contenus pour les réseaux sociaux et stratégie créative, pour des campagnes qui se démarquent.',
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
  '/creative-growth-roadmap': {
    title: 'Feuille de route créative offerte : 5 concepts publicitaires | CONVRT',
    description:
      'Recevez cinq concepts publicitaires pensés pour votre marque : angles créatifs, hooks et recommandations de test, présentés lors d’une session stratégique offerte.',
  },
  '/risk-free-trial': {
    title: '1 vidéo offerte : testez notre production | CONVRT',
    description:
      'Candidatez pour recevoir une vidéo de test produite par CONVRT, avec deux variantes de hook à tester. Chaque candidature est examinée et l’offre reste soumise à validation et aux conditions du programme.',
  },
}
