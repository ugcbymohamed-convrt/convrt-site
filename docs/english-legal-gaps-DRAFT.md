# English Privacy Policy and Terms: proposed additions (DRAFT for owner confirmation)

**Nothing here is on the website.** It is proposed English wording, built only from what the site and its code already say or do. Once you confirm it (ideally with your lawyer), I put it into `src/content/trustPages.js`, then update the Spanish, French and Arabic translations and the structure checks so the four languages stay identical in structure. Items marked **OWNER INPUT** are facts or business terms only you can supply.

Where the current Privacy Policy already covers the point, that is stated first, so you do not approve something twice.

---

## A. Privacy Policy

### What already covers the new forms (no change needed)
- **Retention.** "Applications and enquiries that do not lead to a project: 12 months after our last meaningful contact with you." This already fits Contact-form inquiries and project applications.
- **Resend and the US transfer.** Resend is already listed as a provider ("email alerts to us when someone applies") and the EU-US Data Privacy Framework sentence is already there.
- **Marketing.** Neither new form adds anyone to a marketing list (the code sends one email to you and stores nothing else), so the marketing section stays correct.

### A1. Add two bullets to "What we collect, why, and on what basis"
Place them after "Referral Partner Program".

> **General enquiry form.** On the Contact page we collect your name, email, brand or company name, the service you are interested in, your message and your confirmation that you have read this policy, and optionally your website or social profile and an estimated budget range. We email these details to ourselves and use them to reply to you, to decide whether and how we can help, and to prepare a proposal if you ask for one. They are not added to our marketing list. Basis: steps you ask us to take before an agreement, and our legitimate interest in answering business enquiries.

> **Project application.** When you apply for a package we collect your name, email, brand or company name, your website or social profile, the package you selected, your answers about your project (a description and objective, your advertising spend or current social media activity, for custom projects the type of production and an estimated budget, how soon you are ready, your desired start date and production languages) and your acknowledgement of the package terms. We also record the language of the page, the page you came from and, if you arrived through a campaign link, its campaign details (utm_source, utm_medium, utm_campaign, utm_content and utm_term) and, only if you accepted analytics, the first page of your visit. We email these details to ourselves to review your application and decide the next step personally. The price shown comes from our own pricing, never from your browser. The application is not a purchase and does not authorise a payment. They are not added to our marketing list. Basis: as for the general enquiry form.

### A2. "Who we share information with"
Change `Resend (email alerts to us when someone applies)` to:

> Resend (email alerts to us when someone applies or sends an enquiry)

### A3. "How long we keep it"
Change the first bullet to:

> Applications, enquiries and project applications that do not lead to a project: 12 months after our last meaningful contact with you.

**OWNER INPUT:** is 12 months the period you want for Contact-form inquiries? (It is the one already published for applications.)

### A4. "Browser storage we use"
Current text for `convrt_scale_attribution`: "...so they can be passed on to our booking link." Proposed:

> convrt_scale_attribution (this browser tab only): the campaign details in the link you arrived through (utm_source, utm_medium, utm_campaign, utm_content and utm_term), so they can be passed on to our booking link or included in an application you send us. We do not store advertising click identifiers (such as gclid or fbclid).

### A5. "Marketing emails" section
The first sentence says the optional box "appears next to our forms". The Contact form and the project application have no such box. Proposed:

> We send promotional emails (creative tips and offers) only if you tick the optional box that appears next to some of our forms (not the general enquiry form or the project application). The box is never ticked for you...

### A6. "Booking a call" and the "Free Creative Growth Roadmap" bullet
No change needed for accuracy today: the Roadmap still offers the calendar to qualified visitors, `/scale`, `/pricing` and the organic page still link it. **If you decide to remove the public Calendly links, this section and the operator list ("book a call") must change too.** Tell me the decision and I do both together.

---

## B. Terms and Conditions

The current Terms say a paid engagement begins only when scope, price and terms are agreed in writing, but are silent on the commitment terms the pricing pages publish. Proposed addition to "Our services and how they are agreed", using only what the site already states publicly (`src/seo/businessKnowledge.js`):

> **Commitments.** Creative Testing packages bought monthly begin with an initial three-month commitment, followed by a flexible month-to-month agreement with 30 days' cancellation notice. Organic Social packages begin with an initial six-month commitment; the terms after that period are set out in the applicable agreement. A one-time Creative Testing package is one production batch with no recurring commitment. We never guarantee specific results.

> **Deliverables and timing.** The number of concepts, scripts and finished ad versions, the number of creators and the revision rounds for each package are those shown on the pricing page when you agree. Turnaround for the Creative Testing packages is as stated there (currently 10 business days for Creative Testing Sprint and 15 business days for Sprint Plus), counted from the date we have everything we need from you. Each package includes two revision rounds per concept.

> **Usage rights.** (Already in the Terms: "Usage rights".) No change.

**OWNER INPUT (I will not invent these):**
1. **Payment terms.** When do you invoice (upfront, per batch, monthly in advance)? Payment due date? Late payment?
2. **Refunds and cancellation.** Do you refund anything? What happens to a one-time package if the client cancels before delivery? Is the 30-day notice on the monthly plan counted from the next billing date?
3. **Client responsibilities.** Product shipping, approval delays, materials you need from the client, what happens if the client delays.
4. **Revisions beyond two rounds.** Charged or not?
5. **Do you want a clause saying a signed client agreement overrides the website terms?** (The Terms already have "Website terms and signed client agreements"; confirm it is enough.)
6. **Contact-form wording.** The current "Enquiries and applications" section already covers sending an enquiry or application. Nothing further proposed.

---

## C. Legal Notice

The English Legal Notice says prices are in US dollars, which is right for the English site. The Spanish and French translations now say euros and Arabic says US dollars. If you prefer, I can make the sentence general in all four languages: "Prices are shown on each page in the currency of that page's language." **OWNER INPUT:** keep as is, or make it general?

---

## D. What I do after your confirmation
1. Put A1 to A5 (and B, once you answer the owner questions) in the English documents.
2. Update the Spanish, French and Arabic translations of the same clauses, regenerate the review pack (`node scripts/legal-review-export.mjs`), and flag the new clauses for your lawyer.
3. Update the effective date shown on the policies.
4. Run the full suite and the structure checks, merge, deploy.
