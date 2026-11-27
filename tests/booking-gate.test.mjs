// Run with: node --test tests/booking-gate.test.mjs
// Booking embeds: nothing from Calendly loads before the visitor asks for the calendar; Calendly's own cookie notice is not hidden;
// booking works without any choice on the site's cookie banner; and the /scale mobile overflow is fixed at its source.
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

test('CalendlyGate (server render): shows the notice and two ways to book, and renders NO calendar or Calendly iframe', async () => {
  // Inside the project so node resolves react from node_modules (same trick as vite-plugin-static-routes.js).
  const tmp = path.join(ROOT, 'node_modules', '.convrt-gate-test', String(process.pid))
  // Compile the JSX component to plain ESM so node can import it.
  await build({
    root: ROOT, configFile: false, logLevel: 'silent', plugins: [react()],
    build: { ssr: 'src/components/booking/CalendlyGate.jsx', outDir: tmp, emptyOutDir: true, minify: false, rollupOptions: { output: { entryFileNames: 'gate.mjs', format: 'es' } } },
  })
  const mod = await import(path.join(tmp, 'gate.mjs'))
  const html = renderToStaticMarkup(createElement(mod.default, { page: 'roadmap' }, createElement('iframe', { src: 'https://calendly.com/x' })))
  assert.ok(!/<iframe/i.test(html), 'the calendar child must not render before the click')
  assert.ok(!/src="https:\/\/calendly/i.test(html), 'no Calendly resource before the click')
  assert.ok(html.includes('Show the booking calendar') && html.includes('Show the calendar'))
  assert.ok(html.includes(mod.CALENDLY_NOTICE.replace(/’/g, '&#x27;').replace(/'/g, '&#x27;')) || html.includes('Booking is run by Calendly'), 'plain notice about Calendly and its cookies')
  // Booking without any cookie-banner choice: a direct Calendly link that opens in a new tab.
  assert.match(html, new RegExp(`href="${BOOKING_URL.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[^"]*"[^>]*target="_blank"[^>]*rel="noopener noreferrer"|target="_blank"[^>]*href="${BOOKING_URL.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`))
  assert.ok(html.includes('Open Calendly in a new tab'))
  assert.match(mod.CALENDLY_NOTICE, /cookies of its own/)
  assert.match(mod.CALENDLY_NOTICE, /optional ones only if you allow them in Calendly/)
  assert.ok(!/analytics|accept|consent banner/i.test(html), 'booking never depends on the site analytics choice')
})

test('the one embed (the Roadmap booking, qualified visitors only) sits inside the gate; Calendly cookie notice is no longer hidden anywhere', () => {
  for (const f of ['src/components/roadmap/RoadmapBooking.jsx']) {
    const s = read(f)
    assert.match(s, /<CalendlyGate /, `${f} uses the gate`)
    assert.ok(s.indexOf('<CalendlyGate') < s.indexOf('<iframe'), `${f}: the iframe is a child of the gate, never above it`)
    assert.ok(!/hide_gdpr_banner\s*[='"]/.test(s), `${f}: Calendly's own cookie controls are not suppressed`)
  }
  // No other Calendly iframe, widget script or suppressed notice exists anywhere in the app.
  for (const f of walk(path.join(ROOT, 'src'))) {
    const s = fs.readFileSync(f, 'utf8')
    assert.ok(!/hide_gdpr_banner\s*[='"]/.test(s), `${f}: no hidden Calendly cookie notice`)
    assert.ok(!/assets\.calendly\.com\/assets\/external\/widget/.test(s), `${f}: no Calendly widget script`)
  }
  assert.ok(!/<link[^>]+calendly|preconnect[^>]+calendly/i.test(read('index.html')), 'no early connection to Calendly')
  // Owner decision (27 Nov 2026): no unrestricted public booking. The /scale booking modal and its helper are gone; the gate is used only by the Roadmap booking.
  for (const f of ['src/components/scale/BookingModal.jsx', 'src/lib/bookingModal.js']) assert.ok(!fs.existsSync(path.join(ROOT, f)), `${f} was removed`)
  const gateUsers = walk(path.join(ROOT, 'src')).filter((f) => /\.jsx?$/.test(f) && /<CalendlyGate\b/.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(ROOT, f))
  assert.deepEqual(gateUsers, ['src/components/roadmap/RoadmapBooking.jsx'], 'CalendlyGate is rendered only inside the Roadmap booking')
})
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) }

test('a booking is reported only from Calendly itself: the handler checks the message origin, and only calendly.event_scheduled counts', () => {
  for (const f of ['src/components/roadmap/RoadmapBooking.jsx']) {
    const s = read(f)
    assert.match(s, /e\.origin !== 'https:\/\/calendly\.com'/, `${f} ignores other origins`)
    assert.equal((s.match(/'calendly\.event_scheduled'/g) || []).length, 1, `${f}: exactly one event name (as a string literal) counts as a booking`)
  }
  // Opening, loading or clicking Calendly never fires a booking event.
  assert.ok(!/(booking_completed|roadmap_booking_confirmed)/.test(read('src/components/booking/CalendlyGate.jsx')))
})

test('the booking conversion events and flows are intact', () => {
  const rb = read('src/components/roadmap/RoadmapBooking.jsx')
  for (const ev of ['roadmap_calendar_viewed', 'roadmap_booking_confirmed', "'calendly.event_scheduled'", "'https://calendly.com'"]) assert.ok(rb.includes(ev), ev)
  // /scale no longer books anything: its CTAs open the Roadmap (qualification first), keeping the existing primary_cta_click event.
  const cta = read('src/components/scale/ScaleCtaButton.jsx')
  assert.ok(cta.includes("trackEvent('primary_cta_click', { page: 'scale', location })") && cta.includes('OFFER_PATHS.roadmap') && !/calendly|BOOKING_URL/i.test(cta))
  const gate = read('src/components/booking/CalendlyGate.jsx')
  for (const ev of ['calendar_load_click', 'calendar_newtab_click']) assert.ok(gate.includes(ev), ev)
  assert.ok(gate.includes('sessionStorage'), 'the request is remembered for the session only')
  assert.ok(!/localStorage/.test(gate))
  assert.ok(rb.includes('CONTACT_EMAIL'), 'the email fallback stays')
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
