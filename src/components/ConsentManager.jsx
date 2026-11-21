import { useCallback, useEffect, useRef, useState } from 'react'
import { PRIVACY_POLICY_URL } from '../config.js'
import {
  DENIED_CHOICE, GRANTED_CHOICE, OPEN_CONSENT_EVENT,
  getConsentChoice, hasDecided, setConsent,
} from '../lib/consent.js'

/* Cookie consent banner + preferences dialog. Mounted by src/main.jsx in its OWN React root, only when a GTM container ID is configured
   (see src/lib/consent.js), so the prerendered pages and hydration are never affected.

   • First visit: a compact banner with Accept all, Reject all and Preferences. Accept and Reject are the same size and equally visible.
   • Preferences: Necessary (always on), Analytics and Marketing switches, both off until the visitor turns them on.
   • Later: the footer's "Cookie settings" link (CookieSettingsLink) re-opens the preferences dialog so a choice can be changed or withdrawn.
   • Nothing is pre-ticked. Closing the dialog without saving changes nothing. */

const btnBase = 'min-h-[44px] rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime motion-reduce:transition-none'
const btnPrimary = `${btnBase} bg-lime text-canvas hover:brightness-95`
const btnSecondary = `${btnBase} border border-hairline-strong bg-surface-2 text-ink hover:bg-surface-3`

function Switch({ id, checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-hairline bg-surface-2/60 p-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[15px] font-semibold text-ink">{label}</label>
        <p id={`${id}-desc`} className="mt-1 text-[13px] leading-relaxed text-ink-muted">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={`${id}-desc`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none ${checked ? 'border-lime bg-lime' : 'border-hairline-strong bg-surface-3'}`}
      >
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
        <span aria-hidden="true" className={`absolute top-0.5 h-5 w-5 rounded-full bg-canvas transition-[left] motion-reduce:transition-none ${checked ? 'left-[26px]' : 'left-0.5 bg-ink-muted'}`} />
      </button>
    </div>
  )
}

function PrivacyLink() {
  if (!PRIVACY_POLICY_URL) return null
  return <> <a href={PRIVACY_POLICY_URL} className="text-ink underline underline-offset-2 hover:text-lime">Privacy policy</a>.</>
}

function Preferences({ initial, onSave, onClose }) {
  const [analytics, setAnalytics] = useState(initial.analytics)
  const [marketing, setMarketing] = useState(initial.marketing)
  const dialogRef = useRef(null)
  const headingRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    headingRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href]')]
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === headingRef.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); if (opener && opener.focus) opener.focus() }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="consent-prefs-heading" className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-3xl border border-hairline-strong bg-surface-1 p-5 shadow-2xl md:p-7">
        <h2 id="consent-prefs-heading" ref={headingRef} tabIndex={-1} className="font-display text-xl font-bold text-ink outline-none md:text-2xl">Cookie preferences</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          Choose which optional cookies CONVRT may use. You can change this at any time from “Cookie settings” in the footer.<PrivacyLink />
        </p>
        <div className="mt-5 space-y-3">
          <Switch id="consent-necessary" checked disabled label="Necessary" description="Remembers your choice here and keeps the site and forms working. Always on." onChange={() => {}} />
          <Switch id="consent-analytics" checked={analytics} onChange={setAnalytics} label="Analytics" description="Helps us understand which pages are visited and which lead to enquiries (Google Analytics through Google Tag Manager)." />
          <Switch id="consent-marketing" checked={marketing} onChange={setMarketing} label="Marketing" description="Allows advertising and measurement cookies if we ever run ads. Off unless you turn it on; the site does not set advertising cookies today. This is about cookies only: marketing emails are a separate choice on our forms." />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={btnSecondary} onClick={() => onSave(DENIED_CHOICE)}>Reject all</button>
          <button type="button" className={btnSecondary} onClick={() => onSave({ analytics, marketing })}>Save preferences</button>
          <button type="button" className={btnPrimary} onClick={() => onSave(GRANTED_CHOICE)}>Accept all</button>
        </div>
      </div>
    </div>
  )
}

export default function ConsentManager() {
  const [banner, setBanner] = useState(() => !hasDecided())
  const [prefs, setPrefs] = useState(false)

  const save = useCallback((choice) => { setConsent(choice); setBanner(false); setPrefs(false) }, [])
  const closePrefs = useCallback(() => setPrefs(false), [])

  useEffect(() => {
    const open = () => setPrefs(true)
    window.addEventListener(OPEN_CONSENT_EVENT, open)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open)
  }, [])

  return (
    <>
      {banner && !prefs && (
        <div role="region" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-hairline-strong bg-surface-1/95 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md md:p-5">
          <p className="text-[14px] leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Cookies on CONVRT.</span> We would like to use analytics cookies to see which pages lead to enquiries. They stay off unless you accept.<PrivacyLink />
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" className={`${btnPrimary} sm:min-w-[140px]`} onClick={() => save(GRANTED_CHOICE)}>Accept all</button>
            <button type="button" className={`${btnSecondary} sm:min-w-[140px]`} onClick={() => save(DENIED_CHOICE)}>Reject all</button>
            <button type="button" className="min-h-[44px] rounded-full px-3 text-[14px] font-semibold text-ink-muted underline underline-offset-4 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime sm:ml-auto" onClick={() => setPrefs(true)}>Preferences</button>
          </div>
        </div>
      )}
      {prefs && <Preferences initial={getConsentChoice()} onSave={save} onClose={closePrefs} />}
    </>
  )
}
