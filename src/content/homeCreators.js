/* The creator carousel on the SPANISH homepage ("Creadores que destacan. A tu alcance."), which replaces the English-only "case studies" panels there.

   Eight real Spanish-language videos, in a fixed order (no shuffling: stable markup, no hydration differences): the strongest approved clip of each of the six Spanish creators plus two more clips from the
   approved Spanish library. They are entries of src/content/portfolio.js (never copied): same Cloudflare Stream ids, same-origin posters, same approvals. Creator names are never shown (no `showName`
   permission is recorded); the private name-to-id map lives outside the repository (CONVRT/Claude/multilingual-es/spanish-videos-private-map.csv).

   creator es-c01 → es-ugc-hero-1 (unboxing)            · creator es-c02 → es-spokesperson-hero-1 (presenter outdoors)
   creator es-c03 → es-ugc-hero-2 (service explained)   · creator es-c06 → es-spokesperson-3 (podcast-style presenter; the creator the owner asked to include, confirmed 2026-11-23)
   creator es-c04 → es-ugc-hero-3 (glasses collection)  · creator es-c05 → es-ugc-4 (garment details)
   extras        → es-ugc-5 (digital solution, es-c02) and es-spokesperson-hero-2 (app walkthrough, es-c01)
   An id whose video is not approved (isDisplayable) is skipped, never replaced by an invented entry. */

import { displayableFor } from './portfolio.js'

export const HOME_CREATOR_IDS = [
  'es-ugc-hero-1', 'es-spokesperson-hero-1', 'es-ugc-hero-2', 'es-spokesperson-3',
  'es-ugc-hero-3', 'es-ugc-5', 'es-ugc-4', 'es-spokesperson-hero-2',
]

export function homeCreatorVideos(locale = 'es') {
  const byId = new Map(displayableFor(locale).map((v) => [v.id, v]))
  return HOME_CREATOR_IDS.map((id) => byId.get(id)).filter(Boolean)
}
