/* ─────────────────────────────────────────────
   Risk-Free Trial application — questions, contact fields and validation.

   Shared by the browser form (src/components/riskfree/RiskFreeApplication.jsx)
   and the serverless endpoint (api/_lib/apply.js), so both sides accept
   exactly the same options. Option labels are the radio-button labels shown
   on the page.

   Nothing here qualifies or disqualifies anyone: every valid application is
   saved for manual review (see docs/risk-free-application-setup.md). There is
   deliberately no minimum ad spend.
───────────────────────────────────────────── */

export const QUESTIONS = [
  {
    field: 'businessType',
    legend: 'What best describes your business?',
    options: ['SaaS / Software', 'E-commerce / DTC brand', 'Marketing agency', 'Other'],
    error: 'Select what best describes your business.',
    columns: 2,
  },
  {
    field: 'adSpend',
    legend: 'What’s your approximate monthly paid advertising spend?',
    options: ['Not running paid ads yet', 'Under $5,000', '$5,000–$20,000', '$20,000+'],
    hint: 'Helps us understand your setup. It won’t automatically disqualify you.',
    error: 'Select your monthly paid advertising spend.',
    columns: 2,
  },
  {
    field: 'videosPerMonth',
    legend: 'How many video ads does your brand currently produce per month?',
    options: ['0–2 videos', '3–5 videos', '6–10 videos', '10+ videos'],
    error: 'Select how many video ads you produce per month.',
    columns: 2,
  },
  {
    field: 'videoType',
    legend: 'What type of video would you like to test?',
    options: ['UGC / Creator-led ad', 'Spokesperson video', 'SaaS product demo / Explainer', 'Other'],
    error: 'Select the type of video you’d like to test.',
    columns: 2,
  },
  {
    field: 'timeline',
    legend: 'When are you looking to produce new video ads?',
    options: ['Immediately / This month', 'Within 1–3 months', 'Just exploring options'],
    error: 'Select when you’re looking to produce new video ads.',
    columns: 1,
  },
  {
    field: 'ongoing',
    legend: 'If the trial performs well, would you consider ongoing video production with CONVRT?',
    options: [
      'Yes, we’re actively looking for a production partner',
      'Possibly, depending on the results',
      'No, we’re only interested in the free video',
    ],
    error: 'Select whether you’d consider ongoing video production.',
    columns: 1,
  },
]

export const QUESTION_FIELDS = QUESTIONS.map((q) => q.field)

export const EMPTY_APPLICATION = {
  businessType: '',
  adSpend: '',
  videosPerMonth: '',
  videoType: '',
  timeline: '',
  ongoing: '',
  fullName: '',
  email: '',
  website: '',
  brief: '',
}

export const LIMITS = { name: 100, email: 254, website: 200, brief: 1000 }

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// "example.com", "www.example.co.uk/path", "https://example.com" — no spaces, no "@".
const WEBSITE_RE = /^(https?:\/\/)?[^\s/@.]+(\.[^\s/@.]+)*\.[^\s/@.]{2,}(\/\S*)?$/i

const str = (v) => (typeof v === 'string' ? v.trim() : '')

/* "example.com" → "https://example.com". Leaves an existing http(s) scheme alone. */
export function normalizeWebsite(value) {
  const v = str(value)
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

/* Trims every field and normalises the website. Always returns every key as a string. */
export function normalizeApplication(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out = {}
  for (const key of Object.keys(EMPTY_APPLICATION)) out[key] = str(src[key])
  out.email = out.email.toLowerCase()
  out.website = normalizeWebsite(out.website)
  return out
}

/* Returns { field: message } for every problem ({} when valid). Expects raw or
   normalised values — it normalises internally. */
export function validateApplication(raw) {
  const v = normalizeApplication(raw)
  const errors = {}

  for (const q of QUESTIONS) {
    if (!q.options.includes(v[q.field])) errors[q.field] = q.error
  }

  if (!v.fullName) errors.fullName = 'Enter your full name.'
  else if (v.fullName.length > LIMITS.name) errors.fullName = 'That name is too long.'

  if (!v.email) errors.email = 'Enter your work email.'
  else if (v.email.length > LIMITS.email || !EMAIL_RE.test(v.email)) errors.email = 'That email address doesn’t look right.'

  if (!str(raw?.website)) errors.website = 'Enter your company website.'
  else if (v.website.length > LIMITS.website || !WEBSITE_RE.test(v.website)) errors.website = 'Enter a valid website, like yourcompany.com.'

  if (v.brief.length > LIMITS.brief) errors.brief = `Please keep this under ${LIMITS.brief} characters.`

  return errors
}

/* Field order used to focus the first invalid field. */
export const FIELD_ORDER = [...QUESTION_FIELDS, 'fullName', 'email', 'website', 'brief']
