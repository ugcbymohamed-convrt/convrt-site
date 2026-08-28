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

const PAGE_TITLE = 'Book a Discovery Call | CONVRT Performance Creative Studio'
const PAGE_DESCRIPTION =
  'CONVRT is a performance creative partner for growth teams running paid social. Founder-led, agency-grade, built around testing. Book a discovery call.'

/* Paid-acquisition landing page — deliberately not linked from Nav,
   Footer or any other page. Set to noindex so it stays outside the
   organic site architecture while remaining fully browsable for
   anyone who lands here from an ad and wants to explore the rest of
   the CONVRT site (the shared Nav/Footer below both link normally). */
function useHeadTags() {
  useEffect(() => {
    const previousTitle = document.title
    const descMeta = document.querySelector('meta[name="description"]')
    const previousDescription = descMeta?.getAttribute('content')

    let robotsMeta = document.querySelector('meta[name="robots"]')
    const createdRobotsMeta = !robotsMeta
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    const previousRobots = robotsMeta.getAttribute('content')

    document.title = PAGE_TITLE
    descMeta?.setAttribute('content', PAGE_DESCRIPTION)
    robotsMeta.setAttribute('content', 'noindex, follow')

    return () => {
      document.title = previousTitle
      if (previousDescription != null) descMeta?.setAttribute('content', previousDescription)
      if (createdRobotsMeta) {
        robotsMeta.remove()
      } else if (previousRobots != null) {
        robotsMeta.setAttribute('content', previousRobots)
      }
    }
  }, [])
}

export default function ScalePage() {
  useHeadTags()

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
