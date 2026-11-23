/* FRENCH-ONLY "L'essentiel" SECTION of /fr/ugc-video-agency (editorial copy, not a translation of an English string: English has no such section).

   WHY IT EXISTS. The French UGC page is the commercial destination for people actively choosing an « agence UGC ». The English page answers "what do I get, for whom, at what price, with which rights"
   in its FAQ; for a French buyer those four answers belong above the fold of the page, in one scannable block. Every figure is READ from the business data (src/seo/businessKnowledge.js) or the approved
   French pricing (src/i18n/fr/pricing.js), never typed here, and every sentence restates only terms the English page already publishes (human-created UGC, no media buying, 3 versions per concept,
   2 revision rounds, 6 months of usage rights, 3-month initial commitment). No guarantee, no result, no French office or team is claimed. */

import { SPRINT, SPRINT_PLUS, REVISIONS, USAGE_RIGHTS, COMMITMENT } from '../../seo/businessKnowledge.js'
import { priceOf, formatPrice } from '../pricing.js'

const price = (m) => formatPrice('fr', priceOf('fr', m))

export function frUgcOverview() {
  return {
    eyebrow: 'L’essentiel',
    title: 'Une agence UGC pour des publicités qui se démarquent.',
    intro: 'Ce que nous produisons, pour qui, ce que vous recevez et à quelles conditions.',
    cards: [
      {
        id: 'produce',
        title: 'Ce que nous produisons',
        text: 'Des publicités vidéo UGC créées par de vrais créateurs : recherche créative, concepts et hooks, scripts, sélection des créateurs, tournage, montage, sous-titres et versions créatives. Nos vidéos UGC sont 100 % créées par des humains. Nous fabriquons les publicités : nous n’achetons pas de média et ne gérons pas vos comptes publicitaires.',
      },
      {
        id: 'for',
        title: 'Pour qui',
        text: 'Les marques qui font de la publicité sur les réseaux sociaux et veulent tester plusieurs angles créatifs : e-commerce, SaaS, applications, technologie, produits grand public et d’autres secteurs. Quand un projet ne rentre pas dans une formule standard, nous en construisons une sur mesure.',
      },
      {
        id: 'receive',
        title: 'Ce que vous recevez',
        text: `Selon la formule : ${SPRINT.concepts} ou ${SPRINT_PLUS.concepts} concepts, chacun décliné en ${SPRINT.variationsPerConcept} versions (${SPRINT.variations} ou ${SPRINT_PLUS.variations} versions publicitaires finalisées), ${REVISIONS.roundsPerConcept} cycles de modifications par concept et des recommandations de test. Vous validez les concepts et les scripts avant tout tournage. Nous ne garantissons pas les performances publicitaires.`,
      },
      {
        id: 'terms',
        title: 'Tarifs et droits d’utilisation',
        text: `À partir de ${price(SPRINT.monthly)} par mois, ou ${price(SPRINT.oneOff)} en projet ponctuel (prix hors TVA). ${USAGE_RIGHTS.includedMonths} mois de droits d’utilisation mondiaux sont inclus à compter de la livraison : publicité payante, réseaux sociaux organiques et site web. Les formules mensuelles débutent par ${COMMITMENT.initialMonths} mois d’engagement, puis se poursuivent mois par mois avec ${COMMITMENT.cancellationNoticeDays} jours de préavis.`,
        link: { label: 'Voir les formules, les prolongations de droits et les conditions', href: '/pricing#packages' },
      },
    ],
  }
}
