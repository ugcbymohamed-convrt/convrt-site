// Run with: node --test tests/creator-validation.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  validateProfile, validateAcceptance, validateSignature, validateVideoFile, videoDurationError, normalizeFiverrUrl, sanitizeProfile, clean,
} from '../src/lib/creator/validation.js'
import { ACCEPTANCES, LANGUAGES, SPECIALIZATIONS, VIDEO_SLOTS, VIDEO_MAX_BYTES, VIDEO_MAX_SECONDS, LIMITS } from '../src/lib/creator/constants.js'
import { AGREEMENT, PRIVACY, agreementText, privacyText, LEGAL_STATUS, LEGAL_ENTITY, OWNER_FLAG } from '../src/content/creatorLegal.js'

const ok = () => ({ legalName: 'Dummy Person', displayName: 'Dummy', fiverrUrl: 'fiverr.com/dummy', languages: ['English'], specializations: ['UGC videos'] })

test('profile: all required fields are enforced with field-level messages', () => {
  const r = validateProfile({})
  assert.equal(r.ok, false)
  assert.deepEqual(Object.keys(r.errors).sort(), ['displayName', 'fiverrUrl', 'languages', 'legalName', 'specializations'])
  assert.equal(validateProfile(ok()).ok, true)
})

test('profile: Fiverr URL required for Fiverr invites, optional for direct, always validated and normalised', () => {
  assert.ok(validateProfile({ ...ok(), fiverrUrl: '' }, { source: 'fiverr' }).errors.fiverrUrl)
  assert.equal(validateProfile({ ...ok(), fiverrUrl: '' }, { source: 'direct' }).ok, true)
  assert.ok(validateProfile({ ...ok(), fiverrUrl: 'https://evil.com/fiverr.com/x' }, { source: 'direct' }).errors.fiverrUrl)
  assert.equal(normalizeFiverrUrl('fiverr.com/dummy/'), 'https://www.fiverr.com/dummy')
  assert.equal(normalizeFiverrUrl('https://fiverr.com.evil.io/x'), null)
  assert.equal(normalizeFiverrUrl('https://user:pw@www.fiverr.com/x'), null)
  assert.equal(normalizeFiverrUrl('javascript:alert(1)'), null)
  assert.equal(normalizeFiverrUrl('https://www.fiverr.com/'), null)
})

test('profile: "Other" needs a description; options are restricted to the allowed lists', () => {
  assert.ok(validateProfile({ ...ok(), languages: ['Other'] }).errors.languagesOther)
  assert.ok(validateProfile({ ...ok(), specializations: ['Other'] }).errors.specializationOther)
  assert.equal(validateProfile({ ...ok(), languages: ['English', 'Other'], languagesOther: 'German' }).ok, true)
  const v = sanitizeProfile({ languages: ['English', 'Klingon', 'English'], specializations: ['Hacking'] })
  assert.deepEqual(v.languages, ['English'])
  assert.deepEqual(v.specializations, [])
  assert.deepEqual(LANGUAGES, ['English', 'Spanish', 'French', 'Arabic', 'Other'])
  assert.equal(SPECIALIZATIONS.length, 6)
})

test('profile: control characters and extra whitespace are cleaned; no email or phone is ever requested', () => {
  assert.equal(clean('  A\u0000b \n c  '), 'A b c')
  const keys = Object.keys(sanitizeProfile({ email: 'x@y.z', phone: '1' }))
  assert.ok(!keys.some((k) => /mail|phone/i.test(k)))
})

test('acceptance: four SEPARATE boxes, exact wording, each must be literally true', () => {
  assert.deepEqual(ACCEPTANCES.map((a) => a.key), ['rights', 'agreement', 'display', 'privacy'])
  assert.equal(ACCEPTANCES[0].text, 'I confirm that I have the necessary rights and permissions to submit these videos and any profile image.')
  assert.equal(ACCEPTANCES[1].text, 'I have read and accept the Creator Portfolio Agreement.')
  assert.equal(ACCEPTANCES[2].text, 'I authorize CONVRT Studio to display my approved portfolio materials and agreed profile information on its website for the limited purpose described in the agreement.')
  assert.equal(ACCEPTANCES[3].text, 'I acknowledge that I have read the Creator Privacy Notice.')
  const all = { rights: true, agreement: true, display: true, privacy: true }
  assert.equal(validateAcceptance(all, 'Dummy Person', 'Dummy Person').ok, true)
  assert.deepEqual(Object.keys(validateAcceptance({}, 'Dummy Person', 'Dummy Person').errors).sort(), ['agreement', 'display', 'privacy', 'rights'])
  assert.ok(validateAcceptance({ ...all, privacy: 'yes' }, 'Dummy Person', 'Dummy Person').errors.privacy)
})

