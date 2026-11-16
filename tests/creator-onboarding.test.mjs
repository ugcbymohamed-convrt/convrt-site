// Run with: node --test tests/creator-onboarding.test.mjs
// Drives the real Vercel handlers with an in-memory store, a fake Cloudflare Stream and a fake Resend.
// Dummy creator data only. No network, no credentials.
import test from 'node:test'
import assert from 'node:assert/strict'
import { makeHarness, creator, admin, adminLogin, validProfile, dummyJpeg } from './helpers/creatorHarness.mjs'
import { ACCEPTANCES } from '../src/lib/creator/constants.js'
import { AGREEMENT_VERSION, PRIVACY_VERSION } from '../src/content/creatorLegal.js'
import { sha256 } from '../api/_lib/creator/crypto.js'

const DAY = 86_400_000

/* Creates an invitation as the owner and returns everything a test needs. */
async function setup(opts = {}) {
  const h = makeHarness(opts)
  const { cookie } = await adminLogin(h.deps)
  const A = admin(h.deps, cookie)
  const created = await A('invite-create', { method: 'POST', body: { label: 'fiverr: testy', source: opts.source || 'fiverr', expiresInDays: 7 } })
  assert.equal(created.status, 200, JSON.stringify(created.json))
  const token = new URL(created.json.url).searchParams.get('invite')
  return { ...h, A, cookie, token, ref: created.json.invite.id, C: creator(h.deps, token), invite: created.json.invite }
}

/* Uploads one video for a slot through the real flow: authorisation → "browser uploads" → Cloudflare ready → status. */
async function uploadVideo(t, slot, over = {}) {
  const auth = await t.C('video-upload', { method: 'POST', body: { slot, filename: `clip${slot}.mp4`, type: 'video/mp4', size: 5_000_000 } })
  assert.equal(auth.status, 200, JSON.stringify(auth.json))
  const uid = auth.json.uploadURL.split('/').pop()
  t.cfake.finish(uid, over)
  const st = await t.C('video-status', { method: 'POST', body: { slot } })
  return { auth, uid, st }
}

async function uploadAll(t) {
  const uids = []
  for (const slot of [1, 2, 3]) uids.push((await uploadVideo(t, slot)).uid)
  return uids
}

const accepted = () => Object.fromEntries(ACCEPTANCES.map((a) => [a.key, true]))
const submission = (uids, over = {}) => ({
  profile: validProfile(),
  accepted: accepted(),
  signature: 'Test Creator Dummy',
  agreementVersion: AGREEMENT_VERSION,
  privacyVersion: PRIVACY_VERSION,
  assets: { videos: uids, photo: null },
  ...over,
})

// ───────────────────────── invitations ─────────────────────────
test('invite: no token, a wrong token and a malformed token are all rejected', async () => {
  const t = await setup()
  for (const bad of ['', 'x', 'a'.repeat(43), 'a'.repeat(300)]) {
    const r = await creator(t.deps, bad)('session')
    assert.equal(r.status, 401, `token "${bad.slice(0, 5)}"`)
    assert.equal(r.json.error, 'invite_invalid')
  }
})

test('invite: valid token works; only its SHA-256 hash is stored, never the token itself', async () => {
  const t = await setup()
  const r = await t.C('session')
  assert.equal(r.status, 200)
  assert.equal(r.json.status, 'open')
  assert.equal(r.json.ref, t.ref)
  assert.ok(t.token.length >= 40, 'token has real entropy')
  const rec = await t.store.get(`cr:invite:${t.ref}`)
  assert.equal(rec.tokenHash, sha256(t.token))
  assert.ok(!JSON.stringify(rec).includes(t.token), 'raw token not in the invite record')
  assert.ok(await t.store.get(`cr:tok:${sha256(t.token)}`))
  assert.equal(await t.store.get(`cr:tok:${t.token}`), null)
})

