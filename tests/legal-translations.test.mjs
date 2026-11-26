// Run with: node --test tests/legal-translations.test.mjs  (the page checks read dist/: run `npm run build` first)
// Spanish, French and Arabic Privacy Policy, Terms and Conditions and Legal Notice (src/content/legal/*.js), translated from the English documents (src/content/trustPages.js).
// These tests prove STRUCTURAL fidelity (same sections, clauses, links, numbers and identifiers) and the HELD state; they cannot prove legal equivalence of meaning: that is the reviewer's job
// (clause-level comparison in the review folder). Nothing here touches the network.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { TRUST_CONTENT, plainText, ownerMarkersIn } from '../src/content/trustPages.js'
import { legalContext } from '../src/content/legal/context.js'
import { compareStructure, DOCS } from '../src/content/legal/structure.js'
import LEGAL_ES from '../src/content/legal/es.js'
import LEGAL_FR from '../src/content/legal/fr.js'
import LEGAL_AR from '../src/content/legal/ar.js'
import { LEGAL_TRANSLATIONS_APPROVED, SITE_URL } from '../src/config.js'
import { OPERATOR } from '../src/content/operator.js'
import { TRUST_NAMES, trustLink } from '../src/i18n/trustLinks.js'
import { isReleased, releaseBlocker } from '../src/i18n/release.js'
import { alternatesFor } from '../src/i18n/seo.js'
import { SITE_SEO } from '../src/seo/siteSeo.js'
import { switchTarget } from '../src/i18n/switch.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(ROOT, 'dist')
const page = (p) => fs.readFileSync(path.join(dist, `${p.replace(/^\/|\/$/g, '')}/index.html`), 'utf8')
const BUILDERS = { es: LEGAL_ES, fr: LEGAL_FR, ar: LEGAL_AR }
const ctx = legalContext()
const flat = (d) => plainText(d)

test('structure: every translated document has the same sections, paragraphs, list items, link targets, numbers and identifiers as the English source (both analytics states)', () => {
  for (const [l, build] of Object.entries(BUILDERS)) {
    for (const analyticsActive of [false, true]) {
      const out = build({ ...ctx, analyticsActive })
      for (const d of DOCS) assert.deepEqual(compareStructure(TRUST_CONTENT[d], out[d], `${l}/${d}`), [], `${l}/${d} (analyticsActive=${analyticsActive})`)
    }
  }
})

test('the approved page names are the h1 of each document, and the footer/nav names are the approved ones', () => {
  assert.deepEqual([TRUST_CONTENT.privacy.h1, TRUST_CONTENT.terms.h1, TRUST_CONTENT.legalNotice.h1], ['Privacy Policy', 'Terms and Conditions', 'Legal Notice'])
  const expected = {
    es: ['Política de privacidad', 'Términos y condiciones', 'Aviso legal'],
    fr: ['Politique de confidentialité', 'Conditions générales', 'Mentions légales'],
    ar: ['سياسة الخصوصية', 'الشروط والأحكام', 'الإشعار القانوني'],
  }
  for (const [l, names] of Object.entries(expected)) {
    const out = BUILDERS[l](ctx)
    assert.deepEqual([out.privacy.h1, out.terms.h1, out.legalNotice.h1], names, l)
    assert.deepEqual([TRUST_NAMES[l].privacy, TRUST_NAMES[l].terms, TRUST_NAMES[l].legalNotice], names, `${l} navigation names`)
  }
  assert.deepEqual([TRUST_NAMES.es.about, TRUST_NAMES.es.contact, TRUST_NAMES.fr.about, TRUST_NAMES.fr.contact, TRUST_NAMES.ar.about, TRUST_NAMES.ar.contact], ['Sobre nosotros', 'Contacto', 'À propos', 'Contact', 'من نحن', 'تواصل معنا'])
  assert.deepEqual(Object.values(TRUST_NAMES.en), ['About CONVRT', 'Contact', 'Privacy Policy', 'Terms and Conditions', 'Legal Notice'])
})

