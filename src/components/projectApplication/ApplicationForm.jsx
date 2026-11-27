import { useEffect, useRef, useState } from 'react'
import { currentLocale } from '../../i18n/locale.js'
import { paCopy } from '../../i18n/projectApplicationCopy.js'
import { CONTACT_EMAIL, PRIVACY_POLICY_URL } from '../../config.js'
import { forward } from '../../lib/rtl.js'
import { scrollToElement } from '../../lib/scroll.js'
import { trackEvent, utmAttribution } from '../../lib/analytics.js'
import { landingPage } from '../../lib/consent.js'
import { submitProjectApplication, newSubmissionId } from '../../lib/projectApply.js'
import { EMPTY_FIELDS, LIMITS, OPTION_IDS, STEP_FIELDS, FIELD_ORDER, questionsFor, validateFields } from '../../lib/projectApplication.js'
import { TextInput, ChoiceGroup, CheckRow, ErrorLine } from './fields.jsx'

/* THE QUALIFICATION FORM: two steps. Step 1 = the brand, step 2 = the project (+ the questions of the selected service, see questionsFor()).

   • Nothing here prices anything: the page sends the package and billing identifiers and the answers; the server looks the price up itself.
   • Success is shown only after the server confirms delivery (api/project-apply.js). A failed request never shows the confirmation.
   • Analytics carry identifiers only (package, billing, locale, currency, source page, service category): never a name, e-mail, URL or answer.
     project_application_start fires once on the first interaction; project_application_submit fires once, after the server's success, and only then. */

const ERROR_FOR = { required: 'required', invalid: 'invalid', too_long: 'tooLong' }

/* A field's error code → a sentence in the page's language. */
function messageFor(c, field, code) {
  if (code === 'too_long') return c.errors.tooLong
  if (code === 'required' && ['fullName', 'email', 'company', 'url', 'description', 'objectiveOther'].includes(field)) return c.errors.required
  if (field === 'email') return c.errors.email
  if (field === 'url') return c.errors.url
  if (field === 'startDate') return code === 'required' ? c.errors.required : c.errors.date
  if (field === 'acknowledged') return c.errors.ack
  if (field === 'productionType' || field === 'language') return c.errors.selectAtLeastOne
  if (['paidObjective', 'organicObjective', 'adSpend', 'socialActivity', 'budget', 'readiness'].includes(field)) return c.errors.selectOne
  return c.errors[ERROR_FOR[code]] ?? c.errors.required
}