test('invite: expires, and expiry is enforced by the server clock', async () => {
  let clock = Date.parse('2026-12-01T10:00:00Z')
  const t = await setup({ now: () => clock })
  assert.equal((await t.C('session')).status, 200)
  clock += 7 * DAY + 1000
  const r = await t.C('session')
  assert.equal(r.status, 401)
  assert.equal(r.json.error, 'invite_expired')
  assert.equal((await t.C('video-upload', { method: 'POST', body: { slot: 1, filename: 'a.mp4', size: 10 } })).status, 401)
})

test('invite: expiry is clamped to 1–30 days; unknown source rejected', async () => {
  const t = await setup()
  const far = await t.A('invite-create', { method: 'POST', body: { label: 'x', expiresInDays: 9999 } })
  const span = Date.parse(far.json.invite.expiresAt) - Date.parse(far.json.invite.createdAt)
  assert.ok(span <= 30 * DAY)
  const bad = await t.A('invite-create', { method: 'POST', body: { label: 'x', source: 'tiktok' } })
  assert.equal(bad.status, 400)
})

test('invite: revoked and rotated links stop working immediately', async () => {
  const t = await setup()
  const rot = await t.A('invite-rotate', { method: 'POST', body: { id: t.ref } })
  const newToken = new URL(rot.json.url).searchParams.get('invite')
  assert.notEqual(newToken, t.token)
  assert.equal((await t.C('session')).status, 401, 'old link dead')
  assert.equal((await creator(t.deps, newToken)('session')).status, 200, 'new link live')
  await t.A('invite-revoke', { method: 'POST', body: { id: t.ref } })
  const r = await creator(t.deps, newToken)('session')
  assert.equal(r.status, 401)
})

test('invite: repeated bad tokens are throttled', async () => {
  const t = await setup()
  let last
  for (let i = 0; i < 25; i++) last = await creator(t.deps, 'z'.repeat(43))('session', { ip: '198.51.100.9' })
  assert.equal(last.status, 429)
})

test('invite: a draft saved earlier resumes with the same link (interrupted submission)', async () => {
  const t = await setup()
  await t.C('draft', { method: 'POST', body: validProfile({ displayName: 'Resume Me' }) })
  await uploadVideo(t, 1)
  const r = await t.C('session')
  assert.equal(r.json.draft.displayName, 'Resume Me')
  assert.equal(r.json.videos[1].state, 'ready')
})

