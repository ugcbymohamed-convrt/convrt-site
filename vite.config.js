import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/* Dev-only: serves api/free-hooks-subscribe.js at /api/free-hooks-subscribe so
   `npm run dev` exercises the real signup handler (Vercel does this in
   production). Reads MAILERLITE_* from .env.local (git-ignored). Without them
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
      server.middlewares.use('/api/free-hooks-subscribe', async (req, res, next) => {
        try {
          const { default: handler } = await server.ssrLoadModule('/api/free-hooks-subscribe.js')
          await handler(req, res)
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
})
