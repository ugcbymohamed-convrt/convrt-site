import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { CONTACT_EMAIL, OFFER_PATHS, PRIVACY_POLICY_URL } from '../../config.js'
import {
  EMPTY_APPLICATION,
  FIELD_ORDER,
  LIMITS,
  QUESTIONS,
  QUESTION_FIELDS,
  validateApplication,
} from '../../lib/riskFreeQuestions.js'
import { submitApplication } from '../../lib/riskFreeApply.js'
import { Reveal, Check } from '../roadmap/shared.jsx'
import { ErrorText, Progress, RadioGroup, TextField } from '../forms/fields.jsx'

/* ─────────────────────────────────────────────
   APPLICATION — six qualification questions, then contact details (kept
   separate), then submit.

   • Applications are NOT auto-approved and nothing unlocks a booking link.
     Each one is saved (api/risk-free-apply.js → MailerLite) for manual review;
     CONVRT invites suitable brands to a short call before any production.
   • No minimum ad spend: "Not running paid ads yet" is a valid answer.
   • Success is shown only after the server confirms the application was saved.
   • Analytics events carry no answers or personal data.
───────────────────────────────────────────── */

const NEXT_STEPS = [
  'Answer six quick questions and tell us where to reach you.',
  'Our team reviews your brand and production needs.',
  'If there’s a good fit, we’ll invite you to a short call to discuss next steps.',
]

const SUBMIT_ERROR_COPY = {
  rate_limited: 'Too many requests right now. Please wait a minute and try again.',
  cannot_subscribe: `We couldn’t save this email address automatically. Please email ${CONTACT_EMAIL} and we’ll take it from there.`,
  network: 'We couldn’t reach the server. Check your connection and try again.',
  unavailable: `Something went wrong on our side. Please try again in a moment, or email ${CONTACT_EMAIL}.`,
}

