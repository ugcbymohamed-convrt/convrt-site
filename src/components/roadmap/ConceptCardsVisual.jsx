import { useEffect, useLayoutEffect, useRef } from 'react'

/* ─────────────────────────────────────────────
   HERO VISUAL — a stage of floating "paper" concept cards.

   Motion, kept deliberately light:
   • Idle float: each card bobs a few px on its own slow loop (CSS keyframes,
     transform only, compositor-friendly).
   • Scroll drift: one passive scroll listener, throttled with
     requestAnimationFrame, writes a single CSS variable (--s, -1…1) on the
     stage. Every card derives its own parallax offset + rotation from that
     variable, so there's no per-card JS and no layout work.
   • The listener and the idle loops only run while the stage is on screen
     (IntersectionObserver).
   • Entrance: the cards fade/rise in the first time the stage scrolls into view
     (not at page load, so it also plays on mobile where the stage is below the
     fold). Without JS, or with prefers-reduced-motion, they're simply visible.
   • prefers-reduced-motion: no float, no drift, no entrance — just a still,
     composed arrangement.

   The cards are illustrative concept labels (not real ads or client work);
   the whole stage is decorative and exposed to assistive tech as one image.
───────────────────────────────────────────── */

/* pos: % of stage · depth: how far the card travels at full scroll (px / deg)
   float: idle bob amplitude (px), wobble (deg), period (s), start delay (s) */
const CARDS = [
  { id: 'c1', kind: 'concept', label: 'Concept 01', title: 'Before / After', tag: 'Creator-led',
    pos: { left: 1, top: 1, w: 41 }, rot: -7, z: 3, depth: { dx: -14, dy: -44, dr: -3 }, float: { a: 7, r: 1.2, d: 7.5, delay: 0 } },
  { id: 'hook', kind: 'hook', label: 'Hook Idea', title: '“What if you stopped guessing?”',
    pos: { left: 56, top: 0, w: 42 }, rot: 5, z: 2, depth: { dx: 18, dy: 30, dr: 4 }, float: { a: 6, r: 1, d: 8.5, delay: -2 } },
  { id: 'c2', kind: 'featured', label: 'Concept 02', title: 'Creator Story', tag: 'UGC',
    pos: { left: 17, top: 28, w: 51 }, rot: -2, z: 6, depth: { dx: 0, dy: -18, dr: 2 }, float: { a: 9, r: 0.8, d: 9, delay: -1 } },
  { id: 'angle', kind: 'angle', label: 'Angle', title: 'Problem → Solution',
    pos: { left: 68, top: 44, w: 31 }, rot: 7, z: 4, depth: { dx: 22, dy: 58, dr: 5 }, float: { a: 7, r: 1.4, d: 7, delay: -3.5 } },
  { id: 'c3', kind: 'concept', label: 'Concept 03', title: 'Product Demo', tag: 'Demo',
    pos: { left: 0, top: 61, w: 39 }, rot: 6, z: 4, depth: { dx: -18, dy: 34, dr: 4 }, float: { a: 8, r: 1.2, d: 8, delay: -4.5 } },
  { id: 'c4', kind: 'concept', label: 'Concept 04', title: 'Founder Q&A', tag: 'Spokesperson', dim: true,
    pos: { left: 37, top: 69, w: 33 }, rot: -6, z: 2, depth: { dx: 6, dy: -26, dr: -3 }, float: { a: 6, r: 1, d: 9.5, delay: -5.5 } },
  { id: 'c5', kind: 'concept', label: 'Concept 05', title: 'Street Interview', tag: 'UGC', dim: true,
    pos: { left: 71, top: 68, w: 28 }, rot: 4, z: 1, depth: { dx: 12, dy: 22, dr: 3 }, float: { a: 5, r: 0.8, d: 8.2, delay: -1.5 } },
]

export default function ConceptCardsVisual() {
  const stageRef = useRef(null)

  // Hide the cards before first paint (animated users only) so the entrance can play on first view.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    stage.dataset.entered = 'false'
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // static arrangement only

    let raf = 0
    let listening = false

    const update = () => {
      raf = 0
      const r = stage.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = (vh - r.top) / (vh + r.height) // 0 = entering from below, 1 = leaving above
      const s = Math.max(-1, Math.min(1, (progress - 0.5) * 2))
      stage.style.setProperty('--s', s.toFixed(3))
    }
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    const listen = (on) => {
      if (on === listening) return
      listening = on
      const fn = on ? 'addEventListener' : 'removeEventListener'
      window[fn]('scroll', onScroll, { passive: true })
      window[fn]('resize', onScroll)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        stage.dataset.active = entry.isIntersecting ? 'true' : 'false'
        if (entry.isIntersecting && stage.dataset.entered === 'false') stage.dataset.entered = 'true'
        listen(entry.isIntersecting)
        if (entry.isIntersecting) update()
      },
      { rootMargin: '120px 0px' },
    )
    io.observe(stage)

    return () => {
      io.disconnect()
      listen(false)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <figure className="mx-auto w-full max-w-[460px] lg:max-w-none" role="img" aria-label="Illustration of floating ad concept, hook and angle cards">
      <style>{CSS}</style>

      <div ref={stageRef} className="rm-stage w-full" data-active="true">
       <div className="rm-scene relative w-full">
        {/* Soft lime glow behind the cards */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.09] blur-[70px]"
        />

        {CARDS.map((c, i) => (
          <div
            key={c.id}
            aria-hidden="true"
            className={`rm-pos ${c.dim ? 'rm-dim' : ''}`}
            style={{
              left: `${c.pos.left}%`,
              top: `${c.pos.top}%`,
              width: `${c.pos.w}%`,
              zIndex: c.z,
              '--dx': `${c.depth.dx}px`,
              '--dy': `${c.depth.dy}px`,
              '--dr': `${c.depth.dr}deg`,
              '--r': `${c.rot}deg`,
              animationDelay: `${0.08 * i}s`,
            }}
          >
            <div
              className={`rm-card rm-${c.kind}`}
              style={{ '--fa': `${c.float.a}px`, '--fr': `${c.float.r}deg`, '--fd': `${c.float.d}s`, '--fdelay': `${c.float.delay}s` }}
            >
              <Card card={c} />
            </div>
          </div>
        ))}
       </div>
      </div>

      <figcaption className="mt-4 text-center text-xs text-ink-subtle">Illustrative concept ideas, not real ads.</figcaption>
    </figure>
  )
}

