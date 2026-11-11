import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { canHydrate, normalizePathname } from './lib/routes/hydration.js'
import { preloadForPath } from './lib/routes/preload.js'
import './index.css'

/* Every public page ships as static HTML (see vite-plugin-static-routes.js). When the HTML in #root was
   rendered for this exact URL, hydrate it (React attaches to the existing markup: no flash, no re-render).
   Otherwise (404 page, unknown/modified URLs, "/case-studies?case=elyon") render fresh, as before. */

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
