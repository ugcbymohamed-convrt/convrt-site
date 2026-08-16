import { useEffect, useState } from 'react'
import CreativeTestingHero from './components/CreativeTestingHero.jsx'
import CreativeTestingOffer from './components/CreativeTestingOffer.jsx'
import CreativeTestingProcess from './components/CreativeTestingProcess.jsx'
import CreativeTestingNextStep from './components/CreativeTestingNextStep.jsx'
import SectionDivider from './components/SectionDivider.jsx'

const PAGE_TITLE = 'Paid & Organic Social Pricing | CONVRT'
const PAGE_DESCRIPTION =
  'Explore CONVRT pricing for paid social creative testing and organic social media management, from strategy and production to publishing and optimization.'

export default function CreativeTestingSprintPage() {
  const [service, setService] = useState('paid')

  useEffect(() => {
    const previousTitle = document.title
    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content')

    document.title = PAGE_TITLE
    meta?.setAttribute('content', PAGE_DESCRIPTION)

    return () => {
      document.title = previousTitle
      if (previousDescription != null) meta?.setAttribute('content', previousDescription)
    }
  }, [])

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
