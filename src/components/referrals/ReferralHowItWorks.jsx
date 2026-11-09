import { Reveal, SectionHeader } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   HOW IT WORKS — three steps joined by a connector: horizontal on md+, vertical on
   small screens. Pure markup + CSS, no animation beyond the shared scroll reveal.
───────────────────────────────────────────── */

const STEPS = [
  {
    title: 'Make an Introduction',
    text: 'Tell us about a brand or business that could benefit from CONVRT’s video production services.',
  },
  {
    title: 'We Take It From There',
    text: 'Our team reviews the introduction, connects with the brand when appropriate, and explores whether we’re a good fit.',
  },
  {
    title: 'Get Rewarded',
    text: 'When your qualified referral becomes a paying client and meets the program conditions, you receive your reward.',
  },
]

export default function ReferralHowItWorks() {
  return (
    <section
      id="how-it-works"
      tabIndex={-1}
      aria-labelledby="how-heading"
      className="relative scroll-mt-20 py-16 outline-none md:scroll-mt-24 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="how-heading" eyebrow="How it works" title="Simple for you. Handled by us.">
            Three steps, and most of the work is ours.
          </SectionHeader>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1
            return (
              <li key={step.title} className={`relative ${last ? '' : 'pb-10 md:pb-0'}`}>
                <Reveal delay={i * 110}>
                  <div className="flex items-start gap-5 md:block">
                    <span
                      className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border font-display text-xl font-bold tabular-nums ${
                        last ? 'border-magenta/50 bg-magenta/10 text-magenta' : 'border-lime/50 bg-lime/10 text-lime'
                      }`}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 md:mt-6">
                      <h3 className="font-display text-xl font-bold tracking-snug text-ink">
                        <span className="sr-only">Step {i + 1}: </span>
                        {step.title}
                      </h3>
                      <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">{step.text}</p>
                    </div>
                  </div>
                </Reveal>

                {!last && (
                  <>
                    {/* mobile: vertical connector between the number tiles */}
                    <span aria-hidden="true" className="absolute left-7 top-16 bottom-2 w-px -translate-x-1/2 border-l border-dashed border-hairline-strong md:hidden" />
                    {/* md+: horizontal connector into the next column */}
                    <span aria-hidden="true" className="absolute left-[72px] top-7 hidden h-px border-t border-dashed border-hairline-strong md:block md:-right-6" />
                  </>
                )}
              </li>
            )
          })}
        </ol>

        <Reveal delay={200}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-ink-muted">
            Not every introduction becomes a client, and that’s fine. We’ll only reach out when it makes sense for the brand.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
