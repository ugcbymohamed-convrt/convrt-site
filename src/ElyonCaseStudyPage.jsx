import { useEffect } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import NextCaseStudy from './components/caseStudies/NextCaseStudy.jsx'
import ElyonHero from './components/elyon/ElyonHero.jsx'
import ElyonMetrics from './components/elyon/ElyonMetrics.jsx'
import ElyonPositioning from './components/elyon/ElyonPositioning.jsx'
import ElyonCreativeSystem from './components/elyon/ElyonCreativeSystem.jsx'
import ElyonShowcase from './components/elyon/ElyonShowcase.jsx'
import ElyonPerformance from './components/elyon/ElyonPerformance.jsx'
import ElyonScale from './components/elyon/ElyonScale.jsx'
import ElyonProof from './components/elyon/ElyonProof.jsx'
import ElyonResult from './components/elyon/ElyonResult.jsx'

const PAGE_TITLE = 'Elyon Dubai Case Study: Performance Creative for Luxury Fragrance | CONVRT'
const PAGE_DESCRIPTION =
  'How CONVRT built a repeatable performance-creative system for Elyon Dubai, 160+ creatives across street interviews, creator-led ads and multiple locations, with a 5.28x ROAS standout result.'
const OG_TITLE = 'Elyon Dubai × CONVRT, Performance Creative for a Luxury Fragrance Brand'
const OG_DESCRIPTION =
  'Creator-led ads, street interviews and continuous creative testing turned into measurable purchases and ROAS for Elyon Dubai.'

function useHeadTags() {
  useEffect(() => {
    const previousTitle = document.title
    const descMeta = document.querySelector('meta[name="description"]')
    const previousDescription = descMeta?.getAttribute('content')

    const ogTitleMeta = document.querySelector('meta[property="og:title"]')
    const previousOgTitle = ogTitleMeta?.getAttribute('content')
    const ogDescMeta = document.querySelector('meta[property="og:description"]')
    const previousOgDescription = ogDescMeta?.getAttribute('content')

    document.title = PAGE_TITLE
    descMeta?.setAttribute('content', PAGE_DESCRIPTION)
    ogTitleMeta?.setAttribute('content', OG_TITLE)
    ogDescMeta?.setAttribute('content', OG_DESCRIPTION)

    return () => {
      document.title = previousTitle
      if (previousDescription != null) descMeta?.setAttribute('content', previousDescription)
      if (previousOgTitle != null) ogTitleMeta?.setAttribute('content', previousOgTitle)
      if (previousOgDescription != null) ogDescMeta?.setAttribute('content', previousOgDescription)
    }
  }, [])
}

export default function ElyonCaseStudyPage() {
  useHeadTags()

  return (
    <>
      <ElyonHero />
      <ElyonMetrics />
      <SectionDivider />
      <ElyonPositioning />
      <SectionDivider />
      <ElyonCreativeSystem />
      <SectionDivider />
      <ElyonShowcase />
      <SectionDivider />
      <ElyonPerformance />
      <SectionDivider />
      <ElyonScale />
      <SectionDivider />
      <ElyonProof />
      <SectionDivider />
      <ElyonResult />
      <NextCaseStudy currentId="elyon" />
      <SectionDivider />
      <FinalCTA />
    </>
  )
}
