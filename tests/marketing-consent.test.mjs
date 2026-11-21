// Run with: node --test tests/marketing-consent.test.mjs
// Marketing-email consent across every MailerLite form: free hooks, free video application,
// referral registration. Everything runs against a FAKE MailerLite + Resend (injected fetch):
// no network, no real credentials, no real subscribers, no real emails.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { processSignup, MAILERLITE_ENDPOINT } from '../api/_lib/subscribe.js'
import { processApplication } from '../api/_lib/apply.js'
import { processReferral } from '../api/_lib/referral.js'
import { RESEND_ENDPOINT } from '../api/_lib/notify.js'
import { CONSENT_FIELD_KEYS, MARKETING_GROUP_ENV, readConsent } from '../api/_lib/marketing.js'
import {
  CONSENT_SOURCES,
  CURRENT_MARKETING_CONSENT_VERSION,
  MARKETING_CONSENT_VERSIONS,
  isKnownConsentVersion,
  marketingConsentText,
} from '../src/content/marketingConsent.js'
import { EMPTY_APPLICATION, validateApplication } from '../src/lib/riskFreeQuestions.js'
import { EMPTY_REFERRAL, PROGRAMS, validateReferral } from '../src/lib/referralProgram.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

const NOW = () => new Date('2026-11-21T10:15:30.000Z')
const AT = '2026-11-21T10:15:30.000Z'
const MARKETING_GROUP = '999'
const ENV = {
  MAILERLITE_API_TOKEN: 'test-token',
  MAILERLITE_GROUP_SAAS_ID: '111',
  MAILERLITE_GROUP_ECOMMERCE_ID: '222',
  MAILERLITE_GROUP_RISK_FREE_ID: '333',
  MAILERLITE_GROUP_REFERRALS_ID: '444',
  [MARKETING_GROUP_ENV]: MARKETING_GROUP,
  RESEND_API_KEY: 'k',
}

/* One fake fetch for both services. `mlSequence` answers successive MailerLite calls. */
function fake({ ml = [{ status: 201, payload: { data: { id: '1', status: 'active' } } }], resendStatus = 200 } = {}) {
  const calls = []
  let n = 0
  const fn = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push({ url, body })
    if (url === RESEND_ENDPOINT) return { status: resendStatus, headers: { get: () => null }, json: async () => ({}) }
    const r = ml[Math.min(n++, ml.length - 1)]
    return { status: r.status, headers: { get: () => null }, json: async () => r.payload }
  }
  fn.ml = () => calls.filter((c) => c.url === MAILERLITE_ENDPOINT).map((c) => c.body)
  fn.alert = () => calls.find((c) => c.url === RESEND_ENDPOINT)?.body
  return fn
}

const application = (over = {}) => ({
  businessType: 'SaaS / Software',
  adSpend: 'Not running paid ads yet',
  videosPerMonth: '0–2 videos',
  videoType: 'UGC / Creator-led ad',
  timeline: 'Immediately / This month',
  ongoing: 'Possibly, depending on the results',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  website: 'example.com',
  brief: '',
  ...over,
})
const partner = (over = {}) => ({
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  partnerType: 'Consultant',
  program: PROGRAMS.standard,
  consent: true,
  ...over,
})

/* The three forms behind one interface: [name, source, service group, run(body, f, env)]. */
const FORMS = [
  ['free hooks (SaaS)', 'free-hooks-saas', '111', (b, f, env = ENV) => processSignup({ body: { industry: 'saas', email: 'jane@example.com', ...b }, env, fetchImpl: f, now: NOW })],
  ['free hooks (e-commerce)', 'free-hooks-ecommerce', '222', (b, f, env = ENV) => processSignup({ body: { industry: 'ecommerce', email: 'jane@example.com', ...b }, env, fetchImpl: f, now: NOW })],
  ['free video application', 'risk-free-application', '333', (b, f, env = ENV) => processApplication({ body: { ...application(), ...b }, env, fetchImpl: f, now: NOW })],
  ['referral registration', 'referral-application', '444', (b, f, env = ENV) => processReferral({ body: { ...partner(), ...b }, env, fetchImpl: f, now: NOW })],
]
const CONSENT = { marketingConsent: true, marketingConsentVersion: CURRENT_MARKETING_CONSENT_VERSION }

