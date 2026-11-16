// Run with: node --test tests/creator-retention.test.mjs
// The automated retention clean-up: what is deleted when, what is never touched, and the safeguards. Fake clock, fake Cloudflare.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeHarness, creator, admin, adminLogin, validProfile, dummyJpeg, call } from './helpers/creatorHarness.mjs'
import { cronHandler } from '../api/_lib/creator/handlers.js'
import { createService } from '../api/_lib/creator/service.js'
import { ACCEPTANCES, RETENTION } from '../src/lib/creator/constants.js'
import { AGREEMENT_VERSION, PRIVACY_VERSION } from '../src/content/creatorLegal.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DAY = 86_400_000
const CRON_SECRET = 'cron-secret-for-tests-1234'

/* A harness whose clock the test controls, plus a service handle for running the clean-up. */
async function setup() {
  let clock = Date.parse('2026-12-01T10:00:00Z')
  const h = makeHarness({ now: () => clock, env: { CRON_SECRET } })
  const { cookie } = await adminLogin(h.deps)
  const A = admin(h.deps, cookie)
  const advance = (days) => { clock += days * DAY }
  const newCreator = async (name = 'Test Creator Dummy', { photo = true } = {}) => {
    const created = await A('invite-create', { method: 'POST', body: { label: 'r', source: 'fiverr', expiresInDays: 7 } })
    const token = new URL(created.json.url).searchParams.get('invite')
    const C = creator(h.deps, token)
    const uids = []
    for (const slot of [1, 2, 3]) {
      const a = await C('video-upload', { method: 'POST', body: { slot, filename: `v${slot}.mp4`, type: 'video/mp4', size: 5_000_000 } })
      const uid = a.json.uploadURL.split('/').pop()
      h.cfake.finish(uid)
      await C('video-status', { method: 'POST', body: { slot } })
      uids.push(uid)
    }
    let sha = null
    if (photo) {
      await C('photo', { method: 'POST', raw: dummyJpeg(), headers: { 'content-type': 'image/jpeg' } })
      sha = (await h.store.get(`cr:invite:${created.json.invite.id}`)).photo.sha256
    }
    const r = await C('submit', { method: 'POST', body: {
      profile: validProfile({ legalName: name, displayName: name.split(' ')[0] }), accepted: Object.fromEntries(ACCEPTANCES.map((x) => [x.key, true])), signature: name,
      agreementVersion: AGREEMENT_VERSION, privacyVersion: PRIVACY_VERSION, assets: { videos: uids, photo: sha },
    } })
    assert.equal(r.status, 200, JSON.stringify(r.json))
    return { ref: created.json.invite.id, uids, C }
  }
  const run = () => h.deps.service.runRetention()
  return { ...h, A, advance, newCreator, run, getSub: (ref) => h.store.get(`cr:sub:${ref}`) }
}

test('rejected: media kept for 90 days, then deleted; the signed record stays; a second run changes nothing', async () => {
  const t = await setup()
  const c = await t.newCreator()
  await t.A('set-status', { method: 'POST', body: { id: c.ref, status: 'rejected', note: 'no' } })

  t.advance(RETENTION.mediaAfterDecisionDays - 1)
  assert.deepEqual((await t.run()).mediaDeleted, 0, 'day 89: nothing yet')
  for (const uid of c.uids) assert.ok(t.cfake.videos.has(uid))

  t.advance(2)
  const report = await t.run()
  assert.equal(report.mediaDeleted, 1)
  for (const uid of c.uids) assert.equal(t.cfake.videos.has(uid), false, 'videos gone from Cloudflare')
  assert.equal(await t.store.get(`cr:photo:${c.ref}`), null, 'photo gone')
  const s = await t.getSub(c.ref)
  assert.ok(s.assets.videos.every((v) => v.deletedAt) && s.assets.photo.deletedAt)
  assert.ok(s.acceptance.signature && s.acceptance.agreement.text, 'the signed record is kept')
  assert.ok(s.history.some((h) => h.action === 'media_deleted_by_retention'))
  assert.deepEqual(await t.run(), { mediaDeleted: 0, abandonedPurged: 0, recordsDeleted: 0, failures: 0, pendingDeletions: [] }, 'idempotent')
})

