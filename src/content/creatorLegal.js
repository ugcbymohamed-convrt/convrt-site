/* Creator Portfolio Agreement + Creator Privacy Notice.

   ⚠ AWAITING FINAL OWNER APPROVAL (LEGAL_STATUS.approved === false). Real creator submissions are refused on the
   Production deployment until the owner approves; see OWNER_REVIEW_BLOCKERS below for what is still open.

   Visible text vs internal tracking
   • Creators never see a version number. Internally every document has a REVISION id (AGREEMENT_REVISION /
     PRIVACY_REVISION). Each submission stores the revision it accepted, the EXACT accepted text (personalised with the
     creator's name and the three covered videos), its SHA-256, and the structured document the PDF is drawn from.
     Old signed records are never rewritten: change the wording and the revision id together, and only NEW submissions
     use the new text.
   • "[OWNER TO CONFIRM …]" markers in the Privacy Notice are real open legal/data-handling points, shown highlighted on
     purpose. They are listed in OWNER_REVIEW_BLOCKERS and must be resolved by the owner, never silently deleted. */

import { CONTACT_EMAIL } from '../config.js'

export const LEGAL_STATUS = {
  approved: false,
  note: 'Some legal and privacy details are still being confirmed by CONVRT.',
}

/* Internal revision ids (never rendered to creators). Bump when the wording changes. */
export const AGREEMENT_REVISION = 'agreement-2026-11-r2'
export const PRIVACY_REVISION = 'privacy-2026-11-r2'
// Names the rest of the code already uses for "the revision a creator accepted".
export const AGREEMENT_VERSION = AGREEMENT_REVISION
export const PRIVACY_VERSION = PRIVACY_REVISION

/* CONVRT's legal contracting identity, taken from the owner's own reference agreement and instructions
   (confirmed: false until the owner confirms it as part of legal review: see OWNER_REVIEW_BLOCKERS). `taxId` is the NIF
   the owner asked to have printed beside the CONVRT signature. */
export const LEGAL_ENTITY = { name: 'Mohamed Doukkali Azizi', taxId: 'Y6755743J', confirmed: false }

/* Owner instruction (16 Nov 2026): CONVRT's side of every agreement arrives pre-filled: the legal name and NIF, a typed
   signature identical to the name, and the date (the acceptance date recorded by the server). This is a standing
   authorisation by the owner, recorded inside each agreement's accepted text; set to false to leave CONVRT's side blank. */
export const CONVRT_PRESIGN = true

/* Contact address for the privacy notice (supplied by the owner, 16 Nov 2026). */
export const CONVRT_ADDRESS = 'Calle Gibraltar Español 9, 04007 Almería, Spain'

export const CONTRACTING_PARTY = {
  tradeName: 'CONVRT Studio',
  website: 'www.convrt.studio',
  contactEmail: CONTACT_EMAIL,
}

export const OWNER_FLAG = '[OWNER TO CONFIRM'

/* What is still open before real creators may see these documents (shown to the owner in the review page). */
/* Full detail, verified facts and sources: docs/creator-privacy-launch-checklist.md */
export const OWNER_REVIEW_BLOCKERS = [
  'Provider terms: accept/confirm the data-processing agreements with Cloudflare, Vercel, Upstash and Resend, and confirm no AI or analysis features are enabled for creator files.',
  'International transfers: confirm the transfer safeguards for each US provider (Resend stores data in the US; check the Vercel log shows Frankfurt, fra1, after the region change).',
  'Six-year record retention: a period you chose, not a verified legal requirement. Confirm it with legal advice.',
  'Provider backups: find out whether Upstash and Cloudflare keep backups and for how long.',
  'Legal bases were accepted as written (not lawyer-verified); have both documents reviewed (ideally by a lawyer), then set LEGAL_STATUS.approved to true.',
  'Fiverr: confirm Fiverr’s terms allow directing creators to this external onboarding page.',
]

/* ───────────────────────── Creator Portfolio Agreement ───────────────────────── */

export const AGREEMENT_TITLE = 'Creator Portfolio Agreement'
export const AGREEMENT_SUBTITLE = 'Limited website display permission | Independent freelance creator'

