import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useScrollDriver, remap } from '../caseStudies/shared/useScrollDriver.js'
import { usePrefersReducedMotion } from '../caseStudies/shared/usePrefersReducedMotion.js'

/* ─────────────────────────────────────────────
   ELYON HERO SCENE
   A real product cutout (Elyon Infinity) rises and
   sharpens into view at the viewport edge as the visitor
   scrolls into the hero, with a warm gold glow and a
   restrained canvas sand-particle layer around it.
   Purely decorative — aria-hidden, pointer-events-none,
   lives outside the readable text column.
───────────────────────────────────────────── */

const BOTTLE_SRC = '/case-studies/elyon/hero/elyon-bottle.webp'
const SAND_RGB = '224,196,141'

export default function ElyonHeroScene({ mobile = false }) {
  const sceneRef = useRef(null)
  const bottleRef = useRef(null)
  const glowRef = useRef(null)
  const backCanvasRef = useRef(null)
  const frontCanvasRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  const backParticles = useMemo(() => makeParticles(mobile ? 7 : 22, 1), [mobile])
  const frontParticles = useMemo(() => makeParticles(mobile ? 0 : 9, 97), [mobile])

  const drawLayer = useCallback((canvas, particles, p, opacityScale) => {
    if (!canvas || particles.length === 0) return
    const parent = canvas.parentElement
    if (!parent) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = parent.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    const layerOpacity = remap(p, 0, 0.45) * opacityScale
    if (layerOpacity <= 0.01) return
    for (const pt of particles) {
      const y = (pt.y0 + p * pt.speed) % 1
      const x = pt.x0 + Math.sin(p * pt.driftFreq * 6 + pt.phase) * pt.driftAmp
      const edgeFade = y > 0.88 ? Math.max(0, 1 - (y - 0.88) / 0.12) : y < 0.04 ? y / 0.04 : 1
      const alpha = pt.baseAlpha * layerOpacity * edgeFade
      if (alpha <= 0.01) continue
      ctx.beginPath()
      ctx.fillStyle = `rgba(${SAND_RGB},${alpha})`
      ctx.arc(x * w, y * h, pt.r * dpr, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  const onTick = useCallback((p) => {
    const bottle = bottleRef.current
    if (bottle) {
      const fade = remap(p, 0.04, 0.34)
      const rise = remap(p, 0.22, 0.78)
      const parallax = (1 - p) * (mobile ? 8 : 22) * 0.6
      const translateY = (1 - rise) * 44 + parallax
      const blur = (1 - remap(p, 0.18, 0.6)) * 7
      const scale = 0.93 + rise * 0.07
      bottle.style.opacity = String(fade)
      bottle.style.transform = `translateY(${translateY}px) scale(${scale})`
      bottle.style.filter = blur > 0.15 ? `blur(${blur}px)` : 'none'
    }
    const glow = glowRef.current
    if (glow) {
      glow.style.opacity = String(remap(p, 0, 0.5) * 0.55)
      glow.style.transform = `${mobile ? 'translate(-50%, -50%)' : 'translateY(-50%)'} translateY(${(1 - p) * 10 * 0.2}px)`
    }
    drawLayer(backCanvasRef.current, backParticles, p, 1)
    drawLayer(frontCanvasRef.current, frontParticles, p, 0.8)
  }, [drawLayer, backParticles, frontParticles, mobile])

  useScrollDriver(sceneRef, onTick, { disabled: reducedMotion })

  // Reduced motion: paint the finished composition once, statically.
  useEffect(() => {
    if (reducedMotion) onTick(1)
  }, [reducedMotion, onTick])

  return (
    <div
      ref={sceneRef}
      aria-hidden="true"
      className={
        mobile
          ? 'pointer-events-none relative mx-auto mt-2 flex justify-center overflow-hidden md:hidden'
          : 'pointer-events-none absolute inset-y-0 right-0 hidden lg:block'
      }
      style={
        mobile
          ? { height: '190px', width: '100%' }
          // Left edge is pinned to (center + half the text column + a gap), so at
          // any viewport width the scene can only ever start past the text — never
          // overlap it. Below that math working out to real space, width collapses
          // toward 0 and the section's own overflow-hidden keeps it invisible.
          : { left: 'calc(50% + 512px + 40px)' }
      }
    >
      <div
        ref={glowRef}
        className="absolute rounded-full"
        style={{
          left: mobile ? '50%' : '20px',
          top: '50%',
          width: mobile ? '220px' : '260px',
          aspectRatio: '1 / 1',
          transform: mobile ? 'translate(-50%, -50%)' : 'translateY(-50%)',
          background: 'radial-gradient(circle, rgba(201,166,104,0.9) 0%, rgba(201,166,104,0) 68%)',
          filter: 'blur(34px)',
          opacity: 0,
        }}
      />

      <canvas ref={backCanvasRef} className="absolute inset-0" style={{ zIndex: 1 }} />

      <div
        className="absolute"
        style={
          mobile
            ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '150px', zIndex: 2 }
            // Left edge flush with the safe boundary — never crosses toward the text.
            // The image bleeds rightward, toward (and past) the viewport edge instead.
            : { left: 0, top: '50%', transform: 'translateY(-50%)', width: 'clamp(240px, 20vw, 320px)', zIndex: 2 }
        }
      >
        <img
          ref={bottleRef}
          src={BOTTLE_SRC}
          alt=""
          className="w-full h-auto select-none"
          style={{ opacity: 0, willChange: 'transform, opacity, filter' }}
          draggable="false"
          loading="eager"
          fetchpriority="high"
        />
      </div>

      <canvas ref={frontCanvasRef} className="absolute inset-0" style={{ zIndex: 3 }} />
    </div>
  )
}

/* Deterministic pseudo-random particle layout (stable across renders,
   no Math.random re-seeding on every mount). */
function makeParticles(count, seedOffset) {
  let seed = seedOffset + 1
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  return Array.from({ length: count }, () => ({
    x0: rand(),
    y0: rand(),
    r: 1 + rand() * 1.7,
    speed: 0.55 + rand() * 0.75,
    driftAmp: 0.018 + rand() * 0.026,
    driftFreq: 0.5 + rand() * 1.1,
    phase: rand() * Math.PI * 2,
    baseAlpha: 0.32 + rand() * 0.34,
  }))
}
