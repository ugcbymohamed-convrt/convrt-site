/* Pure maths of the rotary video stage on the English homepage (components/home/RotaryStage.jsx), kept free of React so it is unit-tested (tests/home-redesign.test.mjs) and shared by the
   server-rendered markup and the animation loop. */

export const round4 = (v) => Number((v + 0).toFixed(4))
const f = round4

/** Where video `i` stands when video `pos` (fractional while rotating) is at the front. All lengths are in phone widths / heights, so the CSS only decides the phone's width. */
export function pose(i, pos, n = 3) {
  const theta = ((i - pos) * 2 * Math.PI) / n
  const s = Math.sin(theta)
  const c = Math.cos(theta)
  const t = (c + 1) / 2 // 1 at the front, 0 at the very back
  return {
    x: s * 1.22, // sideways, in phone widths
    y: -(1 - t) * 0.05, // farther away = slightly higher on the platform (in phone heights)
    scale: 0.68 + 0.32 * t,
    rot: -s * 22 + 0, // side videos turn a little toward the centre; the front one is exactly 0
    z: Math.round(t * 100),
    shade: (1 - t) * 0.2, // gentle dimming for depth, never heavy
  }
}
export const poseStyle = (p) => ({
  transform: `translate3d(-50%, -50%, 0) translate3d(${f(p.x * 100)}%, ${f(p.y * 100)}%, 0) scale(${f(p.scale)}) rotateY(${f(p.rot)}deg)`,
  zIndex: p.z,
})
/** Shortest signed distance (in videos) from position `from` to video `target`, for `n` videos on the ring. */
export const shortestDelta = (from, target, n) => {
  let d = (((target - from) % n) + n) % n
  if (d > n / 2) d -= n
  return d
}
export const easeInOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
export const ROTATION_MS = 720

