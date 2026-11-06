import { useEffect, useId, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { EMAIL_RE, submitSignup } from '../../lib/hooksSignup.js'
import { INDUSTRIES, industryByKey } from '../../lib/hooksLibrary.js'
import { CONTACT_EMAIL, OFFER_PATHS, PRIVACY_POLICY_URL } from '../../config.js'
import { Check, primaryBtnClass } from './shared.jsx'

/* ─────────────────────────────────────────────
   SIGNUP CARD — industry radio cards, then the email form revealed directly
   underneath (same card, no navigation).

   The chosen industry key is sent to /api/free-hooks-subscribe, which maps it
   to a MailerLite group; the automation on that group delivers the matching
   library. Success is shown only after the server confirms MailerLite
   accepted the subscriber. Analytics never include the email address.
───────────────────────────────────────────── */

const ERROR_COPY = {
  invalid_email: 'That email address doesn’t look right. Please check it and try again.',
  rate_limited: 'Too many requests right now. Please wait a minute and try again.',
  cannot_subscribe: `This address can’t be added automatically. Email ${CONTACT_EMAIL} and we’ll send the hooks to you.`,
  network: 'We couldn’t reach the server. Check your connection and try again.',
  unavailable: `Something went wrong on our side. Please try again in a moment, or email ${CONTACT_EMAIL}.`,
}

export default function HooksSignupCard() {
  const [industry, setIndustry] = useState(null) // 'saas' | 'ecommerce' | null
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [error, setError] = useState(null) // error kind
  const [confirmation, setConfirmation] = useState(false)
  const [doneIndustry, setDoneIndustry] = useState(null)
  const startedRef = useRef(false)
  const inflightRef = useRef(false)
  const emailRef = useRef(null)
  const formRef = useRef(null)
  const successHeadingRef = useRef(null)
  const uid = useId()
  const emailId = `${uid}-email`
  const errorId = `${uid}-error`

  const selected = industryByKey(industry)

  // When the form is first revealed, make sure it is fully visible (nearest = no jump if already in view).
  const prevIndustry = useRef(null)
  useEffect(() => {
    if (industry && !prevIndustry.current) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      window.requestAnimationFrame(() =>
        formRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }),
      )
    }
    prevIndustry.current = industry
  }, [industry])

  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus()
  }, [status])

  const choose = (key) => {
    if (status === 'submitting') return
    if (key !== industry) {
      setIndustry(key)
      trackEvent('hooks_industry_selected', { industry: key, location: 'selector' })
    }
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (inflightRef.current) return
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setError('invalid_email')
      emailRef.current?.focus()
      return
    }

    inflightRef.current = true
    setError(null)
    setStatus('submitting')
    trackEvent('hooks_signup_submitted', { industry })
    try {
      const result = await submitSignup({ industry, email: value, marketingConsent: consent, company: honeypot })
      setConfirmation(result.confirmation)
      setDoneIndustry(industry)
      setStatus('success')
      trackEvent('hooks_signup_success', { industry })
    } catch (err) {
      const kind = err?.kind in ERROR_COPY ? err.kind : 'unavailable'
      setError(kind)
      setStatus('idle')
      trackEvent('hooks_signup_error', { industry, reason: kind })
      // The submit button was disabled while sending, so focus fell to <body>; return it to the form.
      window.requestAnimationFrame(() => emailRef.current?.focus())
    } finally {
      inflightRef.current = false
    }
  }

  const resetForOther = (key) => {
    setStatus('idle')
    setEmail('')
    setConsent(false)
    setError(null)
    startedRef.current = false
    setIndustry(key)
    trackEvent('hooks_industry_selected', { industry: key, location: 'selector' })
  }

  const submitting = status === 'submitting'

  return (
    <div className="relative rounded-3xl border border-hairline-strong bg-surface-1 p-4 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] min-[380px]:p-5 sm:p-7">
      {status === 'success' ? (
        <Success
          headingRef={successHeadingRef}
          industry={industryByKey(doneIndustry)}
          confirmation={confirmation}
          onOther={resetForOther}
        />
      ) : (
        <>
          <h2 id="signup-heading" className="font-display text-2xl font-bold tracking-display text-ink sm:text-[1.7rem]">
            Which Hooks Do You Want?
          </h2>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">
            Choose your industry and we’ll send you the matching library.
          </p>

          <fieldset className="mt-5 min-w-0">
            <legend className="sr-only">Choose your industry</legend>
            <div className="grid grid-cols-1 gap-3">
              {INDUSTRIES.map((opt) => {
                const checked = industry === opt.key
                return (
                  <label
                    key={opt.key}
                    className={`group relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none
                      has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/70 ${
                        checked
                          ? 'border-lime bg-lime/[0.07] shadow-[0_0_0_1px_rgba(213,255,64,0.25)]'
                          : 'border-hairline-strong bg-surface-2/40 hover:border-ink-subtle/60 hover:bg-surface-2/70'
                      }`}
                  >
                    <input
                      type="radio"
                      name="industry"
                      value={opt.key}
                      checked={checked}
                      onChange={() => choose(opt.key)}
                      className="peer sr-only"
                    />
                    <span
                      className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors min-[380px]:flex motion-reduce:transition-none ${
                        checked ? 'border-lime/50 bg-lime/15 text-lime' : 'border-hairline-strong bg-surface-2 text-ink-muted'
                      }`}
                    >
                      {opt.key === 'saas' ? <IconApp /> : <IconBag />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[17px] font-bold leading-snug tracking-snug text-ink">{opt.name}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{opt.description}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none ${
                        checked ? 'border-lime bg-lime text-canvas' : 'border-ink-subtle text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Announces the reveal to screen readers */}
          <p className="sr-only" aria-live="polite">
            {selected ? `Email form shown for ${selected.name} hooks.` : ''}
          </p>

          {selected && (
            <form
              ref={formRef}
              onSubmit={onSubmit}
              noValidate
              aria-label={`Get the ${selected.name} hooks by email`}
              className="cs-fade-up relative mt-5 border-t border-hairline pt-5"
            >
              <label htmlFor={emailId} className="block text-sm font-semibold text-ink">
                Your email address <span className="text-lime" aria-hidden="true">*</span>
              </label>
              <input
                ref={emailRef}
                id={emailId}
                type="email"
                name="email"
                required
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@company.com"
                value={email}
                readOnly={submitting}
                aria-required="true"
                aria-invalid={error === 'invalid_email' ? 'true' : undefined}
                aria-describedby={error ? errorId : undefined}
                onFocus={() => {
                  if (!startedRef.current) {
                    startedRef.current = true
                    trackEvent('hooks_form_started', { industry })
                  }
                }}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error === 'invalid_email') setError(null)
                }}
                className={`mt-2 min-h-[50px] w-full rounded-2xl border bg-canvas px-4 py-3 text-base text-ink placeholder:text-ink-subtle
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/70 read-only:opacity-70 ${
                    error === 'invalid_email' ? 'border-coral/70' : 'border-hairline-strong focus:border-lime/60'
                  }`}
              />

              {/* Honeypot — hidden from people and assistive tech; bots fill it in */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Company
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </label>
              </div>

              {error && (
                <p id={errorId} role="alert" className="mt-3 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-coral">
                  <svg viewBox="0 0 16 16" className="mt-[2px] h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 4.7v3.6M8 10.8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span>{ERROR_COPY[error]}</span>
                </p>
              )}

              {/* Marketing consent is separate from delivery and off by default */}
              <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-snug text-ink-muted has-[:focus-visible]:[&>span:first-of-type]:ring-2 has-[:focus-visible]:[&>span:first-of-type]:ring-lime/70">
                <input type="checkbox" checked={consent} disabled={submitting} onChange={(e) => setConsent(e.target.checked)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-subtle text-transparent transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:text-canvas motion-reduce:transition-none"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>
                  Also send me occasional creative tips and offers from CONVRT. <span className="text-ink-subtle">(Optional)</span>
                </span>
              </label>

              <button type="submit" disabled={submitting} className={`${primaryBtnClass} mt-5 w-full`}>
                {submitting ? 'Sending…' : (<>Send Me My 10 Free Hooks <span aria-hidden="true">→</span></>)}
              </button>
              <p className="mt-3 text-center text-sm text-ink-muted">Delivered straight to your inbox.</p>

              <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
                By submitting, you ask CONVRT to email you this resource through our email provider, MailerLite. You may be
                asked to confirm your email first. Unsubscribe any time.
                {PRIVACY_POLICY_URL && (
                  <>
                    {' '}See our{' '}
                    <a href={PRIVACY_POLICY_URL} className="text-ink-muted underline underline-offset-2 hover:text-lime">privacy policy</a>.
                  </>
                )}
              </p>
            </form>
          )}
        </>
      )}
    </div>
  )
}

function Success({ headingRef, industry, confirmation, onOther }) {
  const other = INDUSTRIES.find((i) => i.key !== industry?.key)
  return (
    <div className="cs-fade-up py-2 text-center sm:py-4" role="status">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
        <Check className="h-6 w-6" />
      </div>
      <h2 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-3xl font-bold tracking-display text-ink outline-none">
        {confirmation ? 'One more step.' : 'Check your inbox.'}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
        {confirmation
          ? `We’ve sent you a confirmation email. Click the link in it, and your ${industry?.name} hooks library will follow.`
          : `Your ${industry?.name} hooks library is on its way by email.`}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-subtle">
        Nothing yet? Check your spam or promotions folder. If you’ve requested these before, look for the earlier email,
        or write to <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink-muted underline underline-offset-2 hover:text-lime">{CONTACT_EMAIL}</a>.
      </p>
      <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {other && (
          <button
            type="button"
            onClick={() => onOther(other.key)}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          >
            Want the {other.short} hooks too?
          </button>
        )}
        <a
          href={OFFER_PATHS.roadmap}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          Get 5 custom ad concepts →
        </a>
      </div>
    </div>
  )
}

function IconApp() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2.5" />
      <path d="M8 21h8M12 18v3M7.5 9.5l2 2-2 2M12 13.5h4" />
    </svg>
  )
}
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  )
}
