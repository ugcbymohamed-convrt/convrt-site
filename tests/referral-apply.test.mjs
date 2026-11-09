// Run with: node --test tests/referral-apply.test.mjs
// Exercises the shared validation, api/_lib/referral.js and the Vercel handler with a fake
// MailerLite + Resend (injected fetch) — no network, no real credentials, no real subscribers.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { processReferral, buildSubscriberPayload, REFERRALS_GROUP_ENV } from '../api/_lib/referral.js'
import { MAILERLITE_ENDPOINT } from '../api/_lib/subscribe.js'
import { RESEND_ENDPOINT, DEFAULT_NOTIFY_TO } from '../api/_lib/notify.js'
import handler from '../api/referral-apply.js'
import {
  PARTNER_TYPES, PROGRAMS, PROGRAM_OPTIONS, EMPTY_REFERRAL, FIELD_ORDER,
  validateReferral, normalizeReferral, applyCardSelection,
} from '../src/lib/referralProgram.js'
import { KIT_EMAIL_PARAGRAPHS, KIT_EMAIL_SUBJECT, KIT_SHORT_MESSAGE, KIT_ITEMS } from '../src/lib/partnerKit.js'

const ENV = { MAILERLITE_API_TOKEN: 'test-token-abc', [REFERRALS_GROUP_ENV]: '444' }
const NOW = () => new Date('2026-11-09T12:30:00.000Z')

const valid = (over = {}) => ({
  fullName: '  Jane Doe ',
  email: ' Jane@Example.com ',
  partnerType: 'Consultant',
  program: PROGRAMS.standard,
  consent: true,
  ...over,
})

// One fake fetch for both services, told apart by URL.
const fakeFetch = ({ mlStatus = 201, mlPayload = { data: { id: '9876', status: 'active' } }, mlThrows, resendStatus = 200, resendThrows, headers = {} } = {}) => {
  const calls = []
  const fn = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push({ url, init, body })
    if (url === RESEND_ENDPOINT) {
      if (resendThrows) throw Object.assign(new Error('boom'), { name: resendThrows })
      return { status: resendStatus, headers: { get: () => null }, json: async () => ({ id: 'x' }) }
    }
    if (mlThrows) throw Object.assign(new Error('boom'), { name: mlThrows })
    return { status: mlStatus, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, json: async () => mlPayload }
  }
  fn.calls = calls
  fn.ml = () => calls.filter((c) => c.url === MAILERLITE_ENDPOINT)
  fn.resend = () => calls.filter((c) => c.url === RESEND_ENDPOINT)
  return fn
}

const run = (body, fetchImpl, env = ENV) => processReferral({ body, env, fetchImpl, now: NOW })

/* ───────── validation (shared by the form and the endpoint) ───────── */

test('only name, email, partner type, program and consent are required (and the program defaults to Standard)', () => {
  assert.deepEqual(validateReferral(valid()), {})
  const errs = validateReferral({})
  assert.deepEqual(Object.keys(errs).sort(), ['consent', 'email', 'fullName', 'partnerType', 'program'])
  // the form starts on Standard, so the hero CTA (which selects nothing) never leaves the program empty
  assert.equal(EMPTY_REFERRAL.program, PROGRAMS.standard)
  assert.deepEqual(validateReferral({ ...EMPTY_REFERRAL, fullName: 'J', email: 'j@x.co', partnerType: 'Other', consent: true }), {})
})

test('V2 partner types and program names are exactly the ones on the page', () => {
  assert.deepEqual(PARTNER_TYPES, [
    'Existing CONVRT client', 'Marketing agency', 'Consultant', 'UGC creator / video professional', 'Founder / entrepreneur', 'Other',
  ])
  assert.deepEqual(PROGRAM_OPTIONS, ['Standard Referral Partner', 'Agency & Strategic Partner'])
})

test('partner type and program must be one of the listed options', () => {
  assert.ok(validateReferral(valid({ partnerType: 'Investor' })).partnerType)
  assert.ok(validateReferral(valid({ partnerType: 'Agency' })).partnerType, 'V1 label is no longer accepted')
  assert.ok(validateReferral(valid({ program: 'VIP' })).program)
  assert.ok(validateReferral(valid({ program: 'Standard Referral' })).program, 'V1 label is no longer accepted')
  for (const partnerType of PARTNER_TYPES) assert.equal(validateReferral(valid({ partnerType })).partnerType, undefined)
  for (const program of Object.values(PROGRAMS)) assert.equal(validateReferral(valid({ program })).program, undefined)
})

test('consent must be exactly true (not "true", not 1)', () => {
  for (const consent of [false, undefined, 'true', 1, 'on']) assert.ok(validateReferral(valid({ consent })).consent, String(consent))
})

test('email is validated and meaningful errors are returned', () => {
  assert.match(validateReferral(valid({ email: '' })).email, /Enter your email/)
  for (const email of ['nope', 'a@b', 'a b@c.com', '@c.com', 'a@.com']) assert.match(validateReferral(valid({ email })).email, /doesn’t look right/, email)
  assert.equal(validateReferral(valid({ email: 'jane.doe+tag@sub.example.co' })).email, undefined)
})