// ───────────────────────── uploads ─────────────────────────
test('upload: direct-to-Cloudflare authorisation is private, short-lived, scoped to the submission, and returns no API token', async () => {
  const t = await setup()
  const r = await t.C('video-upload', { method: 'POST', body: { slot: 2, filename: 'demo.MOV', type: 'video/quicktime', size: 12_000_000 } })
  assert.equal(r.status, 200)
  assert.match(r.json.uploadURL, /^https:\/\/upload\.example\.test\//)
  assert.ok(!JSON.stringify(r.json).includes('cf-token-secret'), 'API token never reaches the browser')
  const cfCall = t.cfake.calls.find((c) => c.path.endsWith('/direct_upload'))
  assert.equal(cfCall.auth, 'Bearer cf-token-secret')
  assert.equal(cfCall.body.requireSignedURLs, true)
  assert.equal(cfCall.body.maxDurationSeconds, 180)
  assert.equal(cfCall.body.creator, t.ref)
  assert.equal(cfCall.body.meta.submissionId, t.ref)
  assert.ok(Date.parse(cfCall.body.expiry) - Date.now() <= 31 * 60_000, 'upload URL expires within ~30 minutes')
})

test('upload: wrong type, oversized, empty, bad slot are refused before any Cloudflare call', async () => {
  const t = await setup()
  const tries = [
    { slot: 1, filename: 'a.exe', type: 'application/octet-stream', size: 100 },
    { slot: 1, filename: 'a.mp4', type: 'video/mp4', size: 201 * 1024 * 1024 },
    { slot: 1, filename: 'a.mp4', type: 'video/mp4', size: 0 },
    { slot: 4, filename: 'a.mp4', type: 'video/mp4', size: 100 },
    { slot: 1, filename: 'a.mp4', type: 'text/html', size: 100 },
  ]
  for (const body of tries) {
    const r = await t.C('video-upload', { method: 'POST', body })
    assert.equal(r.status, 400, JSON.stringify(body))
  }
  assert.equal(t.cfake.calls.length, 0)
})

test('upload: status goes uploading → processing → ready; Cloudflare errors surface clearly', async () => {
  const t = await setup()
  const a = await t.C('video-upload', { method: 'POST', body: { slot: 1, filename: 'a.mp4', type: 'video/mp4', size: 1000 } })
  const uid = a.json.uploadURL.split('/').pop()
  assert.equal((await t.C('video-status', { method: 'POST', body: { slot: 1 } })).json.video.state, 'uploading')
  t.cfake.videos.get(uid).status = { state: 'inprogress', pctComplete: '40' }
  const p = await t.C('video-status', { method: 'POST', body: { slot: 1 } })
  assert.equal(p.json.video.state, 'processing')
  assert.equal(p.json.video.pct, 40)
  t.cfake.finish(uid)
  assert.equal((await t.C('video-status', { method: 'POST', body: { slot: 1 } })).json.video.state, 'ready')

  const b = await t.C('video-upload', { method: 'POST', body: { slot: 2, filename: 'b.mp4', type: 'video/mp4', size: 1000 } })
  t.cfake.videos.get(b.json.uploadURL.split('/').pop()).status = { state: 'error', errorReasonCode: 'ERR_DURATION_EXCEED_CONSTRAINT' }
  const e = await t.C('video-status', { method: 'POST', body: { slot: 2 } })
  assert.equal(e.json.video.state, 'error')
  assert.match(e.json.video.error, /longer than 3 minutes/)
})

test('upload: a video that Cloudflare reports as longer than the limit or not private is rejected', async () => {
  const t = await setup()
  const long = await uploadVideo(t, 1, { duration: 600 })
  assert.equal(long.st.json.video.state, 'error')
  const pub = await uploadVideo(t, 2, { requireSignedURLs: false })
  assert.equal(pub.st.json.video.state, 'error')
  assert.equal(t.cfake.videos.has(pub.uid), false, 'a non-private video is deleted')
})

test('upload: replacing a video deletes the old one and the authorisation quota is enforced', async () => {
  const t = await setup()
  const first = await uploadVideo(t, 1)
  const second = await uploadVideo(t, 1)
  await new Promise((r) => setTimeout(r, 5))
  assert.equal(t.cfake.videos.has(first.uid), false, 'replaced video removed from Cloudflare')
  assert.equal(t.cfake.videos.has(second.uid), true)
  let status
  for (let i = 0; i < 9; i++) status = (await t.C('video-upload', { method: 'POST', body: { slot: 3, filename: 'x.mp4', type: 'video/mp4', size: 10 } })).status
  assert.equal(status, 429, 'per-invitation upload quota')
})

test('upload: removing a video clears the slot and deletes it at Cloudflare', async () => {
  const t = await setup()
  const v = await uploadVideo(t, 3)
  await t.C('video-remove', { method: 'POST', body: { slot: 3 } })
  await new Promise((r) => setTimeout(r, 5))
  assert.equal(t.cfake.videos.has(v.uid), false)
  assert.equal((await t.C('session')).json.videos[3], undefined)
})

test('upload: not configured Cloudflare → clear 503, no fake success', async () => {
  const t = await setup({ env: { CLOUDFLARE_STREAM_API_TOKEN: '' } })
  const r = await t.C('video-upload', { method: 'POST', body: { slot: 1, filename: 'a.mp4', type: 'video/mp4', size: 10 } })
  assert.equal(r.status, 503)
})

test('photo: JPEG/PNG by real bytes only, size capped, replace and remove work', async () => {
  const t = await setup()
  const ok = await t.C('photo', { method: 'POST', raw: dummyJpeg(), headers: { 'content-type': 'image/jpeg' } })
  assert.equal(ok.status, 200)
  const back = await t.C('photo')
  assert.equal(back.status, 200)
  assert.equal(back.headers['content-type'], 'image/jpeg')
  assert.equal((await t.C('photo', { method: 'POST', raw: Buffer.from('<svg onload=alert(1)>'), headers: { 'content-type': 'image/jpeg' } })).status, 400, 'claimed type is not trusted')
  assert.equal((await t.C('photo', { method: 'POST', raw: dummyJpeg(600 * 1024) })).status, 413)
  assert.equal((await t.C('photo', { method: 'DELETE' })).status, 200)
  assert.equal((await t.C('photo')).status, 404)
})

// ───────────────────────── private media ─────────────────────────
test('private media: creators can only preview their OWN ready videos, with a short-lived signed token', async () => {
  const t = await setup()
  const other = await setup()
  const v = await uploadVideo(t, 1)
  const r = await t.C('video-preview?slot=1')
  assert.equal(r.status, 200)
  assert.match(r.json.playbackUrl, new RegExp(`/signed-${v.uid}-\\d+/manifest/video\\.m3u8$`))
  assert.ok(!r.json.playbackUrl.includes(v.uid + '/manifest'), 'never the bare video id')
  const exp = t.cfake.calls.find((c) => c.path.endsWith('/token')).body.exp
  assert.ok(exp * 1000 - Date.now() <= 3600_000 + 2000)
  // The other creator's link cannot reach this creator's video: slot 1 there is empty.
  assert.equal((await other.C('video-preview?slot=1')).status, 404)
  assert.equal((await creator(t.deps, '')('video-preview?slot=1')).status, 401)
})

// ───────────────────────── submission ─────────────────────────
test('submit: full happy path stores the complete record, defaults to Pending review, bound to the exact assets', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  await t.C('photo', { method: 'POST', raw: dummyJpeg() })
  const photoSha = (await t.store.get(`cr:invite:${t.ref}`)).photo.sha256
  const r = await t.C('submit', { method: 'POST', body: submission(uids, { assets: { videos: uids, photo: photoSha } }) })
  assert.equal(r.status, 200, JSON.stringify(r.json))
  assert.equal(r.json.ref, t.ref)

  const s = await t.store.get(`cr:sub:${t.ref}`)
  assert.equal(s.status, 'pending_review')
  assert.equal(s.publishable, false)
  assert.equal(s.profile.legalName, 'Test Creator Dummy')
  assert.equal(s.acceptance.signature, 'Test Creator Dummy')
  assert.equal(s.acceptance.displayName, 'Testy')
  assert.equal(s.acceptance.agreement.version, AGREEMENT_VERSION)
  assert.equal(s.acceptance.privacy.version, PRIVACY_VERSION)
  assert.equal(s.acceptance.agreement.sha256, sha256(s.acceptance.agreement.text))
  assert.match(s.acceptance.agreement.text, /LIMITED WEBSITE-DISPLAY PERMISSION/)
  assert.deepEqual(s.acceptance.checkboxes.map((c) => c.key), ['rights', 'agreement', 'display', 'privacy'])
  assert.ok(s.acceptance.checkboxes.every((c) => c.accepted && c.text))
  assert.ok(Date.now() - Date.parse(s.acceptance.acceptedAt) < 5000, 'acceptance time comes from the server')
  assert.deepEqual(s.acceptance.boundAssets.videoUids, uids)
  assert.equal(s.acceptance.boundAssets.photoSha256, photoSha)
  assert.equal(s.assets.videos.length, 3)
})

