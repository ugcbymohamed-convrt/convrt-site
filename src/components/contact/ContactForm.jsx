import { useEffect, useId, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { scrollToElement } from '../../lib/scroll.js'
import { EMPTY_INQUIRY, FIELD_ORDER, LIMITS, SERVICE_KEYS, BUDGET_KEYS, validateInquiry } from '../../lib/contactInquiry.js'
import { submitInquiry } from '../../lib/contactSubmit.js'
import { errorText } from '../../content/contactCopy.js'
import { useTrustLinks } from '../../i18n/trustLinks.js'
import { hrefFor } from '../../i18n/tr.js'

/* ─────────────────────────────────────────────
   GENERAL INQUIRY FORM (the Contact page). One reusable component for all four languages: every word comes from `copy` (src/content/contactCopy.js), every behaviour is language-neutral.

   • Delivered by api/contact.js → one owner email labelled "General inquiry" (Resend). No MailerLite record, no booking link, no scheduling, no promised reply time.
   • Required: full name, email, brand or company, service, project description, and the consent box. Optional: website or social media, estimated budget.
   • Spam: a hidden honeypot field (the same idea as the other forms). Duplicate submits are blocked by a ref (synchronous, unlike state) and by the disabled button.
   • Success is shown only after the server has confirmed the email was sent. The conversion event `contact_inquiry_success` fires then and ONLY then: never on a view, a click or a failed
     attempt. Events carry the language and the chosen service category, never a name, an email or any text the visitor typed.
───────────────────────────────────────────── */

const fieldBase =
  'block w-full min-h-[54px] rounded-2xl border bg-white/[0.035] px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-subtle transition-[border-color,background-color,box-shadow] duration-200 ' +
  'hover:border-ink-subtle/50 focus:border-lime/70 focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/30 read-only:opacity-70 motion-reduce:transition-none'

function ErrorRow({ id, children }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-coral">
      <svg viewBox="0 0 16 16" className="mt-[2px] h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.7v3.6M8 10.8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </p>
  )
}

