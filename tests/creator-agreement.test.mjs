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
  AGREEMENT_VERSION, PRIVACY_VERSION, LEGAL_STATUS, LEGAL_ENTITY, OWNER_FLAG, OWNER_REVIEW_BLOCKERS, OWNER_APPROVAL_ITEMS, PRIVACY, PRIVACY_TBC_ITEMS,
  AGREEMENT_SECTIONS, longDate, buildAgreementDocument, agreementDocumentText, privacyText,
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
    assert.deepEqual(a.document, buildAgreementDocument({ creatorName: c.name, materials: c.files.map((label, i) => ({ slot: i + 1, label })), signedAt: record.submittedAt }), 'identical to what the online agreement renders')
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

test('signature block: the creator’s typed signature and server date appear; CONVRT’s side arrives pre-filled (name, NIF, typed signature, date)', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const entity = LEGAL_ENTITY.name
  const acceptDate = longDate(record.acceptance.acceptedAt)

  const trace = []
  await renderAgreementPdf(record, { trace })
  const drawn = norm(trace.join(' '))
  assert.ok(drawn.includes('CREATOR') && drawn.includes('CONVRT STUDIO'))
  // Creator column: name row + signature row (same string), plus the server acceptance date and time.
  assert.equal(trace.filter((x) => x === record.acceptance.signature).length, 2)
  assert.ok(trace.some((x) => x === `${acceptDate}, ${new Date(record.acceptance.acceptedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`))
  // CONVRT column: legal name, NIF, typed signature (same name) and the date, all pre-filled.
  assert.equal(trace.filter((x) => x === entity).length, 2, 'CONVRT name row + typed signature row')
  assert.ok(trace.includes(`NIF: ${LEGAL_ENTITY.taxId}`))
  assert.equal(trace.filter((x) => x === acceptDate).length, 1, 'CONVRT’s date (the acceptance date)')

  // The same facts are inside the exact accepted text and its hash, so the signed copy, the stored record and the online agreement agree.
  const a = record.acceptance.agreement
  assert.deepEqual(a.document.convrt, { name: entity, taxId: LEGAL_ENTITY.taxId, signature: entity, signedAt: record.submittedAt })
  assert.ok(a.text.includes(`Signed for CONVRT Studio: ${entity} (NIF ${LEGAL_ENTITY.taxId}), signature: ${entity}, ${acceptDate}`))
  assert.equal(a.sha256, sha256(a.text))
})

test('signature block: CONVRT’s side stays blank when the document carries no CONVRT signature; a recorded countersignature is shown instead', async () => {
  const t = await setup()
  const { record } = await submitAs(t, CREATORS[0].name, CREATORS[0].files)
  const blankDoc = { ...record.acceptance.agreement.document, convrt: null }
  const blank = { ...record, acceptance: { ...record.acceptance, agreement: { ...record.acceptance.agreement, document: blankDoc } } }
  const t1 = []
  await renderAgreementPdf(blank, { trace: t1 })
  assert.equal(t1.filter((x) => x === LEGAL_ENTITY.name).length, 0, 'nothing is drawn as a CONVRT signer')
  assert.ok(!t1.some((x) => x.startsWith('NIF')))

  const counter = { ...blank, acceptance: { ...blank.acceptance, countersignature: { name: LEGAL_ENTITY.name, signature: LEGAL_ENTITY.name, signedAt: '2026-11-20T10:00:00.000Z' } } }
  const t2 = []
  await renderAgreementPdf(counter, { trace: t2 })
  assert.equal(t2.filter((x) => x === LEGAL_ENTITY.name).length, 2)
  assert.ok(t2.includes('20 November 2026'), 'a countersignature carries its own date, distinct from the acceptance date')
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
    'host and display approved content securely, such as encoding, compression, resizing and thumbnail generation',
    'These do not authorize us to materially change your performance or identity.',
    'Any additional use requires your separate prior written agreement.',
    'whenever you like, without giving a reason', 'Contact us through Fiverr or at mohamed@convrt.studio.',
    'Removing your materials never results in a penalty or repayment of the showcase incentive.',
  ]) assert.ok(text.includes(phrase), phrase)
  assert.ok(!/delete (all|every)|immediately delet/i.test(text), 'removal does not promise immediate deletion of every legally retained record')
  assert.ok(text.includes('Stored copies and necessary legal records are handled as described under'), 'retained legal records are acknowledged')
})

