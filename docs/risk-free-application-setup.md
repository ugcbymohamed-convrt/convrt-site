# /risk-free-trial — application setup

Flow: **visitor applies → application saved to MailerLite → you review manually → you invite good-fit brands to a call.**
Nothing is auto-approved and the page never shows a booking link. There is no minimum ad spend.

```
Browser ──POST {answers, contact}──▶ /api/risk-free-apply (Vercel function)
                                        │  validation shared with the form (src/lib/riskFreeQuestions.js)
                                        ▼
                      POST https://connect.mailerlite.com/api/subscribers
                      { email, fields: {...}, groups: [MAILERLITE_GROUP_RISK_FREE_ID] }
```

## 1. In MailerLite

1. **Create a group** called `CONVRT — Free Video Applications`. Copy its numeric ID (the number in the group URL).
2. **Create these custom fields** (Subscribers → Fields). The keys must match exactly or MailerLite rejects the
   save and the form shows a "something went wrong" message (details in the Vercel function logs):

   | Field key | Holds |
   |---|---|
   | `website` | Company website (normalised to `https://…`) |
   | `business_type` | Q1 |
   | `ad_spend` | Q2 |
   | `videos_per_month` | Q3 |
   | `video_type` | Q4 |
   | `timeline` | Q5 |
   | `ongoing_interest` | Q6 |
   | `brief` | Optional "what would you like to create" (text) |

   The applicant's full name is saved in MailerLite's built-in `name` field.
3. **Do not attach a welcome/"you're approved" automation to this group.** The on-page confirmation already
   tells applicants they'll hear from you only if there is a fit. Review applications by opening the group.
4. Double opt-in for API signups (Account settings → Subscribe settings) is account-wide. If it is on, applicants
   show as *unconfirmed* in the group — they are still saved and visible to you.

## 2. In Vercel (Project → Settings → Environment Variables)

| Variable | Required | |
|---|---|---|
| `MAILERLITE_API_TOKEN` | yes | Already set for `/free-hooks` |
| `MAILERLITE_GROUP_RISK_FREE_ID` | yes | The group ID from step 1 |

Redeploy afterwards. Until both exist the endpoint answers `503` and the form shows an error — it never shows a
false "Application received!". Local dev: add the same variables to `.env.local`; `npm run dev` serves the real
handler at `/api/risk-free-apply`.

### Optional: instant email alert for every application (and every free-hooks signup)

The same `RESEND_API_KEY` also alerts you to every `/free-hooks` signup (email, industry, new/repeat, confirmed or
not, tips-and-offers consent). Code: `api/_lib/notify.js`.

Each saved application can also email `mohamed@convrt.studio` (name, email, website, every answer; **Reply** goes
to the applicant). It uses [Resend](https://resend.com) and is off until the key exists.

1. Create a free Resend account **with the email address that should receive the alerts**
   (`mohamed@convrt.studio`), then Resend → API Keys → Create (sending access).
2. Vercel → Environment Variables → add `RESEND_API_KEY` (Production), redeploy.
3. That's all for the default sender (`onboarding@resend.dev`), which Resend only delivers to the account owner's own
   address. To send from your own domain instead (or to several people): Resend → Domains → add `convrt.studio`
   (add the DNS records it shows), then set `NOTIFY_EMAIL_FROM` (e.g. `CONVRT <apply@convrt.studio>`) and,
   if needed, `NOTIFY_EMAIL_TO`.

| Variable | Required | |
|---|---|---|
| `RESEND_API_KEY` | for alerts | Secret. Without it nothing is sent and nothing else changes |
| `NOTIFY_EMAIL_TO` | no | Default `mohamed@convrt.studio` |
| `NOTIFY_EMAIL_FROM` | no | Default `CONVRT Site <onboarding@resend.dev>` |

The alert goes out for **every genuine submission**, including ones MailerLite could not save (service down, not
configured, rate-limited, or a contact that previously unsubscribed). Those arrive with `[NOT SAVED]` in the subject so
you can follow up by email and no address is lost. Bots (honeypot) and incomplete/invalid submissions are not
alerted. The alert itself is best-effort: if Resend fails the visitor's experience is unchanged (the failure is
logged without personal data). MailerLite stays the source of truth.

## 3. Behaviour

- **Repeat applications** from the same email update that contact's answers; no duplicate is created.
- **Unsubscribed / bounced / junk** emails can't be re-added by API; the form tells them to email you instead.
- **Spam protection:** hidden honeypot, same-origin check, strict server-side validation (same rules as the form).
- **Analytics** (via `src/lib/analytics.js`): `risk_free_page_view`, `risk_free_apply_click`,
  `risk_free_form_started`, `risk_free_application_submitted`, `risk_free_application_success`,
  `risk_free_application_error`. Never any answers, names or emails.
- **SEO gate:** the page is `noindex` until `RISK_FREE_INDEXABLE = true` in `src/config.js`.

## 4. Launch checklist

- [ ] Group, custom fields and both env vars created; redeployed
- [ ] Submit a real test application → contact appears in the group with every field filled
- [ ] Submit the same email again → no error, answers updated
- [ ] Confirm no automation emails the applicant
- [ ] (If using alerts) test application → email arrives at mohamed@convrt.studio
- [ ] Privacy policy published and `PRIVACY_POLICY_URL` set
- [ ] Flip `RISK_FREE_INDEXABLE`

## 5. Tests

`node --test tests/risk-free-apply.test.mjs` (fake MailerLite and Resend, no network).
