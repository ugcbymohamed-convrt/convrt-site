import Logo from './Logo.jsx'
import { CONTACT_EMAIL } from '../config.js'

export default function Footer() {
  const year = new Date().getFullYear()
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
              <li><a className="hover:text-ink transition-colors" href="#services">Services</a></li>
              <li><a className="hover:text-ink transition-colors" href="#how-it-works">How It Works</a></li>
              <li><a className="hover:text-ink transition-colors" href="#clients">Clients</a></li>
              <li><a className="hover:text-ink transition-colors" href="#contact">Contact</a></li>
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
                <Social href="https://instagram.com/" label="Instagram">
                  <path d="M4 8a4 4 0 014-4h4a4 4 0 014 4v4a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <circle cx="14" cy="6" r="0.8" fill="currentColor" />
                </Social>
                <Social href="https://tiktok.com/" label="TikTok">
                  <path d="M11 3v8.5a2.5 2.5 0 11-2.5-2.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                  <path d="M11 3c.5 2 2 3.5 4 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </Social>
                <Social href="https://linkedin.com/" label="LinkedIn">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <path d="M6 8.5V14M6 6.5v.01M9 14v-3a2 2 0 014 0v3M9 14V8.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                </Social>
                <Social href="https://x.com/" label="X (Twitter)">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </Social>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-subtle">
          <p>© {year} CONVRT Studio. All rights reserved.</p>
          <p>Built to convert.</p>
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
