/* ─────────────────────────────────────────────
   SITE STATS — the single source of truth for the numbers quoted in more than
   one place. Update a figure here and every page that uses it follows.

   Definitions matter: "videos produced" and "creatives" are NOT interchangeable
   labels. CONVRT's overall total is counted in videos; the Elyon case study
   counts creatives in its own production tracker.
───────────────────────────────────────────── */

/* CONVRT overall — confirmed by the owner (Nov 2026). */
export const CONVRT_STATS = {
  videos: '1,200+',
  views: '40M+',
  clients: '500+',
  languages: '4',
}

/* Graspo.
   • `following` is CURRENT (latest owner-confirmed counts), shown as "today".
   • `report` is the fixed Meta Business Suite reporting window. Its numbers do
     not move when the following grows, so always show the window beside them. */
export const GRASPO_STATS = {
  following: {
    facebook: '22K',
    instagram: '8K',
    tiktok: '1K',
    combined: '30K+',
  },
  report: {
    window: 'Jan 1 – Jun 19, 2026',
    views: '10.7M',
    reach: '3.4M',
    interactions: '65K',
    leads: '75',
    highPriority: '26',
    advanced: '10',
  },
}

/* Elyon Dubai. `creatives` is the production tracker count to date. The ROAS
   figures are short Meta Ads Manager snapshots, not sustained averages. */
export const ELYON_STATS = {
  creatives: '160+',
  locations: '4',
  earlyTest: { spend: '$229.89', days: 'two', avgRoas: '3.63x' },
  standout: { roas: '5.28x', purchases: '9' },
}
