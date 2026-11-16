# Owner checklist: what only you can do before creator launch

Production stays **closed** and nothing is merged until you approve the final documents and the launch. Details and sources for every point are in
[creator-privacy-launch-checklist.md](creator-privacy-launch-checklist.md). Never paste tokens, passwords or invitation links into emails or chat.

Dashboard links use your team `convrt-s-projects` and project `convrt-site` (taken from your Preview URL). If a link does not open, use the click path beside it.

## 1. Vercel (do first: the plan affects the DPA and AI settings)

| Check | Link | Click path / what you should see |
|---|---|---|
| Plan is **Pro** (Hobby is non-commercial and its DPA covers Pro/Enterprise) | [Billing](https://vercel.com/convrt-s-projects/~/settings/billing) | Team switcher → Settings → Billing → Upgrade to Pro |
| AI training is **opted out** | [Team settings](https://vercel.com/convrt-s-projects/~/settings) | Team Settings (not Account Settings) → **Data Preferences** → "Opt-Out". Pro is opted out by default; check it anyway |
| Keep a copy of the Vercel DPA | [vercel.com/legal/dpa](https://vercel.com/legal/dpa) | Applies automatically to Pro/Enterprise; save the PDF with the date |
| Function region is Frankfurt | [Functions settings](https://vercel.com/convrt-s-projects/convrt-site/settings/functions) | Should read **Frankfurt (fra1)**. `vercel.json` also sets it |
| **Real** region the functions run in | `/creator-admin` → Setup check | Row "Where the server functions run" must say **fra1**. Or [Logs](https://vercel.com/convrt-s-projects/convrt-site/logs) → open a recent `/api/creator…` request → "Routed to Frankfurt (fra1)" |
| Production variables (later) | [Environment variables](https://vercel.com/convrt-s-projects/convrt-site/settings/environment-variables) | Add for **Production** only when you launch: Cloudflare, Upstash (`KV_*`), `CREATOR_ADMIN_*`, `RESEND_API_KEY`, **`CRON_SECRET`** |

**Send me:** the plan name, "AI training: opted out", and the function-region row.

## 2. Cloudflare (Stream)

| Check | Link | Click path / what you should see |
|---|---|---|
| Plan type (Self-Serve vs Enterprise) | [Billing](https://dash.cloudflare.com/?to=/:account/billing) | Account → Billing. Self-Serve agreement §6.1 incorporates the DPA automatically |
| No captions / AI on creator videos | [Stream](https://dash.cloudflare.com/?to=/:account/stream) | Open a creator video → **Captions** tab: there should be **no** AI-generated captions. (Our code never requests any) |
| Keep the DPA | [Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) | Save the PDF with its version/date |
| Open a support ticket | [Support](https://dash.cloudflare.com/?to=/:account/support) | Account → Support → Contact → Stream; paste the draft below |

**Draft: Cloudflare support ticket**

> **Subject:** Stream: file location, deletion/backups and DPA coverage
>
> Hello, we use Cloudflare Stream to host portfolio videos that freelance creators upload to us. The videos contain personal data (image and voice) of EU-based individuals, and the account holder is established in Spain. Account ID: [paste].
>
> 1. Where are Stream video files stored and processed? Can storage/processing be restricted to the EU? Your data-localization documentation lists Stream as not compatible with Regional Services.
> 2. When we delete a video with the API (`DELETE /stream/{uid}`), how long until all copies, including backups and caches, are removed?
> 3. Please confirm that the Cloudflare Customer DPA applies to our account for Stream, and which sub-processors handle Stream content.
> 4. Please confirm that no AI processing (for example generated captions) is applied to our videos unless we request it, and that our content is not used to train models.
>
> Thank you. A written reply we can keep for our records would be ideal.

## 3. Upstash (database, Frankfurt)

| Check | Link | Click path / what you should see |
|---|---|---|
| Region | [Console](https://console.upstash.com/redis) (or Vercel → Storage → `upstash-kv-champagne-harbor` → Open in Upstash) | Database → Details → Primary region **Frankfurt, Germany (West)** (the label shown when you created it) |
| No backups of your own | same database | **Backups** tab: nothing listed, **Daily Backup** off (our app creates none) |
| Keep the DPA | [Trust center](https://trust.upstash.com) | Download the DPA and the sub-processor list; note the date |
| Ask the questions below | support@upstash.com | Send the draft |

**Draft: email to support@upstash.com**

> **Subject:** Data-processing questions for database `upstash-kv-champagne-harbor` (Frankfurt)
>
> Hello, we store submission records (names, typed signatures, and a small profile photo) for freelance creators in the Upstash Redis database `upstash-kv-champagne-harbor` (primary region Frankfurt), connected through the Vercel integration. Our team is in Spain.
>
> 1. Your sub-processor list includes several "Generative AI services" (Anthropic, OpenAI, OpenRouter, Granola AI, Context7). Do any of them ever receive or process customer database contents? Please confirm customer data is not used to train AI models.
> 2. How long are your disaster-recovery snapshots retained, and how long after a key is deleted does the data disappear from them (your DPA §11.1 refers to scheduled back-up deletion routines)?
> 3. Is your DPA accepted automatically for our plan (Free, via the Vercel Marketplace), and does the data stay in the Frankfurt region, including replicas and backups?
> 4. Which transfer mechanism applies to processing by Upstash, Inc. in the US (SCCs, Data Privacy Framework, or both)?
>
> Please reply in writing so we can keep it for our records. Thank you.

## 4. Resend (optional, 2 minutes)

[Resend GDPR page](https://resend.com/security/gdpr): the DPA is accepted with the Terms; the signed copy is in your Resend dashboard under Documents. It stores data in the US and uses AI sub-processors (listed). Our owner-alert email contains only display name, languages, specializations and a reference.

## 5. Fiverr (permission for the external onboarding page)

Fiverr's [off-platform policy](https://help.fiverr.com/hc/en-us/articles/12792122691601) and [Community Standards](https://help.fiverr.com/hc/en-us/articles/38728907371665) say, in summary, that orders, payments and communication must stay on Fiverr and that sharing contact details to do business off-platform is prohibited. I could not read the full pages (Fiverr blocks automated access), so **read them yourself** and use the ticket below to get the answer in writing: [Help Center](https://help.fiverr.com/hc/en-us), then Submit a request (the exact form path may vary).

What our page does, for your own check: it collects **no email, phone or payments**, all orders, payments, the $25 incentive and messages stay on Fiverr, and the link is sent inside the Fiverr order.

**Draft: Fiverr support request**

> **Subject:** Policy question: private page for creators' portfolio permission (no payments, no contact details)
>
> Hello, we are a studio that hires freelancers on Fiverr. For some orders we offer a small "showcase incentive", paid through Fiverr as a normal order. As a follow-up, we would like to send the seller, inside the Fiverr order messages, a personal link to a private page on our own website where they can (1) upload three portfolio videos they have the right to share and (2) sign a one-page permission for us to display those videos on our website. The page does not ask for email, phone or any payment details, does not move any order or payment off Fiverr, and all communication and compensation stay on Fiverr.
>
> 1. Does this comply with Fiverr's Terms of Service and off-platform policy?
> 2. Is it acceptable to send that link in Fiverr order messages, and to ask the seller to upload files and sign a permission there?
> 3. Is there wording we should use (or avoid) so that sellers do not feel pressured, for example making the portfolio permission optional?
>
> We would appreciate a written confirmation (or the specific policy text that applies). Thank you.

**Send me:** Fiverr's answer (or "no objection"), and any wording they ask us to use.

## 6. Legal

Confirm with your lawyer or adviser: the **six-year retention** of signed records, the **SCC / Data Privacy Framework reliance** for each US recipient, the **legal bases** you accepted as written, and review both documents (agreement and privacy notice), especially use of image and voice.

## When you have the answers

Send me what each provider and your adviser said. I will then replace the four "To be confirmed" tags with confirmed wording, update the Vercel region sentence if the Setup check says `fra1`, and **only then** ask you to approve the final documents. I will not merge, remove the draft gate or enable creator submissions until you explicitly approve both the documents and the launch.
