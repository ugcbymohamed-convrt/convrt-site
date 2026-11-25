/* FRENCH TRANSLATIONS OF CLIENT REVIEWS. A client's review is their own English wording, published with permission. On French pages each review is shown as a LABELLED TRANSLATION
   REVISION 3 (owner, 2026-11-24): the visible French review cards show ONLY the polished French text (no « Traduction française » label, no English original, no explanatory paragraph). The
   French wording below is the owner's own approved translation of the verbatim English reviews; the English originals stay in src/content/reviews.js / ugcProof.js (the source of truth, and the
   only text ever used in structured data, which carries no review markup at all). The translation is faithful and adds nothing (no result, number or promise that the original does not contain). Keys are the exact English reviews (src/components/Testimonials.jsx, src/content/ugcProof.js). */
export const FR_QUOTE_TRANSLATIONS = {
  "Mohamed understood the concept really well and actually exceeded my expectations with the quality. The videos are high quality, delivered on time, and the communication throughout was excellent. I've already ordered again, looking forward to continuing this partnership.":
    'Mohamed a parfaitement compris le concept et la qualité du résultat a dépassé mes attentes. Les vidéos ont été livrées dans les délais et la communication a été excellente tout au long du projet. J’ai déjà passé une nouvelle commande et me réjouis de poursuivre cette collaboration.',
  "Working with Mohamad was an absolute pleasure. He's professional, creative, and truly understands what makes content perform. The UGC videos he created were exactly what we needed to scale our ads. We've already come back for a second order and plan to continue working together long-term.":
    'Travailler avec Mohamad a été un vrai plaisir. Professionnel, créatif, il comprend parfaitement ce qui fait l’efficacité d’un contenu. Les vidéos UGC qu’il a réalisées correspondaient exactement à ce qu’il nous fallait pour développer nos campagnes publicitaires. Nous avons déjà passé une deuxième commande et comptons poursuivre notre collaboration sur le long terme.',
  "The videos are amazing again. Every time we work together the quality just keeps getting better. Fast delivery, great communication, and the content performs exactly the way we need it to. This is our third order and it won't be the last.":
    'Une fois de plus, les vidéos sont superbes. La qualité s’améliore à chaque collaboration. Livraison rapide, excellente communication et des contenus qui répondent parfaitement à nos attentes en matière de performance. C’est notre troisième commande, et certainement pas la dernière.',
  "The UGC videos he created were exactly what we needed to scale our ads. We've already come back for a second order and plan to continue working together long-term.":
    'Les vidéos UGC correspondaient exactement à ce qu’il nous fallait pour développer nos campagnes publicitaires. Nous avons déjà passé une deuxième commande et comptons poursuivre notre collaboration sur le long terme.',
}

/* The short line shown first in the homepage reviews (components/home/ClientReviews.jsx): the French translation of the English excerpt in src/content/reviews.js (itself a verbatim part of the full
   review), and the words picked out in lime (a verbatim part of the French line). Same faithfulness rule: nothing is added, no result, number or promise the original does not contain. */
export const FR_REVIEW_EXCERPTS = {
  elyon: { excerpt: 'Des vidéos de grande qualité, livrées dans les délais, avec une excellente communication du début à la fin.', highlight: 'grande qualité' },
  adscale: { excerpt: 'Les vidéos UGC correspondaient exactement à ce qu’il nous fallait pour développer nos campagnes publicitaires.', highlight: 'développer nos campagnes publicitaires' },
  talk360: { excerpt: 'À chaque collaboration, la qualité s’améliore.', highlight: 'la qualité s’améliore' },
}