const todayLocal = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export default function ApplicationForm({ selection, eventParams, sourcePage, onSubmitted }) {
  const locale = currentLocale()
  const c = paCopy(locale)
  const ar = locale === 'ar'
  const q = questionsFor(selection)
  const [step, setStep] = useState(1)
  const [values, setValues] = useState(EMPTY_FIELDS)
  const [errors, setErrors] = useState({})
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting
  const [submitError, setSubmitError] = useState(null)
  const [minDate, setMinDate] = useState(undefined)
  const startedRef = useRef(false)
  const inflightRef = useRef(false)
  const sentRef = useRef(false)
  const idRef = useRef(null)
  const formRef = useRef(null)
  const headingRef = useRef(null)
  const submitting = status === 'submitting'

  useEffect(() => { setMinDate(todayLocal()) }, [])
  // One id per form: the server delivers an application with the same id once, however many times the request is repeated.
  if (idRef.current === null && typeof window !== 'undefined') idRef.current = newSubmissionId()

  const set = (field) => (value) => {
    if (!startedRef.current) {
      startedRef.current = true
      trackEvent('project_application_start', eventParams)
    }
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
    setSubmitError(null)
  }

  const focusFirst = (errs) => {
    const first = FIELD_ORDER.find((k) => errs[k])
    if (!first) return
    window.requestAnimationFrame(() => {
      const el = formRef.current?.querySelector(`[data-field="${first}"]`)
      el?.focus()
      if (el) scrollToElement(el, { block: 'center' })
    })
  }

  const goStep = (n) => {
    setStep(n)
    window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true })
      if (formRef.current) scrollToElement(formRef.current, { block: 'start' })
    })
  }

  const onContinue = () => {
    const errs = validateFields(values, selection, { step: 1 })
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirst(errs)
    goStep(2)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) return onContinue()
    if (inflightRef.current) return
    const errs = validateFields(values, selection)
    setErrors(errs)
    if (Object.keys(errs).length) {
      // An error in step 1 (possible only if the visitor edited it away) sends them back to it.
      if (STEP_FIELDS[1].some((f) => errs[f])) goStep(1)
      return focusFirst(errs)
    }
    inflightRef.current = true
    setSubmitError(null)
    setStatus('submitting')
    try {
      await submitProjectApplication({
        locale,
        packageId: selection.packageId,
        billing: selection.billing ?? '',
        submissionId: idRef.current,
        sourcePage,
        landingPage: landingPage() ?? '',
        attribution: utmAttribution(),
        fields: values,
      }, honeypot)
      // The primary conversion: only here, after the server accepted the application, and only once.
      if (!sentRef.current) {
        sentRef.current = true
        trackEvent('project_application_submit', eventParams)
      }
      onSubmitted()
    } catch (err) {
      setStatus('idle')
      if (err?.kind === 'invalid') {
        const fieldErrs = validateFields(values, selection)
        for (const f of err.fields || []) if (FIELD_ORDER.includes(f) && !fieldErrs[f]) fieldErrs[f] = 'invalid'
        setErrors(fieldErrs)
        setSubmitError('invalid')
        if (STEP_FIELDS[1].some((f) => fieldErrs[f])) goStep(1)
        focusFirst(fieldErrs)
      } else {
        const kind = ['rate_limited', 'network'].includes(err?.kind) ? err.kind : 'unavailable'
        setSubmitError(kind)
        trackEvent('project_application_error', { ...eventParams, reason: kind })
      }
    } finally {
      inflightRef.current = false
    }
  }

  const err = (field) => (errors[field] ? messageFor(c, field, errors[field]) : undefined)
  const opt = (key, ids = OPTION_IDS[key]) => ({ options: ids, labels: c.options[key] })
  const f = c.fields
  const submitMessage = submitError && (submitError === 'unavailable' ? c.errors.unavailable(CONTACT_EMAIL) : c.errors[submitError])
  const objectiveKey = q.paidObjective ? 'paidObjective' : 'organicObjective'
  const arrow = <span aria-hidden="true">{forward()}</span>
  const primaryBtn = 'cta-gradient inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime'

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-label={c.aria.form} className="scroll-mt-24">
      {/* Progress: two segments */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <p className="font-semibold uppercase tracking-[0.16em] text-lime" aria-live="polite">{c.steps.label(step)}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden="true">
          {[1, 2].map((n) => <span key={n} className={`block h-1.5 rounded-full transition-colors duration-300 motion-reduce:transition-none ${n <= step ? 'bg-lime' : 'bg-surface-3'}`} />)}
        </div>
        <h3 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-2xl font-bold tracking-snug text-ink outline-none">{step === 1 ? c.steps.one : c.steps.two}</h3>
      </div>

      {/* STEP 1 — About your brand */}
      <div className={step === 1 ? 'mt-6 space-y-5' : 'hidden'}>
        <TextInput name="fullName" label={f.fullName.label} autoComplete="name" maxLength={LIMITS.name} value={values.fullName} error={err('fullName')} readOnly={submitting} onChange={set('fullName')} />
        <TextInput name="email" type="email" label={f.email.label} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder={f.email.placeholder} maxLength={LIMITS.email} ltrValue={ar} value={values.email} error={err('email')} readOnly={submitting} onChange={set('email')} />
        <TextInput name="company" label={f.company.label} autoComplete="organization" maxLength={LIMITS.company} value={values.company} error={err('company')} readOnly={submitting} onChange={set('company')} />
        <TextInput name="url" label={f.url.label} hint={f.url.hint} autoComplete="url" inputMode="url" autoCapitalize="none" spellCheck={false} placeholder={f.url.placeholder} maxLength={LIMITS.url} ltrValue={ar} value={values.url} error={err('url')} readOnly={submitting} onChange={set('url')} />
        <div className="pt-1">
          <button type="button" onClick={onContinue} className={`${primaryBtn} w-full`}>{c.steps.continue} {arrow}</button>
        </div>
      </div>

      {/* STEP 2 — About your project */}
      <div className={step === 2 ? 'mt-6 space-y-7' : 'hidden'}>
        <TextInput name="description" multiline label={f.description.label} hint={f.description.hint} maxLength={LIMITS.description} value={values.description} error={err('description')} readOnly={submitting} onChange={set('description')} />

        {/* Conditional questions: paid advertising (Sprint, Sprint Plus, custom paid) or organic (Organic Light, Growth, custom organic) */}
        {q.adSpend && <ChoiceGroup name="adSpend" legend={f.adSpend.legend} hint={f.adSpend.hint} {...opt('adSpend')} value={values.adSpend} error={err('adSpend')} onChange={set('adSpend')} />}
        {q.socialActivity && <ChoiceGroup name="socialActivity" legend={f.socialActivity.legend} {...opt('socialActivity')} columns={1} value={values.socialActivity} error={err('socialActivity')} onChange={set('socialActivity')} />}
        <ChoiceGroup name={objectiveKey} legend={f.objective.legend} {...opt(objectiveKey)} columns={1} value={values[objectiveKey]} error={err(objectiveKey)} onChange={set(objectiveKey)} />
        {values[objectiveKey] === 'other' && <TextInput name="objectiveOther" label={f.objectiveOther.label} maxLength={LIMITS.other} value={values.objectiveOther} error={err('objectiveOther')} readOnly={submitting} onChange={set('objectiveOther')} />}
        {q.socialAccounts && <TextInput name="socialAccounts" multiline optionalLabel={c.optional} label={f.socialAccounts.label} placeholder={f.socialAccounts.placeholder} maxLength={LIMITS.accounts} ltrValue={ar} value={values.socialAccounts} error={err('socialAccounts')} readOnly={submitting} onChange={set('socialAccounts')} />}

        {/* Custom projects only */}
        {q.productionType && <ChoiceGroup name="productionType" multiple legend={f.productionType.legend} hint={f.productionType.hint} {...opt('productionType')} value={values.productionType} error={err('productionType')} onChange={set('productionType')} />}
        {q.budget && <ChoiceGroup name="budget" legend={f.budget.legend} hint={f.budget.hint} {...opt('budget')} value={values.budget} error={err('budget')} onChange={set('budget')} />}

        {/* Every package: readiness, start date, languages */}
        <ChoiceGroup name="readiness" legend={f.readiness.legend} {...opt('readiness')} value={values.readiness} error={err('readiness')} onChange={set('readiness')} />
        <TextInput name="startDate" type="date" label={f.startDate.label} hint={f.startDate.hint} min={minDate} value={values.startDate} error={err('startDate')} readOnly={submitting} onChange={set('startDate')} />
        <ChoiceGroup name="language" multiple legend={f.language.legend} hint={f.language.hint} {...opt('language')} value={values.language} error={err('language')} onChange={set('language')} />
        {values.language.includes('other') && <TextInput name="languageOther" optionalLabel={c.optional} label={f.languageOther.label} maxLength={LIMITS.languageOther} value={values.languageOther} error={err('languageOther')} readOnly={submitting} onChange={set('languageOther')} />}

        {/* Honeypot: hidden from people and assistive technology; bots fill it in */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Nickname<input type="text" name="nickname" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
        </div>

        {/* The acknowledgement: a qualification step, never a purchase, a payment or a contract */}
        <div className="space-y-2">
          <CheckRow name="acknowledged" checked={values.acknowledged} error={err('acknowledged')} onChange={set('acknowledged')}>
            {selection.custom ? c.ack.custom : c.ack.standard}
          </CheckRow>
          <p className="px-1 text-xs leading-relaxed text-ink-subtle">{c.ack.note}</p>
        </div>

        {submitMessage && <div role="alert"><ErrorLine>{submitMessage}</ErrorLine></div>}
        {!submitMessage && Object.values(errors).some(Boolean) && <div role="alert"><ErrorLine>{c.errors.fixSummary}</ErrorLine></div>}

        <div>
          <button type="submit" disabled={submitting} className={`${primaryBtn} w-full`}>
            {submitting ? c.submitting : (<>{c.submit} {arrow}</>)}
          </button>
          <p className="mt-3 text-center text-sm text-ink-muted">{c.review}</p>
          <div className="mt-4 text-center">
            <button type="button" disabled={submitting} onClick={() => goStep(1)} className="text-[13px] font-semibold text-ink-subtle underline underline-offset-4 transition-colors hover:text-lime">{c.steps.back}</button>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-subtle">
          {c.privacy}
          {PRIVACY_POLICY_URL && (<>{' '}{c.seeOur}{' '}<a href={PRIVACY_POLICY_URL} {...(locale === 'en' ? {} : { lang: 'en' })} className="text-ink-muted underline underline-offset-2 hover:text-lime">{c.privacyLink}</a>{c.inEnglish}.</>)}
        </p>
      </div>
    </form>
  )
}
