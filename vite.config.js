import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import blogContent from './vite-plugin-blog.js'
import sitemap from './vite-plugin-sitemap.js'
import staticRoutes from './vite-plugin-static-routes.js'
import withheldVideos from './vite-plugin-withheld-videos.js'

/* Dev-only: serves api/free-hooks-subscribe.js, api/risk-free-apply.js and api/referral-apply.js at
   /api/<name> so `npm run dev` exercises the real handlers (Vercel does this
   in production). Reads MAILERLITE_* from .env.local (git-ignored). Without them
   the endpoint answers 503, exactly as a mis-configured production would. */
function devApi() {
  return {
    name: 'convrt-dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [k, v] of Object.entries(env)) {
        if (/^(MAILERLITE_|CREATOR_|CLOUDFLARE_|UPSTASH_|KV_|RESEND_|NOTIFY_EMAIL_|PROJECT_APPLICATION_)/.test(k) && process.env[k] === undefined) process.env[k] = v
      }
      // Creator onboarding (private, invitation-only): /api/creator/<op> and /api/creator-admin/<op>.
      for (const [prefix, file] of [['/api/creator-admin', '/api/creator-admin/[op].js'], ['/api/creator', '/api/creator/[op].js']]) {
        server.middlewares.use(prefix, async (req, res, next) => {
          try {
            // connect strips the prefix from req.url; the handlers read the full path.
            req.url = `${prefix}${req.url === '/' ? '' : req.url}`
            const { default: handler } = await server.ssrLoadModule(file)
            await handler(req, res)
          } catch (err) {
            next(err)
          }
        })
      }
      for (const route of ['free-hooks-subscribe', 'risk-free-apply', 'referral-apply', 'project-apply', 'contact', 'visitor-country']) {
        server.middlewares.use(`/api/${route}`, async (req, res, next) => {
          try {
            const { default: handler } = await server.ssrLoadModule(`/api/${route}.js`)
            await handler(req, res)
          } catch (err) {
            next(err)
          }
        })
      }
    },
  }
}

/* Browser bundle only: swap src/i18n/dictionaries.js (all three translated dictionaries) for dictionaries.lazy.js (one language's dictionary, loaded on demand).
   The static-routes SSR build and the tests use the real file, so server HTML and every test keep seeing the full dictionaries. */
function lazyDictionaries() {
  const real = path.resolve('src/i18n/dictionaries.js')
  const lazy = path.resolve('src/i18n/dictionaries.lazy.js')
  return {
    name: 'convrt-lazy-dictionaries',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (options?.ssr || !importer || !/(^|\/)dictionaries(\.js)?$/.test(source)) return null
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true })
      return resolved && path.resolve(resolved.id) === real ? lazy : null
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi(), blogContent(), sitemap(), lazyDictionaries(), withheldVideos(), staticRoutes()],
  build: {
    rollupOptions: {
      output: {
        // One predictably named chunk per translated language, so the static HTML of a translated page can preload exactly its own dictionary.
        chunkFileNames: (chunk) => {
          const m = chunk.facadeModuleId?.match(/src\/i18n\/(es|fr|ar)\/index\.js$/)
          return m ? `assets/dict-${m[1]}-[hash].js` : 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
