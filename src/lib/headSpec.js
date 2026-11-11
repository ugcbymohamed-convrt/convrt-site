/* What a page's <head> should contain, as plain data. ONE definition used by both:
   • useDocumentHead (client): upserts these tags after load, and removes them when the page unmounts
   • the prerenderer (build): writes the same tags into each route's static HTML
   so the HTML a crawler reads and the head a browser ends up with are identical by construction.

   Params are the ones useDocumentHead has always taken (see that file). */

export function buildHeadSpec({ title, description, url, noindex = false, robots, image, type = 'website', jsonLd, ogTitle, ogDescription }) {
  const metas = [] // { attr: 'name' | 'property', key, content }
  const add = (attr, key, content) => metas.push({ attr, key, content })

  add('name', 'description', description)
  add('property', 'og:title', ogTitle ?? title)
  add('property', 'og:description', ogDescription ?? description)
  add('property', 'og:type', type)
  if (url) add('property', 'og:url', url)
  add('property', 'og:site_name', 'CONVRT')
  add('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  add('name', 'twitter:title', ogTitle ?? title)
  add('name', 'twitter:description', ogDescription ?? description)
  if (image) {
    add('property', 'og:image', image)
    add('name', 'twitter:image', image)
  }
  const robotsValue = robots ?? (noindex ? 'noindex' : '')
  if (robotsValue) add('name', 'robots', robotsValue)

  return {
    title,
    metas,
    canonical: url || null,
    jsonLd: jsonLd ? [].concat(jsonLd) : [],
  }
}

/* Marks JSON-LD written into the static HTML, so the client hook can replace (not duplicate) it. */
export const STATIC_JSONLD_ATTR = 'data-blog-jsonld'
export const STATIC_JSONLD_VALUE = 'static'
