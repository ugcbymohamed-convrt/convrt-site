import { useEffect, useRef, useState } from 'react'
import { rememberLanguage, rememberDismissal } from '../lib/languagePreference.js'

/* The language suggestion for visitors in Spain and in French-speaking countries (see src/lib/languageSuggestion.js). A compact, non-modal card at the bottom of an English page: no focus trap, no focus steal, no overlay.
   The card's text is in the suggested language, on an English page, so it carries that language's lang attribute.
   • The primary button (« Passer en français » / "Ver en español") is an ordinary link to the translated page (it works even if scripts fail); the click remembers that language.
   • The other button (« Rester en anglais » / "Continuar en inglés") remembers English and closes the card; the visitor stays where they are.
   • The × button (and Escape while the card has focus) closes it and remembers that it was dismissed.
   It waits until the cookie banner (when there is one) has been answered, so two prompts never compete for the screen, and it only fades in (not at all for reduced motion), so nothing in the page moves. */

/* The card's text per language (a new language adds its entry here and in src/lib/languageSuggestion.js SUGGESTIBLE). */
const COPY = {
  es: { region: 'Sugerencia de idioma', close: 'Cerrar', title: '¿Prefieres navegar en español?', text: 'También puedes visitar nuestra web en español.', stay: 'Continuar en inglés', go: 'Ver en español', hrefLang: 'es' },
  fr: { region: 'Suggestion de langue', close: 'Fermer', title: 'Vous préférez naviguer en français ?', text: 'Découvrez notre site en français.', stay: 'Rester en anglais', go: 'Passer en français', hrefLang: 'fr-FR' },
}

const btn = 'inline-flex min-h-[44px] flex-1 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime'

export default function LanguageSuggestion({ href, onClose, locale = 'es' }) {
  const t = COPY[locale] ?? COPY.es
  const root = useRef(null)
  const cookieBannerUp = () => typeof document !== 'undefined' && !!document.querySelector('[aria-label="Cookie consent"]')
  const [waiting, setWaiting] = useState(cookieBannerUp) // true while the cookie banner is on screen
  const [shown, setShown] = useState(false)

  useEffect(() => { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id) }, [])

  // Never compete with the cookie banner: stay hidden until it is gone (immediately when the site has none).
  useEffect(() => {
    const check = () => setWaiting(cookieBannerUp())
    check()
    const mo = new MutationObserver(check)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  const stay = () => { rememberLanguage('en'); onClose() }
  const dismiss = () => { rememberDismissal(); onClose() }
  const go = () => { rememberLanguage(locale) } // then the link navigates normally

  if (waiting) return null
  return (
    <div
      ref={root}
      role="region"
      aria-label={t.region}
      lang={t.hrefLang}
      onKeyDown={(e) => { if (e.key === 'Escape') dismiss() }}
      className={`fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-hairline-strong bg-surface-1/95 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[390px] ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.close}
        className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      >
        <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      </button>
      <p className="pr-9 font-display text-[16px] font-semibold leading-snug text-ink">{t.title}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{t.text}</p>
      <div className="mt-3.5 flex flex-col gap-2 min-[350px]:flex-row min-[350px]:items-center">
        <button type="button" onClick={stay} className={`${btn} border border-hairline-strong bg-surface-2 text-ink hover:bg-surface-3`}>{t.stay}</button>
        <a href={href} hrefLang={t.hrefLang} onClick={go} className={`${btn} bg-lime text-canvas hover:brightness-95`}>{t.go}</a>
      </div>
    </div>
  )
}
