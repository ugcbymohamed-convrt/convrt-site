import { useEffect } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import ScaleHero from './components/scale/ScaleHero.jsx'
import ScaleTrustBridge from './components/scale/ScaleTrustBridge.jsx'
import ScaleCaseStudies from './components/scale/ScaleCaseStudies.jsx'
import ScalePartnershipProof from './components/scale/ScalePartnershipProof.jsx'
import ScaleCreativeShowcase from './components/scale/ScaleCreativeShowcase.jsx'
import ScaleProblem from './components/scale/ScaleProblem.jsx'
import ScaleSystem from './components/scale/ScaleSystem.jsx'
import ScaleFirstEngagement from './components/scale/ScaleFirstEngagement.jsx'
import ScaleFit from './components/scale/ScaleFit.jsx'
import ScaleBooking from './components/scale/ScaleBooking.jsx'
import ScaleFAQ from './components/scale/ScaleFAQ.jsx'
import ScaleFinalCTA from './components/scale/ScaleFinalCTA.jsx'
import ScaleStickyCTA from './components/scale/ScaleStickyCTA.jsx'
import BookingModal from './components/scale/BookingModal.jsx'
import { captureAttribution } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'

/* Paid-acquisition landing page — deliberately not linked from Nav,
   Footer or any other page. Set to noindex so it stays outside the
   organic site architecture while remaining fully browsable for
   anyone who lands here from an ad and wants to explore the rest of
   the CONVRT site (the shared Nav/Footer below both link normally). */
export default function ScalePage() {
  useDocumentHead(pageHead('/scale'))

  useEffect(() => {
    captureAttribution()
  }, [])

  return (
    <>
      {/* 1. Founder-led VSL — "what is CONVRT and why should I care?" */}
      <ScaleHero />

      {/* 2–3. Business proof + case studies — "can they actually deliver?" */}
      <ScaleTrustBridge />
      <ScaleCaseStudies />
      <ScalePartnershipProof />
      <SectionDivider />

      {/* 4. Actual creative — "show me what they make" */}
      <ScaleCreativeShowcase />
      <SectionDivider />

      {/* 5–6. The bottleneck, then CONVRT's system */}
      <ScaleProblem />
      <ScaleSystem />
      <SectionDivider />

      {/* 7–8. Lower-risk entry, then fit check */}
      <ScaleFirstEngagement />
      <ScaleFit />
      <SectionDivider />

      {/* 9–11. Book the call, objections, final decision point */}
      <ScaleBooking />
      <ScaleFAQ />
      <ScaleFinalCTA />

      <ScaleStickyCTA />
      <BookingModal />
    </>
  )
}
