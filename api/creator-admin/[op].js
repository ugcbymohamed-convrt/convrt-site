/* Vercel serverless function: /api/creator-admin/<op> — owner-only review API (signed session cookie).
   All logic lives in api/_lib/creator/handlers.js. */
import { adminHandler } from '../_lib/creator/handlers.js'

export default function handler(req, res) {
  return adminHandler(req, res)
}
