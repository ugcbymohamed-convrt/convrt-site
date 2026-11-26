> **Update (26 Nov 2026):** the Spanish, French and Arabic legal documents now exist as translations (`src/content/legal/`), built but held until approved. See `docs/contact-about-legal-localization.md`; this note describes the earlier state.

# Legal pages: what a complete Spanish release needs

The English About, Contact, Privacy Policy, Terms of Service and Legal Notice are published and approved. **Nothing in the legal meaning was changed and the legal documents are NOT built in Spanish**
(`TRANSLATED_PATHS.es` lists only About and Contact; the tests pin that `/es/privacy`, `/es/terms`, `/es/legal-notice` do not exist and answer 404).

## What exists
| Document | Spanish status | Where a Spanish page links |
|---|---|---|
| About | translated and published in the candidate (`/es/about`); the sentence on the autónomo operator keeps "profesional autónomo registrado en España" and the same facts | — |
| Contact | translated (`/es/contact`); lines that point into English-only flows (Roadmap, referral program, creator form) are left out in Spanish | — |
| Privacy Policy | **prepared for review, not published** | Spanish footer links the English policy, labelled "Política de privacidad (en inglés)" and marked `lang="en"` |
| Terms of Service | **prepared for review, not published** | same, "Términos (en inglés)" |
| Legal Notice (Aviso Legal) | **prepared for review, not published** | same, "Aviso legal (en inglés)" |
The review translations are kept **outside the repository** (the repo is public and the documents carry the operator's tax ID and address): `~/Desktop/CONVRT/Claude/multilingual-es/legal-translation-review/`.

## Needed for a complete Spanish release (owner/lawyer decisions)
1. **Is an English-only legal set acceptable on a Spanish site?** A Spanish-language business audience reads the Spanish pages, but forms/consents/legal links lead to English text. Spanish law (LSSI art. 10 identification; RGPD art. 12 "clear and plain language") generally favours legal information in a language the recipient understands. Recommendation: publish the three Spanish documents, reviewed by a lawyer, before indexing Spanish pages, and keep English as the reference version stating which prevails.
2. **Which version prevails** if the two differ (suggest: Spanish documents say the Spanish text governs for Spanish-language visitors, or the English governs; a lawyer must choose). Not added, so no obligation changes.
3. **Marketing-consent wording in Spanish** (needs its own versioned record: do not reuse "v2"); only relevant when the forms are translated.
4. **Cookie/consent banner** is English-only and inactive in Production (no GTM). If analytics is ever switched on for Spanish visitors, the banner and its Privacy text must exist in Spanish first.
5. **Privacy Policy storage list** is exhaustive: any new browser storage (for example a stored language preference) needs a line in both languages. Added: `convrt_language` (the explicit language choice, used by the language suggestion; `docs/language-suggestion.md`): the Spanish privacy policy needs the same line.
6. **Privacy text says nothing about the language selector or hreflang**, because neither collects data.
7. **Questions flagged inside each draft** (terminology: autónomo, leads, "tal cual"; fuero; limitation of liability fit with Spanish law; controller/processor wording).

## Rules kept
No change to the operator identity (Mohamed Doukkali Azizi, autónomo registered in Spain; trading name CONVRT Studio; B2B only); no new obligation, jurisdiction, liability clause or data use was added in any translation; the Spanish About says "founder-led" and "B2B only" exactly like the English.
