import { useEffect, useState } from 'react'
import { BOOKING_URL } from '../config.js'

const ROTATING_WORDS = ['convert', 'resonate', 'sell', 'connect']

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient lime glow — replaces the old violet/coral wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[40%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.07] blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-14 md:px-8 md:pt-10 md:pb-16 lg:pt-12 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left column — text */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Paid social + Organic creative studio
            </div>

            <h1 className="mt-5 md:mt-6 font-display font-semibold text-ink tracking-display-xl leading-[1.02] text-[40px] sm:text-[50px] md:text-[54px] lg:text-[60px] xl:text-[70px]">
              <span className="block">Performance creatives</span>
              <span className="block">
                engineered to <RotatingWord words={ROTATING_WORDS} />
              </span>
            </h1>

            <p className="mt-5 md:mt-6 max-w-xl text-base md:text-lg text-ink-muted leading-relaxed">
              UGC ads, spokesperson videos, and creative strategy for brands that scale on paid social.
            </p>

            <div className="mt-6 md:mt-8 flex flex-wrap items-center gap-5">
              <a
                href={BOOKING_URL}
                className="cta-gradient group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-canvas"
              >
                Book a Creative Call
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none">
                  <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-lime transition-colors"
              >
                See the process
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          {/* Right column — phones cluster + emojis + stats */}
          <div className="lg:col-span-6">
            <PhonesStage />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Rotating headline word ---------- */

function RotatingWord({ words }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, 2200)
    return () => clearInterval(id)
  }, [words.length])

  // Pick the longest word to set a stable container width — no layout shift.
  const widest = words.reduce((a, b) => (a.length >= b.length ? a : b), '')

  return (
    <span className="relative inline-block align-baseline overflow-hidden pb-[0.12em]">
      {/* Invisible sizing element — reserves space for the widest word + underline padding */}
      <span className="invisible whitespace-pre">{widest}</span>

      {/* Animated word + underline, both bound to the current word so the
          underline tracks the word's width and sits flush under it */}
      <span
        key={index}
        className="animate-word-in absolute inset-0 flex items-baseline justify-start"
      >
        <span className="relative text-lime">
          {words[index]}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-[0.04em] h-[0.08em] rounded-full bg-lime"
          />
        </span>
      </span>
    </span>
  )
}

/* ---------- Phones + decoration stage ---------- */

function PhonesStage() {
  return (
    <div className="relative">
      {/* Phones cluster — side phones tucked behind the center */}
      <div className="relative z-10 flex items-center justify-center">
        <PhoneStatic
          src="/hero-side-1.png"
          alt="UGC spokesperson video sample 1"
          tilt="-9deg"
          className="hidden md:block opacity-90 -mr-10 lg:-mr-14 translate-y-4"
        />
        <PhoneMockup />
        <PhoneStatic
          src="/hero-side-2.png"
          alt="UGC spokesperson video sample 2"
          tilt="9deg"
          className="hidden md:block opacity-90 -ml-10 lg:-ml-14 translate-y-4"
        />
      </div>

      {/* Flying emojis — rise up only in the OUTER zones (left 0–22% and right 78–100%)
          so they pass alongside the side phones but never cross the center video phone */}
      <FlyingEmoji emoji="🔥" className="bottom-2 left-[2%] text-3xl md:text-4xl" tilt="-8deg" delay="0s" drift="-8px" />
      <FlyingEmoji emoji="💸" className="bottom-2 right-[2%] text-3xl md:text-4xl" tilt="10deg" delay="1.1s" drift="10px" />
      <FlyingEmoji emoji="📈" className="bottom-2 left-[14%] text-3xl md:text-4xl" tilt="-12deg" delay="2.3s" drift="-4px" />
      <FlyingEmoji emoji="💯" className="bottom-2 right-[14%] text-3xl md:text-4xl" tilt="8deg" delay="0.5s" drift="4px" />
      <FlyingEmoji emoji="✨" className="bottom-2 left-[8%] text-2xl md:text-3xl" tilt="5deg" delay="3.4s" drift="-6px" />
      <FlyingEmoji emoji="🚀" className="bottom-2 right-[8%] text-2xl md:text-3xl" tilt="-10deg" delay="1.8s" drift="6px" />

      {/* Floating stats around the cluster */}
      <FloatingStat
        className="top-4 left-0 md:left-2 lg:left-4"
        value="30M+"
        label="Views generated"
      />
      <FloatingStat
        className="top-6 right-2 md:top-8 md:-right-8 lg:-right-12"
        value="1k+"
        label="Videos produced"
      />
      <FloatingStat
        className="-bottom-4 md:-bottom-5 left-1/2 -translate-x-1/2"
        value="400+"
        label="Happy clients"
      />
    </div>
  )
}

