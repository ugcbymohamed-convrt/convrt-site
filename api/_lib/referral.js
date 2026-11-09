/* ─────────────────────────────────────────────
   /referrals → referral partner application intake (server only).

   Every valid submission is saved to a MailerLite group for MANUAL review and
   announced to the owner by email — even when MailerLite is down, in which case the
   email is flagged NOT SAVED so no partner's address is ever lost (same policy as
   api/_lib/apply.js). Nothing is auto-approved, no booking link is returned and
   nothing here promises or triggers a payment.

   Same shape as api/_lib/apply.js: `processReferral()` takes the request body +
   env and returns `{ status, body }`, so it is unit-tested directly
   (tests/referral-apply.test.mjs).

   MailerLite: POST https://connect.mailerlite.com/api/subscribers
     • standard field `name`
     • custom fields (must exist in MailerLite → Subscribers → Fields, using
       exactly these keys): partner_type, referral_program, partner_company,
       partner_website, referred_company, referred_website, referral_notes
     • `groups` = [MAILERLITE_GROUP_REFERRALS_ID]  (additive: never removes a
       contact from other groups)
   Optional answers that were left blank are NOT sent, so a returning partner never
   wipes values saved earlier and unrelated subscriber data is left alone.
   No `status` is sent (unsubscribed / bounced / junk contacts cannot be re-added
   by a website form).

   MailerLite is keyed by email, so it holds ONE record per partner: the latest
   referral details overwrite the previous ones. The owner email sent for every
   submission is the complete per-referral record — see docs/referral-program-setup.md
   for the manual tracking process.

   The API tokens only ever live in process.env (Vercel project settings).
───────────────────────────────────────────── */

import { MAILERLITE_ENDPOINT } from './subscribe.js'
import { sendOwnerAlert } from './notify.js'
import { normalizeReferral, validateReferral } from '../../src/lib/referralProgram.js'

export const REFERRALS_GROUP_ENV = 'MAILERLITE_GROUP_REFERRALS_ID'

const UPSTREAM_TIMEOUT_MS = 8000
const GROUP_ID_RE = /^\d{1,30}$/

const json = (status, body, headers) => ({ status, body, headers })

/* Never log names, emails or referral details. */
function logUpstream(kind, detail) {
  // eslint-disable-next-line no-console
  console.error(`[referrals] ${kind}`, detail)
}

/* MailerLite payload. Exported so the field mapping can be tested directly. */
export function buildSubscriberPayload(partner, groupId) {
  const fields = {
    name: partner.fullName,
    partner_type: partner.partnerType,
    referral_program: partner.program,
  }
  const optional = {
    partner_company: partner.partnerCompany,
    partner_website: partner.partnerWebsite,
    referred_company: partner.referredCompany,
    referred_website: partner.referredWebsite,
    referral_notes: partner.referralNotes,
  }
  for (const [key, value] of Object.entries(optional)) if (value) fields[key] = value
  return { email: partner.email, fields, groups: [groupId] }
}

/* Owner alert (optional, best-effort): see ./notify.js. Never throws. */
export async function notifyOwner(partner, result, submittedAt, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const saved = result.status === 200
  const hasReferral = Boolean(partner.referredCompany || partner.referredWebsite || partner.referralNotes)
  try {
    return await sendOwnerAlert(
      {
        subject: `${saved ? '' : '[NOT SAVED] '}New referral partner application: ${partner.fullName} (${partner.program})`,
        title: 'New Referral Partner Program application.',
        rows: [
          ['Name', partner.fullName],
          ['Email', partner.email],
          ['Partner type', partner.partnerType],
          ['Program', partner.program],
          ['Company / agency', partner.partnerCompany || '(not provided)'],
          ['Website / LinkedIn', partner.partnerWebsite || '(not provided)'],
          ['Referred company', partner.referredCompany || '(none submitted)'],
          ['Referred website', partner.referredWebsite || '(none submitted)'],
          ['Opportunity notes', partner.referralNotes || '(none submitted)'],
          ['Submitted (UTC)', submittedAt],
          [
            'Saved to MailerLite',
            saved ? 'Yes (group: Referral Partner Applications)' : `NO (${result.body?.error || 'error'}): follow up with them by email`,
          ],
        ],
        footer:
          'Reply to this email to reach the applicant. ' +
          (hasReferral ? 'Add this referral to the tracking sheet. ' : '') +
          'Nothing has been approved, promised or paid: agency partners need your approval and final terms are confirmed with the partner.',
        replyTo: partner.email,
      },
      { env, fetchImpl, log: logUpstream },
    )
  } catch (err) {
    logUpstream('notify_error', { name: err?.name })
    return false
  }
}

export async function processReferral({ body, env = process.env, fetchImpl = globalThis.fetch, now = () => new Date() }) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(400, { ok: false, error: 'invalid_request' })
  }

  // Honeypot: real visitors never see or fill this field (it is deliberately NOT named
  // "company", which browsers autofill). Bots get a convincing success and nothing is saved.
  if (typeof body.hpCheck === 'string' && body.hpCheck.trim() !== '') return json(200, { ok: true })

  const errors = validateReferral(body)
  if (Object.keys(errors).length) return json(422, { ok: false, error: 'invalid_application', fields: Object.keys(errors) })

  const partner = normalizeReferral(body)
  const result = await saveReferral(partner, { env, fetchImpl })
  // Every genuine submission alerts the owner, even when it could not be saved, so no email
  // address typed into the form is ever lost. The alert is best-effort and never changes `result`.
  await notifyOwner(partner, result, now().toISOString(), { env, fetchImpl })
  return result
}

async function saveReferral(partner, { env, fetchImpl }) {
  const token = env.MAILERLITE_API_TOKEN
  const groupId = String(env[REFERRALS_GROUP_ENV] || '').trim()

  if (!token || !GROUP_ID_RE.test(groupId)) {
    logUpstream('not_configured', { hasToken: Boolean(token), hasGroupId: GROUP_ID_RE.test(groupId) })
    return json(503, { ok: false, error: 'unavailable' })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  let res
  try {
    res = await fetchImpl(MAILERLITE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(buildSubscriberPayload(partner, groupId)),
      signal: controller.signal,
    })
  } catch (err) {
    logUpstream('network_error', { name: err?.name })
    return json(502, { ok: false, error: 'unavailable' })
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON body */
  }

  // 201 created · 200 already existed and was updated — both are saved applications.
  if (res.status === 200 || res.status === 201) {
    const status = data?.data?.status
    if (status === 'unsubscribed' || status === 'bounced' || status === 'junk') {
      logUpstream('cannot_resubscribe', { status })
      return json(409, { ok: false, error: 'cannot_subscribe' })
    }
    return json(200, { ok: true })
  }

  if (res.status === 422) {
    if (data?.errors?.email) return json(422, { ok: false, error: 'invalid_application', fields: ['email'] })
    // Most likely a custom field key that doesn't exist in MailerLite yet.
    logUpstream('validation_error', { message: data?.message, fields: Object.keys(data?.errors || {}) })
    return json(502, { ok: false, error: 'unavailable' })
  }

  if (res.status === 429) {
    const retryAfter = res.headers?.get?.('retry-after')
    return json(429, { ok: false, error: 'rate_limited' }, retryAfter ? { 'Retry-After': retryAfter } : undefined)
  }

  if (res.status === 401 || res.status === 403) {
    logUpstream('auth_error', { status: res.status }) // bad / revoked token
    return json(503, { ok: false, error: 'unavailable' })
  }

  logUpstream('upstream_error', { status: res.status, message: data?.message })
  return json(502, { ok: false, error: 'unavailable' })
}
