// Run with: npm run build && node --test tests/technical-seo.test.mjs
// The static half of scripts/seo-health-check.mjs on the built site: canonicals, reciprocal hreflang, sitemap <-> pages, noindex pages out of the sitemaps, robots.txt, JSON-LD validity,
// broken internal links and missing local assets, crawlable text without JavaScript, duplicate pages. Any ERROR fails; the live half is run by hand against a deployment (--live <origin>).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

test('technical SEO health check (static): no ERROR on the built site', { skip: !fs.existsSync(path.join(ROOT, 'dist')) && 'dist/ not built' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-health-'))
  const r = spawnSync('node', ['scripts/seo-health-check.mjs'], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, SEO_REPORT_DIR: dir } })
  const errors = JSON.parse(fs.readFileSync(path.join(dir, 'seo-health-report.json'), 'utf8')).filter((i) => i.level === 'ERROR')
  assert.deepEqual(errors.map((e) => `${e.area} ${e.url}: ${e.msg}`), [], r.stdout.slice(-1500))
})

test('the /scale showcase plays Stream MP4s, never the git-ignored /videos folder', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/scale/ScaleCreativeShowcase.jsx'), 'utf8')
  assert.ok(!/['"]\/videos\//.test(src.replace(/\/\*[\s\S]*?\*\//g, '')))
  assert.equal((src.match(/streamMp4\('[0-9a-f]{32}'\)/g) || []).length, 4)
})
