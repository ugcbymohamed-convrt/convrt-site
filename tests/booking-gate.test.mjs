// Run with: node --test tests/booking-gate.test.mjs
// Booking is LINK-OUT ONLY since 27 Nov 2026 (after the privacy audit): the Roadmap's qualification-first booking step opens Calendly in a new tab and
// nothing from Calendly is ever loaded on our pages (no iframe, script or early connection). Also: the /scale mobile overflow is fixed at its source.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { BOOKING_URL, CONTACT_EMAIL } from '../src/config.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')

test('RoadmapBooking (server render): a new-tab link to Calendly with the campaign details, the email alternative, and NO iframe or Calendly resource', async () => {
  // Inside the project so node resolves react from node_modules (same trick as vite-plugin-static-routes.js).
  const tmp = path.join(ROOT, 'node_modules', '.convrt-gate-test', String(process.pid))
  await build({
    root: ROOT, configFile: false, logLevel: 'silent', plugins: [react()],
    build: { ssr: 'src/components/roadmap/RoadmapBooking.jsx', outDir: tmp, emptyOutDir: true, minify: false, rollupOptions: { output: { entryFileNames: 'booking.mjs', format: 'es' } } },
  })
  const mod = await import(path.join(tmp, 'booking.mjs'))
  const html = renderToStaticMarkup(createElement(mod.default, { bookingUrl: BOOKING_URL }))
  assert.ok(!/<iframe|<script|<embed|<object/i.test(html), 'nothing embedded')
  assert.ok(!/(src|data|poster)="https?:\/\/[^"]*calendly/i.test(html), 'no Calendly resource is loaded by the page')
  // The one Calendly reference is the visible link: it opens in a new tab with rel noopener noreferrer.
  const esc = BOOKING_URL.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  assert.match(html, new RegExp(`<a href="${esc}[^"]*" target="_blank" rel="noopener noreferrer"`))
  assert.ok(html.includes('Open Calendly in a new tab'))
  assert.ok(html.includes('It is run by Calendly, a separate company, under its own privacy and cookie notices'))
  assert.ok(html.includes(`mailto:${CONTACT_EMAIL}`), 'the email alternative stays')
  assert.ok(!/analytics|accept|consent banner/i.test(html), 'booking never depends on the site analytics choice')
})

test('no Calendly iframe, widget script, message listener, early connection or session key exists anywhere in the app', () => {
  for (const f of walk(path.join(ROOT, 'src'))) {
    if (/\/i18n\/|content\/(legal|trustPages)/.test(f) || !/\.jsx?$/.test(f)) continue // dictionaries and the legal documents only NAME Calendly in text
    const s = fs.readFileSync(f, 'utf8')
    assert.ok(!/<iframe[^>]*calendly|embed_type|embed_domain/i.test(s), `${f}: no Calendly embed`)
    assert.ok(!/assets\.calendly\.com/.test(s), `${f}: no Calendly widget script`)
    assert.ok(!/calendly\.event_scheduled|e\.origin !== 'https:\/\/calendly\.com'/.test(s), `${f}: no Calendly postMessage listener`)
    assert.ok(!/convrt_calendly_requested|CalendlyGate/.test(s), `${f}: the click-to-load gate and its session key are gone`)
  }
  assert.ok(!fs.existsSync(path.join(ROOT, 'src/components/booking/CalendlyGate.jsx')), 'CalendlyGate was removed (link-out only)')
  assert.ok(!/<link[^>]+calendly|preconnect[^>]+calendly|dns-prefetch[^>]+calendly/i.test(read('index.html')), 'no early connection to Calendly')
  // Owner decision (27 Nov 2026): no unrestricted public booking. The /scale booking modal and its helper are gone too.
  for (const f of ['src/components/scale/BookingModal.jsx', 'src/lib/bookingModal.js']) assert.ok(!fs.existsSync(path.join(ROOT, f)), `${f} was removed`)
})
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) }

test('events: the link-out click is tracked; every embed-dependent event is retired', () => {
  const rb = read('src/components/roadmap/RoadmapBooking.jsx')
  assert.ok(rb.includes("trackEvent('calendar_newtab_click', { page: 'roadmap' })"))
  for (const ev of ['roadmap_calendar_viewed', 'roadmap_booking_confirmed', 'booking_completed', 'calendar_load_click']) {
    for (const f of walk(path.join(ROOT, 'src'))) if (/\.jsx?$/.test(f)) assert.ok(!new RegExp(`trackEvent\\(\\s*['"]${ev}['"]`).test(fs.readFileSync(f, 'utf8')), `${ev} is retired (${path.relative(ROOT, f)})`)
  }
  // /scale no longer books anything: its CTAs open the Roadmap (qualification first), keeping the existing primary_cta_click event.
  const cta = read('src/components/scale/ScaleCtaButton.jsx')
  assert.ok(cta.includes("trackEvent('primary_cta_click', { page: 'scale', location })") && cta.includes('OFFER_PATHS.roadmap') && !/calendly|BOOKING_URL/i.test(cta))
  assert.ok(rb.includes('CONTACT_EMAIL'), 'the email fallback stays')
})

test('the booking step is still shown only to qualified visitors (RoadmapApplication renders it only for a fit)', () => {
  const app = read('src/components/roadmap/RoadmapApplication.jsx')
  assert.match(app, /<RoadmapBooking /)
  const before = app.slice(Math.max(0, app.indexOf('<RoadmapBooking ') - 900), app.indexOf('<RoadmapBooking '))
  assert.match(before, /qualified|qualif|fit/i, 'rendered inside the qualified branch')
})

test('/scale mobile overflow: fixed at the overflowing element (the hero glow), no blanket overflow rule on the page', () => {
  const hero = read('src/components/scale/ScaleHero.jsx')
  assert.match(hero, /className="relative overflow-x-clip"/, 'the hero section clips only horizontally, so its sticky layout and vertical glow are untouched')
  assert.match(hero, /h-\[520px\] w-\[1100px\] -translate-x-1\/2 rounded-full bg-lime\/\[0\.09\] blur-\[160px\]/, 'the glow keeps its size, position and colour')
  const page = read('src/ScalePage.jsx')
  assert.ok(!/overflow-x-hidden|overflow-hidden/.test(page.split('return')[1] ?? ''), 'no blanket overflow rule on the page root')
  const css = read('src/index.css')
  assert.ok(!/(html|body)\s*\{[^}]*overflow-x:\s*(hidden|clip)/.test(css), 'no global overflow-x rule')
})