/* ───────── the wording and its version ───────── */

test('wording is versioned, current version exists and every text is pinned (edit = new version)', () => {
  assert.equal(CURRENT_MARKETING_CONSENT_VERSION, 'v2')
  assert.deepEqual(Object.keys(MARKETING_CONSENT_VERSIONS), ['v1', 'v2'])
  assert.equal(MARKETING_CONSENT_VERSIONS.v1.text, 'Also send me occasional creative tips and offers from CONVRT. (Optional)')
  assert.equal(
    MARKETING_CONSENT_VERSIONS.v2.text,
    'Also email me occasional creative tips and offers from CONVRT. You can unsubscribe at any time. (Optional)',
  )
  assert.equal(marketingConsentText(), MARKETING_CONSENT_VERSIONS.v2.text)
  assert.ok(isKnownConsentVersion('v1') && isKnownConsentVersion('v2'))
  for (const bad of ['v3', '', undefined, null, 2, '__proto__', 'toString']) assert.equal(isKnownConsentVersion(bad), false, String(bad))
})

test('the wording is optional by its own words and never promises anything outside marketing', () => {
  for (const v of Object.values(MARKETING_CONSENT_VERSIONS)) {
    assert.match(v.text, /\(Optional\)/)
    assert.match(v.text, /tips and offers/)
  }
})

/* ───────── consent ACCEPTED ───────── */

for (const [name, source, serviceGroup, go] of FORMS) {
  test(`${name}: consent accepted → service group + marketing group + consent record, in ONE request`, async () => {
    const f = fake()
    const r = await go(CONSENT, f)
    assert.equal(r.status, 200)
    const [sent] = f.ml()
    assert.equal(f.ml().length, 1)
    assert.deepEqual(sent.groups, [serviceGroup, MARKETING_GROUP])
    assert.equal(sent.fields[CONSENT_FIELD_KEYS.status], 'opted_in')
    assert.equal(sent.fields[CONSENT_FIELD_KEYS.at], AT)
    assert.equal(sent.fields[CONSENT_FIELD_KEYS.version], 'v2')
    assert.equal(sent.fields[CONSENT_FIELD_KEYS.source], source)
    assert.equal('status' in sent, false, 'never sends status')
    assert.equal('resubscribe' in sent, false, 'never resubscribes')
    // the owner alert is the second, independent record
    const alert = f.alert()
    assert.ok(alert.text.includes('Marketing emails (optional box): YES'))
    assert.ok(alert.text.includes(AT) && alert.text.includes('wording v2') && alert.text.includes(source))
  })
}

test('the response body never reveals consent details to the browser', async () => {
  for (const [, , , go] of FORMS) {
    const r = await go(CONSENT, fake())
    assert.ok(!JSON.stringify(r.body).match(/consent|opted|marketing|v2|2026/i), JSON.stringify(r.body))
  }
})

/* ───────── consent DECLINED: the form still succeeds, nothing marketing is written ───────── */

for (const [name, , serviceGroup, go] of FORMS) {
  for (const [label, extra] of [
    ['box left unticked (false)', { marketingConsent: false }],
    ['field absent', {}],
    ['truthy but not exactly true ("true")', { marketingConsent: 'true', marketingConsentVersion: 'v2' }],
    ['truthy but not exactly true (1)', { marketingConsent: 1, marketingConsentVersion: 'v2' }],
  ]) {
    test(`${name}: consent declined (${label}) → submission succeeds, service group only, no consent fields`, async () => {
      const f = fake()
      const r = await go(extra, f)
      assert.equal(r.status, 200)
      assert.equal(r.body.ok, true)
      const [sent] = f.ml()
      assert.deepEqual(sent.groups, [serviceGroup])
      assert.ok(!sent.groups.includes(MARKETING_GROUP))
      for (const key of Object.values(CONSENT_FIELD_KEYS)) assert.equal(sent.fields?.[key], undefined, key)
      assert.ok(f.alert().text.includes('Marketing emails (optional box): Not ticked'), 'owner is told they declined')
    })
  }
}

