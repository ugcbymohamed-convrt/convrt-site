import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import blogContent from './vite-plugin-blog.js'

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
        if (k.startsWith('MAILERLITE_') && process.env[k] === undefined) process.env[k] = v
      }
      for (const route of ['free-hooks-subscribe', 'risk-free-apply', 'referral-apply']) {
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
  plugins: [react(), devApi(), blogContent()],
})
