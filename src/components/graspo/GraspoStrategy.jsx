const ACCENT = '#d5ff40'

const PILLARS = [
  {
    number: '01',
    tag: 'EDUCATE',
    title: 'Printing knowledge people actually wanted',
    description: 'Materials, finishing techniques, machine capability and production know-how, turned into content that teaches instead of just showing off.',
    icon: IconEducate,
  },
  {
    number: '02',
    tag: 'DEMONSTRATE',
    title: 'Real production, not stock footage',
    description: 'Books, catalogs, machinery and finished work, filmed on the floor, so quality and scale were something a buyer could see, not just claim.',
    icon: IconDemonstrate,
  },
  {
    number: '03',
    tag: 'LOCALIZE',
    title: 'Arabic-first, not Arabic-translated',
    description: 'Messaging built for the culture and language of the target market from the start, not adapted after the fact from an English-language playbook.',
    icon: IconLocalize,
  },
  {
    number: '04',
    tag: 'CONVERT',
    title: 'Comments and DMs treated as pipeline',
    description: 'Every serious inquiry, a quote request, a sample ask, a partnership pitch, tracked, qualified and moved toward Graspo\'s sales team.',
    icon: IconConvert,
  },
]

export default function GraspoStrategy() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8 text-center">
        <div className="mb-12 md:mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-6 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">The Strategy</span>
          </div>
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            From industrial expertise
            <br />
            to social content.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            CONVRT ran Graspo's content as a system, not a posting schedule, strategy, production,
            localization and inbound handling working together so that attention had somewhere to go.
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
    <div className="relative overflow-hidden rounded-[28px] border border-hairline bg-surface-1/40 px-7 py-8 flex flex-col items-center text-center hover:border-hairline-strong transition-colors">
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-4 -right-2 font-display font-black leading-none opacity-[0.06]"
        style={{ fontSize: 'clamp(70px, 9vw, 110px)', color: ACCENT }}
      >
        {pillar.number}
      </span>

      <div
        className="relative h-12 w-12 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(213,255,64,0.12)', border: '1px solid rgba(213,255,64,0.28)' }}
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
    </div>
  )
}

function IconEducate({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 4l9 4.5-9 4.5-9-4.5L12 4z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 10.7v4.6c0 1.5 2.5 3.2 5.5 3.2s5.5-1.7 5.5-3.2v-4.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconDemonstrate({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="13" rx="2" stroke={color} strokeWidth="1.6" />
      <path d="M8 21h8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.5 9.5l3 2-3 2v-4z" fill={color} />
    </svg>
  )
}
function IconLocalize({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.4 2.5 3.6 5.6 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.6-3.6-9S9.6 5.5 12 3z" stroke={color} strokeWidth="1.4" />
    </svg>
  )
}
function IconConvert({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 5h13l3 3.5-3 3.5H4" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M20 15H7l-3 3.5 3 3.5h13" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
