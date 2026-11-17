#!/usr/bin/env node
/* One end-to-end creator submission against a running site, then clean-up. Node 22+, no dependencies.

     BASE_URL=https://www.convrt.studio ADMIN_PASSWORD='…' node scripts/e2e-creator-submission.mjs

   It plays both roles with DUMMY data only: the owner (signs in, creates an invitation) and a made-up creator
   (uploads three 2-second test videos straight to Cloudflare, signs, submits), then checks the signed PDF and the
   owner's review access, and finally records a withdrawal with "delete files" so nothing is left behind.
   The password is read from the environment, never from arguments, and is never printed.
   Production refuses invitations until the legal gate is opened: it then stops at step 2 with a clear message. */

const BASE = (process.env.BASE_URL || 'https://www.convrt.studio').replace(/\/+$/, '')
const PASSWORD = process.env.ADMIN_PASSWORD
if (!PASSWORD) { console.error('Set ADMIN_PASSWORD in the environment.'); process.exit(2) }

// A valid 2-second 96x160 H.264/AAC MP4 (3 KB).
const TINY_MP4 = Buffer.from('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CzoAAAtPAAALZAAAC3kAAAuSAAALrQAAC8IAAAvXAAAL7AAADAEAAAwWAAAMLwAADEQAAAxZAAAMdgAAABpzZ3BkAQAAAHJvbGwAAAACAAAAAf//AAAAHHNiZ3AAAAAAcm9sbAAAAAEAAAAtAAAAAQAAAGF1ZHRhAAAAWW1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALGlsc3QAAAAkqXRvbwAAABxkYXRhAAAAAQAAAABMYXZmNjMuMS4xMDIAAAAIZnJlZQAABLFtZGF0AAACsAYF//+s3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NSByMzIyMiBiMzU2MDVhIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTE2IGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDM6MHgxMzMgbWU9dW1oIHN1Ym1lPTEwIHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MjQgY2hyb21hX21lPTEgdHJlbGxpcz0yIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9NSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTggYl9weXJhbWlkPTIgYl9hZGFwdD0yIGJfYmlhcz0wIGRpcmVjdD0zIHdlaWdodGI9MSBvcGVuX2dvcD0wIHdlaWdodHA9MiBrZXlpbnQ9MjUwIGtleWludF9taW49MTAgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD02MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTQwLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAoZYiBAAJf/t4jwKXSm0XVc8b54IBrcwq2kWdqPeR8LehgMYMBVhPtgQAAAApBmgktiCP/AAJO3ABMYXZjNjMuMS4xMDIAAjBADgAAAAlBnhCHEEP/DYkBGCAHARggBwEYIAcAAAAJAZ4YJohv/xLQARggBwEYIAcAAAAJAZ4YRohv/xLRARggBwEYIAcAAAAJAZ4YZohv/xLRARggBwEYIAcAAAAJAZ4YrUhv/xLRARggBwEYIAcAAAAJAZ4YzUhv/xLRARggBwEYIAcAAAAJAZ4Y7Uhv/xLQARggBwEYIAcBGCAHAAAACQGeGQ1Ib/8S0AEYIAcBGCAHAAAAD0GaGkk1AgLRMpgQ7wARcQEYIAcBGCAHAAAACUGeIaXEEP8NiAEYIAcBGCAHAAAACQGeKUWiG/8S0AEYIAcBGCAHAAAACQGeKWWiG/8S0QEYIAcBGCAHAAAACQGeKYWiG/8S0QEYIAcBGCAHAAAACQGeKcySG/8S0QEYIAcBGCAHARggBwAAAAkBninskhv/EtABGCAHARggBwAAAAkBnioMkhv/EtABGCAHARggBwAAAAkBnioskhv/EtEBGCAHARggBwAAABFBmipptQIC2tEymAEN/wAg4AEYIAcBGCAHARggBwEYIAcBGCAHARggBwEYIAc=', 'base64')

