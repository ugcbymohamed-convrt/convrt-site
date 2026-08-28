import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { BOOKING_URL } from '../config.js'
import { openBookingModal } from '../lib/bookingModal.js'

const links = [
  { label: 'Services', href: '#services' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Clients', href: '#clients' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const onHome = typeof window !== 'undefined' ? window.location.pathname === '/' : true
  const homePrefix = onHome ? '' : '/'
  const resolveHref = (href) => (href.startsWith('#') ? `${homePrefix}${href}` : href)

  // /scale is a paid-acquisition page with its own in-page booking modal
  // and consistent "Book a Discovery Call" CTA copy — everywhere else the
  // header keeps its normal "Book a Creative Call" link straight to Calendly.
  const onScalePage = typeof window !== 'undefined' ? window.location.pathname === '/scale' : false
  const ctaLabel = onScalePage ? 'Book a Discovery Call' : 'Book a Creative Call'
  const handleCtaClick = onScalePage
    ? (e) => { e.preventDefault(); setOpen(false); openBookingModal({ location: 'nav' }) }
    : () => setOpen(false)

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

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={resolveHref(l.href)}
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={BOOKING_URL} target={onScalePage ? undefined : '_blank'} rel={onScalePage ? undefined : 'noopener noreferrer'}
            onClick={handleCtaClick}
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-transform duration-150 active:scale-[0.98] hover:bg-white"
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
            <a
              href={BOOKING_URL} target={onScalePage ? undefined : '_blank'} rel={onScalePage ? undefined : 'noopener noreferrer'}
              onClick={handleCtaClick}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-3 text-sm font-medium text-canvas"
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
