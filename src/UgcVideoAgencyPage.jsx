import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import UgcHero from './components/ugc/UgcHero.jsx'
import UgcGallery from './components/ugc/UgcGallery.jsx'
import UgcProcess from './components/ugc/UgcProcess.jsx'
import UgcResults from './components/ugc/UgcResults.jsx'
import UgcFAQ from './components/ugc/UgcFAQ.jsx'
import UgcFinalCTA from './components/ugc/UgcFinalCTA.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { selectHero, selectGallery } from './content/ugcPortfolio.js'

/* /ugc-video-agency: the UGC service page.
     1 Hero (with the approved-video stage) · 2 How we create and test UGC ads · 3 Our best UGC work (a horizontal gallery of up to 10 approved
     videos, absent until videos exist) · 4 Results & client feedback · 5 FAQ · then a short final CTA. Complete pricing and contract detail lives on /pricing.
   Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js). Prices, terms and
   FAQ answers come from src/seo/businessKnowledge.js; portfolio videos from src/content/ugcPortfolio.js (approved items only). */
export default function UgcVideoAgencyPage() {
  useDocumentHead(pageHead(PATHS.ugcVideoAgency))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('ugc_page_view')
  }, [])

  const heroItems = selectHero()
  const galleryItems = selectGallery()

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href="/" className="transition-colors hover:text-ink">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">UGC Video Agency</li>
        </ol>
      </nav>
      <UgcHero items={heroItems} />
      <SectionDivider />
      <UgcProcess />
      <UgcGallery items={galleryItems} />
      <SectionDivider />
      <UgcResults />
      <SectionDivider />
      <UgcFAQ />
      <SectionDivider />
      <UgcFinalCTA />
    </>
  )
}
