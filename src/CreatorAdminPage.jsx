import { useCallback, useEffect, useState } from 'react'
import CreatorShell from './components/creator/CreatorShell.jsx'
import PlayerModal from './components/creator/PlayerModal.jsx'
import { SpinnerIcon, PlayIcon, DownloadIcon, CheckIcon } from './components/creator/icons.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { privateHead } from './seo/privateSeo.js'
import { PRIVATE_PATHS } from './routes.js'
import { STATUS_LABELS } from './lib/creator/constants.js'
import { OWNER_REVIEW_BLOCKERS } from './content/creatorLegal.js'

/* /creator-admin — the owner's minimal review page. Everything here is authorised on the SERVER: the page itself
   holds no secret. Signing in posts the owner password to /api/creator-admin/login, which sets an HttpOnly,
   SameSite=Strict, signed, 8-hour session cookie (JavaScript cannot read it). Without that cookie every
   /api/creator-admin/* call answers 401 and this page shows only the sign-in form. */

const call = async (path, { method = 'GET', body } = {}) => {
  try {
    const res = await fetch(`/api/creator-admin/${path}`, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = (res.headers.get('content-type') || '').includes('json') ? await res.json().catch(() => ({})) : {}
    return { ok: res.ok, status: res.status, ...json }
  } catch {
    return { ok: false, status: 0, error: 'network' }
  }
}

const STATUS_STYLE = {
  pending_review: 'bg-amber/15 text-amber',
  approved: 'bg-lime/15 text-lime',
  rejected: 'bg-coral/15 text-coral',
  withdrawn: 'bg-surface-3 text-ink-muted',
  open: 'bg-surface-3 text-ink',
  completed: 'bg-lime/15 text-lime',
  expired: 'bg-surface-3 text-ink-subtle',
  revoked: 'bg-coral/15 text-coral',
}
const Badge = ({ status, children }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status] || 'bg-surface-3 text-ink'}`}>{children ?? STATUS_LABELS[status] ?? status}</span>
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')
const btn = 'inline-flex h-10 items-center justify-center gap-2 rounded-full border border-hairline-strong px-4 text-sm font-medium text-ink hover:border-lime hover:text-lime disabled:opacity-50'
const btnPrimary = 'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-semibold text-canvas hover:bg-lime-light disabled:opacity-50'
const input = 'h-11 w-full rounded-full border border-hairline-strong bg-canvas px-4 text-[15px] text-ink placeholder:text-ink-subtle focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/40'

function Login({ onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    const r = await call('login', { method: 'POST', body: { password } })
    setBusy(false)
    if (r.ok) { setPassword(''); onDone() }
    else setError(r.status === 429 ? 'Too many attempts. Try again in a few minutes.' : r.error === 'not_configured' ? 'This deployment has no database connection. Check that KV_REST_API_URL and KV_REST_API_TOKEN exist for this environment, then redeploy.' : r.error === 'admin_not_configured' ? 'The owner login settings are missing or too short on this deployment. CREATOR_ADMIN_PASSWORD needs 16+ characters and CREATOR_ADMIN_SESSION_SECRET 32+. Check them, then redeploy.' : 'Incorrect password.')
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm py-24">
      <h1 className="text-2xl font-semibold text-ink">Creator review</h1>
      <p className="mt-2 text-sm text-ink-muted">Owner sign-in.</p>
      <label htmlFor="pw" className="mt-6 block text-sm font-medium text-ink">Password</label>
      <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mt-2`} />
      {error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}
      <button type="submit" disabled={busy || !password} className={`${btnPrimary} mt-5 w-full`}>{busy ? <SpinnerIcon className="h-4 w-4" /> : 'Sign in'}</button>
    </form>
  )
}

const CF_HELP = {
  ok: 'Connected: Cloudflare accepts the account ID and token.',
  not_configured: 'Not set up: the account ID and/or token is missing on this deployment.',
  rejected_401: 'Cloudflare rejected the token (401): it is wrong or incomplete. Create a new token.',
  rejected_403: 'Cloudflare refused access (403): the token needs Stream: Edit on this account.',
  rejected_404: 'Cloudflare could not find the account (404): check the account ID.',
}

