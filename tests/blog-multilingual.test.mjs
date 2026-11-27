/* The multilingual blog infrastructure (Phase 5 revision): locale-specific routes and slugs, localized metadata, canonicals, genuine translation relationships, reciprocal hreflang
   between PUBLISHED translations only, BlogPosting data, draft/published states, sitemap, and no placeholder or empty indexable page.
   Every article below is a FIXTURE used only inside this test (in memory or in a temporary copy of the project): no article is ever added to src/content/blog. */
import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { analyzeCollection } from '../src/lib/blog/content.js'
import { translationsOf, selectPublished, publishedIn, articlePath, relatedFor } from '../src/lib/blog/schema.js'
import { articleHead, articleJsonLd, articleAlternates, buildBlogSitemap, localizedBlogIndexHead } from '../src/lib/blog/seo.js'
import { allRoutePaths } from '../src/lib/routes/staticRoutes.js'
import { headParamsFor } from '../src/lib/routes/headFor.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const md = ({ title, status = 'published', date = '2026-01-10', group, noindex, extra = '' }) =>
  `---\ntitle: ${title}\nexcerpt: Fixture excerpt for ${title}.\ncategory: Creative Strategy\nstatus: ${status}\n${status === 'published' ? `author: Test Author\npublishedAt: ${date}\n` : ''}${group ? `translationGroup: ${group}\n` : ''}${noindex ? 'noindex: true\n' : ''}${extra}---\n## A heading\n\nFixture body.\n`

const FILES = [
  { filename: 'fixture-guide', locale: 'en', source: md({ title: 'Fixture guide', group: 'fixture-guide' }) },
  { filename: 'guia-de-prueba', locale: 'es', source: md({ title: 'Guía de prueba', date: '2026-01-12', group: 'fixture-guide' }) },
  { filename: 'guide-brouillon', locale: 'fr', source: md({ title: 'Guide brouillon', status: 'draft', group: 'fixture-guide' }) },
  { filename: 'guia-de-prueba', locale: 'ar', source: md({ title: 'دليل تجريبي', date: '2026-01-13' }) }, // same slug as the Spanish one: allowed, a slug is unique per language
]
const analyzed = () => analyzeCollection(FILES)
const metas = () => analyzed().analyzed.map((a) => a.meta)
const TODAY = '2026-06-01'

test('validation: four languages, a slug is unique per language, locale and translationGroup are on the metadata', () => {
  const { problems, analyzed: a } = analyzed()
  assert.deepEqual(problems, [])
  assert.deepEqual(a.map((x) => x.meta.locale), ['en', 'es', 'fr', 'ar'])
  assert.equal(a[1].meta.translationGroup, 'fixture-guide')
  assert.equal(a[1].meta.categoryLabel, 'Estrategia creativa', 'the category label is shown in the article language')
  assert.equal(a[0].meta.categoryLabel, 'Creative Strategy')
  const dup = analyzeCollection([FILES[1], { ...FILES[1], source: FILES[1].source }])
  assert.ok(dup.problems.some((p) => /duplicate slug "es\/guia-de-prueba"/.test(p)))
})

test('validation: two articles of the same language cannot share a translation group; a link must point at an article of its own language', () => {
  const two = analyzeCollection([FILES[1], { filename: 'otra-guia', locale: 'es', source: md({ title: 'Otra guía', group: 'fixture-guide' }) }])
  assert.ok(two.problems.some((p) => /translationGroup "fixture-guide" has more than one es article/.test(p)))
  const bad = analyzeCollection([{ ...FILES[1], source: FILES[1].source + '\nVer [otra](/es/blog/no-existe).\n' }])
  assert.ok(bad.problems.some((p) => /\/es\/blog\/no-existe points to an article that does not exist/.test(p)))
  const ok = analyzeCollection([FILES[1], { filename: 'otra-guia', locale: 'es', source: md({ title: 'Otra guía' }) + '\nVer [la guía](/es/blog/guia-de-prueba).\n' }])
  assert.deepEqual(ok.problems, [])
  const wrong = analyzeCollection([FILES[0], { filename: 'otra-guia', locale: 'es', source: md({ title: 'Otra guía' }) + '\nVer [la guía](/es/blog/fixture-guide).\n' }])
  assert.ok(wrong.problems.length, 'an English slug is not an es article')
  assert.ok(analyzeCollection([{ ...FILES[0], source: md({ title: 'X', extra: 'translationGroup: Bad Key\n' }) }]).problems.length)
})

