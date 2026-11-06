import { useEffect, useRef, useState } from 'react'
import { SAMPLE_HOOKS } from '../../lib/hooksLibrary.js'

/* ─────────────────────────────────────────────
   HERO VISUAL — overlapping ad-script cards built from real CONVRT hooks.

   • Featured card: cycles through four real hooks (SaaS / E-commerce), each
     showing its Say it / Show it / Write it layers. Swaps with a short fade;
     the cycle only runs while the stage is on screen and the tab is visible.
   • Back card + two floating chips: static, quoted from other real hooks (03/04),
     each bobbing on its own slow transform-only loop.
   • prefers-reduced-motion: no cycling, no bobbing — one still composition.
   • Decorative: the whole stage is aria-hidden; the figure has a text label.
   Sizing is in em off the stage's own width (container query units) so it
   scales cleanly from 320px up.
───────────────────────────────────────────── */

const ROTATION = [
  { industry: 'SaaS', hook: SAMPLE_HOOKS.saas[0] },
  { industry: 'E-commerce', hook: SAMPLE_HOOKS.ecommerce[0] },
  { industry: 'SaaS', hook: SAMPLE_HOOKS.saas[1] },
  { industry: 'E-commerce', hook: SAMPLE_HOOKS.ecommerce[1] },
]
// Static pieces come from hooks that are not in the rotation, so nothing repeats on screen.
const BACK = { industry: 'E-commerce', hook: SAMPLE_HOOKS.ecommerce[3] }
const BUBBLE = SAMPLE_HOOKS.saas[2].verbal
const CAPTION = SAMPLE_HOOKS.ecommerce[2].text

const CYCLE_MS = 5200

export default function HookCardsVisual() {
  const stageRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: '80px 0px' })
    io.observe(stage)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!onScreen || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % ROTATION.length)
    }, CYCLE_MS)
    return () => window.clearInterval(id)
  }, [onScreen])

  const current = ROTATION[index]

  return (
    <figure
      className="mx-auto w-full max-w-[460px] lg:max-w-none"
      role="img"
      aria-label="Illustration of overlapping ad hook cards, each with a verbal hook, a visual hook and on-screen text"
    >
      <style>{CSS}</style>

      <div ref={stageRef} className="hk-stage w-full" data-active={onScreen ? 'true' : 'false'}>
        <div className="hk-scene relative w-full" aria-hidden="true">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.09] blur-[70px]" />

          {/* Back card */}
          <div className="hk-pos" style={{ left: '40%', top: '1%', width: '58%', '--r': '6deg', zIndex: 2 }}>
            <div className="hk-card hk-dim" style={{ '--fa': '6px', '--fr': '1deg', '--fd': '8.5s', '--fdelay': '-2s' }}>
              <p className="hk-label"><i /> Hook {BACK.hook.n} · {BACK.industry}</p>
              <p className="hk-quote">“{BACK.hook.verbal}”</p>
            </div>
          </div>

          {/* Featured card — cycles through real hooks */}
          <div className="hk-pos" style={{ left: '1%', top: '13%', width: '72%', '--r': '-3deg', zIndex: 5 }}>
            <div className="hk-card hk-featured" style={{ '--fa': '8px', '--fr': '0.8deg', '--fd': '9s', '--fdelay': '-1s' }}>
              <div key={index} className="hk-swap">
                <p className="hk-label hk-lime"><i /> Hook {current.hook.n} · {current.industry}</p>
                <p className="hk-title">{current.hook.name}</p>
                <Layer tag="Say it" text={`“${current.hook.verbal}”`} />
                <Layer tag="Show it" text={current.hook.visual} />
                <Layer tag="Write it" text={`“${current.hook.text}”`} />
              </div>
            </div>
          </div>

          {/* Speech-bubble chip */}
          <div className="hk-pos" style={{ left: '4%', top: '78%', width: '52%', '--r': '-4deg', zIndex: 6 }}>
            <div className="hk-card hk-bubble" style={{ '--fa': '7px', '--fr': '1.2deg', '--fd': '7.5s', '--fdelay': '-3.5s' }}>
              <p className="hk-label hk-lime"><i /> Say it</p>
              <p className="hk-quote">“{BUBBLE}”</p>
            </div>
          </div>

          {/* On-screen text chip */}
          <div className="hk-pos" style={{ left: '58%', top: '80%', width: '40%', '--r': '5deg', zIndex: 6 }}>
            <div className="hk-card hk-caption" style={{ '--fa': '6px', '--fr': '1deg', '--fd': '8s', '--fdelay': '-5s' }}>
              <p className="hk-label"><i /> Write it</p>
              <p className="hk-overlay">{CAPTION}</p>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-xs text-ink-subtle">
        A few hooks from the library. Adapt the [placeholders] to your product.
      </figcaption>
    </figure>
  )
}

