# /referrals — Referral Partner Program setup

Flow: **visitor joins (and optionally introduces a brand) → saved to MailerLite + emailed to you → you review manually →
you reply and agree the final conditions before they start referring.**
Nothing is auto-approved, no booking link is shown, no approval email is sent and nothing promises or triggers a payment.

```
Browser ──POST {contact, program, optional referral, consent}──▶ /api/referral-apply (Vercel function)
                                   │  validation shared with the form (src/lib/referralProgram.js)
                                   ▼
          POST https://connect.mailerlite.com/api/subscribers
          { email, fields: {...}, groups: [MAILERLITE_GROUP_REFERRALS_ID] }
                                   ▼  (always, best-effort)
          POST https://api.resend.com/emails  → mohamed@convrt.studio   (api/_lib/notify.js)
```

## 1. In MailerLite

1. **Create a group** called `CONVRT — Referral Partner Applications`. Copy its numeric ID (the number in the group URL).
2. **Create these custom fields** (Subscribers → Fields, type *Text*). The keys must match exactly or MailerLite rejects
   the save, the form shows "something went wrong" and you get a `[NOT SAVED]` email (details in the Vercel function logs):

   | Field key | Holds |
   |---|---|
   | `partner_type` | Existing client · Agency · Consultant · Creator · Founder · Other |
   | `referral_program` | `Standard Referral` or `Agency / Strategic Partner` |
   | `partner_company` | Company / agency name (only written when provided) |
   | `partner_website` | Website or LinkedIn profile, normalised to `https://…` (only when provided) |
   | `referred_company` | Referred company name (only when provided) |
   | `referred_website` | Referred company website (only when provided) |
   | `referral_notes` | Short description of the opportunity (only when provided; up to 1,000 characters) |

   The partner's full name goes in MailerLite's built-in `name` field.
3. **Do not attach a welcome / "you're approved" automation to this group.** The on-page confirmation already says
   they'll hear from you after review.
4. Double opt-in for API signups (Account settings → Subscribe settings) is account-wide. If it is on, partners show as
   *unconfirmed* in the group; they are still saved and visible.

**How existing subscribers are treated.** The endpoint sends only `name`, `partner_type`, `referral_program` and the
optional fields the partner actually filled in, plus the group. Blank optional answers are **not** sent, groups are
additive, and no `status` is ever sent. So a contact who is already in MailerLite (e.g. a free-video applicant) keeps all
their other fields and groups; unsubscribed / bounced / junk contacts cannot be re-added by the form (the partner is told
to email you, and you get a `[NOT SAVED]` email).

## 2. In Vercel (Project → Settings → Environment Variables)

| Variable | Required | |
|---|---|---|
| `MAILERLITE_API_TOKEN` | yes | Already set for `/free-hooks` and `/risk-free-trial` |
| `MAILERLITE_GROUP_REFERRALS_ID` | **yes, new** | The group ID from step 1 |
| `RESEND_API_KEY` | for the email alert | Already used by the other forms. Secret. Without it **no email is sent and form submissions still work** |
| `NOTIFY_EMAIL_TO` | no | Default `mohamed@convrt.studio` |
| `NOTIFY_EMAIL_FROM` | no | Default `CONVRT Site <onboarding@resend.dev>` (Resend's shared sender only delivers to the Resend account owner's address; verify `convrt.studio` in Resend to lift that) |

Redeploy afterwards. Until the token and group ID exist the endpoint answers `503` and the form shows an error; it never
shows a false "Application received!". Local dev: add the variables to `.env.local`; `npm run dev` serves the real handler
at `/api/referral-apply`. **Never prefix any of these with `VITE_`**: that would ship them to the browser.

## 3. The owner email (Resend)

Sent to `mohamed@convrt.studio` for every genuine submission (honeypot bots and invalid input are excluded). **Reply** goes
straight to the partner. It contains: name, email, partner type, program, company / agency, website / LinkedIn, referred
company, referred website, opportunity notes, submission timestamp (UTC) and whether it was saved to MailerLite.

* If MailerLite could not save it, the subject starts with `[NOT SAVED]` and says why: follow up by email. (Same policy as
  the other forms: no address typed into a form is ever lost.)
* An email failure never changes what the partner sees: a saved application still returns success.

## 4. Recording individual referrals (manual process — no database)

MailerLite holds **one record per email address**, so it can't track several referrals from the same partner: the
`referred_*` fields always show the *latest* referral only. **The owner email is the complete per-referral record.** Until
there is a CRM, keep this simple:

1. Create a Google Sheet **"CONVRT Referrals"** with one row **per referral** (not per partner) and these columns:

   | Column | Notes |
   |---|---|
   | Date received | from the email timestamp |
   | Partner name / email | |
   | Partner type · Program | |
   | Partner approved? | Yes / No / Pending (agency partners always start as *Pending*) |
   | Terms confirmed with partner? | date; **no referrals count before this** |
   | Referred company · website | |
   | Already in our pipeline? | checked on receipt; if yes, note the date of first contact |
   | Status | `New` → `Reviewing` → `Contacted` → `Not a fit` / `Won` / `Lost` / `Excluded` |
   | First qualifying payment cleared (date, amount ex. tax) | |
   | Reward | `$150` or `10%` figure, once eligible |
   | Reward paid (date, method) | |

2. On each `New referral` email: add a row, check it against your pipeline (attribution is yours to confirm), and reply to
   the partner. If a partner submits a second referral, MailerLite is overwritten but you get a new email: add a new row.
3. In MailerLite, move approved partners to a second group (e.g. `Referral Partners — Approved`) so the application group
   stays your inbox of un-reviewed applications.
4. When a CRM is introduced later, this sheet is the import file.

## 5. Behaviour and protections

* **Duplicate submits:** blocked client-side (synchronous in-flight guard + disabled button); a repeat from the same email
  updates that contact, it never creates a duplicate.
* **Spam:** hidden honeypot field (`hpCheck`; deliberately *not* called `company`, which browsers autofill, and this form
  has a real company field), same-origin check, strict server-side validation (the same rules as the form), 16 KB body cap.
* **Third-party data:** the form has no field for a referred person's name, email or phone, and the free-text fields reject
  anything that looks like an email address or phone number. Partners are told contact details will be requested later
  "with the right permission".
* **Consent:** a required checkbox (the server rejects submissions without it). It currently has **no privacy-policy link**
  (see launch checklist).
* **Analytics** (`src/lib/analytics.js`): `referrals_page_view`, `referrals_apply_click`, `referrals_how_it_works_click`,
  `referrals_form_started`, `referrals_application_submitted`, `referrals_application_success`,
  `referrals_application_error`. Never any names, emails or referral details.
* **SEO gate:** the page is `noindex` until `REFERRALS_INDEXABLE = true` in `src/config.js`. Canonical, Open Graph / Twitter
  tags and FAQPage structured data (generated from the visible FAQ) are already in place.

## 6. ⚠ Needs legal / business review before launch

The on-page **Terms & eligibility** block and the FAQ are a plain-language summary, **not** a legal agreement. Please have
them reviewed (and decide the open points below) before flipping `REFERRALS_INDEXABLE` or promoting the page:

1. Whether a short written partner agreement is needed before anyone is paid (the page says "final conditions are
   communicated and confirmed before a partner starts referring").
2. **Payout timing, payment method, attribution window, minimum project size** — deliberately *not* stated anywhere on the
   page; they are agreed per partner. Decide your defaults so replies are consistent.
3. How "remains non-refundable" is defined (refund period) for the clawback wording.
4. **The 10% agency commission** is on the first eligible project payment only. Confirm how "eligible", "pass-through
   costs" and multi-payment first projects are treated.
5. **Tax / payout compliance:** collecting tax details (W-8/W-9 or local equivalents) and paying partners in other
   countries.
6. **Platform / advertiser rules:** referral rewards may need disclosure in some jurisdictions and can't involve
   fake or incentivised reviews. Partners should not misrepresent CONVRT.
7. **Privacy:** there is **no privacy policy page on the site yet** (`PRIVACY_POLICY_URL` in `src/config.js` is empty), so the
   consent checkbox has no link. Publish one and set that constant; the checkbox picks it up automatically. The policy
   should name MailerLite and Resend as processors and cover partner details and referral notes.
8. The credibility line on the hero uses only the **"750+ creatives produced"** figure already published in the homepage
   Founder section. Re-confirm it is current.

## 7. Launch checklist

- [ ] MailerLite group + the 7 custom fields created; `MAILERLITE_GROUP_REFERRALS_ID` set in Vercel; redeployed
- [ ] `RESEND_API_KEY` present (already used by the other forms) — test email arrives at mohamed@convrt.studio
- [ ] **You** submit one real test application on the Preview: contact appears in the group with every field filled
- [ ] Submit the same email again with no referral → earlier `referred_*` values are still there
- [ ] Confirm no automation emails the partner
- [ ] Referral tracking sheet created (section 4)
- [ ] Legal review of the terms / FAQ (section 6) and privacy policy published; `PRIVACY_POLICY_URL` set
- [ ] Flip `REFERRALS_INDEXABLE` to `true`

## 8. Tests

`node --test tests/*.test.mjs` (fake MailerLite and Resend, no network, no real credentials). Referral tests:
`tests/referral-apply.test.mjs` — validation, third-party contact-detail rejection, reward-card preselection, MailerLite
group + custom-field mapping, blank-field handling, owner email content, email-failure isolation, `[NOT SAVED]` alerts,
handler guards, and checks that no secret appears in `src/` or in the built bundle (run after `npm run build`).