export const AGREEMENT_SECTIONS = [
  {
    n: '01',
    heading: 'Purpose and permitted use',
    paragraphs: [
      'The Creator grants CONVRT Studio a limited, non-exclusive and revocable permission to display the three approved edited portfolio videos, together with any separately approved public display name or profile image, solely as examples of the Creator’s work on www.convrt.studio.',
      'CONVRT may host, encode, compress, resize and generate thumbnails only as necessary for this website display. No material creative alterations are permitted without the Creator’s prior written approval.',
    ],
  },
  {
    n: '02',
    heading: 'Ownership and permissions',
    paragraphs: [
      'The Creator retains all rights they hold in their submitted work, image, voice and likeness. No copyright or ownership is transferred.',
      'The Creator confirms that they have the necessary rights and any required third-party permissions for the agreed website display.',
      'CONVRT will identify the work as independent freelance creator portfolio examples and will not falsely present previously created work as productions commissioned or produced by CONVRT.',
    ],
  },
  {
    n: '03',
    heading: 'Prohibited uses',
    paragraphs: [
      'CONVRT will not use the submitted materials for AI or machine-learning training, face or voice cloning, digital avatars, synthetic replicas, deepfakes, paid advertising, social media reposting, resale, redistribution or any additional commercial purpose beyond the agreed website showcase.',
      'CONVRT will not materially alter the Creator’s image, voice, likeness, performance or message without prior written approval.',
      'Authorized technical providers may process the files only as necessary to deliver the agreed hosting and display services, subject to applicable data-processing arrangements.',
      'Any other use requires the Creator’s separate prior written permission.',
    ],
  },
  {
    n: '04',
    heading: 'Removal and withdrawal',
    paragraphs: [
      `The Creator may request removal of any or all submitted materials at any time, without giving a reason or incurring a penalty, through Fiverr or by contacting ${CONTACT_EMAIL}.`,
      'CONVRT will promptly remove the relevant content from public display, discontinue further authorized use, and handle stored media copies according to the applicable privacy notice and legal obligations.',
      'Withdrawal does not require repayment of the agreed showcase incentive.',
    ],
  },
  {
    n: '05',
    heading: 'Compensation and future work',
    paragraphs: [
      'The agreed $25 showcase incentive is paid through Fiverr.',
      'For Fiverr-originated collaborations, future communication, orders, payments and agreed bonuses with CONVRT remain on Fiverr.',
      'This agreement creates no exclusivity, employment relationship or obligation to accept future projects. The Creator may freely accept or decline each opportunity.',
      'Future projects, deliverables and commercial usage rights require separate agreement.',
    ],
  },
]

export const AGREEMENT_ACCEPTANCE =
  'Both parties acknowledge the terms of this limited website-display permission. The agreement applies only to the specific portfolio materials identified in the signed submission record.'

/* Shown before a creator is known (the standalone agreement page). */
export const GENERIC_CREATOR = 'the independent freelance creator named in the signed submission record'

/* "16 November 2026" in UTC: the same wording in the online agreement, the stored text and the PDF. */
export const longDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/* Builds the agreement for ONE creator. Everything the creator accepts is in this object: the same object drives the
   online agreement, the stored acceptance record and the signed PDF.
   @param {{ creatorName?: string, materials?: { slot: number, label: string }[] }} input */
export function buildAgreementDocument({ creatorName, materials = [], signedAt = null } = {}) {
  const creator = String(creatorName || '').trim()
  return {
    title: AGREEMENT_TITLE,
    subtitle: AGREEMENT_SUBTITLE,
    contractingName: LEGAL_ENTITY.name,
    creatorName: creator || null,
    parties: `CONVRT Studio (legal contracting name: ${LEGAL_ENTITY.name}) and ${creator || GENERIC_CREATOR} (the “Creator”).`,
    sections: AGREEMENT_SECTIONS,
    materials: materials.map((m) => ({ slot: m.slot, label: String(m.label) })),
    acceptance: AGREEMENT_ACCEPTANCE,
    // CONVRT's pre-filled side (see CONVRT_PRESIGN). `signedAt` is the server acceptance time once known.
    convrt: CONVRT_PRESIGN ? { name: LEGAL_ENTITY.name, taxId: LEGAL_ENTITY.taxId, signature: LEGAL_ENTITY.name, signedAt } : null,
  }
}

