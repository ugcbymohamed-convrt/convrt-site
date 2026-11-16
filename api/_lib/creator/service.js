/* Creator onboarding: business logic. No HTTP in here (see handlers.js), so every rule is unit-testable with an
   in-memory store and a fake Cloudflare.

   Data (all JSON values in the store):
     cr:invite:<ref>   the invitation + resumable progress (draft fields, uploaded video slots, photo meta)
     cr:tok:<sha256>   token hash -> ref. Only the HASH of an invite token is ever stored.
     cr:sub:<ref>      the completed submission, incl. the full agreement acceptance record
     cr:photo:<ref>    profile photo bytes (base64) — never served without authorisation
     cr:invites / cr:subs   index sets
   <ref> is the submission reference (CRX-XXXXXXXX): one invitation = one submission. */

import {
  VIDEO_SLOTS, VIDEO_MAX_SECONDS, VIDEO_MAX_BYTES, PHOTO_MAX_BYTES, LIMITS, MAX_UPLOAD_AUTHORIZATIONS,
  INVITE_SOURCES, INVITE_DEFAULT_DAYS, INVITE_MAX_DAYS, RECEIPT_ACCESS_DAYS, ACCEPTANCES,
} from '../../../src/lib/creator/constants.js'
import {
  clean, sanitizeProfile, validateProfile, validateAcceptance, validateVideoFile,
} from '../../../src/lib/creator/validation.js'
import {
  AGREEMENT_VERSION, PRIVACY_VERSION, LEGAL_STATUS, agreementText, privacyText,
} from '../../../src/content/creatorLegal.js'
import { randomToken, sha256, safeEqual, newReference } from './crypto.js'
import { CloudflareError } from './cloudflare.js'
import { renderReceipt } from './receipt.js'

const DAY = 86_400_000

export class CreatorError extends Error {
  constructor(code, status = 400, extra = {}) {
    super(code)
    this.name = 'CreatorError'
    this.code = code
    this.status = status
    this.extra = extra
  }
}

const iso = (ms) => new Date(ms).toISOString()
const keys = {
  invite: (ref) => `cr:invite:${ref}`,
  tok: (hash) => `cr:tok:${hash}`,
  sub: (ref) => `cr:sub:${ref}`,
  photo: (ref) => `cr:photo:${ref}`,
}

const slotOf = (v) => {
  const n = Number(v)
  if (!VIDEO_SLOTS.includes(n)) throw new CreatorError('invalid_slot')
  return String(n)
}

const UPLOAD_ERRORS = {
  ERR_DURATION_EXCEED_CONSTRAINT: `This video is longer than ${VIDEO_MAX_SECONDS / 60} minutes.`,
  ERR_NON_VIDEO: 'This file is not a valid video.',
  ERR_MAX_UPLOAD_SIZE: 'This file is too large.',
}
const uploadErrorText = (code) => UPLOAD_ERRORS[code] || 'We could not process this video. Please try exporting it again as an MP4.'

