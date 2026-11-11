import { lazy, Suspense, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Credibility from './components/Credibility.jsx'
import CaseStudies from './components/CaseStudies.jsx'
import Services from './components/Services.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Testimonials from './components/Testimonials.jsx'
import FAQ from './components/FAQ.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { BLOG_PATH, REFERRALS_PATH } from './config.js'
import { PATHS } from './routes.js'
import { scrollToHash } from './lib/scroll.js'

/* Route-level code splitting: every non-home page is its own chunk, fetched only when
   that URL is opened, so the homepage no longer downloads (or parses) the roadmap,
   hooks, risk-free, case-study, pricing and /scale code. */
const CreativeTestingSprintPage = lazy(() => import('./CreativeTestingSprintPage.jsx'))
const CaseStudiesPage = lazy(() => import('./CaseStudiesPage.jsx'))
const ScalePage = lazy(() => import('./ScalePage.jsx'))
const RoadmapPage = lazy(() => import('./RoadmapPage.jsx'))
const FreeHooksPage = lazy(() => import('./FreeHooksPage.jsx'))
const RiskFreePage = lazy(() => import('./RiskFreePage.jsx'))
const ReferralsPage = lazy(() => import('./ReferralsPage.jsx'))
const BlogPage = lazy(() => import('./BlogPage.jsx'))
const BlogArticlePage = lazy(() => import('./BlogArticlePage.jsx'))
const NotFoundPage = lazy(() => import('./NotFoundPage.jsx'))

/* Every path here must also be listed in src/routes.js (tests enforce it): the build writes a real
   HTML file per listed path, and the host answers any other URL with HTTP 404. */
const ROUTES = {
  [PATHS.pricing]: CreativeTestingSprintPage,
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
  return (
    <>
      <Hero />
      <Credibility />
      <SectionDivider />
      <CaseStudies />
      <SectionDivider />
      <Services />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <FinalCTA />
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
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/'
  const Page = resolvePage(path)

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
