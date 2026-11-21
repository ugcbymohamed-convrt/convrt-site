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
      const chunks = []
      const errors = []
      // Chunks are copied at once and decoded ONCE as UTF-8 (a multi-byte character such as "é" or "—" can straddle two chunks). React's byte stream can also carry stray NUL
      // bytes next to multi-byte characters in long pages (seen on pages with accented text); a NUL is never page text, so they are dropped.
      const sink = new Writable({ write(chunk, _enc, cb) { chunks.push(Buffer.from(chunk)); cb() } })
      sink.on('finish', () => (errors.length ? reject(new Error(`render ${pathname}: ${errors.join('; ')}`)) : resolve(Buffer.concat(chunks).toString('utf8').replace(/\u0000/g, ''))))
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