/* @param {{ store, cf, env?, now?: () => number, notify?: Function, log?: Function }} ctx */
export function createService(ctx) {
  const { store, cf } = ctx
  const now = ctx.now || (() => Date.now())
  const log = ctx.log || (() => {})
  const env = ctx.env || {}

  /* ───────────── invitations ───────────── */

  const inviteView = (inv, sub) => {
    const t = now()
    let status = inv.status
    if (status === 'open' && t > inv.expiresAt) status = 'expired'
    const videos = Object.values(inv.videos || {})
    return {
      id: inv.id,
      label: inv.label,
      source: inv.source,
      status,
      createdAt: iso(inv.createdAt),
      expiresAt: iso(inv.expiresAt),
      completedAt: inv.completedAt ? iso(inv.completedAt) : null,
      videosReady: videos.filter((v) => v.state === 'ready').length,
      photo: Boolean(inv.photo),
      submissionStatus: sub?.status || null,
    }
  }

  async function createInvite({ label, source = 'fiverr', expiresInDays = INVITE_DEFAULT_DAYS }) {
    if (ctx.cfg?.isProduction && !LEGAL_STATUS.approved) throw new CreatorError('legal_not_approved', 409)
    if (!INVITE_SOURCES.includes(source)) throw new CreatorError('invalid_source')
    const days = Math.min(INVITE_MAX_DAYS, Math.max(1, Math.floor(Number(expiresInDays) || INVITE_DEFAULT_DAYS)))
    const t = now()

    let id
    for (let i = 0; i < 5; i++) {
      const candidate = newReference()
      const invite = {
        id: candidate,
        label: clean(label).slice(0, 80),
        source,
        status: 'open',
        createdAt: t,
        expiresAt: t + days * DAY,
        tokenHash: '',
        draft: {},
        videos: {},
        photo: null,
        uploadAuths: 0,
        submissionId: candidate,
      }
      const token = randomToken(32)
      invite.tokenHash = sha256(token)
      if (await store.set(keys.invite(candidate), invite, { nx: true })) {
        await store.set(keys.tok(invite.tokenHash), candidate)
        await store.sadd('cr:invites', candidate)
        id = candidate
        return { invite: inviteView(invite), token }
      }
    }
    throw new CreatorError('reference_collision', 500, { id })
  }

  /* Issues a NEW link for the same invitation (the old link stops working immediately). */
  async function rotateInvite(id) {
    const inv = await store.get(keys.invite(id))
    if (!inv) throw new CreatorError('not_found', 404)
    if (inv.status === 'revoked') throw new CreatorError('invite_revoked', 409)
    await store.del(keys.tok(inv.tokenHash))
    const token = randomToken(32)
    inv.tokenHash = sha256(token)
    inv.expiresAt = Math.max(inv.expiresAt, now() + DAY) // never hand out an already-expired link
    await store.set(keys.invite(id), inv)
    await store.set(keys.tok(inv.tokenHash), id)
    return { invite: inviteView(inv), token }
  }

  async function revokeInvite(id) {
    const inv = await store.get(keys.invite(id))
    if (!inv) throw new CreatorError('not_found', 404)
    if (inv.status === 'completed') throw new CreatorError('already_submitted', 409)
    inv.status = 'revoked'
    await store.set(keys.invite(id), inv)
    await store.del(keys.tok(inv.tokenHash))
    return inviteView(inv)
  }

  /* Looks an invitation up by its token. @param {{write: boolean}} mode
     write = the caller wants to change something (upload, submit …): needs an OPEN, unexpired invitation.
     read  = viewing own state / downloading own agreement: also allowed after completion for RECEIPT_ACCESS_DAYS. */
  async function resolve(token, { write = false } = {}) {
    const t = String(token || '')
    if (t.length < 20 || t.length > 100) throw new CreatorError('invite_invalid', 401)
    const hash = sha256(t)
    const id = await store.get(keys.tok(hash))
    const inv = id ? await store.get(keys.invite(id)) : null
    if (!inv || !safeEqual(inv.tokenHash, hash)) throw new CreatorError('invite_invalid', 401)
    if (inv.status === 'revoked') throw new CreatorError('invite_revoked', 401)
    if (inv.status === 'completed') {
      if (write) throw new CreatorError('already_submitted', 409)
      if (now() > inv.completedAt + RECEIPT_ACCESS_DAYS * DAY) throw new CreatorError('invite_expired', 401)
      return inv
    }
    if (now() > inv.expiresAt) throw new CreatorError('invite_expired', 401)
    return inv
  }

  const save = (inv) => store.set(keys.invite(inv.id), inv)

  /* ───────────── creator-facing state ───────────── */

  async function session(inv) {
    const sub = inv.status === 'completed' ? await store.get(keys.sub(inv.id)) : null
    const videos = {}
    for (const s of VIDEO_SLOTS) {
      const v = inv.videos[s]
      if (v) videos[s] = { uid: v.uid, state: v.state, filename: v.filename, size: v.size ?? null, duration: v.duration ?? null, pct: v.pct ?? null, error: v.error ?? null }
    }
    return {
      ref: inv.id,
      status: inv.status,
      source: inv.source,
      expiresAt: iso(inv.expiresAt),
      draft: inv.draft,
      videos,
      photo: inv.photo ? { size: inv.photo.size, type: inv.photo.type, sha256: inv.photo.sha256 } : null,
      limits: LIMITS,
      legal: { agreementVersion: AGREEMENT_VERSION, privacyVersion: PRIVACY_VERSION, approved: LEGAL_STATUS.approved },
      submission: sub ? { submittedAt: sub.submittedAt, status: sub.status === 'withdrawn' ? 'withdrawn' : 'received' } : null,
    }
  }

  async function saveDraft(inv, body) {
    inv.draft = sanitizeProfile(body)
    await save(inv)
    return { ok: true }
  }

  /* ───────────── video uploads (direct to Cloudflare) ───────────── */

  async function videoUpload(inv, body) {
    if (!cf.configured) throw new CreatorError('uploads_unavailable', 503)
    const slot = slotOf(body?.slot)
    const fileError = validateVideoFile({ name: String(body?.filename || ''), type: String(body?.type || ''), size: Number(body?.size) })
    if (fileError) throw new CreatorError('invalid_file', 400, { message: fileError })
    if ((inv.uploadAuths || 0) >= MAX_UPLOAD_AUTHORIZATIONS) throw new CreatorError('upload_quota_reached', 429)

    const previous = inv.videos[slot]
    let direct
    try {
      direct = await cf.createDirectUpload({ submissionId: inv.id, slot, maxDurationSeconds: VIDEO_MAX_SECONDS, nowMs: now() })
    } catch (err) {
      log('cf_direct_upload_failed', { status: err?.status })
      throw new CreatorError('uploads_unavailable', 502)
    }
    inv.uploadAuths = (inv.uploadAuths || 0) + 1
    inv.videos[slot] = {
      uid: direct.uid,
      state: 'uploading',
      filename: clean(body.filename).slice(0, 120),
      size: Number(body.size),
      issuedAt: now(),
    }
    // A replaced video must not linger on Cloudflare (best effort: it is private and unreferenced either way).
    if (previous?.uid) cf.deleteVideo(previous.uid).catch((e) => log('cf_delete_failed', { status: e?.status }))
    await save(inv)
    return { uploadURL: direct.uploadURL, slot: Number(slot), maxBytes: VIDEO_MAX_BYTES, maxSeconds: VIDEO_MAX_SECONDS }
  }

  /* Asks Cloudflare where the video is, enforces our own limits, and remembers the result. */
  async function videoStatus(inv, body) {
    const slot = slotOf(body?.slot)
    const v = inv.videos[slot]
    if (!v) throw new CreatorError('no_video', 404)
    if (v.state === 'ready') return publicVideo(v)
    if (v.state === 'error') return publicVideo(v)

    let info
    try {
      info = await cf.getVideo(v.uid)
    } catch (err) {
      if (err instanceof CloudflareError && err.status === 404) {
        if (now() - v.issuedAt > 35 * 60_000) {
          Object.assign(v, { state: 'error', error: 'The upload did not complete. Please try again.' })
          await save(inv)
        }
        return publicVideo(v)
      }
      log('cf_status_failed', { status: err?.status })
      throw new CreatorError('uploads_unavailable', 502)
    }

    const state = info?.status?.state
    if (state === 'ready' && info.readyToStream !== false) {
      const duration = Number(info.duration)
      const size = Number(info.size)
      if (info.requireSignedURLs !== true) {
        // Defence in depth: we always create videos as private. If one is not, refuse it and delete it.
        cf.deleteVideo(v.uid).catch(() => {})
        Object.assign(v, { state: 'error', error: 'This video could not be accepted. Please upload it again.' })
      } else if (info.meta?.submissionId !== inv.id) {
        cf.deleteVideo(v.uid).catch(() => {})
        Object.assign(v, { state: 'error', error: 'This video could not be accepted. Please upload it again.' })
      } else if (duration > VIDEO_MAX_SECONDS + 1) {
        Object.assign(v, { state: 'error', error: `This video is longer than ${VIDEO_MAX_SECONDS / 60} minutes.` })
      } else if (size > VIDEO_MAX_BYTES) {
        Object.assign(v, { state: 'error', error: 'This file is too large.' })
      } else {
        Object.assign(v, { state: 'ready', duration: Math.round(duration * 10) / 10, size: size || v.size, error: null, pct: 100 })
      }
    } else if (state === 'error') {
      Object.assign(v, { state: 'error', error: uploadErrorText(info?.status?.errorReasonCode) })
    } else if (state === 'pendingupload') {
      v.state = 'uploading'
    } else {
      v.state = 'processing'
      v.pct = Number(info?.status?.pctComplete) || 0
    }
    await save(inv)
    return publicVideo(v)
  }

  const publicVideo = (v) => ({ uid: v.uid, state: v.state, filename: v.filename, size: v.size ?? null, duration: v.duration ?? null, pct: v.pct ?? null, error: v.error ?? null })

  async function videoPreview(inv, slotRaw) {
    const slot = slotOf(slotRaw)
    const v = inv.videos[slot]
    if (!v || v.state !== 'ready') throw new CreatorError('no_video', 404)
    const { token, expiresAt } = await cf.signToken(v.uid, 3600, now())
    return { ...cf.playbackUrls(token), expiresAt: iso(expiresAt) }
  }

  async function videoRemove(inv, body) {
    const slot = slotOf(body?.slot)
    const v = inv.videos[slot]
    if (!v) return { ok: true }
    delete inv.videos[slot]
    await save(inv)
    if (v.uid) cf.deleteVideo(v.uid).catch((e) => log('cf_delete_failed', { status: e?.status }))
    return { ok: true }
  }

  /* ───────────── profile photo ───────────── */

  const isJpeg = (b) => b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  const isPng = (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))

  async function photoPut(inv, buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw new CreatorError('invalid_photo')
    if (buffer.length > PHOTO_MAX_BYTES) throw new CreatorError('photo_too_large', 413)
    const type = isJpeg(buffer) ? 'image/jpeg' : isPng(buffer) ? 'image/png' : null
    if (!type) throw new CreatorError('invalid_photo') // checked from the file's own bytes, not the claimed type
    const meta = { type, size: buffer.length, sha256: sha256(buffer.toString('base64')), at: now() }
    await store.set(keys.photo(inv.id), { type, b64: buffer.toString('base64') })
    inv.photo = meta
    await save(inv)
    return { ok: true, photo: { size: meta.size, type, sha256: meta.sha256 } }
  }

  async function photoGet(ref, { requirePresent = true } = {}) {
    const p = await store.get(keys.photo(ref))
    if (!p && requirePresent) throw new CreatorError('no_photo', 404)
    return p ? { type: p.type, bytes: Buffer.from(p.b64, 'base64') } : null
  }

  async function photoRemove(inv) {
    inv.photo = null
    await save(inv)
    await store.del(keys.photo(inv.id))
    return { ok: true }
  }

  /* ───────────── submission ───────────── */

  async function submit(inv, body, { reviewBaseUrl } = {}) {
    if (ctx.cfg?.isProduction && !LEGAL_STATUS.approved) throw new CreatorError('legal_not_approved', 409)
    if (!cf.configured) throw new CreatorError('uploads_unavailable', 503)

    // One submission at a time per invitation (double clicks, two tabs, retries).
    const locked = await store.set(`cr:lock:${inv.id}`, 1, { nx: true, ttl: 90 })
    if (!locked) throw new CreatorError('submission_in_progress', 409)
    try {
      const fresh = await store.get(keys.invite(inv.id))
      if (!fresh || fresh.status !== 'open') throw new CreatorError('already_submitted', 409)
      if (now() > fresh.expiresAt) throw new CreatorError('invite_expired', 401)
      inv = fresh

      const profile = validateProfile(body?.profile, { source: inv.source })
      const acceptance = validateAcceptance(body?.accepted, body?.signature, profile.value.legalName)
      const errors = { ...profile.errors, ...acceptance.errors }
      if (body?.agreementVersion !== AGREEMENT_VERSION || body?.privacyVersion !== PRIVACY_VERSION) {
        throw new CreatorError('legal_version_changed', 409)
      }

      // The three videos: each must be one this invitation was authorised to upload, distinct, and still verified by Cloudflare.
      const videos = []
      for (const s of VIDEO_SLOTS) {
        const v = inv.videos[s]
        if (!v || v.state !== 'ready') {
          errors[`video${s}`] = 'Please upload this video before submitting.'
          continue
        }
        let info
        try {
          info = await cf.getVideo(v.uid)
        } catch (err) {
          log('cf_verify_failed', { status: err?.status })
          throw new CreatorError('uploads_unavailable', 502)
        }
        const okVideo =
          info?.status?.state === 'ready' && info.requireSignedURLs === true && info.meta?.submissionId === inv.id &&
          Number(info.duration) <= VIDEO_MAX_SECONDS + 1 && Number(info.size) <= VIDEO_MAX_BYTES
        if (!okVideo) {
          errors[`video${s}`] = 'This video could not be verified. Please upload it again.'
          continue
        }
        videos.push({ slot: Number(s), uid: v.uid, filename: v.filename, size: Number(info.size), duration: Math.round(Number(info.duration) * 10) / 10 })
      }
      if (new Set(videos.map((v) => v.uid)).size !== videos.length) throw new CreatorError('duplicate_videos', 400)

      // The acceptance is bound to THESE assets. If the browser's view is stale (a video was replaced after the
      // boxes were ticked, in another tab, …) the creator has to confirm again.
      const sent = body?.assets || {}
      const photoSha = inv.photo?.sha256 || null
      const sameVideos = videos.length === 3 && VIDEO_SLOTS.every((s) => sent.videos?.[s - 1] === videos[s - 1].uid)
      if (!errors.video1 && !errors.video2 && !errors.video3 && (!sameVideos || (sent.photo || null) !== photoSha)) {
        throw new CreatorError('assets_changed', 409)
      }

      if (Object.keys(errors).length) throw new CreatorError('validation_failed', 422, { errors })

      const submittedAt = iso(now())
      const aText = agreementText()
      const pText = privacyText()
      const record = {
        id: inv.id,
        status: 'pending_review',
        publishable: false,
        source: inv.source,
        inviteLabel: inv.label,
        submittedAt,
        profile: profile.value,
        assets: { videos, photo: inv.photo ? { sha256: photoSha, size: inv.photo.size, type: inv.photo.type } : null },
        acceptance: {
          acceptedAt: submittedAt, // server clock
          legalName: profile.value.legalName,
          displayName: profile.value.displayName,
          signature: clean(body.signature),
          signatureType: 'typed_name_simple_electronic_signature',
          agreement: { version: AGREEMENT_VERSION, sha256: sha256(aText), text: aText },
          privacy: { version: PRIVACY_VERSION, sha256: sha256(pText) },
          checkboxes: ACCEPTANCES.map((a) => ({ key: a.key, text: a.text, accepted: true })),
          boundAssets: { videoUids: videos.map((v) => v.uid), photoSha256: photoSha },
        },
        history: [{ at: submittedAt, action: 'submitted' }],
        withdrawal: null,
      }
      await store.set(keys.sub(inv.id), record)
      await store.sadd('cr:subs', inv.id)
      inv.status = 'completed'
      inv.completedAt = now()
      await save(inv)

      if (ctx.notify) {
        // Best effort, and deliberately minimal: no legal name, no signature, no media.
        ctx.notify({
          subject: `New CONVRT creator portfolio submission — ${record.profile.displayName}`,
          title: 'New creator portfolio submission',
          rows: [
            ['Display name', record.profile.displayName],
            ['Languages', [...record.profile.languages.filter((l) => l !== 'Other'), record.profile.languagesOther].filter(Boolean).join(', ')],
            ['Specialization', [...record.profile.specializations.filter((l) => l !== 'Other'), record.profile.specializationOther].filter(Boolean).join(', ')],
            ['Submission reference', record.id],
            ['Review link', `${reviewBaseUrl || ''}/creator-admin?submission=${record.id}`],
          ],
          footer: 'Status: Pending review. Videos are private until you approve them in the review page. Nothing is published automatically.',
        }).catch(() => {})
      }
      return { ok: true, ref: record.id, submittedAt }
    } finally {
      await store.del(`cr:lock:${inv.id}`)
    }
  }

  async function receipt(inv) {
    if (inv.status !== 'completed') throw new CreatorError('not_submitted', 404)
    const sub = await store.get(keys.sub(inv.id))
    if (!sub) throw new CreatorError('not_found', 404)
    return { filename: `CONVRT-creator-agreement-${sub.id}.html`, html: renderReceipt(sub) }
  }

  /* ───────────── owner (admin) operations ───────────── */

  const subSummary = (s) => ({
    id: s.id,
    status: s.status,
    publishable: s.publishable,
    displayName: s.profile.displayName,
    languages: s.profile.languages,
    specializations: s.profile.specializations,
    source: s.source,
    submittedAt: s.submittedAt,
  })

  async function adminOverview() {
    const [inviteIds, subIds] = await Promise.all([store.smembers('cr:invites'), store.smembers('cr:subs')])
    const invites = (await store.mget(inviteIds.map(keys.invite))).filter(Boolean)
    const subs = (await store.mget(subIds.map(keys.sub))).filter(Boolean)
    const subById = Object.fromEntries(subs.map((s) => [s.id, s]))
    return {
      invites: invites.map((i) => inviteView(i, subById[i.id])).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      submissions: subs.map(subSummary).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
      legal: { agreementVersion: AGREEMENT_VERSION, privacyVersion: PRIVACY_VERSION, approved: LEGAL_STATUS.approved },
    }
  }

  async function adminSubmission(id) {
    const s = await store.get(keys.sub(id))
    if (!s) throw new CreatorError('not_found', 404)
    const { acceptance, ...rest } = s
    return {
      ...rest,
      acceptance: {
        acceptedAt: acceptance.acceptedAt,
        legalName: acceptance.legalName,
        displayName: acceptance.displayName,
        signature: acceptance.signature,
        agreementVersion: acceptance.agreement.version,
        agreementSha256: acceptance.agreement.sha256,
        privacyVersion: acceptance.privacy.version,
        checkboxes: acceptance.checkboxes,
      },
    }
  }

  async function adminVideoToken(id, slotRaw) {
    const s = await store.get(keys.sub(id))
    if (!s) throw new CreatorError('not_found', 404)
    if (s.status === 'withdrawn') throw new CreatorError('withdrawn', 409)
    const v = s.assets.videos.find((x) => String(x.slot) === String(slotRaw))
    if (!v || v.deletedAt) throw new CreatorError('no_video', 404)
    const { token, expiresAt } = await cf.signToken(v.uid, 3600, now())
    return { ...cf.playbackUrls(token), expiresAt: iso(expiresAt) }
  }

  /* Owner download of one submitted video. Cloudflare first generates an MP4 (status 'processing' until it is ready); then a
     short-lived signed link is returned. Never available for withdrawn submissions. */
  async function adminVideoDownload(id, slotRaw) {
    const s = await store.get(keys.sub(id))
    if (!s) throw new CreatorError('not_found', 404)
    if (s.status === 'withdrawn') throw new CreatorError('withdrawn', 409)
    const v = s.assets.videos.find((x) => String(x.slot) === String(slotRaw))
    if (!v || v.deletedAt) throw new CreatorError('no_video', 404)
    let d = await cf.getDownload(v.uid).catch(() => null)
    if (!d || !d.status) d = await cf.requestDownload(v.uid)
    if (!d || d.status !== 'ready') return { status: 'processing', pct: Math.round(Number(d?.percentComplete) || 0) }
    const { token } = await cf.signToken(v.uid, 900, now(), { downloadable: true })
    const url = d.url && String(d.url).includes(v.uid) ? String(d.url).replace(v.uid, token) : `${cf.playbackBase}/${token}/downloads/default.mp4`
    return { status: 'ready', url, filename: v.filename }
  }

  async function adminPhoto(id) {
    const s = await store.get(keys.sub(id))
    if (!s || s.status === 'withdrawn' || !s.assets.photo || s.assets.photo.deletedAt) throw new CreatorError('no_photo', 404)
    return photoGet(id)
  }

  async function adminReceipt(id) {
    const s = await store.get(keys.sub(id))
    if (!s) throw new CreatorError('not_found', 404)
    return { filename: `CONVRT-creator-agreement-${s.id}.html`, html: renderReceipt(s) }
  }

  async function adminSetStatus(id, status, note) {
    if (!['approved', 'rejected', 'pending_review'].includes(status)) throw new CreatorError('invalid_status')
    const s = await store.get(keys.sub(id))
    if (!s) throw new CreatorError('not_found', 404)
    if (s.status === 'withdrawn') throw new CreatorError('withdrawn_is_final', 409) // can never be re-approved
    s.status = status
    s.publishable = status === 'approved'
    s.history.push({ at: iso(now()), action: status, note: clean(note).slice(0, 300) })
    await store.set(keys.sub(id), s)
    return subSummary(s)
  }

  /* Records a removal / withdrawal request: the submission can never be published again, public access is
     cut (videos are deleted from Cloudflare, the photo is deleted) and the signed agreement record is KEPT
     (what is retained, and for how long, follows the approved privacy notice). Safe to repeat: re-running it
     retries any deletion that failed. */
  async function adminWithdraw(id, { requestedVia, note, deleteFiles = true }) {
    const s = await store.get(keys.sub(id))
    if (!s) throw new CreatorError('not_found', 404)
    const at = iso(now())
    if (s.status !== 'withdrawn') {
      s.status = 'withdrawn'
      s.publishable = false
      s.withdrawal = { at, requestedVia: clean(requestedVia).slice(0, 60) || 'unspecified', note: clean(note).slice(0, 500) }
      s.history.push({ at, action: 'withdrawn', note: s.withdrawal.note })
    }
    const failures = []
    if (deleteFiles) {
      for (const v of s.assets.videos) {
        if (v.deletedAt) continue
        try {
          await cf.deleteVideo(v.uid)
          v.deletedAt = at
        } catch (err) {
          log('cf_delete_failed', { status: err?.status })
          failures.push(v.uid)
        }
      }
      if (s.assets.photo && !s.assets.photo.deletedAt) {
        await store.del(keys.photo(id))
        s.assets.photo.deletedAt = at
      }
    }
    s.withdrawal.filesDeleted = deleteFiles && failures.length === 0
    s.withdrawal.pendingDeletion = failures
    await store.set(keys.sub(id), s)
    return { ...subSummary(s), withdrawal: s.withdrawal }
  }

  return {
    createInvite, rotateInvite, revokeInvite, resolve,
    session, saveDraft, videoUpload, videoStatus, videoPreview, videoRemove,
    photoPut, photoGet, photoRemove, submit, receipt,
    adminOverview, adminSubmission, adminVideoToken, adminVideoDownload, adminPhoto, adminReceipt, adminSetStatus, adminWithdraw,
  }
}
