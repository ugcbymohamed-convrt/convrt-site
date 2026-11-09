import { useCallback, useEffect, useRef, useState } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import ReferralHero from './components/referrals/ReferralHero.jsx'
import ReferralRewards from './components/referrals/ReferralRewards.jsx'
import ReferralHowItWorks from './components/referrals/ReferralHowItWorks.jsx'
import ReferralWhyRefer from './components/referrals/ReferralWhyRefer.jsx'
import ReferralKit from './components/referrals/ReferralKit.jsx'
import ReferralForm from './components/referrals/ReferralForm.jsx'
import ReferralTerms from './components/referrals/ReferralTerms.jsx'
import ReferralFAQ, { FAQS } from './components/referrals/ReferralFAQ.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { scrollToApply } from './lib/roadmapForm.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { REFERRALS_INDEXABLE, REFERRALS_PATH, SITE_URL } from './config.js'

/* ─────────────────────────────────────────────
   /referrals — Referral Partner Program.

   Page = hero · everyone wins (rewards + FREE Creative Upgrade) · how it works · why refer ·
   partner kit preview · program terms (compact, full terms in an accordion) · registration
   form · FAQ (+ the site footer from App). Copy is deliberately short: conditions live in the
   terms and the FAQ, not repeated in every section.
   Registrations go to api/referral-apply.js (MailerLite + owner email) for manual review;
   nothing is auto-approved and no payment is promised. Individual referrals are tracked
   manually. Setup: docs/referral-program-setup.md.

   Analytics (src/lib/analytics.js, no personal data):
     referral_page_view · referral_cta_click · referral_form_start ·
     referral_application_submit · referral_application_success · referral_application_error
   PRIMARY CONVERSION: referral_application_success (a saved partner application).
   BUSINESS KPI (not trackable on the page): qualified referrals that become paying clients,
   counted in the manual referral tracker.
───────────────────────────────────────────── */

const PAGE_URL = `${SITE_URL}${REFERRALS_PATH}`
const PAGE_TITLE = 'CONVRT Referral Partner Program | Earn Rewards for Introductions'
const PAGE_DESCRIPTION =
  'Refer SaaS and e-commerce brands to CONVRT, earn rewards for successful introductions, and give your connections an exclusive creative upgrade.'

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
    trackEvent('referral_page_view')
  }, [])

  return (
    <>
      <ReferralHero />
      <SectionDivider />
      <ReferralRewards onSelect={selectProgram} />
      <SectionDivider />
      <ReferralHowItWorks />
      <SectionDivider />
      <ReferralWhyRefer />
      <SectionDivider />
      <ReferralKit />
      <SectionDivider />
      <ReferralTerms />
      <ReferralForm preselect={preselect} />
      <ReferralFAQ />
    </>
  )
}
