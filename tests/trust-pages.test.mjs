// Run with: node --test tests/trust-pages.test.mjs
// SEO/GEO Batch 1: trust and legal pages (drafts), default share image, long-cache headers and apex redirect, Organization schema.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE_URL, OG_IMAGE, ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, TRUST_PAGES_PUBLISHED, PRIVACY_POLICY_URL,
} from '../src/config.js'
import { PATHS, KNOWN_PATHS } from '../src/routes.js'
import { SITE_SEO, pageHead, sitemapRoutes } from '../src/seo/siteSeo.js'
import { buildHeadSpec } from '../src/lib/headSpec.js'
import { organizationNode, trustGraph, jsonLdFor, FOUNDER_ID } from '../src/seo/structuredData.js'
import { TRUST_CONTENT, plainText, ownerMarkersIn, OWNER_MARKER } from '../src/content/trustPages.js'
import { BRAND } from '../src/seo/businessKnowledge.js'
import { articleHead } from '../src/lib/blog/seo.js'
import { LEGAL_ENTITY, CONVRT_ADDRESS } from '../src/content/creatorLegal.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
const TRUST = [ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH]

test('trust pages: four routes, all known, all routed to the one template, all with SEO entries', () => {
  assert.deepEqual(TRUST, ['/about', '/contact', '/privacy', '/terms'])
  for (const p of TRUST) { assert.ok(KNOWN_PATHS.includes(p), p); assert.ok(SITE_SEO[p], p) }
  const app = read('src/App.jsx')
  for (const k of ['about', 'contact', 'privacy', 'terms']) assert.match(app, new RegExp(`\\[PATHS\\.${k}\\]: TrustPage`))
  assert.equal(PATHS.about, '/about')
})

test('trust pages are drafts: noindex and out of the sitemap while TRUST_PAGES_PUBLISHED is false; Privacy and Terms never indexable', () => {
  assert.equal(TRUST_PAGES_PUBLISHED, false, 'the owner has not approved publication yet: flip this only on approval')
  for (const p of TRUST) {
    const h = pageHead(p)
    assert.ok(h.noindex === true || /noindex/.test(h.robots || ''), `${p} is noindex`)
    assert.ok(!sitemapRoutes().includes(p), `${p} is not in the sitemap`)
  }
  assert.equal(pageHead(PRIVACY_PATH).robots, 'noindex, follow')
  assert.equal(pageHead(TERMS_PATH).robots, 'noindex, follow')
  assert.equal(SITE_SEO[ABOUT_PATH].indexable, TRUST_PAGES_PUBLISHED)
  assert.equal(SITE_SEO[CONTACT_PATH].indexable, TRUST_PAGES_PUBLISHED)
})

test('privacy link on the forms and footer links follow the same single flag', () => {
  assert.equal(PRIVACY_POLICY_URL, TRUST_PAGES_PUBLISHED ? PRIVACY_PATH : '')
  const footer = read('src/components/Footer.jsx')
  assert.ok((footer.match(/TRUST_PAGES_PUBLISHED &&/g) || []).length >= 3, 'About, Privacy and Terms links are gated')
  for (const f of ['src/components/roadmap/RoadmapApplication.jsx', 'src/components/referrals/ReferralForm.jsx', 'src/components/hooks/HooksSignupCard.jsx']) {
    assert.match(read(f), /PRIVACY_POLICY_URL &&/, `${f} already links the policy when the URL is set (form code untouched)`)
  }
})

test('publication guard: no "[OWNER TO CONFIRM" marker may remain once TRUST_PAGES_PUBLISHED is true; today the markers are listed', () => {
  const markers = Object.values(TRUST_CONTENT).flatMap(ownerMarkersIn)
  if (TRUST_PAGES_PUBLISHED) assert.deepEqual(markers, [], 'resolve every owner marker before publishing')
  else assert.ok(markers.length > 0 && markers.every((m) => m.startsWith(OWNER_MARKER)), 'drafts carry visible markers for the missing details')
})

test('no invented or private details: no address, tax id, registration number, phone, credentials or results on the trust pages', () => {
  const all = Object.values(TRUST_CONTENT).map(plainText).join('\n')
  // The tax id and postal address recorded for the creator agreements must not leak onto the public pages without the owner's decision.
  assert.ok(!all.includes(LEGAL_ENTITY.taxId), 'tax id not published')
  const [street, postalAndCity] = CONVRT_ADDRESS.split(/,\s*/)
  assert.ok(!all.includes(street) && !all.includes(postalAndCity.split(' ')[0]), 'street address and postal code not published')
  for (const forbidden of ['NIF', 'VAT number', 'registered in', 'Company number', '+34', 'award', 'years of experience']) {
    assert.ok(!all.includes(forbidden), `must not contain ${forbidden}`)
  }
  assert.ok(!/\b(top-rated|rated|rating)\b/i.test(all), 'no ratings')
  assert.ok(!/\b(he|she|his|her|him)\b/i.test(plainText(TRUST_CONTENT.about)), 'no pronouns are assumed for the founder')
  assert.ok(!/guarantee(s|d)? (results|performance|roi|sales)/i.test(all.replace(/never guarantee|do not guarantee|not guarantee|no guarantee/gi, '')))
})

