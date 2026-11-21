/* Copy for the trust and legal pages: About, Contact, Privacy Policy and Terms of Service. They render through src/TrustPage.jsx.

   STATUS: DRAFTS (TRUST_PAGES_PUBLISHED = false in src/config.js). Written only from facts that are already published on the site, recorded in this repository
   (src/seo/businessKnowledge.js, src/content/operator.js, the FAQ data, the form handlers in api/, docs/*.md, src/lib/analytics.js) or confirmed by the owner (Nov 2026).
   Anything that is not known is marked instead of being guessed:
     [OWNER TO CONFIRM: ...]  a fact only the owner can supply or check (dashboard setting, agreement, address).
     [LEGAL REVIEW: ...]      wording or a retention period that a legal adviser must approve (legal basis, liability, governing law).
   tests/trust-pages.test.mjs refuses to let TRUST_PAGES_PUBLISHED be true while either marker remains, or while the legally required operator details are hidden.
   The Privacy Policy and Terms are drafts for review by a legal adviser; nothing here is legal advice.

   Inline links: write [[label|/path]] and the template turns it into an anchor. Marker text must not contain a closing square bracket. */

import { CONTACT_EMAIL, BOOKING_URL, OFFER_PATHS, CREATOR_SHOWCASE_PATH, PRIVACY_PATH, TERMS_PATH, COMPANY_LINKEDIN_URL, INSTAGRAM_URL, LEGAL_NOTICE_DETAILS_APPROVED } from '../config.js'
import { BRAND, CREATOR_ALLOCATION, PRODUCTION_LANGUAGES, TALENT, USAGE_RIGHTS, TAX } from '../seo/businessKnowledge.js'
import { OPERATOR } from './operator.js'
import { CURRENT_MARKETING_CONSENT_VERSION, marketingConsentText } from './marketingConsent.js'

export const OWNER_MARKER = '[OWNER TO CONFIRM'
export const LEGAL_MARKER = '[LEGAL REVIEW'
export const MARKER_RE = /\[(?:OWNER TO CONFIRM|LEGAL REVIEW)[^\]]*\]/g
export const DRAFT_DATE = '21 November 2026'
const LANGS = `${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}`
const founder = BRAND.founder
const mail = `[[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]]`
const CREATOR_FORM = 'https://forms.gle/Bg8ubU2tnmMj88m7A'

/* The legally required operator details (LSSI art. 10). The tax ID (NIF) and postal address are on file but stay private until the owner approves
   showing them (LEGAL_NOTICE_DETAILS_APPROVED); until then a visible marker shows where they go. */
export const operatorDetails = () => [
  `Trading name: ${OPERATOR.tradingName}`,
  `Operator: ${OPERATOR.name}, ${OPERATOR.structure}`,
  LEGAL_NOTICE_DETAILS_APPROVED
    ? `Tax identification number (NIF): ${OPERATOR.taxId}`
    : '[OWNER TO CONFIRM: show the operator’s tax identification number here. Spanish law requires it in a commercial website’s legal information (Ley 34/2002, art. 10); it is on file but not published until you approve it]',
  LEGAL_NOTICE_DETAILS_APPROVED
    ? `Postal address: ${OPERATOR.address}`
    : '[OWNER TO CONFIRM: show the operator’s postal address here. Spanish law requires a domicile or the address of an establishment in Spain (Ley 34/2002, art. 10); it is on file but not published until you approve it]',
  `Email: ${mail}`,
  `Other ways to reach us directly: [[book a call|${BOOKING_URL}]] and [[CONVRT Studio on LinkedIn|${COMPANY_LINKEDIN_URL}]]`,
]

