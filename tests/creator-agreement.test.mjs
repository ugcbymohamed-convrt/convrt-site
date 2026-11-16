// Run with: node --test tests/creator-agreement.test.mjs
// The personalised Creator Portfolio Agreement, its signed A4 PDF, internal audit tracking and the Privacy Notice.
// Fictional creators and dummy videos only. No network.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { makeHarness, creator, admin, adminLogin, validProfile } from './helpers/creatorHarness.mjs'
import { ACCEPTANCES } from '../src/lib/creator/constants.js'
import {
  AGREEMENT_VERSION, PRIVACY_VERSION, LEGAL_STATUS, LEGAL_ENTITY, OWNER_FLAG, OWNER_REVIEW_BLOCKERS, PRIVACY,
  AGREEMENT_SECTIONS, buildAgreementDocument, agreementDocumentText, privacyText,
} from '../src/content/creatorLegal.js'
import { renderAgreementPdf } from '../api/_lib/creator/agreementPdf.js'
import { sha256 } from '../api/_lib/creator/crypto.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const A4 = { w: 595.2756, h: 841.8898 }
const norm = (s) => String(s).replace(/\s+/g, ' ').trim()

async function setup() {
  const h = makeHarness()
  const { cookie } = await adminLogin(h.deps)
  const A = admin(h.deps, cookie)
  const created = await A('invite-create', { method: 'POST', body: { label: 'test', source: 'fiverr', expiresInDays: 7 } })
  const token = new URL(created.json.url).searchParams.get('invite')
  return { ...h, A, ref: created.json.invite.id, C: creator(h.deps, token) }
}

/* Uploads three dummy videos with the given filenames through the real flow. */
async function upload(t, filenames) {
  const uids = []
  for (const [i, filename] of filenames.entries()) {
    const slot = i + 1
    const auth = await t.C('video-upload', { method: 'POST', body: { slot, filename, type: 'video/mp4', size: 5_000_000 } })
    const uid = auth.json.uploadURL.split('/').pop()
    t.cfake.finish(uid)
    await t.C('video-status', { method: 'POST', body: { slot } })
    uids.push(uid)
  }
  return uids
}

const accepted = () => Object.fromEntries(ACCEPTANCES.map((a) => [a.key, true]))

async function submitAs(t, name, filenames) {
  const uids = await upload(t, filenames)
  const r = await t.C('submit', {
    method: 'POST',
    body: {
      profile: validProfile({ legalName: name, displayName: name.split(' ')[0] }),
      accepted: accepted(),
      signature: name,
      agreementVersion: AGREEMENT_VERSION,
      privacyVersion: PRIVACY_VERSION,
      assets: { videos: uids, photo: null },
    },
  })
  assert.equal(r.status, 200, JSON.stringify(r.json))
  return { uids, record: await t.store.get(`cr:sub:${t.ref}`) }
}

const CREATORS = [
  { name: 'Priya Nandakumar', files: ['PN_skincare_hook_v3.mp4', 'PN_app_demo_30s.mp4', 'PN_lifestyle_reel_05.mov'] },
  { name: 'Åsa Lindgren-Voss', files: ['AL spokesperson saas launch.mp4', 'AL_unboxing_v2.mp4', 'AL_podcast_clip_UGC.mp4'] },
]

test('personalisation: every submission carries its own creator name and its own three videos', async () => {
  const results = []
  for (const c of CREATORS) {
    const t = await setup()
    const { uids, record } = await submitAs(t, c.name, c.files)
    results.push({ c, uids, record })
    const a = record.acceptance.agreement
    assert.ok(a.text.includes(c.name), `${c.name} is in the accepted text`)
    assert.equal(a.document.creatorName, c.name)
    assert.deepEqual(a.document.materials, c.files.map((label, i) => ({ slot: i + 1, label })), 'the three covered videos are named')
    assert.deepEqual(record.acceptance.boundAssets.videoUids, uids, 'and bound to their exact asset ids')
    assert.deepEqual(a.document, buildAgreementDocument({ creatorName: c.name, materials: c.files.map((label, i) => ({ slot: i + 1, label })) }), 'identical to what the online agreement renders')
    assert.equal(a.sha256, sha256(a.text))
  }
  const [one, two] = results
  assert.ok(!one.record.acceptance.agreement.text.includes(two.c.name), 'no leakage between creators')
  assert.ok(!two.record.acceptance.agreement.text.includes(one.c.name))
  assert.notEqual(one.record.acceptance.agreement.sha256, two.record.acceptance.agreement.sha256)
  for (const { c, record } of results) {
    const trace = []
    await renderAgreementPdf(record, { trace })
    const drawn = norm(trace.join(' '))
    assert.ok(drawn.includes(c.name), `PDF shows ${c.name}`)
    for (const f of c.files) assert.ok(drawn.includes(f), `PDF lists ${f}`)
    const otherName = CREATORS.find((x) => x !== c).name
    assert.ok(!drawn.includes(otherName))
  }
})