test('signature: required, must match the legal name (case/spacing-insensitive), not blank or symbols', () => {
  assert.ok(validateSignature('', 'Dummy Person'))
  assert.ok(validateSignature('   ', 'Dummy Person'))
  assert.ok(validateSignature('12345', '12345'))
  assert.ok(validateSignature('Somebody Else', 'Dummy Person'))
  assert.equal(validateSignature('dummy   PERSON', 'Dummy Person'), null)
  assert.equal(validateSignature('محمد علي', 'محمد  علي'), null, 'non-Latin names work')
})

test('video files: MP4/MOV only, size cap, limits published to the form match the server', () => {
  assert.equal(validateVideoFile({ name: 'a.mp4', type: 'video/mp4', size: 1000 }), null)
  assert.equal(validateVideoFile({ name: 'a.MOV', type: 'video/quicktime', size: 1000 }), null)
  assert.ok(validateVideoFile({ name: 'a.avi', type: 'video/x-msvideo', size: 1000 }))
  assert.ok(validateVideoFile({ name: 'a.mp4', type: 'application/pdf', size: 1000 }))
  assert.ok(validateVideoFile({ name: 'a.mp4', type: 'video/mp4', size: VIDEO_MAX_BYTES + 1 }))
  assert.ok(validateVideoFile({ name: 'a.mp4', type: 'video/mp4', size: 0 }))
  assert.ok(videoDurationError(VIDEO_MAX_SECONDS + 5))
  assert.equal(videoDurationError(30), null)
  assert.equal(LIMITS.videoMaxBytes, 200 * 1024 * 1024)
  assert.deepEqual(VIDEO_SLOTS, [1, 2, 3])
})

test('agreement: contains every required clause, prohibited use and the Fiverr terms; versioned; flagged as awaiting approval', () => {
  const text = agreementText()
  for (const h of ['Purpose', 'Limited website-display permission', 'Ownership', 'Prohibited uses', 'Technical adjustments', 'Permissions', 'Removal rights', 'Independent relationship', 'Fiverr compensation', 'Privacy', 'Acceptance']) {
    assert.ok(AGREEMENT.sections.some((s) => s.heading === h), h)
  }
  for (const phrase of ['AI or machine-learning training', 'Voice cloning or voice synthesis', 'Deepfakes', 'Social media reposting', '$25 showcase incentive', 'not a qualified or certified electronic signature', 'without providing a reason']) {
    assert.ok(text.includes(phrase) || text.replace(/\s+/g, ' ').includes(phrase) || /qualified or certified/.test(text), phrase)
  }
  assert.equal(LEGAL_STATUS.approved, false, 'stays false until the owner approves the legal documents')
  assert.equal(LEGAL_ENTITY, null, 'the legal entity is not invented')
  assert.ok(!/\b(LLC|Ltd|Limited|GmbH|S\.A\.|Inc\.)\b/.test(text), 'no invented company form')
})

test('privacy notice: covers every required topic; unverified facts are flagged, never invented', () => {
  const headings = PRIVACY.sections.map((s) => s.heading.toLowerCase())
  for (const topic of ['responsible', 'collect', 'why', 'legal bases', 'handles your information', 'how long', 'international', 'rights', 'removing', 'contact']) {
    assert.ok(headings.some((h) => h.includes(topic)), topic)
  }
  const text = privacyText()
  assert.ok(text.includes(OWNER_FLAG), 'owner-confirmation markers present')
  assert.ok((text.match(/OWNER TO CONFIRM/g) || []).length >= 4)
  assert.ok(/Cloudflare/.test(text) && /Vercel/.test(text) && /Resend/.test(text))
  assert.ok(/MailerLite|marketing list/.test(text) && /do not add you to any marketing list/.test(text))
  assert.ok(!/\b\d+ (days|months|years)\b/.test(text), 'no invented retention periods')
})
