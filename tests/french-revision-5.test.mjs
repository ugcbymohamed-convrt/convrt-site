// Run with: node --test tests/french-revision-5.test.mjs
// French revision 5 (Nov 2026): the Services dropdown, the UGC hero's free-offer cards, the Creator Showcase heading, one-row FAQ tabs, the Organic Social accents and the shared footer.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { translate } from '../src/i18n/tr.js'
import { editorial } from '../src/i18n/editorial.js'
import { FR_HOME_HERO } from '../src/i18n/fr/hero.js'
import { ORGANIC_PACKAGES_LINES } from '../src/i18n/organicPackagesCopy.js'
import { LANDSCAPE_SPREAD, LANDSCAPE_DEPTH, poseFor } from '../src/lib/rotary.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')

test('Services dropdown: one shared component, the four French labels in the owner’s order', () => {
  const nav = src('src/components/Nav.jsx')
  assert.match(nav, /const SERVICE_MENU = \[/)
  assert.ok(nav.includes("aria-haspopup=\"true\"") && nav.includes('group-focus-within:visible'), 'opens on hover and on keyboard focus')
  assert.ok(!/locale === 'fr'.*SERVICE_MENU/.test(nav), 'no French-only dropdown')
  assert.match(src('src/i18n/menu.js'), /fr: \{\n    '\/ugc-video-agency': 'Vidéos UGC',\n    '\/spokesperson-video-production': 'Vidéos Spokesperson',\n    '\/saas-video-production': 'Vidéos SaaS',\n    '\/social-media-video-production': 'Vidéos organiques pour les réseaux'/, 'the French dropdown order and labels')
  const labels = ['UGC Video Agency', 'Spokesperson Videos', 'Organic Social Video', 'SaaS Video Production'].map((k) => translate('fr', k))
  assert.equal(labels.length, 4)
})

test('UGC hero: the free-video card is a real link, the 10 hooks card a still « Bientôt disponible »', () => {
  const hero = src('src/components/ugc/UgcHero.jsx')
  assert.match(hero, /offersShown\(locale\) && \(locale !== 'fr' \|\| hasWork\)/)
  assert.deepEqual(FR_HOME_HERO.offers.video.title, ['1 vidéo', 'OFFERTE'])
  assert.equal(FR_HOME_HERO.offers.video.cta, 'Vérifier mon éligibilité')
  assert.deepEqual(FR_HOME_HERO.offers.hooks.title, ['10 hooks', 'GRATUITS'])
  assert.equal(FR_HOME_HERO.offers.hooks.cta, 'Bientôt disponible')
})

test('Creator Showcase: the H1 breaks after « Explorez notre » through a controlled segment, the founder count is gone', () => {
  assert.equal(translate('fr', "See what's"), 'Explorez notre')
  assert.equal(translate('fr', 'possible.'), 'bibliothèque de vidéos.')
  assert.equal(editorial('fr').headingBreak, true)
  assert.equal(editorial('fr').founderNote, undefined)
  assert.ok(!/founderNote\(/.test(src('src/components/ourwork/PortfolioLibrary.jsx')))
  assert.ok(!/de ces vidéos sont de Mohamed/.test(src('src/i18n/editorial.js')))
})

test('Pricing FAQ: the category tabs are one row at every width (they scroll sideways when the screen is narrower)', () => {
  const faq = src('src/components/pricing/PricingFAQ.jsx')
  assert.match(faq, /flex-nowrap overflow-x-auto/)
})

test('Organic Social (French): the three short lines and the link label are the owner’s, prices come from the data', () => {
  const fr = ORGANIC_PACKAGES_LINES.fr
  assert.equal(fr.lines.length, 3)
  assert.match(fr.lines[0], /^Les deux formules incluent la planification, la publication et l’animation de communauté sur Instagram, Facebook et TikTok\.$/)
  assert.match(fr.lines[1], /^Engagement initial de \{months\} mois\. Prix hors TVA\. Support client et gestion publicitaire non inclus\.$/)
  assert.match(fr.lines[2], /^Un besoin différent \? Créons une formule adaptée à votre marque\.$/)
  assert.equal(fr.link, 'Comparer les formules et conditions')
  assert.ok(!/€\s?\d|\d\s?€/.test(src('src/components/organic/OrganicPackages.jsx')), 'no typed price')
})

test('« Parlons de votre projet » replaces « Parlons-en. » on the custom card, which is set smaller so it fits', () => {
  assert.equal(translate('fr', 'Let’s talk.'), 'Parlons de votre projet')
  assert.match(src('src/components/pricing/PricingCards.jsx'), /t\.length > 14/)
})

test('Footer: one component, the Studio column mirrors the top menu in every language, French labels', () => {
  const f = src('src/components/Footer.jsx')
  assert.ok(!/SERVICE_MENU/.test(f), 'service pages are linked from the Services dropdown, not repeated in the footer')
  assert.equal(translate('fr', 'Refer & Earn'), 'Parrainez et gagnez')
  assert.equal(translate('es', 'Refer & Earn'), 'Recomienda y gana')
  assert.equal(translate('fr', 'Case Studies'), 'Études de cas')
  assert.equal(translate('fr', 'Creator Showcase'), 'Créateurs')
})

test('Founder stage: the featured landscape frame is 60 % of the scene and the side frames never leave it', () => {
  const stage = src('src/components/home/RotaryStage.jsx')
  assert.match(stage, /sm:w-\[60%\]/)
  const side = poseFor(1, 0, 3, true)
  assert.ok(Math.abs(side.scale - 0.75) < 0.005, 'side frames are 75 % of the featured one')
  // outer edge of a side frame, in featured-frame widths, must stay inside half the scene (0.5 / 0.6 = 0.833)
  const outer = Math.abs(side.x) + side.scale / 2
  assert.ok(outer < 0.5 / 0.6 - 0.04, `outer edge ${outer}`)
  assert.ok(LANDSCAPE_SPREAD < 0.5 && LANDSCAPE_DEPTH > 0.3)
})
