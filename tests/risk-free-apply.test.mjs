// Run with: node --test tests/risk-free-apply.test.mjs
// Exercises the shared validation, api/_lib/apply.js and the Vercel handler with
// a fake MailerLite (injected fetch) — no network, no real credentials.
import test from 'node:test'
import assert from 'node:assert/strict'
import { processApplication } from '../api/_lib/apply.js'
import { MAILERLITE_ENDPOINT } from '../api/_lib/subscribe.js'
import handler from '../api/risk-free-apply.js'
import { QUESTIONS, validateApplication, normalizeApplication } from '../src/lib/riskFreeQuestions.js'

const ENV = { MAILERLITE_API_TOKEN: 'test-token-abc', MAILERLITE_GROUP_RISK_FREE_ID: '333' }

const valid = (over = {}) => ({
  businessType: 'SaaS / Software',
  adSpend: 'Not running paid ads yet',
  videosPerMonth: '0–2 videos',
  videoType: 'UGC / Creator-led ad',
  timeline: 'Immediately / This month',
  ongoing: 'Possibly, depending on the results',
  fullName: '  Jane Doe ',
  email: ' Jane@Example.com ',
  website: 'example.com',
  brief: '',
  ...over,
})

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

const run = (body, fetchImpl, env = ENV) => processApplication({ body, env, fetchImpl })

test('six questions with the expected option counts', () => {
  assert.equal(QUESTIONS.length, 6)
  assert.deepEqual(QUESTIONS.map((q) => q.options.length), [4, 4, 4, 4, 3, 3])
})

test('"Not running paid ads yet" is accepted — no minimum ad spend', () => {
  assert.deepEqual(validateApplication(valid({ adSpend: 'Not running paid ads yet' })), {})
})

test('"only interested in the free video" is still saved for manual review, never auto-rejected', async () => {
  const f = fakeFetch(201, { data: { status: 'active' } })
  const r = await run(valid({ ongoing: 'No, we’re only interested in the free video' }), f)
  assert.equal(r.status, 200)
  assert.equal(f.calls.length, 1)
})

test('validation reports every missing / invalid field', () => {
  const errs = validateApplication({ website: 'not a site', email: 'nope' })
  for (const q of QUESTIONS) assert.ok(errs[q.field], q.field)
  assert.ok(errs.fullName && errs.email && errs.website)
  assert.equal(errs.brief, undefined) // optional
})

test('rejects options not in the list, and over-long text', () => {
  assert.ok(validateApplication(valid({ businessType: 'Crypto' })).businessType)
  assert.ok(validateApplication(valid({ brief: 'x'.repeat(1001) })).brief)
  assert.ok(validateApplication(valid({ fullName: 'x'.repeat(101) })).fullName)
})

test('website: bare domain, www, https and paths are valid; spaces and emails are not', () => {
  for (const w of ['example.com', 'www.example.co.uk', 'https://example.com/path?x=1', 'http://sub.example.io']) {
    assert.equal(validateApplication(valid({ website: w })).website, undefined, w)
  }
  for (const w of ['', 'example', 'exa mple.com', 'me@example.com']) {
    assert.ok(validateApplication(valid({ website: w })).website, w)
  }
  assert.equal(normalizeApplication(valid()).website, 'https://example.com')
})

test('a valid application is saved to the risk-free group with bearer token, mapped fields, no status', async () => {
  const f = fakeFetch(201, { data: { status: 'active' } })
  const r = await run(valid({ brief: 'A spokesperson demo' }), f)
  assert.equal(r.status, 200)
  assert.deepEqual(r.body, { ok: true })
  assert.equal(f.calls.length, 1)
  assert.equal(f.calls[0].url, MAILERLITE_ENDPOINT)
  assert.equal(f.calls[0].init.headers.Authorization, 'Bearer test-token-abc')
  assert.deepEqual(f.calls[0].body, {
    email: 'jane@example.com',
    fields: {
      name: 'Jane Doe',
      website: 'https://example.com',
      business_type: 'SaaS / Software',
      ad_spend: 'Not running paid ads yet',
      videos_per_month: '0–2 videos',
      video_type: 'UGC / Creator-led ad',
      timeline: 'Immediately / This month',
      ongoing_interest: 'Possibly, depending on the results',
      brief: 'A spokesperson demo',
    },
    groups: ['333'],
  })
  assert.ok(!('status' in f.calls[0].body))
})

