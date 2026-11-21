# What Spanish law requires a commercial website to show (autónomo)

Research on 21 Nov 2026 from the consolidated BOE text and guidance sites. **This is not legal advice**; items marked "adviser" need your Spanish legal adviser. I could confirm the structure of art. 10 on the BOE page but could not verify whether a 2024 consolidation changed it, so check the live text before relying on it.

## A. General information (Ley 34/2002, "LSSI", art. 10)
The provider of an information-society service that carries on an economic activity must make the following available, by electronic means, **permanently, easily, directly and free of charge**. It is enough that they appear on the website.

| Required | Your situation | Status on the draft pages |
|---|---|---|
| Name or business name | Mohamed Doukkali Azizi, trading as CONVRT Studio (owner-confirmed) | **Present** (legal notice at the top of the Terms; Privacy "Who is responsible"; Contact) |
| Domicile, or the address of a permanent establishment in Spain | Postal address on file (creator agreements) | **Missing: hidden until you approve** (`LEGAL_NOTICE_DETAILS_APPROVED`). A visible marker shows where it goes. |
| Email address **and** another means of direct, effective communication | Email + Calendly booking link + company LinkedIn | **Present.** (Guidance and EU case law generally accept email plus a second quick channel such as a contact form; whether a booking link and LinkedIn qualify: **adviser**.) You asked for no public phone, and none was added. |
| Registry data (Registro Mercantil or other public register) if registered | An autónomo is normally not in the commercial register | Not applicable unless you are registered in one: **owner to confirm** |
| Tax identification number (NIF) | On file (creator agreements) | **Missing: hidden until you approve** (same flag) |
| Authorisation / professional-body data, only for regulated activities | Not a regulated profession as far as I know | Not applicable (**owner to confirm**) |
| Prices, clearly and with tax information, when the site gives prices | Prices exclude VAT (stated on the site) | Present on `/pricing` and in the Terms |

**Where it is shown.** A dedicated "Legal notice" section at the top of `/terms`, reachable from the footer once published, plus the same identity lines in the Privacy Policy and a pointer on `/contact`. A separate "Aviso legal" page is common in Spain but not required; the content is what matters.

**Consequence of the gap.** Omitting art. 10 information is an infringement under the LSSI (guidance sites say minor, with fines up to EUR 30,000; verify in the BOE). For this reason `tests/trust-pages.test.mjs` refuses `TRUST_PAGES_PUBLISHED = true` while the NIF and address are hidden.

## B. Commercial emails and cookies (LSSI art. 21 and 22)
* **Art. 21:** promotional emails need the recipient's prior, express consent, with an exception for existing customers about similar products, and every message must identify itself as commercial and offer a simple free way to refuse. This is why the marketing box is optional and unchecked and why `service_only` contacts must not be mailed (`docs/marketing-consent-mailerlite.md`).
* **Art. 22.2:** storing or reading information on a visitor's device needs consent, except for what is strictly necessary. The site's analytics are consent-gated; Calendly's cookies are a separate question (`docs/booking-embed-and-cookies.md`).

## C. Data protection (RGPD / LOPDGDD)
Identity and contact details of the controller, purposes and legal bases, recipients, transfers, retention, rights, withdrawal and the right to complain to the **AEPD** (Agencia Española de Protección de Datos, www.aepd.es). All are in the Privacy draft; the legal bases, retention and transfer details are flagged `[LEGAL REVIEW]` / `[OWNER TO CONFIRM]`. A data protection officer or a record of processing activities is usually not required for a business this size, but the record of processing is a good internal document (adviser).

## D. B2B only
You said the site is exclusively B2B. Consumer-protection rules (right of withdrawal, consumer-facing terms) therefore should not apply, and the Terms say so. Whether your marketing could reach a sole trader who is a "consumer" in practice is an **adviser** question.

## E. Still missing today (list for you)
1. Postal address and NIF: approve showing them (or tell me not to) and the flag flips.
2. Confirm "no registry data" / "no regulated activity".
3. Adviser view: is email + Calendly link + LinkedIn enough as "another means of direct communication"?
4. Everything marked `[LEGAL REVIEW]` in the Privacy and Terms drafts.

Sources: [BOE consolidated text of Ley 34/2002](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758); [INCIBE: aviso legal](https://www.incibe.es/index.php/empresas/blog/aviso-legal-parte-importante-tu-web); [Legalitas: requisitos legales para web](https://www.legalitas.com/actualidad/requisitos-legales-para-web-o-blog).
