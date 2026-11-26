/* ─────────────────────────────────────────────
   General contact inquiry (/contact, /es/contact, /fr/contact, /ar/contact): fields, options, normalisation and validation.

   Shared by the browser form (src/components/contact/ContactForm.jsx) and the serverless endpoint (api/_lib/contact.js), so both sides accept exactly the same values.
   Option VALUES are stable English keys; the labels a visitor reads live in src/content/contactCopy.js (one set per language).

   This is the GENERAL inquiry route. It is deliberately not a package application and not the Creative Growth Roadmap or the free-video application: it collects who is asking,
   how to reach them, which service they are curious about and a free-text description. Nothing here approves anyone, schedules anything or promises a reply time.

   Required: full name, email, brand or company, service, project description, and the consent to be contacted about the inquiry.
   Optional: website or social media (so prospects without a conventional company website are never turned away) and estimated budget.
───────────────────────────────────────────── */

/* English labels of every option, used in the owner's notification (the owner reads English). The visitor sees the localized label for the same key. */
export const SERVICES = {
  ugc: 'UGC Videos',
  spokesperson: 'Spokesperson Videos',
  organic: 'Organic Social Video',
  saas: 'SaaS & App Videos',
  custom: 'Custom Project',
  unsure: 'Not sure yet',
}
export const SERVICE_KEYS = Object.keys(SERVICES)

/* Estimated budget. The bands are the approved qualification ranges already used by the Creative Growth Roadmap and the free-video application ("Under $5,000", "$5,000–$20,000",
   "$20,000+"), plus "not sure yet". They are not a minimum: choosing the lowest band, or none, never blocks an inquiry. The currency a visitor SEES follows the language (USD in English and
   Arabic, EUR in Spanish and French: src/content/contactCopy.js); the stored key is currency-neutral and the notification names the language, so the owner knows which one was shown. */
export const BUDGETS = {
  'under-5k': 'Under 5,000',
  '5k-20k': '5,000 to 20,000',
  '20k-plus': '20,000+',
  unsure: 'Not sure yet',
}
export const BUDGET_KEYS = Object.keys(BUDGETS)
export const BUDGET_CURRENCY = { en: 'USD', ar: 'USD', es: 'EUR', fr: 'EUR' }
export const CONTACT_LOCALES = ['en', 'es', 'fr', 'ar']

export const LIMITS = { name: 100, email: 254, company: 120, website: 200, message: 2000 }
export const MIN_MESSAGE = 10

export const EMPTY_INQUIRY = { fullName: '', email: '', company: '', website: '', service: '', budget: '', message: '', consent: false }
export const FIELD_ORDER = ['fullName', 'email', 'company', 'website', 'service', 'budget', 'message', 'consent']

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/* A website OR a social profile: "example.com", "https://example.com/x", "instagram.com/brand", "linkedin.com/company/x", "@brand" (a handle), "tiktok.com/@brand". Free text with spaces is refused. */
const WEBSITE_RE = /^(https?:\/\/)?[^\s/@.]+(\.[^\s/@.]+)*\.[^\s/@.]{2,}(\/\S*)?$/i
const HANDLE_RE = /^@[A-Za-z0-9._-]{2,60}$/

const str = (v) => (typeof v === 'string' ? v.trim() : '')

/* "example.com" → "https://example.com". A handle ("@brand") and an existing http(s) address are left alone. */
export function normalizeWebsite(value) {
  const v = str(value)
  if (!v || HANDLE_RE.test(v)) return v
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

/* Trims every field, lower-cases the email and normalises the website. Always returns every key (strings, and `consent` as a strict boolean). */
export function normalizeInquiry(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out = {}
  for (const key of Object.keys(EMPTY_INQUIRY)) out[key] = key === 'consent' ? src.consent === true : str(src[key])
  out.email = out.email.toLowerCase()
  out.website = normalizeWebsite(out.website)
  return out
}

/* Returns { field: code } for every problem ({} when valid). Codes: 'required' | 'invalid' | 'tooLong' | 'tooShort'. The visitor-facing sentence for each code is localized in contactCopy.js. */
export function validateInquiry(raw) {
  const v = normalizeInquiry(raw)
  const errors = {}

  if (!v.fullName) errors.fullName = 'required'
  else if (v.fullName.length > LIMITS.name) errors.fullName = 'tooLong'

  if (!v.email) errors.email = 'required'
  else if (v.email.length > LIMITS.email || !EMAIL_RE.test(v.email)) errors.email = 'invalid'

  if (!v.company) errors.company = 'required'
  else if (v.company.length > LIMITS.company) errors.company = 'tooLong'

  // Optional: only checked when something was typed.
  if (v.website) {
    if (v.website.length > LIMITS.website) errors.website = 'tooLong'
    else if (!HANDLE_RE.test(v.website) && !WEBSITE_RE.test(v.website)) errors.website = 'invalid'
  }

  if (!v.service) errors.service = 'required'
  else if (!SERVICE_KEYS.includes(v.service)) errors.service = 'invalid'

  if (v.budget && !BUDGET_KEYS.includes(v.budget)) errors.budget = 'invalid'

  if (!v.message) errors.message = 'required'
  else if (v.message.length < MIN_MESSAGE) errors.message = 'tooShort'
  else if (v.message.length > LIMITS.message) errors.message = 'tooLong'

  if (!v.consent) errors.consent = 'required'

  return errors
}
