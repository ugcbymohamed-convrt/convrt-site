import { useEffect } from 'react'
import { buildHeadSpec, STATIC_JSONLD_ATTR, STATIC_JSONLD_VALUE } from './headSpec.js'

/* Sets <title>, description, Open Graph / Twitter tags, canonical and
   (optionally) robots noindex for a page, and restores the previous state on
   unmount. Same behaviour as the head handling in RoadmapPage.jsx, extracted
   so new pages don't copy it.

   Optional extras (used by the blog; existing callers are unaffected):
   • url      — omit it (e.g. the 404 page) to set neither og:url nor a canonical.
   • robots   — full directive string, e.g. 'noindex, follow'. Wins over `noindex`.
   • image    — absolute URL for og:image / twitter:image (switches the card to large). imageAlt / imageWidth / imageHeight add the matching
                og:image:alt, twitter:image:alt and og:image:width/height tags.
   • type     — og:type, default 'website' ('article' for blog posts).
   • ogTitle / ogDescription — social copy when it should differ from title / description
     (the case studies). Default: the same as title / description.
   • jsonLd   — one JSON-LD object or an array of them, injected as <script type="application/ld+json">. */
export function useDocumentHead({ title, description, url, noindex = false, robots, image, imageAlt, imageWidth, imageHeight, type = 'website', jsonLd, ogTitle, ogDescription, lang, dir, ogLocale, alternates }) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : ''
  const alternatesText = alternates ? JSON.stringify(alternates) : ''
  useEffect(() => {
    const restores = []
    const spec = buildHeadSpec({ title, description, url, noindex, robots, image, imageAlt, imageWidth, imageHeight, type, jsonLd: jsonLdText ? JSON.parse(jsonLdText) : undefined, ogTitle, ogDescription, lang, dir, ogLocale, alternates: alternatesText ? JSON.parse(alternatesText) : undefined })

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
    spec.metas.filter((m) => m.key !== 'og:locale:alternate').forEach(({ attr, key, content }) => upsert('meta', { [attr]: key }, 'content')(content))
    // og:locale:alternate repeats (one tag per other language): replace the prerendered set with the same set, never a second copy.
    const ogAlternates = spec.metas.filter((m) => m.key === 'og:locale:alternate')
    if (ogAlternates.length) {
      document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((n) => n.remove())
      ogAlternates.forEach(({ content }) => {
        const el = document.createElement('meta')
        el.setAttribute('property', 'og:locale:alternate')
        el.setAttribute('content', content)
        document.head.appendChild(el)
        restores.push(() => el.remove())
      })
    }
    if (spec.canonical) upsert('link', { rel: 'canonical' }, 'href')(spec.canonical)

    // Language of the document (matters in `npm run dev` and for client-only renders; the static HTML already carries it).
    if (spec.lang) {
      const root = document.documentElement
      const prevLang = root.getAttribute('lang')
      const prevDir = root.getAttribute('dir')
      root.setAttribute('lang', spec.lang)
      if (spec.dir === 'rtl') root.setAttribute('dir', 'rtl')
      restores.push(() => {
        prevLang === null ? root.removeAttribute('lang') : root.setAttribute('lang', prevLang)
        prevDir === null ? root.removeAttribute('dir') : root.setAttribute('dir', prevDir)
      })
    }

    // hreflang: replace whatever the static HTML carried with the same set (never a second copy).
    if (spec.alternates.length) {
      document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove())
      spec.alternates.forEach((a) => {
        const el = document.createElement('link')
        el.rel = 'alternate'
        el.setAttribute('hreflang', a.hreflang)
        el.href = a.href
        document.head.appendChild(el)
        restores.push(() => el.remove())
      })
    }

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
  }, [title, description, url, noindex, robots, image, imageAlt, imageWidth, imageHeight, type, jsonLdText, ogTitle, ogDescription, lang, dir, ogLocale, alternatesText])
}