test('optional website: bare domain / LinkedIn URL accepted; junk rejected', () => {
  for (const w of ['example.com', 'linkedin.com/in/jane-doe', 'https://www.linkedin.com/in/jane', '']) {
    assert.equal(validateReferral(valid({ partnerWebsite: w })).partnerWebsite, undefined, w)
  }
  for (const w of ['example', 'exa mple.com', 'me@example.com']) {
    assert.ok(validateReferral(valid({ partnerWebsite: w })).partnerWebsite, w)
  }
  assert.equal(normalizeReferral(valid({ partnerWebsite: 'brand.com' })).partnerWebsite, 'https://brand.com')
})

test('length limits are enforced', () => {
  assert.ok(validateReferral(valid({ fullName: 'x'.repeat(101) })).fullName)
  assert.ok(validateReferral(valid({ partnerCompany: 'x'.repeat(121) })).partnerCompany)
})

test('the form collects nothing about referred people or companies', () => {
  for (const k of Object.keys(EMPTY_REFERRAL)) assert.ok(!/referred|notes|phone/i.test(k), k)
  assert.deepEqual(FIELD_ORDER.sort(), Object.keys(EMPTY_REFERRAL).sort())
  // unknown extra keys in a request body are dropped, never forwarded
  const n = normalizeReferral(valid({ referredCompany: 'Acme', referredEmail: 'x@acme.com', phone: '+1 415 555 0132' }))
  assert.deepEqual(Object.keys(n).sort(), Object.keys(EMPTY_REFERRAL).sort())
})

/* ───────── reward-card preselection ───────── */

test('Standard card preselects the Standard Referral Partner program', () => {
  const out = applyCardSelection('standard', EMPTY_REFERRAL)
  assert.equal(out.program, 'Standard Referral Partner')
  assert.equal(out.partnerType, '') // not guessed
})

test('Agency card preselects Agency & Strategic Partner and the Marketing agency partner type', () => {
  const out = applyCardSelection('agency', EMPTY_REFERRAL)
  assert.equal(out.program, 'Agency & Strategic Partner')
  assert.equal(out.partnerType, 'Marketing agency')
})

test('the Agency card never overrides a partner type the visitor already chose', () => {
  const out = applyCardSelection('agency', { ...EMPTY_REFERRAL, partnerType: 'Consultant', fullName: 'Jane' })
  assert.equal(out.program, 'Agency & Strategic Partner')
  assert.equal(out.partnerType, 'Consultant')
  assert.equal(out.fullName, 'Jane') // other answers untouched
})

test('switching cards switches the program', () => {
  const a = applyCardSelection('agency', EMPTY_REFERRAL)
  assert.equal(applyCardSelection('standard', a).program, 'Standard Referral Partner')
})

/* ───────── MailerLite group assignment + custom-field mapping ───────── */

test('a full application is saved to the referrals group with every custom field mapped', async () => {
  const f = fakeFetch()
  const r = await run(valid({ partnerCompany: 'Growth Co', partnerWebsite: 'linkedin.com/in/jane' }), f)
  assert.equal(r.status, 200)
  assert.deepEqual(r.body, { ok: true })
  assert.equal(f.ml().length, 1)
  const call = f.ml()[0]
  assert.equal(call.init.method, 'POST')
  assert.equal(call.init.headers.Authorization, 'Bearer test-token-abc')
  assert.deepEqual(call.body, {
    email: 'jane@example.com',
    fields: {
      name: 'Jane Doe',
      partner_type: 'Consultant',
      referral_program: 'Standard Referral Partner',
      partner_company: 'Growth Co',
      partner_website: 'https://linkedin.com/in/jane',
    },
    groups: ['444'],
  })
  assert.ok(!('status' in call.body), 'never sends a subscriber status')
  assert.ok(!('resubscribe' in call.body))
})

test('the group comes from MAILERLITE_GROUP_REFERRALS_ID (not another group’s variable)', async () => {
  assert.equal(REFERRALS_GROUP_ENV, 'MAILERLITE_GROUP_REFERRALS_ID')
  const f = fakeFetch()
  await run(valid(), f, { MAILERLITE_API_TOKEN: 't', MAILERLITE_GROUP_REFERRALS_ID: '555', MAILERLITE_GROUP_RISK_FREE_ID: '333', MAILERLITE_GROUP_SAAS_ID: '111' })
  assert.deepEqual(f.ml()[0].body.groups, ['555'])
})

test('blank optional answers are not sent, so a returning partner never wipes earlier values', () => {
  const payload = buildSubscriberPayload(normalizeReferral(valid()), '444')
  assert.deepEqual(Object.keys(payload.fields).sort(), ['name', 'partner_type', 'referral_program'])
  for (const k of ['partner_company', 'partner_website']) assert.ok(!(k in payload.fields), k)
})

test('only the four documented custom fields (plus the built-in name) are ever written: no per-referral history', () => {
  const full = normalizeReferral(valid({ partnerCompany: 'a', partnerWebsite: 'a.com', referredCompany: 'b', referralNotes: 'c' }))
  assert.deepEqual(Object.keys(buildSubscriberPayload(full, '1').fields).sort(), [
    'name', 'partner_company', 'partner_type', 'partner_website', 'referral_program',
  ].sort())
})