test('declining never overwrites an earlier opt-in: a declined request carries no consent keys at all', async () => {
  for (const [, , , go] of FORMS) {
    const f = fake({ ml: [{ status: 200, payload: { data: { status: 'active' } } }] })
    await go({ marketingConsent: false }, f)
    assert.ok(!JSON.stringify(f.ml()[0]).includes('marketing_consent'))
  }
})

test('free hooks: the requested resource is delivered by the service group whether or not the box is ticked', async () => {
  for (const consentBody of [{}, CONSENT]) {
    const f = fake()
    await FORMS[0][3](consentBody, f)
    assert.ok(f.ml()[0].groups.includes('111'), 'the delivery automation fires on the SaaS hooks group')
    assert.equal(f.alert() !== undefined, true, 'owner notification still sent')
  }
})

test('owner notification and transactional flow are unchanged by the box (same rows, same recipient)', async () => {
  for (const [, , , go] of FORMS) {
    const a = fake()
    const b = fake()
    await go({}, a)
    await go(CONSENT, b)
    assert.deepEqual(a.alert().to, b.alert().to)
    assert.equal(a.alert().reply_to, b.alert().reply_to)
  }
})

/* ───────── fail closed ───────── */

test('an unknown wording version is never recorded as consent (lead still saved, not on the marketing list)', async () => {
  for (const [, , serviceGroup, go] of FORMS) {
    for (const version of ['v9', '', 'v2 ', '../v2']) {
      const f = fake()
      const r = await go({ marketingConsent: true, marketingConsentVersion: version }, f)
      assert.equal(r.status, 200)
      assert.deepEqual(f.ml()[0].groups, [serviceGroup])
      assert.ok(!JSON.stringify(f.ml()[0]).includes('marketing_consent'))
      assert.ok(f.alert().text.includes('wording version was not recognised'))
    }
  }
})

test('applications and referrals need a version number; only the hooks endpoint accepts a request that predates versions (page cached during the release)', async () => {
  const hooks = fake()
  await FORMS[0][3]({ marketingConsent: true }, hooks)
  assert.deepEqual(hooks.ml()[0].groups, ['111', MARKETING_GROUP])
  assert.equal(hooks.ml()[0].fields[CONSENT_FIELD_KEYS.version], 'v1')

  for (const i of [2, 3]) {
    const f = fake()
    await FORMS[i][3]({ marketingConsent: true }, f)
    assert.ok(!f.ml()[0].groups.includes(MARKETING_GROUP))
  }
})

test('a source outside the known forms cannot be recorded', () => {
  assert.equal(readConsent({ marketingConsent: true, marketingConsentVersion: 'v2' }, 'somewhere-else', { now: NOW }).granted, false)
  for (const s of CONSENT_SOURCES) assert.equal(readConsent({ marketingConsent: true, marketingConsentVersion: 'v2' }, s, { now: NOW }).granted, true)
})

test('consent fields not created in MailerLite yet (422): the lead is still saved, once more WITHOUT the marketing group, and the owner is told', async () => {
  for (const [, , serviceGroup, go] of FORMS) {
    const f = fake({
      ml: [
        { status: 422, payload: { message: 'invalid', errors: { 'fields.marketing_consent': ['unknown field'] } } },
        { status: 201, payload: { data: { status: 'active' } } },
      ],
    })
    const r = await go(CONSENT, f)
    assert.equal(r.status, 200, 'the form succeeds')
    assert.equal(f.ml().length, 2)
    assert.deepEqual(f.ml()[1].groups, [serviceGroup], 'retry has no marketing group')
    assert.ok(!JSON.stringify(f.ml()[1]).includes('marketing_consent'))
    assert.ok(f.alert().text.includes('NOT recorded in MailerLite'))
    assert.ok(f.alert().text.includes('NOT on the marketing list'))
  }
})

