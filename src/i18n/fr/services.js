/* French names and descriptions of the core services (same ids and meaning as CORE_SERVICES in src/seo/businessKnowledge.js). */
export const FR_CORE_SERVICES = {
  ugc: {
    name: 'Publicité vidéo UGC avec de vraies personnes',
    description: 'Publicités UGC portées par des créateurs pour les réseaux sociaux payants, produites de A à Z : stratégie créative, scripts, sélection des créateurs, tournage et montage.',
  },
  spokesperson: {
    name: 'Publicité vidéo Spokesperson',
    description: 'Des vidéos Spokesperson qui présentent une offre clairement et inspirent confiance, produites de A à Z par CONVRT.',
  },
  organic: {
    name: 'Production et gestion de contenus organiques pour les réseaux sociaux',
    description: 'Stratégie de contenu, production, publication sur les comptes du client, rapports de performance et animation sur Facebook, Instagram et TikTok.',
  },
}

/* SaaS is a core service in the English data (CORE_SERVICES), but the French homepage graph lists only the three services it always had, so it is kept out of FR_CORE_SERVICES (the
   homepage JSON-LD is unchanged). Used only by the /fr/saas-video-production Service node. Same meaning as CORE_SERVICES.saas. */
export const FR_SAAS_SERVICE = {
  name: 'Production vidéo SaaS',
  description: 'Production vidéo pour les éditeurs de logiciels et d’applications : vidéos explicatives SaaS, démonstrations produit, présentations de l’application, vidéos explicatives animées, présentations de logiciels portées par des humains et publicités vidéo, produites de A à Z par CONVRT.',
}
