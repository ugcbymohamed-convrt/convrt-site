# Creator portfolio onboarding: setup and operations

Private, invitation-only page where freelance creators (e.g. from Fiverr) submit three portfolio videos and sign the
website-display agreement. Orders, payments and communication stay on Fiverr.

| Route | What |
|---|---|
| `/creator-onboarding?invite=<token>` | the creator form (token is removed from the address bar on load) |
| `/creator-onboarding/agreement`, `/creator-onboarding/privacy` | the full documents (new-tab links from the form) |
| `/creator-admin` | owner-only review page (password sign-in) |
| `/api/creator/<op>`, `/api/creator-admin/<op>` | serverless API (2 functions) |

All are `noindex, nofollow, noarchive`, absent from the sitemap, navigation, footer and every other page, have no analytics,
and send `Referrer-Policy: no-referrer` and `Cache-Control: no-store`.

## 1. One-time configuration (Vercel → Project → Settings → Environment Variables)

| Variable | Purpose |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | your Cloudflare account ID (the one that already hosts the Stream videos) |
| `CLOUDFLARE_STREAM_API_TOKEN` | API token with **Stream: Edit** only (Cloudflare → My Profile → API Tokens). Server-side only. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | the database (below). Injected automatically by the Vercel integration. |
| `CREATOR_ADMIN_PASSWORD` | owner sign-in. 16+ characters; a long random passphrase from a password manager |
| `CREATOR_ADMIN_SESSION_SECRET` | 32+ random characters (`openssl rand -base64 48`). Changing it signs everyone out. |
| **Vercel plan** | Stays on **Hobby** by the owner's decision (17 Nov 2026): Vercel's terms limit Hobby to non-commercial use and its DPA covers Pro/Enterprise, so the privacy notice claims no Vercel agreement. Keep AI training **opted out** in Team Settings → Data Preferences. |
| `CRON_SECRET` | 16+ random characters. Lets Vercel's daily cron run the retention clean-up (below). Production only. |
| `RESEND_API_KEY` (existing) | owner email alert. `NOTIFY_EMAIL_TO` already defaults to mohamed@convrt.studio. |

Set them for **Preview** (to test) and later **Production**. Redeploy after adding variables.

### Database (there was none)
The repository had no database. Smallest secure option compatible with Vercel: **Upstash Redis** (Vercel → Storage →
Marketplace → Upstash Redis → connect to this project). It is durable, used here through its REST API with no new npm
dependency, and stores small JSON records (submissions, acceptance records, a profile photo of at most 500 KB).
If you prefer Postgres later, only `api/_lib/creator/store.js` needs replacing. Choose the region closest to your users and
note it in the Privacy Notice.

### Cloudflare Stream (the repo only used it for public playback)
Verified from the repo: Stream is used only for public playback (`videodelivery.net`); there was no upload/API integration.
This feature adds one. Nothing else in the Stream account is touched.
* Uploads go **directly browser → Cloudflare** with a one-time URL our server creates (30-minute expiry, scoped to the
  submission and slot, `requireSignedURLs: true`, `maxDurationSeconds: 180`). Video bytes never pass through Vercel.
* Every creator video is **private** (signed URLs). The server mints 1-hour playback tokens only for the creator's own videos and
  for the signed-in owner. Nothing becomes public automatically.
* Limits shown on the form and enforced on the server: **MP4 or MOV, 200 MB, 3 minutes**. 200 MB is Cloudflare's limit for a
  basic direct upload (bigger files would need the resumable tus protocol: not built in this first version). Please confirm the
  limits suit your Stream plan (storage minutes) before inviting many creators.
* The token endpoint used for signed playback is `POST /accounts/{id}/stream/{uid}/token`; no signing key is needed.

