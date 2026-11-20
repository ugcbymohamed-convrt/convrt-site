import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import UgcHero from './components/ugc/UgcHero.jsx'
import UgcGallery from './components/ugc/UgcGallery.jsx'
import { ProcessSection } from './components/ugc/UgcProcess.jsx'
import UgcFAQ from './components/ugc/UgcFAQ.jsx'
import UgcFinalCTA from './components/ugc/UgcFinalCTA.jsx'
import SpokespersonProof from './components/spokesperson/SpokespersonProof.jsx'
import { ORGANIC_VISUALS } from './components/organic/OrganicScenes.jsx'
import ContentSystem from './components/organic/ContentSystem.jsx'
import OrganicPackages from './components/organic/OrganicPackages.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { ORGANIC_SOCIAL_FAQ } from './seo/organicSocialFaq.js'
import { selectOrganicHero, selectOrganicGallery } from './content/portfolio.js'
import {
  ORGANIC_HERO, ORGANIC_PAGE_STAGES, ORGANIC_PROCESS, ORGANIC_GALLERY, ORGANIC_PAGE_CTA, ORGANIC_PATH_LABEL, ORGANIC_PROOF, ORGANIC_PROOF_COPY, ORGANIC_PRICING_HREF,
} from './content/organicSocialPage.js'

/* /social-media-video-production: the Organic Social Video Production & Management page. It reuses the UGC and Spokesperson pages' architecture and design system, and each
   section is the same configuration-driven component fed with organic-social content (src/content/organicSocialPage.js):
     1 Hero (UgcHero + the three-phone stage)  ·  2 Showcase gallery with a content-style filter (UgcGallery)
     3 How it works (ProcessSection, four organic scenes) + "Not just more posts. A content system." (ContentSystem)
     4 Proof: the published Graspo organic result (the shared proof section)  ·  5 Packages (a light pointer to /pricing)  ·  6 FAQ (UgcFAQ)  ·  then the final CTA.
   Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js). Videos come ONLY from src/content/portfolio.js entries whose type is
   'organic' (no UGC, spokesperson or homepage-client fallback, ever). Prices, cadence, platforms, terms and FAQ facts: src/seo/businessKnowledge.js. Section order follows the brief:
   the showcase comes before the process. */

const FAQ_CONFIG = {
  items: ORGANIC_SOCIAL_FAQ,
  prefix: 'organic',
  title: <>Organic social video, <span className="text-lime">answered.</span></>,
}

const PROCESS_CONFIG = { ...ORGANIC_PROCESS, stages: ORGANIC_PAGE_STAGES, visuals: ORGANIC_VISUALS }

const PROOF_CONFIG = {
  proof: ORGANIC_PROOF,
  expectations: null, // no filler strip: when there is no verified organic proof the section is simply absent
  headingId: ORGANIC_PROOF_COPY.headingId,
  heading: { eyebrow: ORGANIC_PROOF_COPY.eyebrow, title: ORGANIC_PROOF_COPY.title },
  track: ORGANIC_PROOF_COPY.track,
}

function ProcessFooter() {
  return (
    <>
      <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">
        What each stage includes depends on your package or custom brief. See{' '}
        <a href={ORGANIC_PRICING_HREF} className="font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime">pricing and terms</a>.
      </p>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-muted">Scenes are illustrative. The portraits are for illustration only.</p>
    </>
  )
}

export default function OrganicSocialVideoPage() {
  useDocumentHead(pageHead(PATHS.socialMediaVideoProduction))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('organic_page_view')
  }, [])

  const heroItems = selectOrganicHero()
  const galleryItems = selectOrganicGallery()

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href="/" className="transition-colors hover:text-ink">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">{ORGANIC_PATH_LABEL}</li>
        </ol>
      </nav>
      <UgcHero items={heroItems} config={ORGANIC_HERO} />
      <UgcGallery items={galleryItems} config={ORGANIC_GALLERY} />
      <SectionDivider />
      <ProcessSection config={PROCESS_CONFIG} footer={<ProcessFooter />}>
        <ContentSystem />
      </ProcessSection>
      <SectionDivider />
      <SpokespersonProof config={PROOF_CONFIG} />
      <SectionDivider />
      <OrganicPackages />
      <SectionDivider />
      <UgcFAQ config={FAQ_CONFIG} />
      <SectionDivider />
      <UgcFinalCTA config={ORGANIC_PAGE_CTA} />
    </>
  )
}
