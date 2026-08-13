import { useEffect } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import FinalCTA from './components/FinalCTA.jsx'
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

const PAGE_TITLE = 'Graspo Case Study: 10.7M Organic Views & Arabic Social Media Leads | CONVRT'
const PAGE_DESCRIPTION =
  'How CONVRT turned a European printing company into an Arabic-first social content engine, 10.7M organic views, 3.4M reach across MENA, and 75 qualified inbound printing leads.'
const OG_TITLE = 'Graspo × CONVRT, From Printing Expertise to 10.7M Organic Views and Qualified MENA Demand'
const OG_DESCRIPTION =
  'A social media content management case study: how Arabic-first strategy, production and inbound handling turned Graspo into a recognized name across Saudi Arabia, Iraq, Morocco, Egypt and the wider MENA region.'

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

export default function GraspoCaseStudyPage() {
  useHeadTags()

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
      <SectionDivider />
      <FinalCTA />
    </>
  )
}
