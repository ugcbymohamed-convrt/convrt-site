import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useScrollDriver, remap } from '../caseStudies/shared/useScrollDriver.js'
import { usePrefersReducedMotion } from '../caseStudies/shared/usePrefersReducedMotion.js'

/* ─────────────────────────────────────────────
   GRASPO HERO SCENE — paper, not machinery.
   A pile of premium sheets sits calm at the bottom-right
   while the visitor reads the heading. Once they're
   actually reading the section (not still scrolling it
   into view), a gust hits: sheets snap off the pile and
   fly out to scattered positions around the edge, and
   settle there — spread out, fully visible, completely
   still — rather than drifting off and fading away.

   Timing uses the "through" scroll model: progress stays
   at 0 for as long as the hero is still entering the
   viewport, then ramps 0→1 over the following scroll —
   so the pile is still intact when the heading first
   appears, and the wind is something that happens as the
   visitor keeps scrolling, not before they arrive.

   The zone stays geometrically pinned to (center + half
   the text column + gap), so no sheet can ever cross into
   the readable text at any viewport width.
───────────────────────────────────────────── */

const ACCENT = '#d5ff40'
const SHEET_ASPECT = '210 / 297'
const SAFE_BOUND = 'calc(50% + 512px + 40px)'
const THROUGH_PX = 600
// Let the gust start while the hero still has this much settling-in scroll
// left, rather than waiting for it to fully stop — otherwise, on tall
// viewports where the whole hero (down to the metrics row) is already
// readable well before the section finishes entering, the wind doesn't
// kick in until well after the visitor can already read everything.
const THROUGH_OFFSET_PX = 320

const SHEET_BG = 'linear-gradient(155deg, #faf7ef 0%, #efe8d8 55%, #e6ddc9 100%)'
const SHEET_SHADOW = '0 1px 1px rgba(15,10,5,0.35), 0 14px 30px -14px rgba(0,0,0,0.65)'

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

/* A little overshoot-then-settle — reads as "caught by a gust"
   rather than a smooth glide. */
function easeOutBack(t) {
  const c1 = 1.25
  const c3 = c1 + 1
  const x = t - 1
  return 1 + c3 * x * x * x + c1 * x * x
}

function makeJitter(seedOffset, count) {
  let seed = seedOffset + 1
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  return Array.from({ length: count }, () => ({
    rot: (rand() - 0.5) * 3.2,
    dx: (rand() - 0.5) * 4,
  }))
}

/* Drives one animated sheet's live transform from scroll progress p.
   Before `start`, it renders at its resting (on-pile) pose. Once its
   window is done it holds — visible, in its final spread-out position,
   completely still — rather than fading out or fluttering in place.

   `maxLeftTravel`, when given, caps how far the sheet may move in the
   negative/leftward (toward-center) direction — its rest position is
   only ever as close to the safe boundary as the current zone width
   allows, so a fixed pixel `tx` that was safe at 1920px could otherwise
   overshoot the boundary at 1280px. This clamp is what keeps it honest
   at every width, not just the ones it happened to be tuned against. */
function computeSheet(p, cfg, maxLeftTravel) {
  const t = remap(p, cfg.start, cfg.end)
  const te = easeOutBack(t)

  let tx = cfg.tx * te
  if (maxLeftTravel != null && tx < 0) tx = Math.max(tx, -maxLeftTravel)
  const ty = cfg.ty * te
  const rz = cfg.rzStart + (cfg.rzEnd - cfg.rzStart) * te
  const peel = Math.sin(Math.min(t, 1) * Math.PI) * (cfg.rxPeak || 0)
  const scale = 1 + (cfg.scaleEnd - 1) * te
  const blur = (cfg.blurPeak || 0) * Math.sin(Math.min(t, 1) * Math.PI)

  const rest = cfg.restOpacity ?? 1
  const peak = cfg.peakOpacity ?? 1
  const fadeInEnd = cfg.fadeInEnd ?? 0.35
  const opacity = t <= fadeInEnd ? rest + (peak - rest) * (t / fadeInEnd) : peak

  return { tx, ty, rz, rx: peel, scale, blur, opacity }
}

function applySheet(el, v) {
  if (!el) return
  el.style.transform = `translate3d(${v.tx}px, ${v.ty}px, 0) rotateZ(${v.rz}deg) rotateX(${v.rx}deg) scale(${v.scale})`
  el.style.opacity = String(v.opacity)
  el.style.filter = v.blur > 0.1 ? `blur(${v.blur}px)` : 'none'
}

