import { lazy, Suspense, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Credibility from './components/Credibility.jsx'
import CaseStudies from './components/CaseStudies.jsx'
import Services from './components/Services.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Testimonials from './components/Testimonials.jsx'
import IndustryShowcase from './components/home/IndustryShowcase.jsx'
import ClientReviews from './components/home/ClientReviews.jsx'
import FAQ from './components/FAQ.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import FreeVideoOffer from './components/FreeVideoOffer.jsx'
import Footer from './components/Footer.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { BLOG_PATH, REFERRALS_PATH } from './config.js'
import { PATHS, PRIVATE_PATHS } from './routes.js'
import { scrollToHash } from './lib/scroll.js'
import { parsePath } from './i18n/paths.js'
import { currentLocale } from './i18n/locale.js'
import { hasTranslation } from './i18n/registry.js'
import { BUILT_LOCALES } from './i18n/locales.js'

/* Route-level code splitting: every non-home page is its own chunk, fetched only when
   that URL is opened, so the homepage no longer downloads (or parses) the roadmap,
   hooks, risk-free, case-study, pricing and /scale code. */
/* The English homepage's creator carousel sits far below the fold: its code is a separate chunk (it is still rendered into the static HTML at build time, and the browser fetches the chunk only to hydrate it). */
const HomeCreators = lazy(() => import('./components/home/HomeCreators.jsx'))
const CreativeTestingSprintPage = lazy(() => import('./CreativeTestingSprintPage.jsx'))
const UgcVideoAgencyPage = lazy(() => import('./UgcVideoAgencyPage.jsx'))
const SpokespersonVideoPage = lazy(() => import('./SpokespersonVideoPage.jsx'))
const OrganicSocialVideoPage = lazy(() => import('./OrganicSocialVideoPage.jsx'))
const SaasVideoPage = lazy(() => import('./SaasVideoPage.jsx'))
const OurWorkPage = lazy(() => import('./OurWorkPage.jsx'))
const CaseStudiesPage = lazy(() => import('./CaseStudiesPage.jsx'))
const ScalePage = lazy(() => import('./ScalePage.jsx'))
const RoadmapPage = lazy(() => import('./RoadmapPage.jsx'))
const FreeHooksPage = lazy(() => import('./FreeHooksPage.jsx'))
const RiskFreePage = lazy(() => import('./RiskFreePage.jsx'))
const ReferralsPage = lazy(() => import('./ReferralsPage.jsx'))
const BlogPage = lazy(() => import('./BlogPage.jsx'))
const TrustPage = lazy(() => import('./TrustPage.jsx'))
const BlogArticlePage = lazy(() => import('./BlogArticlePage.jsx'))
const NotFoundPage = lazy(() => import('./NotFoundPage.jsx'))
// Private, invitation-only creator pages (see PRIVATE_PATHS in src/routes.js). Standalone: no Nav, no Footer.
const CreatorOnboardingPage = lazy(() => import('./CreatorOnboardingPage.jsx'))
const CreatorLegalPage = lazy(() => import('./CreatorLegalPage.jsx'))
const CreatorAdminPage = lazy(() => import('./CreatorAdminPage.jsx'))

/* Every path here must also be listed in src/routes.js (tests enforce it): the build writes a real
   HTML file per listed path, and the host answers any other URL with HTTP 404. */
const ROUTES = {
  [PATHS.pricing]: CreativeTestingSprintPage,
  // UGC service page (SEO phase 2).
  [PATHS.ugcVideoAgency]: UgcVideoAgencyPage,
  // Spokesperson service page: the same architecture as the UGC page, with its own content and its own videos.
  [PATHS.spokespersonVideoProduction]: SpokespersonVideoPage,
  // Organic Social service page: the same architecture, with its own content and its own videos.
  [PATHS.socialMediaVideoProduction]: OrganicSocialVideoPage,
  // SaaS service page: the same architecture, with its own content, its own visuals and its own videos.
  [PATHS.saasVideoProduction]: SaasVideoPage,
  // Creator Showcase (route stays /creator-showcase): the filterable video library (src/content/portfolio.js).
  [PATHS.showcase]: OurWorkPage,
  [PATHS.caseStudies]: CaseStudiesPage,
  [PATHS.caseStudyGraspo]: CaseStudiesPage,
  [PATHS.caseStudyElyon]: CaseStudiesPage,
  // Paid-acquisition landing page. Intentionally not linked from Nav/Footer/Sitemap — see ScalePage.jsx.
  [PATHS.scale]: ScalePage,
  // Homepage offer destinations.
  [PATHS.roadmap]: RoadmapPage,
  [PATHS.hooks]: FreeHooksPage,
  [PATHS.riskFree]: RiskFreePage,
  // Referral Partner Program. Linked from the footer only (not the main nav).
  [REFERRALS_PATH]: ReferralsPage,
  // The Blog index. Individual articles live at /blog/<slug> (see resolvePage).
  [PATHS.blog]: BlogPage,
  // About, Contact, Privacy Policy and Terms (drafts until TRUST_PAGES_PUBLISHED, see src/config.js): one template, content in src/content/trustPages.js.
  [PATHS.about]: TrustPage,
  [PATHS.contact]: TrustPage,
  [PATHS.privacy]: TrustPage,
  [PATHS.terms]: TrustPage,
  [PATHS.legalNotice]: TrustPage,
}

const PRIVATE_ROUTES = {
  [PRIVATE_PATHS.creatorOnboarding]: CreatorOnboardingPage,
  [PRIVATE_PATHS.creatorAgreement]: CreatorLegalPage,
  [PRIVATE_PATHS.creatorPrivacy]: CreatorLegalPage,
  [PRIVATE_PATHS.creatorAdmin]: CreatorAdminPage,
}

/* /blog/<slug> → the article template (the host only serves published slugs; anything else is a
   404 whose page shows the article template's own not-found state). Any other unknown path →
   null, which renders NotFoundPage — never the homepage. */
function resolvePage(path) {
  if (ROUTES[path]) return ROUTES[path]
  if (path.startsWith(`${BLOG_PATH}/`)) return BlogArticlePage
  return null
}

function HomePage() {
  /* English homepage narrative (design review, Nov 2026): credibility → client work (one connected block, no divider between them) → services → process → creators → reviews → conversion.
     Other languages keep their own homepage sections until their separate design review. */
  const locale = currentLocale()
  /* English and Arabic share the redesigned composition (Arabic: owner brief 2026-11-23, same components with Arabic data); Spanish keeps its own sections until its design review. */
  const en = locale === 'en' || locale === 'ar'
  return (
    <>
      <Hero />
      <Credibility />
      {en ? <IndustryShowcase /> : (<><SectionDivider /><CaseStudies /></>)}
      <SectionDivider />
      <Services />
      <SectionDivider />
      {/* Translated homepages only: the secondary free-video offer (the English hero already carries it). */}
      {!en && (<><FreeVideoOffer /><SectionDivider /></>)}
      <HowItWorks />
      {/* The creator carousel draws its own leading divider. */}
      {en && <><Suspense fallback={<div aria-hidden="true" className="min-h-[760px]" />}><HomeCreators /></Suspense><SectionDivider /></>}
      {!en && <SectionDivider />}
      {en ? <ClientReviews /> : <Testimonials />}
      <SectionDivider />
      <FinalCTA attributed />
      <SectionDivider />
      <FAQ />
    </>
  )
}

/* Renders nothing. Mounted next to the page inside <Suspense>, so it runs only once the
   page's DOM exists, and honors `/page#section` URLs that the browser can't resolve
   itself because the content is rendered client-side. */
function HashScroller() {
  useEffect(() => { scrollToHash() }, [])
  return null
}

/* Reserves a screen of height while a route chunk loads, so the footer never jumps. */
const PageFallback = <div className="min-h-[100svh]" aria-hidden="true" />

export default function App() {
  const rawPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/'
  // /es/pricing → locale 'es', path '/pricing' (the English base path every route above is keyed by). A page that does not exist in the requested
  // language (or a language that is not built yet, like /fr/…) is never faked from English: it renders the not-found page (the host sends a real 404).
  const { locale, basePath } = parsePath(rawPath)
  const translated = locale === 'en' || (BUILT_LOCALES.includes(locale) && hasTranslation(locale, basePath))
  const path = translated ? basePath : '/__not-found__'
  const Page = resolvePage(path)

  // Private creator pages render their own minimal header: no site navigation, footer or sales CTA.
  const PrivatePage = locale === 'en' ? PRIVATE_ROUTES[path] : undefined
  if (PrivatePage) {
    return (
      <div className="bg-canvas text-ink min-h-screen antialiased">
        <Suspense fallback={PageFallback}>
          <PrivatePage />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="bg-canvas text-ink min-h-screen antialiased">
      <Nav />
      <main>
        <Suspense fallback={PageFallback}>
          {path === PATHS.home ? <HomePage /> : Page ? <Page /> : <NotFoundPage />}
          <HashScroller />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