export default function RiskFreeApplication() {
  const [values, setValues] = useState(EMPTY_APPLICATION)
  const [errors, setErrors] = useState({})
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [submitError, setSubmitError] = useState(null)
  const startedRef = useRef(false)
  const inflightRef = useRef(false)
  const formRef = useRef(null)
  const successHeadingRef = useRef(null)
  const answered = QUESTION_FIELDS.filter((f) => values[f]).length
  const submitting = status === 'submitting'

  const set = (field) => (value) => {
    if (!startedRef.current) {
      startedRef.current = true
      trackEvent('risk_free_form_started')
    }
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
    setSubmitError(null)
  }

  // When the confirmation appears, move focus to its heading and bring it into view.
  useEffect(() => {
    if (status !== 'success') return
    successHeadingRef.current?.focus({ preventScroll: true })
    document.getElementById('apply')?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [status])

  const focusFirstError = (errs) => {
    const first = FIELD_ORDER.find((k) => errs[k])
    if (!first) return
    window.requestAnimationFrame(() => {
      const el = formRef.current?.querySelector(`[data-field="${first}"]`)
      el?.focus()
      el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (inflightRef.current) return

    const errs = validateApplication(values)
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirstError(errs)

    inflightRef.current = true
    setSubmitError(null)
    setStatus('submitting')
    trackEvent('risk_free_application_submitted')
    try {
      await submitApplication(values, honeypot)
      setStatus('success')
      trackEvent('risk_free_application_success')
    } catch (err) {
      setStatus('idle')
      if (err?.kind === 'invalid') {
        // Server rejected specific fields — show them inline.
        const fieldErrs = validateApplication(values)
        const serverFields = (err.fields || []).filter((f) => FIELD_ORDER.includes(f))
        for (const f of serverFields) fieldErrs[f] = fieldErrs[f] || 'Please check this answer.'
        setErrors(fieldErrs)
        focusFirstError(fieldErrs)
      } else {
        const kind = err?.kind in SUBMIT_ERROR_COPY ? err.kind : 'unavailable'
        setSubmitError(kind)
        trackEvent('risk_free_application_error', { reason: kind })
      }
    } finally {
      inflightRef.current = false
    }
  }

  return (
    <section id="apply" aria-labelledby="apply-heading" className="relative scroll-mt-20 overflow-hidden py-16 md:scroll-mt-24 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.05] blur-[150px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Intro */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Apply</span>
              </div>
              <h2
                id="apply-heading"
                tabIndex={-1}
                className="mt-5 font-display text-[1.9rem] font-bold leading-[1.06] tracking-display text-ink outline-none sm:text-4xl md:text-[2.75rem]"
              >
                Apply for Your <span className="text-lime">FREE</span> Video.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
                Tell us about your brand so we can see if there’s a fit. Every application is reviewed by our team
                before anything goes into production.
              </p>

              <div className="mt-8 hidden rounded-3xl border border-hairline bg-surface-1/60 p-6 lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">What happens next</p>
                <NextSteps />
              </div>
            </Reveal>
          </div>

          {/* Card: form → confirmation */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-8">
              {status === 'success' ? (
                <Received headingRef={successHeadingRef} />
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Free video production application">
                  <Progress label="Application" answered={answered} total={QUESTION_FIELDS.length} />

                  <div className="mt-7 space-y-7">
                    {QUESTIONS.map((q) => (
                      <RadioGroup
                        key={q.field}
                        name={q.field}
                        legend={q.legend}
                        options={q.options}
                        hint={q.hint}
                        columns={q.columns}
                        value={values[q.field]}
                        error={errors[q.field]}
                        onChange={set(q.field)}
                      />
                    ))}

                    {/* Contact details — collected separately from the qualification questions */}
                    <div className="border-t border-hairline pt-7">
                      <h3 className="font-display text-xl font-bold tracking-snug text-ink">Contact information</h3>
                      <p className="mt-1 text-sm text-ink-muted">So we know who to reach out to if there’s a fit.</p>

                      <div className="mt-5 space-y-5">
                        <TextField
                          name="fullName" label="Full name" autoComplete="name" maxLength={LIMITS.name}
                          value={values.fullName} error={errors.fullName} readOnly={submitting} onChange={set('fullName')}
                        />
                        <TextField
                          name="email" type="email" label="Work email" autoComplete="email" inputMode="email"
                          autoCapitalize="none" spellCheck={false} placeholder="you@company.com" maxLength={LIMITS.email}
                          value={values.email} error={errors.email} readOnly={submitting} onChange={set('email')}
                        />
                        <TextField
                          name="website" label="Company website" autoComplete="url" inputMode="url"
                          autoCapitalize="none" spellCheck={false} placeholder="yourcompany.com" maxLength={LIMITS.website}
                          value={values.website} error={errors.website} readOnly={submitting} onChange={set('website')}
                        />
                        <TextField
                          name="brief" multiline optional label="Tell us briefly what you’d like to create"
                          maxLength={LIMITS.brief}
                          value={values.brief} error={errors.brief} readOnly={submitting} onChange={set('brief')}
                        />
                      </div>
                    </div>

                    {/* Honeypot — hidden from people and assistive tech; bots fill it in */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label>
                        Company
                        <input type="text" name="company" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                      </label>
                    </div>

                    {submitError && (
                      <div role="alert"><ErrorText>{SUBMIT_ERROR_COPY[submitError]}</ErrorText></div>
                    )}

                    <div>
                      <button type="submit" disabled={submitting} className={`${primaryBtn} w-full`}>
                        {submitting ? 'Submitting…' : (<>Submit My Application <span aria-hidden="true">→</span></>)}
                      </button>
                      <p className="mt-3 text-center text-sm text-ink-muted">Free to apply. No obligation.</p>
                    </div>

                    <p className="text-xs leading-relaxed text-ink-subtle">
                      Your details are sent to CONVRT through our email provider, MailerLite, and used only to review
                      your application and contact you about it.
                      {PRIVACY_POLICY_URL && (
                        <>
                          {' '}See our{' '}
                          <a href={PRIVACY_POLICY_URL} className="text-ink-muted underline underline-offset-2 hover:text-lime">privacy policy</a>.
                        </>
                      )}
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Mobile: what happens next (below the card) */}
            <div className="mt-6 px-1 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">What happens next</p>
              <NextSteps />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const primaryBtn =
  'cta-gradient inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas ' +
  'disabled:cursor-wait disabled:opacity-70 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime'

function NextSteps() {
  return (
    <ol className="mt-4 space-y-3.5" aria-label="What happens next">
      {NEXT_STEPS.map((t, i) => (
        <li key={t} className="flex gap-3 text-sm leading-snug text-ink-muted">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime/30 text-xs font-bold tabular-nums text-lime" aria-hidden="true">{i + 1}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  )
}

/* Shown after the server has saved the application. Deliberately has no
   booking link — CONVRT decides who is invited to a call. */
function Received({ headingRef }) {
  return (
    <div className="cs-fade-up px-1 py-4 text-center sm:py-8" role="status">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
        <Check className="h-6 w-6" />
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-3xl font-bold tracking-display text-ink outline-none">
        Application received!
      </h3>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
        Thanks for applying for your free video production trial. Our team will review your brand and production
        needs. If there’s a good fit, we’ll reach out to discuss the next steps.
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <a
          href={OFFER_PATHS.hooks}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          Get 10 free ad hooks while you wait →
        </a>
        <a
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          Back to home
        </a>
      </div>
    </div>
  )
}