function SetupCheck() {
  const [checks, setChecks] = useState(null)
  useEffect(() => { call('health').then((r) => r.ok && setChecks(r.checks)) }, [])
  if (!checks) return null
  const Row = ({ ok, label, detail }) => (
    <li className="flex items-start gap-3 text-sm"><span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ok ? 'bg-lime text-canvas' : 'bg-coral text-canvas'}`}>{ok ? '✓' : '!'}</span><span className="text-ink"><strong className="font-medium">{label}</strong>{detail && <span className="block text-ink-muted">{detail}</span>}</span></li>
  )
  const cf = checks.cloudflare
  return (
    <section aria-labelledby="setup" className="mb-10 rounded-3xl border border-hairline bg-surface-1 p-5">
      <h2 id="setup" className="text-lg font-semibold text-ink">Setup check</h2>
      <p className="mt-1 text-xs text-ink-subtle">Shows whether this deployment can see each setting (never the values). Environment: {checks.environment}.</p>
      <ul className="mt-4 space-y-3">
        <Row ok label="Database" detail={`Connected (${checks.database})`} />
        <Row ok={checks.cloudflareAccountId} label="CLOUDFLARE_ACCOUNT_ID" detail={checks.cloudflareAccountId ? 'Set' : 'Missing on this deployment'} />
        <Row ok={checks.cloudflareToken} label="CLOUDFLARE_STREAM_API_TOKEN" detail={checks.cloudflareToken ? 'Set' : 'Missing on this deployment'} />
        <Row ok={cf === 'ok'} label="Cloudflare Stream connection" detail={CF_HELP[cf] || `Cloudflare answered ${cf}.`} />
        <Row ok={checks.ownerEmail} label="Owner email alerts (email service key)" detail={checks.ownerEmail ? 'Set' : 'Missing: you will not get an email for new submissions'} />
      </ul>
      {OWNER_REVIEW_BLOCKERS.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <h3 className="text-sm font-semibold text-ink">Before real creators sign: your review is needed</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-muted marker:text-amber">
            {OWNER_REVIEW_BLOCKERS.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}
    </section>
  )
}

function Invites({ data, reload }) {
  const [label, setLabel] = useState('')
  const [source, setSource] = useState('fiverr')
  const [days, setDays] = useState(7)
  const [busy, setBusy] = useState(false)
  const [made, setMade] = useState(null) // { url, id }
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    setBusy(true); setError(''); setCopied(false)
    const r = await call('invite-create', { method: 'POST', body: { label, source, expiresInDays: Number(days) } })
    setBusy(false)
    if (!r.ok) { setError(r.error === 'legal_not_approved' ? 'Blocked on Production until the legal documents are approved.' : 'Could not create the invitation.'); return }
    setMade({ url: r.url, id: r.invite.id }); setLabel(''); reload()
  }
  const act = async (op, id) => {
    if (op === 'invite-revoke' && !window.confirm('Revoke this invitation? The link stops working immediately.')) return
    const r = await call(op, { method: 'POST', body: { id } })
    if (r.ok && r.url) { setMade({ url: r.url, id }); setCopied(false) }
    reload()
  }
  const copy = async () => { try { await navigator.clipboard.writeText(made.url); setCopied(true) } catch { /* select manually */ } }

  return (
    <section aria-labelledby="inv">
      <h2 id="inv" className="text-xl font-semibold text-ink">Invitations</h2>
      <form onSubmit={create} className="mt-4 grid gap-3 rounded-3xl border border-hairline bg-surface-1 p-5 sm:grid-cols-[1fr_auto_auto_auto]">
        <input className={input} placeholder="Note, e.g. Fiverr username" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} aria-label="Note for this invitation" />
        <select className={`${input} sm:w-32`} value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source"><option value="fiverr">Fiverr</option><option value="direct">Direct</option></select>
        <select className={`${input} sm:w-32`} value={days} onChange={(e) => setDays(e.target.value)} aria-label="Valid for">{[1, 3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}</select>
        <button className={btnPrimary} disabled={busy}>{busy ? <SpinnerIcon className="h-4 w-4" /> : 'Create link'}</button>
      </form>
      {error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}
      {made && (
        <div className="mt-4 rounded-3xl border border-lime/40 bg-lime/5 p-5" role="status">
          <p className="text-sm font-medium text-ink">Invitation link for {made.id}. Copy it now: it is shown only once (you can issue a new link later).</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={made.url} className={`${input} font-mono text-xs`} onFocus={(e) => e.target.select()} aria-label="Invitation link" />
            <button type="button" onClick={copy} className={btn}>{copied ? <><CheckIcon className="h-4 w-4" />Copied</> : 'Copy'}</button>
          </div>
        </div>
      )}
      <ul className="mt-5 space-y-2">
        {data.invites.length === 0 && <li className="text-sm text-ink-muted">No invitations yet.</li>}
        {data.invites.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-hairline px-4 py-3 text-sm">
            <span className="font-mono text-ink">{i.id}</span>
            <span className="min-w-0 flex-1 truncate text-ink-muted">{i.label || '—'} · {i.source}</span>
            <Badge status={i.status} />
            <span className="text-ink-subtle">{i.status === 'completed' ? `Submitted ${fmtDate(i.completedAt)}` : `${i.videosReady}/3 videos · expires ${fmtDate(i.expiresAt)}`}</span>
            {i.status !== 'completed' && i.status !== 'revoked' && (
              <span className="flex gap-2">
                <button className={btn} onClick={() => act('invite-rotate', i.id)}>New link</button>
                <button className={btn} onClick={() => act('invite-revoke', i.id)}>Revoke</button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Detail({ id, onBack, reload }) {
  const [sub, setSub] = useState(null)
  const [player, setPlayer] = useState(null)
  const [thumbs, setThumbs] = useState({})
  const [dl, setDl] = useState({}) // per slot: '' | 'preparing' | 'error'
  const [note, setNote] = useState('')
  const [wd, setWd] = useState({ open: false, via: 'Fiverr', note: '', deleteFiles: true })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const r = await call(`submission?id=${encodeURIComponent(id)}`)
    if (r.ok) setSub(r.submission); else setError('Could not load this submission.')
  }, [id])
  useEffect(() => { load() }, [load])

  const loadVideo = async (slot) => {
    const r = await call(`video-token?id=${encodeURIComponent(id)}&slot=${slot}`)
    if (r.ok) setThumbs((t) => ({ ...t, [slot]: r }))
    else setError(r.error === 'withdrawn' ? 'Withdrawn: playback is disabled.' : 'Could not load the video.')
  }
  /* Cloudflare prepares an MP4 first (can take a while for long videos), so keep asking until it is ready. */
  const download = async (slot) => {
    setError('')
    setDl((d) => ({ ...d, [slot]: 'preparing' }))
    for (let i = 0; i < 120; i++) {
      const r = await call(`video-download?id=${encodeURIComponent(id)}&slot=${slot}`)
      if (!r.ok) { setDl((d) => ({ ...d, [slot]: 'error' })); setError('Could not prepare the download. Please try again.'); return }
      if (r.status === 'ready' || r.url) {
        const a = document.createElement('a')
        a.href = r.url
        a.download = r.filename || `video-${slot}.mp4`
        a.rel = 'noopener'
        a.target = '_blank'
        document.body.appendChild(a); a.click(); a.remove()
        setDl((d) => ({ ...d, [slot]: '' }))
        return
      }
      await new Promise((res) => setTimeout(res, 3000))
    }
    setDl((d) => ({ ...d, [slot]: 'error' }))
    setError('The download is still being prepared. Please try again in a minute.')
  }
  const setStatus = async (status) => {
    setBusy(true); setError('')
    const r = await call('set-status', { method: 'POST', body: { id, status, note } })
    setBusy(false)
    if (r.ok) { setNote(''); await load(); reload() } else setError('Could not change the status.')
  }
  const withdraw = async (forceDelete = false) => {
    const deleteFiles = forceDelete || wd.deleteFiles
    if (!window.confirm(deleteFiles ? 'Record the withdrawal and permanently delete the videos and photo? The signed agreement record is kept. This cannot be undone.' : 'Record the withdrawal? The files will be kept until you delete them.')) return
    setBusy(true); setError('')
    const r = await call('withdraw', { method: 'POST', body: { id, requestedVia: wd.via, note: wd.note, deleteFiles } })
    setBusy(false)
    if (r.ok) { setWd({ ...wd, open: false }); await load(); reload() } else setError('Could not record the withdrawal.')
  }

  if (!sub) return <p className="py-10 text-ink-muted">{error || 'Loading…'}</p>
  const p = sub.profile
  const list = (arr, other) => [...arr.filter((x) => x !== 'Other'), other].filter(Boolean).join(', ')
  const withdrawn = sub.status === 'withdrawn'
  return (
    <section aria-label="Submission">
      <button className={`${btn} mb-5`} onClick={onBack}>← All submissions</button>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-ink">{p.displayName}</h2>
        <Badge status={sub.status} />
        <span className="font-mono text-sm text-ink-muted">{sub.id}</span>
      </div>
      <p className="mt-1 text-sm text-ink-subtle">Submitted {fmtDate(sub.submittedAt)} · {sub.source}{sub.inviteLabel ? ` · ${sub.inviteLabel}` : ''}</p>
      {error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}

      <dl className="mt-6 grid gap-x-8 gap-y-3 rounded-3xl border border-hairline bg-surface-1 p-5 text-sm sm:grid-cols-[180px_1fr]">
        <dt className="text-ink-subtle">Full legal name</dt><dd className="text-ink">{p.legalName}</dd>
        <dt className="text-ink-subtle">Fiverr profile</dt><dd className="text-ink">{p.fiverrUrl ? <a className="text-lime underline" href={p.fiverrUrl} target="_blank" rel="noopener noreferrer">{p.fiverrUrl}</a> : '—'}</dd>
        <dt className="text-ink-subtle">Languages</dt><dd className="text-ink">{list(p.languages, p.languagesOther)}</dd>
        <dt className="text-ink-subtle">Specialization</dt><dd className="text-ink">{list(p.specializations, p.specializationOther)}</dd>
        <dt className="text-ink-subtle">Signature</dt><dd className="text-ink">{sub.acceptance.signature} · {fmtDate(sub.acceptance.acceptedAt)}</dd>
        <dt className="text-ink-subtle">Accepted revision</dt><dd className="break-all text-ink">{sub.acceptance.agreementVersion} · {sub.acceptance.privacyVersion}</dd>
        <dt className="text-ink-subtle">Statements accepted</dt><dd className="text-ink">{sub.acceptance.checkboxes.filter((c) => c.accepted).length} of {sub.acceptance.checkboxes.length}</dd>
      </dl>

      <h3 className="mt-8 text-lg font-semibold text-ink">Videos</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {sub.assets.videos.map((v) => (
          <div key={v.slot} className="rounded-2xl border border-hairline bg-surface-1 p-3">
            <div className="relative aspect-[9/14] overflow-hidden rounded-xl bg-surface-2">
              {thumbs[v.slot] ? (
                <button type="button" className="group relative h-full w-full" onClick={() => setPlayer({ slot: v.slot, src: thumbs[v.slot].playbackUrl })} aria-label={`Play video ${v.slot}`}>
                  <img src={thumbs[v.slot].thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-canvas/30 text-lime opacity-90 group-hover:opacity-100"><PlayIcon className="h-10 w-10" /></span>
                </button>
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center text-sm text-ink-muted">
                  {v.deletedAt ? 'Deleted' : <button className={btn} disabled={withdrawn} onClick={() => loadVideo(v.slot)}>Load video {v.slot}</button>}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-xs text-ink-muted">{v.filename} · {v.duration}s</p>
            {!v.deletedAt && !withdrawn && (
              <button className={`${btn} mt-2 w-full`} disabled={dl[v.slot] === 'preparing'} onClick={() => download(v.slot)}>
                {dl[v.slot] === 'preparing' ? <><SpinnerIcon className="h-4 w-4" />Preparing…</> : <><DownloadIcon className="h-4 w-4" />Download</>}
              </button>
            )}
          </div>
        ))}
      </div>

      {sub.assets.photo && !sub.assets.photo.deletedAt && !withdrawn && (
        <div className="mt-6 flex items-center gap-4">
          <img src={`/api/creator-admin/photo?id=${encodeURIComponent(id)}`} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
          <span className="text-sm text-ink-muted">Profile photo</span>
          <a className={btn} href={`/api/creator-admin/photo?id=${encodeURIComponent(id)}`} download={`profile-photo-${id}.jpg`}><DownloadIcon className="h-4 w-4" />Download</a>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a className={btn} href={`/api/creator-admin/agreement?id=${encodeURIComponent(id)}`} download><DownloadIcon className="h-4 w-4" />Signed agreement (PDF)</a>
      </div>

      {!withdrawn && (
        <div className="mt-8 rounded-3xl border border-hairline p-5">
          <h3 className="text-lg font-semibold text-ink">Decision</h3>
          <input className={`${input} mt-3`} placeholder="Optional note (kept in the history)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} aria-label="Decision note" />
          <div className="mt-3 flex flex-wrap gap-3">
            <button className={btnPrimary} disabled={busy || sub.status === 'approved'} onClick={() => setStatus('approved')}>Approve</button>
            <button className={btn} disabled={busy || sub.status === 'rejected'} onClick={() => setStatus('rejected')}>Reject</button>
            {sub.status !== 'pending_review' && <button className={btn} disabled={busy} onClick={() => setStatus('pending_review')}>Back to pending</button>}
          </div>
          <p className="mt-3 text-xs text-ink-subtle">Approving marks it ready for a future showcase. Nothing is published automatically; videos stay private.</p>
        </div>
      )}

      <div className="mt-6 rounded-3xl border border-hairline p-5">
        <h3 className="text-lg font-semibold text-ink">Removal / withdrawal request</h3>
        {withdrawn ? (
          <p className="mt-2 text-sm text-ink-muted">
            Withdrawn {fmtDate(sub.withdrawal?.at)} via {sub.withdrawal?.requestedVia}. Files {sub.withdrawal?.filesDeleted ? 'deleted' : 'not yet deleted'}. This submission can never be published.
            {!sub.withdrawal?.filesDeleted && <button className={`${btn} ml-3`} disabled={busy} onClick={() => withdraw(true)}>Delete files now</button>}
          </p>
        ) : !wd.open ? (
          <button className={`${btn} mt-3`} onClick={() => setWd({ ...wd, open: true })}>Record a request…</button>
        ) : (
          <div className="mt-3 space-y-3">
            <input className={input} value={wd.via} onChange={(e) => setWd({ ...wd, via: e.target.value })} placeholder="How was it requested? (Fiverr, email…)" aria-label="Requested via" />
            <input className={input} value={wd.note} onChange={(e) => setWd({ ...wd, note: e.target.value })} placeholder="Note" aria-label="Withdrawal note" />
            <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={wd.deleteFiles} onChange={(e) => setWd({ ...wd, deleteFiles: e.target.checked })} />Delete the videos and photo now (the signed agreement record is kept)</label>
            <div className="flex gap-3"><button className={btnPrimary} disabled={busy} onClick={() => withdraw()}>Record withdrawal</button><button className={btn} onClick={() => setWd({ ...wd, open: false })}>Cancel</button></div>
          </div>
        )}
      </div>
      {player && <PlayerModal src={player.src} title={`Video ${player.slot}`} onClose={() => setPlayer(null)} />}
    </section>
  )
}

export default function CreatorAdminPage() {
  useDocumentHead(privateHead(PRIVATE_PATHS.creatorAdmin))
  const [state, setState] = useState('checking') // checking | login | ready
  const [data, setData] = useState(null)
  const [openId, setOpenId] = useState(null)

  const reload = useCallback(async () => {
    const r = await call('overview')
    if (r.status === 401 || r.status === 503) { setState('login'); return }
    if (r.ok) { setData(r); setState('ready') }
  }, [])
  useEffect(() => {
    reload()
    const q = new URLSearchParams(window.location.search).get('submission')
    if (q) setOpenId(q)
  }, [reload])

  const signOut = async () => { await call('logout', { method: 'POST' }); setData(null); setState('login') }

  return (
    <CreatorShell label="Creator review">
      {state === 'checking' && <div className="py-24 text-center"><SpinnerIcon className="mx-auto h-8 w-8 text-lime" /><h1 className="sr-only">Creator review</h1></div>}
      {state === 'login' && <Login onDone={reload} />}
      {state === 'ready' && data && (
        <div className="py-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-ink">Creator review</h1>
            <button className={btn} onClick={signOut}>Sign out</button>
          </div>
          {!data.legal.approved && (
            <p className="mb-8 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
              Legal documents are still a draft. Invitations and submissions are blocked on Production until the owner approves them. Preview deployments work for testing.
            </p>
          )}
          {!openId && <SetupCheck />}
          {openId ? (
            <Detail id={openId} onBack={() => { setOpenId(null); window.history.replaceState(null, '', PRIVATE_PATHS.creatorAdmin) }} reload={reload} />
          ) : (
            <div className="space-y-12">
              <section aria-labelledby="subs">
                <h2 id="subs" className="text-xl font-semibold text-ink">Submissions</h2>
                <ul className="mt-4 space-y-2">
                  {data.submissions.length === 0 && <li className="text-sm text-ink-muted">Nothing submitted yet.</li>}
                  {data.submissions.map((s) => (
                    <li key={s.id}>
                      <button onClick={() => setOpenId(s.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-hairline px-4 py-3 text-left text-sm hover:border-lime">
                        <span className="min-w-0 flex-1 truncate font-medium text-ink">{s.displayName}</span>
                        <Badge status={s.status} />
                        <span className="text-ink-subtle">{s.languages.join(', ')}</span>
                        <span className="font-mono text-ink-muted">{s.id}</span>
                        <span className="text-ink-subtle">{fmtDate(s.submittedAt)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              <Invites data={data} reload={reload} />
            </div>
          )}
        </div>
      )}
    </CreatorShell>
  )
}
