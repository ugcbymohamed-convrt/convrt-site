#!/usr/bin/env node
/* VIDEO REGISTRY TOOL: the repeatable import / validation workflow for the translated video libraries (docs/video-library.md).

     node scripts/video-registry.mjs validate [es|fr|ar]     checks every video limited to a language site (`onlyIn`) and exits 1 on any ERROR; WARN lines are things to look at
     node scripts/video-registry.mjs inventory [es|fr|ar]    prints the inventory as a markdown table (creator, language, types, poster frame, pages each video appears on)
     node scripts/video-registry.mjs inventory --write       writes docs/video-library-inventory.md (es + fr + ar, whichever exist)

   The website never classifies a video: it only renders what src/content/portfolio.js says. This tool is what makes onboarding safe: it refuses (ERROR) a video whose language, type, creator, poster
   frame, permissions or title are missing, and it reports every `review` hold. Classifying a video is done by looking at it (scripts/video-contact-sheet.py makes the contact sheet). */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PORTFOLIO, portfolioProblems, isDisplayable, servesPage, placementOn, typesOf, SERVICE_PAGES } from '../src/content/portfolio.js'
import { POSTER_FRAMES } from '../src/content/posterFrames.js'
import { galleryEnabled } from '../src/content/galleryPolicy.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES = ['es', 'fr', 'ar']
const only = process.argv.slice(3).find((a) => LOCALES.includes(a))
const locales = only ? [only] : LOCALES
const entriesFor = (l) => PORTFOLIO.filter((v) => v.onlyIn?.length === 1 && v.onlyIn[0] === l)

/** The pages a video appears on, from its data and the gallery policy (never from the page components). */
export function pagesOf(v, locale) {
  const out = []
  if (v.review || !isDisplayable(v)) { if (v.showcase && !v.review) out.push(`home stage (${v.showcase})`); return out }
  if (!v.showcase) out.push('creator-showcase')
  for (const page of SERVICE_PAGES) {
    if (!servesPage(v, page)) continue
    const slot = placementOn(v, page) === 'hero' ? 'hero' : 'gallery'
    if (galleryEnabled(locale, page, slot)) out.push(`${page}-${slot}`)
  }
  if (v.homeCreator?.[locale]) out.push(`home carousel #${v.homeCreator[locale]}`)
  if (v.showcase) out.push(`home stage (${v.showcase})`)
  return out
}

function validate(locale) {
  const errors = []; const warns = []
  const creators = new Map()
  for (const v of entriesFor(locale)) {
    const e = (m) => errors.push(`${v.id}: ${m}`); const w = (m) => warns.push(`${v.id}: ${m}`)
    for (const p of portfolioProblems(v)) e(p)
    if (!(v.languages ?? []).includes(locale)) { if (v.crossLanguageNote) w(`${v.languages}-language clip placed here on the owner's request (crossLanguageNote)`); else e(`spoken language not confirmed as ${locale}`) }
    if (!v.type && !v.showcase) e('no content type (ugc | spokesperson | organic | saas)')
    if (v.type && !SERVICE_PAGES.includes(v.type)) w(`type '${v.type}' is not one of ${SERVICE_PAGES.join(', ')}`)
    if (v.source?.cloudflareId && !(v.source.cloudflareId in POSTER_FRAMES)) e('no poster frame chosen (src/content/posterFrames.js): look at a contact sheet and pick one')
    if (v.poster && !fs.existsSync(path.join(ROOT, 'public' + v.poster))) e(`poster file missing: ${v.poster}`)
    if (!v.title && !v.i18n && !v.showcase) w('no short title: the caption is used as the card headline')
    if (v.industry === undefined) w("no industry (use 'unclassified' until confirmed)")
    if (!v.review && (v.approval?.status !== 'approved')) w(`not approved (status: ${v.approval?.status}): kept off the site`)
    if (v.review) w(`HELD for manual review: ${v.review}`)
    creators.set(v.creatorId, (creators.get(v.creatorId) ?? 0) + 1)
  }
  return { errors, warns, creators }
}

function table(locale) {
  const rows = entriesFor(locale).map((v) => `| ${v.id} | ${v.creatorId}${v.creator?.showName ? ` (${v.creator.displayName})` : ''} | ${(v.languages ?? []).join(',')} | ${v.type ?? '—'} | ${(v.secondary ?? []).join(', ') || '—'} | ${v.industry ?? '—'} | ${v.source?.cloudflareId ? `${v.source.cloudflareId.slice(0, 8)} @ ${POSTER_FRAMES[v.source.cloudflareId] ?? '?'} s` : 'mp4'} | ${pagesOf(v, locale).join(', ') || '—'} | ${v.review ? 'HELD' : v.approval?.status} |`)
  return ['| id | creator | lang | primary | secondary | industry | Stream id @ poster | appears on | status |', '|---|---|---|---|---|---|---|---|---|', ...rows].join('\n')
}

const cmd = process.argv[2]
if (cmd === 'validate') {
  let bad = 0
  for (const l of locales) {
    const list = entriesFor(l); if (!list.length) { console.log(`[${l}] no videos limited to this language`); continue }
    const { errors, warns, creators } = validate(l)
    console.log(`[${l}] ${list.length} videos, ${creators.size} creators: ${errors.length} errors, ${warns.length} warnings`)
    errors.forEach((x) => console.log('  ERROR', x)); warns.forEach((x) => console.log('  WARN ', x)); bad += errors.length
  }
  process.exit(bad ? 1 : 0)
} else if (cmd === 'inventory') {
  if (process.argv.includes('--write')) {
    const parts = ['# Video inventory: Spanish, French (and Arabic when its branch holds videos)', '', 'Generated by `node scripts/video-registry.mjs inventory --write` from `src/content/portfolio.js`. Do not edit by hand.', '']
    for (const l of LOCALES) if (entriesFor(l).length) parts.push(`## ${l}`, '', table(l), '')
    fs.writeFileSync(path.join(ROOT, 'docs/video-library-inventory.md'), parts.join('\n')); console.log('wrote docs/video-library-inventory.md')
  } else for (const l of locales) if (entriesFor(l).length) console.log(`## ${l}\n\n${table(l)}\n`)
} else {
  console.log('usage: node scripts/video-registry.mjs validate|inventory [es|fr|ar] [--write]'); process.exit(2)
}
