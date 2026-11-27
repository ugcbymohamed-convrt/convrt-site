/* Build step: turns the single-page app shell into real, fully rendered HTML for every public URL.

     dist/index.html                      →  /           (server-rendered homepage)
     dist/pricing/index.html, …           →  every path in src/routes.js
     dist/blog/<slug>/index.html          →  every PUBLISHED blog article
     dist/404.html                        →  everything else (served with HTTP 404; empty shell, noindex)

   Each file = the app shell + that route's <head> (title, description, canonical, robots, social tags,
   JSON-LD) + the markup React renders for that URL. So crawlers that never run JavaScript read the real
   page. In the browser, React hydrates that markup (src/main.jsx) and everything behaves as before.

   How: a second Vite build (SSR mode) compiles src/entry-server.jsx; this plugin imports it and renders
   each route. The host answers URLs without a file with 404 (vercel.json has no catch-all rewrite). */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { allRoutePaths, routeFile, notFoundHtml } from './src/lib/routes/staticRoutes.js'
import { headParamsFor } from './src/lib/routes/headFor.js'
import { headSpecToHtml, injectPage } from './src/lib/routes/headTags.js'
import { buildHeadSpec } from './src/lib/headSpec.js'
import { parsePath } from './src/i18n/paths.js'
import { LOCALES } from './src/i18n/locales.js'
import { loadBlogContent } from './vite-plugin-blog.js'
import blogContent from './vite-plugin-blog.js'
import { selectPublished } from './src/lib/blog/schema.js'

/* Compile the server entry into a throw-away folder INSIDE the project, so Node resolves react,
   react-dom/server etc. from the project's node_modules. Unique per build: builds can run in parallel. */
async function buildServerEntry(root) {
  const dir = path.join(root, 'node_modules', '.convrt-ssr', `${process.pid}-${Date.now()}`)
  await build({
    root,
    configFile: false,
    logLevel: 'warn',
    publicDir: false,
    plugins: [react(), blogContent()],
    build: {
      ssr: 'src/entry-server.jsx',
      outDir: dir,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs', format: 'es' } },
    },
  })
  return { dir, entry: path.join(dir, 'entry-server.mjs') }
}

export default function staticRoutes() {
  let outDir, root, isSsrPass
  return {
    name: 'convrt-static-routes',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
      // The SSR pass below is itself a build: don't recurse.
      isSsrPass = Boolean(config.build.ssr)
    },
    async closeBundle() {
      if (isSsrPass) return
      const indexFile = path.join(outDir, 'index.html')
      if (!fs.existsSync(indexFile)) return
      const shell = fs.readFileSync(indexFile, 'utf8')

      const { analyzed } = loadBlogContent()
      const publishedMetas = selectPublished(analyzed.map((a) => a.meta).filter(Boolean))
      const paths = allRoutePaths(publishedMetas)

      // A translated page loads its language's dictionary chunk before hydrating (src/i18n/dictionaries.lazy.js): preload exactly that chunk from the HTML, so the
      // request starts with the document and does not wait for the entry script to run.
      const assetsDir = path.join(outDir, 'assets')
      const dictionaryChunk = (locale) => {
        const file = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).find((f) => f.startsWith(`dict-${locale}-`) && f.endsWith('.js')) : undefined
        return file ? `<link rel="modulepreload" crossorigin href="/assets/${file}">` : ''
      }

      const ssr = await buildServerEntry(root)
      try {
        const { render } = await import(pathToFileURL(ssr.entry).href)
        const allMisses = new Set()
        for (const p of paths) {
          globalThis.__i18nMisses = new Set()
          const bodyHtml = await render(p)
          const spec = buildHeadSpec(headParamsFor(p, publishedMetas))
          // A translated page may never ship with an untranslated string: every tr(...) the body render AND the head/JSON-LD build touched must have a dictionary entry.
          for (const m of globalThis.__i18nMisses ?? []) allMisses.add(`${p}  ${m}`)
          const { locale } = parsePath(p)
          const headHtml = headSpecToHtml(spec) + (locale === 'en' ? '' : dictionaryChunk(locale))
          const page = injectPage(shell, { headHtml, bodyHtml, ssrPath: p, lang: locale === 'en' ? undefined : LOCALES[locale].htmlLang, dir: locale === 'en' ? undefined : LOCALES[locale].dir })
          const file = path.join(outDir, routeFile(p))
          fs.mkdirSync(path.dirname(file), { recursive: true })
          fs.writeFileSync(file, page)
        }
        if (allMisses.size && process.env.I18N_MISSES_FILE) fs.writeFileSync(process.env.I18N_MISSES_FILE, JSON.stringify([...allMisses].map((m) => m.split('  ').slice(1).join('  ').replace(/^[a-z]{2}: /, '')).filter((v, i, a) => a.indexOf(v) === i), null, 1))
        if (allMisses.size) throw new Error(`Untranslated strings (${allMisses.size}):\n  ${[...allMisses].join('\n  ')}`)
        // The 404 page stays the bare shell (React renders NotFoundPage in the browser). Built from the
        // ORIGINAL shell, captured before dist/index.html was overwritten above.
        fs.writeFileSync(path.join(outDir, '404.html'), notFoundHtml(shell))
      } finally {
        fs.rmSync(ssr.dir, { recursive: true, force: true })
      }
    },
  }
}
