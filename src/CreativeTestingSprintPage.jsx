import { useEffect } from 'react'
import CreativeTestingHero from './components/CreativeTestingHero.jsx'
import CreativeTestingOffer from './components/CreativeTestingOffer.jsx'
import CreativeTestingProcess from './components/CreativeTestingProcess.jsx'
import CreativeTestingNextStep from './components/CreativeTestingNextStep.jsx'
import SectionDivider from './components/SectionDivider.jsx'

const PAGE_TITLE = 'Creative Testing Sprint | CONVRT'
const PAGE_DESCRIPTION =
  'Develop distinct paid-social concepts, scripts, creators, hooks, and platform-ready ad variations with the CONVRT Creative Testing Sprint.'

export default function CreativeTestingSprintPage() {
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
      <CreativeTestingOffer />
      <SectionDivider />
      <CreativeTestingProcess />
      <SectionDivider />
      <CreativeTestingNextStep />
    </>
  )
}
