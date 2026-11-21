import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import UgcHero from './components/ugc/UgcHero.jsx'
import UgcGallery from './components/ugc/UgcGallery.jsx'
import { ProcessSection } from './components/ugc/UgcProcess.jsx'
import UgcFAQ from './components/ugc/UgcFAQ.jsx'
import UgcFinalCTA from './components/ugc/UgcFinalCTA.jsx'
import SpokespersonProof from './components/spokesperson/SpokespersonProof.jsx'
import { SAAS_VISUALS } from './components/saas/SaasScenes.jsx'
import SaasFormats from './components/saas/SaasFormats.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { SAAS_FAQ } from './seo/saasFaq.js'
import { selectSaasHero, selectSaasGallery, forPageLanguage } from './content/portfolio.js'
import {
  SAAS_HERO, SAAS_STAGES, SAAS_PROCESS, SAAS_GALLERY, SAAS_CTA, SAAS_PATH_LABEL, SAAS_PROOF, SAAS_EXPECTATIONS, SAAS_PROOF_CONFIG_TRACK,
} from './content/saasPage.js'
import { tr, T, hrefFor } from './i18n/tr.js'

/* /saas-video-production: the SaaS Video Production service page. It reuses the UGC and Spokesperson pages' architecture and design system, and each section is the same
   configuration-driven component fed with SaaS content (src/content/saasPage.js):
     1 Hero (UgcHero + the three-phone stage)  ·  2 How it works (ProcessSection, four SaaS scenes) + "One product. Different ways to bring it to life." (SaasFormats)
     3 SaaS showcase (UgcGallery, with an optional format filter)  ·  4 What to expect / verified results (SpokespersonProof)  ·  5 FAQ (UgcFAQ)  ·  then the final CTA.
   Title, description, canonical, robots and JSON-LD all come from the SEO manifest (src/seo/siteSeo.js). Videos come ONLY from src/content/portfolio.js entries whose type is
   'saas' or that list `alsoOn.saas` (no UGC, spokesperson, organic or homepage-client fallback, ever). Prices, terms and FAQ facts: src/seo/businessKnowledge.js. English only for
   now: the copy, the metadata and the video selection live in separate files so a later localisation can swap them without touching the components. */

const FAQ_CONFIG = {
  items: SAAS_FAQ,
  prefix: 'saas',
  title: <><T>SaaS video production,</T>{' '}<span className="text-lime"><T>answered.</T></span></>,
}

const PROCESS_CONFIG = { ...SAAS_PROCESS, stages: SAAS_STAGES, visuals: SAAS_VISUALS }

const PROOF_CONFIG = {
  proof: SAAS_PROOF,
  expectations: SAAS_EXPECTATIONS,
  headingId: 'saas-proof-heading',
  heading: { eyebrow: 'Results & client feedback', title: 'What clients see. What clients say.' },
  track: SAAS_PROOF_CONFIG_TRACK,
}

function ProcessFooter() {
  return (
    <>
      <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-ink-muted">
        {tr('Scope depends on your approved brief. See')}{' '}
        <a href={hrefFor('/pricing#packages')} className="font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime">{tr('pricing and terms')}</a>.
      </p>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-muted">{tr('Scenes are illustrative. The software shown is generic and the portraits are for illustration only.')}</p>
    </>
  )
}

export default function SaasVideoPage() {
  useDocumentHead(pageHead(PATHS.saasVideoProduction))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('saas_page_view')
  }, [])

  const heroItems = forPageLanguage(selectSaasHero())
  const galleryItems = forPageLanguage(selectSaasGallery())

  return (
    <>
      <nav aria-label={tr('Breadcrumb')} className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href={hrefFor('/')} className="transition-colors hover:text-ink">{tr('Home')}</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">{tr(SAAS_PATH_LABEL)}</li>
        </ol>
      </nav>
      <UgcHero items={heroItems} config={SAAS_HERO} />
      <SectionDivider />
      <ProcessSection config={PROCESS_CONFIG} footer={<ProcessFooter />}>
        <SaasFormats />
      </ProcessSection>
      <UgcGallery items={galleryItems} config={SAAS_GALLERY} />
      <SectionDivider />
      <SpokespersonProof config={PROOF_CONFIG} />
      <SectionDivider />
      <UgcFAQ config={FAQ_CONFIG} />
      <SectionDivider />
      <UgcFinalCTA config={SAAS_CTA} />
    </>
  )
}
