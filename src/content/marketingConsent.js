/* ─────────────────────────────────────────────
   Marketing-email consent: the ONE place that defines the wording and its version.

   Shared by the forms (what the visitor reads next to the checkbox) and by the
   server (api/_lib/marketing.js, which records which version was shown). The
   server never trusts wording sent by a browser: it only accepts a version
   number it knows, and it looks the wording up here.

   RULES
   • A version's text is IMMUTABLE once a form has shown it. To change the wording
     (even one word), add a new version and make it CURRENT; never edit an old one.
     tests/marketing-consent.test.mjs pins every text so an edit fails the suite.
   • Ticking the box is OPTIONAL, UNCHECKED by default and never required to
     submit a form, receive a requested resource or have an application reviewed.
   • 'v1' is the wording the free-hooks form showed BEFORE this change. No
     consent record was stored then (the only evidence is membership of the
     MailerLite marketing group); it stays listed so a page cached in a browser
     during the release can still be recorded correctly.
───────────────────────────────────────────── */

export const MARKETING_CONSENT_VERSIONS = {
  v1: {
    introducedOn: 'before 2026-11-21 (free-hooks form only)',
    text: 'Also send me occasional creative tips and offers from CONVRT. (Optional)',
  },
  v2: {
    introducedOn: '2026-11-21 (all forms)',
    text: 'Also email me occasional creative tips and offers from CONVRT. You can unsubscribe at any time. (Optional)',
  },
}

export const CURRENT_MARKETING_CONSENT_VERSION = 'v2'

/* Where the tick came from. Stored with the consent so each record says which form it was given on. */
export const CONSENT_SOURCES = ['free-hooks-saas', 'free-hooks-ecommerce', 'risk-free-application', 'referral-application']

export const marketingConsentText = (version = CURRENT_MARKETING_CONSENT_VERSION) =>
  MARKETING_CONSENT_VERSIONS[version]?.text ?? null

export const isKnownConsentVersion = (version) =>
  typeof version === 'string' && Object.hasOwn(MARKETING_CONSENT_VERSIONS, version)
