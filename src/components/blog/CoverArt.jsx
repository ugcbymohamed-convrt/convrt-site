import { useId } from 'react'

/* Lightweight abstract thumbnails for blog cards: inline SVG, no image requests, no JS
   beyond React, ~1 KB each. Palette is the site's (lime + pink on near-black). They are
   decorative (aria-hidden); the card text carries the meaning.

   Used for coming-soon topics, and as the fallback for a real article without an `image`.
   `art` selects the graphic; unknown values fall back to a category default. */

const LIME = '#d5ff40'
const PINK = '#F472B6'
const LINE = '#34343a'
const FACE = '#1c1c20'

const FALLBACK_BY_CATEGORY = {
  'creative-strategy': 'testing',
  'ugc-video-ads': 'price',
  'saas-video-marketing': 'saas',
  'ecommerce-creative': 'versus',
}

export function artFor(art, category) {
  return ART[art] ? art : FALLBACK_BY_CATEGORY[category] || 'testing'
}

export default function CoverArt({ art, category, className = '' }) {
  const id = useId().replace(/:/g, '')
  const Art = ART[artFor(art, category)]
  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#17171b" />
          <stop offset="1" stopColor="#0d0d10" />
        </linearGradient>
        <radialGradient id={`${id}-lime`} cx="0.2" cy="0.1" r="0.7">
          <stop offset="0" stopColor={LIME} stopOpacity="0.16" />
          <stop offset="1" stopColor={LIME} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-pink`} cx="0.9" cy="0.95" r="0.65">
          <stop offset="0" stopColor={PINK} stopOpacity="0.2" />
          <stop offset="1" stopColor={PINK} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#${id}-bg)`} />
      <rect width="400" height="250" fill={`url(#${id}-lime)`} />
      <rect width="400" height="250" fill={`url(#${id}-pink)`} />
      <Art />
    </svg>
  )
}

/* Declining performance: bars losing height and color, a falling trend line. */
function Fatigue() {
  const heights = [150, 140, 128, 112, 96, 80, 66, 54, 44]
  return (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="42" x2="358" y1={60 + i * 42} y2={60 + i * 42} stroke={LINE} strokeWidth="1" strokeDasharray="3 5" />
      ))}
      {heights.map((h, i) => (
        <rect
          key={i}
          x={52 + i * 34}
          y={200 - h}
          width="22"
          height={h}
          rx="6"
          fill={i < 4 ? LIME : PINK}
          opacity={1 - i * 0.075}
        />
      ))}
      <path d="M63 62 C120 66 150 82 190 104 S290 150 346 166" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 7" />
      <circle cx="346" cy="166" r="7" fill={PINK} />
      <circle cx="346" cy="166" r="13" fill="none" stroke={PINK} strokeOpacity="0.4" />
    </g>
  )
}

/* A vertical video next to a price tag and deliverable rows. */
function Price() {
  return (
    <g>
      <rect x="62" y="38" width="96" height="174" rx="16" fill={FACE} stroke={LINE} strokeWidth="2" />
      <rect x="72" y="52" width="76" height="136" rx="8" fill="#0a0a0b" />
      <circle cx="110" cy="112" r="20" fill={LIME} />
      <path d="M104 102 L122 112 L104 122 Z" fill="#0a0a0b" />
      <rect x="86" y="196" width="48" height="4" rx="2" fill={LINE} />
      <g>
        <rect x="190" y="52" width="150" height="52" rx="14" fill={LIME} />
        <circle cx="214" cy="78" r="9" fill="#0a0a0b" />
        <text x="214" y="83" textAnchor="middle" fontSize="13" fontWeight="800" fill={LIME} fontFamily="Inter, system-ui, sans-serif">$</text>
        <rect x="236" y="68" width="82" height="9" rx="4.5" fill="#0a0a0b" opacity="0.85" />
        <rect x="236" y="83" width="52" height="7" rx="3.5" fill="#0a0a0b" opacity="0.45" />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="202" cy={132 + i * 28} r="8" fill="none" stroke={PINK} strokeWidth="2" />
          <path d={`M198 ${132 + i * 28} l3 3 l6 -6`} fill="none" stroke={PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="222" y={128 + i * 28} width={118 - i * 22} height="8" rx="4" fill={LINE} />
        </g>
      ))}
    </g>
  )
}