test('withdrawn: media kept by "keep files" is deleted at the NEXT run, with no 90-day wait', async () => {
  const t = await setup()
  const c = await t.newCreator()
  await t.A('set-status', { method: 'POST', body: { id: c.ref, status: 'approved' } })
  await t.A('withdraw', { method: 'POST', body: { id: c.ref, requestedVia: 'Fiverr', deleteFiles: false } })
  assert.equal(t.cfake.videos.size, 3)
  t.advance(1)
  assert.equal((await t.run()).mediaDeleted, 1)
  assert.equal(t.cfake.videos.size, 0)
  const s = await t.getSub(c.ref)
  assert.equal(s.withdrawal.filesDeleted, true)
  assert.equal(s.publishable, false)
})

test('approved and pending submissions are never touched, even years later', async () => {
  const t = await setup()
  const approved = await t.newCreator('Approved Person')
  const pending = await t.newCreator('Pending Person')
  await t.A('set-status', { method: 'POST', body: { id: approved.ref, status: 'approved' } })
  t.advance(365 * 8)
  const report = await t.run()
  assert.deepEqual([report.mediaDeleted, report.recordsDeleted, report.abandonedPurged], [0, 0, 0])
  assert.equal(t.cfake.videos.size, 6)
  assert.ok(await t.getSub(approved.ref) && await t.getSub(pending.ref))
})

test('signed records of rejected/withdrawn submissions are deleted after six years, never while media remains', async () => {
  const t = await setup()
  const c = await t.newCreator()
  const stuck = await t.newCreator('Stuck Person')
  for (const x of [c, stuck]) await t.A('set-status', { method: 'POST', body: { id: x.ref, status: 'rejected' } })

  // Cloudflare refuses to delete the "stuck" creator's videos for a long time.
  const real = t.cfake.fetchImpl
  const failing = async (url, init = {}) => (init.method === 'DELETE' && stuck.uids.some((u) => String(url).includes(u)) ? { ok: false, status: 500, json: async () => ({ success: false }) } : real(url, init))
  t.cfake.fetchImpl = failing

  t.advance(95)
  await t.run() // media deleted for c; fails for stuck
  t.advance(365 * 5)
  assert.equal((await t.run()).recordsDeleted, 0, 'before six years the record stays')
  assert.ok(await t.getSub(c.ref))

  t.advance(365 * 2)
  const later = await t.run()
  assert.equal(later.recordsDeleted, 1, 'c: past six years and no media left, so the record is deleted')
  assert.equal(await t.getSub(c.ref), null)
  assert.ok(!(await t.store.smembers('cr:subs')).includes(c.ref), 'and it is removed from the index')
  assert.ok(await t.getSub(stuck.ref), 'stuck: far older than six years, but its media still exists, so the record is KEPT')
  assert.ok(later.pendingDeletions.includes(stuck.ref))

  t.cfake.fetchImpl = real // the provider recovers
  const recovered = await t.run()
  assert.equal(recovered.mediaDeleted, 1)
  assert.equal(recovered.recordsDeleted, 1, 'only now, with its media confirmed gone, is the old record deleted')
  assert.equal(t.cfake.videos.size, 0)
})

test('abandoned uploads and drafts are purged 14 days after the invitation expires; submitted invitations are untouched', async () => {
  const t = await setup()
  const submitted = await t.newCreator('Submitted Person')
  const created = await t.A('invite-create', { method: 'POST', body: { label: 'abandoned', source: 'fiverr', expiresInDays: 7 } })
  const token = new URL(created.json.url).searchParams.get('invite')
  const C = creator(t.deps, token)
  await C('draft', { method: 'POST', body: validProfile({ displayName: 'Left Midway' }) })
  const a = await C('video-upload', { method: 'POST', body: { slot: 1, filename: 'half.mp4', type: 'video/mp4', size: 1000 } })
  const uid = a.json.uploadURL.split('/').pop()
  t.cfake.finish(uid)
  await C('video-status', { method: 'POST', body: { slot: 1 } })

  t.advance(7 + 13)
  assert.equal((await t.run()).abandonedPurged, 0, 'day 13 after expiry: kept')
  t.advance(2)
  assert.equal((await t.run()).abandonedPurged, 1)
  assert.equal(t.cfake.videos.has(uid), false)
  const inv = await t.store.get(`cr:invite:${created.json.invite.id}`)
  assert.equal(inv.status, 'purged')
  assert.deepEqual([inv.videos, inv.photo, inv.draft], [{}, null, {}])
  assert.equal((await C('session')).status, 401, 'the old link no longer works')
  assert.ok(await t.getSub(submitted.ref), 'a submitted invitation is not affected')
})

