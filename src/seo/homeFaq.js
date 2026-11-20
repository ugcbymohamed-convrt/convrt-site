/* The homepage FAQ. ONE list, used for the visible accordion (src/components/FAQ.jsx) and for the FAQPage JSON-LD on "/"
   (src/seo/structuredData.js), so the markup can never differ from what a visitor reads.

   Rules
   • Every claim here is either already published on the live site or confirmed by the owner (Nov 2026). The delivery, retainer
     and process answers match /pricing and src/seo/businessKnowledge.js.
   • CONVRT is a creative production and strategy partner: it does not buy media or manage clients' advertising accounts, and it
     does not present paid creators as genuine customers (both owner-confirmed).
   • "Founder-led" is already published on the site (/scale meta description, founder video); the earlier "prolific creator who has
     personally produced hundreds of videos" claim could not be substantiated from the business records and was replaced (Nov 2026).
   • No promised results, rankings, FAQ rich results or AI citations.
   • An answer is an array of paragraphs. `link` adds a final text link under the answer and `moreLinks` any further ones (neither is part of the structured-data text). */

export const HOME_FAQ = [
  {
    q: 'What is a video marketing agency, and what does CONVRT do?',
    a: [
      'A video marketing agency plans and produces video content that supports business goals. CONVRT is a creative production and strategy partner: we develop the concepts, scripts and creator casting, and produce the finished videos, from human-led UGC ads and spokesperson ads to organic social video.',
      "We don't buy media or manage your advertising accounts, so you keep control of distribution and spend.",
    ],
  },
  {
    q: 'What does the process of working with you look like?',
    a: [
      'Every project follows four stages. Strategy: brand discovery, audience research and creative concepts. Preparation: creator selection, scripts and your approval. Production: filming, editing, captions and creative variations. Delivery: finished videos, revisions and testing recommendations.',
      'Once we identify what works, we double down and iterate based on performance.',
    ],
  },
  {
    q: 'Can you produce videos in other languages and for other markets?',
    a: [
      'Yes. We produce in English, Spanish, French and Arabic, including Gulf and Moroccan Arabic dialects, and can source creators for other languages on request, subject to availability.',
      'We recommend the creator who best fits your brand and share relevant work samples before production.',
    ],
  },
  {
    q: 'Do you focus on paid ads or organic content?',
    a: 'Both. Some brands come to us for high-performing paid social creatives, while others need organic content that builds trust and attention over time. In many cases, the best strategy combines both.',
    link: { label: 'Learn about our organic social video production', href: '/social-media-video-production' },
  },
  {
    q: "What's the difference between a UGC video and a spokesperson video?",
    a: [
      'UGC ads use a natural, creator-led style. Spokesperson videos use a presenter to deliver a clear, scripted message with authority. We manage casting, scripting and production for both.',
      "We don't present paid creators as genuine customers.",
    ],
    link: { label: 'Learn about our UGC video production', href: '/ugc-video-agency' },
    moreLinks: [{ label: 'Learn about our spokesperson video production', href: '/spokesperson-video-production' }],
  },
  {
    q: 'Do you make SaaS explainer and product demo videos?',
    a: 'Yes. SaaS is one of our main categories, and we produce creator-led ads, spokesperson videos, product demonstrations and explainers. For software, we work with you to obtain suitable product access, demonstrations or reference materials when needed, using test data rather than real customer information where possible.',
  },
  {
    q: 'What types of brands do you work best with?',
    a: 'We work especially well with ecommerce brands, apps, SaaS companies, AI tools, premium consumer products, and brands that understand the importance of modern attention and creative testing.',
  },
  {
    q: 'Do you help with concepts and scripting?',
    a: "Absolutely, and we strongly recommend it. Creative direction, hooks, and scripting are a huge part of performance. After producing hundreds of creatives, we've developed a strong understanding of what captures attention and what people instantly scroll past.",
  },
  {
    q: 'How fast is delivery?',
    a: 'Production turnaround is 10 business days for the Creative Testing Sprint and 15 business days for Sprint Plus, starting once you have approved the creative concepts and scripts.',
    link: { label: 'See packages and pricing', href: '/pricing' },
  },
  {
    q: 'Do you offer monthly retainers?',
    a: 'Yes. Monthly Paid Social partnerships start with a 3-month commitment, then run month-to-month with 30 days’ cancellation notice. Organic Social partnerships start with an initial 6-month commitment. One-off projects are also available.',
    link: { label: 'See packages and pricing', href: '/pricing' },
  },
  {
    q: 'What makes CONVRT different?',
    a: "We're not just another marketing agency trying to pump out content. CONVRT is a founder-led creative studio focused on modern attention, retention, hooks, and paid social creative. Every project goes through our internal creative quality review.",
  },
  {
    q: "What's the difference between influencers and UGC creators?",
    a: [
      'Influencers get paid for access to their audience. UGC creators get paid for the content itself.',
      'Influencers sell through credibility and reach. UGC creators sell through performance and psychology.',
      "A brand doesn't always need more views, it needs content that actually converts.",
      "That's why UGC creators don't need massive followings. They need to understand hooks, buyer psychology, retention, and what makes people click, trust, and buy.",
      "The best UGC creators aren't trying to go viral. They're trying to make the brand money.",
    ],
  },
]

export const homeFaqText = (item) => [].concat(item.a).join(' ')
