/* CLIENT REVIEWS: the ONE place the three published reviews live (the homepage section, both the English and the Spanish version, reads it).

   `full` is the client's complete original wording, exactly as published before; it is never edited, shortened or re-translated, and it stays in the page (the English homepage shows it behind
   "Read full review"). `excerpt` is the short line shown first on the English homepage: it MUST be a verbatim, contiguous part of `full` (tests/home-redesign.test.mjs enforces this), so a
   shortened review never says anything the client did not say. `highlight` is a verbatim part of the excerpt that is picked out in lime (emphasis only, no change of wording).

   `repeat` is true only where the client's own words document a repeat relationship (a second or third order, "ordered again"); that is the only basis for the "Repeat Client" label.
   There are NO star ratings here on purpose: no rating source is recorded for these reviews, so none is shown (CLAUDE.md: never invent ratings; see docs/home-redesign-english.md).
   No review has a URL, platform or verification badge: they are testimonials sent to CONVRT, and the page never implies an external review site. Do not add any without the owner. */
export const REVIEWS = [
  {
    id: 'elyon',
    brand: 'Elyon Dubai',
    category: 'Luxury Fragrance · E-commerce',
    logo: '/clients/elyon.png',
    logoFilter: 'brightness(0) invert(1)',
    logoRounded: false,
    repeat: true,
    accent: '#f59e0b',
    excerpt: 'The videos are high quality, delivered on time, and the communication throughout was excellent.',
    highlight: 'high quality',
    full: "Mohamed understood the concept really well and actually exceeded my expectations with the quality. The videos are high quality, delivered on time, and the communication throughout was excellent. I've already ordered again, looking forward to continuing this partnership.",
  },
  {
    id: 'adscale',
    brand: 'Adscale',
    category: 'SaaS · Paid Social',
    logo: '/clients/adscale.png',
    logoFilter: 'brightness(0) invert(1)',
    logoRounded: false,
    repeat: true,
    accent: '#3b82f6',
    excerpt: 'The UGC videos he created were exactly what we needed to scale our ads.',
    highlight: 'scale our ads',
    full: "Working with Mohamad was an absolute pleasure. He's professional, creative, and truly understands what makes content perform. The UGC videos he created were exactly what we needed to scale our ads. We've already come back for a second order and plan to continue working together long-term.",
  },
  {
    id: 'talk360',
    brand: 'Talk360',
    category: 'Mobile App · International',
    logo: '/clients/talk360.jpg',
    logoFilter: 'none',
    logoRounded: true,
    repeat: true,
    accent: '#22d3ee',
    excerpt: 'Every time we work together the quality just keeps getting better.',
    highlight: 'quality just keeps getting better',
    full: "The videos are amazing again. Every time we work together the quality just keeps getting better. Fast delivery, great communication, and the content performs exactly the way we need it to. This is our third order and it won't be the last.",
  },
]
