# Technical SEO health check (27 Nov 2026)

`node scripts/seo-health-check.mjs` checks the built site (`npm run build` first); `--live https://www.convrt.studio` adds the live checks. It never changes a file; exit code 1 on any ERROR. The static half also runs in the suite (`tests/technical-seo.test.mjs`).

Checks: head tags, self-referencing canonicals (and canonical chains), reciprocal hreflang (self reference, x-default, html lang, target indexable), sitemap <-> built pages (noindex pages never listed, listed URLs self-canonical), robots.txt (no Disallow other than /api/, no per-bot blocks, sitemaps exist), JSON-LD (valid JSON, @context, @id references defined somewhere, BreadcrumbList, FAQPage text on the page, VideoObject, Offer), broken internal links and missing local assets, redirect targets, crawlable text without JavaScript, one h1, duplicate titles/descriptions/bodies. Live: status and redirect chain of every sitemap URL, X-Robots-Tag vs meta, host/protocol redirects, trailing slash, legacy URLs, 404 behaviour, robots.txt/sitemaps as served, search-engine and AI-crawler user agents.

## Result on the 27 Nov 2026 build (85 pages, 51 indexable, 47 sitemap URLs)

Fixed: referral pages (es/fr/ar) had a BreadcrumbList item without a name (noindex pages, invalid markup); the `/scale` showcase pointed at `/videos/*.mp4`, a git-ignored folder that was never deployed (four empty tiles since August), now Stream MP4s (`streamMp4()`).
Left as is (by design, reported): trailing-slash URLs (`/about/`) answer 200 with a canonical to the clean URL; `http://convrt.studio` takes two hops (the platform's https upgrade, then our apex -> www redirect); `/case-studies` (+ es/fr/ar) are declared duplicates of `/case-studies/graspo` (canonical, no sitemap); no `/llms.txt` (optional convention, not required by any crawler).
