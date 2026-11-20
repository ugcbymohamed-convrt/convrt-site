/* Copy for the trust and legal pages: About, Contact, Privacy Policy, Terms and Conditions. They render through src/TrustPage.jsx.

   STATUS: DRAFTS (TRUST_PAGES_PUBLISHED = false in src/config.js). Written only from facts that are already published on the site or recorded in this repository
   (src/seo/businessKnowledge.js, the FAQ data, the form handlers in api/, docs/*.md, src/lib/analytics.js). Anything that is not known is marked
   "[OWNER TO CONFIRM: ...]" instead of being guessed. tests/trust-pages.test.mjs refuses to let TRUST_PAGES_PUBLISHED be true while a marker remains.
   The Privacy Policy and Terms are drafts that need review by a legal adviser before publication; nothing here is legal advice.

   Inline links: write [[label|/path]] and the template turns it into an anchor. */

import { CONTACT_EMAIL, BOOKING_URL, OFFER_PATHS, CREATOR_SHOWCASE_PATH, PRIVACY_PATH, TERMS_PATH } from '../config.js'
import { BRAND, PRODUCTION_LANGUAGES, TALENT, USAGE_RIGHTS, TAX } from '../seo/businessKnowledge.js'

export const OWNER_MARKER = '[OWNER TO CONFIRM'
export const DRAFT_DATE = '20 November 2026'
const LANGS = `${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}`
const founder = BRAND.founder

