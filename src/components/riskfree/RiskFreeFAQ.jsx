import RoadmapFAQ from '../roadmap/RoadmapFAQ.jsx'
import { CONTACT_EMAIL } from '../../config.js'

/* ─────────────────────────────────────────────
   FREE VIDEO — FAQ. Answers only what is already documented on this page and
   in the application flow. Anything not yet decided (video length, format,
   revision rounds, usage rights, shipping and third-party costs, timeline) is
   deliberately NOT stated as a fixed term: it says it is confirmed with the
   applicant before production starts. When those terms are decided, replace
   the matching answers below with the real figures.
───────────────────────────────────────────── */

const FAQS = [
  {
    q: 'Is the video really free?',
    a: 'Yes. If your application is accepted, CONVRT produces 1 video for you at no charge, plus 2 bonus hook variations. Production is subject to fit and to conditions we confirm with you before anything is made.',
  },
  {
    q: 'Who qualifies for the free video?',
    a: 'Availability is limited and every application is reviewed by our team. We look at your brand and production needs, and we invite the brands that look like a good fit. Applying does not guarantee a place.',
  },
  {
    q: 'What’s included in the free video?',
    a: '1 video ad produced by CONVRT and built around your brand, offer, and audience. Practical details such as length, format, and the creator arrangement are agreed with you once you are invited, before production starts.',
  },
  {
    q: 'Are the two bonus hook variations included?',
    a: 'Yes. They are two alternative openings you can test against the original video.',
  },
  {
    q: 'Can I use the video in paid advertising?',
    a: 'The video is made as a video ad. We confirm the usage terms with you before production starts.',
  },
  {
    q: 'Are revisions included?',
    a: 'We confirm the revision scope with you before production starts.',
  },
  {
    q: 'Are there any shipping or external production costs?',
    a: 'Depending on your product, a creator may need to receive it, or a project may need specialist or third-party help. Any shipping responsibility or external cost is discussed and agreed with you before production starts.',
  },
  {
    q: 'What happens after I submit my application?',
    a: 'Your application is reviewed by a person on our team. If it is a good fit, we invite you to a short call, we confirm the production details together, and the video is produced according to the conditions we agreed.',
  },
  {
    q: 'Do I have to buy anything afterward?',
    a: 'No. The idea is to let you test CONVRT first and then decide whether we are a fit. If you have questions about the terms, email us at ' + CONTACT_EMAIL + '.',
  },
]

export default function RiskFreeFAQ() {
  return <RoadmapFAQ faqs={FAQS} idPrefix="risk-free-faq" />
}
