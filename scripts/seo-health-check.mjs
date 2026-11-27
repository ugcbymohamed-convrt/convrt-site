#!/usr/bin/env node
/* TECHNICAL SEO HEALTH CHECK (no keyword work). Read-only: it never changes a file.

   Static checks on the built site (`npm run build` first):   node scripts/seo-health-check.mjs
   Add live checks against a deployment:                      node scripts/seo-health-check.mjs --live https://www.convrt.studio

   Static (dist/): head tags, canonicals, reciprocal hreflang, sitemap <-> pages, noindex pages out of the sitemaps, robots.txt, JSON-LD parsing and required fields, internal links that do not
   resolve (or that point at a redirect), crawlable text without JavaScript, one h1, duplicate titles / descriptions / bodies, legacy URL redirects declared in vercel.json.
   Live (--live): HTTP status and redirect chain of every sitemap URL, apex/http -> https://www, 404 behaviour, X-Robots-Tag vs the meta robots, canonical/hreflang as served, crawler
   accessibility with search-engine and AI-crawler user agents, legacy redirects. Exit code 1 when an ERROR is found. WARNs are things to look at, not failures. */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://www.convrt.studio'
const liveArg = process.argv.indexOf('--live')
const LIVE = liveArg > -1 ? process.argv[liveArg + 1].replace(/\/$/, '') : null

const issues = []
const add = (level, area, url, msg) => issues.push({ level, area, url, msg })
const read = (f) => fs.readFileSync(f, 'utf8')
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')

if (!fs.existsSync(DIST)) { console.error('dist/ not found: run `npm run build` first'); process.exit(2) }

/* ───────── pages ───────── */
const pages = new Map() // url path -> info
for (const f of walk(DIST).filter((x) => x.endsWith('index.html') || x.endsWith('404.html'))) {
  const rel = path.relative(DIST, f).replace(/\\/g, '/')
  const url = rel === 'index.html' ? '/' : rel === '404.html' ? '/404' : `/${rel.replace(/\/index\.html$/, '')}`
  const html = read(f)
  const head = html.slice(0, html.indexOf('</head>'))
  const root = html.slice(html.indexOf('<div id="root"'))
  const attr = (re) => (head.match(re) || [])[1]
  const jsonld = [...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  pages.set(url, {
    url, file: rel, html, head, root,
    title: decode(attr(/<title>([^<]*)<\/title>/) || ''),
    description: decode(attr(/<meta name="description" content="([^"]*)"/) || ''),
    robots: attr(/<meta name="robots" content="([^"]*)"/) || '',
    canonical: attr(/<link rel="canonical" href="([^"]*)"/),
    alternates: [...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
    lang: attr(/<html lang="([^"]*)"/) || (html.match(/<html lang="([^"]*)"/) || [])[1],
    jsonld,
    text: decode(root.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/<!-- -->/g, '')).replace(/\s+/g, ' ').trim(),
    h1s: (root.match(/<h1[\s>]/g) || []).length,
  })
}
const abs = (u) => `${SITE}${u === '/' ? '/' : u}`
const toPath = (href) => { try { const u = new URL(href, SITE); return u.origin === SITE ? u.pathname.replace(/(.)\/$/, '$1') : null } catch { return null } }
const indexable = (p) => !/noindex/i.test(p.robots) && p.url !== '/404'

