/* ─────────────────────────────────────────────
   Referral partner kit — the message templates shown as a PREVIEW on /referrals and sent
   (manually, after approval) to approved partners. The same text lives in
   docs/partner-kit.md; tests/referral-apply.test.mjs fails if the two drift apart.

   Both templates carry a short, natural disclosure that the partner may receive a reward.
   Nothing here is sent automatically.
───────────────────────────────────────────── */

export const KIT_EMAIL_SUBJECT = 'Quick introduction — CONVRT'

export const KIT_EMAIL_PARAGRAPHS = [
  'Hey [Name],',
  'I thought of you because I know you’re working on growing your brand.',
  'I know a creative studio called CONVRT that produces UGC and spokesperson videos for paid ads, SaaS demos, and social content.',
  'They also offer a Free Creative Growth Roadmap to help brands identify ad concepts worth testing.',
  'If you decide to work with them on a qualifying video project, there’s also an exclusive Creative Upgrade available through my referral.',
  'Happy to introduce you if you’re interested.',
  'Full disclosure: I may receive a referral reward from CONVRT if you become a client.',
]

export const KIT_SHORT_MESSAGE =
  'Hey [Name]! I know a creative studio that could be a good fit if you’re looking for fresh UGC, spokesperson, or SaaS video ads. They have a free creative planning offer, plus an exclusive bonus for referred clients. Happy to connect you if useful. (Full disclosure: I may get a referral reward if you become a client.)'

/* What an approved partner receives. Order matches the page. */
export const KIT_ITEMS = [
  'Ready-to-send introduction message',
  'Short LinkedIn / WhatsApp message',
  'FREE Creative Upgrade explainer',
  'Relevant CONVRT video examples',
  'Simple referral instructions',
  'Qualification and reward guide',
]

/* The page previews only the opening of the email; the full text is in docs/partner-kit.md. */
export const KIT_EMAIL_PREVIEW_PARAGRAPHS = 3
