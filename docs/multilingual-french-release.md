# French localization: release record (branch `french-localization`)

Status: **built on a Preview branch, NOT merged, NOT deployed.** `fr` is `'live'` in `src/i18n/locales.js` on this branch, so **merging publishes it** (indexable, in the sitemap, reciprocal hreflang, in the language selector). Flip it to `'review'` to withhold the whole language without deleting anything. `node scripts/fr-launch-readiness.mjs` lists what still blocks a release.

Baseline: Production `main` (afc0da4). The unmerged `english-design-review-1` (cinematic founder stage, 8-creator carousel, new reviews) and `feat/es-visual-parity-review-1` (Spanish visual/pricing review) were **not** imported: French inherits the design Production serves today. When those branches are approved, expect merge conflicts in the files both touch (`Hero.jsx`, `Testimonials.jsx`, `CaseStudies.jsx`, `PricingCards.jsx`, `homeHero.js`, `portfolio.js`, `dict-*`) and port the French strings of anything that changes.

## Pages (all under `src/i18n/registry.js`)
| URL | Purpose | Source | Search intent | CTA |
|---|---|---|---|---|
| `/fr/` | Broad commercial video production | English home | agence vidéo publicitaire, production vidéo publicitaire, création de contenus (P1/P2) | `/fr/creative-growth-roadmap` |
| `/fr/ugc-video-agency` | The one French service page | English UGC page + a French-only "L'essentiel" block | agence UGC (P1: 500 rounded searches, High ads competition) | Roadmap, pricing |
| `/fr/pricing` | EUR packages, rights, FAQ | English pricing | tarifs UGC / prix vidéo UGC (no measured volume) | Roadmap |
| `/fr/creator-showcase` | 5 French-spoken creator videos | English showcase | exemples de vidéos UGC francophones | Roadmap |
| `/fr/creative-growth-roadmap` | Free 5-concept application (noindex like English) | English Roadmap | n/a | Calendly gate |
| `/fr/risk-free-trial` | 1 free video application (noindex, HELD until owner/legal review) | English page | n/a | application |

Not translated on purpose (French links say « en anglais »): Spokesperson, SaaS, Organic Social, About, Contact, Privacy/Terms/Legal Notice, case studies, blog, referrals, 10 free hooks. Nav hides them; footer, service cards and FAQ links show them with the note.

## Copy
Native French (`docs/multilingual-french-copy-guide.md`), written from the English meaning and the owner's brief, not from Spanish. Homepage H1: « Des vidéos publicitaires pensées pour [convertir | convaincre | marquer | vendre] ». UGC H1: « Agence UGC : des vidéos authentiques pour vos [publicités | campagnes | lancements] ». The homepage does not target « agence UGC » (no cannibalization). Hero CTA: « Recevoir 5 concepts sur mesure » (shortened from « …5 concepts publicitaires sur mesure » so the one-line button fits; the line above it says « Vos 5 prochains concepts publicitaires. Sur mesure pour votre marque. Offerts. »).
Copy written by delegated writers under the guide, then reviewed; **a native French reviewer should read it before Production.** Ambiguous choices the writers flagged: « formule(s) » for "package(s)", « talents en interne » (BRAND in-house talent), « des centaines de créations » (hundreds-of-creatives scope is still an open owner question), « Revenus déclarés », « Le même principe, en plus grand ».

## Pricing
`src/i18n/fr/pricing.js` imports the 13 owner-approved Spanish EUR amounts (a test pins them); no exchange rate, no USD reuse. Wording is « hors TVA / HT »; no French VAT rate, number or registration is stated. Commitments exactly as English: Sprint / Sprint Plus monthly 3 months then month-to-month with 30 days' notice; Organic monthly 6 months initial; one-off has no recurring commitment; usage rights 6 months from delivery. Still USD by decision (client-supplied, not CONVRT prices): the Roadmap ad-spend brackets and Elyon's reported USD revenue.

## Creator videos
Five French-spoken videos from `CREATORS/French` (two creators) uploaded to Cloudflare Stream on 2026-11-23: `fr-ugc-hero-1..3` (hero stages, home and UGC page) and `fr-ugc-1..2` (gallery); all five on the showcase. Evidence of language: French burned-in captions; **no audio transcript was run.** Not used: the first creator's phone-case ad (captions in English) and the creators' profile photos. Names, brands and credits are not shown; the footage itself shows brands the creators filmed for. Approval flags are set to display from the supplied folder and `approvedBy` says so: **confirm the two signed Creator Portfolio Agreements (admin page) and that the 4K file in the second creator's folder (`fr-ugc-2`; not a standard onboarding file name, see the private map) is the approved third video before Production.** Type `ugc` and industry `unclassified` are the folder's defaults, not owner-confirmed classifications. The showcase and UGC pages state the videos are independent creators' examples, not necessarily CONVRT productions. Private map: `CONVRT/Claude/multilingual-fr/`.

## Client reviews
Shown as a labelled « Traduction française » with the verbatim English original underneath (`lang="en"`), per the French brief; no stars, ratings or reviews were added to structured data. Client chat messages in the Elyon proof stay verbatim English.

## SEO
Self-canonical, `html lang="fr-FR"`, hreflang `fr-FR` (the site convention elsewhere is language-only; `fr-FR` follows the owner's locale decision and can be widened to `fr`), reciprocal sets on EN/ES/FR for the four indexable pages, `x-default` = English, none for the Roadmap/free-video or for pages without a French twin; sitemap lists `/fr/`, `/fr/ugc-video-agency`, `/fr/pricing`, `/fr/creator-showcase`; JSON-LD reuses the one Organization `@id` (country-only address, no French office), French WebPage/FAQPage/Service/Offers (EUR, VAT excluded), no reviews/ratings/VideoObject; French OG image `public/og/convrt-og-fr.png`. All main content is in the prerendered HTML.

## Conversion
French Roadmap (client-side qualification, Calendly gate) and free-video application use the existing backends; option values stay English internally. The 10 free hooks and referral flows are not promoted in French (their flows are English-only); the not-ready Roadmap outcome points to the contact page. The French free-video form omits the marketing checkbox (like Spanish) and stays noindex and held until reviewed.

## Open items before Production
1. Native French copy review; lawyer/legal review of French consent wording and a French legal set (legal pages are English, linked « en anglais »).
2. Creator agreements and language confirmation (above).
3. Decide `fr-FR` vs `fr` for hreflang; decide whether the French Contact/About pages are needed.
4. Spanish handoff: none of the French work changes a Spanish string; Spanish pages gain only the French language option.
