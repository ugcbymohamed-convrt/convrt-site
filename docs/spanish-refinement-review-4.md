# Spanish refinement, Review 4 (Nov 2026)

Branch `feat/es-visual-parity-review-1`, Preview only. English output is unchanged (`node scripts/i18n-english-parity.mjs <main dist> dist`: every English page IDENTICAL). The Spanish homepage body is untouched; only the shared menu and footer changed.

## Shared menu (all four languages)
One model: `src/i18n/menu.js` (labels, which entries a language lists), used by `Nav.jsx`, the mobile menu and `Footer.jsx`. Same entries, same order, same component and classes: Services (dropdown), Creator Showcase, Case Studies, Pricing, Blog, Contact, Refer & Earn, language selector, primary CTA.
* A LIVE language lists an entry only when the page is translated there. Spanish: Servicios, Creadores, Casos de éxito, Tarifas, Contacto, Recomienda y gana (no Blog: no Spanish blog; "Cómo funciona" is gone, as in English).
* A language IN REVIEW (French, Arabic on this branch) lists the same entries as English; a page not translated there opens the English page. Blog is never listed outside English.
* Labels: `Recomienda y gana`, `Parrainez et gagnez`, `رشّحنا واكسب` (English: `Refer & Earn`). Arabic is RTL through the existing locale `dir`.

## Pages
Copy lives where it always did: `src/i18n/es/dict-*.js` (keyed by the English sentence), `src/i18n/es/hero.js` (H1 lines), `src/i18n/es/labels.js` (FAQ titles, section intros, final-CTA text, stage titles). Layouts, animations and diagrams are the English components.
* Spokesperson, Organic Social and SaaS: no example-video gallery in Spanish (`currentLocale() !== 'es'` around `UgcGallery`); the Spokesperson hero stage stays; the secondary CTAs go to the process section / formats.
* UGC: raw English client note removed from the Spanish page (kept on English), Spanish reviews (the homepage ones), results qualification line, no per-card "UGC" pill, short creator-examples note.
* Creator Showcase: no language badge on Spanish cards, "Ver N vídeos más", two format cards, no long disclaimers.
* Pricing, Roadmap, Free video, Graspo, Elyon: copy per the brief; same components (the Graspo paper animation is `GraspoHeroScene`, identical markup count in both languages).

## Verification notes
* Prices: the EUR amounts are the owner-approved table (2026-11-21, `src/i18n/es/pricing.js`); quantities, turnaround (10/15 business days), revisions (2 per concept), rights (6 months), commitments (3 / 6 months, one-off none) are the English business data. No price was changed.
* The Roadmap and free-video qualification bands stay in USD (thresholds of the existing lead scoring); converting them is a separate business decision.
