import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'

const LOCATIONS = ['Prague', 'Almería', 'Granada', 'Marbella']

const PILLARS = [
  {
    number: '01',
    tag: 'STREET INTERVIEWS',
    title: 'Real reactions, turned into proof',
    description: 'Genuine on-the-street responses to the fragrance turned the product proposition into social proof, not a scripted pitch.',
    icon: IconMic,
  },
  {
    number: '02',
    tag: 'CREATOR-LED PERFORMANCE ADS',
    title: 'Built to stop the scroll, without feeling cheap',
    description: 'Direct-to-camera, voiceover and native paid-social formats designed for performance while still protecting how premium Elyon feels.',
    icon: IconCamera,
  },
  {
    number: '03',
    tag: 'MULTI-LOCATION PRODUCTION',
    title: 'A visual library, not repetitive studio UGC',
    description: 'Content captured across four locations gave Elyon range instead of the same backdrop on repeat.',
    icon: IconPin,
    footer: (
      <div className="relative mt-5 flex flex-wrap items-center justify-center gap-1.5">
        {LOCATIONS.map((loc) => (
          <span
            key={loc}
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ background: 'rgba(201,166,104,0.10)', border: '1px solid rgba(201,166,104,0.24)', color: ACCENT }}
          >
            {loc}
          </span>
        ))}
      </div>
    ),
  },
  {
    number: '04',
    tag: 'CONTINUOUS ITERATION',
    title: 'When a creative wins, you build around it',
    description: 'Winning angles became the foundation for follow-up formats, variations and additional creative, not a one-off that was never repeated.',
    icon: IconLoop,
  },
]

export default function ElyonCreativeSystem() {
  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8 text-center">
        <div className="mb-12 md:mb-16 max-w-2xl mx-auto">
          <Eyebrow label="The Creative System" accent={ACCENT} className="mb-6" />
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            From content production
            <br />
            to a creative engine.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            What started as creator content evolved into a repeatable pipeline of concepts, interviews
            and paid-social creative.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {PILLARS.map((p) => (
            <PillarCard key={p.number} pillar={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PillarCard({ pillar }) {
  const Icon = pillar.icon
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border px-7 py-8 flex flex-col items-center text-center transition-colors"
      style={{ borderColor: 'rgba(201,166,104,0.14)', background: 'rgba(255,255,255,0.02)' }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-4 -right-2 font-display font-black leading-none opacity-[0.06]"
        style={{ fontSize: 'clamp(70px, 9vw, 110px)', color: ACCENT }}
      >
        {pillar.number}
      </span>

      <div
        className="relative h-12 w-12 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(201,166,104,0.12)', border: '1px solid rgba(201,166,104,0.28)' }}
      >
        <Icon color={ACCENT} />
      </div>

      <span className="relative text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
        {pillar.tag}
      </span>
      <h3 className="relative mt-3 font-display font-bold text-ink text-lg leading-snug">
        {pillar.title}
      </h3>
      <p className="relative mt-2.5 text-[13px] text-ink-muted leading-relaxed">
        {pillar.description}
      </p>
      {pillar.footer}
    </div>
  )
}

function IconMic({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="12" rx="3" stroke={color} strokeWidth="1.6" />
      <path d="M6 11v1a6 6 0 0012 0v-1" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 18v3M9 21h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconCamera({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="1.6" />
      <path d="M8 7l1.6-3h4.8L16 7" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
function IconPin({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
function IconLoop({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0113.5-5.8M20 12a8 8 0 01-13.5 5.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 3v3.5h-3.5M7 21v-3.5h3.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
