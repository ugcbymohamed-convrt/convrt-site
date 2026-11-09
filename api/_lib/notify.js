/* ─────────────────────────────────────────────
   Owner alerts: one email to the CONVRT owner per saved lead, sent through
   Resend (POST https://api.resend.com/emails). Shared by the free-video
   application (apply.js) and the free-hooks signup (subscribe.js).

   • Entirely optional: with no RESEND_API_KEY nothing is sent and nothing changes.
   • Best-effort: the lead is already safe in MailerLite by the time this runs, so
     a failure is logged (no personal data) and never shown to the visitor or
     turned into an error.
   • Awaited with a short timeout (serverless functions are frozen once they
     respond, so a fire-and-forget request could be dropped).
   • Reply-To is the lead's email, so "Reply" in the inbox goes straight to them.

   Env (Vercel): RESEND_API_KEY (secret) · NOTIFY_EMAIL_TO (default below) ·
   NOTIFY_EMAIL_FROM (default below; Resend's shared sender only delivers to the
   Resend account owner's own address — verify convrt.studio in Resend to lift that).
───────────────────────────────────────────── */

export const RESEND_ENDPOINT = 'https://api.resend.com/emails'
export const DEFAULT_NOTIFY_TO = 'mohamed@convrt.studio'
export const DEFAULT_NOTIFY_FROM = 'CONVRT Site <onboarding@resend.dev>'
const NOTIFY_TIMEOUT_MS = 4000

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const oneLine = (s) => String(s).replace(/[\r\n]+/g, ' ').trim()

/* @param {{ subject: string, title: string, rows: [string, string][], footer: string, replyTo?: string }} alert */
export function buildAlert(alert, env = process.env) {
  const { subject, title, rows, footer, replyTo } = alert
  const text = [title, '', ...rows.map(([k, v]) => `${k}: ${v}`), '', footer].join('\n')
  const html =
    `<p><strong>${esc(title)}</strong></p>` +
    '<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">' +
    rows.map(([k, v]) => `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('') +
    '</table>' +
    `<p style="color:#666;font-size:12px">${esc(footer)}</p>`

  const out = {
    from: String(env.NOTIFY_EMAIL_FROM || '').trim() || DEFAULT_NOTIFY_FROM,
    to: [String(env.NOTIFY_EMAIL_TO || '').trim() || DEFAULT_NOTIFY_TO],
    subject: oneLine(subject).slice(0, 150),
    text,
    html,
  }
  if (replyTo) out.reply_to = replyTo
  return out
}

/* `log(kind, detail)` is the caller's own logger so log lines keep their prefix. */
export async function sendOwnerAlert(alert, { env = process.env, fetchImpl = globalThis.fetch, log = () => {} } = {}) {
  const key = String(env.RESEND_API_KEY || '').trim()
  if (!key) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), NOTIFY_TIMEOUT_MS)
  try {
    const res = await fetchImpl(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAlert(alert, env)),
      signal: controller.signal,
    })
    if (res.status >= 200 && res.status < 300) return true
    log('notify_failed', { status: res.status })
  } catch (err) {
    log('notify_error', { name: err?.name })
  } finally {
    clearTimeout(timer)
  }
  return false
}