test('no reference creator name (or any real creator name) is hardcoded anywhere in the source', () => {
  const walk = (dir) => fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === 'fonts' ? [] : walk(`${dir}/${e.name}`)) : [`${dir}/${e.name}`]))
  for (const f of [...walk('src'), ...walk('api')].filter((x) => /\.(jsx?|md)$/.test(x))) {
    assert.ok(!/Rebeca|Paloma|Kitty/i.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), `${f} names a real creator`)
  }
})

test('creators never see version labels, hashes, ids or private links in the PDF or the agreement text', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const trace = []
  await renderAgreementPdf(record, { trace })
  const drawn = trace.join('\n')
  for (const banned of [/Version\s*\d/i, /Agreement 01/i, /0\.1-draft/i, /CREATOR NETWORK\s*\/\s*AGREEMENT/i, /agreement-2026/i, /privacy-2026/i, /[a-f0-9]{32,}/i, /https?:\/\//i, /cloudflarestream|videodelivery/i, /sha-?256/i]) {
    assert.ok(!banned.test(drawn), `PDF must not show ${banned}`)
  }
  const text = agreementDocumentText(buildAgreementDocument({ creatorName: 'X Y', materials: [] }))
  assert.ok(!/version|agreement 01|0\.1-draft/i.test(text))
  // The online views render no version either.
  const view = fs.readFileSync(path.join(ROOT, 'src/components/creator/LegalDocument.jsx'), 'utf8')
  assert.ok(!/version/i.test(view.replace(/\/\*[\s\S]*?\*\//g, '')), 'LegalDocument.jsx shows no version')
})

test('internal audit tracking is preserved in the stored record', async () => {
  const t = await setup()
  const { uids, record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const a = record.acceptance
  assert.equal(a.agreement.version, AGREEMENT_VERSION, 'internal agreement revision id')
  assert.equal(a.privacy.version, PRIVACY_VERSION, 'privacy notice revision accepted')
  assert.equal(a.agreement.sha256, sha256(a.agreement.text), 'immutable hash of the exact accepted text')
  assert.equal(a.privacy.sha256, sha256(a.privacy.text))
  assert.equal(a.privacy.text, privacyText(), 'the exact privacy notice is stored too')
  assert.equal(a.legalName, CREATORS[0].name)
  assert.equal(a.signature, CREATORS[0].name)
  assert.deepEqual(a.checkboxes.map((c) => [c.key, c.accepted]), ACCEPTANCES.map((x) => [x.key, true]), 'individual consent records')
  assert.ok(Date.now() - Date.parse(a.acceptedAt) < 5000, 'server-side timestamp')
  assert.equal(record.id, t.ref, 'submission reference')
  assert.deepEqual(a.boundAssets.videoUids, uids)
  assert.match(AGREEMENT_VERSION, /^agreement-/, 'revision id, not a visible version number')
})

test('the signed PDF and the online agreement carry the same terms', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[1].name, CREATORS[1].files)
  const trace = []
  await renderAgreementPdf(record, { trace })
  const drawn = norm(trace.join(' '))
  for (const s of AGREEMENT_SECTIONS) {
    assert.ok(drawn.includes(`${s.n} ${s.heading}`), `${s.n} heading is in the PDF`)
    assert.ok(drawn.includes(norm(s.paragraphs.join(' '))), `section ${s.n} text is in the PDF word for word`)
    assert.ok(record.acceptance.agreement.text.includes(s.paragraphs[0]), `and in the stored accepted text`)
  }
  assert.ok(drawn.includes(norm(record.acceptance.agreement.document.parties)))
  assert.ok(drawn.includes(norm(record.acceptance.agreement.document.acceptance)))
})

test('the terms: no AI training, cloning, avatars, advertising or redistribution; no unauthorised edits; free removal; no exclusivity; Fiverr stays', () => {
  const text = norm(agreementDocumentText(buildAgreementDocument({ creatorName: 'Test Creator', materials: [] })))
  for (const phrase of [
    'CONVRT will not use the submitted materials for AI or machine-learning training, face or voice cloning, digital avatars, synthetic replicas, deepfakes, paid advertising, social media reposting, resale, redistribution or any additional commercial purpose',
    'CONVRT will not materially alter the Creator’s image, voice, likeness, performance or message without prior written approval',
    'No material creative alterations are permitted without the Creator’s prior written approval',
    'without giving a reason or incurring a penalty, through Fiverr or by contacting mohamed@convrt.studio',
    'Withdrawal does not require repayment of the agreed showcase incentive',
    'This agreement creates no exclusivity, employment relationship or obligation to accept future projects. The Creator may freely accept or decline each opportunity',
    'The agreed $25 showcase incentive is paid through Fiverr',
    'future communication, orders, payments and agreed bonuses with CONVRT remain on Fiverr',
    'Future projects, deliverables and commercial usage rights require separate agreement',
    'The Creator retains all rights they hold in their submitted work, image, voice and likeness. No copyright or ownership is transferred',
    'Any other use requires the Creator’s separate prior written permission',
  ]) assert.ok(text.includes(phrase), phrase)
  assert.ok(!/unlimited|perpetual|irrevocable|exclusive license|assign(s|ed)? (all )?rights/i.test(text), 'never implies unlimited commercial rights')
  assert.ok(/non-exclusive and revocable/.test(text))
})

test('PDF layout: real A4, comfortable font size, nothing past the margins, one page normally', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const { bytes, meta } = await renderAgreementPdf(record)
  const pdf = await PDFDocument.load(bytes)
  const { width, height } = pdf.getPages()[0].getSize()
  assert.ok(Math.abs(width - A4.w) < 0.5 && Math.abs(height - A4.h) < 0.5, 'A4')
  assert.equal(meta.pages, 1, 'the whole agreement fits one page')
  assert.equal(pdf.getPageCount(), 1)
  assert.ok(meta.bodySize >= 9, 'body text is never shrunk below 9 pt')
  assert.ok(meta.maxX <= A4.w - 44 + 0.5, 'nothing is drawn past the right margin')
  assert.equal(pdf.getTitle().includes(record.id), true)
  assert.ok(!/version/i.test(pdf.getTitle()))
})

test('PDF layout: when the covered videos need room they go on a labelled supplementary page; legal text is never clipped', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const long = 'A very long descriptive filename for portfolio example number one with many words in it, repeated to force wrapping across several lines of the page layout okay.mp4'
  const doc = buildAgreementDocument({ creatorName: CREATORS[0].name, materials: [1, 2, 3].map((slot) => ({ slot, label: `${long} ${slot}` })) })
  const big = { ...record, acceptance: { ...record.acceptance, agreement: { ...record.acceptance.agreement, document: doc, text: agreementDocumentText(doc) } } }
  const trace = []
  const { meta } = await renderAgreementPdf(big, { trace })
  assert.equal(meta.pages, 2)
  assert.equal(meta.scheduleOnSecondPage, true)
  assert.ok(meta.bodySize >= 9)
  const drawn = norm(trace.join(' '))
  assert.ok(drawn.includes('Record of materials'))
  for (const s of AGREEMENT_SECTIONS) assert.ok(drawn.includes(norm(s.paragraphs.join(' '))), `section ${s.n} still complete`)
  for (const slot of [1, 2, 3]) assert.ok(drawn.includes(`${long} ${slot}`.slice(0, 40)))
})