function FlyingEmoji({ emoji, className = '', tilt = '0deg', delay = '0s', drift = '0px' }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-[15] select-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] animate-fly-up ${className}`}
      style={{ '--tilt': tilt, '--x-drift': drift, animationDelay: delay }}
    >
      {emoji}
    </span>
  )
}

function FloatingStat({ value, label, className = '' }) {
  return (
    <div
      className={`absolute z-30 rounded-2xl border border-hairline bg-surface-1/80 px-3.5 py-2.5 backdrop-blur-md shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] ${className}`}
    >
      <p className="text-lg md:text-xl font-semibold tracking-display text-ink leading-none">
        {value}
      </p>
      <p className="mt-1 text-[11px] md:text-xs text-ink-muted leading-tight">{label}</p>
    </div>
  )
}

/* ---------- Static side phone (image only, no controls) ---------- */

function PhoneStatic({ src, alt, tilt = '0deg', className = '' }) {
  return (
    <div
      style={{ transform: `rotate(${tilt})` }}
      className={`relative z-10 w-[160px] md:w-[170px] lg:w-[190px] xl:w-[210px] aspect-[9/19.5] rounded-[36px] md:rounded-[40px] bg-[#0a0a0a] p-[8px] md:p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[28px] md:rounded-[32px] bg-black">
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          draggable="false"
        />

        {/* Dynamic Island */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1.5 md:top-2 -translate-x-1/2 h-[22px] md:h-[24px] w-[78px] md:w-[88px] rounded-full bg-black z-10"
        />

        {/* Glass-edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] md:rounded-[32px] ring-1 ring-white/10"
        />
      </div>

      {/* Outer body highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[36px] md:rounded-[40px] ring-1 ring-white/5"
      />
    </div>
  )
}

/* ---------- Center phone with looping YouTube video ---------- */

const HERO_YT_ID = 'ViCGTxa0ulo'
const HERO_EMBED = `https://www.youtube-nocookie.com/embed/${HERO_YT_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_YT_ID}&rel=0&playsinline=1`

function PhoneMockup() {
  return (
    <div className="relative z-20 w-[240px] sm:w-[260px] md:w-[260px] lg:w-[280px] xl:w-[300px] aspect-[9/19.5] rounded-[44px] md:rounded-[48px] bg-[#0a0a0a] p-[10px] md:p-[12px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_0_0_1px_rgba(255,255,255,0.08)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[44px] md:rounded-[48px] ring-1 ring-white/5"
      />

      <div className="relative h-full w-full overflow-hidden rounded-[36px] md:rounded-[38px] bg-black">
        <iframe
          src={HERO_EMBED}
          className="absolute inset-0 h-full w-full"
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          title="CONVRT performance creative — UGC ad sample"
        />

        {/* Dynamic Island */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-2 md:top-2.5 -translate-x-1/2 h-[26px] md:h-[28px] w-[100px] md:w-[110px] rounded-full bg-black z-20 pointer-events-none"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[36px] md:rounded-[38px] ring-1 ring-white/10 z-10"
        />
      </div>
    </div>
  )
}
