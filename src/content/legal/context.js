/* The values a legal translation needs from the codebase, in ONE object, so a translation never retypes an operator detail, a link target, a retention period's
   source value or a path. The English legal documents (src/content/trustPages.js) read the same values.

   Each locale module (src/content/legal/es.js, fr.js, ar.js) exports  (c) => ({ privacy, terms, legalNotice })  with exactly the shape and the section/body/list
   structure of TRUST_CONTENT.privacy / .terms / .legalNotice. scripts/legal-structure-check.mjs and tests/legal-translations.test.mjs prove the structure matches. */

import { CONTACT_EMAIL, COMPANY_LINKEDIN_URL, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH } from '../../config.js'
import { OPERATOR } from '../operator.js'
import { USAGE_RIGHTS } from '../../seo/businessKnowledge.js'
import { CURRENT_MARKETING_CONSENT_VERSION, marketingConsentText } from '../marketingConsent.js'
import { consentConfigured } from '../../lib/consent.js'
import { DRAFT_DATE } from '../trustPages.js'

export function legalContext() {
  return {
    /* The English effective date as written in the English documents ("21 November 2026"). Preserved: a translation writes the SAME date in its own language, never today's date. */
    englishDate: DRAFT_DATE,
    /* Inline-link token for the contact email: write it as `${c.mail}`. */
    mail: `[[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]]`,
    email: CONTACT_EMAIL,
    /* The operator's identity. `structure` is the English phrase "a self-employed professional (autónomo) registered in Spain": translate it, keep "autónomo". */
    operator: { tradingName: OPERATOR.tradingName, name: OPERATOR.name, structure: OPERATOR.structure, taxId: OPERATOR.taxId, address: OPERATOR.address },
    /* Link targets used inside the documents (write links as [[label|target]]). */
    links: { companyLinkedin: COMPANY_LINKEDIN_URL, privacy: PRIVACY_PATH, terms: TERMS_PATH, legalNotice: LEGAL_NOTICE_PATH, pricing: '/pricing' },
    /* The Privacy Policy describes the build it ships in: true when Google Analytics is switched on (VITE_GTM_ID set). Provide BOTH branches, like the English text. */
    analyticsActive: consentConfigured(),
    /* The marketing-email wording (a versioned legal text shown in English only). Quote it VERBATIM, in English, inside the translation. */
    marketingConsentText: marketingConsentText(),
    marketingConsentVersion: CURRENT_MARKETING_CONSENT_VERSION,
    /* Months of worldwide use in the standard packages (a number from the business data). */
    usageMonths: USAGE_RIGHTS.includedMonths,
  }
}