function Field({ name, label, optionalText, required, error, className = '', children }) {
  const uid = useId()
  const id = `${uid}-${name}`
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}{' '}
        {required ? <span className="text-lime" aria-hidden="true">*</span> : <span className="font-normal text-ink-subtle">({optionalText})</span>}
      </label>
      {children({ id, errId: `${id}-error`, invalid: Boolean(error), describedBy: error ? `${id}-error` : undefined })}
      {error && <ErrorRow id={`${id}-error`}>{error}</ErrorRow>}
    </div>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" fill="none" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ContactForm({ copy, locale, successRef }) {
  const [values, setValues] = useState(EMPTY_INQUIRY)
  const [errors, setErrors] = useState({})
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [submitError, setSubmitError] = useState(false)
  const startedRef = useRef(false)
  const inflightRef = useRef(false)
  const formRef = useRef(null)
  const submitting = status === 'submitting'
  const trustLink = useTrustLinks()
  const privacy = trustLink('privacy')

  const set = (field) => (value) => {
    if (!startedRef.current) {
      startedRef.current = true
      trackEvent('contact_form_start', { form_language: locale })
    }
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
    setSubmitError(false)
  }
  const msg = (field) => (errors[field] ? errorText(copy, field, errors[field]) : undefined)

  /* A link from another page can name the service ("/contact?service=organic": the Organic Social page and the pricing promo). Applied once after mount, only for a known service key; it sets the
     choice without counting as the visitor starting the form (no contact_form_start). */
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('service')
    if (wanted && SERVICE_KEYS.includes(wanted)) setValues((v) => (v.service ? v : { ...v, service: wanted }))
  }, [])

  useEffect(() => {
    if (status !== 'success') return
    successRef.current?.focus({ preventScroll: true })
    scrollToElement(document.getElementById('inquiry'), { duration: 0 })
  }, [status, successRef])

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
    const errs = validateInquiry(values)
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirstError(errs)

    inflightRef.current = true
    setSubmitError(false)
    setStatus('submitting')
    try {
      await submitInquiry(values, honeypot, locale)
      setStatus('success')
      // The ONE conversion event of this form: fired after the server confirmed delivery. No personal data: the language and the service category only.
      trackEvent('contact_inquiry_success', { form_language: locale, service: values.service })
    } catch (err) {
      setStatus('idle')
      if (err?.kind === 'invalid') {
        const fieldErrs = { ...validateInquiry(values) }
        for (const f of (err.fields || []).filter((x) => FIELD_ORDER.includes(x))) fieldErrs[f] = fieldErrs[f] || 'invalid'
        setErrors(fieldErrs)
        focusFirstError(fieldErrs)
      } else {
        setSubmitError(true)
        trackEvent('contact_inquiry_error', { form_language: locale })
      }
    } finally {
      inflightRef.current = false
    }
  }

  const selectClass = (value, invalid) => `${fieldBase} appearance-none pr-11 ${value ? 'text-ink' : 'text-ink-subtle'} ${invalid ? 'border-coral/70' : 'border-hairline-strong'}`
  const inputClass = (invalid) => `${fieldBase} ${invalid ? 'border-coral/70' : 'border-hairline-strong'}`

  return (
    <div
      id="inquiry"
      className="relative overflow-hidden rounded-[28px] border border-hairline-strong bg-surface-1/80 p-5 shadow-[0_50px_110px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8 md:p-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-[260px] w-[620px] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[110px]" />
      {status === 'success' ? (
        <div className="cs-fade-up relative px-1 py-8 text-center sm:py-12" role="status">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
            <svg viewBox="0 0 16 16" className="h-6 w-6" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 ref={successRef} tabIndex={-1} className={`mt-6 font-display text-2xl font-bold text-ink outline-none sm:text-3xl ${locale === 'ar' ? 'leading-[1.4]' : 'leading-tight tracking-display'}`}>{copy.successHeading}</h2>
          <p className={`mx-auto mt-4 max-w-md text-base text-ink-muted ${locale === 'ar' ? 'leading-[1.9]' : 'leading-relaxed'}`}>{copy.successMessage}</p>
          <div className="mt-8 flex justify-center">
            <a href={hrefFor('/')} className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime">
              {copy.backHome}
            </a>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={onSubmit} noValidate aria-label={copy.formLabel} aria-busy={submitting} className="relative">
          <h2 className={`font-display text-[1.6rem] font-bold text-ink sm:text-3xl ${locale === 'ar' ? 'leading-[1.4]' : 'leading-tight tracking-display'}`}>{copy.formHeading}</h2>

          <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
            <Field name="fullName" label={copy.labels.fullName} optionalText={copy.optional} required error={msg('fullName')}>
              {({ id, invalid, describedBy }) => (
                <input id={id} name="fullName" data-field="fullName" type="text" autoComplete="name" maxLength={LIMITS.name} placeholder={copy.placeholders.fullName}
                  value={values.fullName} readOnly={submitting} aria-required="true" aria-invalid={invalid || undefined} aria-describedby={describedBy}
                  onChange={(e) => set('fullName')(e.target.value)} className={inputClass(invalid)} />
              )}
            </Field>
            <Field name="email" label={copy.labels.email} optionalText={copy.optional} required error={msg('email')}>
              {({ id, invalid, describedBy }) => (
                <input id={id} name="email" data-field="email" type="email" dir="ltr" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} maxLength={LIMITS.email}
                  placeholder={copy.placeholders.email} value={values.email} readOnly={submitting} aria-required="true" aria-invalid={invalid || undefined} aria-describedby={describedBy}
                  onChange={(e) => set('email')(e.target.value)} className={`${inputClass(invalid)} ${locale === 'ar' ? 'text-right' : ''}`} />
              )}
            </Field>
            <Field name="company" label={copy.labels.company} optionalText={copy.optional} required error={msg('company')}>
              {({ id, invalid, describedBy }) => (
                <input id={id} name="company" data-field="company" type="text" autoComplete="organization" maxLength={LIMITS.company} placeholder={copy.placeholders.company}
                  value={values.company} readOnly={submitting} aria-required="true" aria-invalid={invalid || undefined} aria-describedby={describedBy}
                  onChange={(e) => set('company')(e.target.value)} className={inputClass(invalid)} />
              )}
            </Field>
            <Field name="website" label={copy.labels.website} optionalText={copy.optional} error={msg('website')}>
              {({ id, invalid, describedBy }) => (
                <input id={id} name="website" data-field="website" type="text" dir="ltr" autoComplete="url" inputMode="url" autoCapitalize="none" spellCheck={false} maxLength={LIMITS.website}
                  placeholder={copy.placeholders.website} value={values.website} readOnly={submitting} aria-invalid={invalid || undefined} aria-describedby={describedBy}
                  onChange={(e) => set('website')(e.target.value)} className={`${inputClass(invalid)} ${locale === 'ar' ? 'text-right' : ''}`} />
              )}
            </Field>
            <Field name="service" label={copy.labels.service} optionalText={copy.optional} required error={msg('service')}>
              {({ id, invalid, describedBy }) => (
                <div className="relative">
                  <select id={id} name="service" data-field="service" value={values.service} disabled={submitting} aria-required="true" aria-invalid={invalid || undefined} aria-describedby={describedBy}
                    onChange={(e) => set('service')(e.target.value)} style={{ colorScheme: 'dark' }} className={selectClass(values.service, invalid)}>
                    <option value="">{copy.placeholders.service}</option>
                    {SERVICE_KEYS.map((k) => <option key={k} value={k}>{copy.services[k]}</option>)}
                  </select>
                  <Chevron />
                </div>
              )}
            </Field>
            <Field name="budget" label={copy.labels.budget} optionalText={copy.optional} error={msg('budget')}>
              {({ id, invalid, describedBy }) => (
                <div className="relative">
                  <select id={id} name="budget" data-field="budget" value={values.budget} disabled={submitting} aria-invalid={invalid || undefined} aria-describedby={describedBy}
                    onChange={(e) => set('budget')(e.target.value)} style={{ colorScheme: 'dark' }} className={selectClass(values.budget, invalid)}>
                    <option value="">{copy.placeholders.budget}</option>
                    {BUDGET_KEYS.map((k) => <option key={k} value={k}>{copy.budgets[k]}</option>)}
                  </select>
                  <Chevron />
                </div>
              )}
            </Field>
            <Field name="message" label={copy.labels.message} optionalText={copy.optional} required error={msg('message')} className="md:col-span-2">
              {({ id, invalid, describedBy }) => (
                <textarea id={id} name="message" data-field="message" rows={6} maxLength={LIMITS.message} placeholder={copy.placeholders.message}
                  value={values.message} readOnly={submitting} aria-required="true" aria-invalid={invalid || undefined} aria-describedby={describedBy}
                  onChange={(e) => set('message')(e.target.value)} className={`${inputClass(invalid)} min-h-[160px] resize-y leading-relaxed`} />
              )}
            </Field>
          </div>

          {/* Honeypot: hidden from people and assistive technology; bots fill it in. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              {copy.honeypotLabel}
              <input type="text" name="hp_check" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </label>
          </div>

          <div className="mt-7">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-relaxed text-ink-muted transition-colors has-[:checked]:border-lime/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lime/70 motion-reduce:transition-none ${
                errors.consent ? 'border-coral/60' : 'border-hairline-strong hover:border-ink-subtle/60'
              }`}
            >
              <input type="checkbox" name="consent" data-field="consent" checked={values.consent} disabled={submitting} aria-required="true" aria-invalid={errors.consent ? 'true' : undefined}
                aria-describedby={errors.consent ? 'contact-consent-error' : undefined} onChange={(e) => set('consent')(e.target.checked)} className="peer sr-only" />
              <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-subtle text-transparent transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:text-canvas motion-reduce:transition-none">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span>
                {copy.consent}{' '}
                {copy.privacySee}{' '}
                <a href={privacy.href} {...(privacy.lang ? { lang: privacy.lang } : {})} target="_blank" rel="noreferrer noopener" className="text-ink underline underline-offset-2 hover:text-lime">{privacy.label}</a>.
                <span className="text-lime" aria-hidden="true"> *</span>
              </span>
            </label>
            {errors.consent && <ErrorRow id="contact-consent-error">{msg('consent')}</ErrorRow>}
          </div>

          {submitError && <div role="alert" className="mt-5"><ErrorRow>{copy.errorMessage}</ErrorRow></div>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="cta-gradient inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-canvas shadow-[0_0_0_1px_rgba(213,255,64,0.4),0_10px_40px_-12px_rgba(213,255,64,0.55)] disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/30 border-t-canvas motion-reduce:animate-none" aria-hidden="true" />
                  {copy.sending}
                </>
              ) : (
                <>
                  {copy.submit}
                  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true"><path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </>
              )}
            </button>
            <p className={`mt-4 text-center text-sm text-ink-muted ${locale === 'ar' ? 'leading-[1.8]' : ''}`}>{copy.submitNote}</p>
          </div>
        </form>
      )}
    </div>
  )
}
