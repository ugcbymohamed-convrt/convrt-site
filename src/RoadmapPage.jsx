import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import RoadmapHero from './components/roadmap/RoadmapHero.jsx'
import RoadmapApplication from './components/roadmap/RoadmapApplication.jsx'
import RoadmapFAQ from './components/roadmap/RoadmapFAQ.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { OFFER_PATHS } from './config.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'

export default function RoadmapPage() {
  useDocumentHead(pageHead(OFFER_PATHS.roadmap))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('roadmap_page_view')
  }, [])

  return (
    <>
      <RoadmapHero />
      <SectionDivider />
      <RoadmapApplication />
      <SectionDivider />
      <RoadmapFAQ />
    </>
  )
}