/* ───────── sitemaps ───────── */
const sitemapLocs = new Map()
for (const sm of ['sitemap.xml', 'sitemap-blog.xml']) {
  const f = path.join(DIST, sm)
  if (!fs.existsSync(f)) { add('ERROR', 'sitemap', sm, 'missing from dist'); continue }
  const xml = read(f)
  if (!/^<\?xml/.test(xml.trim()) || !/<urlset[^>]*sitemaps\.org/.test(xml)) add('ERROR', 'sitemap', sm, 'not a valid urlset document')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]))
  const seen = new Set()
  for (const loc of locs) {
    if (seen.has(loc)) add('ERROR', 'sitemap', loc, `duplicate <loc> in ${sm}`)
    seen.add(loc)
    sitemapLocs.set(loc, sm)
    if (!loc.startsWith(`${SITE}`)) { add('ERROR', 'sitemap', loc, 'not an absolute https://www.convrt.studio URL'); continue }
    if (/[?#]/.test(loc) || (/\/$/.test(loc) && !/^https:\/\/www\.convrt\.studio\/((es|fr|ar)\/)?$/.test(loc))) add('WARN', 'sitemap', loc, 'has a query/fragment or an unexpected trailing slash (only / and the language roots /es/ /fr/ /ar/ end with one)')
    const p = pages.get(toPath(loc))
    if (!p) { add('ERROR', 'sitemap', loc, 'no built page for this URL'); continue }
    if (!indexable(p)) add('ERROR', 'sitemap', loc, `listed but noindex (${p.robots})`)
    if (p.canonical !== loc) add('ERROR', 'sitemap', loc, `canonical (${p.canonical}) differs from the sitemap URL`)
  }
}
for (const p of pages.values()) {
  if (!indexable(p)) continue
  if (!sitemapLocs.has(abs(p.url))) add(p.canonical === abs(p.url) ? 'WARN' : 'INFO', 'sitemap', p.url, p.canonical === abs(p.url) ? 'indexable, self-canonical but not in any sitemap' : `not in a sitemap (canonical points to ${p.canonical})`)
}

/* ───────── head tags, canonicals, indexing ───────── */
for (const p of pages.values()) {
  if (p.url === '/404') { if (!/noindex/.test(p.robots)) add('ERROR', 'indexing', p.url, '404 page is not noindex'); continue }
  if (!p.title) add('ERROR', 'head', p.url, 'missing <title>')
  else if (p.title.length > 70) add('WARN', 'head', p.url, `title is ${p.title.length} characters`)
  if (!p.description) add('WARN', 'head', p.url, 'missing meta description')
  if (!p.lang) add('ERROR', 'head', p.url, 'missing <html lang>')
  if (indexable(p)) {
    if (!p.canonical) add('ERROR', 'canonical', p.url, 'indexable page without a canonical')
    else {
      if (!p.canonical.startsWith(`${SITE}`) || /[?#]/.test(p.canonical)) add('ERROR', 'canonical', p.url, `canonical is not a clean absolute URL: ${p.canonical}`)
      const target = pages.get(toPath(p.canonical) || '')
      if (!target) add('ERROR', 'canonical', p.url, `canonical target has no built page: ${p.canonical}`)
      else if (target.url !== p.url) {
        if (!indexable(target)) add('ERROR', 'canonical', p.url, `canonical points to a noindex page ${target.url}`)
        else if (target.canonical !== p.canonical) add('ERROR', 'canonical', p.url, `canonical chain: ${p.canonical} has its own canonical ${target.canonical}`)
        else add('INFO', 'canonical', p.url, `declared duplicate of ${target.url} (canonical elsewhere)`)
      }
    }
    if (p.h1s !== 1) add('WARN', 'content', p.url, `${p.h1s} <h1> elements in the prerendered HTML`)
  } else {
    if (p.canonical && p.canonical !== abs(p.url)) add('WARN', 'indexing', p.url, `noindex page canonicalises elsewhere (${p.canonical})`)
    if (p.alternates.length) add('WARN', 'hreflang', p.url, 'noindex page still declares hreflang alternates')
  }
  if (p.robots && !/^(index|noindex)/.test(p.robots)) add('WARN', 'indexing', p.url, `unusual robots meta "${p.robots}"`)
}

/* ───────── hreflang ───────── */
for (const p of pages.values()) {
  if (!indexable(p) || !p.alternates.length) continue
  const codes = p.alternates.map((a) => a[0])
  if (new Set(codes).size !== codes.length) add('ERROR', 'hreflang', p.url, 'duplicate hreflang codes')
  if (!codes.includes('x-default')) add('ERROR', 'hreflang', p.url, 'no x-default')
  const self = p.alternates.find((a) => a[1] === p.canonical)
  if (!self) add('ERROR', 'hreflang', p.url, 'the set does not include the page itself (self-reference)')
  const mine = JSON.stringify([...p.alternates].sort())
  for (const [code, href] of p.alternates) {
    const t = pages.get(toPath(href) || '')
    if (!t) { add('ERROR', 'hreflang', p.url, `${code} -> ${href}: no built page`); continue }
    if (!indexable(t)) add('ERROR', 'hreflang', p.url, `${code} -> ${href}: target is noindex`)
    if (t.canonical !== href) add('ERROR', 'hreflang', p.url, `${code} -> ${href}: target canonical is ${t.canonical}`)
    if (JSON.stringify([...t.alternates].sort()) !== mine) add('ERROR', 'hreflang', p.url, `${code} -> ${href}: target lists a different set (not reciprocal)`)
    const htmlLang = t.lang
    if (code !== 'x-default' && htmlLang && htmlLang.split('-')[0] !== code.split('-')[0]) add('ERROR', 'hreflang', p.url, `${code} -> ${href}: target <html lang="${htmlLang}">`)
  }
}

/* ───────── robots.txt ───────── */
{
  const f = path.join(DIST, 'robots.txt')
  if (!fs.existsSync(f)) add('ERROR', 'robots', 'robots.txt', 'missing')
  else {
    const txt = read(f)
    const groups = txt.split(/\n\s*\n/)
    const sm = [...txt.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1])
    for (const s of sm) if (!sitemapLocs.size || !fs.existsSync(path.join(DIST, new URL(s).pathname))) add('ERROR', 'robots', s, 'Sitemap line points at a file that is not built')
    if (!sm.length) add('ERROR', 'robots', 'robots.txt', 'no Sitemap line')
    const disallow = [...txt.matchAll(/^Disallow:\s*(\S*)/gim)].map((m) => m[1]).filter(Boolean)
    for (const d of disallow) {
      if (d === '/api/') continue
      add('WARN', 'robots', d, 'a Disallow rule: a blocked URL can never show its noindex directive')
    }
    const agents = [...txt.matchAll(/^User-agent:\s*(\S+)/gim)].map((m) => m[1])
    for (const a of agents) if (a !== '*') add('WARN', 'robots', a, `a rule for ${a}: check it does not block a search engine or AI crawler`)
    if (groups.length && /Disallow:\s*\/\s*$/m.test(txt)) add('ERROR', 'robots', 'robots.txt', 'Disallow: / blocks the whole site')
    // every noindex page must be crawlable (not Disallowed)
    for (const p of pages.values()) if (!indexable(p) && disallow.some((d) => d !== '/api/' && p.url.startsWith(d))) add('ERROR', 'robots', p.url, 'noindex page is also blocked in robots.txt')
  }
}

/* ───────── structured data ───────── */
const ABS = /^https:\/\/www\.convrt\.studio(\/|$)/
const GLOBAL_IDS = new Set()
for (const p of pages.values()) for (const raw of p.jsonld) { try { const d = JSON.parse(decode(raw)); for (const n of (Array.isArray(d['@graph']) ? d['@graph'] : [d])) if (n['@id']) GLOBAL_IDS.add(n['@id']) } catch { /* reported below */ } }
for (const p of pages.values()) {
  const ids = new Set(); const refs = []
  const nodes = []
  p.jsonld.forEach((raw, i) => {
    let data
    try { data = JSON.parse(decode(raw)) } catch (e) { add('ERROR', 'structured-data', p.url, `JSON-LD block ${i + 1} is not valid JSON: ${e.message}`); return }
    if (!data['@context'] || !/schema\.org/.test(JSON.stringify(data['@context']))) add('ERROR', 'structured-data', p.url, `block ${i + 1}: missing/invalid @context`)
    const list = Array.isArray(data['@graph']) ? data['@graph'] : [data]
    for (const n of list) { nodes.push(n); if (n['@id']) { if (ids.has(n['@id'])) add('ERROR', 'structured-data', p.url, `duplicate @id ${n['@id']}`); ids.add(n['@id']) } }
    const visit = (v, key) => {
      if (Array.isArray(v)) return v.forEach((x) => visit(x, key))
      if (v && typeof v === 'object') {
        if (Object.keys(v).length === 1 && v['@id']) refs.push(v['@id'])
        for (const [k, x] of Object.entries(v)) visit(x, k)
      } else if (typeof v === 'string' && /^(url|contentUrl|embedUrl|thumbnailUrl|item|@id|sameAs|logo|image)$/.test(key || '') && /^https?:\/\//.test(v) && /convrt\.studio/.test(v) && !ABS.test(v)) add('WARN', 'structured-data', p.url, `non-canonical own URL in ${key}: ${v}`)
    }
    visit(data)
  })
  for (const r of refs) if (!ids.has(r) && !/#organization$|#website$|#founder$/.test(r)) add(GLOBAL_IDS.has(r) ? 'INFO' : 'ERROR', 'structured-data', p.url, GLOBAL_IDS.has(r) ? `@id reference ${r} is defined on another page` : `@id reference ${r} is defined on NO page`)
  const types = (n) => [].concat(n['@type'] || [])
  for (const n of nodes) {
    const t = types(n)
    if (t.includes('Organization') && !(n.name && n.url)) add('ERROR', 'structured-data', p.url, 'Organization without name/url')
    if (t.includes('BreadcrumbList')) {
      const items = n.itemListElement || []
      if (!items.length || items.some((it, i) => it.position !== i + 1 || !it.name)) add('ERROR', 'structured-data', p.url, 'BreadcrumbList items need sequential position and name')
    }
    if (t.includes('FAQPage')) {
      const q = n.mainEntity || []
      if (!q.length || q.some((x) => x['@type'] !== 'Question' || !x.name || !x.acceptedAnswer?.text)) add('ERROR', 'structured-data', p.url, 'FAQPage questions need name and acceptedAnswer.text')
      // FAQ answers must be on the page (not hidden-only)
      for (const x of q) { const flat = (t) => t.replace(/[\u00a0\u202f]/g, ' ').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' '); const probe = flat(x.name).slice(0, 40); if (!flat(p.text).includes(probe)) add('WARN', 'structured-data', p.url, `FAQ question not found in the visible text: "${probe}"`) }
    }
    if (t.includes('VideoObject')) for (const k of ['name', 'thumbnailUrl', 'uploadDate']) if (!n[k]) add('ERROR', 'structured-data', p.url, `VideoObject without ${k}`)
    if (t.includes('Offer') || t.includes('AggregateOffer')) if (!(n.priceCurrency && (n.price !== undefined || n.lowPrice !== undefined))) add('ERROR', 'structured-data', p.url, 'Offer without price/priceCurrency')
    if (t.includes('WebPage') || t.includes('AboutPage') || t.includes('ContactPage') || t.includes('CollectionPage')) if (n.url && n.url !== p.canonical && indexable(p)) add('WARN', 'structured-data', p.url, `page node url ${n.url} differs from the canonical ${p.canonical}`)
  }
  if (!indexable(p) && p.jsonld.length && p.url !== '/404') add('INFO', 'structured-data', p.url, 'noindex page carries JSON-LD')
}

/* ───────── internal links ───────── */
const vercel = JSON.parse(read(path.join(ROOT, 'vercel.json')))
const redirects = new Map()
for (const r of vercel.redirects || []) if (!r.has && /^\/[a-z0-9\-/]+$/i.test(r.source)) redirects.set(r.source, r.destination)
const assetExists = (pth) => fs.existsSync(path.join(DIST, pth.replace(/^\//, '')))
const brokenSeen = new Set()
for (const p of pages.values()) {
  for (const m of p.root.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)) {
    const href = decode(m[1])
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|sms:)/.test(href)) continue
    let pth = null
    if (href.startsWith('/')) pth = href.split(/[?#]/)[0]
    else if (href.startsWith(SITE)) pth = href.slice(SITE.length).split(/[?#]/)[0] || '/'
    else continue
    const clean = pth.length > 1 ? pth.replace(/\/$/, '') : pth
    if (redirects.has(clean)) { add('WARN', 'links', p.url, `links to ${clean}, which redirects to ${redirects.get(clean)}`); continue }
    if (pages.has(clean) || assetExists(clean)) continue
    const key = `${p.url}->${clean}`
    if (!brokenSeen.has(key)) { brokenSeen.add(key); add('ERROR', 'links', p.url, `broken internal link ${href}`) }
  }
  for (const m of p.root.matchAll(/<(?:img|source|video)\b[^>]*?\s(?:src|poster)="(\/[^"]+)"/g)) {
    const pth = decode(m[1]).split(/[?#]/)[0]
    if (!assetExists(pth) && !brokenSeen.has(`${p.url}->${pth}`)) { brokenSeen.add(`${p.url}->${pth}`); add('ERROR', 'links', p.url, `missing local asset ${pth}`) }
  }
}
for (const [src, dest] of redirects) if (!pages.has(dest.replace(/\/$/, '') || '/') && !dest.startsWith('http')) add('ERROR', 'redirects', src, `redirect destination ${dest} has no built page`)

/* ───────── crawlable without JavaScript & duplicates ───────── */
const byTitle = new Map(); const byDesc = new Map(); const byBody = new Map()
for (const p of pages.values()) {
  if (p.url === '/404') continue
  if (indexable(p)) {
    if (p.text.length < 400) add('ERROR', 'no-js', p.url, `only ${p.text.length} characters of text in the prerendered HTML`)
    if (/<noscript[^>]*>[^<]*enable javascript/i.test(p.html)) add('WARN', 'no-js', p.url, 'a "enable JavaScript" notice in the HTML')
    if (!/<main|role="main"/.test(p.root)) add('WARN', 'no-js', p.url, 'no <main> landmark in the prerendered HTML')
    for (const [map, key] of [[byTitle, p.title], [byDesc, p.description], [byBody, p.text.slice(0, 5000)]]) {
      if (!key) continue
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(p)
    }
  }
}
for (const [what, map] of [['title', byTitle], ['meta description', byDesc], ['body text', byBody]]) {
  for (const group of map.values()) {
    const distinct = [...new Set(group.map((g) => g.canonical))]
    if (group.length > 1 && distinct.length > 1) add(what === 'body text' ? 'ERROR' : 'WARN', 'duplicates', group.map((g) => g.url).join(' , '), `same ${what} on indexable pages with different canonicals`)
  }
}

/* ───────── live checks ───────── */
async function live() {
  const UAS = {
    browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
    Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    GPTBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
    'OAI-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
    ClaudeBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    PerplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  }
  const get = async (url, ua = UAS.browser, redirect = 'manual') => {
    try { return await fetch(url, { redirect, headers: { 'user-agent': ua, 'accept-language': 'en' } }) } catch (e) { return { status: 0, error: e.message, headers: new Headers() } }
  }
  const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]) } })); return out }
  const live = (u) => u.replace(SITE, LIVE)

  // sitemap URLs: 200, no redirect, header/meta agree
  const urls = [...sitemapLocs.keys()]
  const results = await pool(urls, 8, async (u) => {
    const r = await get(live(u)); const body = r.status === 200 ? await r.text() : ''
    return { u, status: r.status, loc: r.headers.get('location'), xrt: r.headers.get('x-robots-tag'), body }
  })
  for (const r of results) {
    if (r.status !== 200) { add('ERROR', 'live-status', r.u, `HTTP ${r.status}${r.loc ? ` -> ${r.loc}` : ''} (must be a direct 200)`); continue }
    if (/noindex/i.test(r.xrt || '')) add('ERROR', 'live-indexing', r.u, `X-Robots-Tag ${r.xrt} on an indexable page`)
    if (/<meta name="robots" content="[^"]*noindex/.test(r.body)) add('ERROR', 'live-indexing', r.u, 'noindex meta served on a sitemap URL')
    const canon = (r.body.match(/<link rel="canonical" href="([^"]*)"/) || [])[1]
    if (canon !== r.u) add('ERROR', 'live-canonical', r.u, `served canonical ${canon}`)
    const built = pages.get(toPath(r.u)); if (built && built.title !== decode((r.body.match(/<title>([^<]*)<\/title>/) || [])[1] || '')) add('WARN', 'live-drift', r.u, 'served <title> differs from the local build (deployment not on this commit?)')
  }
  // noindex pages: reachable and the directive is served
  for (const p of pages.values()) {
    if (indexable(p) || p.url === '/404' || p.url.startsWith('/creator-')) continue
    const r = await get(live(abs(p.url)))
    if (r.status !== 200) { add('WARN', 'live-status', p.url, `noindex page answers HTTP ${r.status}`); continue }
    const body = await r.text()
    if (!/noindex/i.test(r.headers.get('x-robots-tag') || '') && !/<meta name="robots" content="[^"]*noindex/.test(body)) add('ERROR', 'live-indexing', p.url, 'built noindex but the live page has no noindex')
  }
  // private areas: header only (the pages themselves answer through the SPA)
  for (const u of ['/creator-onboarding', '/creator-admin']) { const r = await get(live(SITE + u)); if (!/noindex/i.test(r.headers.get('x-robots-tag') || '')) add('ERROR', 'live-indexing', u, 'private area without X-Robots-Tag noindex') }
  // host / protocol: follow the chain by hand (a platform https upgrade may add one hop before our own apex -> www redirect)
  for (const [from, label] of [['https://convrt.studio/about', 'apex https'], ['http://convrt.studio/about', 'apex http'], ['http://www.convrt.studio/about', 'www http']]) {
    let url = from; const chain = []
    for (let hop = 0; hop < 5; hop++) { const r = await get(url); const loc = r.headers.get('location'); if (!(r.status >= 301 && r.status <= 308) || !loc) { chain.push(`${r.status}`); break } chain.push(`${r.status} -> ${loc}`); url = new URL(loc, url).href }
    const hops = chain.length - 1
    if (url !== 'https://www.convrt.studio/about' || chain.some((c) => /^30[27] /.test(c))) add('ERROR', 'live-redirects', from, `${label}: ${chain.join(' | ')}; expected permanent redirects ending at https://www.convrt.studio/about`)
    else if (hops > 2) add('WARN', 'live-redirects', from, `${label}: ${hops} hops (${chain.join(' | ')})`)
    else if (hops === 2) add('INFO', 'live-redirects', from, `${label}: 2 hops (${chain.join(' | ')}): the first is the platform's https upgrade`)
  }
  // trailing slash, legacy URLs
  for (const u of ['/about/', '/pricing/', '/es/pricing/']) { const r = await get(LIVE + u); const hop = r.headers.get('location') || ''; if (r.status === 200) add('WARN', 'live-duplicates', u, 'trailing-slash URL answers 200 (duplicate of the canonical URL)'); else if (!(r.status >= 301 && r.status <= 308)) add('ERROR', 'live-redirects', u, `trailing slash: HTTP ${r.status}`); else if (!hop.replace(LIVE, '').replace(/\/$/, '').match(/^\/(es\/)?(about|pricing)$/)) add('WARN', 'live-redirects', u, `redirects to ${hop}`) }
  for (const [src, dest] of redirects) {
    const r = await get(LIVE + src); const hop = (r.headers.get('location') || '').replace(LIVE, '').replace(SITE, '')
    if (r.status !== 308 && r.status !== 301) add('ERROR', 'live-redirects', src, `legacy URL answers HTTP ${r.status}, expected a permanent redirect to ${dest}`)
    else if (hop !== dest) add('ERROR', 'live-redirects', src, `redirects to ${hop}, expected ${dest}`)
    const t = await get(LIVE + dest); if (t.status !== 200) add('ERROR', 'live-redirects', src, `redirect target ${dest} answers HTTP ${t.status}`)
  }
  // 404 behaviour
  for (const u of ['/this-page-does-not-exist', '/es/this-page-does-not-exist', '/fr/nope/nope', '/ar/page-that-is-missing']) {
    const r = await get(LIVE + u); const body = r.status ? await r.text() : ''
    if (r.status !== 404) add('ERROR', 'live-404', u, `unknown URL answers HTTP ${r.status} (soft 404)`)
    else if (!/noindex/i.test(r.headers.get('x-robots-tag') || '') && !/<meta name="robots" content="[^"]*noindex/.test(body)) add('WARN', 'live-404', u, '404 without a noindex directive')
  }
  // robots.txt and sitemaps as served
  const rb = await get(LIVE + '/robots.txt'); const rbTxt = rb.status === 200 ? await rb.text() : ''
  if (rb.status !== 200) add('ERROR', 'live-robots', '/robots.txt', `HTTP ${rb.status}`)
  else if (rbTxt.trim() !== read(path.join(DIST, 'robots.txt')).trim()) add('WARN', 'live-drift', '/robots.txt', 'served robots.txt differs from the build')
  for (const s of ['/sitemap.xml', '/sitemap-blog.xml']) { const r = await get(LIVE + s); if (r.status !== 200 || !/xml/.test(r.headers.get('content-type') || '')) add('ERROR', 'live-sitemap', s, `HTTP ${r.status}, content-type ${r.headers.get('content-type')}`) }
  // crawler accessibility: same status and (roughly) the same HTML for search and AI crawlers
  const probe = ['/', '/pricing', '/es/', '/fr/', '/ar/', '/case-studies/graspo']
  for (const u of probe) {
    const base = await get(LIVE + u, UAS.browser); const baseLen = base.status === 200 ? (await base.text()).length : 0
    for (const [name, ua] of Object.entries(UAS)) {
      if (name === 'browser') continue
      const r = await get(LIVE + u, ua); const len = r.status === 200 ? (await r.text()).length : 0
      if (r.status !== 200) add('ERROR', 'live-crawlers', `${u} as ${name}`, `HTTP ${r.status}`)
      else if (Math.abs(len - baseLen) / Math.max(baseLen, 1) > 0.05) add('WARN', 'live-crawlers', `${u} as ${name}`, `HTML length ${len} vs ${baseLen} for a browser (cloaking or bot protection?)`)
    }
  }
  const aiTxt = await get(LIVE + '/llms.txt'); add('INFO', 'live-ai', '/llms.txt', `HTTP ${aiTxt.status} (an optional convention; not required by any crawler)`)
}

if (LIVE) await live()

/* ───────── report ───────── */
const order = { ERROR: 0, WARN: 1, INFO: 2 }
issues.sort((a, b) => order[a.level] - order[b.level] || a.area.localeCompare(b.area))
const count = (l) => issues.filter((i) => i.level === l).length
const byArea = {}
for (const i of issues) (byArea[`${i.level} ${i.area}`] ||= []).push(i)
console.log(`Pages built: ${pages.size} · indexable: ${[...pages.values()].filter(indexable).length} · sitemap URLs: ${sitemapLocs.size}${LIVE ? ` · live: ${LIVE}` : ''}`)
for (const [k, list] of Object.entries(byArea)) {
  console.log(`\n${k} (${list.length})`)
  for (const i of list.slice(0, 25)) console.log(`  ${i.url}: ${i.msg}`)
  if (list.length > 25) console.log(`  … ${list.length - 25} more`)
}
console.log(`\nERROR ${count('ERROR')} · WARN ${count('WARN')} · INFO ${count('INFO')}`)
fs.writeFileSync(path.join(process.env.SEO_REPORT_DIR || ROOT, 'seo-health-report.json'), JSON.stringify(issues, null, 1))
process.exit(count('ERROR') ? 1 : 0)
