// Run with: node --test tests/free-hooks-subscribe.test.mjs
// Exercises api/_lib/subscribe.js and the Vercel handler with a fake MailerLite
// (injected fetch) — no network, no real credentials.
import test from 'node:test'
import assert from 'node:assert/strict'
import { processSignup, isSameOrigin, MAILERLITE_ENDPOINT } from '../api/_lib/subscribe.js'
import handler from '../api/free-hooks-subscribe.js'

const ENV = {
  MAILERLITE_API_TOKEN: 'test-token-abc',
  MAILERLITE_GROUP_SAAS_ID: '111',
  MAILERLITE_GROUP_ECOMMERCE_ID: '222',
}

const fakeFetch = (status, payload, { throws, headers = {} } = {}) => {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) })
    if (throws) throw Object.assign(new Error('boom'), { name: throws })
    return { status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, json: async () => payload }
  }
  fn.calls = calls
  return fn
}

const run = (body, fetchImpl, env = ENV) => processSignup({ body, env, fetchImpl })

test('SaaS signup goes to the SaaS group only, with bearer token, no status', async () => {
  const f = fakeFetch(201, { data: { status: 'active' } })
  const r = await run({ industry: 'saas', email: ' Jane@Example.com ' }, f)
  assert.equal(r.status, 200)
  assert.deepEqual(r.body, { ok: true, confirmation: false })
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].url, MAILERLITE_ENDPOINT)
  assert.equal(f.calls[0].init.headers.Authorization, 'Bearer test-token-abc')
  assert.deepEqual(f.calls[0].body, { email: 'jane@example.com', groups: ['111'] })
})

test('E-commerce signup goes to the e-commerce group', async () => {
  const f = fakeFetch(201, { data: { status: 'active' } })
  await run({ industry: 'ecommerce', email: 'a@b.co' }, f)
  assert.deepEqual(f.calls[0].body.groups, ['222'])
})

test('unconfirmed status (double opt-in) is reported as confirmation required', async () => {
  const r = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(201, { data: { status: 'unconfirmed' } }))
  assert.deepEqual(r.body, { ok: true, confirmation: true })
})

test('duplicate subscriber (200) is an idempotent success', async () => {
  const r = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(200, { data: { status: 'active' } }))
  assert.equal(r.status, 200)
  assert.equal(r.body.ok, true)
})

test('unsubscribed / bounced / junk contacts are not reported as success', async () => {
  for (const status of ['unsubscribed', 'bounced', 'junk']) {
    const r = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(200, { data: { status } }))
    assert.equal(r.status, 409)
    assert.equal(r.body.error, 'cannot_subscribe')
  }
})

test('marketing group is added only with consent AND a configured group', async () => {
  const env = { ...ENV, MAILERLITE_GROUP_MARKETING_ID: '333' }
  let f = fakeFetch(201, { data: { status: 'active' } })
  await run({ industry: 'saas', email: 'a@b.co', marketingConsent: true }, f, env)
  assert.deepEqual(f.calls[0].body.groups, ['111', '333'])

  f = fakeFetch(201, { data: { status: 'active' } })
  await run({ industry: 'saas', email: 'a@b.co', marketingConsent: false }, f, env)
  assert.deepEqual(f.calls[0].body.groups, ['111'])

  f = fakeFetch(201, { data: { status: 'active' } })
  await run({ industry: 'saas', email: 'a@b.co', marketingConsent: true }, f)
  assert.deepEqual(f.calls[0].body.groups, ['111'])
})

test('validation: bad industry, bad email, bad body', async () => {
  const f = fakeFetch(201, {})
  assert.equal((await run({ industry: 'crypto', email: 'a@b.co' }, f)).body.error, 'invalid_industry')
  assert.equal((await run({ industry: '__proto__', email: 'a@b.co' }, f)).status, 400)
  assert.equal((await run({ industry: 'saas', email: 'nope' }, f)).body.error, 'invalid_email')
  assert.equal((await run({ industry: 'saas', email: 'a'.repeat(260) + '@b.co' }, f)).status, 422)
  assert.equal((await run(null, f)).status, 400)
  assert.equal(f.calls.length, 0, 'nothing is sent upstream for invalid input')
})

test('honeypot: fake success, nothing sent upstream', async () => {
  const f = fakeFetch(201, {})
  const r = await run({ industry: 'saas', email: 'a@b.co', company: 'Acme' }, f)
  assert.equal(r.status, 200)
  assert.equal(f.calls.length, 0)
})

