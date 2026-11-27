// Run with: node --test tests/legal-translations.test.mjs  (the page checks read dist/: run `npm run build` first)
// Spanish, French and Arabic Privacy Policy, Terms and Conditions and Legal Notice (src/content/legal/*.js), translated from the English documents (src/content/trustPages.js).
// These tests prove STRUCTURAL fidelity (same sections, clauses, links, numbers and identifiers) and the PUBLISHED state (with a simulated hold); they cannot prove legal equivalence of meaning: that is the reviewer's job
// (clause-level comparison in the review folder). Nothing here touches the network.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { TRUST_CONTENT, plainText, ownerMarkersIn, LEGAL_DATES } from '../src/content/trustPages.js'
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
    es: ['Política de privacidad', 'Términos y condiciones', 'Aviso legal'], // navigation / footer / SEO names (the approved ones)
    fr: ['Politique de confidentialité', 'Conditions générales', 'Mentions légales'],
    ar: ['سياسة الخصوصية', 'الشروط والأحكام', 'الإشعار القانوني'],
  }
  for (const [l, names] of Object.entries(expected)) {
    const out = BUILDERS[l](ctx)
    // OWNER DECISION PENDING (27 Nov 2026): the professionally localized Spanish copy titles the Terms «Condiciones generales» while the approved navigation/footer/SEO name is «Términos y condiciones». Implemented as supplied; the h1 differs from the navigation name for Spanish only. Align one of them once the owner chooses.
    const h1s = l === 'es' ? [names[0], 'Condiciones generales', names[2]] : names
    assert.deepEqual([out.privacy.h1, out.terms.h1, out.legalNotice.h1], h1s, l)
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
    const date = { es: '27 de noviembre de 2026', fr: '27 novembre 2026', ar: '27 نوفمبر 2026' }[l]
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

// ── published state (the owner approved the translations on 27 Nov 2026) ─────────────────────────────────────
test('PUBLISHED (LEGAL_TRANSLATIONS_APPROVED): indexable, self-canonical, reciprocal hreflang, in the sitemap, no review notice, one h1, unique heading ids', () => {
  assert.equal(LEGAL_TRANSLATIONS_APPROVED, true, 'the owner approved publishing the es/fr/ar legal translations (27 Nov 2026)')
  const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8')
  for (const l of ['es', 'fr', 'ar']) for (const bp of ['/privacy', '/terms', '/legal-notice']) {
    const p = `/${l}${bp}`, h = page(p)
    assert.ok(isReleased(l, bp) && !releaseBlocker(l, bp), p)
    assert.ok(!/name="robots"/.test(h), `${p}: indexable (no robots meta)`)
    assert.match(h, new RegExp(`<link rel="canonical" href="${SITE_URL}${p}"`), `${p} self-canonical`)
    assert.ok(sm.includes(`${SITE_URL}${p}</loc>`), `${p}: in the sitemap`)
    assert.ok(!/role="note"/.test(h), `${p}: no review notice`)
    assert.ok(!/Traducción en revisión|Traduction en cours de relecture|الترجمة قيد المراجعة/.test(h), `${p}: the review wording is gone`)
    assert.match(h, new RegExp(`<html lang="${l === 'fr' ? 'fr-FR' : l}"`))
    assert.equal((h.match(/<h1[ >]/g) ?? []).length, 1)
    // reciprocal hreflang: the identical five-entry set on the English document and on all three translations
    const set = (x) => [...x.slice(0, x.indexOf('<body')).matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`).join('|')
    assert.equal(set(h), set(page(bp)), `${p}: reciprocal hreflang set equals the English document's`)
    assert.equal(set(h), ['en', 'es', 'fr-FR', 'ar'].map((c) => `${c} ${SITE_URL}${c === 'en' ? '' : `/${c === 'fr-FR' ? 'fr' : c}`}${bp}`).concat(`x-default ${SITE_URL}${bp}`).join('|'), `${p}: en, es, fr-FR, ar, x-default (English)`)
    // unique, working section ids (Arabic headings contain no Latin letters)
    const ids = [...h.matchAll(/<h2 id="(trust-s\d+)"/g)].map((m) => m[1])
    assert.ok(ids.length >= 7 && new Set(ids).size === ids.length, `${p}: unique heading ids`)
  }
  for (const bp of ['/privacy', '/terms', '/legal-notice']) {
    assert.equal(alternatesFor(bp, SITE_SEO[bp]).length, 5, `English ${bp} carries the reciprocal set`)
    assert.equal(switchTarget('es', bp), `/es${bp}`); assert.equal(switchTarget('fr', bp), `/fr${bp}`); assert.equal(switchTarget('ar', bp), `/ar${bp}`)
    assert.ok(sm.includes(`${SITE_URL}${bp}</loc>`), `English ${bp} stays in the sitemap`)
  }
})

test('links when published: footer and forms point to the visitor\'s own language, never labelled as English', () => {
  for (const l of ['es', 'fr', 'ar']) {
    for (const k of ['privacy', 'terms', 'legalNotice']) {
      const t = trustLink(k, l)
      assert.equal(t.href, `/${l}/${{ privacy: 'privacy', terms: 'terms', legalNotice: 'legal-notice' }[k]}`); assert.equal(t.lang, undefined); assert.equal(t.label, TRUST_NAMES[l][k])
      assert.ok(!/\(en inglés\)|\(en anglais\)|\(بالإنجليزية\)/.test(t.label), `${l} ${k}: no "in English" label`)
    }
    assert.equal(trustLink('about', l).href, `/${l}/about`); assert.equal(trustLink('contact', l).href, `/${l}/contact`)
  }
  assert.deepEqual(trustLink('terms', 'en'), { href: '/terms', label: 'Terms and Conditions', lang: undefined })
  assert.match(page('/es/pricing'), /href="\/es\/privacy"[^>]*>Política de privacidad<\/a>/)
  assert.match(page('/fr'), /href="\/fr\/privacy"[^>]*>Politique de confidentialité<\/a>/)
  assert.match(page('/ar/pricing'), /href="\/ar\/privacy"[^>]*>سياسة الخصوصية<\/a>/)
  assert.ok(!/href="\/privacy"[^>]*lang="en"/.test(page('/es/pricing')), 'no English-labelled privacy link left on a Spanish page')
})

// ── the held state, still provable by simulation (flip the one flag back; the real files are never touched) ──
test('SIMULATED hold: flipping the single flag back to false holds the nine documents again (blocked, noindex, no hreflang, not in the sitemap, English links labelled, selector falls back to the language home)', async () => {
  const sim = path.join(ROOT, 'node_modules', '.convrt-legal-held-sim')
  fs.rmSync(sim, { recursive: true, force: true })
  fs.cpSync(path.join(ROOT, 'src'), path.join(sim, 'src'), { recursive: true })
  const cfgPath = path.join(sim, 'src/config.js')
  const cfg = fs.readFileSync(cfgPath, 'utf8')
  assert.ok(cfg.includes('LEGAL_TRANSLATIONS_APPROVED = true'))
  fs.writeFileSync(cfgPath, cfg.replace('LEGAL_TRANSLATIONS_APPROVED = true', 'LEGAL_TRANSLATIONS_APPROVED = false'))
  try {
    const url = (f) => pathToFileURL(path.join(sim, f)).href
    const rel = await import(url('src/i18n/release.js'))
    const seo = await import(url('src/seo/siteSeo.js'))
    const links = await import(url('src/i18n/trustLinks.js'))
    const sw = await import(url('src/i18n/switch.js'))
    const sitemap = await import(url('src/lib/seo/sitemap.js'))
    for (const l of ['es', 'fr', 'ar']) for (const bp of ['/privacy', '/terms', '/legal-notice']) {
      assert.ok(!rel.isReleased(l, bp) && rel.releaseBlocker(l, bp)?.reason, `${l}${bp} held`)
      assert.ok(!sitemap.localizedSitemapPaths().includes(`/${l}${bp}`), `${l}${bp} not in the sitemap`)
      assert.equal(sw.switchTarget(l, bp), `/${l}/`)
    }
    for (const l of ['es', 'fr', 'ar']) {
      const held = links.trustLink('privacy', l)
      assert.equal(held.href, '/privacy'); assert.equal(held.lang, 'en'); assert.match(held.label, /\(en inglés\)|\(en anglais\)|\(بالإنجليزية\)/)
    }
    assert.deepEqual(seo.pageHead('/privacy', 'en').alternates ?? [], [], 'the English document carries no hreflang to a held translation')
  } finally {
    fs.rmSync(sim, { recursive: true, force: true })
  }
})

test('review material exists: the repository note and the code that produces the comparison; the full translations are the three modules', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'docs/contact-about-legal-localization.md')))
  for (const f of ['es', 'fr', 'ar']) assert.ok(fs.existsSync(path.join(ROOT, `src/content/legal/${f}.js`)))
  assert.ok(fs.existsSync(path.join(ROOT, 'scripts/legal-structure-check.mjs')))
})

test('each legal document has its OWN last-updated date, the translations carry the same date as their English document', () => {
  assert.deepEqual(Object.keys(LEGAL_DATES).sort(), ['legalNotice', 'privacy', 'terms'])
  const parts = (en) => en.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/).slice(1)
  for (const doc of DOCS) {
    assert.match(LEGAL_DATES[doc], /^\d{1,2} [A-Z][a-z]+ \d{4}$/, `${doc} date is a plain date`)
    assert.ok(TRUST_CONTENT[doc].intro.includes(`Last updated ${LEGAL_DATES[doc]}.`), `${doc}: the English intro shows its own date`)
    const [day, , year] = parts(LEGAL_DATES[doc])
    for (const [l, build] of Object.entries(BUILDERS)) {
      const intro = build({ ...ctx, analyticsActive: false })[doc].intro
      assert.ok(intro.includes(day) && intro.includes(year), `${l}/${doc}: the translation shows the English document's own date (${day} … ${year})`)
    }
  }
})
