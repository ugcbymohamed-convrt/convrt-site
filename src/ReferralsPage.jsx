import { useCallback, useEffect, useRef, useState } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import ReferralHero from './components/referrals/ReferralHero.jsx'
import ReferralRewards from './components/referrals/ReferralRewards.jsx'
import ReferralHowItWorks from './components/referrals/ReferralHowItWorks.jsx'
import ReferralWhoCanJoin from './components/referrals/ReferralWhoCanJoin.jsx'
import ReferralForm from './components/referrals/ReferralForm.jsx'
import ReferralTerms from './components/referrals/ReferralTerms.jsx'
import ReferralFAQ, { FAQS } from './components/referrals/ReferralFAQ.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { scrollToApply } from './lib/roadmapForm.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { REFERRALS_INDEXABLE, REFERRALS_PATH, SITE_URL } from './config.js'

/* ─────────────────────────────────────────────
   /referrals — Referral Partner Program.

   Page = hero · rewards · how it works · who can join · form · terms · FAQ (+ the site
   footer from App). Applications go to api/referral-apply.js (MailerLite + owner email)
   for manual review; nothing is auto-approved and no payment is promised.
   Setup: docs/referral-program-setup.md.

   Analytics events (src/lib/analytics.js): referrals_page_view, referrals_apply_click,
   referrals_how_it_works_click, referrals_form_started, referrals_application_submitted,
   referrals_application_success, referrals_application_error. No personal data.
───────────────────────────────────────────── */

const PAGE_URL = `${SITE_URL}${REFERRALS_PATH}`
const PAGE_TITLE = 'Referral Partner Program | Get Rewarded for Introductions | CONVRT'
const PAGE_DESCRIPTION =
  'Know a brand that needs better-performing video ads? Introduce them to CONVRT and get rewarded when they become a client. Join the Referral Partner Program.'

/* FAQPage structured data built from the FAQ shown on the page, so it can never drift from it. */
function useFaqStructuredData() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [])
}

export default function ReferralsPage() {
  useDocumentHead({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    noindex: !REFERRALS_INDEXABLE,
  })
  useFaqStructuredData()

  // Reward-card CTAs: remember which card was chosen, then scroll. `id` changes on every
  // click, so choosing the same card twice (after editing the form) re-applies it.
  const [preselect, setPreselect] = useState(null)
  const selectProgram = useCallback((card) => {
    setPreselect((p) => ({ card, id: (p?.id ?? 0) + 1 }))
    scrollToApply()
  }, [])

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('referrals_page_view')
  }, [])

  return (
    <>
      <ReferralHero />
      <SectionDivider />
      <ReferralRewards onSelect={selectProgram} />
      <SectionDivider />
      <ReferralHowItWorks />
      <SectionDivider />
      <ReferralWhoCanJoin />
      <SectionDivider />
      <ReferralForm preselect={preselect} />
      <ReferralTerms />
      <ReferralFAQ />
    </>
  )
}
