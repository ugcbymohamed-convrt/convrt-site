#!/usr/bin/env node
/* ─────────────────────────────────────────────
   READ-ONLY audit: how are the existing MailerLite contacts categorised, and what consent evidence does each one have?

   RUN IT YOURSELF (it needs your MailerLite API token; Claude has no access to your account and has not run it):
     MAILERLITE_API_TOKEN=... \
     MAILERLITE_GROUP_SAAS_ID=... MAILERLITE_GROUP_ECOMMERCE_ID=... MAILERLITE_GROUP_RISK_FREE_ID=... \
     MAILERLITE_GROUP_REFERRALS_ID=... MAILERLITE_GROUP_MARKETING_ID=... \
     node scripts/audit-mailerlite-consent.mjs [--csv ~/Desktop/mailerlite-consent-audit.csv]

   GUARANTEES
   • Only HTTP GET requests are ever sent (one function, `get()`, below; tests/mailerlite-audit.test.mjs fails if any other method appears).
     It never creates, changes, deletes, unsubscribes, regroups or exports anything in MailerLite, and it sends no email.
   • The summary on screen contains COUNTS only. A CSV (email, status, groups, category) is written ONLY when you pass --csv, to the path you give,
     on your own computer; it contains personal data, so keep it private and delete it when you are done. Never commit it.
   • Nothing is reclassified: the categories are a report for you to read. Deciding what to do with a category is your call (docs/marketing-consent-mailerlite.md).

   CATEGORIES (first match wins)
     suppressed              status unsubscribed / bounced / junk: must never be emailed
     consent_recorded        has the new consent record (marketing_consent = opted_in) and is active or unconfirmed
     marketing_group_only    in the marketing group but has NO consent record: evidence is only the group membership (for example hooks signups
                             that ticked the old optional box before records existed). Review before the first campaign.
     service_only            in a service group (hooks, free video applications, referral partners) and nowhere marketing-related: NO marketing consent
     no_known_group          in none of the groups named above (imported, manual or created elsewhere): consent unknown
   Also reported: records that have a consent record but are not in the marketing group, and how many promotional campaigns have been SENT.
───────────────────────────────────────────── */

import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const API = 'https://connect.mailerlite.com/api'
const PAGE = 100

export const GROUP_ENVS = {
  hooks_saas: 'MAILERLITE_GROUP_SAAS_ID',
  hooks_ecommerce: 'MAILERLITE_GROUP_ECOMMERCE_ID',
  risk_free_applications: 'MAILERLITE_GROUP_RISK_FREE_ID',
  referral_partners: 'MAILERLITE_GROUP_REFERRALS_ID',
  marketing: 'MAILERLITE_GROUP_MARKETING_ID',
}
const SERVICE_GROUPS = ['hooks_saas', 'hooks_ecommerce', 'risk_free_applications', 'referral_partners']

