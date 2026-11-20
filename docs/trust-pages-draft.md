# Trust and legal pages: what is drafted and what you must supply

The pages `/about`, `/contact`, `/privacy`, `/terms` exist but are **drafts**: `noindex`, not in the sitemap, not linked from the footer or forms, with a visible "Draft for owner review" banner. Text lives in `src/content/trustPages.js` and was written only from facts already on the site or in this repository. Privacy and Terms are drafts that need review by a legal adviser; nothing here is legal advice.

## To publish
1. Resolve every highlighted `[OWNER TO CONFIRM: ...]` marker in `src/content/trustPages.js` (`tests/trust-pages.test.mjs` refuses publication while any remains).
2. Change `TRUST_PAGES_PUBLISHED` to `true` in `src/config.js`. That one flag: removes the banner, makes About and Contact indexable and puts them in the sitemap (Privacy and Terms stay `noindex, follow`), adds About / Privacy / Terms links to the footer, links every form's data-use notice to `/privacy` (through the existing `PRIVACY_POLICY_URL`), links the cookie banner to the policy, and adds the founder Person and contact details to the Organization structured data.
3. Update the tests that assert the draft state (`tests/trust-pages.test.mjs` first test group) in the same change.

## Items only you can supply or confirm
| Item | Where it appears | Notes |
|---|---|---|
| Founder name and title shown publicly | About, Organization schema | Draft uses the legal name already recorded for creator agreements (Mohamed Doukkali Azizi) and "Founder". Confirm, and add a short bio if wanted. No experience, credentials or numbers were invented. |
| Legal-notice details | Privacy "Who we are" | Postal address and tax ID are on file for creator agreements but **were not published**. Ask your adviser whether a Spanish website operator must show them. |
| Legal bases, retention periods, transfers, processor agreements | Privacy | Marked as owner/adviser items. |
| Supervisory authority to name | Privacy "Your rights" | |
| Liability limitation and governing law | Terms | Must be drafted by your adviser. |
| Whether privacy/terms may stay `noindex` | SEO | Default `noindex, follow` (reference pages). |
| Company LinkedIn page, if one exists | Organization `sameAs` | Only the personal profile (founder) and Instagram are known. |
| Any other tools that touch visitor data | Privacy | Draft lists MailerLite, Resend, Calendly, Vercel, Cloudflare and (after consent) Google. |