test('signature block: the creator’s typed signature and server date appear; CONVRT’s side stays blank unless a countersignature was recorded', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const entity = LEGAL_ENTITY.name
  const count = (trace) => trace.filter((x) => x === entity).length

  const plain = []
  await renderAgreementPdf(record, { trace: plain })
  const drawn = norm(plain.join(' '))
  assert.ok(drawn.includes('CREATOR') && drawn.includes('CONVRT STUDIO'))
  // The signature equals the legal name here, so the string is drawn twice: in the name row and in the signature row.
  assert.equal(plain.filter((x) => x === record.acceptance.signature).length, 2, 'the typed signature is drawn in the creator column')
  assert.ok(plain.some((x) => x.startsWith(new Date(record.acceptance.acceptedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))), 'the acceptance date')
  assert.equal(count(plain), 0, 'CONVRT’s name is not drawn as a signer (it appears only inside the parties sentence)')

  const signed = []
  await renderAgreementPdf({ ...record, acceptance: { ...record.acceptance, countersignature: { name: entity, signature: entity, signedAt: '2026-11-20T10:00:00.000Z' } } }, { trace: signed })
  assert.ok(count(signed) >= 2, 'a recorded countersignature shows name and signature')
  assert.ok(signed.some((x) => x.startsWith('20 November 2026')), 'with its own date, distinct from the acceptance date')
})

