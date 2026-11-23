/* THE FRENCH CLIENT STAGE (homepage « cas client »). The same premium stage as the English homepage (components/home/IndustryShowcase.jsx, RotaryStage.jsx), fed with ONE client and
   TWO landscape videos instead of three clients and three portrait videos.

   WHICH CLIENT AND WHY (owner brief, 2026-11-23): the French section tells one story: the client came back to commission more work after the first project. The only horizontal (16:9) client
   videos in the owner's French folder are FIXD1 and FIXD2 (CONVRT/CREATORS/French/Mohamed), and FIXD is one of the 13 verified client relationships authorised for display
   (businessKnowledge.js, 'client-logos'). The owner's brief states that this client returned for more work; NO count of orders, revenue or campaign result is recorded anywhere, so none is shown.
   The copy says only what the brief says. TO CONFIRM with the owner before Production: that FIXD is the client meant, and the wording « d'autres » (more than one further project).

   The videos are the portfolio entries tagged `showcase: 'fixd'` in src/content/portfolio.js (French-only). The first is the front frame. */
export const FR_SHOWCASE = {
  orientation: 'landscape',
  eyebrow: 'Cas client',
  headline: ['Un premier projet.', 'Puis d’autres.'], // the second line is set in lime
  text: 'Une collaboration qui s’est poursuivie au-delà de la première vidéo.',
  clientId: 'fixd',
  client: 'FIXD',
  plateLabel: 'Client',
  logo: { src: '/clients/fixd.png', alt: 'FIXD', w: 1000, h: 312, height: 40 },
  selectorHeight: 22,
  stageLabel: 'Vidéos du client FIXD. Choisissez la vidéo en arrière-plan pour la placer au premier plan.',
  primaryLabel: 'Recevoir 5 concepts gratuits',
  secondary: { label: 'Voir nos créateurs', href: '/creator-showcase' },
}
