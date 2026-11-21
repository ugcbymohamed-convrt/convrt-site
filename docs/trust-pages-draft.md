# Trust and legal pages: status, what changed, and how to publish safely

`/about`, `/contact`, `/privacy` and `/terms` are **unpublished drafts**: `TRUST_PAGES_PUBLISHED = false`, `noindex` (meta tag **and** `X-Robots-Tag` header), not in the sitemap, not linked from the footer or the forms, with a visible draft banner. Text is in `src/content/trustPages.js`; the operator's identity is in `src/content/operator.js`. Nothing is legal advice; Privacy and Terms need a Spanish legal adviser before publication.

## Owner decisions applied (21 Nov 2026)
Trading name CONVRT Studio; legal operator Mohamed Doukkali Azizi, self-employed (autónomo) registered in Spain; exclusively B2B; title "Founder"; positioning "founder-led creative studio"; no biography or credentials; contact email, Calendly link and genuine social profiles only; no public phone or office hours; official company LinkedIn `https://www.linkedin.com/company/123164137/` in the footer (one LinkedIn icon, the company's), the About and Contact pages and the Organization `sameAs`; the founder's personal profile kept separately (About, Contact, founder Person data); Terms of Service for a B2B audience; the four pages become public and indexable **after** legal approval.

## Two kinds of open marker (both block publication)
* `[OWNER TO CONFIRM: ...]` a fact only you can supply or check (NIF/address display, GA4 terms accepted, provider agreements and locations, free-video conditions, cookie lifetimes, how paid projects are documented).
* `[LEGAL REVIEW: ...]` wording a legal adviser must approve (legal bases, Calendly's role, retention periods, free-concept ownership, liability cap, governing law).

`node scripts/activate-trust-pages.mjs` (dry run) prints every open marker and every other blocker. `tests/trust-pages.test.mjs` refuses `TRUST_PAGES_PUBLISHED = true` while any marker remains or while the legally required tax ID and postal address are hidden (`LEGAL_NOTICE_DETAILS_APPROVED`). A simulation test proves that with both flags on, all four pages are indexable with self-canonicals and sitemap entries, every form links the policy, and the founder Person appears.

## To publish (after approval)
1. Resolve every marker: edit `src/content/trustPages.js` with the confirmed wording (send me the answers and I do it).
2. Approve showing the NIF and postal address (required by Ley 34/2002 art. 10, `docs/spanish-legal-information-requirements.md`).
3. Run `node scripts/activate-trust-pages.mjs --apply --owner-approved-details`. It refuses while a blocker remains; otherwise it sets `LEGAL_NOTICE_DETAILS_APPROVED` and `TRUST_PAGES_PUBLISHED` to `true` and removes the four `X-Robots-Tag` rules from `vercel.json`. It never commits or deploys.
4. Update the draft-state assertions in `tests/trust-pages.test.mjs` and `tests/trust-privacy-implementation.test.mjs` (they assert `false` today, deliberately), run all tests and the build, review the Preview.
5. Then, and only then, merge. After publication: submit `/about`, `/contact`, `/privacy` and `/terms` in Search Console; check the footer links and each form's privacy link.

What one flag does on publication: removes the banner; makes all four pages indexable and puts them in the sitemap; adds About, Privacy and Terms to the footer and points the footer "Contact" at `/contact`; links every form's data-use notice to `/privacy`; links the cookie banner to the policy; adds the founder Person and contact details to the Organization data.

## Open items for you (short)
Eighteen markers are listed by the script; the ones that need your own dashboards are collected in `docs/privacy-provider-checklist.md`, the retention periods in `docs/data-retention-and-deletion.md`, the marketing consent steps in `docs/marketing-consent-mailerlite.md`, and the unwritten client agreement in `docs/client-service-agreement-outline.md`.
