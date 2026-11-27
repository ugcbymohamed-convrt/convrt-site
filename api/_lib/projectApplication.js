/* ─────────────────────────────────────────────
   /project-application → intake (server only).

   A PURCHASE-INTENT inquiry: a visitor picked a production package on /pricing and applied for it. It is not a Free Creative Growth Roadmap application and is never mixed with those.

   • The owner is the system of record: each valid application is emailed to the owner through Resend (the same provider, sender, recipient and HTML template as every other CONVRT alert:
     ./notify.js buildAlert). Nothing is stored anywhere else, no CRM, no MailerLite group, no marketing audience: a contact is never added to an email list by this form.
   • SUCCESS MEANS DELIVERED. Without a working Resend key, or when Resend refuses the message, the visitor gets an error, never a confirmation.
   • No calendar, no booking link, no payment, no email to the applicant: the owner reviews each application and decides the next step personally.
   • The package, billing option, price, currency and commitment are RECOMPUTED here from the validated identifiers through the same pricing configuration the site uses
     (src/lib/projectApplication.js → src/i18n/pricing.js). A price, name or amount sent by the browser is ignored (it is never even read).
   • Duplicate protection: the browser sends a per-form `submissionId`; it is the Resend Idempotency-Key, so a double click, a retry or a replayed request sends ONE email.
   • Spam: the same-origin check and body-size limit (api/project-apply.js), a honeypot field (a bot gets a convincing success and nothing is sent).
   • Logs carry error kinds only: never a name, email, URL or answer.

   Env (Vercel): RESEND_API_KEY (secret, required) · NOTIFY_EMAIL_TO / NOTIFY_EMAIL_FROM (optional, see ./notify.js).
   Local development: PROJECT_APPLICATION_DRY_RUN=1 validates everything and builds the email but sends nothing (answers success), so the form can be exercised without producing a lead.
───────────────────────────────────────────── */

import { buildAlert, RESEND_ENDPOINT } from './notify.js'
import {
  selectionFor, normalizeRequest, validateFields, describeAnswers, questionsFor,
  PACKAGE_NAMES_EN, BILLING_LABELS_EN, OPTION_LABELS_EN, RANGE_CURRENCY,
} from '../../src/lib/projectApplication.js'
import { LOCALES } from '../../src/i18n/locales.js'

const NOTIFY_TIMEOUT_MS = 6000
const json = (status, body, headers) => ({ status, body, headers })
const logKind = (kind, detail) => {
  // eslint-disable-next-line no-console
  console.error(`[project-application] ${kind}`, detail)
}

const SYMBOL = { USD: '$', EUR: '€' }
const group = (n) => String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
export const priceText = (amount, currency) => {
  const [whole, cents] = Number(amount).toFixed(2).split('.')
  return `${SYMBOL[currency] ?? ''}${group(whole)}${cents === '00' ? '' : `.${cents}`} ${currency}`
}

function commitmentText(sel) {
  if (sel.custom) return 'None stated: pricing, scope and terms depend on the final project requirements.'
  if (sel.category === 'organic') return `${sel.commitmentMonths}-month initial commitment (terms after the initial period are set out in the applicable agreement).`
  if (sel.billing === 'monthly') return `${sel.commitmentMonths}-month initial commitment, then month-to-month with ${sel.cancellationNoticeDays} days' cancellation notice.`
  return 'One production batch, no recurring commitment.'
}

