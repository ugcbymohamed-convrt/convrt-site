/* Prints the inventory of every Cloudflare Stream video the site shows, as JSON: [{ uid, frame (seconds or null), posters (same-origin images), where (every place it appears) }].
   Used by scripts/poster-frames.py (which re-exports the posters) and for docs/video-thumbnails.md.   node scripts/poster-inventory.mjs */
import { PORTFOLIO } from '../src/content/portfolio.js'
import { HOME_HERO, HOME_HERO_ES, HOME_HERO_AR } from '../src/content/homeHero.js'
import { POSTER_FRAMES } from '../src/content/posterFrames.js'
import { ROADMAP_VIDEO_ID, ROADMAP_VIDEO_POSTER } from '../src/content/roadmapVideo.js'

const inv = {}
const add = (uid, where, poster) => { if (!uid) return; (inv[uid] ||= { uid, frame: POSTER_FRAMES[uid] ?? null, posters: new Set(), where: [] }); inv[uid].where.push(where); if (poster) inv[uid].posters.add(poster) }
for (const v of PORTFOLIO) add(v.source.cloudflareId, `portfolio:${v.id}${v.showcase ? ` (home panel ${v.showcase})` : ''}${v.onlyIn ? ` [${v.onlyIn.join(',')}]` : ''}`, v.poster)
for (const v of HOME_HERO) add(v.source.cloudflareId, `home-hero:${v.id}`, v.poster)
for (const v of HOME_HERO_ES) add(v.source.cloudflareId, `home-hero-es:${v.id}`, v.poster)
for (const v of HOME_HERO_AR) add(v.source.cloudflareId, `home-hero-ar:${v.id}`, v.poster)
for (const [id, l] of [['fa02007b36fae2b3bb68c97cdd00e9fc', 'elyon case study: Creator-Led Ad'], ['0905b814e2ba3950197b5bfe1cefae38', 'elyon case study: Street Interview'], ['9e6cb8438c9b0c1ab8b55953718eddde', 'elyon case study: Performance Concept'], ['15dd5505109f6821ccdcb13fc3cdc1fd', 'graspo case study 295K'], ['3616606e3ca6d1a85c8a57d7cc2f656f', 'graspo case study 1.2M'], ['c1379ace38f2fa19ef2a45de1bb5d4b1', 'graspo case study 7.5M'], ['a5e60be52e693016bb47bed4c801eb5f', '/scale video']]) add(id, l)
add(ROADMAP_VIDEO_ID, 'Roadmap explainer (keeps its chosen 25.6 s same-origin poster)', ROADMAP_VIDEO_POSTER)
console.log(JSON.stringify(Object.values(inv).map((x) => ({ ...x, posters: [...x.posters] }))))