test('the response never carries a booking link, approval, partner ID or payment promise', async () => {
  const r = await run(valid({ program: PROGRAMS.agency }), fakeFetch())
  assert.deepEqual(Object.keys(r.body), ['ok'])
})

test('a repeat registration (200) is an idempotent success', async () => {
  const r = await run(valid(), fakeFetch({ mlStatus: 200 }))
  assert.equal(r.status, 200)
})

test('unsubscribed / bounced / junk contacts are not reported as success (and the owner is told they were not saved)', async () => {
  for (const status of ['unsubscribed', 'bounced', 'junk']) {
    const f = fakeFetch({ mlStatus: 200, mlPayload: { data: { status } } })
    const r = await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
    assert.equal(r.status, 409)
    assert.equal(r.body.error, 'cannot_subscribe')
    assert.match(f.resend()[0].body.subject, /^\[NOT SAVED\]/)
  }
})

test('active, unconfirmed and missing subscriber states are all saved applications', async () => {
  for (const mlPayload of [{ data: { status: 'active' } }, { data: { status: 'unconfirmed' } }, { data: {} }, {}]) {
    assert.equal((await run(valid(), fakeFetch({ mlPayload }))).status, 200)
  }
})

/* ───────── rejection paths never reach MailerLite ───────── */

test('invalid applications are rejected with the failing field names and never reach MailerLite or Resend', async () => {
  const f = fakeFetch()
  const r = await run(valid({ email: 'nope', consent: false }), f, { ...ENV, RESEND_API_KEY: 'k' })
  assert.equal(r.status, 422)
  assert.equal(r.body.error, 'invalid_application')
  assert.deepEqual(r.body.fields.sort(), ['consent', 'email'])
  assert.equal(f.calls.length, 0)
})

test('honeypot: bots get a fake success and nothing is saved or emailed', async () => {
  const f = fakeFetch()
  const r = await run({ ...valid(), hpCheck: 'spam' }, f, { ...ENV, RESEND_API_KEY: 'k' })
  assert.equal(r.status, 200)
  assert.equal(f.calls.length, 0)
})

test('the visible "company" style fields are not mistaken for the honeypot', async () => {
  const f = fakeFetch()
  const r = await run(valid({ company: 'Legit Co', partnerCompany: 'Legit Co' }), f)
  assert.equal(r.status, 200)
  assert.equal(f.ml().length, 1)
})

test('non-object bodies are rejected', async () => {
  for (const body of [null, undefined, 'x', 5, []]) assert.equal((await run(body, fakeFetch())).status, 400)
})

test('missing configuration answers 503, never a false success', async () => {
  const f = fakeFetch()
  for (const env of [{}, { MAILERLITE_API_TOKEN: 't' }, { [REFERRALS_GROUP_ENV]: '444' }, { ...ENV, [REFERRALS_GROUP_ENV]: 'abc' }]) {
    assert.equal((await run(valid(), f, env)).status, 503)
  }
  assert.equal(f.calls.length, 0)
})

test('upstream errors map to safe responses', async () => {
  const limited = await run(valid(), fakeFetch({ mlStatus: 429, headers: { 'retry-after': '30' } }))
  assert.equal(limited.body.error, 'rate_limited')
  assert.equal(limited.headers['Retry-After'], '30')
  assert.equal((await run(valid(), fakeFetch({ mlStatus: 401 }))).status, 503)
  assert.equal((await run(valid(), fakeFetch({ mlStatus: 500 }))).status, 502)
  assert.equal((await run(valid(), fakeFetch({ mlStatus: 422, mlPayload: { errors: { email: ['bad'] } } }))).body.error, 'invalid_application')
  // a custom field that doesn't exist in MailerLite yet is a server-side misconfiguration, not the visitor's fault
  assert.equal((await run(valid(), fakeFetch({ mlStatus: 422, mlPayload: { errors: { 'fields.partner_type': ['unknown'] } } }))).status, 502)
  assert.equal((await run(valid(), fakeFetch({ mlThrows: 'AbortError' }))).status, 502)
})

/* ───────── owner notification (Resend) ───────── */

test('no RESEND_API_KEY → nothing is sent and the application still succeeds', async () => {
  const f = fakeFetch()
  const r = await run(valid(), f)
  assert.equal(r.status, 200)
  assert.equal(f.resend().length, 0)
})

