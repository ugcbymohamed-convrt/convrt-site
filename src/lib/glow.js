/* ─────────────────────────────────────────────
   Soft background glows without `filter: blur()`.

   The site's ambient glows used to be a coloured ellipse with `blur-[160px]` (or
   similar). Safari does not reliably paint very large blurred layers, so those glows
   vanished there (plain black background) while Chrome showed them. A radial gradient
   looks the same, paints in every browser and is cheaper to render.

   `softGlow()` returns a `radial-gradient(...)` that reproduces what a Gaussian blur of
   radius `blur` does to a filled ellipse of `w` × `h`: full strength in the middle,
   half strength at the old edge, fading to nothing about 2σ beyond it.

   The gradient needs the room the blur halo used to spill into, so callers make the
   element `w + 4·blur` × `h + 4·blur` and move any edge offset (top / right / …) out by
   `2·blur`; centre-anchored elements need no offset change.

   @param {string} color  '#rrggbb', '#rgb', 'rgb(a)(…)' or 'r,g,b'
   @param {number} alpha  strength of the old fill (e.g. 0.1 for bg-lime/10)
   @param {number} w      old element width in px  (use a rough estimate for % sizes)
   @param {number} h      old element height in px
   @param {number} blur   the old blur radius in px
───────────────────────────────────────────── */

function parseColor(input) {
  const c = String(input).trim()
  let m
  if ((m = c.match(/^#([0-9a-f]{3})$/i))) {
    const [r, g, b] = m[1].split('').map((x) => parseInt(x + x, 16))
    return [r, g, b, 1]
  }
  if ((m = c.match(/^#([0-9a-f]{6})$/i))) {
    const n = parseInt(m[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1]
  }
  if ((m = c.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i))) {
    return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]]
  }
  if ((m = c.match(/^([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)$/))) return [+m[1], +m[2], +m[3], 1]
  throw new Error(`softGlow: unsupported colour "${input}"`)
}

/* Value (0..1) of a Gaussian-blurred, uniformly filled ellipse (half-axes a × b, blur σ)
   at the point (px, py) measured from its centre: the Gaussian kernel integrated over the
   ellipse on a coarse grid. Exact enough for a background glow and cheap to evaluate. */
const GRID = 36
function blurredEllipse(px, py, a, b, sigma) {
  const dx = (2 * a) / GRID
  const dy = (2 * b) / GRID
  const inv = 1 / (2 * sigma * sigma)
  const norm = (dx * dy) / (2 * Math.PI * sigma * sigma)
  let sum = 0
  for (let i = 0; i < GRID; i++) {
    const x = -a + (i + 0.5) * dx
    for (let j = 0; j < GRID; j++) {
      const y = -b + (j + 0.5) * dy
      if ((x * x) / (a * a) + (y * y) / (b * b) > 1) continue
      const ex = x - px
      const ey = y - py
      sum += Math.exp(-(ex * ex + ey * ey) * inv)
    }
  }
  return Math.min(1, sum * norm)
}

const STOPS = [0, 0.15, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
const cache = new Map()

export function softGlow(color, alpha, w, h, blur) {
  const key = `${color}|${alpha}|${w}|${h}|${blur}`
  if (cache.has(key)) return cache.get(key)
  const [r, g, b, a0] = parseColor(color)
  const peak = alpha * a0
  const a = w / 2
  const bHalf = h / 2
  const Ax = a + 2 * blur // enlarged half-sizes: the box adds 2σ per side
  const Ay = bHalf + 2 * blur

  const stops = STOPS.map((t) => {
    // `closest-side` maps the same fraction t onto both axes: average the two axis profiles.
    const vx = blurredEllipse(t * Ax, 0, a, bHalf, blur)
    const vy = blurredEllipse(0, t * Ay, a, bHalf, blur)
    const alphaStop = t >= 1 ? 0 : peak * ((vx + vy) / 2)
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alphaStop.toFixed(4)}) ${Math.round(t * 100)}%`
  })
  const out = `radial-gradient(closest-side,${stops.join(',')})`
  cache.set(key, out)
  return out
}
