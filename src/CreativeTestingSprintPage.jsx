import { useState } from 'react'
import CreativeTestingHero from './components/CreativeTestingHero.jsx'
import CreativeTestingOffer from './components/CreativeTestingOffer.jsx'
import CreativeTestingProcess from './components/CreativeTestingProcess.jsx'
import CreativeTestingNextStep from './components/CreativeTestingNextStep.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'

export default function CreativeTestingSprintPage() {
  const [service, setService] = useState('paid')

  useDocumentHead(pageHead('/pricing'))

  return (
    <>
      <CreativeTestingHero />
      <SectionDivider />
      <CreativeTestingOffer service={service} onServiceChange={setService} />
      <SectionDivider />
      <CreativeTestingProcess service={service} />
      <SectionDivider />
      <CreativeTestingNextStep service={service} />
    </>
  )
}
