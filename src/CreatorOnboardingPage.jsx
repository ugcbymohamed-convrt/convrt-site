import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CreatorShell from './components/creator/CreatorShell.jsx'
import VideoCard from './components/creator/VideoCard.jsx'
import PhotoUpload from './components/creator/PhotoUpload.jsx'
import PlayerModal from './components/creator/PlayerModal.jsx'
import LegalDocument from './components/creator/LegalDocument.jsx'
import { VideoIcon, UsersIcon, ShieldCheckIcon, CheckIcon, ChevronIcon, AlertIcon, DownloadIcon, SpinnerIcon } from './components/creator/icons.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { privateHead } from './seo/privateSeo.js'
import { PRIVATE_PATHS } from './routes.js'
import { CONTACT_EMAIL } from './config.js'
import {
  LANGUAGES, SPECIALIZATIONS, VIDEO_SLOTS, ACCEPTANCES, FIVERR_STATEMENT, PHOTO_MAX_BYTES, VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS, humanBytes,
} from './lib/creator/constants.js'
import {
  EMPTY_PROFILE, validateProfile, validateAcceptance, validateVideoFile, videoDurationError,
} from './lib/creator/validation.js'
import { readInviteToken, creatorApi, uploadToCloudflare, readVideoDuration, prepareProfilePhoto } from './lib/creator/api.js'
import { AGREEMENT, AGREEMENT_VERSION, PRIVACY_VERSION } from './content/creatorLegal.js'

/* /creator-onboarding — private, invitation-only portfolio submission for freelance creators.
   Not linked from anywhere public, noindex, no analytics. The invitation token is read once from the URL, removed
   from the address bar, and sent only in an Authorization header. Orders, payments and communication stay on Fiverr. */

const BENEFITS = [
  { Icon: VideoIcon, label: 'Showcase your work' },
  { Icon: UsersIcon, label: 'New opportunities' },
  { Icon: ShieldCheckIcon, label: 'Your content stays yours' },
]

const PROTECTIONS = [
  'Website portfolio display only',
  'No AI training or face/voice cloning',
  'No digital avatars or synthetic replicas',
  'No paid advertising or redistribution',
  'You retain your existing ownership rights',
  'Request removal at any time',
]

const emptySlots = () => Object.fromEntries(VIDEO_SLOTS.map((s) => [s, { status: 'empty' }]))

/* ───────────── small field components ───────────── */

function FieldError({ id, children }) {
  if (!children) return null
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-coral" role="alert">
      <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

function TextField({ id, label, value, onChange, placeholder, error, hint, autoComplete, inputMode, maxLength, disabled }) {
  return (
    <div data-field={id}>
      <label htmlFor={id} className="mb-3 block text-base font-medium text-ink">{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete || 'off'}
        inputMode={inputMode}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`h-14 w-full rounded-full border bg-canvas px-6 text-[17px] text-ink placeholder:text-ink-subtle/80 transition-colors focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/40 disabled:opacity-60 motion-reduce:transition-none ${error ? 'border-coral/70' : 'border-hairline-strong'}`}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-2 px-2 text-[13px] text-ink-subtle">{hint}</p>}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

function Pills({ id, legend, options, value, onChange, error }) {
  const toggle = (o) => onChange((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]))
  return (
    <fieldset data-field={id} className="min-w-0" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-3 text-base font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((o) => {
          const on = value.includes(o)
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o)}
              className={`min-h-[44px] rounded-full border px-4 text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime motion-reduce:transition-none ${
                on ? 'border-lime bg-lime/10 text-ink' : error ? 'border-coral/50 text-ink-muted hover:border-ink-subtle' : 'border-hairline-strong text-ink-muted hover:border-ink-subtle hover:text-ink'
              }`}
            >
              {on && <CheckIcon className="-ml-1 mr-1 inline h-3.5 w-3.5 text-lime" />}
              {o}
            </button>
          )
        })}
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </fieldset>
  )
}

