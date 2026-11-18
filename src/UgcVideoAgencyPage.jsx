import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import UgcHero from './components/ugc/UgcHero.jsx'
import UgcDefinition from './components/ugc/UgcDefinition.jsx'
import UgcWork from './components/ugc/UgcWork.jsx'
import UgcBatch from './components/ugc/UgcBatch.jsx'
import UgcProcess from './components/ugc/UgcProcess.jsx'
import UgcCraft from './components/ugc/UgcCraft.jsx'
import UgcPricing from './components/ugc/UgcPricing.jsx'
import UgcRights from './components/ugc/UgcRights.jsx'
import UgcFit from './components/ugc/UgcFit.jsx'
import UgcFAQ from './components/ugc/UgcFAQ.jsx'
import UgcFinalCTA from './components/ugc/UgcFinalCTA.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { selectDisplayable } from './content/ugcPortfolio.js'

/* /ugc-video-agency: the UGC service page.
     1 Hero · 2 What a UGC agency does · 3 Selected work · 4 What's in a batch · 5 How it works ·
     6 Creators, scripts and quality control · 7 Pricing · 8 Usage rights · 9 Best suited to · 10 FAQ · 11 Final CTA
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

  const items = selectDisplayable()

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href="/" className="transition-colors hover:text-ink">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">UGC Video Agency</li>
        </ol>
      </nav>
      <UgcHero items={items} />
      <SectionDivider />
      <UgcDefinition />
      <SectionDivider />
      <UgcWork items={items} />
      <SectionDivider />
      <UgcBatch />
      <SectionDivider />
      <UgcProcess />
      <SectionDivider />
      <UgcCraft />
      <SectionDivider />
      <UgcPricing />
      <SectionDivider />
      <UgcRights />
      <SectionDivider />
      <UgcFit />
      <SectionDivider />
      <UgcFAQ />
      <SectionDivider />
      <UgcFinalCTA />
    </>
  )
}