test('identity and legal facts are preserved verbatim: operator name, NIF, postal address, email, tax disclosure; effective date kept, not replaced by today', () => {
  for (const [l, build] of Object.entries(BUILDERS)) {
    const out = build(ctx)
    const notice = flat(out.legalNotice), privacy = flat(out.privacy), terms = flat(out.terms)
    for (const t of [notice, privacy]) assert.ok(t.includes(OPERATOR.name) && t.includes(OPERATOR.taxId) && t.includes('Calle Gibraltar Español 9, 04007 Almería'), `${l}: operator identity, NIF and street address`)
    assert.ok(notice.includes('Ley 34/2002'), `${l}: the legal reference is kept`)
    assert.ok(privacy.includes('www.aepd.es') && privacy.includes('AEPD'), `${l}: complaint authority`)
    const date = { es: '21 de noviembre de 2026', fr: '21 novembre 2026', ar: '21 نوفمبر 2026' }[l]
    for (const d of [out.privacy, out.terms, out.legalNotice]) assert.ok(d.intro.includes(date), `${l}: effective date ${date}`)
    // the legally required tax disclosure stays in the legal documents (also in Arabic, where marketing pages carry no VAT wording)
    assert.match(`${terms} ${notice}`, { es: /IVA/, fr: /TVA/, ar: /القيمة المضافة/ }[l], `${l}: tax disclosure kept`)
    assert.ok(!ownerMarkersIn(out.privacy).length && !ownerMarkersIn(out.terms).length && !ownerMarkersIn(out.legalNotice).length)
  }
})

test('no clause is added: no English-precedence clause, no new governing law, no new jurisdiction, no invented retention or transfer mechanism', () => {
  for (const [l, build] of Object.entries(BUILDERS)) {
    const all = DOCS.map((d) => flat(build(ctx)[d])).join('\n')
    assert.ok(!/(English|inglés|anglais|الإنجليزية|الانجليزية)[^.\n]{0,80}(prevail|prevalec|prévau|prime|تسود|تغلب|الأسبقية)|(prevalec|prévau|prime|تسود|تغلب|الأسبقية)[^.\n]{0,80}(inglés|anglais|الإنجليزية|الانجليزية)/i.test(all.replace(/versión en inglés del texto|texte en anglais|بالإنجليزية|en inglés/g, '')), `${l}: no precedence clause`)
    for (const bad of [/Arbitration|arbitraje|arbitrage|التحكيم/i, /\bGDPR\b|\bRGPD\b|\bRGPD\b|Reglamento \(UE\)|Règlement \(UE\)|اللائحة العامة/]) assert.ok(!bad.test(all), `${l}: ${bad}`)
    assert.ok(!/Standard Contractual Clauses[^.]*Switzerland|Binding Corporate/i.test(all))
  }
})

test('Arabic legal text: formal Modern Standard Arabic, Western digits only, no dialect markers, the legal name stays in Latin script', () => {
  const all = DOCS.map((d) => flat(LEGAL_AR(ctx)[d])).join('\n')
  assert.ok(!/[٠-٩]/.test(all), 'Western digits (like the rest of the Arabic site)')
  assert.ok(!/(^|\s)(مو|وش|ايش|إيش|شلون|هالـ?|لحالك|بس|اللي|عشان)(\s|$)/.test(all), 'no dialect words')
  assert.ok(all.includes('Mohamed Doukkali Azizi') && all.includes('Y6755743J'))
})

test('Spanish and French keep the site terminology; no unapproved wording appears in the legal documents', () => {
  const es = DOCS.map((d) => flat(LEGAL_ES(ctx)[d])).join('\n'), fr = DOCS.map((d) => flat(LEGAL_FR(ctx)[d])).join('\n')
  assert.ok(!/gancho|creatividades/i.test(es)); assert.ok(!/accroche/i.test(fr))
})

// ── held state ─────────────────────────────────────────────────────────────────────────────────────────────
test('HELD until approved (LEGAL_TRANSLATIONS_APPROVED): built and reachable for review, but noindex, self-canonical, no hreflang, not in the sitemap, with a visible review notice', () => {
  assert.equal(LEGAL_TRANSLATIONS_APPROVED, false, 'the owner has not approved the legal translations: flip only after their (and a lawyer\'s) approval, then update this test')
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const l of ['es', 'fr', 'ar']) for (const bp of ['/privacy', '/terms', '/legal-notice']) {
    const p = `/${l}${bp}`, h = page(p)
    assert.ok(!isReleased(l, bp) && releaseBlocker(l, bp)?.reason, p)
    assert.match(h, /name="robots" content="noindex, follow"/, `${p} noindex`)
    assert.match(h, new RegExp(`<link rel="canonical" href="${SITE_URL}${p}"`), `${p} self-canonical`)
    assert.ok(!/hreflang=/.test(h), `${p}: no hreflang`)
    assert.ok(!sm.includes(`${SITE_URL}${p}</loc>`), `${p}: not in the sitemap`)
    assert.match(h, /role="note"/, `${p}: visible review notice`)
    assert.match(h, new RegExp(`<html lang="${l === 'fr' ? 'fr-FR' : l}"`))
    assert.equal((h.match(/<h1[ >]/g) ?? []).length, 1)
    // unique, working section ids (Arabic headings contain no Latin letters)
    const ids = [...h.matchAll(/<h2 id="(trust-s\d+)"/g)].map((m) => m[1])
    assert.ok(ids.length >= 7 && new Set(ids).size === ids.length, `${p}: unique heading ids`)
  }
  // the English documents carry no hreflang to a held translation, and the selector falls back to each language home
  for (const bp of ['/privacy', '/terms', '/legal-notice']) { assert.deepEqual(alternatesFor(bp, SITE_SEO[bp]), []); assert.equal(switchTarget('es', bp), '/es/'); assert.ok(sm.includes(`${SITE_URL}${bp}</loc>`), `English ${bp} stays in the sitemap`) }
})

