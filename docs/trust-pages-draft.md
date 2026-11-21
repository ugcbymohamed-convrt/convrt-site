# Trust and legal pages: published state

`/about`, `/contact`, `/privacy`, `/terms` and `/legal-notice` are **published** on this branch (owner approval, 21 Nov 2026): `TRUST_PAGES_PUBLISHED = true` and `LEGAL_NOTICE_DETAILS_APPROVED = true` in `src/config.js`; indexable with self-referencing canonicals; in the sitemap; linked from the footer; every form and the cookie preferences link `/privacy`; the four draft `X-Robots-Tag` rules are gone from `vercel.json`. The text is in `src/content/trustPages.js`; the operator identity in `src/content/operator.js`. The owner chose to publish **without an external legal review**; the pages contain no legal-review claim, and the unresolved risks are listed in the release handoff.

* The Privacy Policy describes the real state of the build it ships in: with no `VITE_GTM_ID` (Production today) it says Google Analytics is **not active** and no cookie banner exists; once the variable is set it describes the banner, consent and "Cookie settings" instead. Both versions are tested (`tests/trust-privacy-implementation.test.mjs`).
* `scripts/activate-trust-pages.mjs` was used for the switch (flags + removal of the robots rules). Its dry run now reports only "already true".
* To retract a page quickly: set `TRUST_PAGES_PUBLISHED = false` (the pages return to noindex and the footer links disappear) and restore the `X-Robots-Tag` rules.

Related documents: `docs/spanish-legal-information-requirements.md`, `docs/privacy-provider-checklist.md`, `docs/marketing-consent-mailerlite.md`, `docs/data-retention-and-deletion.md`, `docs/client-service-agreement-outline.md`, `docs/booking-embed-and-cookies.md`.
