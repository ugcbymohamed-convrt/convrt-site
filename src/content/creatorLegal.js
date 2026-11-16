/* Creator Portfolio Agreement + Creator Privacy Notice (versioned).

   ⚠ AWAITING FINAL OWNER APPROVAL. This is a draft built from the owner's brief:
   • The legal contracting identity of CONVRT Studio (entity name, registered address, registration / tax
     number) is NOT anywhere in this repository and has deliberately not been invented.
   • Retention periods, legal bases, international-transfer arrangements and processor details in the Privacy
     Notice are marked "[OWNER TO CONFIRM]" wherever the repository cannot verify them.
   Real creator submissions are refused on the Production deployment while LEGAL_STATUS.approved is false
   (see api/_lib/creator/service.js). To go live: have the documents reviewed, replace every
   "[OWNER TO CONFIRM …]" marker, set the legal entity, bump the two version strings, then set
   LEGAL_STATUS.approved = true. Changing wording means bumping the version: each submission stores the exact
   text (and its SHA-256) that its creator accepted. */

import { CONTACT_EMAIL } from '../config.js'

export const LEGAL_STATUS = {
  approved: false,
  note: 'The legal contracting identity and some privacy details are still to be confirmed by the owner.',
}

export const AGREEMENT_VERSION = '0.1-draft'
export const PRIVACY_VERSION = '0.1-draft'

/* null = not confirmed. Do not fill with guesses. */
export const LEGAL_ENTITY = null

export const CONTRACTING_PARTY = {
  tradeName: 'CONVRT Studio',
  website: 'www.convrt.studio',
  contactEmail: CONTACT_EMAIL,
}

export const OWNER_FLAG = '[OWNER TO CONFIRM'

export const AGREEMENT = {
  title: 'CONVRT Studio — Creator Portfolio Agreement',
  sections: [
    {
      id: 'purpose',
      heading: 'Purpose',
      paragraphs: [
        "The Creator authorizes CONVRT Studio to showcase selected portfolio materials on its website to introduce the Creator's capabilities to prospective clients and explore future collaborations.",
      ],
    },
    {
      id: 'display',
      heading: 'Limited website-display permission',
      paragraphs: [
        'The Creator grants CONVRT Studio a limited, non-exclusive and revocable permission to display the three submitted and subsequently approved portfolio videos, agreed public display name, professional information and any approved profile image on www.convrt.studio.',
        'This permission is limited exclusively to website portfolio display.',
        'The materials may be technically hosted, encoded and displayed by authorized infrastructure providers solely as necessary for this purpose.',
        'No additional use is permitted without separate written approval from the Creator.',
      ],
    },
    {
      id: 'ownership',
      heading: 'Ownership',
      paragraphs: [
        'The Creator retains all intellectual property rights they hold in their submitted materials.',
        "This agreement does not transfer copyright or ownership of the Creator's content, image, voice, likeness or identity.",
        'Any existing third-party intellectual property rights remain unaffected.',
        "CONVRT will identify previously created independent work as portfolio examples from its freelance creator network and will not falsely represent it as work produced by CONVRT.",
      ],
    },
    {
      id: 'prohibited',
      heading: 'Prohibited uses',
      paragraphs: ['CONVRT agrees that the submitted materials will not be used for:'],
      bullets: [
        'AI or machine-learning training.',
        'Face cloning, replacement or identity replication.',
        'Voice cloning or voice synthesis.',
        'Digital avatars or synthetic replicas.',
        'Deepfakes.',
        'Paid advertising.',
        'Redistribution, resale or sublicensing, except for necessary technical hosting and display.',
        'Social media reposting.',
        'Additional commercial uses beyond the agreed website portfolio display.',
      ],
      after: ['Any other use requires separate, explicit written permission from the Creator.'],
    },
    {
      id: 'technical',
      heading: 'Technical adjustments',
      paragraphs: [
        'CONVRT may perform minor technical adjustments required for website display, including compression, encoding, resizing and thumbnail generation.',
        "These adjustments must not materially alter the Creator's image, voice, performance or message.",
        'Material creative edits require separate written approval.',
      ],
    },
    {
      id: 'permissions',
      heading: 'Permissions',
      paragraphs: [
        'The Creator confirms that they have the necessary rights and permissions to authorize display of the submitted materials.',
        "The Creator must not submit confidential content or videos subject to client restrictions that prevent their display on CONVRT's website.",
      ],
    },
    {
      id: 'removal',
      heading: 'Removal rights',
      paragraphs: [
        'The Creator may request the removal of their videos, profile image or public profile information at any time, without providing a reason.',
        'CONVRT will remove the requested materials from public display without undue delay and discontinue further use of those materials.',
        'Stored copies will be handled according to the applicable privacy notice and legal obligations.',
        'Withdrawal will not result in a penalty or an obligation to repay the agreed showcase incentive.',
        'Removal requests may be communicated through Fiverr for Fiverr-originated creators.',
      ],
    },
    {
      id: 'relationship',
      heading: 'Independent relationship',
      paragraphs: [
        'This agreement does not create an employment relationship, exclusivity arrangement or obligation to accept future projects.',
        'CONVRT does not guarantee a minimum number of projects, future revenue or ongoing work.',
        'Any future production projects will be governed by separately agreed project terms.',
      ],
    },
    {
      id: 'fiverr',
      heading: 'Fiverr compensation',
      paragraphs: ['For creators introduced through Fiverr:'],
      bullets: [
        'The agreed $25 showcase incentive is arranged through Fiverr.',
        'All orders, payments and future project compensation remain on Fiverr.',
        'Future collaboration bonuses, where agreed, are also handled through Fiverr.',
        'The onboarding page does not replace the Fiverr order or move the commercial relationship outside Fiverr.',
      ],
    },
    {
      id: 'privacy',
      heading: 'Privacy',
      paragraphs: [
        'Personal information and submitted portfolio materials are processed for submission review, recording permissions, administering the creator relationship and displaying approved materials in accordance with the Creator Privacy Notice.',
      ],
    },
    {
      id: 'acceptance',
      heading: 'Acceptance',
      paragraphs: [
        'The Creator confirms that they have read and understood the agreement and voluntarily grant the limited permission described above.',
        'CONVRT agrees to respect the stated limitations.',
        'The Creator signs by typing their full legal name. This is a simple electronic signature recorded with the date and time of acceptance; it is not a qualified or certified electronic signature.',
      ],
    },
  ],
}

