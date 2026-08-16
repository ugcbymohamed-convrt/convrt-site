import { BOOKING_URL } from '../config.js'

export default function CreativeTestingNextStep({ service }) {
  const isPaid = service === 'paid'

  return (
    <section id="contact" className="relative overflow-hidden py-20 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.08) 0%, transparent 60%)' }}
      />

      <div key={service} className="pricing-panel-in relative mx-auto max-w-3xl px-5 md:px-8 text-center">
        <h2
          className="font-display font-bold tracking-display leading-[1.05] mb-6"
          style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
        >
          {isPaid ? (
            <>
              <span className="text-ink">Start with a sprint. </span>
              <span className="text-lime">Scale what works.</span>
            </>
          ) : (
            <>
              <span className="text-ink">Build a social presence </span>
              <span className="text-lime">people actually want to follow.</span>
            </>
          )}
        </h2>

        <p className="text-ink-muted leading-relaxed mx-auto mb-10 max-w-xl">
          {isPaid
            ? 'The Creative Testing Sprint runs as a monthly engagement, giving you a continuous stream of new concepts, scripts, and test-ready ads. As winning directions emerge, CONVRT scales production to match, with more concepts, more variations, and more testing depth.'
            : 'Start with a consistent content system. Learn what earns attention, then build around what works.'}
        </p>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-gradient group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-canvas"
        >
          Book a Creative Call
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none">
            <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
