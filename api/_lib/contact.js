/* ─────────────────────────────────────────────
   /contact → general inquiry intake (server only).

   A GENERAL inquiry is not a package application, not a Creative Growth Roadmap application and not a free-video application. It is delivered to the owner as ONE email
   (Resend, the same owner-alert helper the other forms use: ./notify.js), clearly labelled "General inquiry", with the selected service, language and source page. Reply-To is the
   visitor's address so "Reply" goes straight to them.

   • Nothing is saved in MailerLite (no marketing list, no consent record): a general inquiry only reaches the owner's inbox.
   • No booking link is returned and nothing is scheduled. The owner decides: reply, ask for more information, prepare a proposal, or privately invite the prospect to a call.
   • No response time is promised anywhere in the response.
   • If the owner alert cannot be sent (no RESEND_API_KEY, or Resend is down) the visitor is told it was NOT sent (503), never a false success: an inquiry that is lost silently is worse than an error.
   • Honeypot field (`hpCheck`): bots get a convincing success and nothing is sent.
   • Never log names, emails or messages.

   Same shape as api/_lib/apply.js: `processContact()` takes the request body + env and returns `{ status, body }`, so it is unit-tested directly (tests/contact-inquiry.test.mjs).
───────────────────────────────────────────── */

import { sendOwnerAlert } from './notify.js'
import { BUDGETS, BUDGET_CURRENCY, CONTACT_LOCALES, SERVICES, normalizeInquiry, validateInquiry } from '../../src/lib/contactInquiry.js'

const json = (status, body, headers) => ({ status, body, headers })

function logUpstream(kind, detail) {
  // eslint-disable-next-line no-console
  console.error(`[contact] ${kind}`, detail)
}

const LOCALE_NAME = { en: 'English', es: 'Spanish', fr: 'French', ar: 'Arabic' }
/* The source page is derived from the language (a known path), never copied from the request: a visitor cannot put arbitrary text in the "source page" line. */
export const sourcePageFor = (locale) => (locale === 'en' ? '/contact' : `/${locale}/contact`)

export function notifyOwner(inquiry, locale, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const currency = BUDGET_CURRENCY[locale]
  return sendOwnerAlert(
    {
      subject: `[General inquiry] ${inquiry.fullName}${inquiry.company ? ` (${inquiry.company})` : ''}`,
      title: 'New GENERAL inquiry from the Contact page. This is not a package application, a Creative Growth Roadmap application or a free-video application.',
      rows: [
        ['Type', 'General inquiry (Contact page)'],
        ['Name', inquiry.fullName],
        ['Email', inquiry.email],
        ['Brand or company', inquiry.company],
        ['Website or social media', inquiry.website || '(not given)'],
        ['Service of interest', `${SERVICES[inquiry.service]} (${inquiry.service})`],
        ['Estimated budget', inquiry.budget ? `${BUDGETS[inquiry.budget]} ${currency}${inquiry.budget === 'unsure' ? '' : ` (shown in ${currency}, in the ${LOCALE_NAME[locale]} form)`}` : '(not given)'],
        ['Project description', inquiry.message],
        ['Language of the form', LOCALE_NAME[locale]],
        ['Source page', sourcePageFor(locale)],
        ['Consent to be contacted about this inquiry', 'Yes (required box ticked)'],
      ],
      footer: 'Reply to this email to reach the sender. No call was offered or scheduled automatically.',
      replyTo: inquiry.email,
    },
    { env, fetchImpl, log: logUpstream },
  )
}

export async function processContact({ body, env = process.env, fetchImpl = globalThis.fetch }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { ok: false, error: 'invalid_request' })

  // Honeypot: real visitors never see or fill this field. Bots get a convincing success and nothing is sent.
  if (typeof body.hpCheck === 'string' && body.hpCheck.trim() !== '') return json(200, { ok: true })

  const errors = validateInquiry(body)
  if (Object.keys(errors).length) return json(422, { ok: false, error: 'invalid_inquiry', fields: Object.keys(errors) })

  const locale = CONTACT_LOCALES.includes(body.locale) ? body.locale : 'en'
  const inquiry = normalizeInquiry(body)
  const sent = await notifyOwner(inquiry, locale, { env, fetchImpl })
  if (!sent) {
    logUpstream('not_delivered', { hasKey: Boolean(String(env.RESEND_API_KEY || '').trim()) })
    return json(503, { ok: false, error: 'unavailable' })
  }
  return json(200, { ok: true })
}
