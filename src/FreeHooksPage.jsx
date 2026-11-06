import { useCallback, useEffect, useRef, useState } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import HooksHero from './components/hooks/HooksHero.jsx'
import IndustrySelector from './components/hooks/IndustrySelector.jsx'
import HooksInside from './components/hooks/HooksInside.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { scrollToId } from './lib/scrollToId.js'
import { FREE_HOOKS_INDEXABLE, OFFER_PATHS, SITE_URL } from './config.js'

/* ─────────────────────────────────────────────
   /free-hooks — lead magnet: pick SaaS or E-commerce, enter email, MailerLite
   delivers the matching 10-hook library by email.

   • `industry` lives here so the selector, the form and the "What's inside"
     preview stay in sync.
   • Analytics events (src/lib/analytics.js → dataLayer / Meta Pixel when
     present): hooks_page_view, hooks_industry_selected, hooks_form_started,
     hooks_signup_submitted, hooks_signup_success, hooks_signup_error.
     Params are limited to { industry, location, reason } — never an email.
   • Backend: api/free-hooks-subscribe.js → MailerLite. See
     docs/free-hooks-mailerlite-setup.md.
───────────────────────────────────────────── */

const PAGE_TITLE = '10 Free Ad Hooks for SaaS & E-commerce | CONVRT'
const PAGE_DESCRIPTION =
  'Get 10 ready-to-adapt advertising hooks for your industry — verbal, visual and on-screen text — delivered free by email from CONVRT.'

export default function FreeHooksPage() {
  const [industry, setIndustry] = useState(null) // 'saas' | 'ecommerce' | null

  useDocumentHead({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${OFFER_PATHS.hooks}`,
    noindex: !FREE_HOOKS_INDEXABLE,
  })

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('hooks_page_view')
  }, [])

  const selectIndustry = useCallback((key, source = 'selector') => {
    setIndustry(key)
    trackEvent('hooks_industry_selected', { industry: key, location: source })
  }, [])

  const goToSelector = useCallback(() => scrollToId('industry', 'industry-heading'), [])

  return (
    <>
      <HooksHero onCta={goToSelector} />
      <SectionDivider />
      <IndustrySelector industry={industry} onSelect={selectIndustry} />
      <SectionDivider />
      <HooksInside industry={industry} onCta={goToSelector} />
    </>
  )
}
