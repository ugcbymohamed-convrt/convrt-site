import Logo from './Logo.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import { parsePath, localizedPath } from '../i18n/paths.js'
import { translate, localHref } from '../i18n/tr.js'
import CookieSettingsLink from './CookieSettingsLink.jsx'
import { SERVICE_LABELS } from '../seo/businessKnowledge.js'
import { CONTACT_EMAIL, REFERRALS_PATH, CREATOR_SHOWCASE_PATH, ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH, TRUST_PAGES_PUBLISHED, COMPANY_LINKEDIN_URL, INSTAGRAM_URL } from '../config.js'

export default function Footer() {
  const year = new Date().getFullYear()
  const { locale, basePath } = parsePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  const tr = (t) => translate(locale, t)
  const h = (p) => localHref(p, locale)
  const en = locale === 'en'
  const onHome = basePath === '/'
  const homePrefix = onHome ? '' : localizedPath(locale, '/')
  /* The Studio menu mirrors the top menu (owner, Nov 2026): the same links in the same order, and nothing else. The individual service pages are linked from the Services menu in the top bar on every page; About
     moved to the bottom row beside the legal links. English: Services, Creator Showcase, Case Studies, Pricing, Blog, Contact, Refer & Earn. Other languages list only what their own top menu lists. */
  const STUDIO_LINKS = [
    { key: 'services', href: `${homePrefix}#services`, label: tr('Services') },
    { key: 'showcase', href: h(CREATOR_SHOWCASE_PATH), label: tr('Creator Showcase') },
    en && { key: 'case-studies', href: '/case-studies', label: 'Case Studies' },
    !en && { key: 'how', href: `${homePrefix}#how-it-works`, label: tr('How It Works') },
    { key: 'pricing', href: h('/pricing'), label: tr('Pricing') },
    en && { key: 'blog', href: '/blog', label: 'Blog' },
    { key: 'contact', href: TRUST_PAGES_PUBLISHED ? h(CONTACT_PATH) : `${homePrefix}#contact`, label: tr('Contact') },
    en && { key: 'referrals', href: REFERRALS_PATH, label: 'Refer & Earn' },
  ].filter(Boolean)
  const half = Math.ceil(STUDIO_LINKS.length / 2)
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
        {/* THREE EQUAL COLUMNS from md up. Left: the brand (logo, description, languages) with "Get in touch" under it. Right (two thirds): the Studio menu, one heading and the list split into two
            balanced columns, so the long list no longer runs down one tall column. Same links in the same order as before; on a phone everything stacks and the two list halves sit side by side. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm text-ink-muted leading-relaxed">
              {en ? (
                <>
                  A performance creative studio building UGC ads, spokesperson videos, organic
                  social content, and creative strategy for brands that want content with one
                  purpose: conversion.
                </>
              ) : tr('A performance creative studio building UGC ads, spokesperson videos, organic social content, and creative strategy for brands that want content with one purpose: conversion.')}
            </p>
            <LanguageSelector variant="inline" className="mt-5 text-sm text-ink-muted" />

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                {tr('Get in touch')}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                <li>
                  <a className="hover:text-ink transition-colors" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li className="flex gap-3 pt-2">
                  <Social href={COMPANY_LINKEDIN_URL} label={tr('CONVRT on LinkedIn')}>
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    <path d="M6 8.5V14M6 6.5v.01M9 14v-3a2 2 0 014 0v3M9 14V8.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  </Social>
                  <Social href={INSTAGRAM_URL} label={tr('CONVRT on Instagram')}>
                    <rect x="3" y="3" width="14" height="14" rx="4.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                    <circle cx="14.2" cy="5.8" r="0.9" fill="currentColor" />
                  </Social>
                </li>
              </ul>
            </div>
          </div>

          <nav aria-label={tr('Studio')} className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              {tr('Studio')}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-ink-muted md:gap-x-12 [&>ul]:space-y-2.5">
              <ul>
                {STUDIO_LINKS.slice(0, half).map((l) => <li key={l.key}><a className="hover:text-ink transition-colors" href={l.href}>{l.label}</a></li>)}
              </ul>
              <ul>
                {STUDIO_LINKS.slice(half).map((l) => <li key={l.key}><a className="hover:text-ink transition-colors" href={l.href}>{l.label}</a></li>)}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-subtle">
          <p suppressHydrationWarning>© {year} CONVRT Studio. {tr('All rights reserved.')}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {/* The legal documents exist only in English (approved text). From other languages the links say so and are marked lang="en"; a reviewed translation is
                prepared in docs/multilingual-legal-translation-review.md and is NOT published. */}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={h(ABOUT_PATH)}>{tr('About')}</a>}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={PRIVACY_PATH} {...(en ? {} : { lang: 'en' })}>{en ? 'Privacy Policy' : tr('Privacy Policy (in English)')}</a>}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={TERMS_PATH} {...(en ? {} : { lang: 'en' })}>{en ? 'Terms' : tr('Terms (in English)')}</a>}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={LEGAL_NOTICE_PATH} {...(en ? {} : { lang: 'en' })}>{en ? 'Legal Notice' : tr('Legal Notice (in English)')}</a>}
            <CookieSettingsLink />
            <span>{tr('Built to convert.')}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

function Social({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted hover:text-ink hover:border-hairline-strong transition-colors"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4">
        {children}
      </svg>
    </a>
  )
}
