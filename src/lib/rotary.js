/* Pure maths of the rotary video stage on the English homepage (components/home/RotaryStage.jsx), kept free of React so it is unit-tested (tests/home-redesign.test.mjs) and shared by the
   server-rendered markup and the animation loop. */

export const round4 = (v) => Number((v + 0).toFixed(4))
const f = round4

/** Where video `i` stands when video `pos` (fractional while rotating) is at the front. All lengths are in phone widths / heights, so the CSS only decides the phone's width. */
export function pose(i, pos, n = 3, spread = 0.958) {
  const theta = ((i - pos) * 2 * Math.PI) / n
  const s = Math.sin(theta)
  const c = Math.cos(theta)
  const t = (c + 1) / 2 // 1 at the front, 0 at the very back
  return {
    x: s * spread, // sideways, in phone widths: a side video's centre sits 0.83 widths from the centre, so it tucks slightly (about 6 % of a width) behind the featured card
    y: 0, // all three cards share one top line and one baseline
    scale: 0.74 + 0.26 * t, // a side video is about 80 % of the featured one (258 px beside a 320 px featured video), the proportion the hero stage uses
    scaleY: 0.74 + 0.26 * t, // the same: frames are never squashed, they stay true 9:16
    rot: -s * 17 + 0, // side videos turn a little toward the centre; the front one is exactly 0
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


/* ── TWO LANDSCAPE VIDEOS (the French client stage) ─────────────────────────────────────────────────────────────────────────────────────────────────────────
   Two 16:9 frames share the same platform: one dominant in front, one slightly behind it, higher, smaller and turned a little toward the centre, resting on the right so it stays clearly visible and
   clickable. Selecting the rear frame brings it forward while the front one travels back to the rear spot; on the way the two swing past each other on opposite sides (a small sideways bulge, the card
   moving forward on the left, the one moving back on the right), and the layer order flips at the half-way point, so the exchange reads as one rotating showcase, never a replacement and never a bounce.
   `b` = how far a frame is from the front (0 = front, 1 = rear), measured the short way round the ring of two, so it is continuous whichever direction the position moves.
   Lengths: x in front-frame WIDTHS, y in front-frame HEIGHTS (translate percentages), exactly as the three-portrait `pose`. */
export const ringDistance = (i, pos, n) => {
  const m = (((pos % n) + n) % n)
  const d = Math.abs(i - m)
  return Math.min(d, n - d)
}
export function pose2(i, pos) {
  const b = Math.min(1, ringDistance(i, pos, 2))
  const arc = Math.sin(Math.PI * b) // 0 at both rests, 1 half-way
  const side = i === 0 ? -1 : 1 // frame 0 swings out to the left when it moves, frame 1 to the right: a fixed identity, so the same exchange looks the same both ways
  return {
    x: 0.54 * b + side * 0.2 * arc,
    y: -0.15 * b - 0.03 * arc,
    scale: 1 - 0.22 * b,
    scaleY: 1 - 0.22 * b,
    rot: -15 * b,
    z: Math.round((1 - b) * 100),
    shade: b * 0.36,
  }
}
/** THREE LANDSCAPE VIDEOS (the French client stage): the same orbit as the portrait stage, but a 16:9 frame is wider than a 9:16 one, so the side frames sit closer (0.78 of a frame width instead of
 *  0.958) and tuck about 12 % of a width behind the front frame; the whole group then fits the stage without clipping. */
export const LANDSCAPE_SPREAD = 0.78
/** The pose of video `i` for a stage of `n` videos: the two-frame layout when there are two, the three-frame orbit otherwise (tighter when the frames are landscape). */
export const poseFor = (i, pos, n = 3, landscape = false) => (n === 2 ? pose2(i, pos) : pose(i, pos, n, landscape ? LANDSCAPE_SPREAD : 0.958))
