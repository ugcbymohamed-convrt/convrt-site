import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { BOOKING_URL, OFFER_PATHS, REFERRALS_PATH, CREATOR_SHOWCASE_PATH } from '../config.js'
import { openBookingModal } from '../lib/bookingModal.js'
import { trackEvent } from '../lib/analytics.js'
import { scrollToApply } from '../lib/roadmapForm.js'
import { usePressFeedback } from '../lib/usePressFeedback.js'
import LanguageSelector from './LanguageSelector.jsx'
import { parsePath, localizedPath } from '../i18n/paths.js'
import { translate, localHref } from '../i18n/tr.js'
import { REFERRAL_LABELS, SERVICE_MENU_LABELS, SERVICE_GROUP_LABELS, PAID_SOCIAL_HREFS, ORGANIC_SOCIAL_HREF, menuHas, serviceMenuFor, showReferralLink } from '../i18n/menu.js'
import { primaryAction } from '../i18n/cta.js'
import { SERVICE_LABELS } from '../seo/businessKnowledge.js'

// `compactHide`: shown in the desktop bar only from xl (1280px) up, so the bar doesn't crowd at 1024–1279px (it is still in the mobile menu, the footer and the hero/CTA buttons).
// `path`: the page the entry opens. A translated menu lists an entry only when that page exists in the language (src/i18n/menu.js), so no translated page links to an untranslated one;
// English lists everything. Same entries, same order, in every language.
const links = [
  { label: 'Services', href: '#services' },
  { label: 'Creator Showcase', href: CREATOR_SHOWCASE_PATH, path: CREATOR_SHOWCASE_PATH },
  // Arabic (owner, 2026-11-25): the menu is the English menu. Case Studies opens /ar/case-studies (both studies, switchable: Graspo and Elyon Dubai, since Nov 2026); Blog opens /ar/blog (its own page). `arShow`: always listed in Arabic.
  { label: 'Case Studies', href: '/case-studies', path: '/case-studies' },
  { label: 'Pricing', href: '/pricing', path: '/pricing' },
  { label: 'Blog', href: '/blog', path: '/blog', arShow: true },
  { label: 'Contact', href: '/contact', path: '/contact', compactHide: true },
]

/* The "Services" menu (owner, 2026-11-26): hovering (or keyboard-focusing) Services in the top bar opens a panel with TWO entries. "Paid Social" is a group: hovering or focusing it opens a second panel with
   UGC, Spokesperson and SaaS & App videos. "Organic Social" is a direct link. Both panels are ALWAYS in the page HTML (only hidden visually until hover or focus), so every service page stays linked from every
   page for search engines and keyboard users. In the mobile menu the same links are listed under Services (Paid Social as a heading with its three links, then Organic Social). Labels: src/i18n/menu.js. */
const SERVICE_MENU = [
  { label: 'UGC Videos', href: '/ugc-video-agency' },
  { label: 'Spokesperson Videos', href: '/spokesperson-video-production' },
  { label: SERVICE_LABELS.organic, href: '/social-media-video-production' },
  { label: 'SaaS & App Videos', href: '/saas-video-production' },
]

/* The Arabic services menu (owner, 2026-11-25): exactly these four labels, in this order. They are written out here (not routed through the dictionary) because they are the owner's own wording. */
const SERVICE_MENU_AR = [
  { label: 'فيديوهات UGC', href: '/ugc-video-agency' },
  { label: 'فيديوهات Spokesperson', href: '/spokesperson-video-production' },
  { label: 'فيديوهات برامج SaaS والتطبيقات', href: '/saas-video-production' },
  { label: 'فيديوهات عضوية للسوشل ميديا', href: '/social-media-video-production' },
]

/* "Refer & Earn": one link to the referral program. The label names no figure on purpose:
   Standard referrals earn $150 and Agency & Strategic partners 10% (capped at $500), and the
   destination page shows both rewards side by side straight away. The whole label is a
   single link. */