export default function GraspoHeroScene({ mobile = false }) {
  const sceneRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  const rightA = useRef(null)
  const rightB = useRef(null)
  const rightC = useRef(null)
  const rightD = useRef(null)
  const rightZoneRef = useRef(null)
  const rightZoneWidthRef = useRef(0)

  const pileJitter = useMemo(() => makeJitter(3, 8), [])

  // Cache the right zone's actual available width (re-measured on resize
  // only, not per scroll tick) so leftward-flying sheets can be clamped to
  // it — the fixed CSS rest position is already safe at any width, but a
  // fixed pixel flight distance on top of it isn't, once the zone is
  // narrower than the sheet was tuned for.
  useEffect(() => {
    const measure = () => { rightZoneWidthRef.current = rightZoneRef.current?.getBoundingClientRect().width ?? 0 }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const onTick = useCallback((p) => {
    const zw = rightZoneWidthRef.current
    applySheet(rightA.current, computeSheet(p, {
      start: 0.04, end: 0.26,
      tx: -70, ty: -210, rzStart: 1, rzEnd: -26, rxPeak: 18,
      scaleEnd: 1.06,
    }, Math.max(0, zw - 94)))
    applySheet(rightB.current, computeSheet(p, {
      start: 0.09, end: 0.32,
      tx: 90, ty: -250, rzStart: -2, rzEnd: 30, rxPeak: 14,
      scaleEnd: 1.22, blurPeak: 2.6,
    }))
    applySheet(rightC.current, computeSheet(p, {
      start: 0.15, end: 0.4,
      tx: -85, ty: -140, rzStart: 2, rzEnd: -18, rxPeak: 10,
      scaleEnd: 0.8, peakOpacity: 0.62,
    }, Math.max(0, zw - 96)))
    applySheet(rightD.current, computeSheet(p, {
      start: 0.2, end: 0.46,
      tx: 55, ty: -120, rzStart: -1, rzEnd: 18, rxPeak: 10,
      scaleEnd: 1.03,
    }))
  }, [])

  useScrollDriver(sceneRef, onTick, { disabled: reducedMotion, throughPx: THROUGH_PX, throughOffsetPx: THROUGH_OFFSET_PX })

  useEffect(() => {
    if (reducedMotion) {
      // Static, intentionally-composed rest state: pile + one lifted sheet + one settled sheet.
      applySheet(rightA.current, { tx: -20, ty: -46, rz: -6, rx: 6, scale: 1, blur: 0, opacity: 1 })
      applySheet(rightB.current, { tx: 0, ty: 0, rz: -2, rx: 0, scale: 1, blur: 0, opacity: 0 })
      applySheet(rightC.current, { tx: 0, ty: 0, rz: 0, rx: 0, scale: 1, blur: 0, opacity: 0 })
      applySheet(rightD.current, { tx: 0, ty: 0, rz: 0, rx: 0, scale: 1, blur: 0, opacity: 0 })
    }
  }, [reducedMotion])

  if (mobile) return <MobileScene reducedMotion={reducedMotion} />

  const sheetW = 'clamp(84px, 8.5vw, 128px)'

  return (
    <div ref={sceneRef} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {/* ── RIGHT ZONE — the pile, and the gust ── */}
      <div ref={rightZoneRef} className="absolute inset-y-0" style={{ left: SAFE_BOUND, right: 0, perspective: '1100px' }}>
        {/* Extremely subtle lime rim-light behind the pile.
            `left: max(0px, calc(100% - Npx))` anchors from the zone's own
            LEFT edge (the safe boundary) rather than its right edge, so the
            element's left side can never land before the boundary no matter
            how narrow the zone gets — unlike `right:`, whose implied left
            edge depends on the zone's width and isn't safe when that width
            collapses toward 0 at narrower viewports. */}
        <div
          className="absolute rounded-full"
          style={{
            left: 'max(0px, calc(100% - 300px))', bottom: '10%', width: '260px', aspectRatio: '1/1',
            background: `radial-gradient(circle, ${ACCENT}26 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        {/* Static pile — 8 resting sheets */}
        {pileJitter.map((j, i) => (
          <div
            key={i}
            className="absolute rounded-[2px]"
            style={{
              left: `max(0px, calc(100% - ${118 - i * 1.6}px))`,
              bottom: `${18 + i * 2.4}px`,
              width: sheetW,
              aspectRatio: SHEET_ASPECT,
              transform: `rotate(${j.rot}deg) translateX(${j.dx}px)`,
              background: SHEET_BG,
              boxShadow: SHEET_SHADOW,
              zIndex: i,
            }}
          />
        ))}

        {/* rightC — background, smaller, fainter */}
        <PositionedSheet innerRef={rightC} left="max(0px, calc(100% - 96px))" bottom="44px" width={sheetW} zIndex={9} />
        {/* rightD — trailing, subtle */}
        <PositionedSheet innerRef={rightD} left="max(0px, calc(100% - 102px))" bottom="46px" width={sheetW} zIndex={10}>
          <ColorBar />
        </PositionedSheet>
        {/* rightB — foreground, larger, blurred */}
        <PositionedSheet innerRef={rightB} left="max(0px, calc(100% - 90px))" bottom="42px" width={sheetW} zIndex={11}>
          <LimeMark />
        </PositionedSheet>
        {/* rightA — topmost, first to peel */}
        <PositionedSheet innerRef={rightA} left="max(0px, calc(100% - 94px))" bottom="48px" width={sheetW} zIndex={12}>
          <CropMarks />
        </PositionedSheet>
      </div>
    </div>
  )
}

function PositionedSheet({ innerRef, width, zIndex, children, initialOpacity = 1, ...pos }) {
  return (
    <div className="absolute" style={{ ...pos, width, aspectRatio: SHEET_ASPECT, zIndex }}>
      <div
        ref={innerRef}
        className="relative h-full w-full overflow-hidden rounded-[2px]"
        style={{
          background: SHEET_BG,
          boxShadow: SHEET_SHADOW,
          transformOrigin: 'center bottom',
          opacity: initialOpacity,
          willChange: 'transform, opacity, filter',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Sparse, restrained print-industry details — a couple of sheets only ── */
function CropMarks() {
  const stroke = 'rgba(10,10,11,0.4)'
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="absolute left-1.5 top-1.5 h-2 w-2">
        <path d="M1 6V1H6" stroke={stroke} strokeWidth="0.8" fill="none" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="absolute right-1.5 bottom-1.5 h-2 w-2">
        <path d="M15 10v5h-5" stroke={stroke} strokeWidth="0.8" fill="none" />
      </svg>
    </>
  )
}

function ColorBar() {
  return (
    <div className="absolute bottom-[10%] left-[12%] flex gap-[2px]">
      <span style={{ background: '#00AEEF', width: '4px', height: '4px', opacity: 0.75 }} />
      <span style={{ background: '#EC008C', width: '4px', height: '4px', opacity: 0.75 }} />
      <span style={{ background: '#FFE000', width: '4px', height: '4px', opacity: 0.75 }} />
      <span style={{ background: '#111111', width: '4px', height: '4px', opacity: 0.75 }} />
    </div>
  )
}

function LimeMark() {
  return (
    <div
      className="absolute rounded-[1px]"
      style={{ right: '14%', top: '12%', width: '16%', height: '10%', background: `${ACCENT}55` }}
    />
  )
}

/* ─────────────────────────────────────────────
   MOBILE — a small, contained stack below the CTAs.
   Top sheets lift slightly and one drifts a short
   distance outward, then stays put. No cross-screen
   travel, nothing behind text.
───────────────────────────────────────────── */
function MobileScene({ reducedMotion }) {
  const sceneRef = useRef(null)
  const topRef = useRef(null)
  const driftRef = useRef(null)
  const pileJitter = useMemo(() => makeJitter(11, 5), [])

  const onTick = useCallback((p) => {
    const top = topRef.current
    if (top) {
      const t = remap(p, 0.15, 0.4)
      const te = easeOutBack(t)
      top.style.transform = `translate3d(${-8 * te}px, ${-16 * te}px, 0) rotateZ(${-4 - 6 * te}deg)`
    }
    const drift = driftRef.current
    if (drift) {
      const t = remap(p, 0.3, 0.6)
      const te = easeOutBack(t)
      drift.style.transform = `translate3d(${-34 * te}px, ${-40 * te}px, 0) rotateZ(${-2 + 16 * te}deg)`
      drift.style.opacity = String(Math.min(1, te + (t > 0 ? 0.15 : 0)))
    }
  }, [])

  useScrollDriver(sceneRef, onTick, { disabled: reducedMotion, throughPx: 500 })

  useEffect(() => {
    if (reducedMotion) {
      if (topRef.current) topRef.current.style.transform = 'translate3d(-4px,-8px,0) rotateZ(-7deg)'
      if (driftRef.current) { driftRef.current.style.transform = 'translate3d(0,0,0) rotateZ(-2deg)'; driftRef.current.style.opacity = '1' }
    }
  }, [reducedMotion])

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className="pointer-events-none relative mx-auto mt-3 md:hidden"
      style={{ height: '120px', width: '160px' }}
    >
      {pileJitter.map((j, i) => (
        <div
          key={i}
          className="absolute rounded-[2px]"
          style={{
            right: `${8 + i * 2}px`,
            bottom: `${6 + i * 2.6}px`,
            width: '58px',
            aspectRatio: SHEET_ASPECT,
            transform: `rotate(${j.rot}deg)`,
            background: SHEET_BG,
            boxShadow: SHEET_SHADOW,
            zIndex: i,
          }}
        />
      ))}
      <div className="absolute" style={{ right: '4px', bottom: '18px', width: '58px', aspectRatio: SHEET_ASPECT, zIndex: 9 }}>
        <div ref={driftRef} className="h-full w-full rounded-[2px]" style={{ background: SHEET_BG, boxShadow: SHEET_SHADOW, opacity: 0, willChange: 'transform, opacity' }} />
      </div>
      <div className="absolute" style={{ right: '10px', bottom: '20px', width: '58px', aspectRatio: SHEET_ASPECT, zIndex: 10 }}>
        <div ref={topRef} className="h-full w-full rounded-[2px]" style={{ background: SHEET_BG, boxShadow: SHEET_SHADOW, willChange: 'transform' }} />
      </div>
    </div>
  )
}
