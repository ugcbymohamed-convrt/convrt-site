# Creator onboarding: privacy and legal launch checklist

Status: **approved by the owner on 17 Nov 2026** (`LEGAL_STATUS.approved = true` in `src/content/creatorLegal.js`; it reaches Production only when the branch is merged). The gate mechanism remains: setting it back to `false` makes Production refuse invitations and submissions again. Nothing here is legal advice. "Verified" means read in an official provider document or in this
repository on **16 Nov 2026**; anything else is listed as unknown. Provider pages change: re-check before relying on them.

**What is required vs optional, and the shortest path to launch: [creator-launch-minimum.md](creator-launch-minimum.md).** This file is the detailed evidence behind it.

**Update (final wording prepared):** the four "To be confirmed" tags were replaced by proposed final wording, kept behind the closed gate. Every statement that still rests on you or on a provider document is marked in [creator-final-documents.md](creator-final-documents.md) and listed in the owner review page. The sections below remain the evidence behind those statements; their "blocks Production" lines are superseded by [creator-launch-minimum.md](creator-launch-minimum.md) and [creator-production-runbook.md](creator-production-runbook.md).

## Summary

| # | Item | Blocks Production? | Biggest finding |
|---|---|---|---|
| 1 | provider data-processing and AI terms | **Yes** | The site is on Vercel **Hobby**: Vercel's terms limit Hobby to non-commercial use and its DPA is stated to cover **Pro and Enterprise**. |
| 2 | transfer safeguards | **Yes** | Frankfurt does **not** mean data stays in Europe (Stream cannot be region-locked; Resend is US; US sub-processors everywhere). The functions' real region is now checkable in the app. |
| 3 | six-year retention period | **Yes** (until legal confirms or you consciously accept) | The code does what the notice says. The six years is your choice, not a verified legal minimum. |
| 4 | provider backup retention | **Yes** (small) | Copies persist in provider snapshots/logs; the notice no longer implies immediate deletion there. Upstash and Cloudflare retention periods are not published. |

## 1. provider data-processing and AI terms

