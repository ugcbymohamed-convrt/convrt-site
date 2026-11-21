/* ─────────────────────────────────────────────
   Marketing-email consent, server side (shared by the three MailerLite forms:
   api/_lib/subscribe.js, apply.js and referral.js).

   THE MODEL
   • Every form saves its lead / application / partner to its OWN service group
     (hooks library · free-video applications · referral partners). Those groups
     are for the service the person asked for. They are NOT a marketing audience.
   • The promotional audience is ONE separate group (MAILERLITE_GROUP_MARKETING_ID).
     A contact is added to it only when ALL of these are true:
       1. the visitor ticked the optional, unchecked-by-default box,
       2. the wording version they were shown is one we know (see
          src/content/marketingConsent.js), and
       3. the consent record (below) was written to MailerLite in the same request.
     If the record cannot be written the contact is saved as a normal lead and is
     NOT added to the marketing group (fail closed).
   • The record is four MailerLite custom fields, written only when the box was
     ticked: marketing_consent ("opted_in"), marketing_consent_at (UTC ISO time),
     marketing_consent_version ("v2") and marketing_consent_source (which form).
     Declining writes nothing: no record means no consent, and a later submission
     with the box unticked can never overwrite an earlier opt-in (unticking a box
     on an unrelated application is not a withdrawal; unsubscribing is).
   • Declining never changes whether the form succeeds, whether the requested
     resource is delivered, or whether the owner alert is sent.
   • Nothing here sends `status` or `resubscribe`: a contact that unsubscribed,
     bounced or was marked junk is never re-activated by a website form, and
     unsubscribing in MailerLite stops promotional AND automation emails.

   Personal data stays out of analytics: none of this reaches the browser's
   dataLayer; the client only sends the box state to our own API.
───────────────────────────────────────────── */

import { CURRENT_MARKETING_CONSENT_VERSION, CONSENT_SOURCES, isKnownConsentVersion } from '../../src/content/marketingConsent.js'

export { CURRENT_MARKETING_CONSENT_VERSION }

export const MARKETING_GROUP_ENV = 'MAILERLITE_GROUP_MARKETING_ID'

/* MailerLite custom fields (MailerLite → Subscribers → Fields, type Text, exactly these keys). */
export const CONSENT_FIELD_KEYS = {
  status: 'marketing_consent',
  at: 'marketing_consent_at',
  version: 'marketing_consent_version',
  source: 'marketing_consent_source',
}
export const CONSENT_STATUS_OPTED_IN = 'opted_in'

const GROUP_ID_RE = /^\d{1,30}$/
const UPSTREAM_TIMEOUT_MS = 8000

export const marketingGroupId = (env) => {
  const id = String(env?.[MARKETING_GROUP_ENV] || '').trim()
  return GROUP_ID_RE.test(id) ? id : null
}

/* Reads the consent a browser reported. Pure. `legacyVersion` lets one endpoint accept a
   request that predates version numbers (a hooks page cached in a browser during the release). */
export function readConsent(body, source, { now = () => new Date(), legacyVersion } = {}) {
  const requested = body?.marketingConsent === true
  if (!requested) return { requested: false, granted: false, reason: 'declined' }

  const sent = typeof body.marketingConsentVersion === 'string' ? body.marketingConsentVersion : legacyVersion
  if (!isKnownConsentVersion(sent) || !CONSENT_SOURCES.includes(source)) {
    // We cannot say which wording they saw, so we cannot claim consent to it.
    return { requested: true, granted: false, reason: 'unknown_wording_version' }
  }
  return { requested: true, granted: true, version: sent, source, at: now().toISOString(), reason: 'opted_in' }
}

export function consentFields(consent) {
  return {
    [CONSENT_FIELD_KEYS.status]: CONSENT_STATUS_OPTED_IN,
    [CONSENT_FIELD_KEYS.at]: consent.at,
    [CONSENT_FIELD_KEYS.version]: consent.version,
    [CONSENT_FIELD_KEYS.source]: consent.source,
  }
}

/* The MailerLite body with the consent record and marketing group added.
   `base` is the form's own payload and is never mutated. */