test('the draft strip is shown only while the documents are unapproved', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const draft = []
  await renderAgreementPdf(record, { trace: draft })
  assert.ok(draft.some((x) => /DRAFT/.test(x)))
  LEGAL_STATUS.approved = true
  try {
    const final = []
    await renderAgreementPdf(record, { trace: final })
    assert.ok(!final.some((x) => /DRAFT/.test(x)), 'an approved agreement carries no draft marking')
  } finally {
    LEGAL_STATUS.approved = false
  }
})

test('old signed records are never silently altered; they keep their exact original text and copy', async () => {
  const t = await setup()
  const legacy = {
    id: 'CRX-LEGACY01', status: 'pending_review', publishable: false, source: 'fiverr', inviteLabel: 'old test', submittedAt: '2026-11-16T17:36:51.759Z',
    profile: validProfile({ legalName: 'Old Test Creator', displayName: 'Old' }),
    assets: { videos: [1, 2, 3].map((slot) => ({ slot, uid: `old${slot}`, filename: `old${slot}.mp4`, size: 1, duration: 5 })), photo: null },
    acceptance: {
      acceptedAt: '2026-11-16T17:36:51.759Z', legalName: 'Old Test Creator', displayName: 'Old', signature: 'Old Test Creator', signatureType: 'typed_name_simple_electronic_signature',
      agreement: { version: '0.1-draft', sha256: 'a'.repeat(64), text: 'CONVRT Studio — Creator Portfolio Agreement\n\nLIMITED WEBSITE-DISPLAY PERMISSION\nThe ORIGINAL draft wording.\n' },
      privacy: { version: '0.1-draft', sha256: 'b'.repeat(64) },
      checkboxes: ACCEPTANCES.map((a) => ({ key: a.key, text: a.text, accepted: true })),
      boundAssets: { videoUids: ['old1', 'old2', 'old3'], photoSha256: null },
    },
    history: [{ at: '2026-11-16T17:36:51.759Z', action: 'submitted' }], withdrawal: null,
  }
  await t.store.set('cr:sub:CRX-LEGACY01', legacy)
  await t.store.sadd('cr:subs', 'CRX-LEGACY01')
  const before = JSON.stringify(await t.store.get('cr:sub:CRX-LEGACY01'))

  await submitAs(t, CREATORS[1].name, CREATORS[1].files) // a NEW submission under the new template
  const copy = await t.A('agreement?id=CRX-LEGACY01')
  assert.match(copy.headers['content-type'], /text\/html/, 'historical records keep their original copy format')
  assert.ok(copy.text.includes('The ORIGINAL draft wording.') && copy.text.includes('0.1-draft'))
  const detail = await t.A('submission?id=CRX-LEGACY01')
  assert.equal(detail.json.submission.acceptance.agreementVersion, '0.1-draft')
  assert.equal(JSON.stringify(await t.store.get('cr:sub:CRX-LEGACY01')), before, 'the legacy record is byte-for-byte unchanged')
})

