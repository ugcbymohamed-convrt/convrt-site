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
import { selectOrganicHero, selectOrganicGallery, forPageLanguage } from './content/portfolio.js'
import { ORGANIC_CTA } from './seo/businessKnowledge.js'
import {
  ORGANIC_HERO, ORGANIC_PAGE_STAGES, ORGANIC_PROCESS, ORGANIC_GALLERY, ORGANIC_PAGE_CTA, ORGANIC_PATH_LABEL, ORGANIC_PROOF, ORGANIC_PROOF_COPY, ORGANIC_PRICING_HREF, ORGANIC_SCOPE_NOTE,
} from './content/organicSocialPage.js'
import { currentLocale } from './i18n/locale.js'
import { tr, T, hrefFor } from './i18n/tr.js'

/* /social-media-video-production: the Organic Social Video Production & Management page. It reuses the UGC and Spokesperson pages' architecture and design system, and each
   section is the same configuration-driven component fed with organic-social content (src/content/organicSocialPage.js):
     1 Hero (UgcHero + the three-phone stage)
     2 How it works (ProcessSection, four organic scenes) + "Not just more posts. A content system." (ContentSystem)  ·  3 Showcase gallery with a content-style filter (UgcGallery)
     4 Proof: the published Graspo organic result (the shared proof section)  ·  5 Packages (a light pointer to /pricing)  ·  6 FAQ (UgcFAQ)  ·  then the final CTA.
   Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js). Videos come ONLY from src/content/portfolio.js entries whose type is
   'organic' (no UGC, spokesperson or homepage-client fallback, ever). Prices, cadence, platforms, terms and FAQ facts: src/seo/businessKnowledge.js. Section order (owner, Nov 2026):
   how it works and the content system come before the showcase, as on the Spokesperson page. */

const FAQ_CONFIG = {
  items: ORGANIC_SOCIAL_FAQ,
  prefix: 'organic',
  title: <><T>Organic social video,</T>{' '}<span className="text-lime"><T>answered.</T></span></>,
}

const PROCESS_CONFIG = { ...ORGANIC_PROCESS, stages: ORGANIC_PAGE_STAGES, visuals: ORGANIC_VISUALS }

const PROOF_CONFIG = {
  proof: ORGANIC_PROOF,
  expectations: null, // no filler strip: when there is no verified organic proof the section is simply absent
  headingId: ORGANIC_PROOF_COPY.headingId,
  heading: { eyebrow: ORGANIC_PROOF_COPY.eyebrow, title: ORGANIC_PROOF_COPY.title, esIntro: 'Here is how we helped Graspo reach new audiences and generate commercial opportunities.' },
  track: ORGANIC_PROOF_COPY.track,
  // The Roadmap is a paid-ads offer, so the button under the Graspo result is the organic strategy call (same route as the hero and the final CTA).
  cta: { label: ORGANIC_CTA.label, href: ORGANIC_CTA.href, external: ORGANIC_CTA.external },
}

function ProcessFooter() {
  return (
    <>
      <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">
        {tr('What each stage includes depends on your package or custom brief. See')}{' '}
        <a href={hrefFor(ORGANIC_PRICING_HREF)} className="font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime">{tr('pricing and terms')}</a>.
      </p>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">{tr(ORGANIC_SCOPE_NOTE)}</p>
      {currentLocale() !== 'es' && <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-muted">{tr('Scenes are illustrative. The portraits are for illustration only.')}</p>}
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

  const heroItems = forPageLanguage(selectOrganicHero())
  const galleryItems = forPageLanguage(selectOrganicGallery())

  return (
    <>
      <nav aria-label={tr('Breadcrumb')} className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href={hrefFor('/')} className="transition-colors hover:text-ink">{tr('Home')}</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">{tr(ORGANIC_PATH_LABEL)}</li>
        </ol>
      </nav>
      <UgcHero items={heroItems} config={ORGANIC_HERO} />
      <SectionDivider />
      <ProcessSection config={PROCESS_CONFIG} footer={<ProcessFooter />}>
        <ContentSystem />
      </ProcessSection>
      {currentLocale() !== 'es' && <UgcGallery items={galleryItems} config={ORGANIC_GALLERY} />}
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