test('owner email goes to mohamed@convrt.studio with every detail, a timestamp, the partner ID and Reply-To = partner', async () => {
  const f = fakeFetch()
  const r = await run(
    valid({ program: PROGRAMS.agency, partnerType: 'Marketing agency', partnerCompany: 'Growth Co', partnerWebsite: 'growth.co' }),
    f,
    { ...ENV, RESEND_API_KEY: 're_test_123' },
  )
  assert.equal(r.status, 200)
  assert.equal(f.resend().length, 1)
  const { init, body } = f.resend()[0]
  assert.equal(init.headers.Authorization, 'Bearer re_test_123')
  assert.deepEqual(body.to, ['mohamed@convrt.studio'])
  assert.equal(DEFAULT_NOTIFY_TO, 'mohamed@convrt.studio')
  assert.equal(body.reply_to, 'jane@example.com')
  assert.match(body.subject, /Jane Doe/)
  assert.match(body.subject, /Agency & Strategic Partner/)
  for (const s of [
    'Jane Doe', 'jane@example.com', 'Marketing agency', 'Agency & Strategic Partner', 'Growth Co', 'https://growth.co',
    '2026-11-09T12:30:00.000Z', '9876',
  ]) {
    assert.ok(body.text.includes(s), s)
  }
  assert.match(body.text, /Nothing has been approved, promised or paid/)
  assert.match(body.text, /Agency & Strategic Partners always need your explicit approval/)
  assert.match(body.text, /send the partner kit manually/)
})

test('the owner email carries no referral fields (registrations only)', async () => {
  const f = fakeFetch()
  await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
  assert.ok(!/Referred company|Referred website|Opportunity notes/.test(f.resend()[0].body.text))
})

test('NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM override the defaults', async () => {
  const f = fakeFetch()
  await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k', NOTIFY_EMAIL_TO: 'team@convrt.studio', NOTIFY_EMAIL_FROM: 'CONVRT <apply@convrt.studio>' })
  const { body } = f.resend()[0]
  assert.deepEqual(body.to, ['team@convrt.studio'])
  assert.equal(body.from, 'CONVRT <apply@convrt.studio>')
})

test('partner-supplied text is HTML-escaped in the email body', async () => {
  const f = fakeFetch()
  await run(valid({ partnerCompany: '<script>alert(1)</script>' }), f, { ...ENV, RESEND_API_KEY: 'k' })
  const { body } = f.resend()[0]
  assert.ok(!body.html.includes('<script>'))
  assert.ok(body.html.includes('&lt;script&gt;'))
})

test('Resend failing (error status, network error, or a thrown fetch) never fails a saved application', async () => {
  for (const f of [fakeFetch({ resendStatus: 500 }), fakeFetch({ resendStatus: 401 }), fakeFetch({ resendThrows: 'AbortError' }), fakeFetch({ resendThrows: 'TypeError' })]) {
    const r = await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
    assert.equal(r.status, 200)
    assert.deepEqual(r.body, { ok: true })
    assert.equal(f.ml().length, 1, 'the application was saved')
    assert.equal(f.resend().length, 1, 'the email was attempted')
  }
})

test('MailerLite failing still alerts the owner, flagged NOT SAVED, so no partner email is ever lost', async () => {
  const env = { ...ENV, RESEND_API_KEY: 'k' }
  const cases = [
    [fakeFetch({ mlStatus: 500, mlPayload: { message: 'down' } }), 502],
    [fakeFetch({ mlStatus: 429 }), 429],
    [fakeFetch({ mlStatus: 401 }), 503],
    [fakeFetch({ mlThrows: 'AbortError' }), 502],
  ]
  for (const [f, expected] of cases) {
    const r = await run(valid(), f, env)
    assert.equal(r.status, expected)
    assert.equal(f.resend().length, 1)
    const { body } = f.resend()[0]
    assert.match(body.subject, /^\[NOT SAVED\]/)
    assert.ok(body.text.includes('jane@example.com'))
    assert.ok(body.text.includes('Saved to MailerLite: NO'))
  }
  // not configured at all → 503, still alerted
  const f = fakeFetch()
  const r = await run(valid(), f, { RESEND_API_KEY: 'k' })
  assert.equal(r.status, 503)
  assert.equal(f.ml().length, 0)
  assert.equal(f.resend().length, 1)
  assert.match(f.resend()[0].body.subject, /^\[NOT SAVED\]/)
})

test('a failed save shows no partner ID in the alert, and still names the partner', async () => {
  const f = fakeFetch({ mlStatus: 500 })
  await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
  const { text } = f.resend()[0].body
  assert.ok(!/partner ID/.test(text))
  assert.ok(text.includes('Jane Doe'))
})

test('a saved application is marked as saved in the owner email', async () => {
  const f = fakeFetch()
  await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
  const { body } = f.resend()[0]
  assert.ok(!body.subject.startsWith('[NOT SAVED]'))
  assert.match(body.text, /Saved to MailerLite: Yes \(group: Referral Partner Applications\)/)
})

test('an unexpected failure while building the email (e.g. a throwing fetch) is swallowed', async () => {
  const f = fakeFetch()
  const original = f
  const throwingOnResend = async (url, init) => {
    if (url === RESEND_ENDPOINT) throw new TypeError('network down')
    return original(url, init)
  }
  const r = await run(valid(), throwingOnResend, { ...ENV, RESEND_API_KEY: 'k' })
  assert.equal(r.status, 200)
})

/* ───────── handler ───────── */

const mockRes = () => {
  const res = { headers: {}, statusCode: 0, body: '' }
  res.setHeader = (k, v) => { res.headers[k] = v }
  res.end = (b) => { res.body = b }
  return res
}