test('signed agreements stay private: owner session or the creator’s own link only', async () => {
  const t = await setup()
  await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  assert.equal((await admin(t.deps, '')(`agreement?id=${t.ref}`)).status, 401)
  assert.equal((await creator(t.deps, 'x'.repeat(43))('agreement')).status, 401)
  const ok = await t.A(`agreement?id=${t.ref}`)
  assert.equal(ok.status, 200)
  assert.equal(ok.headers['content-type'], 'application/pdf')
  assert.equal(ok.headers['cache-control'], 'no-store')
})

// ───────────────────────── Privacy Notice ─────────────────────────
test('privacy notice: content protections and removal rights come first, in the agreed wording', () => {
  assert.deepEqual(PRIVACY.sections.slice(0, 2).map((s) => s.heading), ['How we protect your content', 'You can request removal at any time'])
  const text = norm(privacyText())
  for (const phrase of [
    'Your portfolio materials remain yours.',
    'only to review your submission, document your permission and display approved portfolio examples on our website',
    '- AI or machine-learning training.', '- Face or voice cloning.', '- Synthetic voices or digital avatars.', '- Deepfakes or identity replication.',
    '- Paid advertising or promotional campaigns outside the agreed website showcase.', '- Redistribution, resale or unauthorized sublicensing.',
    '- Social media reposting without separate permission.',
    '- Material alterations to your appearance, voice, performance or creative work without your prior written approval.',
    'These adjustments do not authorize us to materially change your performance or identity.',
    'Any additional use requires your separate prior written agreement.',
    'without providing a reason', 'Contact us through Fiverr or at mohamed@convrt.studio.',
    'Requests to remove portfolio materials do not result in a penalty or repayment of the showcase incentive.',
  ]) assert.ok(text.includes(phrase), phrase)
  assert.ok(!/delete (all|every)|immediately delet/i.test(text), 'removal does not promise immediate deletion of every legally retained record')
})

test('privacy notice: what is (not) published, marketing, Fiverr, and the verified infrastructure are stated', () => {
  const text = norm(privacyText())
  assert.ok(text.includes('Your legal name, signature and private agreement details are not published on your public portfolio.'))
  assert.ok(text.includes('Only approved public-facing details and materials may be displayed'))
  assert.ok(text.includes('We will not add you to any marketing email list without a separate lawful basis'))
  assert.ok(text.includes('communication and commercial transactions stay on Fiverr'))
  for (const provider of ['Cloudflare Stream', 'Vercel', 'Upstash', 'Resend', 'Fiverr']) assert.ok(text.includes(provider), provider)
  assert.ok(text.includes('Washington, D.C., USA'), 'the verified US processing location is disclosed')
  assert.ok(!/GDPR-compliant|certified|ISO ?27001|SOC ?2|guarantee/i.test(text), 'no invented certifications or guarantees')
  assert.ok(!/\b\d+ (days|months|years)\b/.test(text), 'no invented retention periods')
})

test('privacy notice: open legal points stay flagged and are listed for owner review, never silently removed', () => {
  const text = privacyText()
  assert.equal(LEGAL_STATUS.approved, false)
  assert.ok((text.match(/OWNER TO CONFIRM/g) || []).length >= 6, 'markers are still in the text')
  assert.ok(OWNER_REVIEW_BLOCKERS.length >= 6)
  for (const topic of [/legal bases/i, /retention/i, /transfers/i, /region/i, /legal contracting name/i, /AI, analysis or training/i]) {
    assert.ok(OWNER_REVIEW_BLOCKERS.some((b) => topic.test(b)), `blocker list covers ${topic}`)
  }
  // The only way to ship without markers is for the owner to approve: markers may not coexist with an approved flag.
  const approved = LEGAL_STATUS.approved
  assert.ok(!approved || !text.includes(OWNER_FLAG), 'approved documents contain no unresolved markers')
})

test('the contracting name comes from the owner reference but the owner’s tax id is not copied into agreements', () => {
  assert.equal(LEGAL_ENTITY.name, 'Mohamed Doukkali Azizi')
  assert.equal(LEGAL_ENTITY.confirmed, false)
  const everything = agreementDocumentText(buildAgreementDocument({ creatorName: 'X Y', materials: [] })) + privacyText()
  assert.ok(!/NIF|Y6755743J|tax id/i.test(everything))
})