test('submit: owner email has the right subject and fields and nothing sensitive', async () => {
  const t = await setup()
  await t.C('draft', { method: 'POST', body: validProfile() })
  const uids = await uploadAll(t)
  const r = await t.C('submit', { method: 'POST', body: submission(uids) })
  assert.equal(r.status, 200)
  await new Promise((res) => setTimeout(res, 20))
  assert.equal(t.emails.length, 1)
  const mail = t.emails[0]
  assert.deepEqual(mail.to, ['mohamed@convrt.studio'])
  assert.equal(mail.subject, 'New CONVRT creator portfolio submission — Testy')
  assert.match(mail.text, /Languages: English, Arabic/)
  assert.match(mail.text, /Specialization: UGC videos/)
  assert.ok(mail.text.includes(t.ref))
  assert.ok(mail.text.includes(`/creator-onboarding`) === false && mail.text.includes(`/creator-admin?submission=${t.ref}`))
  assert.ok(!mail.text.includes('Test Creator Dummy'), 'legal name / signature are not emailed')
  assert.ok(!mail.text.includes(t.token), 'invite token is not emailed')
  assert.ok(!uids.some((u) => mail.text.includes(u)), 'no video ids/URLs in the email')
})

test('submit: requires all profile fields, three ready videos, four boxes and a matching signature', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  const post = (b) => t.C('submit', { method: 'POST', body: b })

  let r = await post(submission(uids, { profile: validProfile({ legalName: '', displayName: '', fiverrUrl: '', languages: [], specializations: [] }) }))
  assert.equal(r.status, 422)
  for (const f of ['legalName', 'displayName', 'fiverrUrl', 'languages', 'specializations']) assert.ok(r.json.errors[f], f)

  r = await post(submission(uids, { profile: validProfile({ fiverrUrl: 'https://evil.example.com/x' }) }))
  assert.ok(r.json.errors.fiverrUrl)

  r = await post(submission(uids, { profile: validProfile({ languages: ['Other'], languagesOther: '' }) }))
  assert.ok(r.json.errors.languagesOther)

  for (const key of ['rights', 'agreement', 'display', 'privacy']) {
    r = await post(submission(uids, { accepted: { ...accepted(), [key]: false } }))
    assert.equal(r.status, 422, key)
    assert.ok(r.json.errors[key], key)
  }
  r = await post(submission(uids, { accepted: { ...accepted(), rights: 'true' } }))
  assert.ok(r.json.errors.rights, 'only a real boolean true counts')

  r = await post(submission(uids, { signature: '' }))
  assert.ok(r.json.errors.signature)
  r = await post(submission(uids, { signature: 'Someone Else' }))
  assert.ok(r.json.errors.signature, 'signature must match the full legal name')
  r = await post(submission(uids, { signature: '  test   creator DUMMY ' }))
  assert.equal(r.status, 200, 'case and spacing do not matter')
})