test('handler: rejects non-POST, cross-origin and unparseable bodies', async () => {
  let res = mockRes()
  await handler({ method: 'GET', headers: {} }, res)
  assert.equal(res.statusCode, 405)

  res = mockRes()
  await handler({ method: 'POST', headers: { origin: 'https://evil.example', host: 'www.convrt.studio' }, body: valid() }, res)
  assert.equal(res.statusCode, 403)

  res = mockRes()
  await handler({ method: 'POST', headers: { host: 'www.convrt.studio' }, body: '{not json' }, res)
  assert.equal(res.statusCode, 400)
})

test('handler: valid same-origin request without server config answers 503 and sends nothing', async () => {
  const saved = { ...process.env }
  delete process.env.MAILERLITE_API_TOKEN
  delete process.env[REFERRALS_GROUP_ENV]
  try {
    const res = mockRes()
    await handler({ method: 'POST', headers: { origin: 'https://www.convrt.studio', host: 'www.convrt.studio' }, body: valid() }, res)
    assert.equal(res.statusCode, 503)
    assert.equal(JSON.parse(res.body).error, 'unavailable')
  } finally {
    Object.assign(process.env, saved)
  }
})

test('handler: an invalid body answers 422 with the failing fields', async () => {
  const res = mockRes()
  await handler({ method: 'POST', headers: { host: 'www.convrt.studio' }, body: { fullName: 'x' } }, res)
  assert.equal(res.statusCode, 422)
  assert.ok(JSON.parse(res.body).fields.includes('email'))
})

/* ───────── API keys stay server-side ───────── */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

test('no secret name or process.env access appears anywhere in the browser source (src/)', () => {
  const offenders = []
  for (const file of walk(join(ROOT, 'src')).filter((p) => /\.(js|jsx)$/.test(p))) {
    const text = readFileSync(file, 'utf8')
    if (/MAILERLITE_API_TOKEN|RESEND_API_KEY|process\.env|VITE_(MAILERLITE|RESEND)/.test(text)) offenders.push(file)
  }
  assert.deepEqual(offenders, [])
})

