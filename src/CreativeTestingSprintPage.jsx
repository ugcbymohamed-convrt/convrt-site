import { useState } from 'react'
import CreativeTestingHero from './components/CreativeTestingHero.jsx'
import CreativeTestingOffer from './components/CreativeTestingOffer.jsx'
import CreativeTestingProcess from './components/CreativeTestingProcess.jsx'
import CreativeTestingNextStep from './components/CreativeTestingNextStep.jsx'
import ConceptExplainer from './components/pricing/ConceptExplainer.jsx'
import UsageRights from './components/pricing/UsageRights.jsx'
import ProductionProcess from './components/pricing/ProductionProcess.jsx'
import ProductionTerms from './components/pricing/ProductionTerms.jsx'
import OrganicScope from './components/pricing/OrganicScope.jsx'
import PricingFAQ from './components/pricing/PricingFAQ.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'

export default function CreativeTestingSprintPage() {
  const [service, setService] = useState('paid')

  // Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js).
  useDocumentHead(pageHead('/pricing'))

  /* Both services' sections are always in the DOM; the inactive group carries `hidden`. That keeps every price,
     term and FAQ answer in the prerendered HTML while visitors still see one service at a time. */
  return (
    <>
      <CreativeTestingHero />
      <SectionDivider />
      <CreativeTestingOffer service={service} onServiceChange={setService} />

      <div hidden={service !== 'paid'}>
        <SectionDivider />
        <ConceptExplainer />
        <SectionDivider />
        <UsageRights />
        <SectionDivider />
        <ProductionProcess />
        <SectionDivider />
        <ProductionTerms />
      </div>

      <div hidden={service !== 'organic'}>
        <SectionDivider />
        <OrganicScope />
        <SectionDivider />
        <CreativeTestingProcess />
      </div>

      <SectionDivider />
      <PricingFAQ />
      <SectionDivider />
      <CreativeTestingNextStep service={service} />
    </>
  )
}
