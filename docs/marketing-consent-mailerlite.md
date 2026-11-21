# Marketing email consent and MailerLite: audit, model, and the settings you must make

Branch `trust-privacy-implementation`. Nothing here has been merged, deployed or run against your live MailerLite account. All code tests use a fake MailerLite and a fake Resend (no network, no real contacts, no real emails).

## 1. Audit: what each form really did

| Form | Where it is saved | Marketing group before this change | What the code could and could not do |
|---|---|---|---|
| Free ad hooks (`/free-hooks`) | `MAILERLITE_GROUP_SAAS_ID` or `MAILERLITE_GROUP_ECOMMERCE_ID` (delivery groups) | Only if the visitor ticked the existing optional box **and** `MAILERLITE_GROUP_MARKETING_ID` was set in Vercel. If that variable was missing, a tick was silently dropped. No record of the tick (time, wording) was kept; only the owner alert email said "Yes/No". | The code never added a non-ticker to a marketing group. |
| Free video application (`/risk-free-trial`) | `MAILERLITE_GROUP_RISK_FREE_ID` | None. There was no marketing box. | Applicants were saved to the applications group only. |
| Referral Partner application (`/referrals`) | `MAILERLITE_GROUP_REFERRALS_ID` | None. The one (required) checkbox covered reviewing the application. | Partners were saved to the partners group only. |
| Creative Growth Roadmap | Nowhere (answers stay in the browser); booking goes to Calendly | n/a | No MailerLite. |
| Creator onboarding (private) | Upstash/Cloudflare, owner alert via Resend | n/a | No MailerLite. Its own notice says it will not add creators to any marketing list. |
| Creator Google Form, Calendly | Google / Calendly | n/a | Not site code. |

**Why contacts nevertheless look "automatically subscribed" (my reading; I cannot see your account).** Every form creates an ordinary MailerLite *subscriber* with status *active* (or *unconfirmed* with double opt-in). MailerLite has no separate "marketing list": a campaign can be sent to **All subscribers**, to a group or to a segment. So any active contact, whatever form it came from, is emailable unless every campaign is restricted to a marketing-only group or segment. That is a MailerLite configuration matter, not something the code did. You also confirmed no promotional campaign has been sent, so nothing has been mailed to non-consenting contacts.

## 2. The model now in the code

* **Service groups stay as they are** (hooks, free-video applications, referral partners). They hold the lead or application for the service the person asked for. They are never a marketing audience.
* **One separate marketing group** (`MAILERLITE_GROUP_MARKETING_ID`). A contact is added only when: the visitor ticked the optional box (unchecked by default, never required), the wording version they saw is a known one, and the consent record was written in the same request. If MailerLite rejects the request because of the new fields, the lead is saved **again without** the marketing group and the owner alert says so (fail closed).
* **Consent record** (four MailerLite text fields, written only when the box is ticked): `marketing_consent` = `opted_in`, `marketing_consent_at` = UTC ISO time, `marketing_consent_version` = `v2`, `marketing_consent_source` = `free-hooks-saas`, `free-hooks-ecommerce`, `risk-free-application` or `referral-application`. The exact wording of each version is in `src/content/marketingConsent.js` (immutable; a test pins it). The owner alert email is a second, independent record of the same facts.
* **Declining** writes nothing marketing-related: the form succeeds, the requested resource is delivered by the service-group automation, the owner alert is sent (and says "Not ticked"). A later submission with the box unticked can never overwrite an earlier opt-in. Withdrawal is by unsubscribing (section 6), not by unticking an unrelated form.
* **Unsubscribed / bounced / junk contacts** are never re-activated (the code never sends `status` or `resubscribe`). Hooks: they are told to email us (MailerLite cannot send to them). Applications and referrals: they can still apply; the application reaches you by the Resend email (`[NOT IN MAILERLITE]` in the subject) and the applicant is told it was received. If the Resend email itself fails the form still refuses, so an application is never silently lost.
* **Analytics:** none of this reaches the browser's dataLayer or GA4. Events carry no email, no consent flag and no wording (a test scans the components).
* **Cookie consent is separate.** The cookie banner's "Marketing" switch is about advertising cookies; its text now says marketing emails are a separate choice on the forms.

## 3. What you must configure in MailerLite (I could not and did not)

Do these on the account first; then set the Vercel variable. Until the four fields exist, an opt-in is still handled safely (the lead is saved, the person is **not** added to the marketing group, and you are told) but no consent record is kept.

