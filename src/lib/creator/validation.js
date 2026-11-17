/* Creator onboarding validation. Pure functions, used by the form (for instant feedback) and by the
   server (the authority): the server never trusts the browser, it runs exactly this code again. */

import {
  LANGUAGES, SPECIALIZATIONS, VIDEO_EXTENSIONS, VIDEO_MIME_TYPES, VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS, humanBytes,
} from './constants.js'

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/g

/* Collapses whitespace, strips control characters, NFC-normalises. */
export const clean = (v) => String(v ?? '').replace(CONTROL, ' ').normalize('NFC').replace(/\s+/g, ' ').trim()

const hasLetter = (s) => /\p{L}/u.test(s)

/* Fiverr profile URLs: https://www.fiverr.com/<username> (or fiverr.com/…). Returns a normalised https URL or null. */
export function normalizeFiverrUrl(raw) {
  let s = clean(raw)
  if (!s) return null
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`
  let u
  try {
    u = new URL(s)
  } catch {
    return null
  }
  const host = u.hostname.toLowerCase()
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  if (host !== 'fiverr.com' && host !== 'www.fiverr.com') return null
  if (u.username || u.password) return null
  if (u.pathname.replace(/\//g, '').length < 2) return null
  const out = `https://www.fiverr.com${u.pathname.replace(/\/+$/, '')}`
  return out.length <= 200 ? out : null
}

const pickAllowed = (list, allowed) => [...new Set((Array.isArray(list) ? list : []).filter((x) => allowed.includes(x)))]

export const EMPTY_PROFILE = {
  legalName: '',
  displayName: '',
  fiverrUrl: '',
  languages: [],
  languagesOther: '',
  specializations: [],
  specializationOther: '',
}

/* Lenient shape used for resumable drafts: no errors, just sanitised values. */
export function sanitizeProfile(raw) {
  const r = raw && typeof raw === 'object' ? raw : {}
  return {
    legalName: clean(r.legalName).slice(0, 120),
    displayName: clean(r.displayName).slice(0, 60),
    fiverrUrl: clean(r.fiverrUrl).slice(0, 200),
    languages: pickAllowed(r.languages, LANGUAGES),
    languagesOther: clean(r.languagesOther).slice(0, 120),
    specializations: pickAllowed(r.specializations, SPECIALIZATIONS),
    specializationOther: clean(r.specializationOther).slice(0, 120),
  }
}

/* @returns {{ ok: boolean, errors: Record<string,string>, value: object }}  `value` is the normalised profile. */
export function validateProfile(raw, { source = 'fiverr' } = {}) {
  const v = sanitizeProfile(raw)
  const errors = {}

  if (v.legalName.length < 2 || !hasLetter(v.legalName)) errors.legalName = 'Please enter your full legal name.'
  if (v.displayName.length < 2 || !hasLetter(v.displayName)) errors.displayName = 'Please enter the name you would like us to display.'

  const fiverrRaw = clean(raw?.fiverrUrl)
  if (fiverrRaw) {
    const url = normalizeFiverrUrl(fiverrRaw)
    if (url) v.fiverrUrl = url
    else errors.fiverrUrl = 'Please enter a valid Fiverr profile link, for example https://www.fiverr.com/yourname.'
  } else if (source === 'fiverr') {
    errors.fiverrUrl = 'Please enter your Fiverr profile link.'
  }

  if (v.languages.length === 0) errors.languages = 'Select at least one language.'
  if (v.languages.includes('Other') && !v.languagesOther) errors.languagesOther = 'Tell us which other language(s) you work in.'
  if (!v.languages.includes('Other')) v.languagesOther = ''

  if (v.specializations.length === 0) errors.specializations = 'Select at least one specialization.'
  if (v.specializations.includes('Other') && !v.specializationOther) errors.specializationOther = 'Tell us what else you specialize in.'
  if (!v.specializations.includes('Other')) v.specializationOther = ''

  return { ok: Object.keys(errors).length === 0, errors, value: v }
}

/* The typed signature must be the same name as the full legal name (case and spacing aside). */
export const signatureKey = (s) => clean(s).toLocaleLowerCase('en')

export function validateSignature(signature, legalName) {
  const sig = clean(signature)
  if (!sig) return 'Please type your full legal name to sign.'
  if (sig.length > 120 || !hasLetter(sig)) return 'Please type your full legal name to sign.'
  if (legalName && signatureKey(sig) !== signatureKey(legalName)) return 'Your signature must match the full legal name you entered above.'
  return null
}

/* @param {{ rights?: boolean, agreement?: boolean, display?: boolean, privacy?: boolean }} accepted */
export function validateAcceptance(accepted, signature, legalName) {
  const errors = {}
  for (const key of ['rights', 'agreement', 'display', 'privacy']) {
    if (accepted?.[key] !== true) errors[key] = 'Please tick this box to continue.'
  }
  const sigError = validateSignature(signature, legalName)
  if (sigError) errors.signature = sigError
  return { ok: Object.keys(errors).length === 0, errors }
}

/* Video file check (browser: before upload; server: before issuing an upload authorisation). */
export function validateVideoFile({ name = '', type = '', size = 0 }) {
  const ext = String(name).toLowerCase().split('.').pop()
  const typeOk = !type || VIDEO_MIME_TYPES.includes(type)
  const extOk = VIDEO_EXTENSIONS.includes(ext)
  if (!extOk || !typeOk) return 'Please upload an MP4 or MOV video.'
  if (!Number.isFinite(size) || size <= 0) return 'That file looks empty.'
  if (size > VIDEO_MAX_BYTES) return `This file is too large. The maximum size is ${humanBytes(VIDEO_MAX_BYTES)}.`
  return null
}

export const videoDurationError = (seconds) =>
  Number.isFinite(seconds) && seconds > VIDEO_MAX_SECONDS ? `This video is longer than ${VIDEO_MAX_SECONDS / 60} minutes.` : null