## 2. Legal documents: required before Production
Source: `src/content/creatorLegal.js`. Both documents are **awaiting owner approval** (`LEGAL_STATUS.approved = false`).
* **Creator Portfolio Agreement:** a short agreement (five numbered sections + acceptance + signature areas) modelled on the original one-page
  PDF. It is **personalised for every submission**: CONVRT's legal contracting name, the creator's legal name, and the three covered videos by
  filename. The same document drives the online agreement, the stored record and the signed A4 PDF (`api/_lib/creator/agreementPdf.js`).
* **No visible version numbers.** Internally each document has a *revision id* (`AGREEMENT_REVISION`, `PRIVACY_REVISION`). Every submission stores
  that revision, the **exact accepted text**, its SHA-256, the structured document, the privacy notice text and hash, the four consent records,
  the server timestamp, the typed signature, the reference and the bound video/photo ids. **Changing wording = new text + new revision id**:
  existing records are never rewritten, and new wording only applies to new submissions.
* **Signed copy:** a PDF (one A4 page normally; a labelled "Record of materials" second page only if the video list needs room; body text never
  below 9 pt). The CONVRT signature column stays **blank unless a countersignature is actually recorded** in the record (`acceptance.countersignature`:
  `{ name, signature, signedAt }`; there is no screen to create one yet). Names in a script the embedded Inter fonts do not cover (e.g. Arabic,
  Chinese, Greek) get a printable HTML copy instead of wrong glyphs. Agreements signed before this format keep their original HTML copy.
* **Privacy Notice** opens with "How we protect your content" and "You can request removal at any time". The highlighted
  `[OWNER TO CONFIRM …]` markers are real open points: they are **listed for you in `/creator-admin` (Setup check → "Before real creators sign")**
  and in `OWNER_REVIEW_BLOCKERS`. Do not delete a marker until the point is decided; a test fails if an approved flag ships with markers left.
* **Contracting name:** taken from your reference PDF (`LEGAL_ENTITY`, `confirmed: false`). The tax/registration number printed beside the
  signature in that PDF has deliberately **not** been copied into creator agreements.
* On **Production**, creating invitations and submitting are **refused** while `LEGAL_STATUS.approved` is `false`. Previews work for testing and
  carry a "DRAFT" marking. To go live: resolve every blocker, remove the markers, set `LEGAL_ENTITY.confirmed = true` and `LEGAL_STATUS.approved = true`.

## 3. Generating a creator invitation link
1. Open `/creator-admin` and sign in.
2. Under **Invitations** enter a note (e.g. the Fiverr username), choose **Fiverr** or **Direct**, choose how many days it is valid
   (1–30, default 7) and press **Create link**.
3. Copy the link (shown **once**; only a hash is stored) and send it to the creator through Fiverr.
4. **New link** issues a replacement (the old link stops immediately); **Revoke** kills it.
Each invitation = one submission. An interrupted creator can reopen the same link (same browser tab session or fresh) and
resumes: profile draft and uploaded videos are kept. After submitting, the link can only download that creator's own signed
agreement (30 days), and cannot submit or change anything.

## 4. Reviewing submissions
`/creator-admin` → **Submissions** → open one. You can read the profile and acceptance record, load and play all three videos
(signed, 1-hour links), view the photo, download the signed agreement (PDF), download each video (Cloudflare prepares an MP4 first) and the photo, and **Approve**, **Reject** or
send it back to **Pending**. Approval only flags it `publishable`; **nothing is published automatically** and there is no
public showcase yet. You also get an email (display name, languages, specialization, reference, review link: no legal name,
no media) via the existing Resend setup.

## 4b. Automatic retention clean-up
`vercel.json` schedules `/api/creator-cron` daily (03:17 UTC; Vercel Cron runs on **Production** deployments only). It needs `CRON_SECRET`.
* **Withdrawn** submissions: any media still stored is deleted at the next run (no waiting period).
* **Rejected** submissions: media deleted 90 days after the decision.
* **Never-submitted uploads and drafts:** deleted 14 days after the invitation expired or was revoked.
* **Signed records** of rejected/withdrawn submissions: deleted 6 years after the decision, only once their media is confirmed gone. The 6 years is a
  period the owner chose, **not a verified legal requirement**. Approved and pending submissions are never touched.
