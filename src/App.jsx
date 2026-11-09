import { lazy, Suspense, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import ResultsStrip from './components/ResultsStrip.jsx'
import Credibility from './components/Credibility.jsx'
import CaseStudies from './components/CaseStudies.jsx'
import Services from './components/Services.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Founder from './components/Founder.jsx'
import Testimonials from './components/Testimonials.jsx'
import FAQ from './components/FAQ.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import { OFFER_PATHS } from './config.js'
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

const ROUTES = {
  '/pricing': CreativeTestingSprintPage,
  '/case-studies': CaseStudiesPage,
  '/case-studies/graspo': CaseStudiesPage,
  '/case-studies/elyon': CaseStudiesPage,
  // Paid-acquisition landing page. Intentionally not linked from Nav/Footer/Sitemap — see ScalePage.jsx.
  '/scale': ScalePage,
  // Homepage offer destinations.
  [OFFER_PATHS.roadmap]: RoadmapPage,
  [OFFER_PATHS.hooks]: FreeHooksPage,
  [OFFER_PATHS.riskFree]: RiskFreePage,
}

function HomePage() {
  return (
    <>
      <Hero />
      <ResultsStrip />
      <Credibility />
      <SectionDivider />
      <CaseStudies />
      <SectionDivider />
      <Services />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <Founder />
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
  const Page = ROUTES[path]

  return (
    <div className="bg-canvas text-ink min-h-screen antialiased">
      <Nav />
      <main>
        <Suspense fallback={PageFallback}>
          {Page ? <Page /> : <HomePage />}
          <HashScroller />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
