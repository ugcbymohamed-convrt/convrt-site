# Data retention: proposed periods and how deletion could be done (proposal only)

**These are proposed policies for legal review, not a statement that deletion processes exist.** No automated deletion job exists or was created, nothing was deleted, and the Privacy draft says so (`[LEGAL REVIEW: ... No automated deletion exists yet]`).

## 1. Proposed periods (in the Privacy draft)
| Data | Proposed period | Where it lives | How deletion could be done safely |
|---|---|---|---|
| Unsuccessful applications and enquiries (free video, referral, hooks delivery contacts, emails) | 12 months after the last meaningful interaction | MailerLite service groups; the owner alert email in your mailbox; Resend logs | MailerLite: manual quarterly review, then *Forget subscriber* (dashboard). Mailbox: delete the alert emails/threads. Resend: its logs expire on their own schedule (~30 days per its docs; verify). |
| Calendly booking records | 12 months unless an ongoing relationship justifies longer | Calendly | Calendly admin: delete/anonymise invitee records on the same quarterly review (confirm your plan's options). |
| Marketing subscribers | Until withdrawal/unsubscription, with a periodic review | MailerLite marketing group | Keep *Unsubscribed* contacts as a suppression record; forget only on an erasure request. Review long-inactive addresses yearly. |
| Contract and accounting records | As required by Spanish law (adviser to state the period) | Your accounting/invoicing tools, signed agreements | Not deleted before the legal period ends. |
| GA4 event-level data | 14 months (owner-confirmed setting) | Google Analytics | Automatic (see section 2). |
| Approved referral partners / paying clients | While the relationship continues, then the periods above | MailerLite (move out of the applications group), accounting | Same routine. |

## 2. Does GA4's "reset on new activity" match the 14-month policy?
Google's documentation (Data retention) says: the choices for user-level data and event data are **2 or 14 months**; the setting affects **explorations and funnel reports only** (standard aggregated reports are not affected); and **"Reset user data on new activity"**, when on, restarts the clock on a user's identifier with each new event, so that "a user who starts a new session every month never reaches expiry" with 14-month retention.

* **Event data retention = 14 months** matches the proposed "GA4 event-level data: 14 months".
* **User data retention = 14 months with reset ON does not match** for returning visitors: their user-level data persists as long as they keep visiting, i.e. it can exceed 14 months. With reset **OFF**, user-level data expires 14 months after collection regardless of activity, which matches the policy sentence.
* **Recommendation:** in Analytics → Admin → Data settings → Data retention, set both to 14 months and switch **"Reset user data on new activity" OFF**. You told me the two 14-month values; I could not see the toggle, so please check it. Until it is confirmed, the Privacy draft's "keeps event-level data for 14 months" is accurate for event data and carries an owner check.
* **Cookie lifetime:** the `_ga` cookie's default lifetime (Google documents two years; verify in your browser on the Preview) is longer than 14 months. The cookie only holds a random client ID, and data older than the retention setting is deleted anyway, but the policy must state the real cookie lifetime (open marker). A shorter cookie lifetime can be set in the Google tag if your adviser prefers.
* Google also applies a two-month limit to age, gender and interest data regardless of the setting (secondary sources); we collect none of it (signals off).

## 3. Implementing deletion: options, safest first (none implemented)
1. **Manual quarterly review** (recommended to start). A recurring calendar reminder; in MailerLite filter groups by *Date subscribed* older than 12 months, look at the list, forget in the dashboard. No code, no risk of a bulk mistake, and you see every name before it goes. The read-only audit script (`scripts/audit-mailerlite-consent.mjs`) can give the counts.
2. **Semi-automatic report:** extend the audit script to output "contacts older than 12 months, service-only, no later activity" as counts/CSV for you to action by hand. Still read-only.
3. **Automated deletion** (not recommended yet): a scheduled function calling MailerLite's forget endpoint (needs its exact endpoint and a token with write rights, a dry-run mode, a deletion log without personal data, and your written approval of the rule). I would not build this before the retention periods are legally confirmed and the audit has classified the existing contacts.
4. **Anonymise instead of delete** where a record is needed for statistics: MailerLite cannot anonymise a subscriber in place; export counts first, then forget.

Remember: forgetting a contact in MailerLite also removes the suppression record of someone who unsubscribed. Keep those unless the person asks for erasure.
