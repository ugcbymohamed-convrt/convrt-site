/* Build-time server entry: renders a route to an HTML string. Used only by vite-plugin-static-routes.js
   (never shipped to the browser). The app already guards its browser-only code (state set in effects,
   `typeof window` checks), so rendering needs just a window.location for the path-aware parts of
   Nav/Footer/App. */

import { Writable } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import App from './App.jsx'
import { preloadForPath } from './lib/routes/preload.js'

// React warns that useLayoutEffect (CaseStudySwitcher's underline measuring) does nothing on the server.
// That is expected: the effect runs after hydration, exactly as it does today.
const NOISE = 'useLayoutEffect does nothing on the server'

export async function render(pathname) {
  await preloadForPath(pathname)
  const realError = console.error
  console.error = (...args) => { if (!String(args[0]).includes(NOISE)) realError(...args) }
  globalThis.window = { location: { pathname, search: '', hash: '', hostname: 'www.convrt.studio' } }
  try {
    return await new Promise((resolve, reject) => {
      let html = ''
      const errors = []
      const sink = new Writable({ write(chunk, _enc, cb) { html += chunk.toString(); cb() } })
      sink.on('finish', () => (errors.length ? reject(new Error(`render ${pathname}: ${errors.join('; ')}`)) : resolve(html)))
      const stream = renderToPipeableStream(<App />, {
        onAllReady() { stream.pipe(sink) },
        onShellError: reject,
        onError(e) { errors.push(String((e && e.message) || e)) },
      })
    })
  } finally {
    delete globalThis.window
    console.error = realError
  }
}