test('genuine translations: only published, indexable members of a group; a draft, a future date, a noindex article or a lone article creates no relationship', () => {
  const all = metas()
  const [en, es, fr, ar] = all
  assert.deepEqual(translationsOf(es, all, TODAY).map((m) => m.locale), ['en', 'es'], 'the fr draft is not a translation yet')
  assert.deepEqual(translationsOf(en, all, TODAY).map((m) => m.locale), ['en', 'es'])
  assert.deepEqual(translationsOf(ar, all, TODAY), [], 'no group → no relationship (the Arabic article is not a translation of anything)')
  assert.deepEqual(translationsOf(en, all, '2026-01-11'), [], 'before the Spanish publication date the English article has no published translation')
  const lone = analyzeCollection([FILES[0]]).analyzed.map((a) => a.meta)
  assert.deepEqual(translationsOf(lone[0], lone, TODAY), [])
  const noidx = analyzeCollection([FILES[0], { ...FILES[1], source: md({ title: 'Guía', date: '2026-01-12', group: 'fixture-guide', noindex: true }) }]).analyzed.map((a) => a.meta)
  assert.deepEqual(translationsOf(noidx[0], noidx, TODAY), [])
  const withFr = analyzeCollection([...FILES.slice(0, 2), { ...FILES[2], source: md({ title: 'Guide', date: '2026-01-14', group: 'fixture-guide' }) }]).analyzed.map((a) => a.meta)
  assert.deepEqual(translationsOf(withFr[2], withFr, TODAY).map((m) => m.locale), ['en', 'es', 'fr'])
})

test('hreflang is reciprocal: every member of a published group carries the same set, with x-default on the English version', () => {
  const group = analyzeCollection([FILES[0], FILES[1], { ...FILES[2], source: md({ title: 'Guide', date: '2026-01-14', group: 'fixture-guide' }) }]).analyzed.map((a) => a.meta)
  const sets = group.map((m) => articleAlternates(translationsOf(m, group, TODAY)))
  const norm = (s) => JSON.stringify([...s].sort((a, b) => a.hreflang.localeCompare(b.hreflang)))
  assert.equal(new Set(sets.map(norm)).size, 1, 'identical annotation set on every page')
  assert.deepEqual(sets[0].map((s) => s.hreflang).sort(), ['en', 'es', 'fr-FR', 'x-default'])
  assert.equal(sets[0].find((s) => s.hreflang === 'x-default').href, 'https://www.convrt.studio/blog/fixture-guide')
  assert.equal(sets[0].find((s) => s.hreflang === 'es').href, 'https://www.convrt.studio/es/blog/guia-de-prueba')
  assert.deepEqual(articleAlternates([group[1]]), [], 'one member: none')
})

test('routes and slugs: /blog/<slug> for English, /<locale>/blog/<slug> for the others; a language gets a blog index only once it has a published article', () => {
  assert.equal(articlePath('a'), '/blog/a')
  assert.equal(articlePath('a', 'es'), '/es/blog/a')
  const published = selectPublished(metas(), TODAY)
  const paths = allRoutePaths(published)
  for (const p of ['/blog/fixture-guide', '/es/blog/guia-de-prueba', '/ar/blog/guia-de-prueba', '/es/blog', '/ar/blog']) assert.ok(paths.includes(p), p)
  for (const p of ['/fr/blog', '/fr/blog/guide-brouillon']) assert.ok(!paths.includes(p), `${p}: the draft and a language without articles get no route`)
  const none = allRoutePaths([])
  assert.ok(!none.includes('/es/blog') && !none.includes('/fr/blog'), 'no articles → no es/fr blog page')
  assert.ok(none.includes('/ar/blog') && none.includes('/blog'), 'the existing English and Arabic indexes are unchanged')
  assert.equal(allRoutePaths(['my-article']).filter((p) => p === '/blog/my-article').length, 1, 'plain English slugs still work')
})