test('About page says only verified things: services link to their pages, human creators, independent-creator showcase, no media buying, languages', () => {
  const about = plainText(TRUST_CONTENT.about)
  for (const href of ['/ugc-video-agency', '/saas-video-production', '/spokesperson-video-production', '/social-media-video-production', '/pricing', '/contact']) {
    assert.ok(JSON.stringify(TRUST_CONTENT.about).includes(`|${href}]]`), href)
  }
  assert.ok(about.includes(BRAND.founder.name))
  assert.match(about, /in-house talent and freelance creators/)
  assert.match(about, /not AI-generated avatars/)
  assert.match(about, /examples from independent creators/)
  assert.match(about, /not necessarily productions by CONVRT/)
  assert.match(about, /do not buy media or manage your advertising accounts/)
  assert.match(about, /English, Spanish, French and Arabic/)
})

test('Privacy draft describes the data flows that really exist in the code (MailerLite, Resend, Calendly, Vercel, Cloudflare, consent-gated Google analytics)', () => {
  const p = plainText(TRUST_CONTENT.privacy)
  for (const s of ['MailerLite', 'Resend', 'Calendly', 'Vercel', 'Cloudflare', 'Google Tag Manager', 'Cookie settings', 'withdraw', 'not sent to us']) assert.ok(p.includes(s), s)
  assert.match(p, /only if you accept analytics cookies/)
  assert.match(p, /do not sell personal information/)
  // matches the real handlers
  assert.match(read('api/_lib/apply.js'), /MailerLite/); assert.match(read('api/_lib/notify.js'), /Resend/)
  assert.match(read('src/components/roadmap/RoadmapApplication.jsx'), /stay in your browser/)
})

test('trust page head: unique title/description, within search-result lengths, canonical on www', () => {
  for (const p of TRUST) {
    const e = SITE_SEO[p]
    assert.ok(e.title.length <= 60, `${p} title ${e.title.length}`)
    assert.ok(e.description.length <= 165, `${p} description ${e.description.length}`)
    assert.equal(pageHead(p).url, `${SITE_URL}${p}`)
  }
})

test('structured data: Organization gains a contact point; the founder Person appears only with the published About page; trust pages get typed WebPages + breadcrumbs', () => {
  const org = organizationNode()
  assert.deepEqual(org.contactPoint, { '@type': 'ContactPoint', contactType: 'customer service', email: BRAND.contactEmail })
  assert.equal('founder' in org, TRUST_PAGES_PUBLISHED)
  assert.match(org.description, /SaaS video production/)
  assert.ok(!/address|telephone|foundingDate|aggregateRating|award|numberOfEmployees/i.test(JSON.stringify(org)), 'no invented organisation facts')
  const g = trustGraph(ABOUT_PATH, SITE_SEO[ABOUT_PATH])['@graph']
  assert.deepEqual(g.map((n) => n['@type']), ['Organization', 'AboutPage', 'BreadcrumbList'])
  assert.equal(trustGraph(CONTACT_PATH, SITE_SEO[CONTACT_PATH])['@graph'][1]['@type'], 'ContactPage')
  assert.equal(trustGraph(PRIVACY_PATH, SITE_SEO[PRIVACY_PATH])['@graph'][1]['@type'], 'WebPage')
  assert.equal(jsonLdFor(TERMS_PATH, SITE_SEO[TERMS_PATH])['@graph'].length, 3)
  // what the Person would say once published is the verified founder record, nothing more
  const withFounder = JSON.stringify({ '@type': 'Person', '@id': FOUNDER_ID, name: BRAND.founder.name, jobTitle: BRAND.founder.jobTitle, sameAs: [BRAND.founder.linkedin] })
  assert.ok(!/knowsAbout|alumniOf|award|hasCredential|description/.test(withFounder))
  assert.match(read('src/seo/structuredData.js'), /TRUST_PAGES_PUBLISHED\s*\n?\s*\?/)
})

