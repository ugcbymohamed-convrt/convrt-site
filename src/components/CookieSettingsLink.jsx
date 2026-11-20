import { useEffect, useState } from 'react'
import { OPEN_CONSENT_EVENT, consentEnabled } from '../lib/consent.js'

/* Footer link that re-opens the cookie preferences. It renders nothing on the server and on the first client render (so the prerendered HTML and
   hydration are unchanged), and appears afterwards only when analytics consent is actually configured (a GTM container ID is set). */
export default function CookieSettingsLink({ className = '' }) {
  const [show, setShow] = useState(false)
  useEffect(() => { setShow(consentEnabled()) }, [])
  if (!show) return null
  return (
    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT))} className={`underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime ${className}`}>
      Cookie settings
    </button>
  )
}
