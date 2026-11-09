// Run with: node --test tests/blog.test.mjs
// Covers the CONVRT Insights blog foundation: frontmatter + Markdown parsing, article
// validation, draft/published rules, index state (coming soon vs live, category filter),
// SEO/structured-data rules, and the indexing configuration. Pure functions — no browser.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from '../src/lib/blog/frontmatter.js'
import { parseMarkdown, parseInline, safeUrl } from '../src/lib/blog/markdown.js'
import {
  BLOG_CATEGORIES, validateFrontmatter, isPublished, selectPublished, pickFeatured, relatedFor, remainingPlanned,
} from '../src/lib/blog/schema.js'
import { analyzeArticle, analyzeCollection } from '../src/lib/blog/content.js'
import { buildIndexModel } from '../src/lib/blog/indexModel.js'
import { blogIndexJsonLd, articleJsonLd, articleHead, blogIndexHead, buildBlogSitemap, robotsFor } from '../src/lib/blog/seo.js'
import { PLANNED_TOPICS } from '../src/content/blogPlanned.js'
import { BLOG_INDEXABLE, SITE_URL } from '../src/config.js'
import { loadBlogContent, readBlogFiles, CONTENT_DIR } from '../vite-plugin-blog.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/* A valid published article, overridable per test. */
const meta = (over = {}) => ({
  slug: 'a', title: 'A', excerpt: 'E', category: 'creative-strategy', categoryLabel: 'Creative Strategy',
  status: 'published', featured: false, author: 'Me', publishedAt: '2026-01-10', related: [], faq: [], toc: 'auto', noindex: false,
  ...over,
})
const article = (fm = {}, body = 'Hello.') => {
  const base = { title: 'My Title', excerpt: 'Short.', category: 'Creative Strategy', status: 'published', author: 'Me', publishedAt: '2026-01-10', ...fm }
  const lines = Object.entries(base).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`)
  return `---\n${lines.join('\n')}\n---\n${body}\n`
}

// ── frontmatter ────────────────────────────────────────────────────────────────
test('frontmatter: scalars, quoted strings, booleans, inline arrays', () => {
  const { data, body } = parseFrontmatter('---\ntitle: "Why: it works"\nfeatured: true\nrelated: [one, "two-x"]\nauthor: It\'s me\n---\nBody\n')
  assert.deepEqual(data, { title: 'Why: it works', featured: true, related: ['one', 'two-x'], author: "It's me" })
  assert.equal(body, 'Body\n')
})

test('frontmatter: block lists, list of maps (FAQ) and folded text', () => {
  const src = '---\nrelated:\n  - a\n  - b\nfaq:\n  - q: First?\n    a: One.\n  - q: Second?\n    a: >-\n      Folded\n      answer.\n---\nx'
  const { data } = parseFrontmatter(src)
  assert.deepEqual(data.related, ['a', 'b'])
  assert.deepEqual(data.faq, [{ q: 'First?', a: 'One.' }, { q: 'Second?', a: 'Folded answer.' }])
})

test('frontmatter: malformed input fails loudly instead of guessing', () => {
  assert.throws(() => parseFrontmatter('no frontmatter'), /must start/)
  assert.throws(() => parseFrontmatter('---\ntitle: x\n'), /not closed/)
  assert.throws(() => parseFrontmatter('---\ntitle: "x\n---\n'), /unterminated/)
  assert.throws(() => parseFrontmatter('---\ntitle: a\ntitle: b\n---\n'), /duplicate/)
  assert.throws(() => parseFrontmatter('---\n  bad: indent\n---\n'), /indentation/)
})

// ── validation ─────────────────────────────────────────────────────────────────
test('validation: a complete published article is valid and normalized', () => {
  const { errors, meta: m } = analyzeArticle(article(), 'my-title')
  assert.deepEqual(errors, [])
  assert.equal(m.slug, 'my-title')
  assert.equal(m.category, 'creative-strategy')
  assert.equal(m.categoryLabel, 'Creative Strategy')
})

test('validation: required fields, slug/file match, category, image alt, dates, unknown keys', () => {
  const bad = (fm, file = 'my-title') => analyzeArticle(article(fm), file).errors.join(' | ')
  assert.match(bad({ title: undefined }), /"title" is required/)
  assert.match(bad({ author: undefined }), /"author" is required/)
  assert.match(bad({ publishedAt: undefined }), /"publishedAt" is required/)
  assert.match(bad({ slug: 'other' }), /must match the file name/)
  assert.match(bad({ category: 'Cooking' }), /"category" must be one of/)
  assert.match(bad({ image: '/blog/x.webp' }), /"imageAlt" is required/)
  assert.match(bad({ publishedAt: '2026-02-30' }), /real date/)
  assert.match(bad({ updatedAt: '2025-01-01' }), /earlier than/)
  assert.match(bad({ canonicalUrl: '/blog/x' }), /full https/)
  assert.match(bad({ titel: 'typo' }), /unknown field "titel"/)
  assert.match(bad({ status: 'live' }), /"status" must be/)
})

test('validation: drafts only need a title, excerpt and category', () => {
  const src = '---\ntitle: Draft\nexcerpt: Soon.\ncategory: ugc-video-ads\n---\n'
  const { errors, meta: m } = analyzeArticle(src, 'draft')
  assert.deepEqual(errors, [])
  assert.equal(m.status, 'draft')
})

test('validation: category accepts the label or the slug, case-insensitively', () => {
  for (const c of ['SaaS Video Marketing', 'saas-video-marketing', 'saas video marketing']) {
    assert.equal(validateFrontmatter({ title: 't', excerpt: 'e', category: c }, 't').meta.category, 'saas-video-marketing')
  }
})

test('collection: duplicate slugs, missing related targets and broken internal blog links are errors', () => {
  const files = [
    { filename: 'one', source: article({ related: '[ghost]' }, 'See [two](/blog/two) and [nope](/blog/nope).') },
    { filename: 'two', source: article() },
  ]
  const { problems } = analyzeCollection(files)
  assert.ok(problems.some((p) => /related article "ghost" does not exist/.test(p)))
  assert.ok(problems.some((p) => /\/blog\/nope points to an article that does not exist/.test(p)))
  assert.ok(!problems.some((p) => /\/blog\/two/.test(p)))
})

test('collection: missing local images are reported', () => {
  const files = [{ filename: 'one', source: article({ image: '/blog/one/cover.webp', imageAlt: 'x' }) }]
  assert.ok(analyzeCollection(files, { fileExists: () => false }).problems.some((p) => /\/blog\/one\/cover\.webp was not found/.test(p)))
  assert.deepEqual(analyzeCollection(files, { fileExists: () => true }).problems, [])
})

// ── draft / published rules ────────────────────────────────────────────────────
test('published = status published AND publishedAt not in the future; drafts never show', () => {
  const today = '2026-06-01'
  assert.equal(isPublished(meta({ publishedAt: '2026-06-01' }), today), true)
  assert.equal(isPublished(meta({ status: 'draft' }), today), false)
  assert.equal(isPublished(meta({ publishedAt: '2026-06-02' }), today), false)
  assert.equal(isPublished({ status: 'draft' }, today), false) // stripped production draft
  const list = selectPublished([
    meta({ slug: 'old', title: 'Old', publishedAt: '2026-01-01' }),
    meta({ slug: 'draft', title: 'Draft', status: 'draft' }),
    meta({ slug: 'new', title: 'New', publishedAt: '2026-05-01' }),
    meta({ slug: 'later', title: 'Later', publishedAt: '2027-01-01' }),
  ], today)
  assert.deepEqual(list.map((a) => a.slug), ['new', 'old'])
})

test('featured: the article marked featured wins, otherwise the newest', () => {
  const a = meta({ slug: 'a', publishedAt: '2026-03-01' })
  const b = meta({ slug: 'b', publishedAt: '2026-02-01', featured: true })
  assert.equal(pickFeatured([a, b]).slug, 'b')
  assert.equal(pickFeatured([a]).slug, 'a')
  assert.equal(pickFeatured([]), null)
})

test('related: explicit first, then same category, never itself', () => {
  const x = meta({ slug: 'x', related: ['z'], category: 'ugc-video-ads' })
  const all = [x, meta({ slug: 'y', category: 'ugc-video-ads' }), meta({ slug: 'z', category: 'creative-strategy' }), meta({ slug: 'w', category: 'creative-strategy' })]
  assert.deepEqual(relatedFor(x, all).map((a) => a.slug), ['z', 'y', 'w'])
})

// ── Markdown ───────────────────────────────────────────────────────────────────
test('markdown: headings get unique ids and feed the table of contents', () => {
  const { blocks, toc } = parseMarkdown('## Setup\n\ntext\n\n### Details & more\n\n## Setup\n')
  assert.deepEqual(toc.map((t) => [t.level, t.id]), [[2, 'setup'], [3, 'details-and-more'], [2, 'setup-2']])
  assert.equal(blocks[0].type, 'heading')
})

test('markdown: body H1 and deep headings are rejected', () => {
  assert.throws(() => parseMarkdown('# Title'), /page H1/)
  assert.throws(() => parseMarkdown('#### Deep'), /only ## and ###/)
})

test('markdown: callouts, tables, lists, quotes and code blocks', () => {
  const md = ':::callout Key point\nInside **bold**.\n:::\n\n| A | B |\n|---|:-:|\n| 1 | 2 |\n\n- one\n- two\n\n1. first\n2. second\n\n> quoted\n\n```js\nconst x = 1\n```\n'
  const types = parseMarkdown(md).blocks.map((b) => b.type)
  assert.deepEqual(types, ['callout', 'table', 'list', 'list', 'blockquote', 'code'])
  const c = parseMarkdown(md).blocks[0]
  assert.equal(c.title, 'Key point')
  assert.equal(c.children[0].inline[1].t, 'strong')
})

test('markdown: images need alt text; videos need titles; unclosed callouts fail', () => {
  assert.throws(() => parseMarkdown('![](/x.webp)'), /alt text/)
  assert.throws(() => parseMarkdown('::video{src="/x.mp4"}'), /title/)
  assert.throws(() => parseMarkdown(':::callout\nnever closed\n'), /not closed/)
  const img = parseMarkdown('![A chart](/blog/c.webp "Cap"){width=1200 height=600}').blocks[0]
  assert.deepEqual([img.type, img.alt, img.caption, img.width, img.height], ['image', 'A chart', 'Cap', 1200, 600])
  assert.equal(parseMarkdown('::youtube{id="dQw4w9WgXcQ" title="Demo"}').blocks[0].type, 'youtube')
})

test('markdown: no raw HTML and no unsafe URLs ever reach the renderer', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null)
  assert.equal(safeUrl('//evil.example'), null)
  assert.equal(safeUrl('/blog/x'), '/blog/x')
  assert.equal(safeUrl('https://a.b/c'), 'https://a.b/c')
  const [link] = parseInline('[click](javascript:alert(1))')
  assert.equal(link.href, null) // renderer prints the label as plain text
  const nodes = parseInline('<script>alert(1)</script>')
  assert.deepEqual(nodes, [{ t: 'text', v: '<script>alert(1)</script>' }]) // plain text, escaped by React
})

test('markdown: inline emphasis, code, links and snake_case words', () => {
  const n = parseInline('a **b** *c* `d` [e](/f "t") snake_case_word')
  assert.deepEqual(n.map((x) => x.t), ['text', 'strong', 'text', 'em', 'text', 'code', 'text', 'link', 'text'])
  assert.equal(n[n.length - 1].v, ' snake_case_word')
})

// ── index state ────────────────────────────────────────────────────────────────
test('planned topics: six, valid categories, no links, no invented metadata', () => {
  assert.equal(PLANNED_TOPICS.length, 6)
  const slugs = BLOG_CATEGORIES.map((c) => c.slug)
  for (const t of PLANNED_TOPICS) {
    assert.ok(slugs.includes(t.category), t.slug)
    for (const forbidden of ['href', 'url', 'date', 'publishedAt', 'author', 'readingTime']) assert.ok(!(forbidden in t), `${t.slug} has ${forbidden}`)
  }
  assert.equal(PLANNED_TOPICS.filter((t) => t.featured).length, 1)
})

test('index (coming soon): featured topic + 5 grid cards, featured not duplicated, nothing links', () => {
  const m = buildIndexModel([], PLANNED_TOPICS, 'all')
  assert.equal(m.live, false)
  assert.equal(m.featured.title, 'Why Your Facebook Ads Stop Performing (And How to Fix Creative Fatigue)')
  assert.equal(m.upcoming.length, 5)
  assert.ok(!m.upcoming.some((i) => i.key === m.featured.key))
  assert.equal(m.articles.length, 0)
  for (const i of [m.featured, ...m.upcoming]) { assert.equal(i.kind, 'planned'); assert.equal(i.href, undefined) }
})

test('index (coming soon): category filter shows matching planned topics, folding in the featured one', () => {
  const counts = {}
  for (const c of BLOG_CATEGORIES) {
    const m = buildIndexModel([], PLANNED_TOPICS, c.slug)
    assert.equal(m.featured, null)
    assert.ok(m.upcoming.every((i) => i.category === c.slug))
    counts[c.slug] = m.upcoming.length
    assert.ok(m.total > 0, `${c.label} must never be an empty grid`)
  }
  assert.deepEqual(counts, { 'ugc-video-ads': 2, 'saas-video-marketing': 1, 'ecommerce-creative': 1, 'creative-strategy': 2 })
})

test('index (live): published articles drive featured + grid; their planned topic retires automatically', () => {
  const pub = selectPublished([
    meta({ slug: 'how-much-does-a-ugc-video-cost', title: 'Real UGC cost', category: 'ugc-video-ads', publishedAt: '2026-04-01' }),
    meta({ slug: 'second', title: 'Second', featured: true, publishedAt: '2026-03-01' }),
  ], '2026-06-01')
  const m = buildIndexModel(pub, PLANNED_TOPICS, 'all')
  assert.equal(m.live, true)
  assert.equal(m.featured.kind, 'published')
  assert.equal(m.featured.slug, 'second')
  assert.equal(m.featured.href, '/blog/second')
  assert.deepEqual(m.articles.map((a) => a.slug), ['how-much-does-a-ugc-video-cost'])
  assert.equal(m.upcoming.length, 5) // the UGC-cost topic was published, so 5 of 6 remain
  assert.ok(!m.upcoming.some((i) => i.slug === 'how-much-does-a-ugc-video-cost'))
  assert.equal(remainingPlanned(PLANNED_TOPICS, pub).length, 5)
})

test('index (live): category filter works on real article metadata', () => {
  const pub = selectPublished([
    meta({ slug: 'u', category: 'ugc-video-ads' }),
    meta({ slug: 's', category: 'saas-video-marketing' }),
  ], '2026-06-01')
  const m = buildIndexModel(pub, PLANNED_TOPICS, 'saas-video-marketing')
  assert.deepEqual(m.articles.map((a) => a.slug), ['s'])
  assert.ok(m.upcoming.every((i) => i.category === 'saas-video-marketing'))
})

// ── SEO / indexing ─────────────────────────────────────────────────────────────
test('indexing: the blog index is noindex,follow while it only has coming-soon content', () => {
  assert.equal(BLOG_INDEXABLE, false)
  const head = blogIndexHead([])
  assert.equal(head.robots, 'noindex, follow')
  assert.equal(head.title, 'CONVRT Insights | Video Ads, UGC & Creative Strategy')
  assert.equal(head.url, 'https://www.convrt.studio/blog')
  assert.match(head.description, /^Explore CONVRT Insights for practical guides on UGC video ads/)
  assert.equal(robotsFor(true), 'index, follow')
})

test('indexing: vercel.json X-Robots-Tag for /blog agrees with BLOG_INDEXABLE', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))
  const rule = (vercel.headers ?? []).find((h) => h.source === '/blog')
  const tag = rule?.headers.find((h) => h.key === 'X-Robots-Tag')
  if (BLOG_INDEXABLE) assert.equal(tag, undefined, 'BLOG_INDEXABLE is true: remove the /blog X-Robots-Tag rule from vercel.json')
  else assert.match(tag?.value ?? '', /noindex/, 'BLOG_INDEXABLE is false: vercel.json must send X-Robots-Tag noindex for /blog')
})

test('indexing: no other route is noindexed by the blog rule', () => {
  const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))
  const sources = (vercel.headers ?? []).map((h) => h.source)
  assert.deepEqual(sources, ['/blog'])
})

test('structured data: index CollectionPage lists nothing while there are no published articles', () => {
  const ld = blogIndexJsonLd([])
  assert.equal(ld['@type'], 'CollectionPage')
  assert.equal(ld.mainEntity, undefined)
  assert.equal(JSON.stringify(ld).includes('BlogPosting'), false)
  const withOne = blogIndexJsonLd([meta({ slug: 'a', title: 'A' })])
  assert.equal(withOne.mainEntity.itemListElement[0].url, 'https://www.convrt.studio/blog/a')
})

test('structured data: BlogPosting + BreadcrumbList for real articles; FAQPage only with real FAQ', () => {
  const plain = articleJsonLd(meta({ slug: 'a', title: 'Hi', image: '/blog/a/c.webp' }))
  assert.deepEqual(plain.map((g) => g['@type']), ['BlogPosting', 'BreadcrumbList'])
  assert.equal(plain[0].image[0], `${SITE_URL}/blog/a/c.webp`)
  assert.equal(plain[0].datePublished, '2026-01-10')
  assert.equal(plain[0].dateModified, '2026-01-10')
  const faq = articleJsonLd(meta({ faq: [{ q: 'Why?', a: 'Because.' }], updatedAt: '2026-02-01' }))
  assert.deepEqual(faq.map((g) => g['@type']), ['BlogPosting', 'BreadcrumbList', 'FAQPage'])
  assert.equal(faq[0].dateModified, '2026-02-01')
  assert.equal(articleHead(meta()).robots, 'index, follow')
  assert.equal(articleHead(meta({ noindex: true })).robots, 'noindex, follow')
  assert.equal(articleHead(meta({ canonicalUrl: 'https://example.com/x' })).url, 'https://example.com/x')
})

test('sitemap: published articles only; the index only once it is indexable; drafts never', () => {
  const pub = selectPublished([meta({ slug: 'live' }), meta({ slug: 'hidden', status: 'draft' }), meta({ slug: 'private', noindex: true })], '2026-06-01')
  const xml = buildBlogSitemap(pub, { indexable: false })
  assert.match(xml, /\/blog\/live</)
  assert.ok(!xml.includes('hidden'))
  assert.ok(!xml.includes('private'))
  assert.ok(!xml.includes('convrt.studio/blog<'))
  assert.match(buildBlogSitemap(pub, { indexable: true }), /convrt\.studio\/blog</)
  assert.ok(!buildBlogSitemap([], { indexable: false }).includes('<url>'))
})

// ── the real content folder ────────────────────────────────────────────────────
test('content folder: every article file is valid; the template is ignored; no placeholder is an article', () => {
  const { problems, analyzed } = loadBlogContent()
  assert.deepEqual(problems, [])
  assert.ok(fs.existsSync(path.join(CONTENT_DIR, '_template.md')))
  assert.ok(!readBlogFiles().some((f) => f.filename.startsWith('_')))
  // Placeholders must not exist as article files, or they would be indexable "published" content.
  const plannedSlugs = new Set(PLANNED_TOPICS.map((t) => t.slug))
  for (const a of analyzed) {
    if (plannedSlugs.has(a.filename)) assert.equal(a.meta.status, 'draft', `${a.filename} is a planned topic: keep it draft until it is really written`)
  }
})

test('content folder: the template itself parses (so it stays a working example)', () => {
  const tpl = fs.readFileSync(path.join(CONTENT_DIR, '_template.md'), 'utf8')
  const { errors } = analyzeArticle(tpl, 'your-slug')
  assert.deepEqual(errors, [])
})
