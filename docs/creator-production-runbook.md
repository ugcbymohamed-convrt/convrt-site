# Creator onboarding: Production settings and deployment steps

Nothing here is applied yet. **Production stays closed** (the legal gate is `false`) and nothing is merged until you confirm the final wording
([creator-final-documents.md](creator-final-documents.md)) **and** the Production configuration below.
**No secret appears in this file, in chat, or in any command output.** Create each secret so it only ever goes clipboard → password manager → Vercel.

## A. Production environment variables

Add them at [Settings → Environment Variables](https://vercel.com/convrt-s-projects/convrt-site/settings/environment-variables).
For every one: **Environments = Production only**, **Sensitive = on** (except the account ID), exact spelling.

| # | Name | Required | Where the value comes from | Notes |
|---|---|---|---|---|
| 1 | `CLOUDFLARE_ACCOUNT_ID` | **Yes** | Cloudflare dashboard → your account → ⋯ → Copy account ID | Not secret. |
| 2 | `CLOUDFLARE_STREAM_API_TOKEN` | **Yes** | Cloudflare → My Profile → API Tokens. Reuse the token you already made (Account → **Stream → Edit**, scoped to your one account) or create a second one named "CONVRT creator uploads (Production)" | Copy it once; paste straight into Vercel. |
| 3 | `KV_REST_API_URL` and `KV_REST_API_TOKEN` | **Yes** | **Do not type them.** Vercel → Storage → `upstash-kv-champagne-harbor` → **Connect Project** → `convrt-site`, tick **Production**, leave the prefix **empty** | Vercel adds both. Confirm both now list **Production**. |
| 4 | `CREATOR_ADMIN_PASSWORD` | **Yes** | **New** value, 16+ characters, made in your password manager (Generate) | Never reuse the Preview password. |
| 5 | `CREATOR_ADMIN_SESSION_SECRET` | **Yes** | **New** random value, 32+ characters (see "Creating secrets") | Changing it signs everyone out. |
| 6 | `CRON_SECRET` | **Yes** (for automatic deletion) | **New** random value, 16+ characters (see "Creating secrets") | Vercel sends it to the daily clean-up job. Without it the job refuses to run. |
| 7 | `RESEND_API_KEY` | Optional | Probably **already set for Production** (your lead forms use it): just check it is listed. If not, create a key in Resend (Sending access) | Without it you get no "new submission" email; open `/creator-admin` instead. Resend's default sender only delivers to the Resend account owner's address. |
| 8 | `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` | Optional | Leave as they are | Defaults: mohamed@convrt.studio. |

**Do NOT add to Production** (local-development only, and harmful there): `CREATOR_STORE`, `CLOUDFLARE_API_BASE`, `CLOUDFLARE_PLAYBACK_BASE`.

### Creating secrets without showing them
Use the regular macOS **Terminal** app (Cmd+Space → Terminal). **Not** a chat box, and don't click a ▶ run button next to the command in a chat: output there is saved. The command prints nothing and copies the secret to the clipboard:

```bash
openssl rand -base64 48 | tr -d '\n' | pbcopy
```

1. Run it once. 2. Paste (Cmd+V) into a new password-manager entry named for the variable. 3. Paste again into the Vercel field. 4. Save. Don't copy anything else in between, and don't paste into Terminal. For `CRON_SECRET` the same command is fine. Use your password manager's own generator for `CREATOR_ADMIN_PASSWORD`.

### Start Production with a clean database (recommended)
Preview and Production share one Upstash database (the Free plan allows one), so it still holds **dummy test records**. Before launch, in the Upstash console → the database → **CLI**, run `FLUSHDB` (it deletes everything in this database; only this feature uses it). Also open Cloudflare → Stream and delete any leftover test videos (named `CRX-…`).

## B. Deployment steps

| Step | Who | What |
|---|---|---|
| 1 | You | Complete section A. Vercel stays on **Hobby** by your decision with AI training opted out, Fiverr checked ([creator-launch-minimum.md](creator-launch-minimum.md)). Read **Setup check → "Where the server functions run"** on the Preview and tell me `fra1` or `iad1`. |
| 2 | You | Reply **"approved"** to [the final documents](creator-final-documents.md), or list the ids to change, and say that the Production configuration is done. |
| 3 | Me | Apply the approved wording, set `LEGAL_ENTITY.confirmed` and `LEGAL_STATUS.approved` to `true`, update the Vercel region sentence if needed, run the tests, push, and open a pull request to `main`. |
| 4 | You | Read the pull request summary and say **"merge"**. I merge only then. |
| 5 | Vercel | Deploys `main` to Production automatically. Wait until the deployment is **Ready**. |
| 6 | You | Open `https://www.convrt.studio/creator-admin`: the sign-in appears and, after signing in, the **Setup check** is all green (database, both Cloudflare rows, **region**, email). |
| 7 | You | Run the **single end-to-end test** (below). All 10 checks must pass. |
| 8 | Together | Review the test result. If good: create the first real invitation in `/creator-admin`, send the link through the Fiverr order. |

**What the merge changes on the public site:** nothing visible on existing pages. It adds four private, `noindex` pages (`/creator-onboarding`, its agreement and privacy pages, `/creator-admin`), the API functions, `vercel.json` changes (functions run in Frankfurt, a daily clean-up job, no-index headers on the private pages) and three runtime libraries. The existing lead forms keep working; their functions also run in Frankfurt after the change. The sitemap is untouched.

### The single end-to-end test
```bash
BASE_URL=https://www.convrt.studio ADMIN_PASSWORD='your-production-admin-password' node scripts/e2e-creator-submission.mjs
```
It uses dummy data, creates one invitation, uploads three 2-second videos to the real Cloudflare, submits, checks the signed PDF and your review access, then withdraws the test submission and deletes its videos. It never prints the password. The run shows the time the submission took. (To keep the password out of your shell history, run it from a terminal where you first typed `export ADMIN_PASSWORD=` followed by your password manager's paste, or use a one-off `read -s ADMIN_PASSWORD; export ADMIN_PASSWORD`.)

### If something goes wrong
* **Revoke** any invitation in `/creator-admin` (the link stops at once), or remove `CREATOR_ADMIN_PASSWORD` in Vercel to lock the review page.
* **Roll back the site:** Vercel → Deployments → the previous Production deployment → **Promote to Production**.
* No creator data is lost by either: it lives in Upstash and Cloudflare.
