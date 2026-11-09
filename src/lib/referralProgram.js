/* ─────────────────────────────────────────────
   Referral Partner Program — options, copy constants and validation.

   Shared by the browser form (src/components/referrals/ReferralForm.jsx) and the
   serverless endpoint (api/_lib/referral.js) so both sides accept exactly the
   same values. Option labels are the radio-button labels shown on the page.

   Nothing here approves anyone or promises a reward: every valid submission is
   saved for MANUAL review (docs/referral-program-setup.md).
───────────────────────────────────────────── */

export const PARTNER_TYPES = ['Existing client', 'Agency', 'Consultant', 'Creator', 'Founder', 'Other']

export const PROGRAMS = {
  standard: 'Standard Referral',
  agency: 'Agency / Strategic Partner',
}
export const PROGRAM_OPTIONS = [PROGRAMS.standard, PROGRAMS.agency]

export const EMPTY_REFERRAL = {
  fullName: '',
  email: '',
  partnerType: '',
  program: '',
  partnerCompany: '',
  partnerWebsite: '',
  referredCompany: '',
  referredWebsite: '',
  referralNotes: '',
  consent: false,
}

export const LIMITS = { name: 100, email: 254, company: 120, website: 200, notes: 1000 }

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// "example.com", "www.example.co.uk/path", "https://linkedin.com/in/someone" — no spaces, no "@".
const WEBSITE_RE = /^(https?:\/\/)?[^\s/@.]+(\.[^\s/@.]+)*\.[^\s/@.]{2,}(\/\S*)?$/i

/* A third party's email address or phone number must not be collected through the
   referral fields (we have no basis to hold it yet). Deliberately conservative: it
   flags things that look like an email or a phone number, not years or amounts. */
const EMAIL_IN_TEXT_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/
const PHONE_IN_TEXT_RE =
  /\+\d[\d\s().-]{7,}\d|\(\d{2,4}\)[\s.-]?\d{3,4}[\s.-]?\d{3,4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{3,4}\b|\b\d{10,15}\b/
export const looksLikeContactDetails = (text) => EMAIL_IN_TEXT_RE.test(text) || PHONE_IN_TEXT_RE.test(text)

const CONTACT_DETAILS_ERROR =
  'Please remove email addresses and phone numbers. We’ll ask for contact details later, with the right permission.'

const str = (v) => (typeof v === 'string' ? v.trim() : '')

/* "example.com" → "https://example.com". Leaves an existing http(s) scheme alone. */
export function normalizeWebsite(value) {
  const v = str(value)
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

/* Trims every text field, lower-cases the email and normalises both websites.
   Always returns every key (strings, and `consent` as a strict boolean). */
export function normalizeReferral(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out = {}
  for (const key of Object.keys(EMPTY_REFERRAL)) out[key] = key === 'consent' ? src.consent === true : str(src[key])
  out.email = out.email.toLowerCase()
  out.partnerWebsite = normalizeWebsite(out.partnerWebsite)
  out.referredWebsite = normalizeWebsite(out.referredWebsite)
  return out
}

/* Returns { field: message } for every problem ({} when valid). */
export function validateReferral(raw) {
  const v = normalizeReferral(raw)
  const errors = {}

  if (!v.fullName) errors.fullName = 'Enter your full name.'
  else if (v.fullName.length > LIMITS.name) errors.fullName = 'That name is too long.'

  if (!v.email) errors.email = 'Enter your email address.'
  else if (v.email.length > LIMITS.email || !EMAIL_RE.test(v.email)) errors.email = 'That email address doesn’t look right.'

  if (!PARTNER_TYPES.includes(v.partnerType)) errors.partnerType = 'Select what best describes you.'
  if (!PROGRAM_OPTIONS.includes(v.program)) errors.program = 'Select which program you’re joining.'

  if (v.partnerCompany.length > LIMITS.company) errors.partnerCompany = 'That name is too long.'

  if (v.partnerWebsite && (v.partnerWebsite.length > LIMITS.website || !WEBSITE_RE.test(v.partnerWebsite))) {
    errors.partnerWebsite = 'Enter a valid website or LinkedIn address, like linkedin.com/in/yourname.'
  }

  if (v.referredCompany.length > LIMITS.company) errors.referredCompany = 'That name is too long.'
  else if (looksLikeContactDetails(v.referredCompany)) errors.referredCompany = CONTACT_DETAILS_ERROR

  if (v.referredWebsite && (v.referredWebsite.length > LIMITS.website || !WEBSITE_RE.test(v.referredWebsite))) {
    errors.referredWebsite = 'Enter a valid website, like theirbrand.com.'
  }

  if (v.referralNotes.length > LIMITS.notes) errors.referralNotes = `Please keep this under ${LIMITS.notes} characters.`
  else if (looksLikeContactDetails(v.referralNotes)) errors.referralNotes = CONTACT_DETAILS_ERROR

  if (!v.consent) errors.consent = 'Please confirm you agree so we can review your application.'

  return errors
}

/* Field order used to focus the first invalid field. */
export const FIELD_ORDER = [
  'fullName', 'email', 'partnerType', 'program', 'partnerCompany', 'partnerWebsite',
  'referredCompany', 'referredWebsite', 'referralNotes', 'consent',
]

/* What a reward card's CTA does to the form. `card` is 'standard' | 'agency'.
   • The card's program is always selected.
   • The Agency card also pre-selects partner type "Agency", but only while the visitor
     hasn't chosen a partner type themselves (a consultant can be a strategic partner). */
export function applyCardSelection(card, current) {
  const program = card === 'agency' ? PROGRAMS.agency : PROGRAMS.standard
  const partnerType = card === 'agency' && !current.partnerType ? 'Agency' : current.partnerType
  return { ...current, program, partnerType }
}
