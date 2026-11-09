import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import RiskFreeHero from './components/riskfree/RiskFreeHero.jsx'
import RiskFreeApplication from './components/riskfree/RiskFreeApplication.jsx'
import RiskFreeFAQ from './components/riskfree/RiskFreeFAQ.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { OFFER_PATHS, RISK_FREE_INDEXABLE, SITE_URL } from './config.js'

/* ─────────────────────────────────────────────
   /risk-free-trial — "1 FREE Video Production", by application.

   Page = hero + application (+ the site footer from App). Applications go to
   api/risk-free-apply.js for manual review; nothing is auto-approved and no
   booking link is shown. Setup: docs/risk-free-application-setup.md.

   Analytics events (src/lib/analytics.js): risk_free_page_view,
   risk_free_apply_click, risk_free_form_started, risk_free_application_submitted,
   risk_free_application_success, risk_free_application_error. No answers or
   personal data are ever sent.
───────────────────────────────────────────── */

const PAGE_TITLE = '1 Free Video Production | Try CONVRT Risk Free'
const PAGE_DESCRIPTION =
  'Apply for one free video ad produced by CONVRT, plus two bonus hook variations. Try CONVRT risk free and see if you qualify.'

export default function RiskFreePage() {
  useDocumentHead({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${OFFER_PATHS.riskFree}`,
    noindex: !RISK_FREE_INDEXABLE,
  })

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('risk_free_page_view')
  }, [])

  return (
    <>
      <RiskFreeHero />
      <SectionDivider />
      <RiskFreeApplication />
      <SectionDivider />
      <RiskFreeFAQ />
    </>
  )
}