test('head: localized article metadata, own canonical, hreflang, BlogPosting with author, dates and inLanguage; the Arabic article is RTL', () => {
  const all = selectPublished(metas(), TODAY)
  const es = all.find((m) => m.locale === 'es')
  const head = headParamsFor('/es/blog/guia-de-prueba', all)
  assert.equal(head.url, 'https://www.convrt.studio/es/blog/guia-de-prueba')
  assert.equal(head.lang, 'es')
  assert.equal(head.robots, 'index, follow')
  assert.ok(head.title.endsWith('Blog de CONVRT'))
  assert.deepEqual(head.alternates.map((a) => a.hreflang).sort(), ['en', 'es', 'x-default'])
  const posting = head.jsonLd.find((n) => n['@type'] === 'BlogPosting')
  assert.equal(posting.inLanguage, 'es')
  assert.equal(posting.author.name, 'Test Author')
  assert.equal(posting.datePublished, '2026-01-12')
  assert.equal(posting.dateModified, '2026-01-12', 'no modification date is invented: it equals the publication date unless updatedAt is set')
  assert.equal(posting.articleSection, 'Estrategia creativa')
  const crumbs = head.jsonLd.find((n) => n['@type'] === 'BreadcrumbList').itemListElement
  assert.deepEqual(crumbs.map((c) => c.name), ['Inicio', 'Blog', 'Guía de prueba'])
  assert.equal(crumbs[1].item, 'https://www.convrt.studio/es/blog')
  const ar = headParamsFor('/ar/blog/guia-de-prueba', all)
  assert.equal(ar.dir, 'rtl')
  assert.equal(ar.alternates, undefined, 'an article outside any translation group has no hreflang')
  assert.equal(articleHead(es, []).alternates, undefined)
  const en = headParamsFor('/blog/fixture-guide', all)
  assert.deepEqual(en.alternates.map((a) => a.hreflang).sort(), ['en', 'es', 'x-default'])
  assert.ok(!('inLanguage' in articleJsonLd(all.find((m) => m.locale === 'en'))[0]), 'English structured data is unchanged')
  assert.throws(() => headParamsFor('/fr/blog/guide-brouillon', all), /no published fr article/)
})

test('index heads: a language index is noindex while the blog is not indexable, and never lists another language', () => {
  const all = selectPublished(metas(), TODAY)
  const idx = localizedBlogIndexHead('es', publishedIn(all, 'es', TODAY))
  assert.equal(idx.url, 'https://www.convrt.studio/es/blog')
  assert.equal(idx.robots, 'noindex, follow')
  assert.deepEqual(publishedIn(all, 'es', TODAY).map((m) => m.slug), ['guia-de-prueba'])
  assert.deepEqual(relatedFor(all.find((m) => m.locale === 'es'), all).map((m) => m.locale), [], 'related articles never cross languages')
})

