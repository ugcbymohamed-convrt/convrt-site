/* Vercel serverless function: /api/creator/<op> — invitation-authorised creator onboarding API.
   All logic lives in api/_lib/creator/handlers.js. */
import { creatorHandler } from '../_lib/creator/handlers.js'

export default function handler(req, res) {
  return creatorHandler(req, res)
}
