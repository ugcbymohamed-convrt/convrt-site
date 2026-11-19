# CONVRT site — notes for Claude Code

- Stack: React 18 + Vite + Tailwind, deployed on Vercel. Tests: `node --test tests/*.test.mjs`. Build: `npm run build`.
- **Blog (The CONVRT Blog):** to add or change an article, edit `src/content/blog/<slug>.md` only — follow
  `docs/blog-publishing.md`. Never hard-code article lists in the page components, never invent authors, dates or
  article content, and keep `status: draft` until the user says to publish. The `/blog` index stays
  `noindex, follow` until the user approves flipping `BLOG_INDEXABLE` (and removing the `vercel.json` header).
- Do not touch the lead-generation forms, MailerLite integration (`api/_lib/subscribe.js`) or Resend notifications (`api/_lib/notify.js`) unless asked.
- Never push to `main` or deploy to Production without the user's explicit approval; feature branches get a Vercel Preview.
- **Pricing, policies and structured data:** prices, usage-rights terms, FAQ answers and JSON-LD all come from `src/seo/businessKnowledge.js` (see `docs/business-knowledge-and-structured-data.md`). Edit the data there, never retype a price in a component; keep currencies exactly as supplied and never invent facts (counts, ratings, locations, results).
- **Portfolio videos:** every video on `/our-work`, `/ugc-video-agency` and the homepage client panels lives in ONE file, `src/content/portfolio.js` (how-to in its header and `docs/our-work-page.md`). Add a video there once, classified by `industry`; never copy a video into a page component. Never set `portfolioUse` / `creatorConsent` to `true`, or invent an `uploadDate`, unless the user has confirmed it.
- **Spokesperson page:** `/spokesperson-video-production` reuses the UGC page's configuration-driven components with its own content (`src/content/spokespersonPage.js`, `docs/spokesperson-video-page.md`). Its videos are the `type: 'spokesperson'` entries in `src/content/portfolio.js`; never use UGC videos or the UGC page's Elyon proof there, and never invent a spokesperson price, result or testimonial.
