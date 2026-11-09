# CONVRT Blog — publishing guide

The blog lives at `/blog` (index) and `/blog/<slug>` (articles). **One Markdown file = one article.**
Nothing in the page code lists articles: add a file and it appears; delete it and it is gone.

> Asking Claude Code: *"Create a new article using this title and content: …"* is all you need to say.
> Claude should follow the checklist below, then run the tests and build.

## Add an article

1. Create `src/content/blog/<slug>.md`. **The file name is the URL slug** (`how-much-does-a-ugc-video-cost.md` → `/blog/how-much-does-a-ugc-video-cost`). Lowercase letters, numbers, hyphens.
2. Start from `src/content/blog/_template.md` (files beginning with `_` are ignored by the site).
3. Put images in `public/blog/<slug>/` (WebP, ideally ≤ 150 KB for the cover) and reference them as `/blog/<slug>/cover.webp`.
4. Set `status: draft` while writing. Preview it with `npm run dev` at `/blog/<slug>` — drafts are visible **only** locally, never in the index, never in production (their text is stripped from the build).
5. When ready, set `status: published` and a real `publishedAt` (`YYYY-MM-DD`). A future date stays hidden until that day.
6. Run `node --test tests/*.test.mjs` and `npm run build`. The build **fails with a plain-English message** if an article is invalid (bad category, missing alt text, broken internal link, missing image file…), so mistakes can't reach production.

## Frontmatter reference

| Field | Required | Notes |
|---|---|---|
| `title` | yes | The page H1. ≤ 120 chars. |
| `excerpt` | yes | Card text and intro under the H1. ≤ 300 chars. |
| `category` | yes | `UGC & Video Ads` · `SaaS Video Marketing` · `E-commerce Creative` · `Creative Strategy` (label or slug). |
| `status` | yes | `draft` or `published`. |
| `author` | to publish | Real name only. |
| `publishedAt` | to publish | `YYYY-MM-DD`. |
| `updatedAt` | no | `YYYY-MM-DD`; shown as "Updated" and used as `dateModified`. |
| `featured` | no | `true` puts it in the big featured slot on `/blog` (newest wins if several; if none, the newest article is featured). |
| `image`, `imageAlt` | no (alt required with image) | Cover image, 1200×630 recommended. Without one, the card uses an abstract graphic. |
| `seoTitle` | no | ≤ 70 chars. Default: `<title> \| CONVRT Blog`. |
| `metaDescription` | no | ≤ 170 chars. Default: the excerpt. |
| `canonicalUrl` | no | Full `https://` URL. Default: `https://www.convrt.studio/blog/<slug>`. |
| `ogImage` | no | Social share image. Default: `image`. |
| `related` | no | `[slug-a, slug-b]`. Otherwise same-category articles are suggested automatically. |
| `faq` | no | List of `q` / `a` pairs. Shown as an accordion **and** emitted as `FAQPage` data — only add real Q&As. |
| `toc` | no | Table of contents appears automatically with 3+ H2s; `true` / `false` overrides. |
| `noindex` | no | `true` keeps this one article out of search and the sitemap. |

Quote any value containing `#` or starting with a quote or bracket. Typos in field names are errors.

```yaml
faq:
  - q: How long does a UGC video take?
    a: A genuine, helpful answer.
```

## Body syntax

Normal Markdown, no raw HTML. Start sections at `##` (the title is the H1), use `###` below that.

- `**bold**`, `*italic*`, `` `code` ``, `[link text](/free-hooks)`, lists, `> quotes`, ``` fenced code ```, pipe tables.
- Internal links to other articles (`/blog/other-slug`) are checked at build time.
- Image: `![Alt text is required](/blog/slug/pic.webp "Optional caption"){width=1200 height=675}`
- Callout:
  ```
  :::callout Key takeaway
  Text with **formatting**.
  :::
  ```
- Self-hosted video: `::video{src="/blog/slug/demo.mp4" poster="/blog/slug/poster.webp" title="What it shows" caption="Optional"}`
- YouTube (privacy mode, lazy): `::youtube{id="VIDEO_ID" title="What it shows"}`

Every article page automatically gets: breadcrumb, author/date, cover image, table of contents, FAQ, a contextual
CTA to the Free Creative Growth Roadmap, and related articles.

## "Coming soon" topics

`src/content/blogPlanned.js` lists the six planned topics shown as non-clickable previews. When you publish an
article whose **slug equals a planned topic's `slug`**, that preview disappears by itself (delete the entry later
to tidy up). Until then they never link, never appear in the sitemap and never produce structured data.

## Indexing and SEO

- **`/blog` is `noindex, follow` today.** It is controlled in two places that must agree:
  `BLOG_INDEXABLE` in `src/config.js` (meta robots tag) and the `/blog` `X-Robots-Tag` rule in `vercel.json`
  (header, so crawlers that don't run JavaScript see it too).
  To launch the index: set `BLOG_INDEXABLE = true` **and** delete the `headers` block from `vercel.json`.
  `node --test tests/blog.test.mjs` fails if the two disagree.
- Published article pages are indexable by default, independent of the index flag.
- Structured data: the index gets `CollectionPage`. Articles get `BlogPosting` + `BreadcrumbList`, plus `FAQPage`
  only when `faq` is filled in. Placeholders never get any.
- Each build writes `sitemap-blog.xml` listing **published articles only** (and `/blog` once it is indexable).
  The site has no main sitemap or `robots.txt` yet; when one is added, reference `sitemap-blog.xml` from it.
- Not-found slugs render a `noindex` "Article not found" state (the host serves the app shell for every URL,
  so the HTTP status is 200).

## Files

- `src/content/blog/*.md` — articles · `src/content/blogPlanned.js` — coming-soon topics
- `src/BlogPage.jsx`, `src/BlogArticlePage.jsx`, `src/components/blog/*` — index and article template
- `src/lib/blog/*` — parsing, validation, publish rules, SEO helpers (unit-tested in `tests/blog.test.mjs`)
- `vite-plugin-blog.js` — turns Markdown into modules, validates at build, strips drafts, writes the sitemap
