import SectionDivider from './components/SectionDivider.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { caseStudyHead } from './caseStudies/head.js'
import FinalCTA from './components/FinalCTA.jsx'
import NextCaseStudy from './components/caseStudies/NextCaseStudy.jsx'
import RelatedService from './components/caseStudies/RelatedService.jsx'
import GraspoHero from './components/graspo/GraspoHero.jsx'
import GraspoMetrics from './components/graspo/GraspoMetrics.jsx'
import GraspoChallenge from './components/graspo/GraspoChallenge.jsx'
import GraspoStrategy from './components/graspo/GraspoStrategy.jsx'
import GraspoShowcase from './components/graspo/GraspoShowcase.jsx'
import GraspoDistribution from './components/graspo/GraspoDistribution.jsx'
import GraspoAudience from './components/graspo/GraspoAudience.jsx'
import GraspoFunnel from './components/graspo/GraspoFunnel.jsx'
import GraspoLeadExamples from './components/graspo/GraspoLeadExamples.jsx'
import GraspoLeadComposition from './components/graspo/GraspoLeadComposition.jsx'
import GraspoResult from './components/graspo/GraspoResult.jsx'

export default function GraspoCaseStudyPage() {
  useDocumentHead(caseStudyHead('/case-studies/graspo'))

  return (
    <>
      <GraspoHero />
      <GraspoMetrics />
      <SectionDivider />
      <GraspoChallenge />
      <SectionDivider />
      <GraspoStrategy />
      <SectionDivider />
      <GraspoShowcase />
      <SectionDivider />
      <GraspoDistribution />
      <SectionDivider />
      <GraspoAudience />
      <SectionDivider />
      <GraspoFunnel />
      <SectionDivider />
      <GraspoLeadExamples />
      <SectionDivider />
      <GraspoLeadComposition />
      <SectionDivider />
      <GraspoResult />
      <RelatedService currentId="graspo" />
      <NextCaseStudy currentId="graspo" />
      <SectionDivider />
      <FinalCTA />
    </>
  )
}
