/* REVISION 3 (2026-11-24, owner brief): the section is no longer an individual case study. It is the FOUNDER-EXPERIENCE section (« Plus de 500 clients accompagnés », eyebrow « Expérience du fondateur »;
   the 500+ figure is the founder's combined professional experience, siteStats.js / FOUNDER_EXPERIENCE) and the stage shows THREE landscape FIXD videos (FIXD1-3). The owner decided to keep FIXD as the only
   client on the homepage stage (no second e-commerce client, no selector): the FR-2 folder held only FIXD3. The FIXD plate is a still logo, not a tab. No claim is made about FIXD's order count.
   (The note below, written for revision 2, still explains why FIXD.)

   THE FRENCH CLIENT STAGE (homepage). The same premium stage as the English homepage (components/home/IndustryShowcase.jsx, RotaryStage.jsx), fed with ONE client and
   THREE landscape videos instead of three clients and three portrait videos.

   WHICH CLIENT AND WHY (owner brief, 2026-11-23): the French section tells one story: the client came back to commission more work after the first project. The only horizontal (16:9) client
   videos in the owner's French folder are FIXD1 and FIXD2 (CONVRT/CREATORS/French/Mohamed), and FIXD is one of the 13 verified client relationships authorised for display
   (businessKnowledge.js, 'client-logos'). The owner's brief states that this client returned for more work; NO count of orders, revenue or campaign result is recorded anywhere, so none is shown.
   The copy says only what the brief says. OWNER CONFIRMATION (chat, 2026-11-23): FIXD is the client meant, and it returned for additional work after the initial project. The number of further projects was not stated and is not shown; the copy claims no count, revenue or result.

   The videos are the portfolio entries tagged `showcase: 'fixd'` in src/content/portfolio.js (French-only). The first is the front frame. */
export const FR_SHOWCASE = {
  orientation: 'landscape',
  eyebrow: 'Expérience du fondateur',
  headline: ['Plus de', '500 clients accompagnés'], // the second part is set in lime
  text: 'Une expérience acquise chez CONVRT et au fil de collaborations dans la production créative.',
  clientId: 'fixd',
  client: 'FIXD',
  plateLabel: 'Client',
  logo: { src: '/clients/fixd.png', alt: 'FIXD', w: 1000, h: 312, height: 40 },
  selectorHeight: 22,
  stageLabel: 'Vidéos du client FIXD. Choisissez la vidéo en arrière-plan pour la placer au premier plan.',
  primaryLabel: 'Recevoir 5 concepts gratuits',
  secondary: { label: 'Voir nos créateurs', href: '/creator-showcase' },
}
