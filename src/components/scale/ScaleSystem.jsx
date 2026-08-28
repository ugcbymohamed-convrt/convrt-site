import { useEffect, useRef, useState } from 'react'
import DiscoveryCallButton from './DiscoveryCallButton.jsx'

/* ─────────────────────────────────────────────
   Replaces the two earlier sections (CONVRT Approach + "From first
   call to first creative test") with one. Each step now carries both
   how CONVRT thinks about performance creative AND what actually
   happens at that stage of the engagement, so nothing is repeated
   twice in different words further down the page.

   Step 04 explicitly attributes launching creative to the client's
   own media team — CONVRT doesn't run media buying, so the copy
   never implies otherwise.
───────────────────────────────────────────── */

const STEPS = [
  {
    number: '01',
    title: 'Understand',
    description: 'Your business, audience, current creative and what’s already working, covered on the discovery call.',
  },
  {
    number: '02',
    title: 'Hypothesise',
    description: 'We identify distinct angles, hooks and concepts genuinely worth testing, not variations on one idea.',
  },
  {
    number: '03',
    title: 'Create',
    description: 'Scripts, creators and executions are developed and produced around those hypotheses.',
  },
  {
    number: '04',
    title: 'Test & Learn',
    description: 'Your media team launches the creative. Performance signals show us what deserves another iteration.',
  },
  {
    number: '05',
    title: 'Scale the Signal',
    description: 'What the market responded to becomes new hooks, concepts and executions, and the cycle repeats.',
  },
]

export default function ScaleSystem() {
  const [activeStep, setActiveStep] = useState(-1)
  const [headerVisible, setHeaderVisible] = useState(false)
  const stepRefs = useRef([])
  const headerRef = useRef(null)

  useEffect(() => {
    const hObs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeaderVisible(true) }, { threshold: 0.3 })
    if (headerRef.current) hObs.observe(headerRef.current)

    const sObs = STEPS.map((_, i) => {
      const el = stepRefs.current[i]
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep((prev) => Math.max(prev, i)) },
        { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
      )
      obs.observe(el)
      return obs
    })

    return () => {
      hObs.disconnect()
      sObs.forEach((o) => o?.disconnect())
    }
  }, [])

  return (
    <section id="system" className="relative py-14 md:py-20">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div
          ref={headerRef}
          className="max-w-2xl mx-auto text-center mb-14 md:mb-18"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">The System</span>
            <span className="h-px w-8 bg-lime" />
          </div>
          <h2 className="text-balance font-display font-bold text-ink tracking-display leading-[1.1] text-3xl md:text-[42px]">
            A creative system built for testing.
          </h2>
        </div>

        <div className="relative">
          {STEPS.map((step, i) => {
            const active = i <= activeStep
            const isLast = i === STEPS.length - 1
            return (
              <div key={step.number} ref={(el) => (stepRefs.current[i] = el)} className="flex gap-6 md:gap-8">
                <div className="flex flex-col items-center shrink-0 w-8">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold"
                    style={{
                      borderColor: active ? '#d5ff40' : '#34343a',
                      background: active ? '#d5ff40' : '#131316',
                      color: active ? '#0a0a0b' : '#71717a',
                      transition: 'border-color 0.5s ease, background 0.5s ease, color 0.5s ease',
                    }}
                  >
                    {step.number}
                  </div>
                  {!isLast && (
                    <div className="relative w-[2px] flex-1 mt-2">
                      <div className="absolute inset-0 rounded-full bg-hairline" />
                      <div
                        className="absolute inset-x-0 top-0 rounded-full bg-lime"
                        style={{ height: active ? '100%' : '0%', transition: 'height 0.9s 0.15s cubic-bezier(0.22,1,0.36,1)' }}
                      />
                    </div>
                  )}
                </div>

                <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-10 md:pb-12'}`}>
                  <h3
                    className="font-display font-bold tracking-display leading-tight text-xl md:text-2xl"
                    style={{ color: active ? '#fafafa' : '#52525b', opacity: active ? 1 : 0.5, transition: 'opacity 0.5s ease, color 0.5s ease' }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mt-2 text-[14.5px] leading-relaxed max-w-md"
                    style={{ color: active ? '#a1a1aa' : '#3f3f46', transition: 'color 0.5s ease' }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div
          className="mt-4 md:mt-6 text-center"
          style={{
            opacity: activeStep >= STEPS.length - 1 ? 1 : 0,
            transform: activeStep >= STEPS.length - 1 ? 'none' : 'translateY(12px)',
            transition: 'opacity 0.6s 0.1s ease, transform 0.6s 0.1s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <DiscoveryCallButton location="system" />
        </div>
      </div>
    </section>
  )
}