test('submit: fewer than three uploaded videos is refused, and a never-uploaded slot cannot be faked', async () => {
  const t = await setup()
  const v1 = await uploadVideo(t, 1)
  const v2 = await uploadVideo(t, 2)
  const r = await t.C('submit', { method: 'POST', body: submission([v1.uid, v2.uid, 'forged-uid']) })
  assert.equal(r.status, 422)
  assert.ok(r.json.errors.video3)
  assert.equal(await t.store.get(`cr:sub:${t.ref}`), null)
})

test('submit: a video that is not Cloudflare-verified at submit time (e.g. replaced with a non-private one) is refused', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  t.cfake.videos.get(uids[1]).requireSignedURLs = false
  const r = await t.C('submit', { method: 'POST', body: submission(uids) })
  assert.equal(r.status, 422)
  assert.ok(r.json.errors.video2)
})

test('submit: acceptance is bound to the assets shown; a replaced video requires renewed confirmation', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  const stale = submission(uids)
  await uploadVideo(t, 2) // creator replaces video 2 after ticking the boxes
  const r = await t.C('submit', { method: 'POST', body: stale })
  assert.equal(r.status, 409)
  assert.equal(r.json.error, 'assets_changed')
  assert.equal(await t.store.get(`cr:sub:${t.ref}`), null)
  const fresh = (await t.C('session')).json.videos
  assert.equal(fresh[2].state, 'ready')
})

test('submit: an outdated agreement/privacy version is refused', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  const r = await t.C('submit', { method: 'POST', body: submission(uids, { agreementVersion: '0.0-old' }) })
  assert.equal(r.status, 409)
  assert.equal(r.json.error, 'legal_version_changed')
})