export const PRIVACY = {
  title: 'CONVRT Studio — Creator Privacy Notice',
  intro:
    'This notice explains how CONVRT Studio handles the information you give us when you submit a creator portfolio. Items marked [OWNER TO CONFIRM] are still awaiting the owner’s confirmation and are shown openly rather than guessed.',
  sections: [
    {
      id: 'controller',
      heading: 'Who is responsible for your information',
      paragraphs: [
        `CONVRT Studio (www.convrt.studio) decides how and why your information is processed. ${OWNER_FLAG}: legal entity name, registered address and registration details.]`,
        `Privacy contact: ${CONTACT_EMAIL}`,
      ],
    },
    {
      id: 'collected',
      heading: 'What we collect',
      bullets: [
        'Your full legal name (used for the agreement; kept private unless you separately authorize its publication) and the public display name you choose.',
        'Your Fiverr profile link, the languages you work in and your specializations.',
        'The three portfolio videos you upload, which may show your image and voice, and an optional profile photo.',
        'Your typed electronic signature and a record of each acceptance: which boxes you ticked, the agreement and privacy-notice versions, the exact agreement text, the date and time recorded by our server, your submission reference and the identifiers of your uploaded files.',
        'Short-lived technical counters used to limit abuse (derived from a one-way hash of your IP address and deleted automatically after a short window).',
        'We do not ask for your email address or phone number if you come through Fiverr: communication stays on Fiverr. We do not use analytics or advertising trackers on the onboarding page, and we do not add you to any marketing list.',
      ],
    },
    {
      id: 'why',
      heading: 'Why we collect it',
      bullets: [
        'To review your submission.',
        'To record the permissions you give us.',
        'To administer our relationship with you as part of our freelance creator network.',
        'To display your approved portfolio materials and agreed profile information on our website, if approved.',
        'To keep the process secure and prevent abuse, and to meet legal obligations.',
      ],
    },
    {
      id: 'bases',
      heading: 'Legal bases',
      paragraphs: [
        `We expect to rely on: steps at your request before a possible collaboration; your consent to display your videos, image, voice and profile (which you can withdraw at any time); our legitimate interests in running the network securely and keeping records of permissions; and legal obligations. ${OWNER_FLAG}: legal bases to be confirmed with legal advice for the owner’s jurisdiction.]`,
      ],
    },
    {
      id: 'providers',
      heading: 'Who handles your information for us',
      bullets: [
        'Cloudflare Stream hosts, encodes and plays back your videos. Uploaded videos are private (access needs a short-lived signed link) until reviewed.',
        'Vercel hosts the website and runs the submission service.',
        `A database provider stores submission records and profile photos (Upstash Redis, via the Vercel integration). ${OWNER_FLAG}: confirm the provider and region in use.]`,
        'Resend sends CONVRT an email notification containing your display name, languages, specializations and submission reference. It does not contain your videos or legal name.',
        'Fiverr is where orders, payments and communication stay for creators introduced through Fiverr.',
        'Your materials are not used for AI or machine-learning training, face or voice cloning, digital avatars or synthetic replicas.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      paragraphs: [
        `${OWNER_FLAG}: retention periods have not been set yet.] Until they are, files are deleted when a removal or withdrawal request is processed, and a record of the agreement you signed (without your media files) may be kept as needed to evidence the permission and withdrawal, and to meet legal obligations.`,
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      paragraphs: [
        `The providers above may process information in countries other than your own. ${OWNER_FLAG}: where each provider processes data and the safeguards relied on.]`,
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
      id: 'removal',
      heading: 'Removing your materials or withdrawing permission',
      paragraphs: [
        'You can ask us to remove your videos, photo or profile information at any time, without giving a reason. Fiverr-originated creators can do this through Fiverr. You can also email us at the address below. We will stop displaying the materials without undue delay.',
      ],
    },
    {
      id: 'contact',
      heading: 'Contact',
      paragraphs: [`For anything about your information, email ${CONTACT_EMAIL}.`],
    },
  ],
}

/* Deterministic plain text of a document: what is stored (and hashed) as "the accepted text". */
export function documentText(doc) {
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

export const agreementText = () => documentText(AGREEMENT)
export const privacyText = () => documentText(PRIVACY)
