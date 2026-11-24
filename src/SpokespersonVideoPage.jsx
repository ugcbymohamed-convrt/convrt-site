import { useEffect, useRef } from 'react'
import { currentLocale } from './i18n/locale.js'
import SectionDivider from './components/SectionDivider.jsx'
import UgcHero from './components/ugc/UgcHero.jsx'
import UgcGallery from './components/ugc/UgcGallery.jsx'
import { ProcessSection } from './components/ugc/UgcProcess.jsx'
import UgcFAQ from './components/ugc/UgcFAQ.jsx'
import UgcFinalCTA from './components/ugc/UgcFinalCTA.jsx'
import { SPOKESPERSON_VISUALS } from './components/spokesperson/SpokespersonScenes.jsx'
import DeliveryStyles from './components/spokesperson/DeliveryStyles.jsx'
import SpokespersonProof from './components/spokesperson/SpokespersonProof.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { SPOKESPERSON_FAQ } from './seo/spokespersonFaq.js'
import { selectSpokespersonHero, selectSpokespersonGallery, forPageLanguage, orderedBy } from './content/portfolio.js'
import {
  SPOKESPERSON_HERO, SPOKESPERSON_STAGES, SPOKESPERSON_PROCESS, SPOKESPERSON_GALLERY, SPOKESPERSON_CTA, SPOKESPERSON_PATH_LABEL, SPOKESPERSON_VIDEO_ORDER,
} from './content/spokespersonPage.js'
import { tr, T, hrefFor } from './i18n/tr.js'

/* /spokesperson-video-production: the Spokesperson service page. It reuses the UGC page's architecture and design system, and each section is
   the same configuration-driven component fed with spokesperson content (src/content/spokespersonPage.js):
     1 Hero (UgcHero + the three-phone stage)  ·  2 How it works (ProcessSection, four spokesperson scenes) + "One message. Different ways to deliver it."
     3 Spokesperson showcase (UgcGallery)  ·  4 What to expect / verified results (SpokespersonProof)  ·  5 FAQ (UgcFAQ)  ·  then the final CTA.
   Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js). Videos come ONLY from
   src/content/portfolio.js entries whose type is 'spokesperson' (no UGC fallback, ever). Prices, terms and FAQ facts: src/seo/businessKnowledge.js. */

const FAQ_CONFIG = {
  items: SPOKESPERSON_FAQ,
  prefix: 'spokesperson',
  title: <><T>Spokesperson video production,</T>{' '}<span className="text-lime"><T>answered.</T></span></>,
}

const PROCESS_CONFIG = { ...SPOKESPERSON_PROCESS, stages: SPOKESPERSON_STAGES, visuals: SPOKESPERSON_VISUALS }

function ProcessFooter() {
  return (
    <>
      <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">
        {tr('Timelines and deliverables depend on your package or custom brief. See')}{' '}
        <a href={hrefFor('/pricing#packages')} className="font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime">{tr('pricing and terms')}</a>.
      </p>
      {/* Arabic (owner, 2026-11-25): the repeated "scenes are illustrative" line is not shown. */}
      {currentLocale() !== 'ar' && <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-muted">{tr('Scenes are illustrative. The portraits are for illustration only.')}</p>}
    </>
  )
}

export default function SpokespersonVideoPage() {
  useDocumentHead(pageHead(PATHS.spokespersonVideoProduction))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('spokesperson_page_view')
  }, [])

  const heroItems = orderedBy(forPageLanguage(selectSpokespersonHero()), SPOKESPERSON_VIDEO_ORDER.hero)
  const galleryItems = forPageLanguage(selectSpokespersonGallery())

  return (
    <>
      <nav aria-label={tr('Breadcrumb')} className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href={hrefFor('/')} className="transition-colors hover:text-ink">{tr('Home')}</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">{tr(SPOKESPERSON_PATH_LABEL)}</li>
        </ol>
      </nav>
      <UgcHero items={heroItems} config={SPOKESPERSON_HERO} />
      <SectionDivider />
      <ProcessSection config={PROCESS_CONFIG} footer={<ProcessFooter />}>
        <DeliveryStyles />
      </ProcessSection>
      <UgcGallery items={galleryItems} config={SPOKESPERSON_GALLERY} />
      <SectionDivider />
      <SpokespersonProof />
      <SectionDivider />
      <UgcFAQ config={FAQ_CONFIG} />
      <SectionDivider />
      <UgcFinalCTA config={SPOKESPERSON_CTA} />
    </>
  )
}
