/* ─────────────────────────────────────────────
   Creative Growth Roadmap — qualification questions.

   Option labels are the radio-button labels shown on the page, and the values
   that src/lib/roadmapQualification.js matches against. Nothing else is collected
   here: Calendly's booking form handles name, email and booking details.
───────────────────────────────────────────── */

export const BUSINESS_TYPE_OPTIONS = ['SaaS / Software', 'E-commerce / DTC', 'Marketing agency', 'Other']

export const SPEND_OPTIONS = [
  'Not running paid ads yet',
  'Under $5,000',
  '$5,000–$20,000',
  '$20,000+',
]

export const CHALLENGE_OPTIONS = [
  'Finding fresh advertising angles',
  'Improving ad creative performance',
  'Producing more video ads',
  'Preparing to launch paid advertising',
]

export const TIMELINE_OPTIONS = [
  'Immediately / This month',
  'Within 1–3 months',
  'Just exploring options',
]

export const INVESTMENT_OPTIONS = [
  'Yes, we’re actively looking for a production partner',
  'Possibly, depending on the creative strategy',
  'Not yet, we’re only researching',
]

const oneOf = (options, value) => options.includes(value)

/* Returns { field: message } for every unanswered question ({} when complete). */
export function validateAnswers(v) {
  const errors = {}
  if (!oneOf(BUSINESS_TYPE_OPTIONS, v.businessType)) errors.businessType = 'Select what best describes your business.'
  if (!oneOf(SPEND_OPTIONS, v.adSpend)) errors.adSpend = 'Select your monthly paid advertising spend.'
  if (!oneOf(CHALLENGE_OPTIONS, v.challenge)) errors.challenge = 'Select your biggest creative challenge.'
  if (!oneOf(TIMELINE_OPTIONS, v.timeline)) errors.timeline = 'Select when you’re looking to produce new creatives.'
  if (!oneOf(INVESTMENT_OPTIONS, v.investment)) errors.investment = 'Select whether you’re looking to invest in professional video production.'
  return errors
}
