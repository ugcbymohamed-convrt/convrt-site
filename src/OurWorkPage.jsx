import { useEffect, useRef } from 'react'
import OurWorkHero from './components/ourwork/OurWorkHero.jsx'
import PortfolioLibrary from './components/ourwork/PortfolioLibrary.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { selectOurWork } from './content/portfolio.js'

/* /creator-showcase: the video portfolio. Two sections only: 1 a compact hero, 2 the filterable video library.
   Every video comes from src/content/portfolio.js (approved items only), the same file the UGC page and the homepage read.
   Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js). The static HTML already contains
   the H1, the intro and the first page of video cards, so crawlers do not need the filtering script. */
export default function OurWorkPage() {
  useDocumentHead(pageHead(PATHS.showcase))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('our_work_page_view')
  }, [])

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href="/" className="transition-colors hover:text-ink">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">Our Work</li>
        </ol>
      </nav>
      <OurWorkHero />
      <PortfolioLibrary items={selectOurWork()} />
    </>
  )
}
