/* ─────────────────────────────────────────────
   /free-hooks industries — the two selectable libraries.

   `key` is the value sent to the server: api/_lib/subscribe.js maps it to the
   MailerLite group (MAILERLITE_GROUP_SAAS_ID / MAILERLITE_GROUP_ECOMMERCE_ID).
   Do not rename the keys without changing the server mapping.

   The hook libraries themselves (10 hooks each) are delivered by MailerLite
   email automations, not shown on this page.
───────────────────────────────────────────── */

export const INDUSTRIES = [
  {
    key: 'saas',
    name: 'SaaS & Software',
    short: 'SaaS',
    description: '10 advertising hooks tailored to software companies, apps, and SaaS products.',
  },
  {
    key: 'ecommerce',
    name: 'E-commerce & DTC',
    short: 'E-commerce',
    description: '10 advertising hooks tailored to physical products, UGC, and e-commerce brands.',
  },
]

export const industryByKey = (key) => INDUSTRIES.find((i) => i.key === key) || null