test('deletion failures: media and record are kept, counted, retried the next day and emailed to the owner without personal data', async () => {
  const t = await setup()
  const c = await t.newCreator('Priya Nandakumar')
  await t.A('set-status', { method: 'POST', body: { id: c.ref, status: 'rejected' } })
  t.advance(91)
  const real = t.cfake.fetchImpl
  t.cfake.fetchImpl = async (url, init = {}) => (init.method === 'DELETE' ? { ok: false, status: 500, json: async () => ({ success: false }) } : real(url, init))
  const first = await t.run()
  assert.equal(first.failures, 1)
  assert.deepEqual(first.pendingDeletions, [c.ref])
  assert.equal(t.cfake.videos.size, 3, 'nothing was lost')
  let s = await t.getSub(c.ref)
  assert.equal(s.retention.failures, 1)
  assert.ok(s.assets.videos.every((v) => !v.deletedAt), 'not marked deleted when it was not')

  const alert = t.emails.at(-1)
  assert.match(alert.subject, /could not be deleted/)
  assert.ok(alert.text.includes(c.ref), 'the reference is listed')
  assert.ok(!alert.text.includes('Priya') && !alert.text.includes('Nandakumar'), 'no personal data in the alert')

  t.cfake.fetchImpl = real // the provider recovers
  t.advance(1)
  const second = await t.run()
  assert.equal(second.mediaDeleted, 1)
  assert.equal(t.cfake.videos.size, 0)
  s = await t.getSub(c.ref)
  assert.equal(s.retention, undefined, 'the failure counter is cleared once it succeeds')
})

test('a deletion that "succeeds" but leaves the video behind is treated as a failure (deletions are verified)', async () => {
  const t = await setup()
  const c = await t.newCreator()
  await t.A('set-status', { method: 'POST', body: { id: c.ref, status: 'rejected' } })
  t.advance(91)
  const real = t.cfake.fetchImpl
  t.cfake.fetchImpl = async (url, init = {}) => (init.method === 'DELETE' ? { ok: true, status: 200, json: async () => ({ success: true, result: '' }) } : real(url, init))
  const report = await t.run()
  assert.equal(report.failures, 1, 'the video still exists, so it is not recorded as deleted')
  assert.ok((await t.getSub(c.ref)).assets.videos.every((v) => !v.deletedAt))
})

test('the daily job endpoint only runs with the cron secret', async () => {
  const t = await setup()
  const get = (headers = {}, env = { CRON_SECRET }) => call(cronHandler, { ...t.deps, env }, { path: '/api/creator-cron', headers })
  assert.equal((await get({}, {})).status, 503, 'refuses to run without a configured secret')
  assert.equal((await get()).status, 401)
  assert.equal((await get({ authorization: 'Bearer wrong' })).status, 401)
  const ok = await get({ authorization: `Bearer ${CRON_SECRET}` })
  assert.equal(ok.status, 200)
  assert.deepEqual(Object.keys(ok.json.report).sort(), ['abandonedPurged', 'failures', 'mediaDeleted', 'pendingDeletions', 'recordsDeleted'])
  assert.equal((await call(cronHandler, t.deps, { method: 'POST', path: '/api/creator-cron', headers: { authorization: `Bearer ${CRON_SECRET}` } })).status, 405)
})

test('vercel.json schedules the job daily; the policy numbers match the owner decision', () => {
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))
  assert.deepEqual(v.crons.map((c) => c.path), ['/api/creator-cron'])
  assert.match(v.crons[0].schedule, /^\d+ \d+ \* \* \*$/, 'once a day')
  assert.deepEqual(RETENTION, { mediaAfterDecisionDays: 90, abandonedAfterExpiryDays: 14, recordYears: 6 })
  assert.ok(fs.existsSync(path.join(ROOT, 'api/creator-cron.js')))
})
