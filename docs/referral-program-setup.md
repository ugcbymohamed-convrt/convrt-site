# /referrals — Referral Partner Program (V2): setup and operations

Flow: **visitor registers → saved to MailerLite + emailed to you → you review manually → if approved you send the
partner kit by hand → the partner introduces brands → you qualify and sell → a reward is paid manually when every
condition is met.**
Nothing is auto-approved, no booking link is shown, no approval / kit email is sent automatically and nothing promises
or triggers a payment. The only automation is *saving the registration* and *alerting you*.

```
Browser ──POST {name, email, partner type, program, company?, website?, consent}──▶ /api/referral-apply (Vercel function)
                                   │  validation shared with the form (src/lib/referralProgram.js)
                                   ▼
          POST https://connect.mailerlite.com/api/subscribers
          { email, fields: {...}, groups: [MAILERLITE_GROUP_REFERRALS_ID] }
                                   ▼  (always, best-effort)
          POST https://api.resend.com/emails  → mohamed@convrt.studio   (api/_lib/notify.js)
```

## 1. The offer (as built on the page)

| | Standard Referral Partner | Agency & Strategic Partner |
|---|---|---|
| Reward | **$150** per eligible referral, cash **or** production credit | **10%** of the first qualifying project payment |
| Nature | One-time, no recurring commission, no cap on eligible referrals | One-time, excludes taxes, refunds and pass-through costs |
| Approval | Application reviewed by CONVRT | Explicit CONVRT approval required before participating |
| Combining | The two structures can't automatically be combined | White-label / reseller / recurring deals need a separate agreement |

**For the referred brand: the FREE Creative Upgrade** = two additional ready-to-test video ad variations on the first
qualifying **paid** video project. Edit-based (new hooks, openings, overlays, CTA endings, alternative edits from the
approved assets). Not a new production: no extra filming, creator sourcing, shoot days or new concepts. Additional to
the package's standard deliverables, not exchangeable for cash, doesn't automatically stack with the Free Video
Production Trial, and is separate from the Free Roadmap and the 10 Free Hooks. Eligibility and delivery specs are
confirmed before purchase. No results are promised.

## 2. In MailerLite

