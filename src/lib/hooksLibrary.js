/* ─────────────────────────────────────────────
   /free-hooks content.

   INDUSTRIES — the two selectable libraries. `key` is the value sent to the
   server (api/_lib/subscribe.js maps it to a MailerLite group).

   SAMPLE_HOOKS — a handful of hooks quoted verbatim from CONVRT's hook PDFs,
   used only for the on-page preview. The full 10-hook libraries are NOT on
   this page; MailerLite delivers them by email.
     SaaS:       CONVRT_10_SaaS_AI_SaaS_Hooks_Corrected.pdf  (hooks 01–03)
     E-commerce: CONVRT_10_Ecommerce_Triple_Hooks.pdf         (hooks 01–04)
   Hooks 01–03 (SaaS) are identical across the SaaS PDF revisions in ~/Downloads.
   Do not invent hooks here — copy from the approved PDFs only.
───────────────────────────────────────────── */

export const INDUSTRIES = [
  {
    key: 'saas',
    name: 'SaaS & Software',
    short: 'SaaS',
    description: 'Hooks for software products, apps, demos, problem-solution ads, and product storytelling.',
  },
  {
    key: 'ecommerce',
    name: 'E-commerce & DTC',
    short: 'E-commerce',
    description: 'Hooks for physical products, UGC ads, product demonstrations, and direct-response creatives.',
  },
]

export const industryByKey = (key) => INDUSTRIES.find((i) => i.key === key) || null

export const SAMPLE_HOOKS = {
  saas: [
    {
      n: '01',
      name: 'The Painfully Relatable Hook',
      verbal: 'If you’re still [doing repetitive task] manually in 2026, you need to see this.',
      visual: 'Creator swivels their office chair toward the camera while delivering the line.',
      text: 'You’re wasting X hours a day!',
    },
    {
      n: '02',
      name: 'The Two Types of People Hook',
      verbal: 'Two types of people doing [task].',
      visual: 'Split-screen: Creator works frantically on one side while casually sipping coffee on the other.',
      text: 'Using [Brand] vs. Not using [Brand]',
    },
    {
      n: '03',
      name: 'The Time-Waste Hook',
      verbal: 'You’re spending [time] doing something that could take [shorter time].',
      visual: 'Creator walks toward the camera holding a coffee while delivering the line.',
      text: 'This will save you [X hours/day or week]',
    },
  ],
  ecommerce: [
    {
      n: '01',
      name: 'The Overhyped Product Hook',
      verbal: 'I thought this was just another one of those products TikTok made famous for absolutely no reason.',
      visual: 'Creator holds the product in their hand, looking at it skeptically while delivering the line.',
      text: 'This surprised me',
    },
    {
      n: '02',
      name: 'The Unpopular Opinion Hook',
      verbal: 'Unpopular opinion: Just because something is expensive doesn’t mean it’s better.',
      visual: 'Creator walks toward the camera holding two products, one in each hand, while delivering the line.',
      text: 'Is it just me who thinks this?',
    },
    {
      n: '03',
      name: 'The Product Replacement Hook',
      verbal: 'I don’t know who needs to hear this, but you don’t have to keep putting up with [common frustration].',
      visual: 'Creator tosses the old product onto a sofa or table while delivering the line.',
      text: 'Done with X',
    },
    {
      n: '04',
      name: 'The Relatable Problem Hook',
      verbal: 'Tell me I’m not the only one who gets annoyed every time [relatable situation].',
      visual: 'Creator sits down into frame while dealing with the frustrating situation and delivers the line directly to the camera.',
      text: 'I’m sure you can relate',
    },
  ],
}