test('sitemap-blog.xml: published indexable articles of every language with the same alternates as the pages; no draft, no noindex, no empty index', () => {
  const all = metas()
  const xml = buildBlogSitemap(selectPublished(all, TODAY), { allMetas: all })
  assert.ok(xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'))
  assert.ok(xml.includes('<loc>https://www.convrt.studio/blog/fixture-guide</loc>'))
  assert.ok(xml.includes('<loc>https://www.convrt.studio/es/blog/guia-de-prueba</loc>'))
  assert.ok(xml.includes('<loc>https://www.convrt.studio/ar/blog/guia-de-prueba</loc>'))
  assert.ok(xml.includes('hreflang="es" href="https://www.convrt.studio/es/blog/guia-de-prueba"'))
  assert.ok(!xml.includes('guide-brouillon') && !xml.includes('/fr/blog'))
  assert.ok(!/<loc>[^<]*\/blog<\/loc>/.test(xml), 'index pages are listed only when the blog is indexable (BLOG_INDEXABLE)')
  const on = buildBlogSitemap(selectPublished(all, TODAY), { allMetas: all, indexable: true })
  assert.ok(on.includes('<loc>https://www.convrt.studio/es/blog</loc>') && on.includes('<loc>https://www.convrt.studio/ar/blog</loc>') && !on.includes('<loc>https://www.convrt.studio/fr/blog</loc>'))
  const empty = buildBlogSitemap([], { indexable: false })
  assert.ok(!empty.includes('<url>') && !empty.includes('xmlns:xhtml'))
})

test('the real content folder holds no placeholder article in any language', () => {
  const dir = path.join(ROOT, 'src/content/blog')
  for (const sub of ['', 'es', 'fr', 'ar']) {
    const d = path.join(dir, sub)
    if (!fs.existsSync(d)) continue
    const mds = fs.readdirSync(d).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    assert.deepEqual(mds, [], `${sub || 'en'}: no article files until the owner approves the first articles`)
  }
})

// ── a real build of a temporary copy of the project with the fixture articles ──────────────────────────────────────────────
let tmp, dist
const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8')
before(async () => {
  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'convrt-blog-ml-')))
  for (const f of ['src', 'index.html', 'vite.config.js', 'vite-plugin-blog.js', 'vite-plugin-sitemap.js', 'vite-plugin-static-routes.js', 'vite-plugin-withheld-videos.js', 'tailwind.config.js', 'postcss.config.js', 'package.json']) fs.cpSync(path.join(ROOT, f), path.join(tmp, f), { recursive: true })
  fs.mkdirSync(path.join(tmp, 'scripts'))
  fs.copyFileSync(path.join(ROOT, 'scripts/postcss-rtl-flip.js'), path.join(tmp, 'scripts/postcss-rtl-flip.js'))
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(tmp, 'node_modules'), 'dir')
  for (const f of FILES) {
    const folder = f.locale === 'en' ? 'src/content/blog' : `src/content/blog/${f.locale}`
    fs.mkdirSync(path.join(tmp, folder), { recursive: true })
    fs.writeFileSync(path.join(tmp, folder, `${f.filename}.md`), f.source)
  }
  const pub = path.join(tmp, 'pub')
  fs.mkdirSync(pub)
  fs.cpSync(path.join(ROOT, 'public', 'fonts'), path.join(pub, 'fonts'), { recursive: true })
  dist = path.join(tmp, 'out')
  await build({ root: tmp, logLevel: 'silent', publicDir: pub, build: { outDir: dist, emptyOutDir: true } })
})
after(() => { if (tmp) fs.rmSync(tmp, { recursive: true, force: true }) })

test('build: localized article pages are prerendered with their own language, canonical, hreflang and BlogPosting; drafts are not built', () => {
  const es = read('es/blog/guia-de-prueba/index.html')
  assert.match(es, /<html[^>]*lang="es"/)
  assert.ok(es.includes('<link rel="canonical" href="https://www.convrt.studio/es/blog/guia-de-prueba"'))
  for (const l of ['es', 'en', 'x-default']) assert.ok(es.includes(`hreflang="${l}"`), l)
  assert.ok(!es.includes('hreflang="fr'))
  assert.ok(es.includes('Guía de prueba') && es.includes('Fixture body.'), 'the article text is in the static HTML')
  assert.ok(es.includes('"@type":"BlogPosting"') && es.includes('"inLanguage":"es"'))
  assert.ok(!/name="robots" content="noindex/.test(es))
  const en = read('blog/fixture-guide/index.html')
  assert.ok(en.includes('hreflang="es" href="https://www.convrt.studio/es/blog/guia-de-prueba"') && en.includes('hreflang="x-default"'))
  const ar = read('ar/blog/guia-de-prueba/index.html')
  assert.match(ar, /<html[^>]*dir="rtl"/)
  assert.ok(!ar.includes('hreflang="en"'), 'the Arabic article is not a translation of the English one: no relationship is invented')
  assert.ok(!fs.existsSync(path.join(dist, 'fr/blog')), 'no French article is published, so no French blog route exists')
  const assets = fs.readdirSync(path.join(dist, 'assets')).map((f) => fs.readFileSync(path.join(dist, 'assets', f), 'utf8')).join('\n')
  assert.ok(!assets.includes('Guide brouillon'), 'draft text never ships')
})

test('build: language indexes exist only for languages with a published article and stay noindex while the blog is not indexable', () => {
  assert.ok(/name="robots" content="noindex, follow"/.test(read('es/blog/index.html')))
  assert.ok(read('es/blog/index.html').includes('Guía de prueba'))
  assert.ok(/name="robots" content="noindex, follow"/.test(read('ar/blog/index.html')))
  assert.ok(!fs.existsSync(path.join(dist, 'fr/blog/index.html')))
  const xml = read('sitemap-blog.xml')
  assert.ok(xml.includes('/es/blog/guia-de-prueba') && !xml.includes('guide-brouillon') && !xml.includes('<loc>https://www.convrt.studio/es/blog</loc>'))
})
