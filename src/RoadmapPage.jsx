import { useEffect, useRef } from 'react'
import SectionDivider from './components/SectionDivider.jsx'
import RoadmapHero from './components/roadmap/RoadmapHero.jsx'
import RoadmapApplication from './components/roadmap/RoadmapApplication.jsx'
import RoadmapFAQ from './components/roadmap/RoadmapFAQ.jsx'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { OFFER_PATHS, SITE_URL, ROADMAP_INDEXABLE } from './config.js'

const PAGE_TITLE = 'Free Creative Growth Roadmap | 5 Ad Concepts Worth Testing | CONVRT'
const PAGE_DESCRIPTION =
  'Apply for five ad concepts worth testing, tailored to your SaaS or e-commerce brand. Walk through the creative angles and hooks with CONVRT in a free strategy session.'
const PAGE_URL = `${SITE_URL}${OFFER_PATHS.roadmap}`

/* Sets <title> and the page's meta/link tags, and restores the previous state
   on unmount. Robots stays `noindex` until ROADMAP_INDEXABLE (config.js) is
   flipped at launch. */
function useHeadTags() {
  useEffect(() => {
    const restores = []

    const previousTitle = document.title
    document.title = PAGE_TITLE
    restores.push(() => { document.title = previousTitle })

    const upsert = (tag, attrs, contentAttr) => {
      const keyAttr = Object.keys(attrs)[0]
      let el = document.head.querySelector(`${tag}[${keyAttr}="${attrs[keyAttr]}"]`)
      const created = !el
      if (!el) {
        el = document.createElement(tag)
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
        document.head.appendChild(el)
      }
      const previous = el.getAttribute(contentAttr)
      return { el, created, previous, set: (value) => el.setAttribute(contentAttr, value) }
    }
    const meta = (attrs, value) => {
      const m = upsert('meta', attrs, 'content')
      m.set(value)
      restores.push(() => (m.created ? m.el.remove() : m.el.setAttribute('content', m.previous ?? '')))
    }

    meta({ name: 'description' }, PAGE_DESCRIPTION)
    meta({ property: 'og:title' }, PAGE_TITLE)
    meta({ property: 'og:description' }, PAGE_DESCRIPTION)
    meta({ property: 'og:type' }, 'website')
    meta({ property: 'og:url' }, PAGE_URL)
    meta({ property: 'og:site_name' }, 'CONVRT')
    meta({ name: 'twitter:card' }, 'summary')
    meta({ name: 'twitter:title' }, PAGE_TITLE)
    meta({ name: 'twitter:description' }, PAGE_DESCRIPTION)
    if (!ROADMAP_INDEXABLE) meta({ name: 'robots' }, 'noindex')

    const canonical = upsert('link', { rel: 'canonical' }, 'href')
    canonical.set(PAGE_URL)
    restores.push(() => (canonical.created ? canonical.el.remove() : canonical.el.setAttribute('href', canonical.previous ?? '')))

    return () => restores.reverse().forEach((fn) => fn())
  }, [])
}

export default function RoadmapPage() {
  useHeadTags()

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('roadmap_page_view')
  }, [])

  return (
    <>
      <RoadmapHero />
      <SectionDivider />
      <RoadmapApplication />
      <SectionDivider />
      <RoadmapFAQ />
    </>
  )
}
