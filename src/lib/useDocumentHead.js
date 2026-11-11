import { useEffect } from 'react'
import { buildHeadSpec, STATIC_JSONLD_ATTR, STATIC_JSONLD_VALUE } from './headSpec.js'

/* Sets <title>, description, Open Graph / Twitter tags, canonical and
   (optionally) robots noindex for a page, and restores the previous state on
   unmount. Same behaviour as the head handling in RoadmapPage.jsx, extracted
   so new pages don't copy it.

   Optional extras (used by the blog; existing callers are unaffected):
   • url      — omit it (e.g. the 404 page) to set neither og:url nor a canonical.
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
    const spec = buildHeadSpec({ title, description, url, noindex, robots, image, type, jsonLd: jsonLdText ? JSON.parse(jsonLdText) : undefined, ogTitle, ogDescription })

    const previousTitle = document.title
    document.title = spec.title
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

    // Static HTML (see the prerenderer) already carries these tags; upsert finds and re-sets them,
    // so there is never a second copy.
    spec.metas.forEach(({ attr, key, content }) => upsert('meta', { [attr]: key }, 'content')(content))
    if (spec.canonical) upsert('link', { rel: 'canonical' }, 'href')(spec.canonical)

    if (spec.jsonLd.length) {
      // Replace the prerendered copies (same data) rather than adding a second set.
      document.head.querySelectorAll(`script[${STATIC_JSONLD_ATTR}="${STATIC_JSONLD_VALUE}"]`).forEach((n) => n.remove())
      spec.jsonLd.forEach((item) => {
        const el = document.createElement('script')
        el.type = 'application/ld+json'
        el.setAttribute(STATIC_JSONLD_ATTR, '')
        el.textContent = JSON.stringify(item)
        document.head.appendChild(el)
        restores.push(() => el.remove())
      })
    }

    return () => restores.reverse().forEach((fn) => fn())
  }, [title, description, url, noindex, robots, image, type, jsonLdText, ogTitle, ogDescription])
}