1. **Subscribers → Fields → Create field**, type **Text**, exact keys: `marketing_consent`, `marketing_consent_at`, `marketing_consent_version`, `marketing_consent_source`.
2. **Subscribers → Groups → Create group**: `CONVRT — Marketing Consent` (reuse it if it already exists and note its ID). Copy the numeric ID from its URL.
3. **Vercel → Project → Settings → Environment Variables**: set `MAILERLITE_GROUP_MARKETING_ID` to that ID for **Preview** now and **Production** only at launch. Redeploy after changing.
4. **Segments → Create segment** `Marketing: recorded consent`: *Group is* `CONVRT — Marketing Consent` **AND** *Field* `marketing_consent` *is* `opted_in` **AND** *Subscriber status is* Active. Use this segment (or the group) for **every** campaign. Never send to *All subscribers*.
5. **Campaign hygiene:** check *Campaigns* (all tabs) that no draft is addressed to *All subscribers*; check *Automations* that none is triggered by a service group other than the hooks delivery email (and that no welcome/nurture sequence hangs off the applications or referral groups).
6. **Account → Subscribe settings → "Double opt-in for API and integrations".** Recommended **ON**: new API contacts get MailerLite's confirmation email and automations wait for confirmation. Effect on the hooks: the hooks email arrives only after they confirm (the page already says "one more step"). Customise the confirmation email so it names the free hooks.
7. **Unsubscribe link:** MailerLite adds it to campaigns; open one hooks automation email and confirm it also has the footer with your business identity and an unsubscribe link (Spanish law, LSSI art. 21 and 22).
8. **API token:** if you use a scoped token, it needs subscribers (read, write), groups (read) and campaigns (read) for the audit script. Rotate it if it has ever been shared.

Verification with a **test address you own**, on the Preview, after the fields and group exist: (a) submit each form without the box → contact in its service group only, no marketing fields; (b) submit with the box → in the service group **and** the marketing group, four fields filled; (c) click unsubscribe in a MailerLite email → status *Unsubscribed*, and re-submitting a form does not reactivate it. Delete the test contact afterwards (section 7).

## 4. Existing contacts: review without changing anything

`scripts/audit-mailerlite-consent.mjs` is **read-only** (only GET requests; a test fails if any write method appears). You run it, because it needs your token:

```bash
MAILERLITE_API_TOKEN=... MAILERLITE_GROUP_SAAS_ID=... MAILERLITE_GROUP_ECOMMERCE_ID=... \
MAILERLITE_GROUP_RISK_FREE_ID=... MAILERLITE_GROUP_REFERRALS_ID=... MAILERLITE_GROUP_MARKETING_ID=... \
node scripts/audit-mailerlite-consent.mjs
```

It prints **counts only**: contacts by status and by consent evidence (`consent_recorded`, `marketing_group_only`, `service_only`, `no_known_group`, `suppressed`), consent records that are not in the marketing group, and how many promotional campaigns have already been **sent**. `--csv <path>` also writes a file (email, status, groups, category) for you; it is personal data, so keep it private and delete it.

How to read it (decisions are yours; nothing is reclassified automatically):

| Category | Evidence | Suggested handling (for your decision) |
|---|---|---|
| `consent_recorded` | The new record (time, version, source) | Marketing-eligible. |
| `marketing_group_only` | Membership of the marketing group only (hooks visitors who ticked the old optional box; wording v1) | Probably marketing-eligible, but the proof is thin (no time, no stored wording). Check the group's join dates and keep the v1 wording (`src/content/marketingConsent.js`) as your evidence. Ask your adviser whether that is enough. |
| `service_only` | None | **Not** marketing-eligible. Do not add them to the marketing group or any campaign. |
| `no_known_group` | Unknown (imports, manual adds) | Not eligible until you can show where they came from. |
| `suppressed` | Unsubscribed, bounced or junk | Never email. |

Do **not** send a "please opt in again" campaign to `service_only` contacts as a workaround: that is itself a promotional email to people who have not consented (Spanish law, LSSI art. 21, has an exception only for an existing customer relationship about similar products). The safe route is an opt-in on the site, or a message that is genuinely about their request, after a legal check. Flagged for your adviser (see Outstanding legal questions).

## 5. Withdrawal and unsubscribe

* Marketing emails: the unsubscribe link sets the contact to *Unsubscribed* account-wide (service emails through MailerLite stop too, which is how MailerLite works).
* By email request: in MailerLite open the contact → *Unsubscribe* (and, if you want a visible trace, set `marketing_consent` to `withdrawn`). Remove them from the marketing group. Do not delete them yet: the unsubscribed record is what stops anyone mailing them again.
* The site never undoes either (no `status`, no `resubscribe`, no group removal).

## 6. Deletion and anonymisation (proposal only; nothing automated, nothing deleted)

* **MailerLite:** the dashboard action *Forget subscriber* (type FORGET) removes the contact and the data are fully deleted after MailerLite's own period (its blog says 30 days; verify with support). A plain *Delete* keeps information in case of re-subscription, so it is **not** erasure. The developer docs describe a "forget" call, but I have not verified the exact endpoint, so use the dashboard until you confirm it. Keep *unsubscribed* contacts you still need to suppress; only forget them when the person asks for erasure and you accept that they could be added again.
* **Suggested manual routine (no job):** each quarter, in MailerLite, filter the applications and referral groups by *Date subscribed* older than 12 months with no later activity, review the list, then forget them. For the hooks delivery groups, the same filter. Marketing group: review addresses that never open.
* **Resend:** has no per-email deletion API; its logs expire on their own schedule (documentation says 30 days on standard plans; verify on your plan) and earlier removal needs a request to Resend.
* **Calendly:** delete the invitee records from the Calendly admin on the same 12-month rule (confirm in the Calendly admin which delete/anonymise options your plan has).
* **GA4:** nothing personal in events; retention 14 months (see `docs/data-retention-and-deletion.md`).

## 6b. What to report back to me

The audit counts, whether the marketing group/ID already exists, and the double opt-in setting you choose. Then the Preview can be tested with your test address.
