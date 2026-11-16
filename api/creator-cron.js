/* Vercel serverless function: /api/creator-cron — the daily creator-data retention job (see vercel.json "crons").
   All logic lives in api/_lib/creator/service.js (runRetention) and handlers.js (cronHandler). */
import { cronHandler } from './_lib/creator/handlers.js'

export default function handler(req, res) {
  return cronHandler(req, res)
}