export function withConsent(base, consent, env) {
  if (!consent.granted) return { payload: base, wroteRecord: false, groupAdded: false }
  const groupId = marketingGroupId(env)
  return {
    payload: {
      ...base,
      fields: { ...(base.fields || {}), ...consentFields(consent) },
      groups: groupId && !(base.groups || []).includes(groupId) ? [...(base.groups || []), groupId] : base.groups,
    },
    wroteRecord: true,
    groupAdded: Boolean(groupId),
  }
}

async function post(endpoint, token, payload, fetchImpl) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    let data = null
    try {
      data = await res.json()
    } catch {
      /* non-JSON body */
    }
    return { res, data }
  } catch (err) {
    return { networkError: err?.name || 'Error' }
  } finally {
    clearTimeout(timer)
  }
}

/* Saves the subscriber. When the visitor opted in, the consent record and the marketing group
   go in the same request; if MailerLite rejects the request because of them (typically the
   custom fields were not created yet) it retries ONCE without them so the lead / application is
   never lost, and reports that the consent was not recorded. Returns
   `{ networkError }` or `{ res, data, consent }` where `consent` describes what really happened
   (see describeConsent). */
export async function saveSubscriber({ endpoint, token, base, consent, env, fetchImpl, log = () => {} }) {
  const plan = withConsent(base, consent, env)
  const outcome = {
    requested: consent.requested,
    granted: consent.granted,
    version: consent.version,
    source: consent.source,
    at: consent.at,
    recorded: false,
    groupAdded: false,
    reason: consent.reason,
  }

  let attempt = await post(endpoint, token, plan.payload, fetchImpl)
  if (attempt.networkError) return { networkError: attempt.networkError, consent: { ...outcome, reason: consent.granted ? 'not_saved' : consent.reason } }

  const rejected = attempt.res.status === 422 && !attempt.data?.errors?.email
  if (consent.granted && rejected) {
    log('consent_fields_rejected', { fields: Object.keys(attempt.data?.errors || {}) })
    attempt = await post(endpoint, token, base, fetchImpl)
    if (attempt.networkError) return { networkError: attempt.networkError, consent: { ...outcome, reason: 'not_saved' } }
    return { ...attempt, consent: { ...outcome, reason: 'consent_record_rejected' } }
  }

  const ok = attempt.res.status === 200 || attempt.res.status === 201
  return {
    ...attempt,
    consent: {
      ...outcome,
      recorded: ok && plan.wroteRecord,
      groupAdded: ok && plan.groupAdded,
      reason: !consent.granted ? consent.reason : !ok ? 'not_saved' : !plan.groupAdded ? 'marketing_group_not_configured' : consent.reason,
    },
  }
}

/* A consent outcome for requests that were never sent to MailerLite (not configured, bot…). */
export const unsavedConsent = (consent) => ({
  requested: consent.requested,
  granted: consent.granted,
  version: consent.version,
  source: consent.source,
  at: consent.at,
  recorded: false,
  groupAdded: false,
  reason: consent.granted ? 'not_saved' : consent.reason,
})

/* One owner-alert row that states exactly what happened, in plain words.
   The alert is the second, independent record of the consent (time and wording version). */
export function consentAlertRow(c) {
  const label = 'Marketing emails (optional box)'
  if (!c?.requested) return [label, 'Not ticked: kept OUT of the marketing list. Service emails only.']
  if (!c.granted) return [label, 'Ticked, but the wording version was not recognised: NOT added to the marketing list.']
  const proof = `ticked ${c.at} on "${c.source}", wording ${c.version}`
  if (c.blocked) return [label, `Ticked (${proof}), but this address previously unsubscribed or bounced, so MailerLite will not email it. Not re-subscribed.`]
  if (c.recorded && c.groupAdded) return [label, `YES: ${proof}. Recorded in MailerLite and added to the marketing list.`]
  if (c.recorded) return [label, `Ticked (${proof}) and recorded in MailerLite, but MAILERLITE_GROUP_MARKETING_ID is not configured, so NOT on the marketing list.`]
  return [label, `Ticked (${proof}) but NOT recorded in MailerLite (${c.reason}): NOT on the marketing list. Do not send marketing until this is resolved.`]
}
