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
    title: 'Des publicités UGC pensées pour votre marque.',
    intro: 'De la stratégie créative à la livraison, découvrez ce que nous produisons et comment nous travaillons.',
    cards: [
      {
        id: 'produce',
        title: 'Ce que nous créons',
        text: 'Des publicités UGC avec de vrais créateurs, déclinées en plusieurs concepts et versions pour vos campagnes.',
      },
      {
        id: 'for',
        title: 'Pour quelles marques ?',
        text: 'E-commerce, SaaS, applications et autres marques qui souhaitent renouveler leurs créations publicitaires.',
      },
      {
        id: 'receive',
        title: 'Ce que vous recevez',
        text: 'Des concepts, scripts et vidéos finalisées, avec des variations créatives selon la formule choisie.',
      },
      {
        id: 'terms',
        title: 'Tarifs et droits d’utilisation',
        text: 'Des formules mensuelles ou ponctuelles, avec des droits d’utilisation clairement définis.',
        link: { label: 'Voir les formules et conditions', href: '/pricing#packages' },
      },
    ],
  }
}