test('a 422 about the email is not retried', async () => {
  const f = fake({ ml: [{ status: 422, payload: { errors: { email: ['bad'] } } }] })
  const r = await FORMS[0][3](CONSENT, f)
  assert.equal(r.status, 422)
  assert.equal(f.ml().length, 1)
})

test('marketing group not configured: the consent is recorded but nobody is added to a list, and the owner is told', async () => {
  const env = { ...ENV, [MARKETING_GROUP_ENV]: '' }
  for (const [, , serviceGroup, go] of FORMS) {
    const f = fake()
    const r = await go(CONSENT, f, env)
    assert.equal(r.status, 200)
    assert.deepEqual(f.ml()[0].groups, [serviceGroup])
    assert.equal(f.ml()[0].fields[CONSENT_FIELD_KEYS.status], 'opted_in')
    assert.ok(f.alert().text.includes('MAILERLITE_GROUP_MARKETING_ID is not configured'))
  }
})

test('MailerLite down or not configured: consent is not claimed as recorded; the alert still carries the time and wording', async () => {
  const down = fake({ ml: [{ status: 500, payload: { message: 'down' } }] })
  await FORMS[2][3](CONSENT, down)
  assert.ok(down.alert().text.includes('NOT recorded in MailerLite (not_saved)'))
  assert.ok(down.alert().text.includes(AT))

  const noConfig = fake()
  await FORMS[3][3](CONSENT, noConfig, { RESEND_API_KEY: 'k' })
  assert.equal(noConfig.ml().length, 0)
  assert.ok(noConfig.alert().text.includes('NOT recorded in MailerLite'))
})

test('a bot (honeypot) is not recorded as anything and sends nothing', async () => {
  const f = fake()
  await FORMS[0][3]({ ...CONSENT, company: 'Bot Inc' }, f)
  await FORMS[2][3]({ ...CONSENT, company: 'Bot Inc' }, f)
  await FORMS[3][3]({ ...CONSENT, hpCheck: 'x' }, f)
  assert.equal(f.ml().length, 0)
  assert.equal(f.alert(), undefined)
})

/* ───────── unsubscribe / withdrawal is respected ───────── */

test('an unsubscribed / bounced / junk contact is never re-subscribed, even when they tick the box', async () => {
  for (const status of ['unsubscribed', 'bounced', 'junk']) {
    for (const [, , , go] of FORMS) {
      const f = fake({ ml: [{ status: 200, payload: { data: { status } } }] })
      await go(CONSENT, f)
      for (const sent of f.ml()) {
        assert.equal('status' in sent, false)
        assert.equal('resubscribe' in sent, false)
      }
      assert.ok(f.alert().text.includes('Not re-subscribed'))
    }
  }
})

test('hooks: an unsubscribed address is told to email us (MailerLite cannot send to it), the owner is alerted to send the hooks by hand', async () => {
  const f = fake({ ml: [{ status: 200, payload: { data: { status: 'unsubscribed' } } }] })
  const r = await FORMS[0][3]({}, f)
  assert.equal(r.status, 409)
  assert.equal(r.body.error, 'cannot_subscribe')
  assert.match(f.alert().subject, /^\[NOT SAVED\]/)
})

test('applications and referrals from an unsubscribed address still succeed when the owner email is delivered', async () => {
  for (const i of [2, 3]) {
    const f = fake({ ml: [{ status: 200, payload: { data: { status: 'unsubscribed' } } }] })
    const r = await FORMS[i][3]({}, f)
    assert.equal(r.status, 200)
    assert.match(f.alert().subject, /^\[NOT IN MAILERLITE\]/)
  }
})