**Verified**
* **Vercel.** The [Terms](https://vercel.com/legal/terms) §4 say a Hobby plan is for "personal or non-commercial use" only. The [DPA](https://vercel.com/legal/dpa) §1 says it applies to **Enterprise and Pro** plans (Terms §11.1 incorporates the DPA). Since the March 2026 [Terms update](https://vercel.com/changelog/updates-to-terms-of-service-march-2026), **Hobby teams are opted in by default** to Vercel using code, agent chats, build/deployment telemetry and aggregate traffic stats for AI model training (not hosted creator content); **Pro is opted out by default**, Enterprise is never opted in. The opt-out deadline (31 Mar 2026) has passed, so opting out now only stops *future* use. The DPA does not mention AI training; its Schedule 4 limits use of Customer Data to providing the Services.
* **Cloudflare.** The Self-Serve [Subscription Agreement](https://www.cloudflare.com/terms/) §6.1 incorporates the [Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) by reference (it applies when Customer Content includes EU personal data), so no separate signature is described. The DPA (v6.4, 3 Apr 2026) does not mention AI training; Cloudflare's [Responsible AI page](https://www.cloudflare.com/trust-hub/responsible-ai/) says "we do not use our customers' content to train any LLMs", with narrow exceptions (threat signals, WAF traffic samples, consented training). Stream "Generated Captions" are a per-video action using Workers AI ([blog](https://blog.cloudflare.com/stream-automatic-captions-with-ai/); Workers AI [data-usage page](https://developers.cloudflare.com/workers-ai/platform/privacy/) says no training on customer content). **Our code never calls any caption/AI endpoint** (`api/_lib/creator/cloudflare.js`).
* **Upstash.** The [DPA](https://upstash.com/trust/dpa.pdf) (updated April 2025) is incorporated into the Agreement automatically ("HOW AND WHEN THIS DPA APPLIES"), names Upstash, Inc. (Delaware), uses SCCs/DPF concepts and publishes its [sub-processors](https://upstash.com/static/trust/subprocessors.pdf) (AWS as cloud provider, plus several "Generative AI services": Anthropic, OpenAI, OpenRouter, Granola AI, Context7). The DPA is silent on AI training. [Compliance page](https://upstash.com/docs/common/help/compliance): GDPR yes, DPF participant.
* **Resend.** The [DPA](https://resend.com/legal/dpa) applies on acceptance of the Terms (executed copy in the dashboard), includes SCCs, UK and Swiss terms, states Resend is **DPF-certified**, and limits use of data to performing the Services (§2.5). Its [sub-processors](https://resend.com/legal/subprocessors) include AWS, Vercel and two "Artificial Intelligence" vendors (Anthropic, TypeSafe AI), all USA. The DPA does not mention AI training. Our alert email contains only display name, languages, specializations, reference and review link (no legal name, no media).

**Unknown**
* Which Cloudflare plan you are on (Self-Serve vs Enterprise) and that its DPA covers **Stream** specifically (the DPA text does not name products).
* Whether Upstash's or Resend's AI sub-processors ever see customer data (Upstash: database contents; Resend: email content). Neither DPA says.
* Whether any caption/AI feature was ever switched on in your Cloudflare Stream account.

**Your actions** (details in the owner checklist at the end)
* **Decision (17 Nov 2026): stay on Vercel Hobby.** Confirm Team Settings → Data Preferences shows AI training **opted out**. The notice therefore claims data-processing agreements only with Cloudflare, Upstash and Resend, and states no transfer safeguard for Vercel.
* In Cloudflare: confirm plan type and that no captions/AI are enabled on creator videos.
* Ask Upstash support (draft below) about its AI sub-processors and customer data.

**Legal review:** yes (processor agreements, whether Hobby-era processing needs remedying, AI sub-processor scope). **Blocks Production: yes.**

## 2. transfer safeguards

**Verified**

| Provider | Where creator data is processed/stored | Safeguard in the provider's documents |
|---|---|---|
| **Vercel** (functions) | Earlier request log: **Washington, D.C. (iad1)**. `vercel.json` now sets `fra1`. Vercel documents that [`VERCEL_REGION`](https://vercel.com/docs/environment-variables/system-environment-variables) holds the region where the app is running; the owner **Setup check** now shows it ("Where the server functions run"). Vercel Inc. is a US company; its sub-processor list is at security.vercel.com. | EU SCCs (2021) + UK Addendum in DPA Schedule 3. DPF is **not** mentioned in the DPA, and third-party sources disagree on Vercel's DPF status, so rely on the SCCs. |
| **Upstash** (database) | **Frankfurt** (you confirmed in the console). Operated by Upstash, Inc. (Delaware) on AWS with US sub-processors, so US-based staff/providers may access it: Frankfurt is not "stays in Europe". | DPF participation ([compliance page](https://upstash.com/docs/common/help/compliance)); the DPA defines SCCs/DPF: read its transfer clauses with counsel. |
| **Cloudflare Stream** (videos) | Browsers upload **directly** to Cloudflare's network. Cloudflare's [data-localization compatibility table](https://developers.cloudflare.com/data-localization/compatibility/) lists Stream as **not compatible with Regional Services** and only partly with the Customer Metadata Boundary, so videos **cannot be restricted to a region**. No Stream storage location is documented. | DPA §6.4: Data Privacy Framework; if certification lapses, EU SCCs (+UK Addendum, Swiss terms) apply. |
| **Resend** (owner alert emails) | **United States** ("stores customer data in the United States", [GDPR page](https://resend.com/security/gdpr)). | EU SCCs + UK/Swiss terms and DPF certification ([DPA](https://resend.com/legal/dpa) §§6, 11). |

**Unknown:** the actual current function region (read the Setup check after the next deploy); where Cloudflare stores Stream files; the full transfer clauses of Upstash's DPA; whether each US recipient is currently on the DPF list.

**Your actions:** read "Where the server functions run" in `/creator-admin` (should say `fra1`); check each US recipient on the [DPF list](https://www.dataprivacyframework.gov/list); ask Cloudflare where Stream stores files (draft below).
**Notice:** it now says plainly that Stream cannot be limited to one region. It now says Frankfurt for Vercel: `fra1` was verified on Production on 17 Nov 2026 (Setup check and end-to-end test).
**Legal review:** yes (reliance on SCCs/DPF, any transfer impact assessment). **Blocks Production: yes.**

## 3. six-year retention period

**Verified in the code and tests** (`api/_lib/creator/service.js` `runRetention`, `tests/creator-retention.test.mjs`): the daily job (`/api/creator-cron`, needs `CRON_SECRET`, Production only)
* deletes **rejected** media 90 days after the decision; **withdrawn** media at the next run at the latest (at once when you withdraw with "delete files"); never-submitted uploads/drafts 14 days after the invitation expires;
* deletes the signed record of a rejected/withdrawn submission after **6 years**, only once its media is confirmed gone; **approved and pending submissions are never touched** (media stays only while the authorization is active, until you record a withdrawal);
* verifies every Cloudflare deletion (the video must answer "not found"), keeps media and record on failure, retries daily and emails you the references.
* Gap found and fixed: the invitation's free-text note (often a Fiverr username) is now cleared when an abandoned invitation is purged.
* Signed records are private: only the owner session or the creator's own link can fetch them; never published.

**Unknown:** whether six years is right for your jurisdiction and purpose (it is **your proposal**, not a verified legal requirement).
**Your action:** have it confirmed or consciously accept it. The number lives in `RETENTION` (`src/lib/creator/constants.js`); change it and the notice together.
**Legal review:** yes. **Blocks Production: yes**, until confirmed or accepted.

## 4. provider backup retention

**Verified**
* **Cloudflare Stream:** the delete API "Deletes a video and its copies from Cloudflare Stream" ([API reference](https://developers.cloudflare.com/api/resources/stream/methods/delete/)). No backup retention for deleted videos is documented.
* **Upstash:** "We take regular snapshots of the data cluster for disaster recovery" ([compliance page](https://upstash.com/docs/common/help/compliance)), with no retention period published. The DPA (§11.1) says backup copies that cannot be deleted at once are deleted "in accordance with any relevant scheduled back-up deletion routines" and put "beyond use" meanwhile. Optional customer-controlled [daily backups](https://upstash.com/docs/redis/features/backup) (kept 1 or 3 days) exist; **our app never creates any**.
* **Resend:** email data is kept for **30 days** on all plans according to its [documentation](https://resend.com/docs/dashboard/emails/introduction) (that figure comes from a single docs page); data is deleted within 90 days of account termination (DPA Exhibit A).
* **Vercel:** runtime logs are kept about 1 hour on Hobby per Vercel's documentation (secondary copies; re-verify). Our code logs only error names/status codes, never personal data; the invitation token travels in a header, not the URL.
* **This app:** makes no exports or copies of its own.

**Unknown:** how long Upstash and Cloudflare keep snapshots/copies after deletion; whether the Upstash daily-backup switch is off for your database.
**Notice:** it states that copies in provider backups/logs expire on their own schedules, that deletion there is **not immediate**, and names the Upstash snapshots and the 30-day Resend logs. The tag stays until the two unknowns above are answered.
**Your actions:** in the Upstash console open the database's Backups tab and confirm no backups/daily backup are enabled; send the two support questions below.
**Legal review:** only to confirm the wording is acceptable. **Blocks Production: yes (small).**

## Drafts for your support emails

**To Cloudflare support (Stream):** "We store creator portfolio videos in Cloudflare Stream. (1) Where are Stream video files stored and processed, and can this be restricted to the EU? (2) When we delete a video through the API, how long until all copies, including any backups, are gone? (3) Please confirm our account's DPA coverage for Stream and that no AI features process our videos."

**To Upstash support:** "We store submission records (names, signatures, a small profile photo) in an Upstash Redis database in Frankfurt. (1) Do any of your 'Generative AI services' sub-processors ever receive customer database contents? (2) How long are the disaster-recovery snapshots retained, and how long after a key is deleted does the data disappear from them? (3) Is the DPA accepted automatically for our plan?"

## Owner checklist: what only you can do

Short version with direct dashboard links and support-message drafts (Cloudflare, Upstash, Fiverr): [creator-owner-checklist.md](creator-owner-checklist.md).

1. **Vercel:** stays on **Hobby** (your decision; non-commercial terms and no Vercel DPA are accepted). Team Settings → Data Preferences: confirm AI training is **opted out**.
2. **After the next deploy**, open `/creator-admin` → Setup check: **"Where the server functions run" must read `fra1`**. Tell me what it says.
3. **Cloudflare:** confirm your plan type; confirm no caption/AI features are on; send the support email above.
4. **Upstash:** the Backups tab shows no backups; send the support email above.
5. **Legal:** confirm the six-year period, reliance on SCCs/DPF per provider, and review both documents (also the legal bases you accepted as written).
6. **Fiverr:** confirm Fiverr's terms allow sending creators to this external page.
7. Tell me the results. I then replace each tag with the confirmed wording, remove the draft banner and open the Production gate; you add the Production environment variables (including `CRON_SECRET`), connect Upstash to Production and say when to merge.

## Resolved by owner decision (for the record)

| Item | Decision / evidence |
|---|---|
| Address | **Calle Gibraltar Español 9, 04007 Almería, Spain** (supplied by the owner; shown in the controller line). Legal contracting name **Mohamed Doukkali Azizi**, **NIF Y6755743J** (owner's reference agreement and instruction). |
| Registration information | None beyond the NIF supplied; none shown. |
| Legal bases | Accepted **as written** by the owner. **Not verified by a lawyer.** |
| Upstash region | Owner confirmed **Frankfurt, Germany** in the console. |
| Retention of media | 90 days after rejection; withdrawn promptly; never-submitted uploads 14 days after the invitation expires. |

## Other launch items

| Item | Status | Blocks Production? |
|---|---|---|
| Lawyer review of the agreement and privacy notice (image/voice/likeness) | Not done | **Yes** (recommended) |
| Fiverr terms permit directing creators to an external onboarding page | Not verified | **Yes** |
| Agreement and notice make the same commitments | **Verified by tests** | No |
| Signed-agreement audit trail (exact text, hash, internal revision, consents, timestamp, signature, asset ids; old records untouched) | **Verified by tests** | No |

## Going live

1. Resolve the owner checklist above.
2. In `src/content/creatorLegal.js`: replace each `tbc(...)` marker with the confirmed wording, update `PRIVACY_REVISION` (and `AGREEMENT_REVISION` if the agreement changed), set `LEGAL_ENTITY.confirmed = true` and `LEGAL_STATUS.approved = true`. The draft banner and "DRAFT" PDF strip disappear automatically; a test fails if the approved flag is set while any marker remains.
3. Add the same environment variables to Production (including `CRON_SECRET`) and connect the Upstash database to Production (see `creator-onboarding-setup.md`), then run one real submission.