function Check({ id, checked, onChange, error, children }) {
  return (
    <div data-field={id}>
      <label className="group flex cursor-pointer items-start gap-3.5 py-1.5">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime motion-reduce:transition-none ${
            checked ? 'border-lime bg-lime text-canvas' : error ? 'border-coral bg-surface-2' : 'border-hairline-strong bg-surface-2 group-hover:border-ink-subtle'
          }`}
        >
          {checked && <CheckIcon className="h-3.5 w-3.5" />}
        </span>
        <span className="text-[16px] leading-snug text-ink">{children}</span>
      </label>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

const Divider = () => <hr className="border-0 border-t border-hairline" />

function Message({ title, children }) {
  return (
    <section className="py-20 text-center md:py-28" aria-live="polite">
      <h1 className="font-display text-3xl font-bold tracking-display text-ink md:text-4xl">{title}</h1>
      <div className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">{children}</div>
    </section>
  )
}

/* ───────────── page ───────────── */

export default function CreatorOnboardingPage() {
  useDocumentHead(privateHead(PRIVATE_PATHS.creatorOnboarding))

  // Keep the invitation link out of Referer headers sent from this page.
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'referrer'
    m.content = 'no-referrer'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  const [phase, setPhase] = useState('loading') // loading | noinvite | invalid | expired | unavailable | form | done
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [slots, setSlots] = useState(emptySlots)
  const [photo, setPhoto] = useState(null) // { sha256, size } | null
  const [photoUrl, setPhotoUrl] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [accepted, setAccepted] = useState({})
  const [signature, setSignature] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [player, setPlayer] = useState(null)
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const api = useRef(null)
  const controllers = useRef({})
  const draftTimer = useRef(null)
  const draftReady = useRef(false)
  const alive = useRef(true)
  // StrictMode mounts, unmounts and re-mounts in development: `alive` must be switched back on every mount.
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; Object.values(controllers.current).forEach((c) => c.abort()); controllers.current = {} }
  }, [])

  const source = session?.source || 'fiverr'
  const patchSlot = useCallback((slot, patch) => setSlots((s) => ({ ...s, [slot]: { ...s[slot], ...patch } })), [])

  /* Any change to the submitted assets voids the acceptance: the creator must confirm again for what is actually there. */
  const voidAcceptance = useCallback(() => {
    setAccepted((prev) => {
      if (Object.values(prev).some(Boolean)) setNotice('You changed your uploads, so please confirm the agreement again below.')
      return {}
    })
  }, [])

  /* ── load the invitation ── */
  useEffect(() => {
    const token = readInviteToken()
    if (!token) { setPhase('noinvite'); return }
    api.current = creatorApi(token)
    ;(async () => {
      const r = await api.current.session()
      if (!alive.current) return
      if (!r.ok) {
        if (r.error === 'invite_expired') setPhase('expired')
        else if (r.status === 401 || r.status === 409) setPhase('invalid')
        else setPhase('unavailable')
        return
      }
      applySession(r.data)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applySession(data) {
    setSession(data)
    setProfile({ ...EMPTY_PROFILE, ...(data.draft || {}) })
    if (data.status === 'completed') { setPhase('done'); return }
    const next = emptySlots()
    for (const s of VIDEO_SLOTS) {
      const v = data.videos?.[s]
      if (!v) continue
      if (v.state === 'ready') next[s] = { status: 'ready', uid: v.uid, filename: v.filename, duration: v.duration, size: v.size }
      else if (v.state === 'processing') next[s] = { status: 'processing', uid: v.uid, filename: v.filename, progress: v.pct ?? 0 }
      else next[s] = { status: 'error', error: v.error || 'This upload did not finish. Please upload the video again.' }
    }
    setSlots(next)
    for (const s of VIDEO_SLOTS) {
      if (next[s].status === 'ready') loadPreview(s)
      if (next[s].status === 'processing') pollStatus(s)
    }
    if (data.photo) {
      setPhoto(data.photo)
      api.current.photoBlobUrl().then((u) => alive.current && setPhotoUrl(u))
    }
    setPhase('form')
    setTimeout(() => { draftReady.current = true }, 0)
  }

  /* ── resumable draft (profile fields only; never the agreement) ── */
  useEffect(() => {
    if (phase !== 'form' || !draftReady.current) return
    clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(() => api.current?.saveDraft(profile), 1200)
    return () => clearTimeout(draftTimer.current)
  }, [profile, phase])

  /* ── videos ── */
  async function loadPreview(slot) {
    const r = await api.current.videoPreview(slot)
    if (alive.current && r.ok) patchSlot(slot, { thumbnailUrl: r.data.thumbnailUrl, playbackUrl: r.data.playbackUrl })
  }

  async function pollStatus(slot) {
    const controller = controllers.current[slot] || (controllers.current[slot] = new AbortController())
    for (let i = 0; i < 400 && !controller.signal.aborted && alive.current; i++) {
      const r = await api.current.videoStatus(slot)
      if (controller.signal.aborted || !alive.current) return
      if (r.ok) {
        const v = r.data.video
        if (v.state === 'ready') {
          patchSlot(slot, { status: 'ready', uid: v.uid, duration: v.duration, size: v.size, progress: 100 })
          loadPreview(slot)
          return
        }
        if (v.state === 'error') { patchSlot(slot, { status: 'error', error: v.error }); return }
        patchSlot(slot, { status: v.state === 'processing' ? 'processing' : 'uploading', ...(v.state === 'processing' ? { progress: v.pct ?? 0 } : {}) })
      } else if (r.status === 0) {
        patchSlot(slot, { status: 'processing' }) // offline blip: keep trying
      } else { patchSlot(slot, { status: 'error', error: 'We lost track of this upload. Please try again.' }); return }
      await new Promise((res) => setTimeout(res, 2000))
    }
  }

  async function uploadVideo(slot, file) {
    setErrors((e) => ({ ...e, [`video${slot}`]: undefined }))
    const fileError = validateVideoFile(file)
    if (fileError) { patchSlot(slot, { status: 'error', filename: file.name, error: fileError }); return }
    controllers.current[slot]?.abort()
    const controller = (controllers.current[slot] = new AbortController())
    voidAcceptance()
    patchSlot(slot, { status: 'checking', filename: file.name, progress: 0, error: null, thumbnailUrl: null, playbackUrl: null, uid: null })

    const durationError = videoDurationError(await readVideoDuration(file))
    if (durationError) { patchSlot(slot, { status: 'error', error: durationError }); return }

    const auth = await api.current.videoUpload(slot, file)
    if (controller.signal.aborted) return
    if (!auth.ok) {
      const msg =
        auth.error === 'invalid_file' ? auth.data?.message
        : auth.error === 'upload_quota_reached' ? 'You have reached the upload limit for this invitation. Please message us on Fiverr for help.'
        : auth.error === 'rate_limited' ? 'Too many attempts. Please wait a few minutes and try again.'
        : auth.error === 'already_submitted' ? 'Your submission has already been received.'
        : auth.status === 0 ? 'Connection problem. Check your internet and try again.'
        : 'Uploads are temporarily unavailable. Please try again shortly.'
      patchSlot(slot, { status: 'error', error: msg || 'Please try again.' })
      return
    }
    patchSlot(slot, { status: 'uploading', progress: 0 })
    try {
      await uploadToCloudflare(auth.data.uploadURL, file, { signal: controller.signal, onProgress: (p) => patchSlot(slot, { progress: p * 100 }) })
    } catch (err) {
      if (controller.signal.aborted) return
      patchSlot(slot, { status: 'error', error: err.message === 'network' ? 'The upload was interrupted. Check your connection and try again.' : 'The upload failed. Please try again.' })
      return
    }
    patchSlot(slot, { status: 'processing', progress: 0 })
    pollStatus(slot)
  }

  async function removeVideo(slot) {
    controllers.current[slot]?.abort()
    delete controllers.current[slot]
    voidAcceptance()
    patchSlot(slot, { status: 'empty', filename: null, thumbnailUrl: null, playbackUrl: null, uid: null, error: null })
    await api.current.videoRemove(slot)
  }

  /* ── photo ── */
  async function uploadPhoto(file) {
    setPhotoError('')
    setPhotoBusy(true)
    try {
      const blob = await prepareProfilePhoto(file, PHOTO_MAX_BYTES)
      const r = await api.current.photoUpload(blob)
      if (!r.ok) throw new Error(r.error || 'upload')
      voidAcceptance()
      setPhoto(r.data.photo)
      setPhotoUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob) })
    } catch (err) {
      setPhotoError(err.message === 'type' ? 'Please choose a JPG or PNG image.' : 'We could not use that photo. Please try a different JPG or PNG.')
    } finally {
      setPhotoBusy(false)
    }
  }
  async function removePhoto() {
    setPhotoError('')
    voidAcceptance()
    setPhoto(null)
    setPhotoUrl((old) => { if (old) URL.revokeObjectURL(old); return null })
    await api.current.photoRemove()
  }

  /* ── validation + submit ── */
  const anyBusy = VIDEO_SLOTS.some((s) => ['uploading', 'processing', 'checking'].includes(slots[s].status)) || photoBusy

  function scrollToFirstError(errs) {
    const order = ['legalName', 'displayName', 'fiverrUrl', 'languages', 'languagesOther', 'specializations', 'specializationOther', 'video1', 'video2', 'video3', 'rights', 'agreement', 'display', 'privacy', 'signature']
    const first = order.find((k) => errs[k])
    if (!first) return
    const el = document.querySelector(`[data-field="${first}"]`) || document.getElementById(first)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.querySelector?.('input,button')?.focus?.({ preventScroll: true })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setFormError('')
    setNotice('')
    const p = validateProfile(profile, { source })
    const a = validateAcceptance(accepted, signature, p.value.legalName)
    const errs = { ...p.errors, ...a.errors }
    for (const s of VIDEO_SLOTS) {
      const st = slots[s].status
      if (st !== 'ready') errs[`video${s}`] = st === 'empty' || st === 'error' ? 'Please upload this video.' : 'Please wait for this video to finish uploading.'
    }
    setErrors(errs)
    if (Object.keys(errs).length) { scrollToFirstError(errs); return }

    setSubmitting(true)
    const r = await api.current.submit({
      profile: p.value,
      accepted,
      signature,
      agreementVersion: AGREEMENT_VERSION,
      privacyVersion: PRIVACY_VERSION,
      assets: { videos: VIDEO_SLOTS.map((s) => slots[s].uid), photo: photo?.sha256 || null },
    })
    setSubmitting(false)
    if (r.ok) {
      setSession((s) => ({ ...s, ref: r.data.ref, status: 'completed' }))
      setPhase('done')
      window.scrollTo({ top: 0 })
      return
    }
    if (r.error === 'validation_failed') { setErrors(r.data.errors || {}); scrollToFirstError(r.data.errors || {}); return }
    if (r.error === 'assets_changed') {
      setAccepted({})
      setNotice('Your uploads changed since you ticked the boxes. Please check everything and confirm again.')
      const s = await api.current.session()
      if (s.ok) applySession(s.data)
      return
    }
    if (r.error === 'legal_version_changed') { setFormError('The agreement was updated. Please reload this page and review it again.'); return }
    setFormError(
      r.error === 'submission_in_progress' ? 'Your submission is already being processed. Please wait a moment.'
      : r.error === 'already_submitted' ? 'This invitation has already been used to submit a profile.'
      : r.error === 'invite_expired' ? 'This invitation has expired. Please message us on Fiverr for a fresh link.'
      : r.error === 'rate_limited' ? 'Too many attempts. Please wait a few minutes and try again.'
      : r.error === 'legal_not_approved' ? 'Submissions are not open yet.'
      : r.status === 0 ? 'Connection problem. Your work is saved: check your internet and press submit again.'
      : 'Something went wrong on our side. Your uploads are saved: please try again in a moment.',
    )
  }

  async function downloadAgreement() {
    setDownloading(true)
    await api.current.downloadAgreement(`CONVRT-creator-agreement-${session.ref}.html`)
    setDownloading(false)
  }

  const setP = (k) => (v) => { setProfile((p) => ({ ...p, [k]: typeof v === 'function' ? v(p[k]) : v })); setErrors((e) => ({ ...e, [k]: undefined })) }
  const setAcc = (k) => (v) => { setAccepted((a) => ({ ...a, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }
  const legal = session?.legal
  const agreementLink = (
    <a href={PRIVATE_PATHS.creatorAgreement} target="_blank" rel="noopener noreferrer" className="text-lime underline underline-offset-2 hover:text-lime-light" onClick={(e) => e.stopPropagation()}>Creator Portfolio Agreement</a>
  )
  const privacyLink = (
    <a href={PRIVATE_PATHS.creatorPrivacy} target="_blank" rel="noopener noreferrer" className="text-lime underline underline-offset-2 hover:text-lime-light" onClick={(e) => e.stopPropagation()}>Creator Privacy Notice</a>
  )
  const acceptanceLabels = useMemo(() => ({
    rights: ACCEPTANCES[0].text,
    agreement: <>I have read and accept the {agreementLink}.</>,
    display: ACCEPTANCES[2].text,
    privacy: <>I acknowledge that I have read the {privacyLink}.</>,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  /* ───────────── states ───────────── */
  let body
  if (phase === 'loading') {
    body = <div className="min-h-[60vh] py-24 text-center text-ink-muted" aria-busy="true"><h1 className="sr-only">Creator network</h1><SpinnerIcon className="mx-auto h-8 w-8 text-lime" /></div>
  } else if (phase === 'noinvite') {
    body = (
      <Message title="This page is by invitation only.">
        <p>If you ordered through Fiverr, please use the personal link we sent you. Can’t find it? Message us on Fiverr and we’ll send it again.</p>
      </Message>
    )
  } else if (phase === 'expired') {
    body = <Message title="This invitation has expired."><p>Please message us on Fiverr and we’ll send you a fresh link.</p></Message>
  } else if (phase === 'invalid') {
    body = <Message title="This link isn’t valid."><p>It may have been replaced by a newer one, or withdrawn. Please message us on Fiverr and we’ll sort it out.</p></Message>
  } else if (phase === 'unavailable') {
    body = <Message title="We can’t open this page right now."><p>Please try again in a few minutes. If it keeps happening, message us on Fiverr or email {CONTACT_EMAIL}.</p></Message>
  } else if (phase === 'done') {
    body = (
      <section className="py-16 text-center md:py-24" aria-labelledby="done-heading">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime text-canvas"><CheckIcon className="h-8 w-8" /></span>
        <h1 id="done-heading" tabIndex={-1} className="mt-8 font-display text-4xl font-bold tracking-display text-ink md:text-5xl">You&apos;re one step closer!</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          Thank you for sharing your work with CONVRT. We&apos;ve received your creator profile, portfolio videos and signed agreement. Our team will review your submission before anything is published.
        </p>
        {source === 'fiverr' && <p className="mt-4 text-lg font-medium text-ink">{FIVERR_STATEMENT}</p>}
        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-hairline bg-surface-1 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">Your submission reference</p>
          <p className="mt-1 font-mono text-lg text-ink">{session?.ref}</p>
          <button type="button" onClick={downloadAgreement} disabled={downloading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-hairline-strong px-5 text-[15px] font-medium text-ink hover:border-lime hover:text-lime disabled:opacity-60">
            {downloading ? <SpinnerIcon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}Download my signed agreement
          </button>
          <p className="mt-3 text-xs leading-relaxed text-ink-subtle">Keep this copy for your records. It contains your signature, the date of acceptance and your submission reference. It’s only available through your personal link.</p>
        </div>
      </section>
    )
  } else {
    body = (
      <form onSubmit={onSubmit} noValidate>
        {/* Hero */}
        <section className="py-10 text-center md:py-14" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="font-display text-[34px] font-bold leading-[1.1] tracking-display text-ink md:text-[44px]">
            Let&apos;s create something <span className="text-lime">together.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Join our freelance creator network, showcase your talent and collaborate with international brands.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {BENEFITS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center justify-center gap-3 rounded-2xl bg-surface-1 px-4 py-4 sm:flex-col sm:gap-2.5 sm:py-5">
                <Icon className="h-6 w-6 text-lime" />
                <span className="text-[15px] text-ink">{label}</span>
              </li>
            ))}
          </ul>
        </section>
        <Divider />

        {/* 01 */}
        <section className="py-10" aria-labelledby="s1">
          <h2 id="s1" className="text-2xl font-semibold tracking-snug text-ink">01 — Your creator profile</h2>
          <div className="mt-8 space-y-7">
            <TextField id="legalName" label="Full legal name" value={profile.legalName} onChange={setP('legalName')} placeholder="Your full name" autoComplete="name" maxLength={120} error={errors.legalName}
              hint="Used for your agreement. Kept private unless you separately authorize its publication." />
            <TextField id="displayName" label="Public display name" value={profile.displayName} onChange={setP('displayName')} placeholder="Name to display on our website" maxLength={60} error={errors.displayName} />
            <TextField id="fiverrUrl" label={source === 'fiverr' ? 'Fiverr profile URL' : 'Fiverr profile URL (if applicable)'} value={profile.fiverrUrl} onChange={setP('fiverrUrl')} placeholder="https://www.fiverr.com/..." inputMode="url" maxLength={200} error={errors.fiverrUrl} />
            <Pills id="languages" legend="Languages" options={LANGUAGES} value={profile.languages} onChange={setP('languages')} error={errors.languages} />
            {profile.languages.includes('Other') && (
              <TextField id="languagesOther" label="Which other languages?" value={profile.languagesOther} onChange={setP('languagesOther')} placeholder="e.g. German, Portuguese" maxLength={120} error={errors.languagesOther} />
            )}
            <Pills id="specializations" legend="Creator specialization" options={SPECIALIZATIONS} value={profile.specializations} onChange={setP('specializations')} error={errors.specializations} />
            {profile.specializations.includes('Other') && (
              <TextField id="specializationOther" label="What else do you specialize in?" value={profile.specializationOther} onChange={setP('specializationOther')} placeholder="Tell us in a few words" maxLength={120} error={errors.specializationOther} />
            )}
          </div>
        </section>
        <Divider />

        {/* 02 */}
        <section className="py-10" aria-labelledby="s2">
          <h2 id="s2" className="text-2xl font-semibold tracking-snug text-ink">02 — Your portfolio</h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">Submit three edited videos that best represent your style and capabilities.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="video-grid">
            {VIDEO_SLOTS.map((s) => (
              <div key={s} data-field={`video${s}`}>
                <VideoCard slot={s} video={slots[s]} error={errors[`video${s}`]} disabled={submitting}
                  onFile={(f) => uploadVideo(s, f)} onRemove={() => removeVideo(s)} onPlay={() => setPlayer({ slot: s, src: slots[s].playbackUrl })} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-subtle">
            MP4 or MOV, up to {humanBytes(VIDEO_MAX_BYTES)} and {VIDEO_MAX_SECONDS / 60} minutes each. No need to compress them. Please only upload videos that you have permission to showcase on CONVRT’s website.
          </p>
          <div className="mt-5">
            <PhotoUpload photo={photo} previewUrl={photoUrl} busy={photoBusy} error={photoError} disabled={submitting} onFile={uploadPhoto} onRemove={removePhoto} />
          </div>
        </section>
        <Divider />

        {/* 03 */}
        <section className="py-10" aria-labelledby="s3">
          <h2 id="s3" className="text-2xl font-semibold tracking-snug text-ink">03 — Your rights and agreement</h2>
          <div className="mt-7 rounded-3xl bg-[#1a1d17] p-6 md:p-7">
            <h3 className="flex items-center gap-3 text-xl font-medium text-ink"><ShieldCheckIcon className="h-7 w-7 text-lime" />Your content is protected.</h3>
            <ul className="mt-5 space-y-3">
              {PROTECTIONS.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[16px] text-ink-muted"><CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-lime" />{t}</li>
              ))}
            </ul>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-hairline">
            <button type="button" onClick={() => setAgreementOpen((o) => !o)} aria-expanded={agreementOpen} aria-controls="agreement-full"
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[16px] font-medium text-ink hover:bg-surface-1">
              Read the full Creator Portfolio Agreement
              <ChevronIcon open={agreementOpen} />
            </button>
            {agreementOpen && (
              <div id="agreement-full" className="max-h-[420px] overflow-y-auto border-t border-hairline px-5 py-5" tabIndex={0} aria-label="Full Creator Portfolio Agreement">
                <LegalDocument doc={AGREEMENT} headingLevel={4} version={AGREEMENT_VERSION} />
              </div>
            )}
          </div>
          <p className="mt-3 px-1 text-[15px]">
            <a href={PRIVATE_PATHS.creatorPrivacy} target="_blank" rel="noopener noreferrer" className="text-lime underline underline-offset-2 hover:text-lime-light">Read the Creator Privacy Notice</a>
          </p>
          {legal && !legal.approved && (
            <p className="mt-4 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">These legal documents are drafts awaiting final approval by CONVRT.</p>
          )}

          <div className="mt-6 space-y-1">
            {ACCEPTANCES.map((a) => (
              <Check key={a.key} id={a.key} checked={Boolean(accepted[a.key])} onChange={setAcc(a.key)} error={errors[a.key]}>{acceptanceLabels[a.key]}</Check>
            ))}
          </div>

          <div className="mt-6">
            <TextField id="signature" label="Electronic signature — full legal name" value={signature} onChange={(v) => { setSignature(v); setErrors((e) => ({ ...e, signature: undefined })) }}
              placeholder="Type your full legal name" autoComplete="off" maxLength={120} error={errors.signature}
              hint="Typing your name is your signature. It is recorded with the date and time of your submission." />
          </div>

          {notice && <p className="mt-5 flex items-start gap-2 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber" role="status"><AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />{notice}</p>}
          {formError && <p className="mt-5 flex items-start gap-2 rounded-2xl border border-coral/50 bg-coral/10 px-4 py-3 text-sm text-coral" role="alert"><AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />{formError}</p>}

          <button type="submit" disabled={submitting}
            className="mt-7 flex h-[68px] w-full items-center justify-center gap-3 rounded-full bg-lime text-xl font-semibold text-canvas transition-colors hover:bg-lime-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime disabled:cursor-wait disabled:opacity-80 motion-reduce:transition-none">
            {submitting ? <><SpinnerIcon className="h-5 w-5" />Submitting…</> : 'Submit my creator profile'}
          </button>
          <p className="mt-4 text-center text-[15px] text-ink-subtle">Your submission will be reviewed before anything is published.</p>
          {anyBusy && <p className="mt-2 text-center text-[13px] text-ink-subtle" aria-live="polite">Uploads are still in progress. You can submit once they finish.</p>}
        </section>
      </form>
    )
  }

  return (
    <CreatorShell>
      {body}
      {player && <PlayerModal src={player.src} title={`Video ${player.slot}`} onClose={() => setPlayer(null)} />}
    </CreatorShell>
  )
}