test('no code path ever sends a MailerLite `status`, `resubscribe`, or removes/overwrites groups', () => {
  for (const file of ['api/_lib/subscribe.js', 'api/_lib/apply.js', 'api/_lib/referral.js', 'api/_lib/marketing.js']) {
    const src = read(file)
    assert.ok(!/resubscribe\s*:/.test(src), file)
    assert.ok(!/\bstatus\s*:\s*['"](active|unsubscribed)/.test(src), file)
    assert.ok(!/method:\s*['"](DELETE|PUT|PATCH)['"]/.test(src), file)
  }
})

/* ───────── the browser side ───────── */

test('forms: the marketing box is optional, separate from required fields and off by default', () => {
  assert.equal('marketingConsent' in EMPTY_APPLICATION, false)
  assert.equal('marketingConsent' in EMPTY_REFERRAL, false)
  // validation never mentions it, so it can never block a submission
  assert.deepEqual(validateApplication(application()), {})
  assert.deepEqual(validateReferral(partner()), {})
  const box = read('src/components/forms/MarketingConsent.jsx')
  assert.ok(!/\brequired[=\s}]|aria-required|defaultChecked|defaultValue/.test(box.replace(/\/\*[\s\S]*?\*\//g, '')))
  for (const file of ['src/components/hooks/HooksSignupCard.jsx', 'src/components/riskfree/RiskFreeApplication.jsx', 'src/components/referrals/ReferralForm.jsx']) {
    const src = read(file)
    assert.match(src, /<MarketingConsent /, file)
    assert.match(src, /useState\(false\)/, file)
  }
})

test('forms: the required referral consent box stays separate from the marketing box', () => {
  const src = read('src/components/referrals/ReferralForm.jsx')
  assert.match(src, /name="consent"/)
  assert.ok(src.indexOf('name="consent"') < src.indexOf('<MarketingConsent'))
  assert.ok(!/values\.marketingConsent|set\('marketingConsent'\)/.test(src))
})

test('analytics: no form event carries an email, consent flag or wording (nothing personal reaches GA4)', () => {
  for (const file of ['src/components/hooks/HooksSignupCard.jsx', 'src/components/riskfree/RiskFreeApplication.jsx', 'src/components/referrals/ReferralForm.jsx', 'src/components/forms/MarketingConsent.jsx']) {
    for (const call of read(file).match(/trackEvent\([^)]*\)/g) || []) {
      assert.ok(!/email|consent|marketing|name|website/i.test(call), `${file}: ${call}`)
    }
  }
  for (const file of ['src/lib/hooksSignup.js', 'src/lib/riskFreeApply.js', 'src/lib/referralApply.js']) assert.ok(!/trackEvent|dataLayer|gtag/.test(read(file)), file)
})

test('client libs send the box state and the wording VERSION (never the wording text), and only the version when ticked', async () => {
  const { submitSignup } = await import('../src/lib/hooksSignup.js')
  const { submitApplication } = await import('../src/lib/riskFreeApply.js')
  const { submitReferral } = await import('../src/lib/referralApply.js')
  const real = globalThis.fetch
  const seen = []
  globalThis.fetch = async (url, init) => {
    seen.push({ url, body: JSON.parse(init.body) })
    return { ok: true, status: 200, json: async () => ({ ok: true }) }
  }
  try {
    await submitSignup({ industry: 'saas', email: 'a@b.co', marketingConsent: true, company: '' })
    await submitSignup({ industry: 'saas', email: 'a@b.co', marketingConsent: false, company: '' })
    await submitApplication(application(), '', true)
    await submitApplication(application(), '')
    await submitReferral(partner(), '', true)
    await submitReferral(partner(), '')
  } finally {
    globalThis.fetch = real
  }
  const [hOn, hOff, aOn, aOff, rOn, rOff] = seen.map((s) => s.body)
  for (const on of [hOn, aOn, rOn]) {
    assert.equal(on.marketingConsent, true)
    assert.equal(on.marketingConsentVersion, CURRENT_MARKETING_CONSENT_VERSION)
    assert.ok(!JSON.stringify(on).includes('tips and offers'))
  }
  for (const off of [hOff, aOff, rOff]) {
    assert.equal(off.marketingConsent, false)
    assert.equal('marketingConsentVersion' in off, false)
  }
})
