import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────
   HERO VISUAL — five stacked creative-concept cards.

   One package, five different ideas. The cards start as a tight stack with a
   strip of each colour showing, and fan apart as the visitor scrolls: each
   card slides to its own side, turns a different amount and settles at full
   size, so the five directions are revealed one under the other.

   How it works (kept deliberately light):
   • One passive scroll listener, throttled with requestAnimationFrame, writes a
     single CSS variable (--e, 0 = stacked … 1 = separated) on the stage. Every
     card derives its transform from it with calc() — transform only, no layout
     work, no per-card JS, no libraries.
   • The scroll range is measured on mount / resize (never during scroll) and
     starts when the stage is well inside the viewport, so it works for the
     desktop hero (visible on load) and the mobile hero (below the copy). It is
     scroll-linked and finishes after about a third of a screen of scrolling —
     no pinning, no extra scroll length.
   • The listener only runs while the stage is near the viewport.
   • prefers-reduced-motion (or no JS): no listener — the cards simply sit in the
     separated, fully readable arrangement.

   The cards are illustrative concept labels (not real ads or client work); the
   whole stage is decorative and exposed to assistive tech as one image.
───────────────────────────────────────────── */

/* x / r : horizontal offset (em) and rotation (deg) when stacked (0) and separated (1).
   Back cards (low index) are smaller while stacked, for depth. */
const CARDS = [
  { n: '01', title: 'Problem / Solution', color: '#d5ff40', ink: '#0a0a0b', icon: 'split', x0: -0.6, x1: -2.2, r0: -1.2, r1: -3.6 },
  { n: '02', title: 'Social Proof', color: '#ff4fa3', ink: '#0a0a0b', icon: 'star', x0: 0.7, x1: 2.0, r0: 1.0, r1: 3.0 },
  { n: '03', title: 'Pattern Interrupt', color: '#3b82f6', ink: '#ffffff', icon: 'bolt', x0: -0.4, x1: -1.2, r0: -0.7, r1: -2.4 },
  { n: '04', title: 'Product Demonstration', color: '#8b5cf6', ink: '#ffffff', icon: 'play', x0: 0.5, x1: 2.4, r0: 0.9, r1: 3.4 },
  { n: '05', title: 'Objection Breaker', color: '#ff8a1f', ink: '#0a0a0b', icon: 'shield', x0: -0.2, x1: -1.8, r0: -0.5, r1: -2.8,
    blurb: 'Answer the doubt before they voice it.' },
]

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi)

export default function ConceptCardsVisual() {
  const stageRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return // static, separated arrangement

    let startY = 0
    let dist = 400
    let raf = 0
    let listening = false

    // Scroll range, measured here (never while scrolling):
    //  • starts once the stage is well inside the viewport (immediately on desktop,
    //    where the hero is visible on load);
    //  • ends while the whole stack is still on screen: the stage also drifts down by
    //    --k as it separates, so it stays clear of the sticky header instead of
    //    scrolling away mid-animation.
    const measure = () => {
      const r = stage.getBoundingClientRect()
      const vh = window.innerHeight
      const k = parseFloat(getComputedStyle(stage).getPropertyValue('--k')) || 0
      const e = parseFloat(stage.style.getPropertyValue('--e')) || 0
      const header = document.querySelector('header')
      const headerH = header ? header.getBoundingClientRect().height : 72
      const topDoc = r.top + window.scrollY - e * k // where the stage sits un-shifted
      const centre = topDoc + r.height / 2
      startY = Math.max(0, centre - vh * 0.72)
      dist = clamp(topDoc + k - headerH - 18 - startY, 120, 300)
    }
    const update = () => {
      raf = 0
      const p = clamp((window.scrollY - startY) / dist, 0, 1)
      stage.style.setProperty('--e', (p * p * (3 - 2 * p)).toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(update) }
    const onResize = () => { measure(); onScroll() }
    const listen = (on) => {
      if (on === listening) return
      listening = on
      const fn = on ? 'addEventListener' : 'removeEventListener'
      window[fn]('scroll', onScroll, { passive: true })
      window[fn]('resize', onResize)
    }

    measure()
    update()
    window.addEventListener('load', onResize, { once: true })

    const io = new IntersectionObserver(
      ([entry]) => {
        listen(entry.isIntersecting)
        if (entry.isIntersecting) { measure(); update() }
      },
      { rootMargin: '60% 0px' },
    )
    io.observe(stage)

    return () => {
      io.disconnect()
      listen(false)
      window.removeEventListener('load', onResize)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <figure
      className="mx-auto w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px]"
      role="img"
      aria-label="Illustration of five stacked, colour-coded creative concept cards: problem and solution, social proof, pattern interrupt, product demonstration and objection breaker"
    >
      <style>{CSS}</style>

      <div ref={stageRef} className="rc-stage w-full">
       <div className="rc-scene relative w-full">
          {/* Soft glow behind the stack */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.07] blur-[70px]"
          />

          {CARDS.map((c, i) => (
            <div
              key={c.n}
              aria-hidden="true"
              className="rc-card"
              style={{
                zIndex: i + 1,
                '--i': i,
                '--x0': c.x0, '--x1': c.x1,
                '--r0': c.r0, '--r1': c.r1,
                '--s0': (0.88 + i * 0.03).toFixed(2),
                background: `linear-gradient(180deg, ${tint(c.color)} 0%, ${c.color} 38%)`,
                color: c.ink,
                '--chip': c.ink === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(10,10,11,0.13)',
              }}
            >
              <div className="rc-head">
                <p className="rc-num">
                  {c.n}
                  <span>Concept</span>
                </p>
                <span className="rc-chip"><Icon name={c.icon} /></span>
              </div>
              <p className="rc-title">{c.title}</p>

              {/* Lower part of the card: only the front card shows it in full. */}
              <span className="rc-deco" />
              {c.blurb && <p className="rc-blurb">{c.blurb}</p>}
            </div>
          ))}
       </div>

       <figcaption className="mt-4 text-center text-xs text-ink-subtle">Illustrative concept ideas, not real ads.</figcaption>
      </div>
    </figure>
  )
}

/* lighten a hex colour a touch for the top edge of the card gradient */
function tint(hex) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (v) => Math.round(v + (255 - v) * 0.22)
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
}