export const TRUST_CONTENT = {
  about: {
    h1: 'About CONVRT',
    intro:
      'CONVRT is a founder-led creative studio. We produce human-led UGC ads, SaaS videos, spokesperson videos and organic social content for brands, with creative strategy, scripting, creator casting, filming and editing handled in one place.',
    sections: [
      {
        heading: 'What we do',
        body: [
          'We make video for brands that want content with one purpose: conversion. That covers four services, each with its own page:',
          { list: [
            '[[UGC video ads|/ugc-video-agency]]: creator-led ads for paid social, produced end to end.',
            '[[SaaS video production|/saas-video-production]]: explainers, product demonstrations, animation and ads for software and app brands, scoped to your brief.',
            '[[Spokesperson videos|/spokesperson-video-production]]: presenter-led videos for websites, product demos, apps and paid advertising.',
            '[[Organic social video|/social-media-video-production]]: content strategy, production, publishing and community management for Facebook, Instagram and TikTok.',
          ] },
          'Package prices and terms are on our [[pricing page|/pricing]].',
        ],
      },
      {
        heading: 'Who is behind it',
        body: [
          `CONVRT is founder-led. The studio is run by ${founder.name}, ${founder.jobTitle.toLowerCase()} of CONVRT Studio. The founder's profile is on [[LinkedIn|${founder.linkedin}]].`,
        ],
      },
      {
        heading: 'How we work with creators',
        body: [
          `${TALENT.model} We recommend the creator or presenter who best fits your brand and share relevant work samples before production, and you can take part in the selection when you want to.`,
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
    h1: 'Contact CONVRT',
    intro: 'The quickest way to start is a short conversation. Choose whichever route suits you.',
    sections: [
      {
        heading: 'Talk to us',
        body: [
          { list: [
            `Email: [[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]]`,
            `Book a creative call: [[choose a time|${BOOKING_URL}]] (opens our Calendly)`,
            `Free Creative Growth Roadmap: [[apply here|${OFFER_PATHS.roadmap}]]. Five personalised ad concepts, presented on a call. No obligation.`,
          ] },
        ],
      },
      {
        heading: 'Elsewhere',
        body: [
          { list: [
            `LinkedIn: [[${founder.name}|${founder.linkedin}]]`,
            `Instagram: [[@convrtcreativestudio|${BRAND.socialProfiles[0]}]]`,
          ] },
        ],
      },
      {
        heading: 'Creators',
        body: ['Freelance creators who would like to work with CONVRT can use the [[creator form|https://forms.gle/Bg8ubU2tnmMj88m7A]].'],
      },
      {
        heading: 'Referral partners',
        body: ['Know a brand that needs better video ads? See the [[Referral Partner Program|/referrals]].'],
      },
    ],
  },

  privacy: {
    h1: 'Privacy Policy',
    intro: `How CONVRT Studio handles personal information on www.convrt.studio. Draft prepared ${DRAFT_DATE}.`,
    sections: [
      {
        heading: 'Who we are',
        body: [
          `The website www.convrt.studio is operated by ${founder.name}, trading as ${BRAND.name} ("CONVRT", "we", "us"). You can contact us about this policy at [[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]].`,
          '[OWNER TO CONFIRM: whether a postal address, tax identification number or other legal-notice details must be shown here (website operators in Spain may have to publish them). They are on file for the creator agreements but have not been published on the public site.]',
        ],
      },
      {
        heading: 'What this policy covers',
        body: ['Visitors and enquirers on this website. Freelance creators who submit work through our private onboarding page receive a separate privacy notice at that step.'],
      },
      {
        heading: 'What we collect and why',
        body: [
          { list: [
            'Free Creative Growth Roadmap. You answer five short questions in your browser to check fit. Your answers stay in your browser and are used only for that check; they are not sent to us. If you are a good fit you can book a call on Calendly, which collects the details you enter there (such as name and email) under its own privacy policy. The calendar is shown only after you ask for it; Calendly is a separate company and sets cookies of its own, and its own cookie notice appears in the calendar. You can also open Calendly in a new tab or email us instead.',
            'Free ad hooks. We collect your email address, the industry you choose, and whether you agreed to receive marketing emails. They are stored in our email provider, MailerLite, and used to send the hooks and, if you agreed, marketing emails you can unsubscribe from at any time.',
            'Free video application. We collect your name, work email, company website, your answers about your business (business type, monthly ad spend range, videos per month, type of video, timing, interest in ongoing production) and an optional description. They are stored in MailerLite so we can review the application and contact you about it. We receive an email alert for each application through our email sender, Resend.',
            'Referral Partner Program. We collect your name, email, partner type, program choice, and optionally your company or agency name and website or LinkedIn profile, to review your application and contact you.',
            'Email and calls. If you email us or book a call, we use what you send to reply and to work with you.',
            'Technical data. Our hosting provider, Vercel, processes your IP address and request details to serve the website and keep it secure. Videos on the site are delivered through Cloudflare Stream.',
          ] },
          'We use this information to respond to you, review applications, provide the free offers you ask for, run and improve the website, and, with your consent, to send marketing emails and measure how the site is used. [OWNER TO CONFIRM: legal bases (for example consent, steps before a contract, legitimate interests) as advised by your legal adviser.]',
        ],
      },
      {
        heading: 'Cookies and similar technologies',
        body: [
          'The website works without optional cookies. Where analytics is switched on, we use Google Analytics through Google Tag Manager to see which pages are visited and which lead to enquiries, but only if you accept analytics cookies. Marketing cookies are off unless you turn them on, and the site does not set advertising cookies today.',
          'The cookie banner lets you accept all, reject all or choose categories. You can change or withdraw your choice at any time with the "Cookie settings" link in the footer; withdrawing stops analytics events and removes Google\'s cookies from this site.',
          'We also use your browser\'s storage for necessary purposes: to remember your cookie choice, and to remember campaign details in the link you arrived from (such as utm_source) so they can be passed to our booking calendar. These stay on your device.',
        ],
      },
      {
        heading: 'Who we share information with',
        body: [
          'Only with service providers that help us run the website and our services: MailerLite (email lists and application records), Resend (email alerts to us), Calendly (bookings), Vercel (hosting), Cloudflare (video delivery) and, if you accept analytics, Google (analytics). We do not sell personal information.',
          '[OWNER TO CONFIRM: data-processing agreements in place with each provider, and any other provider used.]',
        ],
      },
      {
        heading: 'Transfers outside your country',
        body: ['[OWNER TO CONFIRM: where each provider stores and processes data, and the safeguards used for transfers outside the European Economic Area or the United Kingdom.]'],
      },
      {
        heading: 'How long we keep it',
        body: ['[OWNER TO CONFIRM: retention periods for enquiries, applications, email-list records and analytics data.]'],
      },
      {
        heading: 'Your rights',
        body: [
          'Depending on where you live, you can ask us to access, correct, delete or restrict the use of your personal information, to receive a copy of it, and to object to certain uses. Where we rely on consent, you can withdraw it at any time, for example by unsubscribing from an email or changing your cookie settings. You can also complain to your data protection authority.',
          `To use these rights, email [[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]]. [OWNER TO CONFIRM: name of the supervisory authority to mention.]`,
        ],
      },
      {
        heading: 'Security and children',
        body: ['We use reputable providers and limit who can see applications, but no system is completely secure. The website is not directed at children.'],
      },
      {
        heading: 'Changes',
        body: [`We may update this policy and will change the date when we do. Related: our [[Terms and Conditions|${TERMS_PATH}]].`],
      },
    ],
  },

  terms: {
    h1: 'Terms and Conditions',
    intro: `The terms for using the CONVRT Studio website and its free offers. Draft prepared ${DRAFT_DATE}.`,
    sections: [
      {
        heading: 'About these terms',
        body: [`By using www.convrt.studio you agree to these terms. The site is operated by ${founder.name}, trading as ${BRAND.name}. See also our [[Privacy Policy|${PRIVACY_PATH}]].`],
      },
      {
        heading: 'Our services and how they are agreed',
        body: [
          `The packages and prices on this site describe how we typically work. A paid engagement starts only when we have agreed the scope, price and terms in writing. ${TAX.statement}`,
          'Custom projects, including SaaS demos and explainers, are scoped individually.',
        ],
      },
      {
        heading: 'Free offers',
        body: [
          { list: [
            'The free Creative Growth Roadmap gives five personalised ad concepts, presented on a call for brands that are a good fit. It does not include production of the ads, and there is no obligation to hire CONVRT.',
            'The free video production is by application. We review every application, offers are subject to fit and production conditions, and we do not guarantee that an application will be accepted.',
            'The free ad hooks are sent by email to the address you provide.',
          ] },
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
        heading: 'No guarantee of results',
        body: ['We never guarantee specific results. Advertising and social performance depends on factors such as your offer, audience, budget and platform.'],
      },
      {
        heading: 'Website content',
        body: ['The text, design, logo and original media on this site belong to CONVRT or the people who made them and may not be copied or reused without permission, except as the law allows. Links to third-party services are provided for convenience; we are not responsible for their content.'],
      },
      {
        heading: 'Liability and governing law',
        body: [
          '[OWNER TO CONFIRM: limitation of liability wording, to be drafted by your legal adviser.]',
          '[OWNER TO CONFIRM: governing law and where disputes are handled.]',
        ],
      },
      {
        heading: 'Changes and contact',
        body: [`We may update these terms and will change the date when we do. Questions: [[${CONTACT_EMAIL}|mailto:${CONTACT_EMAIL}]].`],
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

export const ownerMarkersIn = (page) => (plainText(page).match(/\[OWNER TO CONFIRM[^\]]*\]/g) || [])