test('submit: duplicate submissions are prevented (sequential and concurrent)', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  const results = await Promise.all([1, 2, 3, 4].map(() => t.C('submit', { method: 'POST', body: submission(uids) })))
  assert.equal(results.filter((r) => r.status === 200).length, 1, 'exactly one succeeds')
  assert.ok(results.filter((r) => r.status !== 200).every((r) => r.status === 409))
  await new Promise((res) => setTimeout(res, 20))
  assert.equal(t.emails.length, 1, 'one owner email')
  assert.equal((await t.C('submit', { method: 'POST', body: submission(uids) })).status, 409)
  assert.equal((await t.C('video-upload', { method: 'POST', body: { slot: 1, filename: 'a.mp4', type: 'video/mp4', size: 10 } })).status, 409, 'no changes after completion')
})

test('submit: unauthorised origin is refused', async () => {
  const t = await setup()
  const r = await t.C('submit', { method: 'POST', body: {}, headers: { origin: 'https://evil.example' } })
  assert.equal(r.status, 403)
})

test('receipt: the creator can download their OWN signed agreement after submitting; others and strangers cannot', async () => {
  const t = await setup()
  const other = await setup()
  assert.equal((await t.C('agreement')).status, 404, 'nothing to download before submitting')
  const uids = await uploadAll(t)
  await t.C('submit', { method: 'POST', body: submission(uids) })
  const r = await t.C('agreement')
  assert.equal(r.status, 200)
  assert.match(r.headers['content-disposition'], /attachment; filename="CONVRT-creator-agreement-CRX-/)
  assert.ok(r.text.includes('Test Creator Dummy') && r.text.includes(t.ref) && /Limited website-display permission/i.test(r.text))
  assert.ok(r.text.includes(uids[0]))
  assert.equal((await other.C('agreement')).status, 404, 'another creator gets nothing of this submission')
  assert.equal((await creator(t.deps, '')('agreement')).status, 401)
})

test('receipt: HTML is escaped (a hostile name cannot inject markup)', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  const name = 'Evil <script>alert(1)</script>'
  const r = await t.C('submit', { method: 'POST', body: submission(uids, { profile: validProfile({ legalName: name, displayName: 'x<b>y' }), signature: name }) })
  assert.equal(r.status, 200)
  const doc = await t.C('agreement')
  assert.ok(!doc.text.includes('<script>alert'))
  assert.ok(doc.text.includes('&lt;script&gt;'))
})

// ───────────────────────── owner access ─────────────────────────
test('owner API: every operation needs the owner session; wrong password, tampered and expired cookies fail', async () => {
  const t = await setup()
  const A0 = admin(t.deps, '')
  for (const [path, method] of [['overview', 'GET'], ['submission?id=X', 'GET'], ['video-token?id=X&slot=1', 'GET'], ['photo?id=X', 'GET'], ['agreement?id=X', 'GET'], ['invite-create', 'POST'], ['set-status', 'POST'], ['withdraw', 'POST']]) {
    const r = await A0(path, { method, body: method === 'POST' ? {} : undefined })
    assert.equal(r.status, 401, path)
  }
  assert.equal((await adminLogin(t.deps, 'wrong password wrong password')).r.status, 401)
  const forged = t.cookie.slice(0, -3) + 'abc'
  assert.equal((await admin(t.deps, forged)('overview')).status, 401)
  const [name, value] = t.cookie.split('=')
  const swapped = `${name}=${Buffer.from(JSON.stringify({ role: 'owner', exp: Date.now() + 1e10 })).toString('base64url')}.${value.split('.')[1]}`
  assert.equal((await admin(t.deps, swapped)('overview')).status, 401, 'payload swap breaks the signature')
  assert.equal((await t.A('overview')).status, 200)
})

test('owner API: cookie is HttpOnly + SameSite=Strict (+ Secure over https); login is rate limited', async () => {
  const h = makeHarness()
  const r = await (await import('./helpers/creatorHarness.mjs')).call((await import('../api/_lib/creator/handlers.js')).adminHandler, h.deps, {
    method: 'POST', path: '/api/creator-admin/login', body: { password: h.env.CREATOR_ADMIN_PASSWORD }, headers: { 'x-forwarded-proto': 'https' },
  })
  const cookie = r.headers['set-cookie']
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Strict/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /Max-Age=28800/)
  let last
  for (let i = 0; i < 8; i++) last = await adminLogin(h.deps, 'nope nope nope nope nope')
  assert.equal(last.r.status, 429)
})

