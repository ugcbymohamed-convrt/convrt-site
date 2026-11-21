// Run with: node --test tests/mailerlite-audit.test.mjs
// The read-only MailerLite consent audit (scripts/audit-mailerlite-consent.mjs) against a FAKE MailerLite: no network, no token, no real contacts.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAudit, summary, classify } from '../scripts/audit-mailerlite-consent.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const ENV = {
  MAILERLITE_GROUP_SAAS_ID: '1', MAILERLITE_GROUP_ECOMMERCE_ID: '2', MAILERLITE_GROUP_RISK_FREE_ID: '3',
  MAILERLITE_GROUP_REFERRALS_ID: '4', MAILERLITE_GROUP_MARKETING_ID: '9',
}
const SUBS = [
  { id: 1, email: 'a@x.co', status: 'active', fields: { marketing_consent: 'opted_in' } },        // consent_recorded (+ marketing group)
  { id: 2, email: 'b@x.co', status: 'active', fields: {} },                                          // marketing_group_only (legacy opt-in)
  { id: 3, email: 'c@x.co', status: 'active', fields: {} },                                          // service_only
  { id: 4, email: 'd@x.co', status: 'unsubscribed', fields: { marketing_consent: 'opted_in' } },    // suppressed
  { id: 5, email: 'e@x.co', status: 'unconfirmed', fields: {} },                                     // no_known_group
  { id: 6, email: 'f@x.co', status: 'active', fields: { marketing_consent: 'opted_in' } },          // consent record, NOT in marketing group
]
const GROUP_MEMBERS = { 1: [3], 2: [], 3: [3, 6], 4: [], 9: [1, 2] }

function fake({ failCampaigns = false } = {}) {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url, method: init.method })
    const u = new URL(url)
    const limit = Number(u.searchParams.get('limit'))
    assert.equal(limit, 100)
    const m = u.pathname.match(/\/api\/groups\/(\d+)\/subscribers/)
    if (m) return { status: 200, json: async () => ({ data: (GROUP_MEMBERS[m[1]] || []).map((id) => ({ id })), meta: { next_cursor: null } }) }
    if (u.pathname === '/api/subscribers') {
      // two pages, to prove pagination follows the cursor
      const cursor = u.searchParams.get('cursor')
      if (!cursor) return { status: 200, json: async () => ({ data: SUBS.slice(0, 3), meta: { next_cursor: 'c2' } }) }
      return { status: 200, json: async () => ({ data: SUBS.slice(3), meta: { next_cursor: null } }) }
    }
    if (u.pathname === '/api/campaigns') {
      if (failCampaigns) return { status: 403, json: async () => ({}) }
      return { status: 200, json: async () => ({ data: [], meta: { next_cursor: null } }) }
    }
    throw new Error(`unexpected request ${url}`)
  }
  fn.calls = calls
  return fn
}

test('categorises every subscriber by consent evidence and counts nothing it should not', async () => {
  const f = fake()
  const r = await runAudit({ token: 't', env: ENV, fetchImpl: f, delayMs: 0 })
  assert.equal(r.counts.total, 6)
  assert.deepEqual(r.counts.byCategory, { consent_recorded: 2, marketing_group_only: 1, service_only: 1, suppressed: 1, no_known_group: 1 })
  assert.equal(r.counts.consentRecordNotInMarketingGroup, 1)
  assert.deepEqual(r.counts.byStatus, { active: 4, unsubscribed: 1, unconfirmed: 1 })
  assert.equal(r.sentCampaigns, 0)
  assert.match(summary(r), /Promotional campaigns already sent: 0/)
  assert.match(summary(r), /Nothing was changed in MailerLite/)
})

test('READ-ONLY: every request is a GET, and the script source contains no write method', async () => {
  const f = fake()
  await runAudit({ token: 't', env: ENV, fetchImpl: f, delayMs: 0 })
  assert.ok(f.calls.length >= 8)
  assert.ok(f.calls.every((c) => c.method === 'GET'))
  const src = fs.readFileSync(path.join(ROOT, 'scripts/audit-mailerlite-consent.mjs'), 'utf8')
  for (const verb of ['POST', 'PUT', 'PATCH', 'DELETE']) assert.ok(!new RegExp(`method:\\s*['"]${verb}['"]`).test(src), verb)
  assert.equal((src.match(/method: 'GET'/g) || []).length, 1, 'one network function')
  assert.ok(!/\/forget|\/unsubscribe|resubscribe/.test(src))
})

test('a suppressed contact is never reported as having usable consent, even with a consent record', () => {
  assert.equal(classify({ status: 'unsubscribed' }, ['marketing'], true), 'suppressed')
  assert.equal(classify({ status: 'bounced' }, [], true), 'suppressed')
  assert.equal(classify({ status: 'junk' }, ['hooks_saas'], false), 'suppressed')
  assert.equal(classify({ status: 'active' }, ['hooks_saas', 'marketing'], false), 'marketing_group_only')
  assert.equal(classify({ status: 'active' }, ['referral_partners'], false), 'service_only')
  assert.equal(classify({ status: 'active' }, [], false), 'no_known_group')
})

test('the summary holds counts only: no email address', async () => {
  const r = await runAudit({ token: 't', env: ENV, fetchImpl: fake(), delayMs: 0 })
  assert.ok(!/@x\.co/.test(summary(r)))
})

test('a token that cannot read campaigns is reported as unknown, not as zero; unset group ids are listed as not audited', async () => {
  const r = await runAudit({ token: 't', env: { MAILERLITE_GROUP_SAAS_ID: '1' }, fetchImpl: fake({ failCampaigns: true }), delayMs: 0 })
  assert.equal(r.sentCampaigns, null)
  assert.match(summary(r), /unknown/)
  assert.deepEqual(r.groupsMissing, ['hooks_ecommerce', 'risk_free_applications', 'referral_partners', 'marketing'])
})

test('no token → refuses to run', async () => {
  await assert.rejects(() => runAudit({ token: '', env: ENV, fetchImpl: fake(), delayMs: 0 }), /MAILERLITE_API_TOKEN is required/)
})
