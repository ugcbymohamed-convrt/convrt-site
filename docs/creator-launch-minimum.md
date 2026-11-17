# Creator onboarding: the minimum path to Production

Goal: a private page where creators upload three videos, accept the portfolio-display terms and submit for **your** review. Nothing more.
The form, agreement, privacy notice, secure uploads, e-signatures and admin page stay exactly as they are. **No new infrastructure is proposed.**
Not legal advice. "Required" below means I could not find a defensible way to launch without it.

## What is actually required

| Required | Why | Who |
|---|---|---|
| **Vercel plan: stay on Hobby (your decision)** | Hobby is for "personal or non-commercial use" ([Terms](https://vercel.com/legal/terms) §4) and Vercel's [DPA](https://vercel.com/legal/dpa) covers Pro/Enterprise. By staying you accept the terms risk (it already applies to your existing site) and that **no Vercel data-processing agreement** is claimed; the notice names only Cloudflare, Upstash and Resend. AI training must be **opted out** (Data Preferences). | You |
| **Production settings**: Cloudflare + Upstash + admin login (+ email key, + `CRON_SECRET`) | Without them nothing works. | You (about 15 min) |
| **Fiverr permission** | Your creators come through Fiverr, whose rules keep orders, payments and communication on Fiverr. Our page takes no payments, emails or phones, but only Fiverr can tell you it is acceptable (I could not read their policy pages). Account-risk check, not a technical need. | You (10 min read or one ticket) |
| **A final privacy notice with no "To be confirmed" tags** | The notice must be accurate. Proposed wording for the four open tags is below, based only on what I verified. | You approve; I apply |
| **Open the legal gate** (`LEGAL_STATUS.approved`) | Production refuses submissions until it is `true`. | You approve; I change it |

## What is optional (skip for launch; revisit later if you wish)

* **Lawyer review** of the agreement and notice: recommended because they cover image and voice, but GDPR does not require it. Your risk decision.
* **Support emails to Cloudflare and Upstash** (drafts are in `creator-owner-checklist.md`). They would give exact backup periods and AI sub-processor details. Not needed: the notice already says plainly that those periods are not published and that deletion from provider backups is not immediate.
* **Checking the Data Privacy Framework list**, **Resend's AI sub-processors**, **a Cloudflare dashboard check for captions** (our code never requests captions or any AI feature).
* **Owner alert emails** (Resend): useful, not required. Without them, open `/creator-admin` to see submissions. Note: Resend's default sender only delivers to the Resend account owner's own address.
* **Frankfurt functions** (already set in `vercel.json`): keep it, it is free and faster. The only requirement is that the notice sentence matches reality (see step 3).

## Already built: no further work, nothing to add

Automatic deletion (daily job), the owner Setup check, the signed PDF, the personalised agreement, backups-honest wording. If you would rather drop the **automatic deletion**, say so and I remove it and reword the retention line to "we delete on request"; keeping it costs only the `CRON_SECRET` variable.

Exact variables and deployment steps: [creator-production-runbook.md](creator-production-runbook.md). Full final text with every approval point marked: [creator-final-documents.md](creator-final-documents.md).

## Minimum steps for you

1. **Vercel (decision made: stay on Hobby):** Team Settings → [Data Preferences](https://vercel.com/convrt-s-projects/~/settings): AI training **opted out**. Hobby is non-commercial under Vercel's terms and its DPA covers Pro/Enterprise only; you accept that, and the notice makes **no** claim of a Vercel agreement.
2. **Fiverr:** read their [off-platform policy](https://help.fiverr.com/hc/en-us/articles/12792122691601) or send the draft in `creator-owner-checklist.md`.
3. **Deploy once, then read the region:** `/creator-admin` → Setup check → "Where the server functions run". Tell me **fra1** or **iad1**; I word the notice to match.
4. **Production settings** ([Environment variables](https://vercel.com/convrt-s-projects/convrt-site/settings/environment-variables)), for **Production** only: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN`, **new** `CREATOR_ADMIN_PASSWORD` (16+ characters) and `CREATOR_ADMIN_SESSION_SECRET` (32+), `RESEND_API_KEY` (optional), `CRON_SECRET` (16+ random characters). Then Vercel → Storage → your Upstash database → **Connect Project** with **Production** ticked (adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`).
5. **Approve the final wording** below (reply "approved", or edit it).
6. **Say "launch"** and I do the rest (see next section).

## Proposed final wording (not applied; for your approval)

| Tag | Replace with | Based on |
|---|---|---|
| provider data-processing and AI terms | Keep: "CONVRT does not request automatic captions, transcription or any other AI analysis of your videos." Add: "We have data-processing agreements with Cloudflare, Upstash and Resend." (Vercel is deliberately not named.) | Cloudflare (Self-Serve §6.1), Upstash and Resend incorporate theirs automatically ([sources](creator-privacy-launch-checklist.md)). |
| transfer safeguards | "When Cloudflare, Upstash or Resend process information outside the European Economic Area, we rely on the safeguards in their data-processing agreements: the EU Standard Contractual Clauses and/or the EU-US Data Privacy Framework. You can ask us for details." (No safeguard is stated for Vercel.) (The sentence about Stream not being limitable to one region stays.) | Each provider's DPA, read on 16 Nov 2026. The notice states the mechanism the providers document; it does not claim a legal assessment. |
| six-year retention period | Remove the tag; the sentence stays: signed records are kept "while your portfolio is approved and for six years after a submission is rejected or withdrawn, so we can evidence what you agreed". | Your policy decision. The notice never claims six years is a legal requirement. |
| provider backup retention | Remove the tag; add: "Upstash and Cloudflare do not publish a fixed period for such copies in the documentation we reviewed." The "not immediate" sentence stays. | Upstash/Cloudflare documents (no period published). |
| (region sentence) | Done: "currently on servers in **Frankfurt, Germany**" (the Production Setup check and the end-to-end test both reported `fra1`). | The Setup check. |

On approval I also set `LEGAL_ENTITY.confirmed` and `LEGAL_STATUS.approved` to `true` and bump the privacy revision id. The draft banner and the DRAFT strip on the PDF disappear by themselves.

## What I do when you say "launch"

1. Apply the approved wording and flags, run the tests, push the branch.
2. Open a pull request to `main` (everything on this branch; nothing else changes on the public site). **I merge only when you say so.**
3. After you have added the Production settings (step 4) and Vercel shows the Production deployment **Ready**, you run the single test below.

## The single end-to-end test

One command plays the owner and a made-up creator: signs in, checks the connections, creates an invitation, uploads three 2-second dummy videos to Cloudflare, submits, downloads the signed PDF, checks the owner's review access, then withdraws the test submission and deletes its videos. It never prints your password and uses dummy data only.

```bash
BASE_URL=https://www.convrt.studio ADMIN_PASSWORD='your-production-admin-password' node scripts/e2e-creator-submission.mjs
```

All 10 checks must say PASS (it was proven locally against a mock Cloudflare; the Production run is the first one against the real service). Before the gate is open it stops with "legal gate closed", which is expected.
After it passes: create a real invitation in `/creator-admin`, send the link through the Fiverr order, and you are live.
