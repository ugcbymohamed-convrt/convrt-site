/* Planned article topics shown as "Coming soon" cards on /blog.

   These are NOT articles: no dates, authors, reading times or body, and they never link
   anywhere or produce structured data / sitemap entries.

   Retiring a topic is automatic: when a published article uses the same `slug`, its card
   disappears from the Coming-soon list. Delete the entry afterwards to keep this file tidy.
   `art` picks the thumbnail graphic in components/blog/CoverArt.jsx.
   `category` is a slug from BLOG_CATEGORIES (src/lib/blog/schema.js). */

export const PLANNED_TOPICS = [
  {
    slug: 'why-facebook-ads-stop-performing-creative-fatigue',
    category: 'creative-strategy',
    art: 'fatigue',
    title: 'Why Your Facebook Ads Stop Performing (And How to Fix Creative Fatigue)',
    description: 'How to recognize creative fatigue and approach your next round of ad testing.',
    featured: true,
    featuredDescription:
      'Creative fatigue isn’t always about how often people see your ads. Learn what to examine before replacing your creatives.',
  },
  {
    slug: 'how-much-does-a-ugc-video-cost',
    category: 'ugc-video-ads',
    art: 'price',
    title: 'How Much Does a UGC Video Cost?',
    description: 'A practical look at pricing, deliverables, and what brands should consider.',
  },
  {
    slug: 'how-to-create-saas-video-ads-that-convert',
    category: 'saas-video-marketing',
    art: 'saas',
    title: 'How to Create SaaS Video Ads That Convert',
    description: 'Creative approaches for explaining products, building trust, and communicating value.',
  },
  {
    slug: 'how-many-video-ad-creatives-to-test-each-month',
    category: 'creative-strategy',
    art: 'testing',
    title: 'How Many Video Ad Creatives Should You Test Each Month?',
    description: 'How to think about testing volume, creative variations, and production planning.',
  },
  {
    slug: 'ugc-ads-vs-studio-ads',
    category: 'ecommerce-creative',
    art: 'versus',
    title: 'UGC Ads vs. Studio Ads: Which Should Your Brand Use?',
    description: 'Choosing the right video format for your product, audience, and marketing goals.',
  },
  {
    slug: 'human-led-vs-ai-generated-video-ads',
    category: 'ugc-video-ads',
    art: 'human-ai',
    title: 'Human-Led vs. AI-Generated Video Ads',
    description: 'Understanding where real creators, AI tools, and hybrid production workflows fit.',
  },
]
