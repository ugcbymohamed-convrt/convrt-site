import { useEffect } from 'react'

/* Sets <title>, description, Open Graph / Twitter tags, canonical and
   (optionally) robots noindex for a page, and restores the previous state on
   unmount. Same behaviour as the head handling in RoadmapPage.jsx, extracted
   so new pages don't copy it. */
export function useDocumentHead({ title, description, url, noindex = false }) {
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
    meta({ property: 'og:title' }, title)
    meta({ property: 'og:description' }, description)
    meta({ property: 'og:type' }, 'website')
    meta({ property: 'og:url' }, url)
    meta({ property: 'og:site_name' }, 'CONVRT')
    meta({ name: 'twitter:card' }, 'summary')
    meta({ name: 'twitter:title' }, title)
    meta({ name: 'twitter:description' }, description)
    if (noindex) meta({ name: 'robots' }, 'noindex')
    upsert('link', { rel: 'canonical' }, 'href')(url)

    return () => restores.reverse().forEach((fn) => fn())
  }, [title, description, url, noindex])
}
