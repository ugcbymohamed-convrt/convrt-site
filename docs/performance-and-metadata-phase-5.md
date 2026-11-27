# Phase 5: loading and metadata notes (Nov 2026)

Architecture changes that future work must keep:

- **Per-language dictionaries.** The browser bundle loads only its own language's dictionary (`dict-es`, `dict-fr`, `dict-ar` chunks); English loads none. `vite.config.js` (`lazyDictionaries()`) swaps `src/i18n/dictionaries.js` for `dictionaries.lazy.js` in the client build only; the static-route SSR build and the tests use the real file with all dictionaries. `src/main.jsx` awaits `ensureDictionary(locale)` before React attaches, and `vite-plugin-static-routes.js` adds `<link rel="modulepreload">` for that chunk to translated pages. Any new module that reads a translated dictionary must go through `translate()` / `tr()`, never import `es|fr|ar/index.js` directly.
- **`Reveal` never hides content before JavaScript runs.** The server HTML and the first client render are visible and enter with the CSS keyframe `reveal-enter` (`src/index.css`); only after hydration are blocks that are below the fold hidden and revealed on scroll. Do not reintroduce `opacity-0` initial state for above-the-fold text.
- **Headings built from line spans** put a plain space after each `display:block` span so the text reads correctly in raw HTML and text extractors.
- **Metadata** stays centralized: English in `src/seo/siteSeo.js` (the homepage also in `index.html`, pinned by tests), translations in `src/i18n/{es,fr,ar}/seo.js`.
- **Legacy URL:** `/case-studies?case=elyon` (and `/es|/fr|/ar`) redirects permanently to `/case-studies/elyon` in `vercel.json`; the in-app study switcher uses `history.replaceState` and is unaffected.
- **Related links on translated service pages:** `src/components/ugc/RelatedLinks.jsx` (Spanish, French and Arabic SaaS, Spokesperson and Organic pages only: those languages have no gallery on those pages, so they had no Creator Showcase link).