/* Deterministic plain text of an agreement document: this is what is stored as "the exact text accepted" and hashed. */
export function agreementDocumentText(doc) {
  const out = [doc.title, doc.subtitle, '', `Parties: ${doc.parties}`, '']
  for (const s of doc.sections) {
    out.push(`${s.n} ${s.heading}`)
    for (const p of s.paragraphs) out.push(p)
    out.push('')
  }
  if (doc.materials?.length) {
    out.push('Covered videos')
    for (const m of doc.materials) out.push(`Video ${m.slot}: ${m.label}`)
    out.push('')
  }
  out.push(`Acceptance: ${doc.acceptance}`)
  if (doc.convrt) {
    out.push(`Signed for CONVRT Studio: ${doc.convrt.name} (NIF ${doc.convrt.taxId}), signature: ${doc.convrt.signature}${doc.convrt.signedAt ? `, ${longDate(doc.convrt.signedAt)}` : ''}`)
  }
  return out.join('\n').trim() + '\n'
}

/* ───────────────────────── Creator Privacy Notice ───────────────────────── */

export const PRIVACY_TITLE = 'Creator Privacy Notice'

/* The open points in the notice. Each appears in the text as "[OWNER TO CONFIRM: <item>]" (kept verbatim in the stored
   text) and is rendered to creators as a small "To be confirmed" tag. Every item has a row in
   docs/creator-privacy-launch-checklist.md (a test enforces it): none may be deleted until the owner has decided it. */
export const PRIVACY_TBC_ITEMS = [
  'provider data-processing and AI terms',
  'transfer safeguards',
  'six-year retention period',
  'provider backup retention',
]
const tbc = (item) => `${OWNER_FLAG}: ${item}]`

