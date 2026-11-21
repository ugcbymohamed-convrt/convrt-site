import Logo from './Logo.jsx'
import CookieSettingsLink from './CookieSettingsLink.jsx'
import { SERVICE_LABELS } from '../seo/businessKnowledge.js'
import { CONTACT_EMAIL, REFERRALS_PATH, CREATOR_SHOWCASE_PATH, ABOUT_PATH, CONTACT_PATH, PRIVACY_PATH, TERMS_PATH, LEGAL_NOTICE_PATH, TRUST_PAGES_PUBLISHED, COMPANY_LINKEDIN_URL, INSTAGRAM_URL } from '../config.js'

export default function Footer() {
  const year = new Date().getFullYear()
  const onHome = typeof window !== 'undefined' ? window.location.pathname === '/' : true
  const homePrefix = onHome ? '' : '/'
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-5 max-w-sm text-sm text-ink-muted leading-relaxed">
              A performance creative studio building UGC ads, spokesperson videos, organic
              social content, and creative strategy for brands that want content with one
              purpose: conversion.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Studio
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><a className="hover:text-ink transition-colors" href={`${homePrefix}#services`}>Services</a></li>
              <li><a className="hover:text-ink transition-colors" href="/ugc-video-agency">UGC Video Agency</a></li>
              <li><a className="hover:text-ink transition-colors" href="/spokesperson-video-production">Spokesperson Videos</a></li>
              <li><a className="hover:text-ink transition-colors" href="/social-media-video-production">{SERVICE_LABELS.organic}</a></li>
              <li><a className="hover:text-ink transition-colors" href="/saas-video-production">SaaS Video Production</a></li>
              <li><a className="hover:text-ink transition-colors" href={CREATOR_SHOWCASE_PATH}>Creator Showcase</a></li>
              <li><a className="hover:text-ink transition-colors" href="/case-studies">Case Studies</a></li>
              <li><a className="hover:text-ink transition-colors" href="/pricing">Pricing</a></li>
              {TRUST_PAGES_PUBLISHED && <li><a className="hover:text-ink transition-colors" href={ABOUT_PATH}>About</a></li>}
              <li><a className="hover:text-ink transition-colors" href="/blog">Blog</a></li>
              <li><a className="hover:text-ink transition-colors" href={`${homePrefix}#how-it-works`}>How It Works</a></li>
              <li><a className="hover:text-ink transition-colors" href={`${homePrefix}#clients`}>Clients</a></li>
              <li><a className="hover:text-ink transition-colors" href={REFERRALS_PATH}>Referral Program</a></li>
              <li><a className="hover:text-ink transition-colors" href={TRUST_PAGES_PUBLISHED ? CONTACT_PATH : `${homePrefix}#contact`}>Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Get in touch
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li>
                <a className="hover:text-ink transition-colors" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex gap-3 pt-2">
                <Social href={COMPANY_LINKEDIN_URL} label="CONVRT on LinkedIn">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <path d="M6 8.5V14M6 6.5v.01M9 14v-3a2 2 0 014 0v3M9 14V8.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </Social>
                <Social href={INSTAGRAM_URL} label="CONVRT on Instagram">
                  <rect x="3" y="3" width="14" height="14" rx="4.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <circle cx="14.2" cy="5.8" r="0.9" fill="currentColor" />
                </Social>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-subtle">
          <p suppressHydrationWarning>© {year} CONVRT Studio. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={PRIVACY_PATH}>Privacy Policy</a>}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={TERMS_PATH}>Terms</a>}
            {TRUST_PAGES_PUBLISHED && <a className="underline-offset-4 transition-colors hover:text-ink hover:underline" href={LEGAL_NOTICE_PATH}>Legal Notice</a>}
            <CookieSettingsLink />
            <span>Built to convert.</span>
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
