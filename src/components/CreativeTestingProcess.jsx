const PAID_HEADING = 'From research to test-ready creative.'

const PAID_STEPS = [
  {
    number: '01',
    title: 'Research',
    description:
      'We study the product, audience, current ads, competitors, and creative opportunities.',
  },
  {
    number: '02',
    title: 'Concepts',
    description: 'CONVRT develops genuinely different creative directions, not minor variations.',
  },
  {
    number: '03',
    title: 'Approval and production',
    description: 'Your team approves the scripts before creators, filming, and editing begin.',
  },
  {
    number: '04',
    title: 'Delivery and testing',
    description:
      'You receive organized, platform-ready assets with clear testing recommendations.',
  },
]

const ORGANIC_HEADING = 'From strategy to published content.'

const ORGANIC_STEPS = [
  {
    number: '01',
    title: 'Research',
    description:
      'Understand the brand, audience, category, competitors, and the content already earning attention.',
  },
  {
    number: '02',
    title: 'Content Strategy',
    description: 'Build the monthly content direction, concepts, formats, hooks, and creative angles.',
  },
  {
    number: '03',
    title: 'Production',
    description: 'Script, shoot, and edit the agreed content within the monthly production scope.',
  },
  {
    number: '04',
    title: 'Publishing & Optimization',
    description:
      'Adapt and publish across the selected platforms, then review performance to improve what comes next.',
  },
]

export default function CreativeTestingProcess({ service }) {
  const heading = service === 'paid' ? PAID_HEADING : ORGANIC_HEADING
  const steps = service === 'paid' ? PAID_STEPS : ORGANIC_STEPS

  return (
    <section className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="text-center font-display font-bold text-ink tracking-display leading-[1.05] text-2xl md:text-[32px] mb-10 md:mb-14">
          {heading}
        </h2>

        <div key={service} className="pricing-panel-in flex flex-col md:flex-row gap-8 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex-1 md:px-6">
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute left-0 top-4 h-px w-6 -translate-x-full bg-hairline-strong"
                />
              )}
              <span className="font-display font-bold text-lime text-sm tracking-[0.08em]">
                {step.number}
              </span>
              <h3 className="mt-3 font-display font-semibold text-ink text-lg leading-snug">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