export const TRUST_CONTENT = {
  about: {
    h1: 'About CONVRT Studio',
    intro:
      'CONVRT Studio is a founder-led creative studio. We produce human-led UGC ads, SaaS videos, spokesperson videos and organic social content for businesses, with creative strategy, scripting, creator casting, filming and editing handled in one place, and a focus on performance-driven creative.',
    sections: [
      {
        heading: 'What we do',
        body: [
          'We make video for businesses that want content with one purpose: conversion. That covers four services, each with its own page:',
          { list: [
            '[[UGC video ads|/ugc-video-agency]]: creator-led ads for paid social, produced end to end.',
            '[[SaaS video production|/saas-video-production]]: explainers, product demonstrations, animation and ads for software and app brands, scoped to your brief.',
            '[[Spokesperson videos|/spokesperson-video-production]]: presenter-led videos for websites, product demos, apps and paid advertising.',
            '[[Organic social video|/social-media-video-production]]: content strategy, production, publishing and community management for Facebook, Instagram and TikTok.',
          ] },
          'Package prices and terms are on our [[pricing page|/pricing]]. We work with businesses only.',
        ],
      },
      {
        heading: 'A founder-led studio',
        body: [
          `CONVRT Studio is run by its founder, ${founder.name}, ${founder.jobTitle}. The studio is operated as ${OPERATOR.structure}. You can follow the studio on [[LinkedIn|${COMPANY_LINKEDIN_URL}]] and [[Instagram|${INSTAGRAM_URL}]]; the founder also has a personal [[LinkedIn profile|${founder.linkedin}]].`,
          'Creative strategy, scripts, creator casting, filming and editing are handled in one place, so you deal with one studio instead of coordinating several suppliers.',
        ],
      },
      {
        heading: 'How we work with creators',
        body: [
          `${TALENT.model} We recommend the creator or presenter who best fits your brand and share relevant work samples before production, and you can take part in the selection when you want to.`,
          `${CREATOR_ALLOCATION.answer[0]} Specific creators are subject to availability.`,
          `Freelance creators who would like to work with CONVRT can apply through the [[creator form|${CREATOR_FORM}]]. CONVRT decides which creators it works with. A creator’s video appears in our Creator Showcase only when that creator has agreed and CONVRT has approved it.`,
          'Our UGC and spokesperson videos feature real people on camera, with human creative direction and quality control. They are not AI-generated avatars.',
          `The videos in our [[Creator Showcase|${CREATOR_SHOWCASE_PATH}]] are examples from independent creators. They illustrate styles and approaches and are not necessarily productions by CONVRT.`,
        ],
      },
      {
        heading: 'Languages and markets',
        body: [`We produce in ${LANGS}. ${PRODUCTION_LANGUAGES.other}`],
      },
      {
        heading: 'What we do not do',
        body: [
          'We do not buy media or manage your advertising accounts, so you keep control of distribution and spend. We never guarantee specific results: performance depends on your offer, audience and budget.',
        ],
      },
      {
        heading: 'See the work and talk to us',
        body: [
          'Read how we approached [[Graspo|/case-studies/graspo]] and [[Elyon Dubai|/case-studies/elyon]], then [[get in touch|/contact]] or apply for the [[free Creative Growth Roadmap|' + OFFER_PATHS.roadmap + ']].',
        ],
      },
    ],
  },

  contact: {
    h1: 'Contact CONVRT Studio',
    intro: 'The quickest way to start is a short conversation. Choose whichever route suits you.',
    sections: [
      {
        heading: 'Talk to us',
        body: [
          { list: [
            `Email: ${mail}`,
            `Book a creative call: [[choose a time|${BOOKING_URL}]] (opens our Calendly)`,
            `Free Creative Growth Roadmap: [[apply here|${OFFER_PATHS.roadmap}]]. Five personalised ad concepts, presented on a call. No obligation.`,
          ] },
        ],
      },
      {
        heading: 'Find us online',
        body: [
          { list: [
            `CONVRT Studio on LinkedIn: [[official company page|${COMPANY_LINKEDIN_URL}]]`,
            `Instagram: [[@convrtcreativestudio|${INSTAGRAM_URL}]]`,
            `Founder: [[${founder.name} on LinkedIn|${founder.linkedin}]] (personal profile)`,
          ] },
        ],
      },
      {
        heading: 'Creators',
        body: [`Freelance creators who would like to work with CONVRT can use the [[creator form|${CREATOR_FORM}]].`],
      },
      {
        heading: 'Referral partners',
        body: ['Know a business that needs better video ads? See the [[Referral Partner Program|/referrals]].'],
      },
      {
        heading: 'Who runs this website',
        body: [`${OPERATOR.tradingName} is operated by ${OPERATOR.name}, ${OPERATOR.structure}. The full details are in the [[legal notice|${TERMS_PATH}#trust-legal-notice]]. For questions about personal data, see the [[Privacy Policy|${PRIVACY_PATH}]].`],
      },
    ],
  },

  privacy: {
    h1: 'Privacy Policy',
    intro: `How CONVRT Studio handles personal information on www.convrt.studio. Draft prepared ${DRAFT_DATE}.`,
    sections: [
      {
        heading: 'Who is responsible for your information',
        body: [
          `The website www.convrt.studio is operated by ${OPERATOR.name}, ${OPERATOR.structure}, trading as ${OPERATOR.tradingName} ("CONVRT", "we", "us"). We decide how and why the information described below is used (we are the "controller").`,
          { list: operatorDetails() },
          `For anything about this policy or your information, email ${mail}.`,
        ],
      },
      {
        heading: 'What this policy covers',
        body: [
          'Visitors and enquirers on this website. It is written for business contacts: our services are offered to businesses, not to consumers. Freelance creators who submit work through our private onboarding page receive a separate privacy notice at that step.',
        ],
      },
      {
        heading: 'What we collect, why, and on what basis',
        body: [
          'Each item below says what we collect, why, and the legal basis we rely on.',
          { list: [
            'Free Creative Growth Roadmap. You answer five short questions in your browser to check fit. Your answers stay in your browser and are used only for that check; they are not sent to us. If you are a good fit you can book a call on Calendly (see "Booking a call").',
            'Free ad hooks. We collect your email address and the industry you choose, and use them to send you the hooks you asked for. Basis: your request. We may ask you to confirm your email first. Receiving the hooks does not add you to our marketing list.',
            'Free video application. We collect your name, work email, company website, your answers about your business (business type, monthly ad spend range, videos per month, type of video, timing, interest in ongoing production) and an optional description, to review the application and contact you about it. Basis: steps you ask us to take before an agreement, and our legitimate interest in running the offer. We receive an email alert for each application through our email sender, Resend.',
            'Referral Partner Program. We collect your name, email, partner type, program choice, and optionally your company or agency name and website or LinkedIn profile, to review your application and contact you about it. Basis: as for the free video application.',
            'Email and calls. If you email us or book a call, we use what you send to reply and to work with you.',
            'Technical data. Our hosting provider, Vercel, processes your IP address and request details to serve the website and keep it secure. Videos on the site are delivered through Cloudflare Stream. Basis: our legitimate interest in a secure, working website.',
            'Creator form. The link for freelance creators opens a Google Form; what you enter there is handled through Google Forms.',
          ] },
          '[LEGAL REVIEW: confirm the legal bases above for each purpose (consent, steps before a contract, legitimate interests, legal obligation) and whether a short note to people who simply email us is needed]',
        ],
      },
      {
        heading: 'Marketing emails (optional, separate from everything else)',
        body: [
          'We send promotional emails (creative tips and offers) only if you tick the optional box that appears next to our forms. The box is never ticked for you, and you can submit every form without ticking it. Not ticking it never affects your application, the resource you asked for, or any reply from us.',
          `The wording you agree to is: "${marketingConsentText()}" We keep applications and requests separate from our marketing list. When you tick the box we record that you agreed, the date and time, which form you used and the version of the wording you saw (currently ${CURRENT_MARKETING_CONSENT_VERSION}), and add your address to the marketing list. Basis: your consent.`,
          'Emails about your application, the resource you requested, a booking or a project you have with us are service messages, not marketing, and are not covered by this choice.',
          'You can withdraw your consent at any time, free of charge: use the unsubscribe link in any marketing email, or email us. Unsubscribing stops promotional emails; we keep a minimal record that you unsubscribed so that we do not email you again. It does not affect any application you made.',
          '[OWNER TO CONFIRM: that every marketing email will include an unsubscribe link and the operator’s identity (Spanish law, LSSI art. 21 and 22), and which MailerLite double opt-in setting you use]',
        ],
      },
      {
        heading: 'Booking a call',
        body: [
          'The booking calendar is provided by Calendly, a separate company. It is shown only after you ask for it, or you can open Calendly in a new tab or email us instead. Calendly collects the details you enter there (such as name, email and your answers) and, as a separate company, sets cookies of its own and shows its own cookie notice. See Calendly’s privacy notice for how it uses that information. We receive the booking details and use them to hold the call and follow up on it.',
          '[LEGAL REVIEW: whether Calendly acts as our processor or as an independent controller for the booking details and cookies, and whether showing the calendar after a click, with Calendly’s own notice, is enough for the cookies it sets]',
        ],
      },
      {
        heading: 'Cookies and similar technologies',
        body: [
          'The website works without optional cookies. Where analytics is switched on, we use Google Analytics through Google Tag Manager to see which pages are visited and which lead to enquiries, but only if you accept analytics cookies. Marketing cookies are off unless you turn them on, and the site does not set advertising cookies today. The cookie choices are about cookies only; marketing emails are a separate choice on our forms.',
          'The cookie banner lets you accept all, reject all or choose categories. You can change or withdraw your choice at any time with the "Cookie settings" link in the footer; withdrawing stops analytics events and removes Google\'s cookies from this site.',
          'We also use your browser\'s storage on this site, which stays on your device:',
          { list: [
            'convrt_consent_v1: your cookie choice, kept until you change it or clear your browser data.',
            'convrt_scale_attribution (this browser tab only): the campaign details in the link you arrived through (utm_source, utm_medium, utm_campaign, utm_content and utm_term), so they can be passed on to our booking link. We do not store advertising click identifiers (such as gclid or fbclid).',
            'convrt_calendly_requested (this browser session only): that you asked to see the booking calendar.',
            'convrt_landing_page (this browser session only, and only if you accept analytics): the first page of your visit, used to see which pages lead to enquiries.',
            'Google Analytics cookies _ga and _ga_<container ID>, only if you accept analytics. [OWNER TO CONFIRM: the cookie lifetimes shown in your browser for these two cookies on the Preview]',
          ] },
          'The booking calendar and any other embedded third-party service set cookies of their own, under their own notices.',
        ],
      },
      {
        heading: 'Analytics',
        body: [
          'If you accept analytics cookies, Google Analytics (through Google Tag Manager) measures page views and actions such as clicking a call-to-action or completing a form. These events never include your name, email address or anything you type into a form. We have switched off Google signals and the collection of user-provided data, and Google Analytics keeps event-level data for 14 months.',
          '[OWNER TO CONFIRM: that Google’s data-processing terms have been accepted for the Analytics account and that the settings above are still in place]',
        ],
      },
      {
        heading: 'Who we share information with',
        body: [
          'Only with service providers that help us run the website and our services, who handle it on our behalf: MailerLite (application, request and email-list records, and sending our emails), Resend (email alerts to us when someone applies), Calendly (bookings), Vercel (hosting), Cloudflare (video delivery) and, if you accept analytics, Google (analytics). We do not use any other customer database. We do not sell personal information.',
          '[OWNER TO CONFIRM: for each provider, the data-processing terms that apply to your account (see the provider checklist), and any other tool that touches visitor data]',
        ],
      },
      {
        heading: 'Transfers outside the European Economic Area',
        body: [
          'Some of these providers are based in, or process information in, the United States or other countries outside the European Economic Area. [OWNER TO CONFIRM: for each provider, where it stores and processes the information and the safeguard it relies on for transfers (for example an adequacy decision, the EU-US Data Privacy Framework or Standard Contractual Clauses), taken from its current documents]',
          '[LEGAL REVIEW: the wording of this section once the locations and safeguards are confirmed]',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'These are the periods we intend to apply:',
          { list: [
            'Applications and enquiries that do not lead to a project: 12 months after our last meaningful contact with you.',
            'Booking records: 12 months, unless an ongoing business relationship justifies keeping them longer.',
            'Marketing email list: until you withdraw your consent or unsubscribe, with a periodic review of inactive addresses.',
            'Contracts, invoices and accounting records: as long as Spanish law requires.',
            'Google Analytics event data: 14 months.',
          ] },
          '[LEGAL REVIEW: these periods are proposals. Confirm them, and confirm how deletion or anonymisation is carried out, before publication. No automated deletion exists yet]',
        ],
      },
      {
        heading: 'Your rights and how to complain',
        body: [
          'You can ask us to access, correct or delete your personal information, to restrict or object to its use, and to receive a copy of it in a portable format. Where we rely on consent, you can withdraw it at any time, for example by unsubscribing from an email or changing your cookie settings; withdrawing does not affect what we did before.',
          `To use these rights, email ${mail}. We will answer within the time the law allows.`,
          'You can complain to the Spanish data protection authority, the Agencia Española de Protección de Datos (AEPD), at www.aepd.es, or to the authority in the country where you live or work.',
        ],
      },
      {
        heading: 'Security and children',
        body: ['We use reputable providers and limit who can see applications, but no system is completely secure. The website is intended for business users and is not directed at children.'],
      },
      {
        heading: 'Changes',
        body: [`We may update this policy and will change the date when we do. Related: our [[Terms of Service|${TERMS_PATH}]].`],
      },
    ],
  },

  terms: {
    h1: 'Terms of Service',
    intro: `The terms for using the CONVRT Studio website and its free offers. Draft prepared ${DRAFT_DATE}.`,
    sections: [
      {
        heading: 'Legal notice',
        body: [
          'This website is operated by:',
          { list: operatorDetails() },
        ],
      },
      {
        heading: 'About these terms',
        body: [
          `By using www.convrt.studio you agree to these terms. They are for businesses: our services are offered to businesses only, and the website is not intended for consumers. See also our [[Privacy Policy|${PRIVACY_PATH}]].`,
        ],
      },
      {
        heading: 'Using the website',
        body: [
          'You may use the website to learn about our services and to contact us or apply for our offers. Do not misuse it: do not try to disrupt or gain unauthorised access to it, send false or misleading information through its forms, or use it to send us unsolicited commercial material.',
        ],
      },
      {
        heading: 'Enquiries and applications',
        body: [
          'Sending an enquiry or application does not create a contract and does not oblige either side. We review applications ourselves, we may decline or not respond to any of them, and we do not promise a reply time. Please give accurate information. How we use it is described in the [[Privacy Policy|' + PRIVACY_PATH + ']].',
        ],
      },
      {
        heading: 'Free creative concepts offer',
        body: [
          'The free Creative Growth Roadmap gives five personalised ad concepts, presented on a call, for businesses that are a good fit. It does not include producing the ads, there is no obligation to hire CONVRT, and the concepts are provided for your evaluation.',
          '[LEGAL REVIEW: who owns the concepts presented in the free offer and what the business may do with them if it does not hire CONVRT]',
        ],
      },
      {
        heading: 'Free Video Production eligibility',
        body: [
          'The free video production is by application and is limited. We review every application and invite the right-fit businesses to a short call before anything goes into production. Offers are subject to fit and production conditions, and we do not guarantee that an application will be accepted. The offer includes one video and two bonus hook variations; the final scope is confirmed with the selected business in writing.',
          '[OWNER TO CONFIRM: the conditions that apply to the free video (for example one per business, deadlines, usage rights to the video, whether the business must supply product or materials) so they can be stated here]',
        ],
      },
      {
        heading: 'Free ad hooks and other free resources',
        body: ['The free ad hooks are sent by email to the address you provide. They are general creative inspiration and are provided as they are.'],
      },
      {
        heading: 'Our services and how they are agreed',
        body: [
          `The packages and prices on this site describe how we typically work. A paid engagement starts only when we have agreed the scope, price and terms in writing. ${TAX.statement}`,
          'Custom projects, including SaaS demos and explainers, are scoped individually.',
        ],
      },
      {
        heading: 'Creator Showcase',
        body: ['Videos in the Creator Showcase and in service-page galleries are examples from independent creators. They are shown to illustrate styles and approaches and are not necessarily productions by CONVRT.'],
      },
      {
        heading: 'Usage rights',
        body: [
          `Where usage rights are included in a package, they license how you may use the finished videos (for example ${USAGE_RIGHTS.includedMonths} months of worldwide use in our standard packages). They are not a transfer of copyright ownership. The exact terms are set out in your agreement.`,
        ],
      },
      {
        heading: 'Website content and intellectual property',
        body: [
          'The text, design, logo, trademarks and original media on this site belong to CONVRT or the people who made them and may not be copied, reused or adapted without permission, except as the law allows. Videos shown on the site remain the property of their owners and are shown with their permission. Links to third-party services are provided for convenience; we are not responsible for their content or practices.',
        ],
      },
      {
        heading: 'No guarantee of results',
        body: ['We never guarantee specific business or advertising results, such as sales, leads, return on ad spend or audience growth. Performance depends on factors such as your offer, audience, budget and platform. The examples and case studies on this site show what happened for the businesses concerned and are not a promise that you will achieve the same.'],
      },
      {
        heading: 'Liability',
        body: [
          'The website and its content are provided as they are. To the extent the law allows, CONVRT is not liable for indirect or consequential loss, or for loss of profit, revenue or data, arising from the use of the website or from reliance on its content, and its total liability for the use of the website is limited to direct damage. Nothing in these terms limits liability that cannot be limited by law.',
          '[LEGAL REVIEW: the limitation of liability above is a proposal for a business-to-business website. A Spanish legal adviser must approve it, including what cannot be excluded under Spanish law]',
        ],
      },
      {
        heading: 'Governing law and disputes',
        body: [
          'These terms are governed by Spanish law. [LEGAL REVIEW: governing law, and which courts or dispute-resolution route applies between businesses (for example the courts of a named Spanish city), to be chosen with a Spanish legal adviser]',
        ],
      },
      {
        heading: 'Website terms and signed client agreements',
        body: [
          'These terms cover the use of the website and our free offers. They do not govern a paid project. A paid project is governed by the written agreement, order or proposal that both sides accept for it. If a signed agreement conflicts with these terms, the signed agreement prevails for that project.',
          '[OWNER TO CONFIRM: how a paid engagement is documented today (signed proposal, order form or agreement). A standard Client Service Agreement does not exist yet; see the outline prepared for it]',
        ],
      },
      {
        heading: 'Changes and contact',
        body: [`We may update these terms and will change the date when we do. Questions: ${mail}.`],
      },
    ],
  },
}

/* Plain text of a page (links reduced to their label), for tests and the draft check. */
export const plainText = (page) => {
  const strip = (s) => s.replace(/\[\[([^\]|]+)\|[^\]]+\]\]/g, '$1')
  const parts = [page.h1, page.intro]
  for (const s of page.sections) {
    parts.push(s.heading)
    for (const b of s.body) parts.push(...(typeof b === 'string' ? [b] : b.list))
  }
  return parts.map(strip).join('\n')
}

/* Every unresolved marker: [OWNER TO CONFIRM: ...] and [LEGAL REVIEW: ...]. */
export const ownerMarkersIn = (page) => (plainText(page).match(MARKER_RE) || [])
