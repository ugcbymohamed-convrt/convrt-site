import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import blogContent from './vite-plugin-blog.js'
import sitemap from './vite-plugin-sitemap.js'
import staticRoutes from './vite-plugin-static-routes.js'

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
        if (/^(MAILERLITE_|CREATOR_|CLOUDFLARE_|UPSTASH_|KV_|PROJECT_APPLICATION_)/.test(k) && process.env[k] === undefined) process.env[k] = v
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
      for (const route of ['free-hooks-subscribe', 'risk-free-apply', 'referral-apply', 'project-apply', 'visitor-country']) {
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

export default defineConfig({
  plugins: [react(), devApi(), blogContent(), sitemap(), staticRoutes()],
})