function ReferralNavLink({ onClick, className = '', underline = false, locale = 'en' }) {
  const [plain, accent] = REFERRAL_LABELS[locale] ?? REFERRAL_LABELS.en
  return (
    <a
      href={localHref(REFERRALS_PATH, locale)}
      onClick={() => {
        trackEvent('referral_cta_click', { location: 'nav' })
        onClick?.()
      }}
      className={`group relative whitespace-nowrap rounded text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${className}`}
    >
      {locale === 'ar' ? <>أحل عميلًا و<span className="font-semibold text-lime">اربح</span></> : locale === 'en' ? <>Refer &amp; <span className="font-semibold text-lime">Earn</span></> : <>{plain} <span className="font-semibold text-lime">{accent}</span></>}
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
  const { locale, basePath } = parsePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  const tr = (t) => translate(locale, t)
  const onHome = basePath === '/'
  const homePrefix = onHome ? '' : localHref('/', locale)
  const resolveHref = (href) => (href.startsWith('#') ? `${homePrefix}${href}` : localHref(href, locale))
  // One menu model (src/i18n/menu.js): a language lists an entry only when its page exists there. Arabic lists the English menu (owner, 2026-11-25): Case Studies opens the Arabic Graspo study, Blog opens /ar/blog.
  const visibleLinks = links.filter((l) => menuHas(locale, l.path) || (locale === 'ar' && l.arShow))
  const hrefOf = (l) => resolveHref(l.href)
  // The Services dropdown: Arabic has the owner's own four labels in this order; Spanish its short labels (menu.js); other languages the English order with dictionary labels.
  const serviceItems = locale === 'ar' ? SERVICE_MENU_AR : serviceMenuFor(locale, SERVICE_MENU)
  const serviceLabel = (m) => (locale === 'ar' ? m.label : SERVICE_MENU_LABELS[locale]?.[m.href] ?? tr(m.label))
  const groupLabels = SERVICE_GROUP_LABELS[locale] ?? SERVICE_GROUP_LABELS.en
  const paidItems = PAID_SOCIAL_HREFS.map((h) => serviceItems.find((m) => m.href === h)).filter(Boolean)
  const organicItem = serviceItems.find((m) => m.href === ORGANIC_SOCIAL_HREF)
  const action = primaryAction(locale)

  // /scale is a paid-acquisition page with its own in-page booking modal
  // and consistent "Book a Discovery Call" CTA copy. Everywhere else the
  // header promotes the primary offer (Creative Growth Roadmap); direct
  // booking stays available in the page-level CTAs.
  const onScalePage = locale === 'en' && typeof window !== 'undefined' ? window.location.pathname === '/scale' : false
  // On the roadmap landing page itself, the CTA scrolls to the application form
  // instead of reloading the page it's already on.
  const onRoadmapPage =
    typeof window !== 'undefined' ? basePath === OFFER_PATHS.roadmap : false
  // Translated pages: the primary action is the language's own flow (src/i18n/cta.js). Spanish: the discovery-call booking, in a new tab, until the Roadmap is translated.
  const localizedBooking = locale !== 'en' && action.kind === 'booking'
  const ctaLabel = onScalePage ? 'Book a Discovery Call' : tr(action.label)
  const ctaHref = onScalePage ? BOOKING_URL : onRoadmapPage ? '#apply' : action.href
  const handleCtaClick = onScalePage
    ? (e) => { e.preventDefault(); setOpen(false); openBookingModal({ location: 'nav' }) }
    : localizedBooking
      ? () => { setOpen(false); trackEvent(action.event, { page: locale, location: 'nav' }) }
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

        <nav className="hidden lg:flex items-center gap-3 min-[1100px]:gap-5 xl:gap-8" aria-label={tr('Primary')}>
          {visibleLinks.map((l) => (l.href === '#services' ? (
            <div
              key={l.href}
              className="group relative"
              onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.querySelector('a')?.blur() || document.activeElement?.blur?.() }}
            >
              <a
                href={hrefOf(l)}
                aria-haspopup="true"
                className="inline-flex items-center gap-1 whitespace-nowrap text-[13px] text-ink-muted transition-colors hover:text-ink group-focus-within:text-ink group-hover:text-ink xl:text-sm"
              >
                {tr(l.label)}
                <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180 motion-reduce:transition-none" fill="none" aria-hidden="true"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              {/* the panel starts right under the link (its top padding bridges the gap, so the pointer never leaves the menu); visibility only, so the links are always in the HTML */}
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 motion-reduce:transition-none">
                <ul className="min-w-[270px] rounded-2xl border border-white/10 bg-[rgba(12,12,14,0.96)] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                  <li className="group/sub relative">
                    <button
                      type="button"
                      aria-haspopup="true"
                      className="flex w-full items-center justify-between gap-6 whitespace-nowrap rounded-xl px-4 py-2.5 text-start text-sm text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink group-focus-within/sub:bg-white/[0.06] group-focus-within/sub:text-ink group-hover/sub:bg-white/[0.06] group-hover/sub:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime"
                    >
                      {groupLabels.paid}
                      <svg viewBox="0 0 10 10" className={`h-2.5 w-2.5 shrink-0 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" aria-hidden="true"><path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    {/* the second panel opens beside the first (its side padding bridges the gap); visibility only, so its three links are always in the HTML */}
                    <div className="invisible absolute left-full top-[-8px] z-50 pl-2 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within/sub:visible group-focus-within/sub:opacity-100 group-hover/sub:visible group-hover/sub:opacity-100 motion-reduce:transition-none">
                      <ul className="min-w-[230px] rounded-2xl border border-white/10 bg-[rgba(12,12,14,0.96)] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                        {paidItems.map((m) => (
                          <li key={m.href}>
                            <a href={localHref(m.href, locale)} className="block whitespace-nowrap rounded-xl px-4 py-2.5 text-sm text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink focus-visible:bg-white/[0.06] focus-visible:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">{serviceLabel(m)}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                  {organicItem && (
                    <li>
                      <a href={localHref(organicItem.href, locale)} className="block rounded-xl px-4 py-2.5 text-sm text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink focus-visible:bg-white/[0.06] focus-visible:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime">{groupLabels.organic}</a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <a
              key={l.href}
              href={hrefOf(l)}
              className={`whitespace-nowrap text-[13px] text-ink-muted transition-colors hover:text-ink xl:text-sm ${
                l.compactHide ? 'hidden xl:inline' : ''
              }`}
            >
              {tr(l.label)}
            </a>
          )))}
          {(locale === 'ar' || showReferralLink(locale)) && <ReferralNavLink locale={locale} underline className="text-[13px] xl:text-sm" />}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <a
            href={ctaHref}
            onClick={handleCtaClick}
            {...(localizedBooking ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...pressDesktop}
            className="nav-cta hidden md:inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-lime px-4 py-2.5 text-sm font-medium text-canvas"
          >
            {ctaLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={tr('Toggle menu')}
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
            {visibleLinks.map((l) => (
              <div key={l.href} className="flex flex-col">
                <a
                  href={hrefOf(l)}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-ink-muted hover:text-ink hover:bg-surface-1"
                >
                  {tr(l.label)}
                </a>
                {l.href === '#services' && (
                  <ul className="mb-1 ml-5 border-l border-hairline pl-2">
                    <li>
                      <span className="block px-3 pb-1 pt-2.5 text-[15px] font-medium text-ink">{groupLabels.paid}</span>
                      <ul className="ml-3 border-l border-hairline pl-2">
                        {paidItems.map((m) => (
                          <li key={m.href}>
                            <a href={localHref(m.href, locale)} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] text-ink-muted hover:text-ink hover:bg-surface-1">{serviceLabel(m)}</a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    {organicItem && (
                      <li>
                        <a href={localHref(organicItem.href, locale)} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-surface-1">{groupLabels.organic}</a>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ))}
            {(locale === 'ar' || showReferralLink(locale)) && <ReferralNavLink locale={locale} onClick={() => setOpen(false)} className="block px-3 py-3 text-base hover:bg-surface-1" />}
            <LanguageSelector variant="list" onNavigate={() => setOpen(false)} className="mt-1 border-t border-hairline pt-1" />
            <a
              href={ctaHref}
              onClick={handleCtaClick}
              {...(localizedBooking ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
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
