import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
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
import CreativeTestingSprintPage from './CreativeTestingSprintPage.jsx'

const ROUTES = {
  '/pricing': CreativeTestingSprintPage,
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