const NAME = 'E2E Test Creator'
let cookie = ''
let invite = null // { id, token }
let submitted = false
const results = []
const step = (n, label, ok, detail = '') => {
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}. ${label}${detail ? ' — ' + detail : ''}`)
  if (!ok) throw new Error(label)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(path, { method = 'GET', body, headers = {}, raw } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { Origin: BASE, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: raw ?? (body ? JSON.stringify(body) : undefined),
    redirect: 'manual',
  })
  const type = res.headers.get('content-type') || ''
  const json = type.includes('json') ? await res.json().catch(() => ({})) : null
  return { res, status: res.status, json, type }
}
const admin = (path, opts = {}) => api('/api/creator-admin/' + path, { ...opts, headers: { Cookie: cookie, ...(opts.headers || {}) } })
const creator = (path, opts = {}) => api('/api/creator/' + path, { ...opts, headers: { Authorization: 'Bearer ' + invite.token, ...(opts.headers || {}) } })

async function main() {
  console.log('Target:', BASE, '\n')

  // 1. Owner signs in.
  const login = await api('/api/creator-admin/login', { method: 'POST', body: { password: PASSWORD } })
  cookie = (login.res.headers.get('set-cookie') || '').split(';')[0]
  step(1, 'Owner sign-in', login.status === 200 && cookie.length > 10, login.status === 200 ? '' : 'HTTP ' + login.status + ' ' + (login.json?.error || ''))

  // Setup check: database, Cloudflare, region.
  const health = await admin('health')
  const c = health.json?.checks || {}
  step(2, 'Setup check: database and Cloudflare connected', c.cloudflare === 'ok' && c.database, `database=${c.database} cloudflare=${c.cloudflare} functions=${c.functionRegion} email=${c.ownerEmail ? 'on' : 'OFF'}`)

  // 3. Owner creates an invitation (Production refuses this until the legal gate is open).
  const inv = await admin('invite-create', { method: 'POST', body: { label: 'E2E TEST (auto-deleted)', source: 'fiverr', expiresInDays: 1 } })
  if (inv.json?.error === 'legal_not_approved') {
    console.log('\nSTOPPED: Production still has the legal gate closed (LEGAL_STATUS.approved = false). Expected until you approve the final documents.')
    process.exit(3)
  }
  step(3, 'Invitation created', inv.status === 200 && inv.json?.url, inv.json?.error || '')
  invite = { id: inv.json.invite.id, token: new URL(inv.json.url).searchParams.get('invite') }

  // 4. The creator opens it (session) and the agreement/privacy revisions are known.
  const session = await creator('session')
  step(4, 'Creator link opens', session.status === 200 && session.json?.status === 'open')
  const legal = session.json.legal

  // 5. Three videos straight to Cloudflare, then processed.
  const uids = []
  for (const slot of [1, 2, 3]) {
    const auth = await creator('video-upload', { method: 'POST', body: { slot, filename: `e2e-test-${slot}.mp4`, type: 'video/mp4', size: TINY_MP4.length } })
    if (auth.status !== 200) step(5, `Upload slot ${slot}`, false, 'authorisation ' + auth.status + ' ' + (auth.json?.error || ''))
    const form = new FormData()
    form.append('file', new Blob([TINY_MP4], { type: 'video/mp4' }), `e2e-test-${slot}.mp4`)
    const up = await fetch(auth.json.uploadURL, { method: 'POST', body: form })
    if (!up.ok) step(5, `Upload slot ${slot}`, false, 'Cloudflare ' + up.status)
    let state = ''
    for (let i = 0; i < 60 && state !== 'ready'; i++) {
      const st = await creator('video-status', { method: 'POST', body: { slot } })
      state = st.json?.video?.state
      if (state === 'error') step(5, `Video ${slot} processed`, false, st.json.video.error)
      if (state !== 'ready') await sleep(2000)
      else uids.push(st.json.video.uid)
    }
    if (state !== 'ready') step(5, `Video ${slot} processed`, false, 'timed out after 2 minutes')
  }
  step(5, 'Three videos uploaded and ready', uids.length === 3)

  // 6. Submit (timed).
  const t0 = Date.now()
  const sub = await creator('submit', {
    method: 'POST',
    body: {
      profile: { legalName: NAME, displayName: 'E2E Test', fiverrUrl: 'https://www.fiverr.com/e2etestcreator', languages: ['English'], languagesOther: '', specializations: ['UGC videos'], specializationOther: '' },
      accepted: { rights: true, agreement: true, display: true, privacy: true },
      signature: NAME,
      agreementVersion: legal.agreementVersion,
      privacyVersion: legal.privacyVersion,
      assets: { videos: uids, photo: null },
    },
  })
  const secs = ((Date.now() - t0) / 1000).toFixed(1)
  step(6, 'Submission accepted', sub.status === 200 && sub.json?.ref === invite.id, `${secs}s${sub.json?.error ? ' ' + sub.json.error : ''}`)
  submitted = true

  // 7. The creator's signed copy is a PDF with their name.
  const pdf = await api('/api/creator/agreement', { headers: { Authorization: 'Bearer ' + invite.token } })
  const bytes = Buffer.from(await pdf.res.arrayBuffer())
  step(7, 'Signed agreement downloads as a PDF', pdf.status === 200 && pdf.type.includes('pdf') && bytes.subarray(0, 5).toString() === '%PDF-' && bytes.length > 5000, `${bytes.length} bytes`)

  // 8. The owner sees it, can play a video (signed link) and download the agreement.
  const detail = await admin('submission?id=' + invite.id)
  step(8, 'Owner sees the submission as Pending review', detail.json?.submission?.status === 'pending_review' && detail.json.submission.profile.legalName === NAME)
  const tok = await admin(`video-token?id=${invite.id}&slot=1`)
  step(9, 'Owner gets a private signed playback link', tok.status === 200 && /manifest\/video\.m3u8/.test(tok.json?.playbackUrl || ''))
  const adminPdf = await api(`/api/creator-admin/agreement?id=${invite.id}`, { headers: { Cookie: cookie } })
  step(10, 'Owner can download the signed agreement', adminPdf.status === 200 && adminPdf.type.includes('pdf'))
}

async function cleanup() {
  try {
    if (!cookie || !invite) return
    if (submitted) {
      const w = await admin('withdraw', { method: 'POST', body: { id: invite.id, requestedVia: 'e2e test', note: 'automatic clean-up', deleteFiles: true } })
      const ok = w.status === 200 && w.json?.submission?.status === 'withdrawn' && w.json.submission.withdrawal?.filesDeleted
      console.log(ok ? 'PASS  cleanup: test submission withdrawn and its videos deleted' : 'WARN  cleanup incomplete: withdraw ' + invite.id + ' by hand in /creator-admin')
    } else {
      await admin('invite-revoke', { method: 'POST', body: { id: invite.id } })
      console.log('cleanup: test invitation revoked (unsubmitted uploads are purged by the daily job)')
    }
  } catch (e) {
    console.log('WARN  cleanup failed:', e.message, '— remove', invite?.id, 'by hand in /creator-admin')
  }
}

try {
  await main()
  await cleanup()
  console.log('\nALL ' + results.length + ' CHECKS PASSED')
} catch (e) {
  await cleanup()
  console.log('\nFAILED:', e.message)
  process.exit(1)
}