test('the browser talks only to our own /api/referral-apply (never to MailerLite or Resend directly)', () => {
  const client = readFileSync(join(ROOT, 'src/lib/referralApply.js'), 'utf8')
  assert.match(client, /'\/api\/referral-apply'/)
  assert.ok(!/mailerlite|resend\.com/i.test(client.replace(/\/\*[\s\S]*?\*\//g, '')))
})

test('the production bundle, when built, contains no secret names', { skip: !existsSync(join(ROOT, 'dist/assets')) }, () => {
  const offenders = walk(join(ROOT, 'dist'))
    .filter((p) => /\.(js|css|html)$/.test(p))
    .filter((p) => /MAILERLITE_API_TOKEN|RESEND_API_KEY|connect\.mailerlite\.com|api\.resend\.com/.test(readFileSync(p, 'utf8')))
  assert.deepEqual(offenders, [])
})

test('the endpoint is registered in the Vite dev middleware and the page route + footer link exist', () => {
  assert.match(readFileSync(join(ROOT, 'vite.config.js'), 'utf8'), /'referral-apply'/)
  assert.match(readFileSync(join(ROOT, 'src/App.jsx'), 'utf8'), /\[REFERRALS_PATH\]: ReferralsPage/)
  assert.match(readFileSync(join(ROOT, 'src/components/Footer.jsx'), 'utf8'), /Referral Program/)
})


/* ───────── page content, accessibility and behaviour (static checks on the source) ─────────
   The project has no browser test runner, so these read the component source for the attributes
   and rules that matter. Real rendering, scrolling, focus and responsive layout are verified by
   hand in the Browser pane (docs/referral-program-setup.md §11). */

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')
const SRC = {
  faq: read('src/components/referrals/ReferralFAQ.jsx'),
  form: read('src/components/referrals/ReferralForm.jsx'),
  rewards: read('src/components/referrals/ReferralRewards.jsx'),
  hero: read('src/components/referrals/ReferralHero.jsx'),
  kit: read('src/components/referrals/ReferralKit.jsx'),
  how: read('src/components/referrals/ReferralHowItWorks.jsx'),
  terms: read('src/components/referrals/ReferralTerms.jsx'),
  page: read('src/ReferralsPage.jsx'),
  css: read('src/index.css'),
}
const allReferralSource = Object.values(SRC).join('\n')

test('FAQ is an accessible accordion: button + aria-expanded + aria-controls + labelled region, reduced-motion aware', () => {
  assert.match(SRC.faq, /<button[\s\S]*?type="button"/)
  assert.match(SRC.faq, /aria-expanded=\{open\}/)
  assert.match(SRC.faq, /aria-controls=\{panelId\}/)
  assert.match(SRC.faq, /role="region"/)
  assert.match(SRC.faq, /aria-labelledby=\{buttonId\}/)
  assert.match(SRC.faq, /focus-visible:outline/)
  assert.match(SRC.css, /\.ref-faq-panel/)
  assert.match(SRC.css, /prefers-reduced-motion[\s\S]*?\.ref-faq-panel/)
})

test('the FAQ is concise (eight questions) and keeps every key fact', () => {
  const qs = [...SRC.faq.matchAll(/q: '([^']+)'/g)].map((m) => m[1])
  assert.deepEqual(qs, [
    'Who can join?',
    'How much do I earn?',
    'What does the referred brand get?',
    'When do I get paid?',
    'Can I become a strategic partner?',
    'What if the company already contacted CONVRT?',
    'Do I need to sell CONVRT’s services?',
    'Can I track my referrals?',
  ])
  const answers = [...SRC.faq.matchAll(/a: '([^']+)'/g)].map((m) => m[1])
  assert.ok(answers.every((a) => a.length < 260), 'each answer stays short')
  assert.match(SRC.faq, /\$150 per eligible new client, as cash or production credit/)
  assert.match(SRC.faq, /10% of the first qualifying project payment, up to \$500 per referred client/)
  assert.match(SRC.faq, /no limit on eligible referrals/i)
  assert.match(SRC.faq, /Two extra ad variations on their first qualifying paid video project/)
  assert.match(SRC.faq, /Introductions, sign-ups and calls alone don’t earn a reward/)
  assert.match(SRC.faq, /first qualifying payment clears and stays non-refundable/)
  assert.match(SRC.faq, /Previously active prospects may be excluded/)
  assert.match(SRC.faq, /no self-service dashboard at launch/i)
})

test('the form prevents duplicate submits (synchronous ref guard + disabled button) and shows a loading state', () => {
  assert.match(SRC.form, /if \(inflightRef\.current\) return/)
  assert.match(SRC.form, /inflightRef\.current = true/)
  assert.match(SRC.form, /finally \{\s*inflightRef\.current = false/)
  assert.match(SRC.form, /disabled=\{submitting\}/)
  assert.match(SRC.form, /Submitting…/)
  assert.match(SRC.form, /aria-busy=\{submitting\}/)
})

test('the form is bot-protected, labelled, and shows the specified CTA and confirmation copy', () => {
  assert.match(SRC.form, /name="hp_check"/)
  assert.match(SRC.form, /tabIndex=\{-1\}/)
  assert.match(SRC.form, /Join the Referral Program/)
  assert.match(SRC.form, /Let’s Become <span className="text-lime">Partners\.<\/span>/)
  assert.match(SRC.form, /You’re One Step Closer to Becoming a CONVRT Partner\./)
  assert.match(SRC.form, /If approved, we’ll send\s+you everything you need to start referring\./)
  assert.match(SRC.form, /role="alert"/)
  assert.match(SRC.form, /role="status"/)
  assert.match(SRC.form, /noValidate/)
})

test('the confirmation and form promise no turnaround time, approval, booking link or payment', () => {
  const copy = SRC.form.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!/within \d|business days|24 hours|48 hours|calendly|BOOKING_URL|you['’]re approved|you have been approved/i.test(copy))
})

test('reward-card and hero CTAs reach the form: cards preselect, the hero scrolls, both start scrolling at once', () => {
  assert.match(SRC.rewards, /onSelect\(card\.id\)/)
  assert.match(SRC.page, /scrollToApply\(\)/)
  assert.match(SRC.page, /<ReferralRewards onSelect=\{selectProgram\} \/>/)
  assert.match(SRC.hero, /scrollToApply\(\)/)
  assert.match(SRC.hero, /href="#apply"/)
  assert.match(SRC.hero, /goToSection\('how-it-works'\)/)
  assert.match(SRC.form, /applyCardSelection\(preselect\.card, v\)/)
  assert.match(SRC.form, /id="apply"/)
  assert.match(SRC.how, /id="how-it-works"/)
  // no CTA sends referral visitors to the Roadmap or a booking link
  assert.ok(!/creative-growth-roadmap|OFFER_PATHS|BOOKING_URL/.test(allReferralSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/Free Creative Growth Roadmap/g, '')))
})

test('press feedback and reduced motion: buttons give visible feedback and animations are switched off', () => {
  assert.match(SRC.rewards, /active:scale-\[0\.97\]/)
  assert.match(SRC.rewards, /motion-reduce:/)
  assert.match(read('src/components/referrals/shared.jsx'), /usePressFeedback/)
  assert.match(SRC.css, /prefers-reduced-motion[\s\S]*?\.ref-pulse/)
})

test('copy: headline, offer figures and the Creative Upgrade match the brief', () => {
  assert.match(SRC.hero, /Know a Brand That Needs <span className="text-lime">Better Video Ads\?<\/span>/)
  assert.match(SRC.hero, /Introduce SaaS and e-commerce brands to CONVRT\. Get rewarded when they become clients\./)
  assert.match(SRC.hero, /Simple introductions\. No selling required\./)
  for (const t of ['You refer', 'We create', 'You earn']) assert.ok(SRC.hero.includes(`title: '${t}'`), t)
  assert.match(SRC.hero, /Your referral gets 2 FREE ad variations\./)
  assert.match(SRC.hero, /Become a Referral Partner/)
  assert.match(SRC.hero, /See How It Works/)
  assert.match(SRC.rewards, /One Introduction\. Two Winners\./)
  assert.match(SRC.rewards, /amount: '\$150'/)
  assert.match(SRC.rewards, /amount: '10%'/)
  assert.match(SRC.rewards, /Earn \$150 cash or production credit for every successful referral\./)
  assert.match(SRC.rewards, /Earn 10% of the first qualifying project when you refer a client to CONVRT\./)
  assert.match(SRC.rewards, /Start Referring/)
  assert.match(SRC.rewards, /cta: 'Become a Partner'/)
  assert.match(SRC.rewards, /FREE Creative Upgrade/)
  assert.match(SRC.rewards, /2 Extra Ad Variations\. On Us\./)
  assert.match(SRC.rewards, /we’ll create two additional ad\s+variations at no extra cost\./)
  assert.match(SRC.rewards, /Made from existing project footage and assets\. No additional filming required\./)
  assert.match(SRC.how, /Three Steps\. That’s It\./)
  assert.match(SRC.how, /Know a brand that needs better video ads\? Connect them with CONVRT\./)
  assert.match(SRC.how, /You get rewarded\. Your referral gets a FREE Creative Upgrade\./)
  assert.match(SRC.terms, /Simple, Transparent Rewards\./)
  assert.match(SRC.terms, /Read Full Program Terms/)
  assert.match(SRC.kit, /We Make Referring Easy\./)
  assert.match(SRC.page, /CONVRT Referral Partner Program \| Earn Rewards for Introductions/)
  assert.match(SRC.page, /Refer SaaS and e-commerce brands to CONVRT, earn rewards for successful introductions, and give your connections an exclusive creative upgrade\./)
  assert.match(SRC.page, /\$\{SITE_URL\}\$\{REFERRALS_PATH\}/)
})

test('the agency card shows "Earn 10%" with the $500 cap explained on the line below, and no "maximum" wording', () => {
  assert.match(SRC.rewards, /note: 'Up to \$500 per client\. For example, a \$5,000 first payment earns \$500\.'/)
  assert.ok(!/the maximum/i.test(SRC.rewards))
  assert.ok(!/cap: 'up to/.test(SRC.rewards), 'the cap is no longer shown beside the 10%')
})

test('the page is much shorter: the long upgrade checklist and repeated disclaimers are gone', () => {
  assert.ok(!/UPGRADE_POINTS|Variations already included|doesn’t automatically stack|Not a new production/.test(SRC.rewards))
  assert.ok(!/Not every introduction qualifies/.test(SRC.how))
  assert.ok(!/Edit-based variations made from/.test(SRC.rewards))
})

test('the full program terms stay reachable: compact summary, accordion, and links from the rewards, form and FAQ flow', () => {
  assert.match(SRC.terms, /aria-expanded=\{open\}/)
  assert.match(SRC.terms, /aria-controls=\{panelId\}/)
  assert.match(SRC.terms, /role="region"/)
  assert.match(SRC.terms, /TERMS_OPEN_EVENT/)
  assert.match(SRC.rewards, /<TermsLink>/)
  assert.match(SRC.form, /<TermsLink>/)
  assert.match(read('src/components/referrals/shared.jsx'), /export function openTerms\(\)[\s\S]*goToSection\('terms'\)/)
  // the terms section sits before the form, so it is read before anyone applies
  assert.ok(SRC.page.indexOf('<ReferralTerms />') < SRC.page.indexOf('<ReferralForm'))
})

test('the navigation has one "Refer Us, Earn 10%" link to /referrals (desktop and mobile), 10% in lime, with focus + hover states', () => {
  const nav = read('src/components/Nav.jsx')
  assert.match(nav, /href=\{REFERRALS_PATH\}/)
  assert.match(nav, /Refer Us, Earn <span className="font-semibold text-lime">10%<\/span>/)
  assert.equal((nav.match(/<ReferralNavLink/g) || []).length, 2, 'desktop nav + mobile menu')
  assert.match(nav, /focus-visible:outline/)
  assert.match(nav, /group-hover:w-full/)
  assert.match(nav, /motion-reduce:transition-none/)
  assert.match(nav, /nav-cta/) // the primary CTA is still there
  assert.match(read('src/config.js'), /REFERRALS_PATH = '\/referrals'/)
})

test('the agency commission cap ($500 per referred client) is stated consistently everywhere it is promised', () => {
  assert.match(SRC.rewards, /Up to \$500 per client/)
  assert.match(SRC.terms, /capped at \$500 per referred client/)
  assert.match(SRC.faq, /up to \$500 per referred client/)
  assert.match(read('docs/partner-kit.md'), /up to \$500 per referred client/)
  assert.match(read('docs/referral-program-setup.md'), /capped at \$500/)
  // the Standard reward is unchanged and no other cap / tier appears
  assert.ok(!/\$(1,?000|750|600)\b/.test(SRC.rewards + SRC.faq + SRC.terms))
})

test('nothing on the page invents statistics, testimonials, earnings, timelines or guarantees', () => {
  const copy = allReferralSource.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!/\b\d+\+\s*(creatives|brands|clients)|testimonial|“[^”]{40,}”|earned \$|average (reward|earning)|guaranteed (results|roas|conversions)/i.test(copy), 'no invented claims')
  assert.ok(!/within \d+ (days|business days|weeks)|\d+[- ](day|week) (window|payout)|attribution window of/i.test(copy), 'no invented payout / attribution timelines')
})

test('analytics: V2 event names are used, and no personal data is passed to them', () => {
  const events = new Set([...allReferralSource.matchAll(/trackEvent\('([a-z_]+)'/g)].map((m) => m[1]))
  assert.deepEqual([...events].sort(), [
    'referral_application_error', 'referral_application_submit', 'referral_application_success',
    'referral_cta_click', 'referral_form_start', 'referral_page_view',
  ])
  assert.ok(!/trackEvent\([^)]*(email|fullName|values\.)/.test(allReferralSource))
  // "submit" is fired when the request starts; "success" only after the server confirmed the save
  assert.match(SRC.form, /await submitReferral\(values, honeypot\)\s*\n\s*setStatus\('success'\)\s*\n\s*trackEvent\('referral_application_success'\)/)
})

test('terms cover every required condition and invent no attribution window or payout deadline', () => {
  const required = [
    /eligible new clients/i, /approval/i, /attribution/i, /already active/i, /self-referrals/i, /fraudulent or misleading/i,
    /bulk outreach/i, /One reward structure per qualifying referral/i, /first qualifying payment clears/i, /taxes, refunds/i,
    /Refunded or cancelled/i, /Production credit/i, /FREE Creative Upgrade/i, /disclose their financial incentive/i,
    /change or end the program going forward/i, /not removed retroactively/i,
    /doesn’t automatically combine with the free production trial/i, /not exchangeable for cash/i, /Free Creative Growth Roadmap/i,
    /Prospects who were already active/i, /No self-referrals/i,
  ]
  for (const re of required) assert.match(SRC.terms, re)
  assert.ok(!/\d+\s*(days|weeks|months)/i.test(SRC.terms.replace(/\/\*[\s\S]*?\*\//g, '')))
})

test('structured data is generated from the visible FAQ only', () => {
  assert.match(SRC.page, /FAQS\.map/)
  assert.ok(!/"@type":\s*"(Review|AggregateRating|Offer|Product)"|aggregateRating/.test(SRC.page))
})

test('the page is noindex until the launch gate is flipped, with the canonical URL set', () => {
  assert.match(read('src/config.js'), /export const REFERRALS_INDEXABLE = false/)
  assert.match(SRC.page, /noindex: !REFERRALS_INDEXABLE/)
  assert.match(SRC.page, /url: PAGE_URL/)
  assert.match(read('src/config.js'), /SITE_URL = 'https:\/\/www\.convrt\.studio'/)
})

/* ───────── partner kit and tracker ───────── */

test('the partner-kit text on the page and in docs/partner-kit.md is identical', () => {
  const doc = read('docs/partner-kit.md')
  assert.ok(doc.includes(KIT_EMAIL_SUBJECT))
  for (const p of KIT_EMAIL_PARAGRAPHS) assert.ok(doc.includes(p), p)
  assert.ok(doc.includes(KIT_SHORT_MESSAGE))
  assert.equal(KIT_ITEMS.length, 6)
})

test('both kit templates include a short financial-referral disclosure', () => {
  assert.match(KIT_EMAIL_PARAGRAPHS.join(' '), /may receive a referral reward/)
  assert.match(KIT_SHORT_MESSAGE, /may get a referral reward/)
})

test('the kit never claims a referral link, portal or automatic delivery', () => {
  const copy = (SRC.kit + readFileSync(join(ROOT, 'src/lib/partnerKit.js'), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!/referral (link|code)|dashboard|portal|instantly|automatically/i.test(copy))
  assert.match(SRC.kit, /Nothing to download first/)
})

test('the manual referral tracker has every required column and the nine statuses are documented', () => {
  const header = read('docs/referral-tracker-template.csv').split('\n')[0].split(',')
  for (const col of [
    'Referral ID', 'Partner ID (MailerLite subscriber ID)', 'Referred company', 'Referred website', 'Submission date',
    'Referral source', 'Status', 'Attribution decision', 'Qualifying project value (ex. tax)', 'Reward type', 'Reward amount', 'Payment status',
  ]) assert.ok(header.includes(col), col)
  const doc = read('docs/referral-program-setup.md')
  for (const st of ['Submitted', 'Under Review', 'Accepted', 'Rejected', 'Contacted', 'Call Booked', 'Client Won', 'Reward Eligible', 'Reward Paid']) {
    assert.ok(doc.includes(st), st)
  }
})

test('the referral endpoint reuses the shared MailerLite and Resend helpers instead of copying them', () => {
  for (const f of ['api/free-hooks-subscribe.js', 'api/risk-free-apply.js', 'api/_lib/notify.js', 'api/_lib/subscribe.js', 'api/_lib/apply.js']) {
    assert.ok(existsSync(join(ROOT, f)), f)
  }
  assert.match(read('api/_lib/referral.js'), /from '\.\/notify\.js'/)
  assert.match(read('api/_lib/referral.js'), /from '\.\/subscribe\.js'/)
})