test('owner API: a pasted password with stray spaces or a trailing newline still signs in; a different password does not', async () => {
  const h = makeHarness()
  assert.equal((await adminLogin(h.deps, `  ${h.env.CREATOR_ADMIN_PASSWORD}\n`)).r.status, 200)
  assert.equal((await adminLogin(h.deps, `${h.env.CREATOR_ADMIN_PASSWORD}x`)).r.status, 401)
})

test('owner API: refuses to run with a weak/missing password or session secret', async () => {
  const h = makeHarness({ env: { CREATOR_ADMIN_PASSWORD: 'short' } })
  assert.equal((await adminLogin(h.deps, 'short')).r.status, 503)
  const h2 = makeHarness({ env: { CREATOR_ADMIN_SESSION_SECRET: 'tooshort' } })
  assert.equal((await adminLogin(h2.deps)).r.status, 503)
})

test('owner review: list, details, signed playback for all three videos, photo, agreement', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  await t.C('photo', { method: 'POST', raw: dummyJpeg() })
  const sha = (await t.store.get(`cr:invite:${t.ref}`)).photo.sha256
  await t.C('submit', { method: 'POST', body: submission(uids, { assets: { videos: uids, photo: sha } }) })

  const ov = await t.A('overview')
  assert.equal(ov.json.submissions.length, 1)
  assert.equal(ov.json.submissions[0].status, 'pending_review')
  assert.equal(ov.json.invites[0].status, 'completed')
  const d = await t.A(`submission?id=${t.ref}`)
  assert.equal(d.json.submission.profile.legalName, 'Test Creator Dummy')
  assert.ok(!('text' in d.json.submission.acceptance), 'long agreement text not sent in the detail view')
  for (const slot of [1, 2, 3]) {
    const v = await t.A(`video-token?id=${t.ref}&slot=${slot}`)
    assert.equal(v.status, 200)
    assert.match(v.json.playbackUrl, /signed-vid/)
  }
  assert.equal((await t.A(`photo?id=${t.ref}`)).headers['content-type'], 'image/jpeg')
  const ag = await t.A(`agreement?id=${t.ref}`)
  assert.ok(ag.text.includes('Test Creator Dummy'))
})

test('owner review: approve / reject / reopen — approval is the only thing that makes it publishable', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  await t.C('submit', { method: 'POST', body: submission(uids) })
  let r = await t.A('set-status', { method: 'POST', body: { id: t.ref, status: 'approved', note: 'great' } })
  assert.equal(r.json.submission.status, 'approved')
  assert.equal(r.json.submission.publishable, true)
  r = await t.A('set-status', { method: 'POST', body: { id: t.ref, status: 'rejected' } })
  assert.equal(r.json.submission.publishable, false)
  assert.equal((await t.A('set-status', { method: 'POST', body: { id: t.ref, status: 'published' } })).status, 400)
})

test('withdrawal: records the request, blocks publishing forever, deletes files, keeps the signed record, cuts access', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  await t.C('photo', { method: 'POST', raw: dummyJpeg() })
  const sha = (await t.store.get(`cr:invite:${t.ref}`)).photo.sha256
  await t.C('submit', { method: 'POST', body: submission(uids, { assets: { videos: uids, photo: sha } }) })
  await t.A('set-status', { method: 'POST', body: { id: t.ref, status: 'approved' } })

  const w = await t.A('withdraw', { method: 'POST', body: { id: t.ref, requestedVia: 'Fiverr message', note: 'creator asked', deleteFiles: true } })
  assert.equal(w.status, 200)
  assert.equal(w.json.submission.status, 'withdrawn')
  assert.equal(w.json.submission.publishable, false)
  assert.equal(w.json.submission.withdrawal.requestedVia, 'Fiverr message')
  assert.equal(w.json.submission.withdrawal.filesDeleted, true)
  for (const uid of uids) assert.equal(t.cfake.videos.has(uid), false, 'video deleted from Cloudflare')
  assert.equal(await t.store.get(`cr:photo:${t.ref}`), null, 'photo deleted')

  const s = await t.store.get(`cr:sub:${t.ref}`)
  assert.ok(s.acceptance.signature, 'signed agreement record is retained')
  assert.ok(s.assets.videos.every((v) => v.deletedAt))
  assert.ok(s.history.some((h) => h.action === 'withdrawn'))

  assert.equal((await t.A('set-status', { method: 'POST', body: { id: t.ref, status: 'approved' } })).status, 409, 'withdrawn can never be re-approved')
  assert.equal((await t.A(`video-token?id=${t.ref}&slot=1`)).status, 409, 'no playback tokens for withdrawn content')
  assert.equal((await t.A(`photo?id=${t.ref}`)).status, 404)
  assert.equal((await t.A(`agreement?id=${t.ref}`)).status, 200, 'the signed agreement stays retrievable by the owner')
})