test('the response never carries a booking link — no auto-approval', async () => {
  const r = await run(valid(), fakeFetch(201, { data: { status: 'active' } }))
  assert.deepEqual(Object.keys(r.body), ['ok'])
})

test('a repeat application (200) is an idempotent success', async () => {
  const r = await run(valid(), fakeFetch(200, { data: { status: 'active' } }))
  assert.equal(r.status, 200)
  assert.equal(r.body.ok, true)
})

test('unsubscribed / bounced / junk contacts are not reported as success', async () => {
  for (const status of ['unsubscribed', 'bounced', 'junk']) {
    const r = await run(valid(), fakeFetch(200, { data: { status } }))
    assert.equal(r.status, 409)
    assert.equal(r.body.error, 'cannot_subscribe')
  }
})

test('invalid applications never reach MailerLite', async () => {
  const f = fakeFetch(201, {})
  const r = await run(valid({ email: 'nope' }), f)
  assert.equal(r.status, 422)
  assert.equal(r.body.error, 'invalid_application')
  assert.deepEqual(r.body.fields, ['email'])
  assert.equal(f.calls.length, 0)
})

test('honeypot: bots get a fake success and nothing is saved', async () => {
  const f = fakeFetch(201, {})
  const r = await run({ ...valid(), company: 'Spam Inc' }, f)
  assert.equal(r.status, 200)
  assert.equal(f.calls.length, 0)
})

test('missing configuration answers 503, never a false success', async () => {
  const f = fakeFetch(201, {})
  for (const env of [{}, { MAILERLITE_API_TOKEN: 't' }, { MAILERLITE_GROUP_RISK_FREE_ID: '333' }, { ...ENV, MAILERLITE_GROUP_RISK_FREE_ID: 'abc' }]) {
    const r = await run(valid(), f, env)
    assert.equal(r.status, 503)
  }
  assert.equal(f.calls.length, 0)
})

test('upstream errors map to safe responses', async () => {
  const limited = await run(valid(), fakeFetch(429, {}, { headers: { 'retry-after': '30' } }))
  assert.equal(limited.body.error, 'rate_limited')
  assert.equal(limited.headers['Retry-After'], '30')
  assert.equal((await run(valid(), fakeFetch(401, {}))).status, 503)
  assert.equal((await run(valid(), fakeFetch(500, {}))).status, 502)
  assert.equal((await run(valid(), fakeFetch(422, { errors: { email: ['bad'] } }))).body.error, 'invalid_application')
  assert.equal((await run(valid(), fakeFetch(422, { errors: { website: ['unknown field'] } }))).status, 502)
  assert.equal((await run(valid(), fakeFetch(200, {}, { throws: 'AbortError' }))).status, 502)
})

// ── handler ────────────────────────────────────────────────────────────────
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

test('handler: valid same-origin request without server config answers 503', async () => {
  const saved = { ...process.env }
  delete process.env.MAILERLITE_API_TOKEN
  delete process.env.MAILERLITE_GROUP_RISK_FREE_ID
  try {
    const res = mockRes()
    await handler({ method: 'POST', headers: { origin: 'https://www.convrt.studio', host: 'www.convrt.studio' }, body: valid() }, res)
    assert.equal(res.statusCode, 503)
    assert.equal(JSON.parse(res.body).error, 'unavailable')
  } finally {
    Object.assign(process.env, saved)
  }
})

/* ───────── owner alert (Resend) ───────── */
import { RESEND_ENDPOINT, DEFAULT_NOTIFY_TO, DEFAULT_NOTIFY_FROM } from '../api/_lib/apply.js'

