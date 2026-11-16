import { useState } from 'react'
import PricingStage from './components/pricing/PricingStage.jsx'
import PhilosophySection from './components/pricing/PhilosophySection.jsx'
import InfoPanels from './components/pricing/InfoPanels.jsx'
import PricingFAQ from './components/pricing/PricingFAQ.jsx'
import PricingFinalCTA from './components/pricing/PricingFinalCTA.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'

/* The pricing page: five main sections.
     1. PricingStage     unified hero + goal selector + the three pricing cards (Paid / Organic)
     2. PhilosophySection creative philosophy + free Roadmap offer + credibility stats
     3. InfoPanels        one consolidated, expandable package-information section
     4. PricingFAQ        categorized FAQs
     5. PricingFinalCTA   compact closing invitation
   The selected goal (`service`) only controls presentation: both Paid Social and Organic Social content is always in the
   prerendered HTML. Default: Paid Social ("Scale my ads"). */
export default function CreativeTestingSprintPage() {
  const [service, setService] = useState('paid')

  // Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js).
  useDocumentHead(pageHead('/pricing'))

  return (
    <>
      <PricingStage service={service} onServiceChange={setService} />
      <SectionDivider />
      <PhilosophySection service={service} />
      <SectionDivider />
      <InfoPanels service={service} />
      <SectionDivider />
      <PricingFAQ />
      <SectionDivider />
      <PricingFinalCTA />
    </>
  )
}
