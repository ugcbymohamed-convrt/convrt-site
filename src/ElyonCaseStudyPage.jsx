import SectionDivider from './components/SectionDivider.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
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

export default function ElyonCaseStudyPage() {
  useDocumentHead(pageHead('/case-studies/elyon'))

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
