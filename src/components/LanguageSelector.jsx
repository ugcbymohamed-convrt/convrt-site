import { useEffect, useRef, useState } from 'react'
import { currentLocale } from '../i18n/locale.js'
import { parsePath } from '../i18n/paths.js'
import { languageOptions } from '../i18n/switch.js'
import { LOCALES } from '../i18n/locales.js'
import { translate } from '../i18n/tr.js'

/* Language selector. Every option is a plain link to a page that exists in that language (src/i18n/switch.js), so it works with JavaScript off, in the
   prerendered HTML and for crawlers. It never redirects by itself and never reads the browser language or the visitor's location.

   • variant "dropdown" (desktop header, and the compact button next to the mobile menu): a disclosure button with a popover list.
   • variant "list" (inside the mobile menu): the same links shown directly, as large touch targets.
   Only LIVE languages are listed; with a single live language (English only) the component renders nothing. */

const GlobeIcon = ({ className = '' }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.8 10h14.4M10 2.8c2 2.1 3 4.5 3 7.2s-1 5.1-3 7.2c-2-2.1-3-4.5-3-7.2s1-5.1 3-7.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

function useLanguageState() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const { locale, basePath } = parsePath(pathname)
  return { locale, options: languageOptions(locale, basePath) }
}

export default function LanguageSelector({ variant = 'dropdown', className = '', onNavigate }) {
  const { locale, options } = useLanguageState()
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const button = useRef(null)
  const label = translate(locale, 'Language')

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus() } }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (options.length < 2) return null

  const links = (itemClass) => options.map((o) => (
    <li key={o.code}>
      <a
        href={o.href}
        lang={o.htmlLang}
        hrefLang={o.htmlLang}
        dir={o.dir}
        aria-current={o.current ? 'true' : undefined}
        onClick={() => { setOpen(false); onNavigate?.() }}
        className={`${itemClass} ${o.current ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'}`}
      >
        <span>{o.label}</span>
        {o.current && (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-lime" fill="none" aria-hidden="true">
            <path d="M2.5 6.4l2.3 2.3L9.5 3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </a>
    </li>
  ))

  if (variant === 'inline') {
    return (
      <nav aria-label={label} className={className}>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {options.map((o) => (
            <li key={o.code}>
              <a
                href={o.href}
                lang={o.htmlLang}
                hrefLang={o.htmlLang}
                dir={o.dir}
                aria-current={o.current ? 'true' : undefined}
                className={`underline-offset-4 transition-colors hover:text-ink hover:underline ${o.current ? 'text-ink' : ''}`}
              >
                {o.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  if (variant === 'list') {
    return (
      <nav aria-label={label} className={className}>
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">{label}</p>
        <ul className="flex flex-col">{links('flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-base hover:bg-surface-1')}</ul>
      </nav>
    )
  }

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="language-menu"
        aria-label={label}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline px-3 lg:max-xl:px-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      >
        <GlobeIcon className="h-4 w-4" />
        {/* Between lg and xl the header is full (links + CTA): the button shrinks to the globe; the language is still named for screen readers. */}
        <span className="uppercase lg:max-xl:sr-only">{LOCALES[locale].code}</span>
      </button>
      {/* Always in the HTML (hidden while closed) so the language links are crawlable. */}
      {(
        <ul
          id="language-menu"
          hidden={!open}
          className="absolute end-0 top-full z-50 mt-2 min-w-[11rem] rounded-2xl border border-hairline bg-canvas p-1.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.8)]"
        >
          {links('flex min-h-[40px] items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm hover:bg-surface-1')}
        </ul>
      )}
    </div>
  )
}
