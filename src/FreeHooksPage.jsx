import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import HooksHero from './components/hooks/HooksHero.jsx'
import RoadmapUpsell from './components/hooks/RoadmapUpsell.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { OFFER_PATHS } from './config.js'
import { pageHead } from './seo/siteSeo.js'

/* ─────────────────────────────────────────────
   /free-hooks — a one-screen lead magnet: pick SaaS or E-commerce, enter
   email, MailerLite delivers the matching 10-hook library by email.

   Page = hero with signup card + Roadmap upsell (+ the site footer from App).

   • Signup card: components/hooks/HooksSignupCard.jsx. Analytics events
     (src/lib/analytics.js): hooks_page_view, hooks_industry_selected,
     hooks_form_started, hooks_signup_submitted, hooks_signup_success,
     hooks_signup_error, hooks_other_industries_click. Params are limited to { industry, location, reason } —
     never an email.
   • Backend: api/free-hooks-subscribe.js → MailerLite. See
     docs/free-hooks-mailerlite-setup.md.
───────────────────────────────────────────── */

export default function FreeHooksPage() {
  useDocumentHead(pageHead(OFFER_PATHS.hooks))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('hooks_page_view')
  }, [])

  return (
    <>
      <HooksHero />
      <SectionDivider />
      <RoadmapUpsell />
    </>
  )
}
