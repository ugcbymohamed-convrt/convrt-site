import { useEffect } from 'react'

/* Sets <title>, description, Open Graph / Twitter tags, canonical and
   (optionally) robots noindex for a page, and restores the previous state on
   unmount. Same behaviour as the head handling in RoadmapPage.jsx, extracted
   so new pages don't copy it.

   Optional extras (used by the blog; existing callers are unaffected):
   • robots   — full directive string, e.g. 'noindex, follow'. Wins over `noindex`.
   • image    — absolute URL for og:image / twitter:image (switches the card to large).
   • type     — og:type, default 'website' ('article' for blog posts).
   • ogTitle / ogDescription — social copy when it should differ from title / description
     (the case studies). Default: the same as title / description.
   • jsonLd   — one JSON-LD object or an array of them, injected as <script type="application/ld+json">. */
export function useDocumentHead({ title, description, url, noindex = false, robots, image, type = 'website', jsonLd, ogTitle, ogDescription }) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const restores = []

    const previousTitle = document.title
    document.title = title
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
      el.setAttribute(contentAttr, '')
      restores.push(() => (created ? el.remove() : el.setAttribute(contentAttr, previous ?? '')))
      return (value) => el.setAttribute(contentAttr, value)
    }
    const meta = (attrs, value) => upsert('meta', attrs, 'content')(value)

    meta({ name: 'description' }, description)
    meta({ property: 'og:title' }, ogTitle ?? title)
    meta({ property: 'og:description' }, ogDescription ?? description)
    meta({ property: 'og:type' }, type)
    meta({ property: 'og:url' }, url)
    meta({ property: 'og:site_name' }, 'CONVRT')
    meta({ name: 'twitter:card' }, image ? 'summary_large_image' : 'summary')
    meta({ name: 'twitter:title' }, ogTitle ?? title)
    meta({ name: 'twitter:description' }, ogDescription ?? description)
    if (image) {
      meta({ property: 'og:image' }, image)
      meta({ name: 'twitter:image' }, image)
    }
    const robotsValue = robots ?? (noindex ? 'noindex' : '')
    if (robotsValue) meta({ name: 'robots' }, robotsValue)
    upsert('link', { rel: 'canonical' }, 'href')(url)

    if (jsonLdText) {
      const items = [].concat(JSON.parse(jsonLdText))
      items.forEach((item) => {
        const el = document.createElement('script')
        el.type = 'application/ld+json'
        el.setAttribute('data-blog-jsonld', '')
        el.textContent = JSON.stringify(item)
        document.head.appendChild(el)
        restores.push(() => el.remove())
      })
    }

    return () => restores.reverse().forEach((fn) => fn())
  }, [title, description, url, noindex, robots, image, type, jsonLdText, ogTitle, ogDescription])
}
