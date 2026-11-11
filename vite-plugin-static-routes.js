/* Build step: turns the single-page app shell into one real file per public URL plus a 404 page.

     dist/index.html                      →  /
     dist/pricing/index.html, …           →  every path in src/routes.js
     dist/blog/<slug>/index.html          →  every PUBLISHED blog article
     dist/404.html                        →  everything else (served with HTTP 404)

   All copies are the same app shell (the React app reads the URL and renders the right page), so
   nothing changes for visitors. What changes is the host's behaviour: a URL with no file now gets a
   genuine 404 instead of the homepage with a 200. See src/routes.js and vercel.json. */

import fs from 'node:fs'
import path from 'node:path'
import { allRoutePaths, routeFile, notFoundHtml } from './src/lib/routes/staticRoutes.js'
import { loadBlogContent } from './vite-plugin-blog.js'
import { selectPublished } from './src/lib/blog/schema.js'

export default function staticRoutes() {
  let outDir
  return {
    name: 'convrt-static-routes',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html')
      if (!fs.existsSync(indexFile)) return
      const shell = fs.readFileSync(indexFile, 'utf8')

      const { analyzed } = loadBlogContent()
      const slugs = selectPublished(analyzed.map((a) => a.meta).filter(Boolean)).map((m) => m.slug)

      for (const p of allRoutePaths(slugs)) {
        if (p === '/') continue
        const file = path.join(outDir, routeFile(p))
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, shell)
      }
      fs.writeFileSync(path.join(outDir, '404.html'), notFoundHtml(shell))
    },
  }
}