// One fake fetch for both services: MailerLite then Resend, told apart by URL.
const twoServiceFetch = ({ resendStatus = 200, resendThrows } = {}) => {
  const calls = []
  const fn = async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push({ url, init, body })
    if (url === RESEND_ENDPOINT) {
      if (resendThrows) throw Object.assign(new Error('boom'), { name: resendThrows })
      return { status: resendStatus, headers: { get: () => null }, json: async () => ({ id: 'x' }) }
    }
    return { status: 201, headers: { get: () => null }, json: async () => ({ data: { status: 'active' } }) }
  }
  fn.calls = calls
  return fn
}
const resendCalls = (f) => f.calls.filter((c) => c.url === RESEND_ENDPOINT)

test('owner alert: no RESEND_API_KEY → nothing is sent, application still succeeds', async () => {
  const f = twoServiceFetch()
  const r = await run(valid(), f)
  assert.equal(r.status, 200)
  assert.equal(resendCalls(f).length, 0)
})

test('owner alert: sends one email to mohamed@convrt.studio with every answer and Reply-To = applicant', async () => {
  const f = twoServiceFetch()
  const r = await run(valid({ brief: 'We sell candles' }), f, { ...ENV, RESEND_API_KEY: 're_test_123' })
  assert.equal(r.status, 200)
  const calls = resendCalls(f)
  assert.equal(calls.length, 1)
  const { init, body } = calls[0]
  assert.equal(init.headers.Authorization, 'Bearer re_test_123')
  assert.deepEqual(body.to, [DEFAULT_NOTIFY_TO])
  assert.equal(DEFAULT_NOTIFY_TO, 'mohamed@convrt.studio')
  assert.equal(body.from, DEFAULT_NOTIFY_FROM)
  assert.equal(body.reply_to, 'jane@example.com')
  assert.match(body.subject, /Jane Doe/)
  for (const s of ['Jane Doe', 'jane@example.com', 'SaaS / Software', 'Not running paid ads yet', 'We sell candles']) {
    assert.ok(body.text.includes(s), s)
  }
})

test('owner alert: NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM override the defaults', async () => {
  const f = twoServiceFetch()
  await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k', NOTIFY_EMAIL_TO: 'team@convrt.studio', NOTIFY_EMAIL_FROM: 'CONVRT <apply@convrt.studio>' })
  const { body } = resendCalls(f)[0]
  assert.deepEqual(body.to, ['team@convrt.studio'])
  assert.equal(body.from, 'CONVRT <apply@convrt.studio>')
})

test('owner alert: applicant text is HTML-escaped in the email body', async () => {
  const f = twoServiceFetch()
  await run(valid({ brief: '<script>alert(1)</script>' }), f, { ...ENV, RESEND_API_KEY: 'k' })
  const { body } = resendCalls(f)[0]
  assert.ok(!body.html.includes('<script>'))
  assert.ok(body.html.includes('&lt;script&gt;'))
})

test('owner alert: Resend failing (error status or network) never fails the application', async () => {
  for (const f of [twoServiceFetch({ resendStatus: 500 }), twoServiceFetch({ resendThrows: 'AbortError' })]) {
    const r = await run(valid(), f, { ...ENV, RESEND_API_KEY: 'k' })
    assert.equal(r.status, 200)
    assert.deepEqual(r.body, { ok: true })
  }
})

test('owner alert: not sent for honeypot bots, invalid applications or when MailerLite did not save', async () => {
  const env = { ...ENV, RESEND_API_KEY: 'k' }
  let f = twoServiceFetch()
  await run(valid({ company: 'Bot Inc' }), f, env)
  await run({ email: 'nope' }, f, env)
  assert.equal(f.calls.length, 0)

  f = fakeFetch(500, { message: 'down' })
  const r = await run(valid(), f, env)
  assert.equal(r.status, 502)
  assert.equal(f.calls.filter((c) => c.url === RESEND_ENDPOINT).length, 0)
})