test('missing token or group id → 503, nothing sent', async () => {
  const f = fakeFetch(201, {})
  assert.equal((await run({ industry: 'saas', email: 'a@b.co' }, f, {})).status, 503)
  assert.equal((await run({ industry: 'saas', email: 'a@b.co' }, f, { ...ENV, MAILERLITE_GROUP_SAAS_ID: 'REPLACE_ME' })).status, 503)
  assert.equal((await run({ industry: 'ecommerce', email: 'a@b.co' }, f, { MAILERLITE_API_TOKEN: 't', MAILERLITE_GROUP_SAAS_ID: '1' })).status, 503)
  assert.equal(f.calls.length, 0)
})

test('upstream errors map to safe client errors (no leakage of token/details)', async () => {
  const r422 = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(422, { message: 'x', errors: { email: ['bad'] } }))
  assert.deepEqual([r422.status, r422.body.error], [422, 'invalid_email'])

  const r422other = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(422, { errors: { groups: ['bad'] } }))
  assert.deepEqual([r422other.status, r422other.body.error], [502, 'unavailable'])

  const r429 = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(429, {}, { headers: { 'retry-after': '30' } }))
  assert.deepEqual([r429.status, r429.body.error, r429.headers['Retry-After']], [429, 'rate_limited', '30'])

  for (const code of [401, 403]) {
    const r = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(code, { message: 'Unauthenticated' }))
    assert.deepEqual([r.status, r.body.error], [503, 'unavailable'])
  }
  const r500 = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(500, {}))
  assert.deepEqual([r500.status, r500.body.error], [502, 'unavailable'])

  const rNet = await run({ industry: 'saas', email: 'a@b.co' }, fakeFetch(0, {}, { throws: 'AbortError' }))
  assert.deepEqual([rNet.status, rNet.body.error], [502, 'unavailable'])
  assert.ok(!JSON.stringify([r422, r429, r500, rNet]).includes('test-token'))
})

test('same-origin guard', () => {
  assert.equal(isSameOrigin(undefined, 'convrt.studio'), true)
  assert.equal(isSameOrigin('https://convrt.studio', 'convrt.studio'), true)
  assert.equal(isSameOrigin('https://evil.example', 'convrt.studio'), false)
  assert.equal(isSameOrigin('not a url', 'convrt.studio'), false)
})

/* ── Handler (plain Node req/res) ── */
function call({ method = 'POST', headers = {}, body }) {
  return new Promise((resolve) => {
    const out = { headers: {} }
    const res = {
      setHeader: (k, v) => { out.headers[k.toLowerCase()] = v },
      end: (s) => resolve({ status: res.statusCode, headers: out.headers, body: s ? JSON.parse(s) : null }),
    }
    handler({ method, headers: { host: 'convrt.studio', ...headers }, body }, res)
  })
}

test('handler: 405 for GET, 403 for cross-origin, 400 for unparseable body, 503 when unconfigured', async () => {
  for (const k of Object.keys(ENV)) delete process.env[k]
  assert.equal((await call({ method: 'GET' })).status, 405)
  assert.equal((await call({ headers: { origin: 'https://evil.example' }, body: {} })).status, 403)
  assert.equal((await call({ body: '{not json' })).status, 400)
  const r = await call({ headers: { origin: 'https://convrt.studio' }, body: { industry: 'saas', email: 'a@b.co' } })
  assert.equal(r.status, 503)
  assert.equal(r.headers['cache-control'], 'no-store')
})

/* ───────── owner alert (Resend) ───────── */
import { RESEND_ENDPOINT, DEFAULT_NOTIFY_TO } from '../api/_lib/notify.js'

const twoServiceFetch = ({ mlStatus = 201, mlPayload = { data: { status: 'active' } }, resendStatus = 200, resendThrows } = {}) => {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) })
    if (url === RESEND_ENDPOINT) {
      if (resendThrows) throw Object.assign(new Error('boom'), { name: resendThrows })
      return { status: resendStatus, headers: { get: () => null }, json: async () => ({ id: 'x' }) }
    }
    return { status: mlStatus, headers: { get: () => null }, json: async () => mlPayload }
  }
  fn.calls = calls
  return fn
}
const resendCalls = (f) => f.calls.filter((c) => c.url === RESEND_ENDPOINT)
const ALERT_ENV = { ...ENV, RESEND_API_KEY: 're_test_123' }

