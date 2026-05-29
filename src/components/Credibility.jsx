import { useRef, useEffect, useState } from 'react'
import { BOOKING_URL } from '../config.js'

/* Two rows of real client logos, rendered as uniform white silhouettes so
   they read cleanly against the dark canvas regardless of original color
   or background. Achieved with `filter: brightness(0) invert(1)` — works
   identically on PNG, SVG, and WebP. */

/* Per-logo `treatment` decides which CSS filter to apply:
   - 'invert'   → brightness(0) invert(1) — flattens any opaque pixel to white.
                  Use when the source is a dark/colored logo on transparent bg.
                  (default — works for the vast majority of logos)
   - 'knockout' → SVG luminance filter — turns bright pixels transparent and
                  dark pixels opaque white. Use when the source has WHITE
                  content INSIDE a darker shape (e.g. promova: white text
                  inside a dark rounded rectangle) so the text cuts out
                  cleanly instead of merging with the rect into one square.
   - 'extract'  → Inverse SVG luminance filter — keeps bright pixels as opaque
                  white, drops everything else to transparent. Use when the
                  source is WHITE content ON a colored/dark background
                  (e.g. Coursiv: white cursive on a blue background). */

const row1 = [
  { src: '/clients/tiktok.png',       alt: 'TikTok',        height: 28 },
  { src: '/clients/indrive.svg',      alt: 'inDrive',       height: 32 },
  { src: '/clients/airalo.png',       alt: 'Airalo',        height: 52 },
  { src: '/clients/ria.png',          alt: 'Ria',           height: 38 },
  { src: '/clients/expertoption.png', alt: 'Expert Option', height: 30 },
  { src: '/clients/promova.png',      alt: 'Promova',       height: 30, treatment: 'knockout' },
  { src: '/clients/fixd.png',         alt: 'FIXD',          height: 30 },
]

const row2 = [
  { src: '/clients/adscale.png',  alt: 'Adscale',  height: 30 },
  { src: '/clients/toluna.png',   alt: 'Toluna',   height: 28 },
  { src: '/clients/wpx.svg',      alt: 'WPX',      height: 32 },
  { src: '/clients/elyon.png',    alt: 'Elyon',    height: 40 },
  { src: '/clients/coursiv.webp', alt: 'Coursiv',  height: 60, treatment: 'extract' },
  { src: '/clients/graspo.png',   alt: 'Graspo',   height: 36 },
]

export default function Credibility() {
  return (
    <section id="clients" className="relative border-y border-hairline bg-canvas overflow-hidden">
      {/*
        Logo knockout filter — turns any logo (transparent-bg, white-bg, or mixed)
        into a clean white silhouette on the dark canvas:
          1. feColorMatrix sets RGB to white and sets alpha = (1 - luminance)
             so dark pixels become opaque, bright pixels become transparent.
          2. feComponentTransfer with discrete tableValues sharpens that into a
             near-binary threshold, eliminating mid-tone "halos".
          3. feComposite operator="in" masks against SourceGraphic alpha so
             originally-transparent pixels stay transparent (they don't get
             painted white).
      */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          {/* logo-knockout: keep DARK pixels as white, drop BRIGHT pixels.
              For sources like Promova (white text INSIDE a dark rounded rect). */}
          <filter id="logo-knockout" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      -0.299 -0.587 -0.114 0 1"
              result="lum"
            />
            <feComponentTransfer in="lum" result="thresh">
              <feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
            </feComponentTransfer>
            <feComposite in="thresh" in2="SourceGraphic" operator="in" />
          </filter>

          {/* logo-extract: keep BRIGHT pixels as white, drop dark/mid pixels.
              For sources like Coursiv (white cursive ON a blue background). */}
          <filter id="logo-extract" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      0.299 0.587 0.114 0 0"
              result="lum"
            />
            <feComponentTransfer in="lum" result="thresh">
              <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 1 1" />
            </feComponentTransfer>
            <feComposite in="thresh" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Soft lime wash behind the strip — mirrors the reference's green spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[80%] bg-[radial-gradient(ellipse_at_center,_rgba(213,255,64,0.10)_0%,_rgba(213,255,64,0.03)_45%,_transparent_70%)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        {/* Top marquee */}
        <LogoMarquee logos={row1} direction="forward" />

        {/* Bottom marquee — opposite direction */}
        <div className="mt-8 md:mt-10">
          <LogoMarquee logos={row2} direction="reverse" />
        </div>

        {/* Headline + CTA below */}
        <div className="mt-14 md:mt-16 flex flex-col items-center text-center gap-10 md:gap-12">
          <h2 className="font-display font-semibold tracking-display text-ink leading-[1.1] text-3xl md:text-4xl lg:text-[44px] max-w-3xl">
            Trusted by <span className="text-lime">400+ brands</span> across ecommerce, apps, SaaS, and global consumer markets.
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
              className="cta-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-canvas w-full sm:w-auto"
            >
              Become our next client
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href={BOOKING_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-canvas transition-transform duration-150 active:scale-[0.98] hover:bg-white w-full sm:w-auto"
            >
              I'm a creator
              <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
                <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/*
  Seamless marquee — three copies so the strip always covers any viewport.
  We measure the EXACT pixel width of one copy after layout, then pass it as
  the CSS variable --marquee-offset used by the @keyframes.
  This avoids the sub-pixel rounding that makes a percentage-based offset
  land 1–2 px off and show a visible seam.
*/
function LogoMarquee({ logos, direction = 'forward' }) {
  const trackRef = useRef(null)
  const [ready, setReady] = useState(false)
  const tripled = [...logos, ...logos, ...logos]
  const trackClass = direction === 'reverse' ? 'marquee-track-reverse' : 'marquee-track'

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      /* scrollWidth = 3 copies; we want exactly 1 copy's width */
      const oneCopy = Math.ceil(el.scrollWidth / 3)
      el.style.setProperty('--marquee-offset', `-${oneCopy}px`)
      setReady(true)
    }
    /* Double-RAF: first RAF = end of paint, second = after layout is final */
    const id = requestAnimationFrame(() => requestAnimationFrame(measure))
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure) }
  }, [logos.length])

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        ref={trackRef}
        className={`flex w-max items-center gap-8 md:gap-16 lg:gap-20 ${trackClass}`}
        style={{ opacity: ready ? 1 : 0, transition: ready ? 'opacity 0.4s ease' : 'none' }}
      >
        {tripled.map((logo, i) => (
          <LogoTile key={`${logo.alt}-${i}`} {...logo} />
        ))}
      </div>
    </div>
  )
}

function LogoTile({ src, alt, height = 32, treatment = 'invert' }) {
  // Default treatment: brightness-and-invert flattens any opaque pixel to pure
  // white, producing a clean silhouette on the dark canvas. Use 'knockout'
  // for sources where white internal content must be cut out (Promova), and
  // 'extract' for sources where white content sits on a colored background
  // (Coursiv). Both reference SVG filters defined at the top of the section.
  const filterClass =
    treatment === 'knockout'
      ? '[filter:url(#logo-knockout)]'
      : treatment === 'extract'
        ? '[filter:url(#logo-extract)]'
        : '[filter:brightness(0)_invert(1)]'

  return (
    <div className="shrink-0 flex items-center justify-center" style={{ height: `${height + 8}px` }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable="false"
        className={`block w-auto select-none ${filterClass} opacity-65 hover:opacity-100 transition-opacity duration-200`}
        style={{ height: `${height}px` }}
      />
    </div>
  )
}
