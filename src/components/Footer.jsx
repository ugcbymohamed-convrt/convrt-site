import Logo from './Logo.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import { parsePath, localizedPath } from '../i18n/paths.js'
import { translate, localHref, isFallbackPath } from '../i18n/tr.js'
import { editorial } from '../i18n/editorial.js'
import CookieSettingsLink from './CookieSettingsLink.jsx'
import { CONTACT_EMAIL, REFERRALS_PATH, CREATOR_SHOWCASE_PATH, ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH, TRUST_PAGES_PUBLISHED, COMPANY_LINKEDIN_URL, INSTAGRAM_URL } from '../config.js'

export default function Footer() {
  const year = new Date().getFullYear()
  const { locale, basePath } = parsePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  const tr = (t) => translate(locale, t)
  const h = (p) => localHref(p, locale)
  // A link to a page that exists only in English says so (French: « (en anglais) ») and declares the language of its target.
  const note = editorial(locale)?.fallbackNote
  const fb = (p) => Boolean(note) && isFallbackPath(p, locale)
  const L = (p, label, extra = '') => <a className="hover:text-ink transition-colors" href={h(p)} {...(fb(p) ? { hrefLang: 'en' } : {})}>{tr(label)}{fb(p) ? ` (${note})` : ''}{extra}</a>
  const en = locale === 'en'
  const onHome = basePath === '/'
  const homePrefix = onHome ? '' : localizedPath(locale, '/')
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-6">
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
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              {tr('Studio')}
            </p>
            {/* The Studio menu mirrors the top menu in EVERY language (owner, Nov 2026): the same links in the same order, nothing else; the individual service pages are linked from the Services dropdown in the
                top bar on every page. English and French: Services, Creator Showcase, Case Studies, Pricing, Blog, Contact, Refer & Earn. Spanish lists what its own top menu lists. */}
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><a className="hover:text-ink transition-colors" href={`${homePrefix}#services`}>{tr('Services')}</a></li>
              <li><a className="hover:text-ink transition-colors" href={h(CREATOR_SHOWCASE_PATH)}>{tr('Creator Showcase')}</a></li>
              {(en || locale === 'fr') && <li>{en ? <a className="hover:text-ink transition-colors" href="/case-studies">Case Studies</a> : L('/case-studies', 'Case Studies')}</li>}
              {!(en || locale === 'fr') && <li><a className="hover:text-ink transition-colors" href={`${homePrefix}#how-it-works`}>{tr('How It Works')}</a></li>}
              <li><a className="hover:text-ink transition-colors" href={h('/pricing')}>{tr('Pricing')}</a></li>
              {(en || locale === 'fr') && <li>{en ? <a className="hover:text-ink transition-colors" href="/blog">Blog</a> : L('/blog', 'Blog')}</li>}
              <li>{TRUST_PAGES_PUBLISHED ? L(CONTACT_PATH, 'Contact') : <a className="hover:text-ink transition-colors" href={`${homePrefix}#contact`}>{tr('Contact')}</a>}</li>
              {locale !== 'ar' && <li>{en ? <a className="hover:text-ink transition-colors" href={REFERRALS_PATH}>Refer &amp; Earn</a> : <a className="hover:text-ink transition-colors" href={h(REFERRALS_PATH)}>{tr('Refer & Earn')}</a>}</li>}
            </ul>
          </div>

          <div className="md:col-span-3">
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

        <div className="mt-12 pt-6 border-t border-hairline flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-subtle">
          <p suppressHydrationWarning>© {year} CONVRT Studio. {tr('All rights reserved.')}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {/* The legal documents exist only in English (approved text). From other languages the links say so and are marked lang="en"; a reviewed translation is
                prepared in docs/multilingual-legal-translation-review.md and is NOT published. */}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={h(ABOUT_PATH)} {...(fb(ABOUT_PATH) ? { hrefLang: 'en' } : {})}>{tr('About')}{fb(ABOUT_PATH) ? ` (${note})` : ''}</a>}
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
