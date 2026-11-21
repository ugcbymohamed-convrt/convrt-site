#!/usr/bin/env node
/* ─────────────────────────────────────────────
   Trust pages: publication check and (after the owner's approval) activation.

   DRY RUN (default, changes nothing):
     node scripts/activate-trust-pages.mjs
   Lists everything that still blocks publication: unresolved "[OWNER TO CONFIRM" / "[LEGAL REVIEW" markers, the legally required operator details
   (tax ID and postal address) still hidden, and vercel.json rules that would keep the pages noindex.

   ACTIVATE (only after the owner AND a legal adviser have approved the text; refuses while any blocker remains):
     node scripts/activate-trust-pages.mjs --apply --owner-approved-details
   Does exactly two things: sets LEGAL_NOTICE_DETAILS_APPROVED and TRUST_PAGES_PUBLISHED to true in src/config.js, and removes the four
   X-Robots-Tag rules for /about /contact /privacy /terms from vercel.json. It never commits, pushes or deploys.
   `--owner-approved-details` is the owner's explicit statement that the tax ID and postal address in src/content/operator.js may be public.
───────────────────────────────────────────── */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const TRUST = ['/about', '/contact', '/privacy', '/terms']

export async function checkActivation(root) {
  const blockers = []
  const config = fs.readFileSync(path.join(root, 'src/config.js'), 'utf8')
  if (/^export const TRUST_PAGES_PUBLISHED = true/m.test(config)) blockers.push('TRUST_PAGES_PUBLISHED is already true')
  if (/^export const LEGAL_NOTICE_DETAILS_APPROVED = false/m.test(config)) {
    blockers.push('LEGAL_NOTICE_DETAILS_APPROVED is false: the tax ID (NIF) and postal address that Spanish law requires are still hidden')
  }
  // The real rendered text (imported, not grepped) so the markers counted are exactly the ones a visitor would see.
  const { TRUST_CONTENT, ownerMarkersIn } = await import(`${pathToFileURL(path.join(root, 'src/content/trustPages.js')).href}?t=${Date.now()}`)
  const seen = new Set()
  for (const [page, content] of Object.entries(TRUST_CONTENT)) {
    for (const m of ownerMarkersIn(content)) {
      const key = `${page}: ${m}`
      if (!seen.has(key)) {
        seen.add(key)
        blockers.push(m.length > 170 ? `${page}: ${m.slice(0, 167)}...]` : `${page}: ${m}`)
      }
    }
  }
  const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
  const rules = (vercel.headers || []).filter((h) => TRUST.includes(h.source)).length
  const notes = []
  if (rules) notes.push(`${rules} X-Robots-Tag rule(s) in vercel.json will be removed on activation`)
  return { ready: blockers.length === 0, blockers, notes }
}

export async function activate(root) {
  const report = await checkActivation(root)
  if (!report.ready) throw new Error(`Not ready to publish: ${report.blockers.length} blocker(s)`)
  const cfgPath = path.join(root, 'src/config.js')
  fs.writeFileSync(cfgPath, fs.readFileSync(cfgPath, 'utf8')
    .replace('TRUST_PAGES_PUBLISHED = false', 'TRUST_PAGES_PUBLISHED = true')
    .replace('LEGAL_NOTICE_DETAILS_APPROVED = false', 'LEGAL_NOTICE_DETAILS_APPROVED = true'))
  const vPath = path.join(root, 'vercel.json')
  const vercel = JSON.parse(fs.readFileSync(vPath, 'utf8'))
  vercel.headers = (vercel.headers || []).filter((h) => !TRUST.includes(h.source))
  fs.writeFileSync(vPath, `${JSON.stringify(vercel, null, 2)}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const apply = process.argv.includes('--apply')
  if (apply) {
    // The owner's explicit approval of the details is a precondition: flip that flag first, in the same change.
    if (!process.argv.includes('--owner-approved-details')) {
      console.error('Refusing: pass --owner-approved-details to state that the tax ID and postal address may be published.')
      process.exit(2)
    }
    const cfgPath = path.join(root, 'src/config.js')
    fs.writeFileSync(cfgPath, fs.readFileSync(cfgPath, 'utf8').replace('LEGAL_NOTICE_DETAILS_APPROVED = false', 'LEGAL_NOTICE_DETAILS_APPROVED = true'))
  }
  // `checkActivation` reads the source text, so markers that are only shown while the details are hidden are counted correctly after the flip above.
  const r = await checkActivation(root)
  const blockers = r.blockers.filter((b) => !(apply && /LEGAL_NOTICE_DETAILS_APPROVED/.test(b)))
  console.log(blockers.length ? `NOT READY: ${blockers.length} blocker(s)` : 'READY')
  for (const b of blockers) console.log(` - ${b}`)
  for (const n of r.notes) console.log(` * ${n}`)
  if (apply) {
    if (blockers.length) {
      console.error('Nothing was published (LEGAL_NOTICE_DETAILS_APPROVED was set; revert it if you are not proceeding).')
      process.exit(1)
    }
    await activate(root)
    console.log('Activated: review `git diff`, run the tests and the build, then commit.')
  }
}