test('withdrawal: a failed Cloudflare delete is reported (not hidden) and can be retried', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  await t.C('submit', { method: 'POST', body: submission(uids) })
  const real = t.cfake.fetchImpl
  t.cfake.fetchImpl = async (url, init = {}) => (init.method === 'DELETE' ? { ok: false, status: 500, json: async () => ({ success: false }) } : real(url, init))
  const w = await t.A('withdraw', { method: 'POST', body: { id: t.ref, requestedVia: 'email', deleteFiles: true } })
  assert.equal(w.json.submission.status, 'withdrawn', 'withdrawn regardless: public access is cut first')
  assert.equal(w.json.submission.withdrawal.filesDeleted, false)
  assert.equal(w.json.submission.withdrawal.pendingDeletion.length, 3)
  t.cfake.fetchImpl = real
  const retry = await t.A('withdraw', { method: 'POST', body: { id: t.ref, requestedVia: 'email', deleteFiles: true } })
  assert.equal(retry.json.submission.withdrawal.filesDeleted, true)
  assert.equal(retry.json.submission.withdrawal.pendingDeletion.length, 0)
  for (const uid of uids) assert.equal(t.cfake.videos.has(uid), false)
})

test('withdrawal: "keep files for now" is possible and recorded', async () => {
  const t = await setup()
  const uids = await uploadAll(t)
  await t.C('submit', { method: 'POST', body: submission(uids) })
  const w = await t.A('withdraw', { method: 'POST', body: { id: t.ref, requestedVia: 'email', deleteFiles: false } })
  assert.equal(w.json.submission.withdrawal.filesDeleted, false)
  assert.equal(w.json.submission.publishable, false)
  assert.equal(t.cfake.videos.size, 3)
})

// ───────────────────────── configuration safety ─────────────────────────
test('not configured: without a database every creator/owner call says so instead of pretending', async () => {
  const { buildDeps } = await import('../api/_lib/creator/handlers.js')
  const { call } = await import('./helpers/creatorHarness.mjs')
  const { creatorHandler, adminHandler } = await import('../api/_lib/creator/handlers.js')
  const deps = buildDeps({ CLOUDFLARE_ACCOUNT_ID: 'a', CLOUDFLARE_STREAM_API_TOKEN: 'b' })
  assert.equal((await call(creatorHandler, deps, { path: '/api/creator/session', headers: { authorization: 'Bearer ' + 'a'.repeat(43) } })).status, 503)
  assert.equal((await call(adminHandler, deps, { path: '/api/creator-admin/overview' })).status, 503)
})

test('production: real submissions and invitations are blocked while the legal documents are awaiting owner approval', async () => {
  const h = makeHarness({ env: { VERCEL_ENV: 'production' } })
  const { cookie } = await adminLogin(h.deps)
  const r = await admin(h.deps, cookie)('invite-create', { method: 'POST', body: { label: 'x' } })
  assert.equal(r.status, 409)
  assert.equal(r.json.error, 'legal_not_approved')
})

test('responses are never cacheable and carry noindex / no-referrer headers', async () => {
  const t = await setup()
  const r = await t.C('session')
  assert.equal(r.headers['cache-control'], 'no-store')
  assert.match(r.headers['x-robots-tag'], /noindex/)
  assert.equal(r.headers['referrer-policy'], 'no-referrer')
})
