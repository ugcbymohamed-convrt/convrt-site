import { Reveal, SectionHeader } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   WHO CAN JOIN — six audience tiles + a note that referrals must be genuine,
   relevant business introductions (not lead lists).
───────────────────────────────────────────── */

const stroke = { stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

const AUDIENCE = [
  {
    title: 'Existing CONVRT clients',
    text: 'You’ve seen the work first-hand and know brands who’d benefit.',
    icon: <path d="M4 12.5l5 5L20 6.5" {...stroke} />,
  },
  {
    title: 'Marketing agencies',
    text: 'Your clients need video, and it isn’t what you produce in-house.',
    icon: (
      <>
        <rect x="3.5" y="4" width="17" height="12" rx="2.5" {...stroke} />
        <path d="M8 20h8M12 16v4" {...stroke} />
      </>
    ),
  },
  {
    title: 'Growth consultants',
    text: 'You advise brands on what to fix next in their paid social.',
    icon: <path d="M4 17l5-5 3.5 3.5L20 7m0 0h-5m5 0v5" {...stroke} />,
  },
  {
    title: 'UGC creators & video professionals',
    text: 'You work alongside brands that need more than you offer.',
    icon: (
      <>
        <rect x="3.5" y="6.5" width="12" height="11" rx="2.5" {...stroke} />
        <path d="M15.5 11l5-3v8l-5-3" {...stroke} />
      </>
    ),
  },
  {
    title: 'Founders & entrepreneurs',
    text: 'You’re plugged into other builders who’d use better video ads.',
    icon: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" {...stroke} />,
  },
  {
    title: 'Marketing professionals with relevant networks',
    text: 'The brands in your network are the ones we’re built for.',
    icon: (
      <>
        <circle cx="6" cy="7" r="2.5" {...stroke} />
        <circle cx="18" cy="7" r="2.5" {...stroke} />
        <circle cx="12" cy="17" r="2.5" {...stroke} />
        <path d="M8 8.7l3 6.3m5-6.3l-3 6.3M8.5 7h7" {...stroke} />
      </>
    ),
  },
]

export default function ReferralWhoCanJoin() {
  return (
    <section id="who-can-join" aria-labelledby="who-heading" className="relative scroll-mt-20 py-16 md:scroll-mt-24 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="who-heading" eyebrow="Who can join" title="If you know brands, you can refer them.">
            The program is built for people whose networks overlap with the brands we work with best.
          </SectionHeader>
        </Reveal>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {AUDIENCE.map((item, i) => (
            <li key={item.title} className="h-full">
              <Reveal delay={(i % 3) * 80} className="h-full">
                <div className="ref-card group h-full rounded-3xl border border-hairline bg-surface-1/70 p-6 hover:border-hairline-strong">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-hairline-strong bg-surface-2 text-lime transition-colors group-hover:border-lime/50 motion-reduce:transition-none">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">{item.icon}</svg>
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold leading-snug tracking-snug text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-magenta/25 bg-magenta/[0.05] px-6 py-5 text-center sm:px-8">
            <p className="text-[15px] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">Quality over quantity.</span> Referrals should be relevant, genuine
              business introductions, a brand you actually know that could benefit from better video ads, rather than
              unsolicited lead lists.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
