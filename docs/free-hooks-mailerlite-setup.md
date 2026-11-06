# /free-hooks — MailerLite setup

Flow: **/free-hooks → choose SaaS or E-commerce → enter email → MailerLite delivers the matching library.**
The website never sends the PDF. It only adds the subscriber to the right MailerLite group; a MailerLite automation sends the email.

```
Browser ──POST {industry,email,marketingConsent}──▶ /api/free-hooks-subscribe (Vercel function)
                                                       │  Bearer token from env, never in the browser
                                                       ▼
                                  POST https://connect.mailerlite.com/api/subscribers
                                  { email, groups: [<group id for the industry>] }
                                                       ▼
                         MailerLite automation: "joins group" → email with the hooks PDF
```

## 1. Values you must provide (Vercel → Project → Settings → Environment Variables)

| Variable | Required | What it is |
|---|---|---|
| `MAILERLITE_API_TOKEN` | yes | MailerLite → Integrations → API → *Generate new token*. Secret. Server-only. |
| `MAILERLITE_GROUP_SAAS_ID` | yes | Numeric ID of the group **CONVRT — SaaS Hooks** |
| `MAILERLITE_GROUP_ECOMMERCE_ID` | yes | Numeric ID of the group **CONVRT — E-commerce Hooks** |
| `MAILERLITE_GROUP_MARKETING_ID` | optional | Group for people who tick the optional "tips and offers" box (see §3) |

Set them for Production (and Preview if you want to test on preview URLs), then **redeploy** — env changes don't affect existing deployments.
Never prefix them with `VITE_`. Group IDs: open the group in MailerLite; the ID is the number in the URL, or call `GET https://connect.mailerlite.com/api/groups`.
Local dev: copy `.env.example` to `.env.local` (git-ignored). `npm run dev` serves the real handler at `/api/free-hooks-subscribe`.

Until these are set the form shows a friendly error and the endpoint answers `503` — it never shows a false success.

## 2. Configure inside MailerLite

1. **Create two groups:** `CONVRT — SaaS Hooks` and `CONVRT — E-commerce Hooks` (+ optionally `CONVRT — Marketing Consent`).
2. **Upload the two PDFs / host them** (MailerLite file manager or your own host) — the website does not host them.
   Approved sources used for the on-page previews: `CONVRT_10_SaaS_AI_SaaS_Hooks_Corrected.pdf` and `CONVRT_10_Ecommerce_Triple_Hooks.pdf`.
   (`…SaaS_Hooks_Updated.pdf` has identical text; `…SaaS_Triple_Hooks.pdf` is older — different cover and hook 04 visual. Confirm which SaaS file is final.)
3. **Create two automations** (Automations → trigger *"When subscriber joins a group"*):
   - SaaS group → send the *SaaS hooks* email containing the download link.
   - E-commerce group → send the *E-commerce hooks* email.
   The email is the resource delivery. Keep it free of promotional content.
4. **Opt-in mode** — Account settings → Subscribe settings → **"Double opt-in for API and integrations"**:
   - **On (recommended for EU/UK/CA audiences):** new signups are `unconfirmed`, MailerLite sends its confirmation email, and *automations do not run until the person confirms*. The page tells them "one more step — click the link". Customise that confirmation email (it is shared by all API signups) so it mentions the hooks.
   - **Off:** signups are `active` immediately and the automation fires at once.
   The site deliberately does not send a `status`; the account setting decides, and the page reads the status MailerLite returns.
5. **Test** with a real address in each group (see checklist below).

## 3. Consent model (marketing separate from delivery)

- Submitting the form = a request to be emailed the resource. The form says so, names MailerLite as the processor, and links the privacy policy once `PRIVACY_POLICY_URL` is set.
- The checkbox *"Also send me occasional creative tips and offers"* is **unticked by default** and optional.
- If ticked **and** `MAILERLITE_GROUP_MARKETING_ID` is set, the subscriber is also added to that group. Build any newsletter / nurture automations on **that group only**, so non-consenting people only ever receive the delivery email.
- Without `MAILERLITE_GROUP_MARKETING_ID` the tick has no effect — set it, or remove the checkbox, before relying on consent.

## 4. Behaviour you should know

- **Duplicates:** MailerLite upserts (`201` new / `200` existing). Groups are additive, so someone who takes both libraries ends up in both groups. A repeat signup for a group they're already in is treated as success, but "joins a group" automations don't fire twice, so no second email is sent; the success screen tells them to check spam / the earlier email / contact us. The site does not reveal whether an address already existed.
- **Unsubscribed / bounced / junk contacts** can't be re-added through the API (MailerLite policy). The form shows an "email us" message instead of a false success.
- **Errors:** invalid email → inline message; MailerLite `429` → "try again shortly"; `401/403` (bad token), network/5xx/timeouts (8 s) → generic "something went wrong" (details go to Vercel function logs, never the browser; logs never contain emails or the token).
- **Spam protection:** hidden honeypot field, same-origin check, strict server validation. No rate limiting beyond MailerLite's own (no database allowed). Add Vercel Firewall rate-limit rules on `/api/free-hooks-subscribe` and/or Cloudflare Turnstile if abuse appears.
- **Analytics** (via `src/lib/analytics.js` → `dataLayer` / Meta Pixel if present): `hooks_page_view`, `hooks_industry_selected`, `hooks_form_started`, `hooks_signup_submitted`, `hooks_signup_success`, `hooks_signup_error`. Params: `industry`, `location`, `reason` (error category). Never the email.
- **SEO gate:** the page is `noindex` until `FREE_HOOKS_INDEXABLE = true` in `src/config.js`.

## 5. Launch checklist

- [ ] Env vars set in Vercel and redeployed
- [ ] Two groups + two automations active; both PDFs/links verified
- [ ] SaaS signup → correct email received → link opens the SaaS PDF
- [ ] E-commerce signup → correct email → E-commerce PDF
- [ ] Double opt-in behaviour matches the setting chosen in §2.4
- [ ] Same address signing up twice → no error, sensible result
- [ ] Same address taking both industries → in both groups, receives both emails
- [ ] Privacy policy published and `PRIVACY_POLICY_URL` set in `src/config.js`
- [ ] MailerLite sender domain authenticated (SPF/DKIM) so delivery lands in the inbox
- [ ] Flip `FREE_HOOKS_INDEXABLE`, then share the link on Instagram / LinkedIn / outreach

## 6. Tests

`node --test tests/free-hooks-subscribe.test.mjs` — 12 tests against a fake MailerLite (no network/credentials): group routing, token header, no `status` sent, double opt-in, duplicates, unsubscribed contacts, consent group, validation, honeypot, missing config, upstream error mapping, origin guard, handler method/origin/body handling.
