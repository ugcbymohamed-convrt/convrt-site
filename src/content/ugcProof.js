/* Proof shown on /ugc-video-agency. Pure data, so the facts and the exact wording live in one reviewable place.

   RULES (owner-confirmed, Nov 2026)
   • Elyon: the 5.28x ROAS belongs to ONE individual creator-led UGC video. It was reported by the client, during an early
     learning phase, and produced 9 purchases and $3,421.25 in reported revenue. It is never presented as typical, guaranteed
     or representative of all campaigns. Do NOT add a reporting period, ad spend or any other metric: none was supplied.
   • Testimonials are verbatim, with the attribution already published on the homepage (src/components/Testimonials.jsx).
     tests/ugc-page.test.mjs proves each quote still matches that source word for word. Never edit, shorten or strengthen a quote.
   • No stars, ratings, counts of repeat orders or other statistics are derived from the quotes. */

export const ELYON_PROOF = {
  brand: 'Elyon Dubai',
  category: 'Luxury fragrance · E-commerce',
  roas: '5.28x',
  purchases: 9,
  revenue: '$3,421.25',
  /* Production volume already published on the Elyon case study ("160+ spans every batch, format and follow-up variation produced
     since launch"). It is a production count, not a performance metric. */
  creativesProduced: '160+',
  caseStudyHref: '/case-studies/elyon',
}

/* Verbatim. Attribution = brand · category exactly as on the homepage. */
export const UGC_TESTIMONIALS = [
  {
    id: 'adscale',
    brand: 'Adscale',
    category: 'SaaS · Paid Social',
    quote:
      "The UGC videos he created were exactly what we needed to scale our ads. We've already come back for a second order and plan to continue working together long-term.",
  },
  {
    id: 'elyon',
    brand: 'Elyon Dubai',
    category: 'Luxury Fragrance · E-commerce',
    quote:
      "Mohamed understood the concept really well and actually exceeded my expectations with the quality. The videos are high quality, delivered on time, and the communication throughout was excellent. I've already ordered again, looking forward to continuing this partnership.",
  },
]
