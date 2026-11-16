# Creator onboarding: privacy and legal launch checklist

Status: **draft, not approved** (`LEGAL_STATUS.approved = false` in `src/content/creatorLegal.js`). Production refuses invitations and
submissions until it is `true`; Previews keep working for testing. Nothing here is legal advice, and nothing is marked "confirmed" that
was not actually verified.

Each open point appears in the Privacy Notice as a small **"To be confirmed: …"** tag (and as `[OWNER TO CONFIRM: …]` in the stored text). A
test fails if one of the six tags below has no row in this file, so none can be removed without a decision.

## Open items

Decisions made by the owner on 16 Nov 2026: address supplied; retention periods chosen (90 days for rejected media, 6 years for signed records, promptly
for withdrawn media); legal bases accepted as written; Upstash confirmed as Frankfurt. The four tags still in the notice are below.

| # | Item | Confirmed now (source) | What you need to do | Verify with | Blocks Production? |
|---|---|---|---|---|---|
| 1 | **provider data-processing and AI terms** | **Repo (verified):** CONVRT's code never requests captions, transcription or any AI feature: it only creates direct uploads, reads/deletes videos, mints signed tokens and requests MP4 downloads (`api/_lib/creator/cloudflare.js`). **Provider docs (found via web search, re-verify):** Vercel publishes a [DPA](https://vercel.com/legal/dpa) and a guide saying it relies on SCCs + UK Addendum; Cloudflare publishes a [Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/), and Stream "Generated Captions" is a per-video action using Workers AI, with Cloudflare stating it does not train on customer content ([blog](https://blog.cloudflare.com/stream-automatic-captions-with-ai/)); Upstash publishes a [DPA](https://upstash.com/trust/dpa.pdf) (Upstash, Inc., Delaware) and a [compliance page](https://docs.upstash.com/redis/help/compliance); Resend states a pre-signed DPA applies to every account ([page](https://resend.com/security/gdpr)). **Not verified:** that each DPA is in force for *your* accounts and covers Cloudflare *Stream*. | Keep each provider's DPA for your account and confirm acceptance. In Cloudflare confirm no caption/AI features are used on creator videos. | Provider dashboards (legal/DPA pages), Cloudflare Stream settings | **Yes** (GDPR Art. 28 processors) |
| 2 | **transfer safeguards** | **Per provider docs (secondary, re-verify):** Vercel relies on EU SCCs + UK Addendum (its DPF status is reported inconsistently: check the official list); Cloudflare relies on the EU-US Data Privacy Framework with SCCs as a fallback; Resend relies on SCCs and DPF participation and **stores data in the US**; Upstash: see its DPA. **Vercel functions:** the earlier request log showed Washington, D.C. (iad1); `vercel.json` now sets `fra1` (Frankfurt) on this branch. **Not yet verified:** a new request log must read "Routed to Frankfurt, Germany (fra1)", then the notice's "Washington, D.C." wording changes. | Check each DPA/DPF listing, confirm the safeguard you rely on per US transfer, verify the Frankfurt log, then replace the tag with the confirmed wording. | [DPF list](https://www.dataprivacyframework.gov/list); each provider's DPA; Vercel Logs | **Yes** |
| 3 | **six-year retention period** | **Your decision:** signed agreement and consent records (never the media) are kept while the portfolio is approved and for **6 years** after a submission is rejected or withdrawn. **Implemented:** the daily clean-up (`api/creator-cron.js`) deletes such records after 6 years, but only once their media is confirmed gone; approved and pending submissions are never touched. Six years is **not** a verified legal requirement. | Confirm the period with legal advice (it may need to be shorter or longer). The number lives in `RETENTION` (`src/lib/creator/constants.js`). | Legal/accounting advice | **Yes** (until confirmed or consciously accepted) |
| 4 | **provider backup retention** | The app makes no backups of its own. Whether Upstash (Free plan) or Cloudflare keep backups, and for how long, is **unknown**. | Check Upstash console → Backups; ask Cloudflare. Then state the real position in the notice. | Upstash console; Cloudflare support | **Yes** (the notice must not over-promise deletion) |

### Resolved by owner decision (kept for the record)

| Item | Decision / evidence |
|---|---|
| Address | **Calle Gibraltar Español 9, 04007 Almería, Spain**, supplied by the owner and shown in the controller line. Legal contracting name **Mohamed Doukkali Azizi**, **NIF Y6755743J** (from the owner's reference agreement). |
| Registration information | None beyond the NIF was supplied; none is shown. |
| Legal bases | Accepted **as written** by the owner (consent, steps before a collaboration, legitimate interests, legal obligation). **Not verified by a lawyer.** |
| Upstash region | Owner confirmed **Frankfurt, Germany**. |
| Retention of rejected media / withdrawn media / abandoned uploads | 90 days after rejection; withdrawn media promptly (the next daily run at the latest; deleted at once when withdrawing with "delete files"); abandoned uploads 14 days after the invitation expires. |

## Other launch items (not tags in the notice)

| Item | Status | Blocks Production? |
|---|---|---|
| Lawyer review of the agreement and privacy notice (image/voice/likeness) | Not done | **Yes** (recommended before real creators sign) |
| Fiverr terms permit directing creators to an external onboarding page | Not verified | **Yes** |
| Consistency between agreement and notice | **Verified by tests** (limited website display, no AI/cloning, no unauthorised alteration, no paid ads/redistribution, ownership stays with the creator, removal without penalty, Fiverr transactions stay on Fiverr) | No |
| Signed-agreement audit trail | **Verified by tests** (exact accepted text, hash, internal revision, consents, timestamp, signature, asset ids; old records untouched) | No |

## Verified facts used in the notice

* Data collected, security counters (hashed IP, 15 min–1 h), no analytics/trackers, no marketing lists: **repo code and tests** (`api/_lib/creator/*`, `tests/creator-seo.test.mjs`).
* Notification email contents (display name, languages, specializations, reference, review link; no legal name, no media): `api/_lib/creator/service.js`.
* Videos private behind short-lived signed links: `requireSignedURLs: true` in `api/_lib/creator/cloudflare.js`.
* Servers in Washington, D.C.: Vercel request log (iad1). Database set up in Frankfurt: Upstash setup screen (see item 4).

## Going live

1. Resolve rows 1–8 and the other launch items above.
2. In `src/content/creatorLegal.js`: replace each `tbc(...)` marker with the confirmed wording, update `PRIVACY_REVISION` and (if the agreement changed) `AGREEMENT_REVISION`, set `LEGAL_ENTITY.confirmed = true` and `LEGAL_STATUS.approved = true`. The draft banner and "DRAFT" PDF strip disappear automatically. A test fails if the approved flag is set while any marker remains.
3. Add the same environment variables to Production and connect the Upstash database to Production (see `creator-onboarding-setup.md`), then run one real submission.
