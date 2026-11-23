/* French copy of the three homepage client panels (src/components/CaseStudies.jsx). Same clients, same videos, same figures: only the words change.
   The Graspo follower counts come from src/lib/siteStats.js (passed in), never retyped. The videos themselves are the clients' real (English-language) work. */

import { localizeStat } from '../format.js'

const moreThan = (stat) => (stat.endsWith('+') ? `plus de ${localizeStat('fr', stat.slice(0, -1))}` : localizeStat('fr', stat))

export function frCaseCopy(id, following) {
  switch (id) {
    case 'adscale':
      return {
        tab: 'SaaS',
        title: 'Des formats longs\nqu’on ne zappe pas.',
        body: 'Si vous pensez que les formats longs n’ont pas leur place en publicité, regardez ceux-ci. Ils ne se contentent pas d’attirer l’œil : ils installent la confiance, dégagent de l’assurance et montrent que l’on sait ce que l’on fait. Des transitions soignées, des visuels accrocheurs et une narration si engageante qu’il devient presque impossible de passer à la suite.',
      }
    case 'elyon':
      return {
        tab: 'E-commerce',
        title: 'Plus de 100 créations testées.\nPlusieurs gagnantes identifiées.',
        body: 'Nous avons produit plus de 100 contenus avec Elyon Dubai. Depuis son lancement en 2025, nous avons testé de nombreux concepts et de nombreuses variantes. À ce jour, nous avons déjà identifié plusieurs formats qui fonctionnent très bien pour Elyon. Quand le produit est de qualité, il est beaucoup plus facile de créer un contenu authentique, qui parle aux gens.',
      }
    case 'graspo':
      return {
        tab: 'Impression',
        title: '6 millions de vues.\nEn moins de 2 mois.',
        body: `Nous avons généré plus de 6 millions de vues pour Graspo en moins de 2 mois. Et oui, il a d’abord fallu 6 mois de tests de contenu pour comprendre ce qui fonctionne vraiment, et ce qui ne fonctionne pas. Aujourd’hui, Graspo compte ${moreThan(following.combined)} abonnés : ${localizeStat('fr', following.facebook)} sur Facebook, ${localizeStat('fr', following.instagram)} sur Instagram et ${localizeStat('fr', following.tiktok)} sur TikTok.`,
      }
    default:
      throw new Error(`frCaseCopy: no French copy for case "${id}"`)
  }
}
