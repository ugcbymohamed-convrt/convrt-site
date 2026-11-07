import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../../lib/analytics.js'
import { OFFER_PATHS, PRIVACY_POLICY_URL, ROADMAP_BOOKING_URL } from '../../config.js'
import {
  BUSINESS_TYPE_OPTIONS,
  SPEND_OPTIONS,
  CHALLENGE_OPTIONS,
  TIMELINE_OPTIONS,
  INVESTMENT_OPTIONS,
  validateAnswers,
} from '../../lib/roadmapQuestions.js'
import { qualifyApplication } from '../../lib/roadmapQualification.js'
import { Reveal, Check } from './shared.jsx'
import { RadioGroup, Progress } from '../forms/fields.jsx'
import RoadmapBooking from './RoadmapBooking.jsx'

/* ─────────────────────────────────────────────
   QUALIFICATION — five questions, then Calendly (or a relevant alternative).

   • No backend: answers are checked and qualified in the browser
     (rules: src/lib/roadmapQualification.js) and nothing is sent to CONVRT.
   • Qualified → the Calendly calendar appears on this page. Calendly's own
     booking form and confirmation emails handle everything from there.
   • Not ready (just exploring / only researching) → no calendar; points to
     the free 10-hooks library (/free-hooks).
   • Different business type (agency / other) → no calendar; points to the
     contact section. This outcome takes priority over "not ready".
   • "Change my answers" returns to the form with answers intact; the outcome
     is recomputed from scratch on every Continue.
   • Answers live in memory only (no storage) and never go to analytics.
   • A CONVERSION is counted only when Calendly reports a real booking
     (see RoadmapBooking.jsx) — not when the calendar appears.
───────────────────────────────────────────── */

const EMPTY = { businessType: '', adSpend: '', challenge: '', timeline: '', investment: '' }
const FIELDS = Object.keys(EMPTY)

// One analytics event per outcome (no answers or personal data).
const OUTCOME_EVENTS = {
  qualified: 'roadmap_qualified',
  not_ready: 'roadmap_not_ready',
  different_business: 'roadmap_different_business',
}

const NEXT_STEPS = [
  'Answer five quick questions about your business.',
  'If your brand is a good fit, pick a time for your strategy session straight away.',
  'We prepare your concepts and present them on the call.',
]

