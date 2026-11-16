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
  note: 'The legal contracting identity and some privacy details are still to be confirmed by the owner.',
}

/* Internal revision ids (never rendered to creators). Bump when the wording changes. */
export const AGREEMENT_REVISION = 'agreement-2026-11-r2'
export const PRIVACY_REVISION = 'privacy-2026-11-r2'
// Names the rest of the code already uses for "the revision a creator accepted".
export const AGREEMENT_VERSION = AGREEMENT_REVISION
export const PRIVACY_VERSION = PRIVACY_REVISION

/* CONVRT's legal contracting name. Taken from the owner's own reference agreement ("CONVRT Studio (legal contracting
   name: …)"). It is NOT yet confirmed (confirmed: false): it is listed in OWNER_REVIEW_BLOCKERS. The tax/registration
   number shown next to the signature in that reference is deliberately NOT included: it is the owner's personal
   identifier and is not needed for this agreement unless the owner asks for it. */
export const LEGAL_ENTITY = { name: 'Mohamed Doukkali Azizi', confirmed: false }

export const CONTRACTING_PARTY = {
  tradeName: 'CONVRT Studio',
  website: 'www.convrt.studio',
  contactEmail: CONTACT_EMAIL,
}

export const OWNER_FLAG = '[OWNER TO CONFIRM'

/* What is still open before real creators may see these documents (shown to the owner in the review page). */
export const OWNER_REVIEW_BLOCKERS = [
  'Confirm CONVRT Studio’s legal contracting name used in the agreement and the privacy notice (currently taken from your reference PDF), and whether a registered address or tax/registration number should appear. The tax ID in the reference PDF has not been copied.',
  'Privacy notice: legal bases for processing (to be confirmed with legal advice for your jurisdiction).',
  'Privacy notice: retention periods, and what is kept after a removal request (signed agreement records, backups).',
  'Privacy notice: confirm the database region (Upstash was set up in Frankfurt, Germany) and where Cloudflare Stream and Resend process data.',
  'Privacy notice: international transfers. Vercel functions currently run in Washington, D.C., USA (per the request logs), so creator data passes through the US. Decide whether to move functions to an EU region, and confirm the transfer safeguards for each provider.',
  'Confirm that no AI, analysis or training features are enabled for creator files with any provider, and the applicable data-processing terms (Cloudflare, Vercel, Upstash, Resend).',
  'Have both documents reviewed (ideally by a lawyer) before real creators sign. Then set LEGAL_STATUS.approved to true.',
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

/* Builds the agreement for ONE creator. Everything the creator accepts is in this object: the same object drives the
   online agreement, the stored acceptance record and the signed PDF.
   @param {{ creatorName?: string, materials?: { slot: number, label: string }[] }} input */
export function buildAgreementDocument({ creatorName, materials = [] } = {}) {
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
  return out.join('\n').trim() + '\n'
}

/* ───────────────────────── Creator Privacy Notice ───────────────────────── */

export const PRIVACY_TITLE = 'Creator Privacy Notice'

export const PRIVACY = {
  title: PRIVACY_TITLE,
  intro:
    'This notice explains how CONVRT Studio handles the information you give us when you submit a creator portfolio. Points marked [OWNER TO CONFIRM] are still awaiting the owner’s confirmation and are shown openly rather than guessed.',
  sections: [
    {
      id: 'protect',
      heading: 'How we protect your content',
      highlight: true,
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
      after: [
        'We may make technical adjustments necessary to securely host and display approved content, such as encoding, compression, resizing and thumbnail generation. These adjustments do not authorize us to materially change your performance or identity.',
        'Any additional use requires your separate prior written agreement.',
      ],
    },
    {
      id: 'removal',
      heading: 'You can request removal at any time',
      highlight: true,
      paragraphs: [
        'You can request the removal of any approved video, image or profile information from CONVRT’s website at any time, without providing a reason.',
        `Contact us through Fiverr or at ${CONTACT_EMAIL}.`,
        'We will remove the relevant materials from public display without undue delay and stop using them for the agreed showcase.',
        'Stored copies and necessary legal records will be handled in accordance with our data-retention obligations. Requests to remove portfolio materials do not result in a penalty or repayment of the showcase incentive.',
      ],
    },
    {
      id: 'controller',
      heading: 'Who is responsible for your information',
      paragraphs: [
        `CONVRT Studio (legal contracting name: ${LEGAL_ENTITY.name}), www.convrt.studio, decides how and why your information is processed. ${OWNER_FLAG}: registered address and any registration details to be shown here.]`,
        `Privacy contact: ${CONTACT_EMAIL}`,
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
        'Necessary security information: short-lived counters used to limit abuse, derived from a one-way hash of your IP address and deleted automatically after a short window.',
      ],
      after: [
        'Your legal name, signature and private agreement details are not published on your public portfolio. Only approved public-facing details and materials may be displayed: your public display name, approved videos and, if approved, your profile image.',
        'We do not ask for your email address or phone number if you come through Fiverr: communication and commercial transactions stay on Fiverr. We do not use analytics or advertising trackers on the onboarding page. We will not add you to any marketing email list without a separate lawful basis and any permission the law requires.',
      ],
    },
    {
      id: 'why',
      heading: 'Why we collect it',
      bullets: [
        'To review your submission.',
        'To record the permissions you give us.',
        'To administer our relationship with you as part of our freelance creator network.',
        'To display your approved portfolio materials and public profile details on our website, if approved.',
        'To keep the process secure and prevent abuse, and to meet legal obligations.',
      ],
    },
    {
      id: 'bases',
      heading: 'Legal bases',
      paragraphs: [
        `We expect to rely on: steps at your request before a possible collaboration; your consent to display your videos, image, voice and public profile (which you can withdraw at any time); our legitimate interests in running the network securely and keeping records of permissions; and legal obligations. ${OWNER_FLAG}: legal bases to be confirmed with legal advice for the owner’s jurisdiction.]`,
      ],
    },
    {
      id: 'providers',
      heading: 'Who handles your information for us',
      paragraphs: ['We use these services to run the onboarding page. They process files and records only as needed to provide that service to us:'],
      bullets: [
        'Cloudflare Stream hosts, encodes and plays back your videos. Uploaded videos are private: playback needs a short-lived signed link until they are reviewed.',
        'Vercel hosts the website and runs the submission service. Its servers currently handling submissions are in Washington, D.C., USA.',
        `Upstash (Redis database, through the Vercel integration) stores submission records and profile photos. The database was set up in Frankfurt, Germany. ${OWNER_FLAG}: that this region is final.]`,
        'Resend sends CONVRT an email notification containing your display name, languages, specializations and submission reference. It does not contain your videos or legal name.',
        'Fiverr is where orders, payments and communication stay for creators introduced through Fiverr.',
      ],
      after: [
        `${OWNER_FLAG}: that no AI, analysis or training features are enabled for your files with any of these providers, and the data-processing terms that apply to each.]`,
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      paragraphs: [
        `${OWNER_FLAG}: retention periods have not been set yet.] Until they are, files are deleted when a removal or withdrawal request is processed, and a record of the agreement you signed (without your media files) may be kept as needed to evidence the permission and the withdrawal, and to meet legal obligations. Routine backups expire on their normal schedule.`,
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      paragraphs: [
        `The providers above may process information in countries other than your own. In particular, submissions are currently processed on servers in the USA. ${OWNER_FLAG}: the safeguards relied on for each provider and whether processing should move to an EU region.]`,
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