function Layer({ tag, text }) {
  return (
    <div className="hk-layer">
      <span className="hk-tag">{tag}</span>
      <p>{text}</p>
    </div>
  )
}

const CSS = `
.hk-stage { container-type: inline-size; }
.hk-scene {
  aspect-ratio: 1 / 1.12;
  font-size: 11px;
  font-size: max(11px, 3.2cqw);
}
.hk-pos {
  position: absolute;
  transform: rotate(var(--r));
  animation: hk-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hk-card {
  position: relative;
  padding: 0.95em 1em 1em;
  border-radius: 1.1em;
  border: 1px solid #34343a;
  background: linear-gradient(180deg, #1c1c20 0%, #131316 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 1.6em 2.6em -1.2em rgba(0,0,0,0.75);
  animation: hk-float var(--fd) ease-in-out var(--fdelay) infinite;
}
.hk-dim { opacity: 0.62; }
.hk-featured {
  min-height: 21em;
  border-color: rgba(213,255,64,0.45);
  background: linear-gradient(180deg, #202026 0%, #141417 100%);
  box-shadow: inset 0 1px 0 rgba(213,255,64,0.35), 0 0 0 1px rgba(213,255,64,0.08), 0 2em 3.2em -1.2em rgba(0,0,0,0.85), 0 0 3em -1em rgba(213,255,64,0.25);
}
.hk-bubble, .hk-caption { padding: 0.8em 0.9em 0.85em; background: linear-gradient(180deg, #202026 0%, #17171a 100%); }

.hk-label {
  display: flex; align-items: center; gap: 0.5em;
  font-size: 0.66em; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
  color: #a1a1aa; white-space: nowrap;
}
.hk-label i { width: 0.55em; height: 0.55em; border-radius: 9999px; background: #71717a; display: inline-block; }
.hk-lime { color: #d5ff40; }
.hk-lime i { background: #d5ff40; }

.hk-title { margin-top: 0.5em; font-size: 1.2em; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #fafafa; }
.hk-quote { margin-top: 0.5em; font-size: 0.92em; font-weight: 600; line-height: 1.3; letter-spacing: -0.01em; color: #fafafa; }
.hk-overlay {
  margin-top: 0.55em; display: inline-block; padding: 0.3em 0.6em; border-radius: 0.5em;
  font-size: 0.95em; font-weight: 800; line-height: 1.15; letter-spacing: -0.01em; color: #0a0a0b; background: #d5ff40;
}

.hk-layer { margin-top: 0.8em; padding-top: 0.7em; border-top: 1px solid #2b2b31; }
.hk-layer p { margin-top: 0.35em; font-size: 0.86em; line-height: 1.35; color: #d4d4d8; }
.hk-tag {
  display: inline-block; padding: 0.18em 0.65em; border-radius: 9999px;
  font-size: 0.62em; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #d5ff40;
  background: rgba(213,255,64,0.1); border: 1px solid rgba(213,255,64,0.25);
}

.hk-swap { animation: hk-swap 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }

@keyframes hk-in { from { opacity: 0; translate: 0 1.4em; } to { opacity: 1; translate: 0 0; } }
@keyframes hk-swap { from { opacity: 0; translate: 0 0.6em; } to { opacity: 1; translate: 0 0; } }
@keyframes hk-float {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  50%      { transform: translate3d(0, calc(var(--fa) * -1), 0) rotate(var(--fr)); }
}
.hk-stage[data-active='false'] .hk-card { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .hk-pos, .hk-card, .hk-swap { animation: none; }
}
`