// ── social sharing image ────────────────────────────────────────────────────────────────
test('default share image: a real 1200x630 PNG under 300 KB, absolute https URL on www, used by every page head', () => {
  const buf = fs.readFileSync(path.join(ROOT, 'public/og/convrt-og.png'))
  assert.equal(buf.subarray(1, 4).toString(), 'PNG')
  assert.deepEqual([buf.readUInt32BE(16), buf.readUInt32BE(20)], [1200, 630])
  assert.ok(buf.length < 300 * 1024, `${buf.length} bytes`)
  assert.equal(OG_IMAGE.url, `${SITE_URL}/og/convrt-og.png`)
  for (const p of Object.keys(SITE_SEO)) {
    if (SITE_SEO[p].canonicalPath) continue
    const h = pageHead(p)
    assert.equal(h.image, OG_IMAGE.url, p); assert.equal(h.imageWidth, 1200); assert.equal(h.imageHeight, 630); assert.ok(h.imageAlt.length > 20)
  }
})

test('share tags: og:image (+ size and alt), twitter:image and a large card; no image means the small card as before', () => {
  const spec = buildHeadSpec(pageHead('/pricing'))
  const meta = (k) => spec.metas.find((m) => m.key === k)?.content
  assert.equal(meta('og:image'), OG_IMAGE.url); assert.equal(meta('twitter:image'), OG_IMAGE.url)
  assert.equal(meta('og:image:width'), '1200'); assert.equal(meta('og:image:height'), '630')
  assert.equal(meta('og:image:alt'), OG_IMAGE.alt); assert.equal(meta('twitter:image:alt'), OG_IMAGE.alt)
  assert.equal(meta('twitter:card'), 'summary_large_image')
  assert.equal(meta('og:url'), `${SITE_URL}/pricing`)
  assert.equal(meta('og:site_name'), 'CONVRT')
  const bare = buildHeadSpec({ title: 't', description: 'd', url: `${SITE_URL}/x` })
  assert.equal(bare.metas.find((m) => m.key === 'twitter:card').content, 'summary')
  assert.ok(!bare.metas.some((m) => m.key === 'og:image'))
})

test('blog: an article without a cover falls back to the default image; one with a cover keeps its own', () => {
  const base = { slug: 'a', title: 'A', excerpt: 'x', seoTitle: 'A | CONVRT Blog', metaDescription: 'x' }
  assert.equal(articleHead(base).image, OG_IMAGE.url)
  assert.equal(articleHead({ ...base, image: '/blog/a/cover.webp' }).image, `${SITE_URL}/blog/a/cover.webp`)
})

test('private pages never carry the share image (noindex, no url)', () => {
  assert.ok(!/image/.test(read('src/seo/privateSeo.js')))
})

// ── attribution ─────────────────────────────────────────────────────────────────────────
test('creator-examples attribution is rendered by the shared gallery (all four service pages) and by the Creator Showcase hero, from one constant', () => {
  assert.match(read('src/components/ugc/UgcGallery.jsx'), /\{CREATOR_EXAMPLES_NOTE\}/)
  assert.match(read('src/components/ourwork/OurWorkHero.jsx'), /\{CREATOR_EXAMPLES_NOTE\}/)
  for (const f of ['UgcVideoAgencyPage', 'SpokespersonVideoPage', 'OrganicSocialVideoPage', 'SaasVideoPage']) assert.match(read(`src/${f}.jsx`), /<UgcGallery /, `${f} uses the shared gallery`)
  assert.match(read('src/content/attribution.js'), /independent creators[\s\S]*not necessarily productions by CONVRT/)
})

// ── hosting config ──────────────────────────────────────────────────────────────────────
test('vercel.json: apex redirects permanently to www, hashed assets and fonts get a one-year immutable cache, existing rules are intact', () => {
  const v = JSON.parse(read('vercel.json'))
  const apex = v.redirects.find((r) => r.has?.some((h) => h.type === 'host' && h.value === 'convrt.studio'))
  assert.ok(apex && apex.permanent === true && apex.destination === 'https://www.convrt.studio/$1' && apex.source === '/(.*)')
  assert.ok(!v.redirects.some((r) => r.has?.some((h) => h.value === 'www.convrt.studio')), 'no rule can loop on www')
  for (const s of ['/assets/(.*)', '/fonts/(.*)']) {
    const h = v.headers.find((x) => x.source === s)
    assert.deepEqual(h.headers, [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }], s)
  }
  assert.ok(v.redirects.some((r) => r.source === '/our-work' && r.destination === '/creator-showcase' && r.permanent === true), '/our-work redirect intact')
  assert.ok(v.redirects.some((r) => r.source === '/creative-testing-sprint' && r.destination === '/pricing' && r.permanent === true))
  assert.ok(v.headers.some((h) => h.source === '/creator-onboarding/:path*' && h.headers.some((x) => x.key === 'X-Robots-Tag')), 'private-page protection intact')
  assert.deepEqual(v.regions, ['fra1'])
})