function Icon({ name }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'split':
      return (
        <svg {...common}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M12 5v14" /><path d="M6.5 10l2 2-2 2" /><path d="M15.5 12.5l1.6 1.6 2.4-3" /></svg>
      )
    case 'star':
      return <svg {...common}><path d="M12 3.8l2.4 5 5.4.7-4 3.7 1 5.4L12 16l-4.8 2.6 1-5.4-4-3.7 5.4-.7z" /></svg>
    case 'bolt':
      return <svg {...common}><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" /></svg>
    case 'play':
      return <svg {...common}><rect x="6" y="3.5" width="12" height="17" rx="2.6" /><path d="M10.5 9.2v5.6l4.2-2.8z" /></svg>
    default:
      return <svg {...common}><path d="M12 3.2l7 2.6v5.6c0 4.3-2.9 7.6-7 9.4-4.1-1.8-7-5.1-7-9.4V5.8z" /><path d="M8.8 12.2l2.3 2.3 4.1-4.5" /></svg>
  }
}

/* Component-scoped CSS. Everything is sized in em off the scene's own width
   (container-query units), so the arrangement scales cleanly from 320px up.
   Scene width = 100 / 3.5 ≈ 28.57em. */
const CSS = `
.rc-stage {
  --e: 1;                           /* separated by default: reduced motion / no JS */
  --step: 4.9;                      /* vertical distance between cards when separated (em) */
  --k: 48px;                        /* how far the stage drifts down while separating */
  container-type: inline-size;
  /* drift down a little while separating so it stays on screen as the page scrolls */
  transform: translate3d(0, calc(var(--e) * var(--k)), 0);
  will-change: transform;
}
@media (min-width: 640px) { .rc-stage { --k: 88px; } }
.rc-scene {
  font-size: 11px;                  /* fallback where cqw is unsupported */
  font-size: max(11px, 3.5cqw);
  /* top pad + card height + 4 steps + bottom pad: no layout shift, no excess space */
  height: calc((1.4 + 11.4 + 4 * var(--step) + 1.2) * 1em);
}
.rc-card {
  position: absolute;
  left: 5.08em;
  top: 1.4em;
  width: 18.4em;
  height: 11.4em;
  padding: 0.7em 1em;
  border-radius: 1.15em;
  overflow: hidden;
  transform-origin: 50% 0;
  /* position, turn and size each interpolate between the stacked (0) and separated (1) pose via --e */
  transform:
    translate3d(
      calc((var(--x0) + (var(--x1) - var(--x0)) * var(--e)) * 1em),
      calc(((var(--i) * 0.85) + ((var(--step) - 0.85) * 2) * (1 - var(--e)) + (var(--i) * (var(--step) - 0.85)) * var(--e)) * 1em),
      0)
    rotate(calc((var(--r0) + (var(--r1) - var(--r0)) * var(--e)) * 1deg))
    scale(calc(var(--s0) + (1 - var(--s0)) * var(--e)));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.45),
    0 0.9em 1.8em -0.9em rgba(0,0,0,0.75),
    0 0 0 1px rgba(0,0,0,0.12);
  will-change: transform;
  backface-visibility: hidden;
}
.rc-head { display: flex; align-items: center; justify-content: space-between; }
.rc-num {
  display: flex; align-items: baseline; gap: 0.55em;
  font-size: 1.65em; font-weight: 800; line-height: 1; letter-spacing: -0.04em;
}
.rc-num span {
  font-size: 0.32em; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.7;
}
.rc-chip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.75em; height: 1.75em; border-radius: 9999px; background: var(--chip);
}
.rc-chip svg { width: 1.05em; height: 1.05em; }
.rc-title {
  margin-top: 0.4em; font-size: 1.1em; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; white-space: nowrap;
}
.rc-deco {
  position: absolute; right: -2.4em; bottom: -2.6em; width: 9em; height: 9em; border-radius: 9999px;
  border: 0.18em solid currentColor; opacity: 0.16;
  box-shadow: 0 0 0 1.4em transparent, inset 0 0 0 1.6em transparent;
}
.rc-deco::after {
  content: ''; position: absolute; inset: 1.7em; border-radius: 9999px; border: 0.18em solid currentColor;
}
.rc-blurb {
  position: absolute; left: 1em; right: 6em; bottom: 0.9em;
  font-size: 0.85em; font-weight: 600; line-height: 1.3; opacity: 0.78;
}
`