export const PRIVACY = {
  title: PRIVACY_TITLE,
  intro: 'This notice explains how CONVRT Studio handles the information you give us when you submit a creator portfolio.',
  sections: [
    {
      id: 'protect',
      heading: 'How we protect your content',
      panel: true,
      paragraphs: [
        'Your portfolio materials remain yours.',
        'CONVRT Studio collects your videos, profile image and professional information only to review your submission, document your permission and display approved portfolio examples on our website.',
        'We will not use your submitted videos, images, voice or likeness for:',
      ],
      bullets: [
        'AI or machine-learning training.',
        'Face or voice cloning.',
        'Synthetic voices or digital avatars.',
        'Deepfakes or identity replication.',
        'Paid advertising or promotional campaigns outside the agreed website showcase.',
        'Redistribution, resale or unauthorized sublicensing.',
        'Social media reposting without separate permission.',
        'Material alterations to your appearance, voice, performance or creative work without your prior written approval.',
      ],
      prohibit: true,
      after: [
        'We may make technical adjustments needed to host and display approved content securely, such as encoding, compression, resizing and thumbnail generation. These do not authorize us to materially change your performance or identity.',
        'Any additional use requires your separate prior written agreement.',
      ],
    },
    {
      id: 'removal',
      heading: 'You can request removal at any time',
      panel: true,
      paragraphs: [
        'Ask us to remove any approved video, image or profile information from CONVRT’s website whenever you like, without giving a reason. Contact us through Fiverr or at ' + CONTACT_EMAIL + '.',
        'We will remove the materials from public display without undue delay and stop using them for the agreed showcase. Stored copies and necessary legal records are handled as described under “How long we keep it”.',
        'Removing your materials never results in a penalty or repayment of the showcase incentive.',
      ],
    },
    {
      id: 'controller',
      heading: 'Who is responsible for your information',
      paragraphs: [
        `CONVRT Studio (legal contracting name: ${LEGAL_ENTITY.name}, NIF ${LEGAL_ENTITY.taxId}), www.convrt.studio, decides how and why your information is used. Address: ${CONVRT_ADDRESS}.`,
      ],
    },
    {
      id: 'collected',
      heading: 'What we collect',
      bullets: [
        'Your full legal name (used for the agreement) and the public display name you choose.',
        'Your Fiverr profile link, the languages you work in and your specializations.',
        'The three portfolio videos you upload, which may show your image and voice, and an optional profile photo.',
        'Your typed electronic signature and a record of your acceptance: the statements you ticked, the exact agreement and privacy notice text you accepted, the covered videos, the date and time recorded by our server and your submission reference.',
        'Necessary security information: short-lived counters that limit abuse, derived from a one-way hash of your IP address and deleted automatically after a short window.',
      ],
      after: [
        'Your legal name, signature and private agreement details are not published on your public portfolio. Only approved public-facing details and materials may be displayed: your public display name, approved videos and, if approved, your profile image.',
        'If you come through Fiverr we do not ask for your email address or phone number: communication and commercial transactions stay on Fiverr. We use no analytics or advertising trackers on the onboarding page, and we will not add you to any marketing email list without a separate lawful basis and any permission the law requires.',
      ],
    },
    {
      id: 'why',
      heading: 'Why we use it',
      bullets: [
        'To review your submission and record the permissions you give us.',
        'To run our relationship with you as part of our freelance creator network.',
        'To display your approved portfolio materials and public profile details on our website.',
        'To keep the process secure, prevent abuse and meet legal obligations.',
      ],
    },
    {
      id: 'bases',
      heading: 'Legal bases',
      paragraphs: [
        'We rely on: steps taken at your request before a possible collaboration; your consent to display your videos, image, voice and public profile (you can withdraw it at any time); our legitimate interests in running the network securely and keeping records of permissions; and legal obligations.',
      ],
    },
    {
      id: 'providers',
      heading: 'Who handles your information for us',
      paragraphs: ['These services help us run the onboarding page and process your information only to provide that service to us:'],
      bullets: [
        'Cloudflare Stream hosts, encodes and plays back your videos. Videos are private: playback needs a short-lived signed link until they are reviewed.',
        'Vercel hosts the website and runs the submission service, currently on servers in Washington, D.C., USA.',
        'Upstash (a Redis database, through the Vercel integration) stores submission records and profile photos. It is hosted in Frankfurt, Germany.',
        'Resend emails CONVRT a notification with your display name, languages, specializations and submission reference. It contains no videos and not your legal name.',
        'Fiverr is where orders, payments and communication stay for creators introduced through Fiverr.',
      ],
      after: [
        `CONVRT does not request automatic captions, transcription or any other AI analysis of your videos. ${tbc('provider data-processing and AI terms')}`,
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      bullets: [
        'Approved portfolio materials stay only while your display permission is active. If you withdraw it, we remove them from public display promptly and delete the stored files without undue delay, subject to any legal obligation.',
        'If your submission is rejected, we delete its videos and photo 90 days after the decision.',
        'Uploads you started but never submitted are deleted 14 days after your invitation expires.',
        `Your signed agreement and consent record never includes your media files, is kept private and is never published. We keep it while your portfolio is approved and for six years after a submission is rejected or withdrawn, so we can evidence what you agreed. ${tbc('six-year retention period')}`,
        `Copies held in our providers' backups, if any, are removed when those backups expire. ${tbc('provider backup retention')}`,
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      paragraphs: [
        `Some of these providers process information outside your country. Submissions are currently handled on servers in the USA, and Resend stores its data in the United States. ${tbc('transfer safeguards')}`,
      ],
    },
    {
      id: 'rights',
      heading: 'Your rights',
      paragraphs: [
        'Depending on where you live, you may have the right to access your information, correct it, have it deleted, restrict or object to its use, receive a copy, withdraw your consent at any time, and complain to your data protection authority.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [`For anything about your information, email ${CONTACT_EMAIL} or message us on Fiverr.`],
    },
  ],
}

/* Deterministic plain text of the privacy notice (stored and hashed with each acceptance). */
export function privacyText(doc = PRIVACY) {
  const out = [doc.title, '']
  if (doc.intro) out.push(doc.intro, '')
  for (const s of doc.sections) {
    out.push(s.heading.toUpperCase())
    for (const p of s.paragraphs || []) out.push(p)
    for (const b of s.bullets || []) out.push(`- ${b}`)
    for (const p of s.after || []) out.push(p)
    out.push('')
  }
  return out.join('\n').trim() + '\n'
}

/* The text of the generic (not yet personalised) agreement, for the standalone agreement page and tests. */
export const agreementText = () => agreementDocumentText(buildAgreementDocument())