test('owner alert: no RESEND_API_KEY → nothing sent, signup unchanged', async () => {
  const f = twoServiceFetch()
  const r = await run({ industry: 'saas', email: 'jane@example.com' }, f)
  assert.equal(r.status, 200)
  assert.equal(resendCalls(f).length, 0)
})

test('owner alert: new signup emails mohamed@convrt.studio with email, industry and consent; Reply-To = subscriber', async () => {
  const f = twoServiceFetch()
  const r = await run({ industry: 'ecommerce', email: ' Jane@Example.com ', marketingConsent: true }, f, ALERT_ENV)
  assert.deepEqual(r.body, { ok: true, confirmation: false })
  const calls = resendCalls(f)
  assert.equal(calls.length, 1)
  const { init, body } = calls[0]
  assert.equal(init.headers.Authorization, 'Bearer re_test_123')
  assert.deepEqual(body.to, [DEFAULT_NOTIFY_TO])
  assert.equal(body.reply_to, 'jane@example.com')
  assert.match(body.subject, /hooks/i)
  assert.match(body.subject, /E-commerce/)
  for (const s of ['jane@example.com', 'E-commerce / DTC', 'New subscriber', 'OK to send tips and offers: Yes']) assert.ok(body.text.includes(s), s)
})

test('owner alert: repeat signups and unconfirmed (double opt-in) are labelled', async () => {
  const f = twoServiceFetch({ mlStatus: 200, mlPayload: { data: { status: 'unconfirmed' } } })
  const r = await run({ industry: 'saas', email: 'jane@example.com' }, f, ALERT_ENV)
  assert.deepEqual(r.body, { ok: true, confirmation: true })
  const { body } = resendCalls(f)[0]
  assert.ok(body.text.includes('Already on the list'))
  assert.ok(body.text.includes('waiting on their confirmation email'))
  assert.ok(body.text.includes('OK to send tips and offers: No'))
})

test('owner alert: Resend failing never fails the signup', async () => {
  for (const f of [twoServiceFetch({ resendStatus: 500 }), twoServiceFetch({ resendThrows: 'AbortError' })]) {
    const r = await run({ industry: 'saas', email: 'jane@example.com' }, f, ALERT_ENV)
    assert.equal(r.status, 200)
    assert.deepEqual(r.body, { ok: true, confirmation: false })
  }
})

test('owner alert: not sent for bots or invalid input', async () => {
  const f = twoServiceFetch()
  await run({ industry: 'saas', email: 'jane@example.com', company: 'Bot Inc' }, f, ALERT_ENV)
  await run({ industry: 'nope', email: 'jane@example.com' }, f, ALERT_ENV)
  await run({ industry: 'saas', email: 'nope' }, f, ALERT_ENV)
  assert.equal(f.calls.length, 0)
})

test('owner alert: still sent, flagged NOT SAVED, when MailerLite refuses or fails — no email is ever lost', async () => {
  const cases = [
    [twoServiceFetch({ mlPayload: { data: { status: 'unsubscribed' } } }), 409],
    [twoServiceFetch({ mlStatus: 500, mlPayload: { message: 'down' } }), 502],
    [twoServiceFetch({ mlStatus: 429, mlPayload: {} }), 429],
  ]
  for (const [f, expected] of cases) {
    const r = await run({ industry: 'saas', email: 'jane@example.com' }, f, ALERT_ENV)
    assert.equal(r.status, expected) // the visitor still sees the honest error
    const calls = resendCalls(f)
    assert.equal(calls.length, 1)
    assert.match(calls[0].body.subject, /^\[NOT SAVED\]/)
    assert.ok(calls[0].body.text.includes('jane@example.com'))
    assert.ok(calls[0].body.text.includes('Saved to MailerLite: NO'))
  }
})

test('owner alert: still sent when the server is not configured for MailerLite (503)', async () => {
  const f = twoServiceFetch()
  const r = await run({ industry: 'saas', email: 'jane@example.com' }, f, { RESEND_API_KEY: 'k' })
  assert.equal(r.status, 503)
  const calls = resendCalls(f)
  assert.equal(calls.length, 1)
  assert.match(calls[0].body.subject, /NOT SAVED/)
})
