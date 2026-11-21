# Provider privacy and data-processing verification checklist

For the Privacy Policy sections "Who we share information with" and "Transfers outside the EEA". **I have not accepted, signed or changed anything in any dashboard.** The "what the provider says" column is what I read in each provider's public documentation on 21 Nov 2026 through a web search (summaries, not the full legal text). Treat it as a starting point and read the live document before you rely on it. Nothing below is legal advice. The Privacy draft states **none** of these agreements, locations or safeguards as fact; each is an open `[OWNER TO CONFIRM]` until you tick it here.

Legend: **A** = agreement/DPA, **L** = where data is stored/processed, **T** = transfer safeguard, **R** = retention, **S** = a dashboard setting to check.

## 1. MailerLite (application, request and email-list records; sends our emails)
| | What the provider says (21 Nov 2026) | What you check |
|---|---|---|
| A | Its Data Processing Addendum is part of its Terms of Use, "no need to sign it". | Open [mailerlite.com/legal/data-processing-agreement](https://www.mailerlite.com/legal/data-processing-agreement); save a PDF/date. Confirm it applies to your plan and entity. |
| L | Help page lists EU storage via Google infrastructure (the result I saw listed Germany for the "Classic" product; the list was incomplete). | Ask MailerLite support in writing: where is subscriber data stored for **your** account/plan, and which sub-processors (sub-processor list). |
| T | Not established. Sub-processors are said to have DPAs with MailerLite. | Ask which transfer mechanism applies to any non-EEA sub-processor. |
| R | Contacts stay until you delete them; *Forget subscriber* deletes fully after its own period (blog says 30 days). | Confirm the period with support; decide your routine (`docs/data-retention-and-deletion.md`). |
| S | — | Account → Subscribe settings → double opt-in for API and integrations (decision in `docs/marketing-consent-mailerlite.md`); campaigns only to the marketing segment; fields and group created. |

## 2. Resend (operational email alerts to the owner)
| | What the provider says | What you check |
|---|---|---|
| A | A GDPR Art. 28 DPA is pre-signed by Resend and takes effect when you sign up; a signed copy is on its documents page. | Download the signed DPA from the Resend dashboard/documents and file it. |
| L | Resend stores customer data **in the United States** (message content, delivery logs, webhook payloads, account records). | Nothing to choose; the policy must say transfers to the US happen. |
| T | Certified under the EU-US Data Privacy Framework and the UK extension; the DPA also refers to Swiss and UK provisions. | Check [the DPF list](https://www.dataprivacyframework.gov/) that its certification is **active today**; read the DPA for SCC fallback wording (I could not confirm it). |
| R | Email and log data kept 30 days on Free, Pro and Scale plans while the account is active; no API to delete one email (contact support). | Confirm your plan; note that each alert contains the applicant's details. |
| S | `NOTIFY_EMAIL_FROM`: the default Resend test sender only delivers to the account owner; verified domain recommended. | Verify `convrt.studio` in Resend (SPF/DKIM) so alerts do not depend on the test sender. |

## 3. Calendly (bookings)
| | What the provider says | What you check |
|---|---|---|
| A | A Data Processing Addendum (page shows effective date 1 Jun 2026) incorporated in its Terms. | Read [calendly.com/dpa](https://calendly.com/dpa); decide with your adviser whether Calendly is your **processor** or an **independent controller** for booking details and cookies (open question in the policy). |
| L | The DPA states Calendly is located in the United States; sub-processors table lists data-centre locations (secondary source: AWS/GCP). | Open Calendly's sub-processor page; note locations; subscribe to updates. |
| T | Self-certified under the Data Privacy Frameworks; falls back on SCCs and the UK Addendum if the framework fails. | Verify the DPF certification is active; read the SCC module in the DPA (I could not confirm the current text). |
| R | Not found in what I read. | Admin → Account/Data settings: look for invitee data deletion and retention options on your plan. |
| S | Calendly says it uses cookies even if the banner is hidden and advises waiting to load it until visitors accept performance cookies; third-party summaries say its terms put cookie compliance on the site that embeds it. | Read Calendly's help page "Cookies and your Calendly experience" and its terms yourself; see `docs/booking-embed-and-cookies.md`. |

## 4. Vercel (hosting, serverless functions)
| | What the provider says | What you check |
|---|---|---|
| A | The published DPA page says it forms part of an Enterprise agreement or another executed agreement; a standalone PDF DPA also exists. I could not confirm whether a **Hobby** account can accept it. | Ask Vercel in writing which DPA covers your plan and how to accept it. |
| **Plan** | Vercel's terms say the Hobby plan is for **personal, non-commercial use**; commercial use needs Pro or Enterprise. The terms also say Hobby/trial content may be used to train AI models. | **Important:** this site is a business. Decide with Vercel/your adviser whether to move to Pro. This also bears on the DPA question. (The creator privacy notice already avoids claiming a Vercel DPA for this reason.) |
| L | The project region is `fra1` (Frankfurt) per `vercel.json`; CDN/edge logs may be processed elsewhere. | Vercel → Project → Settings → Functions: confirm region; ask where request logs are stored. |
| T | Vercel is a US company. Safeguard not established. | Ask for the transfer mechanism in the DPA. |
| R | Logs follow Vercel's plan retention. | Project → Logs: note the retention shown. |

## 5. Cloudflare (Stream video delivery)
| | What the provider says | What you check |
|---|---|---|
| A | The Cloudflare Customer DPA covers Enterprise **and Self-Serve** agreements. | Confirm which version applies to your account (the main page listed a newer version than the PDF I saw) and file it. |
| L | The Data Localization Suite is Enterprise-only; I found **no Stream-specific storage-location statement**. The creator privacy notice already says Stream cannot be region-locked. | Ask Cloudflare (or read Stream docs) whether Stream stores/serves outside the EEA; no claim is made on the pages. |
| T | DPA relies on the EU-US DPF with EU SCCs as a fallback. | Verify the DPF listing and the DPA version. |
| R | Videos stay until deleted in Stream. | Note for the portfolio videos. |

## 6. Google Analytics / Google Tag Manager
| | What the provider says | What you check |
|---|---|---|
| A | Google's Ads Data Processing Terms replaced the older Analytics amendment; for EEA/UK/Swiss accounts they are built into the contract. | **Analytics → Admin → Account settings → Data processing terms**: confirm accepted/shown, and the legal entity and contact fields are filled. Do the same for **Tag Manager**. Needs Editor role. |
| S | Owner-confirmed: event retention 14 months, user retention 14 months, Google signals OFF, user-provided data OFF, automatic form interactions OFF, browser-history page views OFF. | Admin → Data settings → **Data retention**: confirm 14 months for both and the **"Reset user data on new activity"** toggle (see `docs/data-retention-and-deletion.md`: recommended OFF). Admin → Data collection: signals OFF. Admin → Data streams → Enhanced measurement: form interactions and history-based page views OFF. Admin → Data sharing settings: review. |
| L/T | Google processes data globally; transfers rest on Google's terms. | Read Google's terms text referenced in the account; policy says "transfers outside the EEA" generically. |
| Cookies | `_ga` and `_ga_<id>`: Google's documentation gives a default lifetime of two years (verify). | Set a shorter cookie lifetime in the Google tag settings only if your adviser wants one; otherwise state the real value in the policy. |

## 7. Other places that touch personal data (confirm none missing)
Google Forms (creator link), Upstash and Cloudflare R2/Stream (private creator onboarding, covered by its own notice), your own mailbox/Gmail, Fiverr (creators). You confirmed there is **no additional CRM**.

## How to record the result
For each row: tick it, note the date and the document version/URL, and send me the answers. I then replace the matching `[OWNER TO CONFIRM]` marker with confirmed wording. I never state an agreement, location or safeguard that is not on this list as confirmed.
