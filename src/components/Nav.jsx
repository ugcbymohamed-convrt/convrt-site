import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { BOOKING_URL, OFFER_PATHS, REFERRALS_PATH } from '../config.js'
import { openBookingModal } from '../lib/bookingModal.js'
import { trackEvent } from '../lib/analytics.js'
import { scrollToApply } from '../lib/roadmapForm.js'
import { usePressFeedback } from '../lib/usePressFeedback.js'

// `compactHide`: shown in the desktop bar only from xl (1280px) up, so the bar doesn't crowd
// at 1024–1279px now that Blog (and the referral link) have joined it. They are still in the
// mobile menu, the footer, and the hero/CTA buttons — nothing is removed.
const links = [
  { label: 'Services', href: '#services' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Clients', href: '#clients', compactHide: true },
  { label: 'Contact', href: '#contact', compactHide: true },
]

/* "Refer & Earn": one link to the referral program. The label names no figure on purpose:
   Standard referrals earn $150 and Agency & Strategic partners 10% (capped at $500), and the
   destination page shows both rewards side by side straight away. The whole label is a
   single link. */
function ReferralNavLink({ onClick, className = '', underline = false }) {
  return (
    <a
      href={REFERRALS_PATH}
      onClick={() => {
        trackEvent('referral_cta_click', { location: 'nav' })
        onClick?.()
      }}
      className={`group relative whitespace-nowrap rounded text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      Refer &amp; <span className="font-semibold text-lime">Earn</span>
      {underline && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-px w-0 bg-lime transition-[width] duration-300 group-hover:w-full group-focus-visible:w-full motion-reduce:transition-none"
        />
      )}
    </a>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pressDesktop = usePressFeedback()
  const pressMobile = usePressFeedback()
  const onHome = typeof window !== 'undefined' ? window.location.pathname === '/' : true
  const homePrefix = onHome ? '' : '/'
  const resolveHref = (href) => (href.startsWith('#') ? `${homePrefix}${href}` : href)

  // /scale is a paid-acquisition page with its own in-page booking modal
  // and consistent "Book a Discovery Call" CTA copy. Everywhere else the
  // header promotes the primary offer (Creative Growth Roadmap); direct
  // booking stays available in the page-level CTAs.
  const onScalePage = typeof window !== 'undefined' ? window.location.pathname === '/scale' : false
  // On the roadmap landing page itself, the CTA scrolls to the application form
  // instead of reloading the page it's already on.
  const onRoadmapPage =
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') === OFFER_PATHS.roadmap : false
  const ctaLabel = onScalePage ? 'Book a Discovery Call' : 'Get 5 Free Ad Concepts'
  const ctaHref = onScalePage ? BOOKING_URL : onRoadmapPage ? '#apply' : OFFER_PATHS.roadmap
  const handleCtaClick = onScalePage
    ? (e) => { e.preventDefault(); setOpen(false); openBookingModal({ location: 'nav' }) }
    : onRoadmapPage
      ? (e) => { e.preventDefault(); setOpen(false); trackEvent('roadmap_apply_click', { location: 'nav' }); scrollToApply() }
      : () => { setOpen(false); trackEvent('hero_creative_roadmap_click', { location: 'nav' }) }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-canvas/95 backdrop-blur-xl border-b border-hairline/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:h-[96px] md:px-8">
        <Logo />

        <nav className="hidden lg:flex items-center gap-5 xl:gap-8" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={resolveHref(l.href)}
              className={`whitespace-nowrap text-[13px] text-ink-muted transition-colors hover:text-ink xl:text-sm ${
                l.compactHide ? 'hidden xl:inline' : ''
              }`}
            >
              {l.label}
            </a>
          ))}
          <ReferralNavLink underline className="text-[13px] xl:text-sm" />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={ctaHref}
            onClick={handleCtaClick}
            {...pressDesktop}
            className="nav-cta hidden md:inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-lime px-4 py-2.5 text-sm font-medium text-canvas"
          >
            {ctaLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {open ? (
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M2 5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M2 11H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-hairline bg-canvas">
          <div className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={resolveHref(l.href)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base text-ink-muted hover:text-ink hover:bg-surface-1"
              >
                {l.label}
              </a>
            ))}
            <ReferralNavLink onClick={() => setOpen(false)} className="block px-3 py-3 text-base hover:bg-surface-1" />
            <a
              href={ctaHref}
              onClick={handleCtaClick}
              {...pressMobile}
              className="nav-cta mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-lime px-4 py-3 text-sm font-medium text-canvas"
            >
              {ctaLabel}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

function ArrowUpRight({ className = '' }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" aria-hidden="true">
      <path
        d="M3 9L9 3M9 3H4M9 3V8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