function Card({ card }) {
  if (card.kind === 'hook') {
    return (
      <>
        <p className="rm-label"><i /> {card.label}</p>
        <p className="rm-quote">{card.title}</p>
      </>
    )
  }
  if (card.kind === 'angle') {
    return (
      <>
        <p className="rm-label"><i /> {card.label}</p>
        <p className="rm-title">{card.title}</p>
      </>
    )
  }
  return (
    <>
      <p className="rm-label"><i /> {card.label}</p>
      <p className="rm-title">{card.title}</p>
      <span className="rm-line" style={{ width: '88%' }} />
      <span className="rm-line" style={{ width: '62%' }} />
      {card.kind === 'featured' && <span className="rm-line" style={{ width: '74%' }} />}
      {card.tag && <span className="rm-tag">{card.tag}</span>}
    </>
  )
}

/* Component-scoped CSS. Sizes are in em off the stage's own width (container
   query units) so the whole arrangement scales cleanly from 320px to desktop. */
const CSS = `
.rm-stage {
  --s: 0;
  container-type: inline-size;     /* the scene below sizes itself from this box */
}
.rm-scene {
  aspect-ratio: 1 / 1;
  font-size: 11px;                 /* fallback where cqw is unsupported */
  font-size: max(11px, 3.5cqw);    /* cqw resolves against .rm-stage (an ancestor) */
}
.rm-pos {
  position: absolute;
  /* scroll drift: translate + rotate derive from --s on the stage */
  transform: translate3d(calc(var(--s) * var(--dx)), calc(var(--s) * var(--dy)), 0) rotate(calc(var(--r) + var(--s) * var(--dr)));
  will-change: transform;
}
.rm-stage[data-entered='false'] .rm-pos { opacity: 0; }
.rm-stage[data-entered='true'] .rm-pos { animation: rm-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rm-dim .rm-card { opacity: 0.66; }  /* on the inner card: the outer wrapper's entrance animation owns its opacity */

.rm-card {
  position: relative;
  padding: 0.95em 1em 1em;
  border-radius: 1.1em;
  border: 1px solid #34343a;
  background: linear-gradient(180deg, #1c1c20 0%, #131316 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 1.6em 2.6em -1.2em rgba(0,0,0,0.75);
  animation: rm-float var(--fd) ease-in-out var(--fdelay) infinite;
}
.rm-featured {
  border-color: rgba(213,255,64,0.45);
  background: linear-gradient(180deg, #202026 0%, #141417 100%);
  box-shadow: inset 0 1px 0 rgba(213,255,64,0.35), 0 0 0 1px rgba(213,255,64,0.08), 0 2em 3.2em -1.2em rgba(0,0,0,0.85), 0 0 3em -1em rgba(213,255,64,0.25);
}
.rm-hook, .rm-angle { padding-top: 0.85em; padding-bottom: 0.9em; }

.rm-label {
  display: flex; align-items: center; gap: 0.5em;
  font-size: 0.68em; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
  color: #a1a1aa; white-space: nowrap;
}
.rm-label i { width: 0.55em; height: 0.55em; border-radius: 9999px; background: #71717a; display: inline-block; }
.rm-featured .rm-label, .rm-hook .rm-label, .rm-angle .rm-label { color: #d5ff40; }
.rm-featured .rm-label i, .rm-hook .rm-label i, .rm-angle .rm-label i { background: #d5ff40; }

.rm-title { margin-top: 0.55em; font-size: 1.12em; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #fafafa; }
.rm-quote { margin-top: 0.55em; font-size: 0.98em; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; color: #fafafa; }
.rm-featured .rm-title { font-size: 1.35em; }

.rm-line { display: block; height: 0.42em; margin-top: 0.62em; border-radius: 9999px; background: #2b2b31; }
.rm-line:first-of-type { margin-top: 0.85em; }
.rm-tag {
  display: inline-block; margin-top: 0.85em; padding: 0.22em 0.7em; border-radius: 9999px;
  font-size: 0.66em; font-weight: 600; letter-spacing: 0.06em; color: #d5ff40;
  background: rgba(213,255,64,0.1); border: 1px solid rgba(213,255,64,0.25);
}

@keyframes rm-in {
  from { opacity: 0; translate: 0 1.4em; }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes rm-float {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%      { transform: translate3d(0, calc(var(--fa) * -1), 0) rotate(var(--fr)); }
}

/* Pause everything while the stage is off screen */
.rm-stage[data-active='false'] .rm-card { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .rm-pos, .rm-card { animation: none; will-change: auto; }
}
`
