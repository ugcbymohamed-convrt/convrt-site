import { useEffect, useRef, useState } from 'react'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'

export default function ScaleFinalCTA() {
  const sectionRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true) }, { threshold: 0.2 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.09) 0%, transparent 60%)' }}
      />

      <div className="relative mx-auto max-w-3xl px-5 md:px-8 text-center">
        <FadeUp inView={inView} delay={0}>
          <h2 className="text-balance font-display font-bold tracking-display leading-[1.12] text-[clamp(2rem,5vw,3.4rem)]">
            <span className="text-ink">Your next scalable creative starts with a </span>
            <span className="text-lime">better idea.</span>
          </h2>
        </FadeUp>

        <FadeUp inView={inView} delay={120}>
          <p className="mt-6 text-base md:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Book a discovery call and let's see whether CONVRT can help build the creative system
            behind your next stage of growth.
          </p>
        </FadeUp>

        <FadeUp inView={inView} delay={220}>
          <div className="mt-9">
            <DiscoveryCallButton location="final_cta" size="lg" />
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

function FadeUp({ children, inView, delay = 0 }) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
