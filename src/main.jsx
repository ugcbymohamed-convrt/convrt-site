import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { canHydrate, normalizePathname } from './lib/routes/hydration.js'
import { preloadForPath } from './lib/routes/preload.js'
import { initConsent } from './lib/consent.js'
import { readLanguageChoice } from './lib/languagePreference.js'
import { currentLocale } from './i18n/locale.js'
import { LOCALES } from './i18n/locales.js'
import './index.css'

/* Every public page ships as static HTML (see vite-plugin-static-routes.js). When the HTML in #root was
   rendered for this exact URL, hydrate it (React attaches to the existing markup: no flash, no re-render).
   Otherwise (404 page, unknown/modified URLs, "/case-studies?case=elyon") render fresh, as before. */

/* A translated page already ships <html lang dir> in its static HTML (src/lib/routes/headTags.js); this only guarantees the same values when the page is rendered without the prerender (the dev server, an unknown URL),
   so right-to-left layout and the language-scoped CSS never depend on how the HTML was produced. English is left alone. */
if (currentLocale() !== 'en') {
  const { htmlLang, dir } = LOCALES[currentLocale()]
  if (document.documentElement.lang !== htmlLang) document.documentElement.lang = htmlLang
  if (document.documentElement.dir !== dir) document.documentElement.dir = dir
}

const container = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

const hydrate = canHydrate({
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
  ssrPath: container.dataset.ssrPath,
})

if (hydrate) {
  const attach = () =>
    hydrateRoot(container, app, {
      // React recovers on its own (re-renders the affected part on the client). Keep a record so a
      // mismatch is visible in tests/monitoring instead of silent.
      onRecoverableError(error) {
        ;(window.__hydrationErrors ||= []).push(String((error && error.message) || error))
        console.error(error)
      },
    })
  const ready = preloadForPath(normalizePathname(window.location.pathname))
  ready.then(attach, attach)
} else {
  createRoot(container).render(app)
}

/* Analytics consent (Google Consent Mode v2). Entirely inactive unless a GTM container ID is configured (VITE_GTM_ID): then the denied defaults are set, a saved
   choice is applied, and the banner mounts in its OWN root, so the prerendered markup and hydration above are untouched. See src/lib/consent.js. */
const consent = initConsent({ win: window, doc: document })
if (consent.enabled) {
  import('./components/ConsentManager.jsx').then(({ default: ConsentManager }) => {
    const host = document.createElement('div')
    host.id = 'consent-root'
    document.body.appendChild(host)
    createRoot(host).render(<ConsentManager />)
  })
}

/* Language suggestion for visitors in Spain (src/lib/languageSuggestion.js). A progressive enhancement on prerendered ENGLISH pages only, after the page has loaded; a visitor who already chose a
   language (or dismissed it) costs nothing here (no extra request, no chunk). It never redirects and never changes the page's HTML, URL or metadata. */
if (hydrate && currentLocale() === 'en' && !readLanguageChoice()) {
  const start = () => import('./lib/languageSuggestion.js').then(({ startLanguageSuggestion }) => startLanguageSuggestion()).catch(() => {})
  let started = false
  const idle = () => {
    if (started) return
    started = true
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 3000 })
    else setTimeout(start, 1500)
  }
  // After the page has loaded; on a slow page, at most six seconds in. Either way only in idle time, so it never competes with rendering, hero video or other assets.
  if (document.readyState === 'complete') idle()
  else { window.addEventListener('load', idle, { once: true }); setTimeout(idle, 6000) }
}
