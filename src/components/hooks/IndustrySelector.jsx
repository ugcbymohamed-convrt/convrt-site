import { useEffect, useId, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { EMAIL_RE, submitSignup } from '../../lib/hooksSignup.js'
import { INDUSTRIES, industryByKey } from '../../lib/hooksLibrary.js'
import { CONTACT_EMAIL, OFFER_PATHS, PRIVACY_POLICY_URL } from '../../config.js'
import { Check, Eyebrow, Reveal, primaryBtnClass } from './shared.jsx'

/* ─────────────────────────────────────────────
   SECTION 2 — choose an industry, then the email form appears right below
   (same page, one step). The chosen industry key is sent to
   /api/free-hooks-subscribe, which maps it to a MailerLite group; the
   automation attached to that group delivers the matching library.

   Success is shown only after the server confirms MailerLite accepted the
   subscriber. Analytics never include the email address.
───────────────────────────────────────────── */

const ERROR_COPY = {
  invalid_email: 'That email address doesn’t look right. Please check it and try again.',
  rate_limited: 'Too many requests right now. Please wait a minute and try again.',
  cannot_subscribe: `This address can’t be added automatically. Email ${CONTACT_EMAIL} and we’ll send the hooks to you.`,
  network: 'We couldn’t reach the server. Check your connection and try again.',
  unavailable: `Something went wrong on our side. Please try again in a moment, or email ${CONTACT_EMAIL}.`,
}

export default function IndustrySelector({ industry, onSelect }) {
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
  const formWrapRef = useRef(null)
  const successHeadingRef = useRef(null)
  const uid = useId()
  const emailId = `${uid}-email`
  const errorId = `${uid}-error`

  const selected = industryByKey(industry)

  // Bring the freshly revealed form into view (nearest = no jump if already visible).
  const prevIndustry = useRef(null)
  useEffect(() => {
    if (industry && !prevIndustry.current) {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      window.requestAnimationFrame(() =>
        formWrapRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }),
      )
    }
    prevIndustry.current = industry
  }, [industry])

  useEffect(() => {
    if (status === 'success') successHeadingRef.current?.focus({ preventScroll: false })
  }, [status])

  const choose = (key) => {
    if (status === 'submitting') return
    if (key !== industry) onSelect(key)
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
    onSelect(key)
  }

  const submitting = status === 'submitting'

  return (
    <section id="industry" aria-labelledby="industry-heading" className="relative scroll-mt-20 overflow-hidden py-16 md:scroll-mt-24 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.05] blur-[150px]"
      />
      <div className="relative mx-auto max-w-4xl px-5 md:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Step 1</Eyebrow>
            <h2
              id="industry-heading"
              tabIndex={-1}
              className="mt-5 font-display text-[1.9rem] font-bold leading-[1.06] tracking-display text-ink outline-none sm:text-4xl md:text-[2.75rem]"
            >
              Which Hooks Do You Want?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
              Pick your industry and we’ll send the matching library.
            </p>
          </div>
        </Reveal>

        {status !== 'success' && (
          <fieldset className="mt-10 min-w-0">
            <legend className="sr-only">Choose your industry</legend>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {INDUSTRIES.map((opt) => {
                const checked = industry === opt.key
                return (
                  <label
                    key={opt.key}
                    className={`group relative flex cursor-pointer flex-col rounded-3xl border p-6 transition-[border-color,background-color,transform,box-shadow] duration-200 motion-reduce:transition-none sm:p-7
                      has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/70 ${
                        checked
                          ? 'border-lime bg-lime/[0.07] shadow-[0_0_0_1px_rgba(213,255,64,0.25),0_30px_70px_-40px_rgba(213,255,64,0.35)]'
                          : 'border-hairline-strong bg-surface-1 hover:-translate-y-0.5 hover:border-ink-subtle/60 motion-reduce:hover:translate-y-0'
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
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${checked ? 'border-lime/50 bg-lime/15 text-lime' : 'border-hairline-strong bg-surface-2 text-ink-muted'}`}>
                        {opt.key === 'saas' ? <IconApp /> : <IconBag />}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none ${
                          checked ? 'border-lime bg-lime text-canvas' : 'border-ink-subtle text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-bold tracking-display text-ink">{opt.name}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{opt.description}</p>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-lime">
                      10 hooks · verbal · visual · text
                    </p>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}

        {/* Announces the reveal to screen readers */}
        <p className="sr-only" aria-live="polite">
          {selected && status !== 'success' ? `Email form shown for ${selected.name} hooks.` : ''}
        </p>

        {/* Email form — revealed in place once an industry is chosen */}
        <div ref={formWrapRef} className="scroll-mt-24">
          {selected && status !== 'success' && (
            <form
              onSubmit={onSubmit}
              noValidate
              aria-label={`Get the ${selected.name} hooks by email`}
              className="cs-fade-up relative mx-auto mt-6 max-w-2xl rounded-3xl border border-hairline-strong bg-surface-1 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Step 2 · {selected.name} hooks</p>

              <label htmlFor={emailId} className="mt-4 block text-sm font-semibold text-ink">
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
                className={`mt-2 min-h-[52px] w-full rounded-2xl border bg-canvas px-4 py-3 text-base text-ink placeholder:text-ink-subtle
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
              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-snug text-ink-muted has-[:focus-visible]:[&>span:first-of-type]:ring-2 has-[:focus-visible]:[&>span:first-of-type]:ring-lime/70">
                <input type="checkbox" checked={consent} disabled={submitting} onChange={(e) => setConsent(e.target.checked)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-subtle text-transparent transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:text-canvas motion-reduce:transition-none"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>
                  Also send me occasional creative tips and offers from CONVRT. <span className="text-ink-subtle">(Optional. Not needed to get your hooks.)</span>
                </span>
              </label>

              <button type="submit" disabled={submitting} className={`${primaryBtnClass} mt-6 w-full`}>
                {submitting ? 'Sending…' : (<>Send Me My Free Hooks <span aria-hidden="true">→</span></>)}
              </button>

              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                We’ll email your {selected.name} hooks library. If we ask you to confirm your email first, click the link and your hooks will follow.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
                By submitting, you ask CONVRT to email you this resource. Your email is stored with our email provider,
                MailerLite, only to deliver it and, if you tick the box above, to send tips and offers. You can unsubscribe at any time.
                {PRIVACY_POLICY_URL && (
                  <>
                    {' '}See our{' '}
                    <a href={PRIVACY_POLICY_URL} className="text-ink-muted underline underline-offset-2 hover:text-lime">privacy policy</a>.
                  </>
                )}
              </p>
            </form>
          )}

          {status === 'success' && (
            <Success
              headingRef={successHeadingRef}
              industry={industryByKey(doneIndustry)}
              confirmation={confirmation}
              onOther={resetForOther}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function Success({ headingRef, industry, confirmation, onOther }) {
  const other = INDUSTRIES.find((i) => i.key !== industry?.key)
  return (
    <div className="cs-fade-up mx-auto mt-6 max-w-2xl rounded-3xl border border-lime/40 bg-surface-1 p-6 text-center shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-10" role="status">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
        <Check className="h-6 w-6" />
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-3xl font-bold tracking-display text-ink outline-none">
        {confirmation ? 'One more step.' : 'Check your inbox.'}
      </h3>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
        {confirmation
          ? `We’ve sent you a confirmation email. Click the link in it, and your ${industry?.name} hooks library will follow.`
          : `Your ${industry?.name} hooks library is on its way by email.`}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-subtle">
        Nothing yet? Check your spam or promotions folder. If you’ve requested these before, look for the earlier email,
        or write to <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink-muted underline underline-offset-2 hover:text-lime">{CONTACT_EMAIL}</a>.
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
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
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2.5" />
      <path d="M8 21h8M12 18v3M7.5 9.5l2 2-2 2M12 13.5h4" />
    </svg>
  )
}
function IconBag() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  )
}
