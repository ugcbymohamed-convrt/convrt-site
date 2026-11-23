/* Pure maths of the rotary video stage on the English homepage (components/home/RotaryStage.jsx), kept free of React so it is unit-tested (tests/home-redesign.test.mjs) and shared by the
   server-rendered markup and the animation loop. */

export const round4 = (v) => Number((v + 0).toFixed(4))
const f = round4

/** Where video `i` stands when video `pos` (fractional while rotating) is at the front. `mirror` (right-to-left pages): the ring runs the other way, so the NEXT video stands on the left, in the reading direction; the videos themselves are never flipped. All lengths are in phone widths / heights, so the CSS only decides the phone's width. */
export function pose(i, pos, n = 3, mirror = false) {
  const theta = ((i - pos) * 2 * Math.PI) / n
  const s = Math.sin(theta)
  const c = Math.cos(theta)
  const t = (c + 1) / 2 // 1 at the front, 0 at the very back
  return {
    x: (mirror ? -s : s) * 0.958, // sideways, in phone widths: a side video's centre sits 0.83 widths from the centre, so it tucks slightly (about 6 % of a width) behind the featured card
    y: 0, // all three cards share one top line and one baseline
    scale: 0.74 + 0.26 * t, // a side video is about 80 % of the featured one (258 px beside a 320 px featured video), the proportion the hero stage uses
    scaleY: 0.74 + 0.26 * t, // the same: frames are never squashed, they stay true 9:16
    rot: (mirror ? s : -s) * 17 + 0, // side videos turn a little toward the centre; the front one is exactly 0
    z: Math.round(t * 100),
    shade: (1 - t) * 0.32, // gentle dimming for depth, never heavy
  }
}
export const poseStyle = (p) => ({
  transform: `translate3d(-50%, -50%, 0) translate3d(${f(p.x * 100)}%, ${f(p.y * 100)}%, 0) scale(${f(p.scale)}, ${f(p.scaleY)}) rotateY(${f(p.rot)}deg)`,
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