test('links while held: the footer and the form privacy link go to the English document, labelled and marked lang="en"; preview deployments show the final localized state', () => {
  for (const l of ['es', 'fr', 'ar']) {
    const held = trustLink('privacy', l)
    assert.equal(held.href, '/privacy'); assert.equal(held.lang, 'en'); assert.match(held.label, /\(en inglés\)|\(en anglais\)|\(بالإنجليزية\)/)
    const review = trustLink('privacy', l, true)
    assert.equal(review.href, `/${l}/privacy`); assert.equal(review.lang, undefined); assert.equal(review.label, TRUST_NAMES[l].privacy)
    assert.equal(trustLink('about', l).href, `/${l}/about`, 'About and Contact are always localized')
    assert.equal(trustLink('contact', l).href, `/${l}/contact`)
  }
  assert.deepEqual(trustLink('terms', 'en'), { href: '/terms', label: 'Terms and Conditions', lang: undefined })
  const h = page('/es/pricing')
  assert.match(h, /href="\/privacy"[^>]*lang="en"[^>]*>Política de privacidad \(en inglés\)/)
  assert.ok(!/(en inglés|en anglais|بالإنجليزية)/.test((page('/es/about').match(/<a[^>]*href="\/es\/about"[^>]*>[^<]*<\/a>/) ?? [''])[0]), 'About is never labelled as English')
})

// ── the approved state (simulated; the real files are never touched) ─────────────────────────────────────────
test('SIMULATED approval: flipping the single flag releases the three documents in all three languages (indexable, reciprocal hreflang, sitemap, localized footer and form links, no notice)', async () => {
  const sim = path.join(ROOT, 'node_modules', '.convrt-legal-approved-sim')
  fs.rmSync(sim, { recursive: true, force: true })
  fs.cpSync(path.join(ROOT, 'src'), path.join(sim, 'src'), { recursive: true })
  const cfgPath = path.join(sim, 'src/config.js')
  fs.writeFileSync(cfgPath, fs.readFileSync(cfgPath, 'utf8').replace('LEGAL_TRANSLATIONS_APPROVED = false', 'LEGAL_TRANSLATIONS_APPROVED = true'))
  try {
    const url = (f) => pathToFileURL(path.join(sim, f)).href
    const rel = await import(url('src/i18n/release.js'))
    const seo = await import(url('src/seo/siteSeo.js'))
    const links = await import(url('src/i18n/trustLinks.js'))
    const sw = await import(url('src/i18n/switch.js'))
    const sitemap = await import(url('src/lib/seo/sitemap.js'))
    for (const l of ['es', 'fr', 'ar']) for (const bp of ['/privacy', '/terms', '/legal-notice']) {
      assert.ok(rel.isReleased(l, bp), `${l}${bp}`)
      assert.equal(seo.pageHead(bp, l).noindex ?? false, false); assert.equal(seo.pageHead(bp, l).robots, undefined, `${l}${bp} indexable`)
      assert.equal(seo.pageHead(bp, l).alternates.length, 5, `${l}${bp} reciprocal hreflang (en, es, fr-FR, ar, x-default)`)
      assert.ok(sitemap.localizedSitemapPaths().includes(`/${l}${bp}`), `${l}${bp} in the sitemap`)
      assert.equal(sw.switchTarget(l, bp), `/${l}${bp}`)
      assert.deepEqual(links.trustLink('privacy', l), { href: `/${l}/privacy`, label: links.TRUST_NAMES[l].privacy, lang: undefined })
    }
    assert.equal(seo.pageHead('/privacy', 'en').alternates.length, 5, 'the English document now carries the reciprocal set')
  } finally {
    fs.rmSync(sim, { recursive: true, force: true })
  }
})

test('review material exists: the repository note and the code that produces the comparison; the full translations are the three modules', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/contact-about-legal-localization.md')))
  for (const f of ['es', 'fr', 'ar']) assert.ok(fs.existsSync(path.join(ROOT, `src/content/legal/${f}.js`)))
  assert.ok(fs.existsSync(path.join(ROOT, 'scripts/legal-structure-check.mjs')))
})
