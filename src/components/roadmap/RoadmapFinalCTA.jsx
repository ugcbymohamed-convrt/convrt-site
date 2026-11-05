import { Reveal, Eyebrow, ApplyButton } from './shared.jsx'

export default function RoadmapFinalCTA() {
  return (
    <section aria-labelledby="final-cta-heading" className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.09) 0%, transparent 62%)' }}
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <Eyebrow>Free Creative Roadmap</Eyebrow>
          <h2
            id="final-cta-heading"
            className="mt-7 font-display font-bold leading-[1.05] tracking-display text-ink"
            style={{ fontSize: 'clamp(2.1rem, 6vw, 4.25rem)' }}
          >
            Your Next Great Ad Starts With a <span className="text-lime">Better Idea.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Get five creative concepts tailored to your brand and discover new directions for your video advertising.
          </p>
          <div className="mt-9 flex flex-col items-stretch sm:items-center">
            <ApplyButton location="final_cta" className="w-full sm:w-auto" />
          </div>
          <p className="mt-5 text-sm text-ink-subtle">For qualifying brands. No obligation.</p>
        </Reveal>
      </div>
    </section>
  )
}