test('privacy notice: all the required sections are present, each once, with no repeated sentences', () => {
  const headings = PRIVACY.sections.map((s) => s.heading)
  for (const required of ['How we protect your content', 'You can request removal at any time', 'Who is responsible for your information', 'What we collect', 'Why we use it', 'Legal bases', 'Who handles your information for us', 'How long we keep it', 'International transfers', 'Your rights', 'Contact']) {
    assert.equal(headings.filter((h) => h === required).length, 1, required)
  }
  const sentences = privacyText().split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => x.length > 30)
  const dupes = sentences.filter((x, i) => sentences.indexOf(x) !== i)
  assert.deepEqual(dupes, [], 'no sentence is repeated')
  assert.ok(privacyText().length < 7500, 'the notice stays short')
})

test('privacy notice: what is (not) published, marketing, Fiverr, and the verified infrastructure are stated', () => {
  const text = norm(privacyText())
  assert.ok(text.includes('Your legal name, signature and private agreement details are not published on your public portfolio.'))
  assert.ok(text.includes('Only approved public-facing details and materials may be displayed'))
  assert.ok(text.includes('we will not add you to any marketing email list without a separate lawful basis'))
  assert.ok(text.includes('communication and commercial transactions stay on Fiverr'))
  for (const provider of ['Cloudflare Stream', 'Vercel', 'Upstash', 'Resend', 'Fiverr']) assert.ok(text.includes(provider), provider)
  assert.ok(text.includes('Washington, D.C., USA') && text.includes('hosted in Frankfurt, Germany'), 'verified processing locations are disclosed')
  assert.ok(text.includes('Calle Gibraltar Español 9, 04007 Almería, Spain'), 'the controller address the owner supplied')
  assert.ok(text.includes('Resend stores its data in the United States'))
  assert.ok(text.includes('CONVRT does not request automatic captions, transcription or any other AI analysis of your videos'))
  assert.ok(!/GDPR-compliant|certified|ISO ?27001|SOC ?2|guarantee|routine backups/i.test(text), 'no invented certifications, guarantees or backup claims')
  assert.ok(!/\b(?!90 |14 |30 )\d+ (days|months|years)\b/.test(text), 'only the owner-chosen retention periods appear')
})

test('privacy notice: no unresolved markers remain, and every statement that still rests on the owner is listed, tied to the exact text, and approved only by the owner', () => {
  const texts = { privacy: norm(privacyText()), agreement: norm(agreementDocumentText(buildAgreementDocument())) }
  assert.equal(LEGAL_STATUS.approved, false, 'the gate stays closed until the owner approves')
  assert.equal(PRIVACY_TBC_ITEMS.length, 0)
  assert.ok(!privacyText().includes(OWNER_FLAG), 'no [OWNER TO CONFIRM] markers are left in the text')
  const ids = OWNER_APPROVAL_ITEMS.map((i) => i.id)
  assert.equal(new Set(ids).size, ids.length, 'unique ids')
  assert.ok(ids.length >= 15)
  for (const i of OWNER_APPROVAL_ITEMS) {
    assert.ok(['factual', 'legal', 'policy', 'commitment'].includes(i.kind), `${i.id} kind`)
    assert.ok(['privacy', 'agreement'].includes(i.where), `${i.id} where`)
    assert.ok(texts[i.where].includes(i.match), `${i.id}: "${i.match}" is in the ${i.where} text`)
    for (const f of ['statement', 'evidence', 'needs']) assert.ok(i[f] && i[f].length > 5, `${i.id} has ${f}`)
  }
  assert.ok(OWNER_REVIEW_BLOCKERS.length >= 4, 'the non-text launch steps are listed too')
  // The annotated review document marks every id (so the list the owner approves is the list in the text).
  const review = fs.readFileSync(path.join(ROOT, 'docs/creator-final-documents.md'), 'utf8')
  for (const i of OWNER_APPROVAL_ITEMS) assert.ok(review.includes(`⟦${i.id}⟧`) && review.includes(`| **${i.id}** |`), `docs/creator-final-documents.md marks ${i.id}`)
  assert.ok(review.includes(privacyText().split('\n')[2]), 'and contains the current privacy text')
  // The risky/legal claims must each be listed.
  for (const phrase of ['We have data-processing agreements', 'We rely on: steps taken', "rely on the safeguards in each provider's data-processing agreement", 'for six years after', '90 days after the decision', 'Signed for CONVRT Studio']) {
    assert.ok(OWNER_APPROVAL_ITEMS.some((i) => i.match.includes(phrase)), `"${phrase}" needs an approval entry`)
  }
})

