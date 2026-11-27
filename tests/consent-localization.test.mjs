/* The cookie banner and preferences dialog in Spanish, French and Arabic: the owner-approved wording (27 Nov 2026), the localized Privacy Policy link, and proof that the
   consent behaviour itself (categories, defaults, choices) was not touched by the translation. */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DICTIONARIES } from '../src/i18n/dictionaries.js'
import { translate } from '../src/i18n/tr.js'
import { trustLink } from '../src/i18n/trustLinks.js'
import { DENIED_CHOICE, GRANTED_CHOICE } from '../src/lib/consent.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = fs.readFileSync(path.join(ROOT, 'src/components/ConsentManager.jsx'), 'utf8')

const KEYS = [
  'Cookie consent', 'Cookies on CONVRT.', 'We would like to use analytics cookies to see which pages lead to enquiries. They stay off unless you accept.', 'Privacy policy',
  'Accept all', 'Reject all', 'Preferences', 'Cookie preferences', 'Choose which optional cookies CONVRT may use. You can change this at any time from “Cookie settings” in the footer.',
  'Necessary', 'Remembers your choice here and keeps the site and forms working. Always on.', 'Analytics',
  'Helps us understand which pages are visited and which lead to enquiries (Google Analytics through Google Tag Manager).', 'Marketing',
  'Allows advertising and measurement cookies if we ever run ads. Off unless you turn it on; the site does not set advertising cookies today. This is about cookies only: marketing emails are a separate choice on our forms.',
  'Save preferences', 'On', 'Off',
]

test('every string of the banner and the dialog exists in the source and is translated in Spanish, French and Arabic', () => {
  for (const k of KEYS) {
    assert.ok(src.includes(`tr('${k}')`), `ConsentManager.jsx wraps "${k.slice(0, 40)}" in tr()`)
    for (const l of ['es', 'fr', 'ar']) assert.ok(DICTIONARIES[l][k], `${l}: ${k.slice(0, 50)}`)
  }
  // no English UI text is left outside tr(): the visible words of the component are all dictionary keys
  for (const bare of ['>Accept all<', '>Reject all<', '>Preferences<', '>Save preferences<', '>Cookie preferences<', 'label="Necessary"', 'label="Analytics"', 'label="Marketing"', "'On' : 'Off'"]) assert.ok(!src.includes(bare), `bare English: ${bare}`)
})

test('owner-approved wording, including the corrections of 27 Nov 2026', () => {
  const es = (k) => translate('es', k), fr = (k) => translate('fr', k), ar = (k) => translate('ar', k)
  assert.equal(es('Cookie consent'), 'Consentimiento para el uso de cookies')
  assert.equal(es('Remembers your choice here and keeps the site and forms working. Always on.'), 'Guardan tus preferencias y permiten que el sitio web y los formularios funcionen correctamente. Siempre activas.')
  assert.equal(fr('Analytics'), 'Mesure d’audience')
  assert.equal(fr('Cookie preferences'), 'Préférences de cookies')
  assert.match(fr('We would like to use analytics cookies to see which pages lead to enquiries. They stay off unless you accept.'), /quelles pages génèrent des demandes de contact/)
  assert.match(fr('Helps us understand which pages are visited and which lead to enquiries (Google Analytics through Google Tag Manager).'), /lesquelles génèrent des demandes de contact/)
  assert.match(ar('We would like to use analytics cookies to see which pages lead to enquiries. They stay off unless you accept.'), /الصفحات التي تدفع الزوار إلى التواصل معنا/)
  assert.match(ar('Helps us understand which pages are visited and which lead to enquiries (Google Analytics through Google Tag Manager).'), /أيّها يدفع الزوار إلى التواصل معنا/)
  assert.equal(ar('Remembers your choice here and keeps the site and forms working. Always on.'), 'تحفظ تفضيلاتك وتضمن عمل الموقع والنماذج بشكل صحيح. مفعّلة دائمًا.')
  for (const k of KEYS) { assert.ok(!/quelles pages mènent|الصفحات التي تؤدي إلى استفسارات/.test(translate('fr', k) + translate('ar', k)), 'the replaced phrases are gone') }
  assert.equal(es('Accept all'), 'Aceptar todas'); assert.equal(fr('Reject all'), 'Tout refuser'); assert.equal(ar('Save preferences'), 'حفظ التفضيلات')
  assert.equal(es('On'), 'Activado'); assert.equal(fr('Off'), 'Désactivé'); assert.equal(ar('On'), 'مفعّل')
})

test('the Privacy Policy link goes to the visitor’s own-language policy', () => {
  assert.equal(trustLink('privacy', 'en').href, '/privacy')
  assert.equal(trustLink('privacy', 'es').href, '/es/privacy')
  assert.equal(trustLink('privacy', 'fr').href, '/fr/privacy')
  assert.equal(trustLink('privacy', 'ar').href, '/ar/privacy')
  for (const l of ['es', 'fr', 'ar']) assert.equal(trustLink('privacy', l).lang, undefined, `${l}: no lang="en" override on an own-language link`)
  assert.ok(src.includes("trustLink('privacy')") && !src.includes('href={PRIVACY_POLICY_URL}'), 'the component builds the link with trustLink')
})

test('consent behaviour is unchanged: same categories, nothing pre-ticked, same choices, same logic file', () => {
  assert.deepEqual(DENIED_CHOICE, { analytics: false, marketing: false })
  assert.deepEqual(GRANTED_CHOICE, { analytics: true, marketing: true })
  assert.ok(src.includes('<Switch id="consent-necessary" checked disabled'), 'Necessary: always on')
  assert.ok(src.includes('useState(initial.analytics)') && src.includes('useState(initial.marketing)'), 'Analytics and Marketing start from the stored choice (off by default)')
  assert.ok(src.includes('onSave(DENIED_CHOICE)') && src.includes('onSave(GRANTED_CHOICE)') && src.includes('onSave({ analytics, marketing })'))
  assert.ok(src.includes("aria-checked={checked}") && src.includes('role="switch"'), 'switch semantics kept')
  const main = fs.readFileSync(path.join(ROOT, 'src/main.jsx'), 'utf8')
  assert.ok(/ensureDictionary\(currentLocale\(\)\)[\s\S]{0,200}ConsentManager|ConsentManager[\s\S]{0,200}ensureDictionary\(currentLocale\(\)\)/.test(main), 'the banner waits for its dictionary')
})
