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
  PARTNER_TYPES, PROGRAMS, EMPTY_REFERRAL,
  validateReferral, normalizeReferral, applyCardSelection, looksLikeContactDetails,
} from '../src/lib/referralProgram.js'

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
const fakeFetch = ({ mlStatus = 201, mlPayload = { data: { status: 'active' } }, mlThrows, resendStatus = 200, resendThrows, headers = {} } = {}) => {
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

test('only name, email, partner type, program and consent are required', () => {
  assert.deepEqual(validateReferral(valid()), {})
  const errs = validateReferral({})
  assert.deepEqual(Object.keys(errs).sort(), ['consent', 'email', 'fullName', 'partnerType', 'program'])
})

test('a referral is never required to join', () => {
  const errs = validateReferral(valid({ referredCompany: '', referredWebsite: '', referralNotes: '' }))
  assert.deepEqual(errs, {})
})

test('partner type and program must be one of the listed options', () => {
  assert.deepEqual(PARTNER_TYPES, ['Existing client', 'Agency', 'Consultant', 'Creator', 'Founder', 'Other'])
  assert.ok(validateReferral(valid({ partnerType: 'Investor' })).partnerType)
  assert.ok(validateReferral(valid({ program: 'VIP' })).program)
  for (const partnerType of PARTNER_TYPES) assert.equal(validateReferral(valid({ partnerType })).partnerType, undefined)
  for (const program of Object.values(PROGRAMS)) assert.equal(validateReferral(valid({ program })).program, undefined)
})

test('consent must be exactly true (not "true", not 1)', () => {
  for (const consent of [false, undefined, 'true', 1, 'on']) assert.ok(validateReferral(valid({ consent })).consent, String(consent))
})

test('email is validated and meaningful errors are returned', () => {
  assert.match(validateReferral(valid({ email: '' })).email, /Enter your email/)
  assert.match(validateReferral(valid({ email: 'nope' })).email, /doesn’t look right/)
})

test('optional websites: bare domain / LinkedIn URL accepted; junk rejected', () => {
  for (const w of ['example.com', 'linkedin.com/in/jane-doe', 'https://www.linkedin.com/in/jane', '']) {
    assert.equal(validateReferral(valid({ partnerWebsite: w })).partnerWebsite, undefined, w)
    assert.equal(validateReferral(valid({ referredWebsite: w })).referredWebsite, undefined, w)
  }
  for (const w of ['example', 'exa mple.com', 'me@example.com']) {
    assert.ok(validateReferral(valid({ partnerWebsite: w })).partnerWebsite, w)
    assert.ok(validateReferral(valid({ referredWebsite: w })).referredWebsite, w)
  }
  assert.equal(normalizeReferral(valid({ referredWebsite: 'brand.com' })).referredWebsite, 'https://brand.com')
})

test('length limits are enforced', () => {
  assert.ok(validateReferral(valid({ fullName: 'x'.repeat(101) })).fullName)
  assert.ok(validateReferral(valid({ partnerCompany: 'x'.repeat(121) })).partnerCompany)
  assert.ok(validateReferral(valid({ referredCompany: 'x'.repeat(121) })).referredCompany)
  assert.ok(validateReferral(valid({ referralNotes: 'x'.repeat(1001) })).referralNotes)
})

test('a third party’s email or phone number is rejected in the referral fields', () => {
  for (const notes of [
    'Talk to sam@theirbrand.com',
    'Call +44 20 7946 0958',
    'Phone: (415) 555-0132',
    'Mobile 415-555-0132',
    '4155550132',
  ]) {
    assert.ok(validateReferral(valid({ referralNotes: notes })).referralNotes, notes)
  }
  assert.ok(validateReferral(valid({ referredCompany: 'Acme (ceo@acme.com)' })).referredCompany)
})

test('ordinary descriptions with years and amounts are not mistaken for contact details', () => {
  for (const notes of ['Founded 2019, raised $4.5M, spends around 20,000 a month on ads', 'Runs 2024 2025 2026 campaigns', 'Series A, 120 employees']) {
    assert.equal(looksLikeContactDetails(notes), false, notes)
    assert.equal(validateReferral(valid({ referralNotes: notes })).referralNotes, undefined, notes)
  }
})

/* ───────── reward-card preselection ───────── */

test('Standard card preselects the Standard Referral program', () => {
  const out = applyCardSelection('standard', EMPTY_REFERRAL)
  assert.equal(out.program, 'Standard Referral')
  assert.equal(out.partnerType, '') // not guessed
})

test('Agency card preselects Agency / Strategic Partner and the Agency partner type', () => {
  const out = applyCardSelection('agency', EMPTY_REFERRAL)
  assert.equal(out.program, 'Agency / Strategic Partner')
  assert.equal(out.partnerType, 'Agency')
})

test('the Agency card never overrides a partner type the visitor already chose', () => {
  const out = applyCardSelection('agency', { ...EMPTY_REFERRAL, partnerType: 'Consultant', fullName: 'Jane' })
  assert.equal(out.program, 'Agency / Strategic Partner')
  assert.equal(out.partnerType, 'Consultant')
  assert.equal(out.fullName, 'Jane') // other answers untouched
})

test('switching cards switches the program', () => {
  const a = applyCardSelection('agency', EMPTY_REFERRAL)
  assert.equal(applyCardSelection('standard', a).program, 'Standard Referral')
})

/* ───────── MailerLite group assignment + custom-field mapping ───────── */

test('a full application is saved to the referrals group with every custom field mapped', async () => {
  const f = fakeFetch()
  const r = await run(
    valid({
      partnerCompany: 'Growth Co', partnerWebsite: 'linkedin.com/in/jane',
      referredCompany: 'Acme Inc', referredWebsite: 'acme.com', referralNotes: 'DTC brand, no video ads yet',
    }),
    f,
  )
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
      referral_program: 'Standard Referral',
      partner_company: 'Growth Co',
      partner_website: 'https://linkedin.com/in/jane',
      referred_company: 'Acme Inc',
      referred_website: 'https://acme.com',
      referral_notes: 'DTC brand, no video ads yet',
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
  for (const k of ['partner_company', 'partner_website', 'referred_company', 'referred_website', 'referral_notes']) {
    assert.ok(!(k in payload.fields), k)
  }
})

test('only the seven documented custom fields (plus the built-in name) are ever written', () => {
  const full = normalizeReferral(valid({
    partnerCompany: 'a', partnerWebsite: 'a.com', referredCompany: 'b', referredWebsite: 'b.com', referralNotes: 'c',
  }))
  assert.deepEqual(Object.keys(buildSubscriberPayload(full, '1').fields).sort(), [
    'name', 'partner_company', 'partner_type', 'partner_website', 'referral_notes', 'referral_program', 'referred_company', 'referred_website',
  ].sort())
})

test('the response never carries a booking link, approval or payment promise', async () => {
  const r = await run(valid({ program: PROGRAMS.agency }), fakeFetch())
  assert.deepEqual(Object.keys(r.body), ['ok'])
})

test('a repeat application (200) is an idempotent success', async () => {
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

test('owner email goes to mohamed@convrt.studio with every detail, a timestamp and Reply-To = partner', async () => {
  const f = fakeFetch()
  const r = await run(
    valid({
      program: PROGRAMS.agency, partnerType: 'Agency', partnerCompany: 'Growth Co', partnerWebsite: 'growth.co',
      referredCompany: 'Acme Inc', referredWebsite: 'acme.com', referralNotes: 'Needs UGC ads',
    }),
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
  assert.match(body.subject, /Agency \/ Strategic Partner/)
  for (const s of [
    'Jane Doe', 'jane@example.com', 'Agency', 'Agency / Strategic Partner', 'Growth Co', 'https://growth.co',
    'Acme Inc', 'https://acme.com', 'Needs UGC ads', '2026-11-09T12:30:00.000Z',
  ]) {
    assert.ok(body.text.includes(s), s)
  }
  assert.match(body.text, /Nothing has been approved, promised or paid/)
})

test('a partner who submits no referral is clearly marked as such in the email', async () => {
  const f = fakeFetch()
  await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
  assert.match(f.resend()[0].body.text, /Referred company: \(none submitted\)/)
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
  await run(valid({ referralNotes: '<script>alert(1)</script>' }), f, { ...ENV, RESEND_API_KEY: 'k' })
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
