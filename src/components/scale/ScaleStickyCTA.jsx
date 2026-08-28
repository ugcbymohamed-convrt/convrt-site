import { useEffect, useState } from 'react'
import { openBookingModal } from '../../lib/bookingModal.js'
import { trackEvent } from '../../lib/analytics.js'

/* Mobile-only sticky bottom CTA. Appears once the visitor has scrolled
   past the hero, and hides again once the booking section or footer
   is already on screen. */
export default function ScaleStickyCTA() {
  const [pastHero, setPastHero] = useState(false)
  const [nearBottom, setNearBottom] = useState(false)
  const [bookingVisible, setBookingVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > window.innerHeight * 0.85)
      setNearBottom(window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 640)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const el = document.getElementById('book')
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setBookingVisible(entry.isIntersecting), { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const show = pastHero && !bookingVisible && !nearBottom

  const handleClick = () => {
    trackEvent('primary_cta_click', { page: 'scale', location: 'sticky_mobile' })
    openBookingModal({ location: 'sticky_mobile' })
  }

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-6"
      style={{
        transform: show ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        background: 'linear-gradient(to top, rgba(10,10,11,0.98) 55%, rgba(10,10,11,0) 100%)',
      }}
      aria-hidden={!show}
    >
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        onClick={handleClick}
        className="cta-gradient flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-canvas shadow-[0_20px_50px_-15px_rgba(213,255,64,0.5)]"
      >
        Book a Discovery Call
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none">
          <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
