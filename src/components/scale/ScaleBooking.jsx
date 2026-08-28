import { useInView } from '../caseStudies/shared/useInView.js'
import { CONTACT_EMAIL } from '../../config.js'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'

/* The old permanently-visible white Calendly iframe broke the dark,
   premium feel while people were just scrolling through the story.
   This is now a strong CTA panel — the actual calendar only appears
   in BookingModal.jsx once someone clicks. */
export default function ScaleBooking() {
  const [ref, visible] = useInView(0.15)

  return (
    <section id="book" className="relative py-16 md:py-24 scroll-mt-24 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[900px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.07) 0%, transparent 60%)' }}
      />

      <div ref={ref} className="relative mx-auto max-w-2xl px-5 md:px-8 text-center">
        <FadeUp show={visible} delay={0}>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.1] text-3xl md:text-[46px]">
            What's limiting your creative growth?
          </h2>
        </FadeUp>

        <FadeUp show={visible} delay={100}>
          <p className="mt-5 text-base md:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            We'll look at where you are now, what you're currently testing, and whether CONVRT is
            the right creative partner to help you scale.
          </p>
        </FadeUp>

        <FadeUp show={visible} delay={180}>
          <div className="mt-9">
            <DiscoveryCallButton location="booking_section" size="lg" />
          </div>
          <p className="mt-4 text-[13px] text-ink-subtle">
            No hard sell. We'll first determine whether there's actually a fit.
          </p>
        </FadeUp>

        <FadeUp show={visible} delay={240}>
          <p className="mt-6 text-[12.5px] text-ink-subtle">
            Prefer email?{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink-muted underline decoration-hairline underline-offset-4 hover:text-lime hover:decoration-lime transition-colors">
              {CONTACT_EMAIL}
            </a>
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

function FadeUp({ children, show, delay = 0, className = '' }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
