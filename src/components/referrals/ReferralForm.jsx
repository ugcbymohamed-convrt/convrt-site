import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { scrollToElement } from '../../lib/scroll.js'
import { CONTACT_EMAIL, PRIVACY_POLICY_URL } from '../../config.js'
import {
  EMPTY_REFERRAL,
  FIELD_ORDER,
  LIMITS,
  PARTNER_TYPES,
  PROGRAM_OPTIONS,
  applyCardSelection,
  validateReferral,
} from '../../lib/referralProgram.js'
import { submitReferral } from '../../lib/referralApply.js'
import { Reveal, Check } from '../roadmap/shared.jsx'
import { CheckboxField, ErrorText, RadioGroup, TextField } from '../forms/fields.jsx'

/* ─────────────────────────────────────────────
   REGISTRATION FORM — joins the program. Short on purpose: name, email and partner type are
   the only answers a visitor must give (plus consent); the program is pre-selected.

   • Saved by api/referral-apply.js → MailerLite group + owner email. Nothing is
     auto-approved, no booking link is shown and no payment is promised.
   • Individual referrals are NOT collected here. They happen after approval, by warm
     introduction, and are tracked manually (docs/referral-program-setup.md), so no third
     party's details are ever requested on this page.
   • `preselect` ({ card, id }) comes from the reward cards: the card's program is
     selected (and "Marketing agency" for the agency card while no partner type is chosen).
   • Duplicate submits are blocked by a ref (synchronous, unlike state) and the
     disabled button; success is shown only after the server confirms it saved.
   • Analytics events carry no names, emails or other form contents.
───────────────────────────────────────────── */

const NEXT_STEPS = [
  'We receive your details and review your application by hand.',
  'If approved, we email you the partner kit and confirm the final conditions with you.',
  'Then you can introduce brands. We handle the conversation, and rewards follow the program terms.',
]

const SUBMIT_ERROR_COPY = {
  rate_limited: 'Too many requests right now. Please wait a minute and try again.',
  cannot_subscribe: `We couldn’t save this email address automatically. Please email ${CONTACT_EMAIL} and we’ll take it from there.`,
  network: 'We couldn’t reach the server. Check your connection and try again.',
  unavailable: `Something went wrong on our side. Please try again in a moment, or email ${CONTACT_EMAIL}.`,
}

