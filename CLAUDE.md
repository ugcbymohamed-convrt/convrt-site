# CONVRT site — notes for Claude Code

- Stack: React 18 + Vite + Tailwind, deployed on Vercel. Tests: `node --test tests/*.test.mjs`. Build: `npm run build`.
- **Blog (The CONVRT Blog):** to add or change an article, edit `src/content/blog/<slug>.md` only — follow
  `docs/blog-publishing.md`. Never hard-code article lists in the page components, never invent authors, dates or
  article content, and keep `status: draft` until the user says to publish. The `/blog` index stays
  `noindex, follow` until the user approves flipping `BLOG_INDEXABLE` (and removing the `vercel.json` header).
- Do not touch the lead-generation forms, MailerLite integration (`api/_lib/subscribe.js`) or Resend notifications (`api/_lib/notify.js`) unless asked.
- Never push to `main` or deploy to Production without the user's explicit approval; feature branches get a Vercel Preview.