* **Safeguards:** every Cloudflare deletion is verified (the video must then answer "not found"). A failed deletion keeps the media and the record,
  is retried at the next run, and you get an email listing the references (no personal data). Records are never deleted while media remains.
* **Backups:** the app makes no copies of its own. Whether Upstash/Cloudflare keep backups, and for how long, is an open point in the privacy checklist.
* Adjust the numbers in `src/lib/creator/constants.js` (`RETENTION`) together with the Privacy Notice wording.

## 5. Removal / withdrawal requests
Open the submission → **Removal / withdrawal request** → record how it was requested (Fiverr, email…) and choose whether to delete
the files now. The submission becomes **Withdrawn**: it can never be re-approved or published, playback tokens are refused, the videos
are deleted from Cloudflare and the photo from the database. The signed agreement record is kept as evidence. If a Cloudflare delete
fails the submission is still withdrawn and shows which files remain; press **Delete files now** to retry. *What* is retained and
for how long must follow the approved Privacy Notice (retention periods are still to be set by the owner).

## 6. Security model (summary)
* Invite tokens: 256-bit random, only the SHA-256 is stored, expiring, revocable, sent only in an `Authorization` header (never in a URL
  after load, never in analytics/logs). Bad-token attempts are rate limited.
* Server validates everything again (profile, signature, four acceptances, three Cloudflare-verified private videos, versions);
  acceptance is bound to the exact video IDs and photo hash; replacing an asset forces renewed confirmation.
* Duplicate submissions are blocked with a store lock + status check.
* Owner API: HttpOnly, SameSite=Strict, HMAC-signed 8-hour session cookie (Secure over HTTPS); constant-time password check;
  login rate limited (5 per 15 minutes per IP, plus a global cap); same-origin check on all state changes.
* Rate limits and upload quotas (9 upload authorisations per invitation) are in `api/_lib/creator/`. IP addresses are only used
  as one-way hashes in short-lived counters.
* No AI processing of creator media anywhere. MailerLite is not touched; creators are not subscribed to anything.
* Not claimed: that a video can never be copied once shown publicly. The agreement restricts CONVRT's use; the setup reduces exposure.
* Optional hardening: also put `/creator-admin` behind Vercel Deployment Protection or Cloudflare Access.

## 7. Local development
```
node tests/helpers/mockCloudflareStream.mjs     # stand-in for Cloudflare Stream on :8788
# .env.local (git-ignored): CREATOR_STORE=memory, CLOUDFLARE_ACCOUNT_ID=dev, CLOUDFLARE_STREAM_API_TOKEN=dev,
#   CLOUDFLARE_API_BASE=http://localhost:8788/client/v4, CLOUDFLARE_PLAYBACK_BASE=http://localhost:8788,
#   CREATOR_ADMIN_PASSWORD=<16+ chars>, CREATOR_ADMIN_SESSION_SECRET=<32+ chars>
npm run dev
```
The mock proves our integration contract, not Cloudflare's own behaviour: do one real test upload on a Preview with real
credentials before going live.

## 8. Before going to Production (checklist)
- [ ] Legal documents reviewed, legal entity set, markers removed, `LEGAL_STATUS.approved = true`
- [ ] Upstash Redis connected; all variables above set for Production; Resend sender verified for convrt.studio
- [ ] Real end-to-end test on a Preview: invite → upload 3 real test videos (dummy creator) → submit → email → review → approve → withdraw
- [ ] Cloudflare Stream plan/storage checked; confirm playback of a private video from the review page
- [ ] Fiverr policy check: confirm Fiverr's terms allow directing buyers/sellers to an external onboarding page for this purpose