export default function ReferralForm({ preselect }) {
  const [values, setValues] = useState(EMPTY_REFERRAL)
  const [errors, setErrors] = useState({})
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [submitError, setSubmitError] = useState(null)
  const startedRef = useRef(false)
  const inflightRef = useRef(false)
  const formRef = useRef(null)
  const successHeadingRef = useRef(null)
  const submitting = status === 'submitting'

  const markStarted = () => {
    if (startedRef.current) return
    startedRef.current = true
    trackEvent('referral_form_start')
  }

  const set = (field) => (value) => {
    markStarted()
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
    setSubmitError(null)
  }

  // A reward card was chosen: select its program (also leaves the confirmation screen).
  useEffect(() => {
    if (!preselect) return
    setValues((v) => applyCardSelection(preselect.card, v))
    setErrors((e) => ({ ...e, program: undefined, partnerType: undefined }))
    setStatus((s) => (s === 'submitting' ? s : 'idle'))
  }, [preselect])

  // When the confirmation appears, move focus to its heading and bring it into view.
  useEffect(() => {
    if (status !== 'success') return
    successHeadingRef.current?.focus({ preventScroll: true })
    scrollToElement(document.getElementById('apply'), { duration: 0 })
  }, [status])

  const focusFirstError = (errs) => {
    const first = FIELD_ORDER.find((k) => errs[k])
    if (!first) return
    window.requestAnimationFrame(() => {
      const el = formRef.current?.querySelector(`[data-field="${first}"]`)
      el?.focus()
      if (el) scrollToElement(el, { block: 'center' })
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (inflightRef.current) return

    const errs = validateReferral(values)
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirstError(errs)

    inflightRef.current = true
    setSubmitError(null)
    setStatus('submitting')
    trackEvent('referral_application_submit')
    try {
      await submitReferral(values, honeypot)
      setStatus('success')
      trackEvent('referral_application_success')
    } catch (err) {
      setStatus('idle')
      if (err?.kind === 'invalid') {
        // Server rejected specific fields — show them inline.
        const fieldErrs = validateReferral(values)
        const serverFields = (err.fields || []).filter((f) => FIELD_ORDER.includes(f))
        for (const f of serverFields) fieldErrs[f] = fieldErrs[f] || 'Please check this answer.'
        setErrors(fieldErrs)
        focusFirstError(fieldErrs)
      } else {
        const kind = err?.kind in SUBMIT_ERROR_COPY ? err.kind : 'unavailable'
        setSubmitError(kind)
        trackEvent('referral_application_error', { reason: kind })
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
            <Reveal early>
              <div className="inline-flex items-center gap-2.5">
                <span className="h-px w-8 bg-lime" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Join</span>
              </div>
              <h2
                id="apply-heading"
                tabIndex={-1}
                className="mt-5 font-display text-[1.9rem] font-bold leading-[1.18] tracking-display text-ink outline-none sm:text-4xl md:text-[2.75rem]"
              >
                Let’s Become <span className="text-lime">Partners.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
                Join the program and start introducing brands that could benefit from better video creatives.
              </p>

              <div className="mt-8 hidden rounded-3xl border border-hairline bg-surface-1/60 p-6 lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">What happens next</p>
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
                <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Referral Partner Program registration" aria-busy={submitting}>
                  <div className="space-y-7">
                    {/* About you */}
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-snug text-ink">About you</h3>
                      <div className="mt-5 space-y-5">
                        <TextField
                          name="fullName" label="Full name" autoComplete="name" maxLength={LIMITS.name}
                          value={values.fullName} error={errors.fullName} readOnly={submitting} onChange={set('fullName')}
                        />
                        <TextField
                          name="email" type="email" label="Email address" autoComplete="email" inputMode="email"
                          autoCapitalize="none" spellCheck={false} placeholder="you@example.com" maxLength={LIMITS.email}
                          value={values.email} error={errors.email} readOnly={submitting} onChange={set('email')}
                        />
                        <RadioGroup
                          name="partnerType" legend="Partner type" options={PARTNER_TYPES} columns={3} compact
                          value={values.partnerType} error={errors.partnerType} onChange={set('partnerType')}
                        />
                        <RadioGroup
                          name="program" legend="Program" options={PROGRAM_OPTIONS} columns={2}
                          hint="Agency & Strategic Partner requires approval by CONVRT. See the reward cards above for the details of each."
                          value={values.program} error={errors.program} onChange={set('program')}
                        />
                        <TextField
                          name="partnerCompany" optional label="Company / agency name" autoComplete="organization"
                          maxLength={LIMITS.company}
                          value={values.partnerCompany} error={errors.partnerCompany} readOnly={submitting} onChange={set('partnerCompany')}
                        />
                        <TextField
                          name="partnerWebsite" optional label="Your website or LinkedIn profile" autoComplete="url" inputMode="url"
                          autoCapitalize="none" spellCheck={false} placeholder="linkedin.com/in/yourname" maxLength={LIMITS.website}
                          value={values.partnerWebsite} error={errors.partnerWebsite} readOnly={submitting} onChange={set('partnerWebsite')}
                        />
                      </div>
                    </div>

                    {/* Honeypot — hidden from people and assistive tech; bots fill it in.
                        Not named "company": browsers autofill that, and this form has a real company field. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label>
                        Leave this field empty
                        <input type="text" name="hp_check" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                      </label>
                    </div>

                    <div className="space-y-5 border-t border-hairline pt-7">
                      <CheckboxField name="consent" checked={values.consent} error={errors.consent} disabled={submitting} onChange={set('consent')}>
                        I agree that CONVRT may store the details I’ve entered and use them to review this application and
                        contact me about it.
                        {PRIVACY_POLICY_URL && (
                          <>
                            {' '}See the{' '}
                            <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer noopener" className="text-ink underline underline-offset-2 hover:text-lime">
                              privacy policy
                            </a>
                            .
                          </>
                        )}
                        <span className="text-lime" aria-hidden="true"> *</span>
                      </CheckboxField>

                      {submitError && (
                        <div role="alert"><ErrorText>{SUBMIT_ERROR_COPY[submitError]}</ErrorText></div>
                      )}

                      <div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="cta-gradient inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas
                                     disabled:cursor-wait disabled:opacity-70
                                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                        >
                          {submitting ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas motion-reduce:animate-none" aria-hidden="true" />
                              Submitting…
                            </>
                          ) : (
                            <>Join the Referral Program <span aria-hidden="true">→</span></>
                          )}
                        </button>
                        <p className="mt-3 text-center text-sm text-ink-muted" role="status">
                          {submitting ? 'Sending your application…' : 'Free to join. Approval isn’t guaranteed, and rewards depend on the program terms below.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Mobile: what happens next (below the card) */}
            <div className="mt-6 px-1 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">What happens next</p>
              <NextSteps />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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

/* Shown only after the server has saved the application. No booking link, no approval,
   no promise of payment and no review turnaround time. */
function Received({ headingRef }) {
  return (
    <div className="cs-fade-up px-1 py-4 text-center sm:py-8" role="status">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
        <Check className="h-6 w-6" />
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-2xl font-bold leading-tight tracking-display text-ink outline-none sm:text-3xl">
        You’re One Step Closer to Becoming a CONVRT Partner.
      </h3>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">
        Thanks for your interest! We’ve received your details and will review your application. If approved, we’ll send
        you everything you need to start referring.
      </p>
      <div className="mt-8 flex justify-center">
        <a
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          Back to home
        </a>
      </div>
    </div>
  )
}