1. **Create a group** called `CONVRT — Referral Partner Applications`. Copy its numeric ID (the number in the group URL).
2. **Create these custom fields** (Subscribers → Fields, type *Text*). The keys must match exactly or MailerLite rejects
   the save, the form shows "something went wrong" and you get a `[NOT SAVED]` email (details in the Vercel function logs):

   | Field key | Holds |
   |---|---|
   | `partner_type` | Existing CONVRT client · Marketing agency · Consultant · UGC creator / video professional · Founder / entrepreneur · Other |
   | `referral_program` | `Standard Referral Partner` or `Agency & Strategic Partner` |
   | `partner_company` | Company / agency name (only written when provided) |
   | `partner_website` | Website or LinkedIn profile, normalised to `https://…` (only when provided) |

   The partner's full name goes in MailerLite's built-in `name` field. (V1 of this page also used `referred_*` and
   `referral_notes` fields. They are no longer written, so you don't need to create them.)
3. **Do not attach a welcome / "you're approved" automation to this group.** The on-page confirmation already says you
   will review the application.
4. Double opt-in for API signups (Account settings → Subscribe settings) is account-wide. If it is on, partners show as
   *unconfirmed* in the group; they are still saved and visible.

**How existing subscribers are treated.** The endpoint sends only `name`, `partner_type`, `referral_program` and the
optional fields the partner actually filled in, plus the group. Blank optional answers are **not** sent, groups are
additive, and no `status` is ever sent. So a contact who is already in MailerLite (e.g. a free-video applicant) keeps all
their other fields and groups; unsubscribed / bounced / junk contacts cannot be re-added by the form (the partner is told
to email you, and you get a `[NOT SAVED]` email).

## 3. In Vercel (Project → Settings → Environment Variables)

| Variable | Required | |
|---|---|---|
| `MAILERLITE_API_TOKEN` | yes | Already set for `/free-hooks` and `/risk-free-trial` |
| `MAILERLITE_GROUP_REFERRALS_ID` | **yes, new** | The group ID from step 2 |
| `RESEND_API_KEY` | for the email alert | Already used by the other forms. Secret. Without it **no email is sent and form submissions still work** |
| `NOTIFY_EMAIL_TO` | no | Default `mohamed@convrt.studio` |
| `NOTIFY_EMAIL_FROM` | no | Default `CONVRT Site <onboarding@resend.dev>` (Resend's shared sender only delivers to the Resend account owner's address; verify `convrt.studio` in Resend to lift that) |

Redeploy afterwards. Until the token and group ID exist the endpoint answers `503` and the form shows an error; it never
shows a false confirmation. Local dev: add the variables to `.env.local`; `npm run dev` serves the real handler at
`/api/referral-apply`. **Never prefix any of these with `VITE_`**: that would ship them to the browser.

## 4. The owner email (Resend)

Sent to `mohamed@convrt.studio` for every genuine submission (honeypot bots and invalid input are excluded). **Reply** goes
straight to the partner. It contains: name, email, partner type, program, company / agency, website / LinkedIn, the
submission timestamp (UTC), whether it was saved to MailerLite, and the **MailerLite subscriber ID** (use it as the
partner ID in the tracker).

* If MailerLite could not save it, the subject starts with `[NOT SAVED]` and says why: follow up by email. (Same policy as
  the other forms: no address typed into a form is ever lost.)
* An email failure never changes what the partner sees: a saved application still returns success.

## 5. Partner onboarding (manual, six stages)

1. **Registration.** The form saves the partner to MailerLite and alerts you.
2. **Manual approval.** You review the application. Standard partners: your judgement. **Agency & Strategic Partners:
   always an explicit decision from you.** Move approved partners to a second MailerLite group (e.g. `Referral Partners —
   Approved`) so the application group stays your inbox of un-reviewed applications.
3. **Partner kit.** Send `docs/partner-kit.md` section A (approval email) plus B–G by email, by hand. Fill in the agreed
   program, payment method and timing for that partner. Don't send a Calendly link.
4. **First referral.** The partner introduces a brand (warm email, LinkedIn, direct introduction) and emails you the
   company name and website. There is **no public referral form and no referral link/code** in V1.
5. **Qualification and sale.** You qualify the prospect and run the sales conversation. Check it against your pipeline
   first (see attribution below).
6. **Reward.** When every condition is met you pay the reward yourself (or issue the production credit). Nothing is
   automated and nothing on the site triggers a payment.

## 6. Tracking individual referrals (manual: no database added)

**Why not MailerLite?** MailerLite keeps one record per email address and its custom fields hold one value each, so a
partner with several referrals would overwrite their own history. V2 therefore stores **partners only** in MailerLite and
tracks **referrals** separately. Your existing infrastructure (MailerLite + Resend) has no reliable per-referral store,
and the brief asked not to add a database or subscription without approval, so the recommendation is a simple sheet:

1. Create a Google Sheet **"CONVRT Referrals"** and import `docs/referral-tracker-template.csv` (header row only; it has
   no sample data). **One row per referral, never per partner.** Never overwrite a row: a partner's second referral is a
   new row.
2. **Referral ID**: `REF-YYYYMMDD-NN` (date the referral reached you + a running number for that day).
   **Partner ID**: the MailerLite subscriber ID from the owner email.
3. **Statuses** (column *Status*, in order): `Submitted` → `Under Review` → `Accepted` / `Rejected` → `Contacted` →
   `Call Booked` → `Client Won` → `Reward Eligible` → `Reward Paid`.
4. **Attribution decision**: `Pending` / `Accepted` / `Rejected: already in pipeline` / `Rejected: other`, with the
   reason in *Attribution notes*. Check the brand against your pipeline on receipt; if it was already active, note the
   date of first contact.
5. **Reward columns**: reward type (`$150 cash`, `$150 production credit`, `10% agency`), amount, payment status, and the
   date the first qualifying payment cleared (ex. tax; **only when it remains non-refundable**).
6. **Creative Upgrade status**: `Pending confirmation` → `Confirmed` (eligibility and specs agreed before purchase) →
   `Delivered`. Make sure the two variations are additional to the package's standard deliverables.
7. When a CRM is introduced later, this sheet is the import file. A partner-facing dashboard is not planned for V1:
   partners ask you for a status update.

**Operational KPI vs the page's conversion.** The page's *primary conversion* is a **successful partner application**
(`referral_application_success`). The *business KPI* is **qualified referrals that become paying clients**, which lives in
the tracker, not in analytics. Registrations are not revenue.

## 7. Behaviour and protections

* **Duplicate submits:** blocked client-side (synchronous in-flight guard + disabled button); a repeat from the same email
  updates that contact, it never creates a duplicate.
* **Spam:** hidden honeypot field (`hpCheck`; deliberately *not* called `company`, which browsers autofill, and this form
  has a real company field), same-origin check, strict server-side validation (the same rules as the form), 16 KB body cap.
* **Third-party data:** the page collects **no** information about referred people or companies, so there is nothing to
  hold without their permission. Referrals arrive later, by email, from the partner.
* **Consent:** a required checkbox (the server rejects submissions without it). It currently has **no privacy-policy link**
  (see section 9).
* **Analytics** (`src/lib/analytics.js`, no vendor installed, events go to `dataLayer` / `fbq` if the site adds them):
  `referral_page_view`, `referral_cta_click` (with `location`), `referral_form_start`, `referral_application_submit`,
  `referral_application_success`, `referral_application_error`. Never any names, emails or form contents. A click is
  never counted as an application.
* **SEO gate:** the page is `noindex` until `REFERRALS_INDEXABLE = true` in `src/config.js`. Title, description,
  canonical, Open Graph / Twitter tags and FAQPage structured data (generated from the visible FAQ) are in place. No
  social-preview image is set: the site has none, as with the other pages.

## 8. Unchanged on purpose

Free video (`/risk-free-trial`), free hooks and Roadmap pages and their endpoints weren't touched. The shared
`api/_lib/notify.js` and `subscribe.js` are used as they are on `main` (including the "alert on every genuine
submission, `[NOT SAVED]` when MailerLite fails" behaviour). Homepage offers and navigation are unchanged; the only site
change outside this feature is the "Referral Program" footer link and an additive `compact` option and checkbox in
`src/components/forms/fields.jsx`.

## 9. ⚠ Needs your decision / legal review before public launch

The on-page **Terms & eligibility** block and FAQ are a plain-language summary, **not** a legal agreement. They
deliberately state no attribution window, payout deadline or minimum project size. Decide these before promoting the page:

1. **Payout timing and method**, and whether a short **written partner agreement** is needed before anyone is paid.
2. **Attribution window** and how you handle a brand that was already in your pipeline.
3. **Refunds**: what "remains non-refundable" means in practice (refund period), and how a reward is handled if a
   project is refunded or cancelled later.
4. **The 10% commission** on the first project payment: how "eligible", "pass-through costs" and a first project paid in
   several instalments are treated.
5. **Production credit**: where it can be used, whether it expires, whether it can be transferred.
6. **Creative Upgrade**: confirm the exact definition of a "qualifying paid video project" (minimum package / size),
   what "additional to the package" means per package, and the turnaround, and confirm it doesn't stack with the free trial.
7. **"Unlimited eligible introductions"** (the brief's wording) is shown with "eligible" and subject to the program terms.
8. **Tax / payout compliance** (W-8/W-9 or local equivalents; partners in other countries) and the **referral disclosure
   rules** that apply where partners operate (the kit templates include a disclosure line).
9. **Privacy:** there is **no privacy policy page on the site yet** (`PRIVACY_POLICY_URL` in `src/config.js` is empty), so
   the consent checkbox has no link even though the brief asks for one. Publish a policy and set that constant; the link
   appears automatically. It should name MailerLite and Resend as processors.
10. **Testimonials / results:** none are shown. Add verified, permitted client quotes or results later if you want them.
11. **"Share your referral invitation"** (step 1 on the page) refers to the kit's introduction message. There is no
    referral link or code, so attribution is by warm introduction and your own check.

## 10. Launch checklist

- [ ] MailerLite group + the 4 custom fields created; `MAILERLITE_GROUP_REFERRALS_ID` set in Vercel; redeployed
- [ ] `RESEND_API_KEY` present (already used by the other forms): the test email arrives at mohamed@convrt.studio
- [ ] **You** submit one real test application on the Preview: contact appears in the group with every field filled and
      the owner email shows the subscriber ID
- [ ] Submit the same email again with the company left blank: the earlier company is still there
- [ ] Confirm no automation emails the partner
- [ ] Referral tracker sheet created from `docs/referral-tracker-template.csv`
- [ ] Decisions and legal review in section 9; privacy policy published and `PRIVACY_POLICY_URL` set
- [ ] Flip `REFERRALS_INDEXABLE` to `true`

## 11. Tests

`npm test` (= `node --test tests/*.test.mjs`; fake MailerLite and Resend, no network, no real credentials, no real
subscribers). Referral tests: `tests/referral-apply.test.mjs` — validation, partner type / program options, reward-card
preselection, MailerLite group + custom-field mapping, blank-field handling, subscriber states, owner email content,
Resend and MailerLite failures, missing environment variables, handler guards, FAQ / form / page static checks
(accessibility attributes, duplicate-submit guard, analytics names, no invented claims), partner-kit text kept in sync
with `docs/partner-kit.md`, and that no secret appears in `src/` or the built bundle (run `npm run build` first).
Browser behaviour (responsive layout, scroll CTAs, focus, loading state) is checked by hand in the Browser pane, not by an
automated browser suite: the project has none.