export default function RoadmapApplication() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null) // { status, answers } once the visitor has continued
  const startedRef = useRef(false)
  const formRef = useRef(null)
  const resultHeadingRef = useRef(null)
  const answered = FIELDS.filter((f) => values[f]).length

  const set = (field) => (value) => {
    if (!startedRef.current) {
      startedRef.current = true
      trackEvent('roadmap_form_started')
    }
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  // When the result panel appears, move focus to its heading and bring it into view.
  useEffect(() => {
    if (!result) return
    resultHeadingRef.current?.focus({ preventScroll: true })
    document.getElementById('apply')?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [result])

  const focusFirstError = (errs) => {
    const first = FIELDS.find((k) => errs[k])
    if (!first) return
    window.requestAnimationFrame(() => {
      const el = formRef.current?.querySelector(`[data-field="${first}"]`)
      el?.focus()
      el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
    })
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const errs = validateAnswers(values)
    setErrors(errs)
    if (Object.keys(errs).length) return focusFirstError(errs)

    // Analytics events carry no answers or personal data.
    trackEvent('roadmap_application_submitted') // = qualification form completed
    const { status } = qualifyApplication(values)
    trackEvent(OUTCOME_EVENTS[status])
    setResult({ status, answers: { ...values } })
  }

  const changeAnswers = () => setResult(null)

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
                Let’s Find Your Next 5 Ad Concepts.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
                Answer five quick questions. If your brand is a good fit, you can choose a time for your free strategy
                session straight away.
              </p>

              <div className="mt-8 hidden rounded-3xl border border-hairline bg-surface-1/60 p-6 lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">What happens next</p>
                <NextSteps />
              </div>
            </Reveal>
          </div>

          {/* Card: form → calendar / message */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-8">
              {result ? (
                result.status === 'qualified' ? (
                  <RoadmapBooking bookingUrl={ROADMAP_BOOKING_URL} headingRef={resultHeadingRef} />
                ) : (
                  <Alternative kind={result.status} headingRef={resultHeadingRef} onChange={changeAnswers} />
                )
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate aria-label="Creative Growth Roadmap qualification">
                  <Progress label="Quick fit check" answered={answered} total={FIELDS.length} />

                  <div className="mt-7 space-y-7">
                    <RadioGroup
                      name="businessType" legend="What best describes your business?" options={BUSINESS_TYPE_OPTIONS}
                      value={values.businessType} error={errors.businessType} onChange={set('businessType')} columns={2}
                    />
                    <RadioGroup
                      name="adSpend" legend="What’s your approximate monthly paid advertising spend?" options={SPEND_OPTIONS}
                      hint="Used to tailor your roadmap. It won’t automatically disqualify you."
                      value={values.adSpend} error={errors.adSpend} onChange={set('adSpend')} columns={2}
                    />
                    <RadioGroup
                      name="challenge" legend="What’s your biggest creative challenge?" options={CHALLENGE_OPTIONS}
                      value={values.challenge} error={errors.challenge} onChange={set('challenge')} columns={2}
                    />
                    <RadioGroup
                      name="timeline" legend="When are you looking to produce new creatives?" options={TIMELINE_OPTIONS}
                      value={values.timeline} error={errors.timeline} onChange={set('timeline')} columns={1}
                    />
                    <RadioGroup
                      name="investment" legend="Are you currently looking to invest in professional video production?" options={INVESTMENT_OPTIONS}
                      value={values.investment} error={errors.investment} onChange={set('investment')} columns={1}
                    />

                    <button type="submit" className={`${primaryBtn} w-full`}>
                      Continue <span aria-hidden="true">→</span>
                    </button>

                    <p className="text-xs leading-relaxed text-ink-subtle">
                      Your answers stay in your browser and are only used to check fit.
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
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime'

function NextSteps() {
  return (
    <ol className="mt-4 space-y-3.5 lg:mt-4" aria-label="What happens next">
      {NEXT_STEPS.map((t, i) => (
        <li key={t} className="flex gap-3 text-sm leading-snug text-ink-muted">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime/30 text-xs font-bold tabular-nums text-lime" aria-hidden="true">{i + 1}</span>
          <span>{t}</span>
        </li>
      ))}
    </ol>
  )
}

/* ---------- Alternatives: no calendar, a relevant next step instead ---------- */

const ALTERNATIVES = {
  not_ready: {
    title: 'Not Quite Ready for a Roadmap?',
    body: [
      'Our personalized Creative Growth Roadmaps are designed for brands preparing to produce and test new video ads.',
      'In the meantime, explore new creative directions with our free library of 10 advertising hooks.',
    ],
    cta: 'Get 10 Free Ad Hooks',
    href: OFFER_PATHS.hooks,
    event: 'roadmap_alt_hooks_click',
  },
  different_business: {
    title: 'Looking for a Different Kind of Collaboration?',
    body: [
      'Our Creative Growth Roadmap is currently designed for SaaS and E-commerce brands. If you’d like to explore another type of collaboration with CONVRT, we’d still love to hear from you.',
    ],
    cta: 'Contact CONVRT',
    href: '/#contact',
    event: 'roadmap_alt_contact_click',
  },
}

function Alternative({ kind, headingRef, onChange }) {
  const alt = ALTERNATIVES[kind]
  return (
    <div className="px-1 py-4 text-center sm:py-8" role="status">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime">
        <Check className="h-6 w-6" />
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-3xl font-bold tracking-display text-ink outline-none">
        {alt.title}
      </h3>
      {alt.body.map((t) => (
        <p key={t} className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">{t}</p>
      ))}
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <a
          href={alt.href}
          onClick={() => trackEvent(alt.event)}
          className={`${primaryBtn} group`}
        >
          {alt.cta}
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
        </a>
        <button
          type="button"
          onClick={onChange}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          ← Change my answers
        </button>
      </div>
    </div>
  )
}
