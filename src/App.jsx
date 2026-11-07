import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Credibility from './components/Credibility.jsx'
import StartHereOffers from './components/StartHereOffers.jsx'
import CaseStudies from './components/CaseStudies.jsx'
import Services from './components/Services.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Founder from './components/Founder.jsx'
import Testimonials from './components/Testimonials.jsx'
import FAQ from './components/FAQ.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import SectionDivider from './components/SectionDivider.jsx'
import CreativeTestingSprintPage from './CreativeTestingSprintPage.jsx'
import CaseStudiesPage from './CaseStudiesPage.jsx'
import ScalePage from './ScalePage.jsx'
import RoadmapPage from './RoadmapPage.jsx'
import FreeHooksPage from './FreeHooksPage.jsx'
import RiskFreePage from './RiskFreePage.jsx'
import { OFFER_PATHS } from './config.js'

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
      <Credibility />
      <StartHereOffers />
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

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/'
  const Page = ROUTES[path]

  return (
    <div className="bg-canvas text-ink min-h-screen antialiased">
      <Nav />
      <main>{Page ? <Page /> : <HomePage />}</main>
      <Footer />
    </div>
  )
}