test('the built privacy page shows no developer markers or placeholder identifiers, and a clear draft status while approval is pending', { skip: !fs.existsSync(path.join(ROOT, 'dist/creator-onboarding/privacy/index.html')) && 'dist/ not built' }, () => {
  const html = fs.readFileSync(path.join(ROOT, 'dist/creator-onboarding/privacy/index.html'), 'utf8')
  const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ')
  assert.ok(!/OWNER TO CONFIRM|To be confirmed|TODO|FIXME|placeholder/i.test(visible), 'no developer notes or unresolved tags')
  assert.ok(visible.includes('Draft awaiting final approval'), 'a clear draft status is shown while approval is pending')
  assert.ok(!/0\.1-draft|privacy-2026|agreement-2026/i.test(visible), 'no internal revision ids')
  assert.ok(visible.includes('Calle Gibraltar Español 9'))
})

test('the agreement and the privacy notice make the same commitments', () => {
  const agreement = norm(agreementDocumentText(buildAgreementDocument({ creatorName: 'Test Creator', materials: [] }))).toLowerCase()
  const privacy = norm(privacyText()).toLowerCase()
  const both = (agreementPhrase, privacyPhrase) => {
    assert.ok(agreement.includes(agreementPhrase), `agreement: ${agreementPhrase}`)
    assert.ok(privacy.includes(privacyPhrase), `privacy: ${privacyPhrase}`)
  }
  both('display the three approved edited portfolio videos', 'display approved portfolio examples on our website')   // limited website display
  both('ai or machine-learning training', 'ai or machine-learning training')
  both('face or voice cloning', 'face or voice cloning')
  both('digital avatars', 'digital avatars')
  both('deepfakes', 'deepfakes')
  both('paid advertising', 'paid advertising')
  both('redistribution', 'redistribution')
  both('social media reposting', 'social media reposting')
  both('without prior written approval', 'without your prior written approval')                                    // no unauthorised alteration
  both('retains all rights they hold', 'remain yours')                                                             // ownership
  both('without giving a reason or incurring a penalty', 'without giving a reason')                                // removal
  both('through fiverr or by contacting mohamed@convrt.studio', 'through fiverr or at mohamed@convrt.studio')
  both('does not require repayment of the agreed showcase incentive', 'repayment of the showcase incentive')
  both('remain on fiverr', 'stay on fiverr')                                                                       // Fiverr stays
})

test('CONVRT’s identity is the one the owner supplied; the NIF appears only in the signature block, the accepted text and the controller line', () => {
  assert.equal(LEGAL_ENTITY.name, 'Mohamed Doukkali Azizi')
  assert.equal(LEGAL_ENTITY.taxId, 'Y6755743J')
  assert.equal(LEGAL_ENTITY.confirmed, false, 'still listed for the owner’s confirmation')
  const generic = buildAgreementDocument({ creatorName: 'X Y', materials: [] })
  assert.equal(generic.convrt.signedAt, null, 'the date is only known at acceptance')
  assert.ok(!generic.parties.includes('Y6755743J'), 'the parties sentence names CONVRT but does not repeat the tax id')
})