/* The ONLY network function. GET, nothing else. */
async function get(url, token, fetchImpl) {
  const res = await fetchImpl(url, { method: 'GET', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  if (res.status === 429) {
    const err = new Error('rate_limited')
    err.retry = true
    throw err
  }
  if (res.status !== 200) throw new Error(`MailerLite answered ${res.status} for GET ${url.replace(API, '')}`)
  return res.json()
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function* pages(path, token, fetchImpl, delayMs) {
  let cursor = null
  for (;;) {
    const sep = path.includes('?') ? '&' : '?'
    const url = `${API}${path}${sep}limit=${PAGE}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
    let body
    for (let attempt = 0; ; attempt++) {
      try {
        body = await get(url, token, fetchImpl)
        break
      } catch (e) {
        if (!e.retry || attempt >= 4) throw e
        await sleep(delayMs * 4)
      }
    }
    yield body.data || []
    cursor = body.meta?.next_cursor || null
    if (!cursor) return
    if (delayMs) await sleep(delayMs)
  }
}

export function classify(sub, memberOf, hasConsentRecord) {
  if (['unsubscribed', 'bounced', 'junk'].includes(sub.status)) return 'suppressed'
  if (hasConsentRecord) return 'consent_recorded'
  if (memberOf.includes('marketing')) return 'marketing_group_only'
  if (memberOf.some((g) => SERVICE_GROUPS.includes(g))) return 'service_only'
  return 'no_known_group'
}

export async function runAudit({ token, env = {}, fetchImpl = globalThis.fetch, delayMs = 550, onProgress = () => {} }) {
  if (!token) throw new Error('MAILERLITE_API_TOKEN is required')
  const groupIds = {}
  for (const [name, envKey] of Object.entries(GROUP_ENVS)) if (/^\d+$/.test(String(env[envKey] || '').trim())) groupIds[name] = String(env[envKey]).trim()

  // 1. who is in each known group (ids only)
  const membership = new Map() // subscriber id -> [group names]
  for (const [name, id] of Object.entries(groupIds)) {
    for await (const batch of pages(`/groups/${id}/subscribers`, token, fetchImpl, delayMs)) {
      for (const s of batch) membership.set(String(s.id), [...(membership.get(String(s.id)) || []), name])
      onProgress(`group ${name}: ${membership.size} subscribers so far`)
    }
  }

  // 2. every subscriber: status + consent fields
  const counts = { total: 0, byStatus: {}, byCategory: {}, consentRecordNotInMarketingGroup: 0 }
  const rows = []
  for await (const batch of pages('/subscribers', token, fetchImpl, delayMs)) {
    for (const s of batch) {
      const memberOf = membership.get(String(s.id)) || []
      const hasRecord = s.fields?.marketing_consent === 'opted_in'
      const category = classify(s, memberOf, hasRecord)
      counts.total += 1
      counts.byStatus[s.status] = (counts.byStatus[s.status] || 0) + 1
      counts.byCategory[category] = (counts.byCategory[category] || 0) + 1
      if (hasRecord && category !== 'suppressed' && !memberOf.includes('marketing')) counts.consentRecordNotInMarketingGroup += 1
      rows.push({ email: s.email, status: s.status, groups: memberOf.join('|'), category })
    }
    onProgress(`subscribers read: ${counts.total}`)
  }

  // 3. promotional campaigns already SENT (read-only)
  let sentCampaigns = null
  try {
    sentCampaigns = 0
    for await (const batch of pages('/campaigns?filter[status]=sent', token, fetchImpl, delayMs)) sentCampaigns += batch.length
  } catch {
    sentCampaigns = null // some tokens cannot read campaigns; reported as "unknown"
  }
  return { counts, rows, sentCampaigns, groupsConfigured: Object.keys(groupIds), groupsMissing: Object.keys(GROUP_ENVS).filter((g) => !groupIds[g]) }
}

export function summary(result) {
  const { counts, sentCampaigns, groupsMissing } = result
  const lines = [`Subscribers read: ${counts.total}`, '', 'By MailerLite status:']
  for (const [k, v] of Object.entries(counts.byStatus)) lines.push(`  ${k}: ${v}`)
  lines.push('', 'By consent evidence (see the script header for the meaning):')
  for (const k of ['consent_recorded', 'marketing_group_only', 'service_only', 'no_known_group', 'suppressed']) lines.push(`  ${k}: ${counts.byCategory[k] || 0}`)
  lines.push('', `Consent record but NOT in the marketing group: ${counts.consentRecordNotInMarketingGroup}`)
  lines.push(`Promotional campaigns already sent: ${sentCampaigns === null ? 'unknown (token cannot read campaigns)' : sentCampaigns}`)
  if (groupsMissing.length) lines.push('', `Not audited (group id env var not set): ${groupsMissing.join(', ')}`)
  lines.push('', 'Nothing was changed in MailerLite. Only GET requests were sent.')
  return lines.join('\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const csvIdx = process.argv.indexOf('--csv')
  const csvPath = csvIdx > -1 ? process.argv[csvIdx + 1] : null
  runAudit({ token: process.env.MAILERLITE_API_TOKEN, env: process.env, onProgress: (m) => console.error(m) })
    .then((r) => {
      console.log(summary(r))
      if (csvPath) {
        const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
        fs.writeFileSync(csvPath, ['email,status,groups,category', ...r.rows.map((x) => [x.email, x.status, x.groups, x.category].map(esc).join(','))].join('\n'), { mode: 0o600 })
        console.log(`\nCSV written to ${csvPath} (contains personal data: keep private, do not commit, delete when finished).`)
      }
    })
    .catch((e) => {
      console.error(`Audit failed: ${e.message}`)
      process.exit(1)
    })
}