/* The owner's email. Subject: "[CONVRT] New Project Application — Sprint One-time — Brand Name". */
export function buildApplicationAlert(req, sel, { now }) {
  const f = req.fields
  const a = describeAnswers(f, sel, req.locale)
  const q = questionsFor(sel)
  const packageName = PACKAGE_NAMES_EN[sel.packageId]
  const billingLabel = sel.billing ? BILLING_LABELS_EN[sel.billing] : 'Custom proposal'
  const shortName = packageName.replace('Creative Testing ', '')
  const attribution = Object.entries(req.attribution).map(([k, v]) => `${k}=${v}`).join(', ')
  const rows = [
    ['Application type', 'PROJECT APPLICATION (purchase intent). NOT a Free Creative Growth Roadmap application.'],
    ['Applicant name', f.fullName],
    ['Email', f.email],
    ['Company / brand', f.company],
    ['Website / app / social URL', f.url],
    ['Selected package', packageName],
    ['Billing preference', billingLabel],
    ['Current package price', sel.custom ? 'Custom: no price (quotation depends on the project requirements)' : priceText(sel.amount, sel.currency)],
    ['Currency', sel.custom ? 'n/a (custom)' : sel.currency],
    ['Applicable commitment', commitmentText(sel)],
    ['Project description', f.description],
    ['Project objective', a.objective ?? ''],
  ]
  if (q.adSpend) rows.push(['Monthly advertising spend', a.adSpend])
  if (q.socialActivity) rows.push(['Current social media activity', a.socialActivity])
  if (q.socialAccounts) rows.push(['Social media accounts', a.socialAccounts])
  if (q.productionType) rows.push(['Type of production required', a.productionType])
  if (q.budget) rows.push([`Estimated project budget (${RANGE_CURRENCY[req.locale]})`, a.budget])
  rows.push(
    ['Project readiness', OPTION_LABELS_EN.readiness[f.readiness]],
    ['Desired start date', f.startDate],
    ['Production languages', f.language.map((id) => (id === 'other' ? `Other${f.languageOther ? `: ${f.languageOther}` : ''}` : OPTION_LABELS_EN.language[id])).join(', ')],
    ['Pricing acknowledgement', sel.custom
      ? 'Yes: understands that pricing will be determined from the final project requirements (a qualification acknowledgement, not a purchase agreement).'
      : 'Yes: understands the pricing and terms of the selected package (a qualification acknowledgement, not a purchase agreement or payment authorization).'],
    ['Submitted', now.toISOString()],
    ['Website locale', `${req.locale} (${LOCALES[req.locale].englishName})`],
    ['Source page', req.sourcePage],
    ['Landing page', req.landingPage || '(not available)'],
    ['Campaign attribution', attribution || '(none)'],
    ['Submission id', req.submissionId],
  )
  return {
    subject: `[CONVRT] New Project Application — ${shortName} ${billingLabel} — ${f.company}`,
    title: 'New project application (purchase intent). Review it and decide the next step; no calendar link was shared with the applicant.',
    rows,
    footer: 'Reply to this email to reach the applicant. Nothing was sent to the applicant automatically.',
    replyTo: f.email,
  }
}

/* Resend, with the submission id as the Idempotency-Key (Resend de-duplicates the same key for 24 hours). Resolves true only on a 2xx. */
async function deliver(alert, key, idempotencyKey, { env, fetchImpl }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), NOTIFY_TIMEOUT_MS)
  try {
    const res = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `convrt-project-application-${idempotencyKey}` },
      body: JSON.stringify(buildAlert(alert, env)),
      signal: controller.signal,
    })
    if (res.status >= 200 && res.status < 300) return { ok: true }
    logKind('resend_refused', { status: res.status })
    return { ok: false, status: res.status }
  } catch (err) {
    logKind('resend_error', { name: err?.name })
    return { ok: false }
  } finally {
    clearTimeout(timer)
  }
}

export async function processProjectApplication({ body, env = process.env, fetchImpl = globalThis.fetch, now = () => new Date() }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { ok: false, error: 'invalid_request' })

  // Honeypot: real visitors never see it. A bot gets a convincing success and nothing is sent.
  if (typeof body.nickname === 'string' && body.nickname.trim() !== '') return json(200, { ok: true })

  const req = normalizeRequest(body)
  if (!req.locale) return json(422, { ok: false, error: 'invalid_application', fields: ['locale'] })
  // The package and billing option are validated against the pricing configuration; the price is looked up here, never read from the request.
  const sel = selectionFor(req.locale, req.packageId, req.billing)
  if (!sel) return json(422, { ok: false, error: 'invalid_application', fields: ['package'] })
  if (!req.submissionId) return json(422, { ok: false, error: 'invalid_application', fields: ['submissionId'] })
  const at = now()
  const errors = validateFields(req.rawFields, sel, { now: at })
  if (Object.keys(errors).length) return json(422, { ok: false, error: 'invalid_application', fields: Object.keys(errors) })

  const alert = buildApplicationAlert(req, sel, { now: at })

  if (String(env.PROJECT_APPLICATION_DRY_RUN || '') === '1') {
    return { ...json(200, { ok: true }), dryRun: true, alert }
  }
  const key = String(env.RESEND_API_KEY || '').trim()
  if (!key) {
    logKind('not_configured', { hasKey: false })
    return json(503, { ok: false, error: 'unavailable' })
  }
  const sent = await deliver(alert, key, req.submissionId, { env, fetchImpl })
  if (!sent.ok) return json(502, { ok: false, error: sent.status === 429 ? 'rate_limited' : 'unavailable' })
  return json(200, { ok: true })
}
