# Language suggestion for visitors in Spain and France

A small, dismissible card on **English** pages: "¿Prefieres navegar en español? / También puedes visitar nuestra web en español." with **Continuar en inglés** and **Ver en español**.
It is a progressive enhancement. It is not a redirect: nothing about routing, redirects, canonicals, hreflang, the sitemap, metadata or JSON-LD changes, and the prerendered HTML never contains it
(tests/language-suggestion.test.mjs checks every built page).

## Who sees it
All of: an English page that is a public, prerendered page (not the 404 page, the private creator pages or the legal pages) · Spanish is live · **no stored language choice** · the server says the request came from Spain.
Never on `/es/` pages. A visitor outside Spain, or whenever the lookup fails or times out (4 s), sees nothing.

## How Spain is detected
`GET /api/visitor-country` (`api/visitor-country.js`, `api/_lib/geo.js`) reads the `x-vercel-ip-country` request header that Vercel sets at its edge (the same value `@vercel/functions` `geolocation()` reads; a client cannot set it)
and answers only `{ "spain": true | false }` with `Cache-Control: private, no-store, max-age=0` and `Vary: x-vercel-ip-country`, so no cache can hand one visitor's answer to another.
No IP address is read, stored or logged; no browser location permission; no external geolocation service; no tracking event. The browser asks **once**, only when it has no stored choice, after the page has loaded
(idle time, at most six seconds in), so there is no request at all for returning visitors and nothing on the critical path (`src/main.jsx`, `src/lib/languageSuggestion.js`).
Local `npm run dev` has no such header, so the card never appears there; to see it, serve a build behind something that adds `x-vercel-ip-country: ES` (the Vercel Preview from Spain does).

## What is remembered
`src/lib/languagePreference.js`: key **`convrt_language`** in localStorage (kept across browser restarts, never sent to a server). Values: `en` or `es` (an explicit choice in the card **or in the header/footer language selector**) or
`dismissed` (× or Escape). Any value means "do not suggest again". If localStorage is blocked it falls back to sessionStorage; if both are blocked nothing is remembered and nothing breaks. It never changes which language a page shows (that
always comes from the URL). Listed in the Privacy Policy's "Browser storage we use" (English draft; the Spanish legal translation, when it exists, needs the same line: `docs/multilingual-legal-translation-review.md`).
No fingerprints, IP lists or hard-coded addresses: each browser simply stores its own choice, so choosing "Continuar en inglés" once per device keeps that device English.

## Behaviour
- **Ver en español**: an ordinary link to the equivalent Spanish page when it exists and is released, otherwise `/es/` (`switchTarget`); the click stores `es`.
- **Continuar en inglés**: stays on the page, stores `en`, closes. **×** or **Escape** (while focus is in the card): closes, stores `dismissed`.
- Non-modal `role="region"`, no focus trap or focus steal, `lang="es"`, 44 px targets, lime Spanish CTA; fixed at the bottom (right-hand card on desktop, full-width on phones), fade-in only (none for reduced motion), so no layout shift (measured CLS 0).
- With the cookie banner enabled the card **waits until it has been answered**, so two prompts never share a small screen.

## Files
`api/visitor-country.js`, `api/_lib/geo.js`, `src/lib/languagePreference.js`, `src/lib/languageSuggestion.js`, `src/components/LanguageSuggestion.jsx`, `src/components/mountLanguageSuggestion.jsx` (own React root, like the cookie banner),
wiring in `src/main.jsx` and `src/components/LanguageSelector.jsx`, dev route in `vite.config.js`, Privacy Policy line in `src/content/trustPages.js`.

## French-speaking countries (French), added Nov 2026; widened 2026-11-24
Same mechanism, second language. `GET /api/visitor-country` now answers `{ "spain": bool, "france": bool, "french": bool, "known": bool }` (`known` = the edge gave some country; still only booleans about the requester, `private, no-store`).
An English public page offers French to a visitor in France, Belgium, Switzerland, Luxembourg, Monaco, Canada, the French overseas territories and French-speaking Africa (the list is `FRENCH_SPEAKING` in `api/_lib/geo.js`; the Maghreb is left out on purpose because Arabic is the main language there): « Vous préférez naviguer en français ? Découvrez notre site en français. » with **Passer en français** (a plain link to the equivalent French page or `/fr/`) and **Rester en anglais**; × / Escape dismiss. Spain keeps the Spanish card.
Never a redirect, never in the prerendered HTML, never on `/fr/` or `/es/`, never again after any stored choice (`convrt_language` now also holds `fr`), waits for the cookie banner.
**Fallback when the country is unknown only** (`known: false`: no header, lookup failed or timed out, e.g. a local preview): the browser's preferred-language list decides, and only if its first non-English language is one we offer (`preferredSuggestible`, the single place that reads `navigator.languages`). When the edge DID place the visitor elsewhere the browser language is ignored.
To add a language: its country flag in `api/_lib/geo.js` + the endpoint, an entry in `SUGGESTIBLE` (`src/lib/languageSuggestion.js`) and its card text in `COPY` (`src/components/LanguageSuggestion.jsx`). Tests: `tests/language-suggestion.test.mjs`.