/* A product dashboard window with a play button over it. */
function Saas() {
  return (
    <g>
      <rect x="46" y="38" width="308" height="176" rx="16" fill={FACE} stroke={LINE} strokeWidth="2" />
      <path d="M46 70 H354" stroke={LINE} strokeWidth="2" />
      <circle cx="66" cy="54" r="4.5" fill={PINK} />
      <circle cx="82" cy="54" r="4.5" fill={LIME} />
      <circle cx="98" cy="54" r="4.5" fill={LINE} />
      <rect x="62" y="86" width="52" height="112" rx="8" fill="#0a0a0b" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="70" y={96 + i * 22} width={i === 0 ? 36 : 28} height="7" rx="3.5" fill={i === 0 ? LIME : LINE} />
      ))}
      <rect x="126" y="86" width="96" height="48" rx="8" fill="#0a0a0b" />
      <rect x="234" y="86" width="104" height="48" rx="8" fill="#0a0a0b" />
      <path d="M138 124 L156 110 L172 118 L192 98 L210 106" fill="none" stroke={PINK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="126" y="146" width="212" height="52" rx="8" fill="#0a0a0b" />
      <circle cx="240" cy="150" r="30" fill={LIME} />
      <path d="M231 136 L255 150 L231 164 Z" fill="#0a0a0b" />
    </g>
  )
}

/* A grid of creative variations; a couple stand out as winners. */
function Testing() {
  const winners = new Set([2, 6, 9])
  const loser = new Set([4, 11])
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const x = 50 + col * 80
        const y = 38 + row * 62
        const win = winners.has(i)
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width="66"
              height="52"
              rx="10"
              fill={win ? LIME : FACE}
              stroke={loser.has(i) ? PINK : win ? LIME : LINE}
              strokeOpacity={loser.has(i) ? 0.7 : 1}
              strokeWidth="2"
              strokeDasharray={loser.has(i) ? '4 4' : undefined}
            />
            <path d={`M${x + 28} ${y + 17} L${x + 42} ${y + 26} L${x + 28} ${y + 35} Z`} fill={win ? '#0a0a0b' : '#52525b'} />
          </g>
        )
      })}
    </g>
  )
}

/* A raw, handheld frame against a polished studio frame. */
function Versus() {
  return (
    <g>
      <g transform="rotate(-6 120 125)">
        <rect x="64" y="40" width="112" height="170" rx="14" fill={FACE} stroke={LIME} strokeWidth="2" />
        <circle cx="120" cy="100" r="20" fill={LIME} opacity="0.9" />
        <path d="M82 190 C84 150 156 150 158 190 Z" fill={LIME} opacity="0.55" />
        <circle cx="82" cy="56" r="3.5" fill={PINK} />
        <rect x="90" y="53" width="26" height="6" rx="3" fill={LINE} />
      </g>
      <g>
        <rect x="224" y="40" width="112" height="170" rx="14" fill={FACE} stroke={PINK} strokeWidth="2" />
        <rect x="236" y="52" width="88" height="146" rx="8" fill="#0a0a0b" />
        <circle cx="280" cy="108" r="22" fill="none" stroke={PINK} strokeWidth="3" />
        <circle cx="280" cy="108" r="9" fill={PINK} />
        <path d="M244 196 H316" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="200" cy="125" r="22" fill="#0a0a0b" stroke={LINE} strokeWidth="2" />
      <text x="200" y="130" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fafafa" fontFamily="Inter, system-ui, sans-serif">VS</text>
    </g>
  )
}

/* A person and a node network, joined by a waveform. */
function HumanAi() {
  const nodes = [[290, 70], [330, 100], [276, 128], [320, 156], [286, 186], [348, 190]]
  return (
    <g>
      <circle cx="104" cy="94" r="30" fill="none" stroke={LIME} strokeWidth="3" />
      <path d="M52 196 C54 140 154 140 156 196" fill="none" stroke={LIME} strokeWidth="3" strokeLinecap="round" />
      <path d="M170 124 q10 -26 20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round" />
      {[[0, 1], [1, 3], [0, 2], [2, 3], [2, 4], [3, 5], [4, 5]].map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={PINK} strokeOpacity="0.55" strokeWidth="2" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 2 ? 10 : 7} fill={i === 2 ? PINK : FACE} stroke={PINK} strokeWidth="2.5" />
      ))}
    </g>
  )
}

const ART = {
  fatigue: Fatigue,
  price: Price,
  saas: Saas,
  testing: Testing,
  versus: Versus,
  'human-ai': HumanAi,
}
