/* Blog article schema — the single place that defines what an article is, which
   categories exist, and what counts as "published". Pure functions, no Vite or React,
   so it runs in the build plugin (vite-plugin-blog.js), the browser and `node --test`. */

/* The languages an article can be written in. English lives in src/content/blog/<slug>.md; every other language in src/content/blog/<locale>/<slug>.md (docs/blog-publishing.md). */
export const BLOG_LOCALES = ['en', 'es', 'fr', 'ar']
export const BLOG_DEFAULT_LOCALE = 'en'

export const BLOG_CATEGORIES = [
  { slug: 'ugc-video-ads', label: 'UGC & Video Ads', labels: { es: 'Vídeos UGC y anuncios en vídeo', fr: 'Vidéos UGC et publicités vidéo', ar: 'فيديوهات UGC والإعلانات المصوّرة' } },
  { slug: 'saas-video-marketing', label: 'SaaS Video Marketing', labels: { es: 'Marketing en vídeo para SaaS', fr: 'Marketing vidéo pour SaaS', ar: 'التسويق بالفيديو لبرامج SaaS' } },
  { slug: 'ecommerce-creative', label: 'E-commerce Creative', labels: { es: 'Creatividad para e-commerce', fr: 'Créations pour l’e-commerce', ar: 'محتوى إبداعي للمتاجر الإلكترونية' } },
  { slug: 'creative-strategy', label: 'Creative Strategy', labels: { es: 'Estrategia creativa', fr: 'Stratégie créative', ar: 'الاستراتيجية الإبداعية' } },
]

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const KNOWN_KEYS = new Set([
  'title', 'slug', 'excerpt', 'category', 'status', 'featured', 'image', 'imageAlt', 'author',
  'publishedAt', 'updatedAt', 'seoTitle', 'metaDescription', 'canonicalUrl', 'ogImage',
  'related', 'faq', 'toc', 'noindex', 'translationGroup',
])

/* Accepts the category label ("Creative Strategy") or slug ("creative-strategy"). */
export function resolveCategory(value) {
  if (typeof value !== 'string') return null
  const v = value.trim().toLowerCase()
  return BLOG_CATEGORIES.find((c) => c.slug === v || c.label.toLowerCase() === v) ?? null
}

const isRealDate = (s) => {
  if (!DATE_RE.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

const isUrlOrPath = (s, { allowPath = true } = {}) =>
  /^https?:\/\/\S+$/.test(s) || (allowPath && /^\/[^\s]*$/.test(s) && !s.startsWith('//'))

/* Validate one article's frontmatter. `filename` is the file's base name without
   `.md`; the slug must equal it so a URL can always be traced back to its file.
   Returns { errors: string[], meta }. `meta` is the normalized public shape. */
export function validateFrontmatter(data, filename, locale = BLOG_DEFAULT_LOCALE) {
  const errors = []
  const err = (m) => errors.push(m)

  for (const key of Object.keys(data)) {
    if (!KNOWN_KEYS.has(key)) err(`unknown field "${key}" (check spelling; see docs/blog-publishing.md)`)
  }

  const str = (key, { required = false, max } = {}) => {
    const v = data[key]
    if (v === undefined || v === '' || v === null) {
      if (required) err(`"${key}" is required`)
      return undefined
    }
    if (typeof v !== 'string') { err(`"${key}" must be text`); return undefined }
    if (max && v.length > max) err(`"${key}" is ${v.length} characters; keep it under ${max}`)
    return v.trim()
  }
  const bool = (key) => {
    const v = data[key]
    if (v === undefined || v === '') return false
    if (typeof v !== 'boolean') { err(`"${key}" must be true or false`); return false }
    return v
  }

  const status = data.status === undefined ? 'draft' : data.status
  if (status !== 'draft' && status !== 'published') err('"status" must be "draft" or "published"')
  const published = status === 'published'

  const title = str('title', { required: true, max: 120 })
  const slug = str('slug') ?? filename
  if (!SLUG_RE.test(slug)) err(`slug "${slug}" must be lowercase letters, numbers and hyphens`)
  if (slug !== filename) err(`slug "${slug}" must match the file name "${filename}.md"`)
  const excerpt = str('excerpt', { required: true, max: 300 })

  const category = resolveCategory(data.category)
  if (!category) {
    err(`"category" must be one of: ${BLOG_CATEGORIES.map((c) => c.label).join(' | ')}`)
  }

  const image = str('image')
  const imageAlt = str('imageAlt')
  if (image && !isUrlOrPath(image)) err('"image" must be a /path or https:// URL')
  if (image && !imageAlt) err('"imageAlt" is required when "image" is set')
  const ogImage = str('ogImage')
  if (ogImage && !isUrlOrPath(ogImage)) err('"ogImage" must be a /path or https:// URL')

  const author = str('author', { required: published })
  const publishedAt = str('publishedAt', { required: published })
  const updatedAt = str('updatedAt')
  if (publishedAt && !isRealDate(publishedAt)) err('"publishedAt" must be a real date as YYYY-MM-DD')
  if (updatedAt && !isRealDate(updatedAt)) err('"updatedAt" must be a real date as YYYY-MM-DD')
  if (publishedAt && updatedAt && isRealDate(publishedAt) && isRealDate(updatedAt) && updatedAt < publishedAt) {
    err('"updatedAt" cannot be earlier than "publishedAt"')
  }

  const seoTitle = str('seoTitle', { max: 70 })
  const metaDescription = str('metaDescription', { max: 170 })
  const canonicalUrl = str('canonicalUrl')
  if (canonicalUrl && !isUrlOrPath(canonicalUrl, { allowPath: false })) err('"canonicalUrl" must be a full https:// URL')

  let related = []
  if (data.related !== undefined && data.related !== '') {
    if (!Array.isArray(data.related) || data.related.some((s) => typeof s !== 'string' || !SLUG_RE.test(s))) {
      err('"related" must be a list of article slugs')
    } else related = data.related
    if (related.includes(slug)) err('"related" cannot include the article itself')
  }

  let faq = []
  if (data.faq !== undefined && data.faq !== '') {
    if (!Array.isArray(data.faq) || data.faq.some((f) => !f || typeof f !== 'object' || !f.q || !f.a)) {
      err('"faq" must be a list of items that each have "q" and "a"')
    } else faq = data.faq.map((f) => ({ q: String(f.q).trim(), a: String(f.a).trim() }))
  }

  let toc = 'auto'
  if (data.toc !== undefined && data.toc !== '') {
    if (typeof data.toc !== 'boolean') err('"toc" must be true or false (omit it for automatic)')
    else toc = data.toc
  }

  // A translation group links the genuine versions of ONE article in different languages (same key in each file, at most one article per language). hreflang is emitted only between published members.
  const translationGroup = str('translationGroup', { max: 80 })
  if (translationGroup && !SLUG_RE.test(translationGroup)) err('"translationGroup" must be lowercase letters, numbers and hyphens')

  const meta = {
    slug,
    locale,
    translationGroup,
    title,
    excerpt,
    category: category?.slug,
    categoryLabel: category ? (locale !== BLOG_DEFAULT_LOCALE && category.labels?.[locale]) || category.label : undefined,
    status: published ? 'published' : 'draft',
    featured: bool('featured'),
    image,
    imageAlt,
    author,
    publishedAt,
    updatedAt,
    seoTitle,
    metaDescription,
    canonicalUrl,
    ogImage,
    related,
    faq,
    toc,
    noindex: bool('noindex'),
  }
  return { errors, meta }
}

/* Cross-file rules: unique slugs, and `related` must point at articles that exist. */
export function validateCollection(metas) {
  const errors = []
  const seen = new Map()
  const where = (m) => (m.locale && m.locale !== BLOG_DEFAULT_LOCALE ? `${m.locale}/${m.slug}` : m.slug)
  for (const m of metas) {
    if (!m.slug) continue
    const key = `${m.locale ?? BLOG_DEFAULT_LOCALE}/${m.slug}` // a slug is unique within its language
    if (seen.has(key)) errors.push(`duplicate slug "${where(m)}"`)
    seen.set(key, m)
  }
  for (const m of metas) {
    for (const r of m.related ?? []) {
      if (!seen.has(`${m.locale ?? BLOG_DEFAULT_LOCALE}/${r}`)) errors.push(`${where(m)}: related article "${r}" does not exist in ${m.locale ?? BLOG_DEFAULT_LOCALE}`)
    }
  }
  // Translation groups: one article per language per group.
  const groups = new Map()
  for (const m of metas) if (m.translationGroup) groups.set(m.translationGroup, [...(groups.get(m.translationGroup) ?? []), m])
  for (const [g, members] of groups) {
    const langs = members.map((m) => m.locale ?? BLOG_DEFAULT_LOCALE)
    for (const l of new Set(langs)) if (langs.filter((x) => x === l).length > 1) errors.push(`translationGroup "${g}" has more than one ${l} article`)
  }
  return errors
}

/* The published articles written in one language, newest first. */
export const publishedIn = (metas, locale, today = todayUtc()) => selectPublished(metas.filter((m) => (m.locale ?? BLOG_DEFAULT_LOCALE) === locale), today)

/* The published, indexable members of an article's translation group (itself included), English first: the genuine translations hreflang may link.
   Empty unless there are at least two, so a lone article never gets hreflang and a draft, a future-dated or a noindex article is never part of a relationship. */
export function translationsOf(meta, allMetas, today = todayUtc()) {
  if (!meta?.translationGroup) return []
  const members = allMetas.filter((m) => m.translationGroup === meta.translationGroup && isPublished(m, today) && !m.noindex)
  if (members.length < 2 || !members.some((m) => m.slug === meta.slug && (m.locale ?? BLOG_DEFAULT_LOCALE) === (meta.locale ?? BLOG_DEFAULT_LOCALE))) return []
  return members.sort((a, b) => BLOG_LOCALES.indexOf(a.locale ?? BLOG_DEFAULT_LOCALE) - BLOG_LOCALES.indexOf(b.locale ?? BLOG_DEFAULT_LOCALE))
}

/* Today as YYYY-MM-DD in UTC. */
export const todayUtc = (now = new Date()) => now.toISOString().slice(0, 10)

/* The only definition of "publicly visible". Drafts and future-dated articles are hidden. */
export function isPublished(meta, today = todayUtc()) {
  return Boolean(meta) && meta.status === 'published' && Boolean(meta.publishedAt) && meta.publishedAt <= today
}

export function selectPublished(metas, today = todayUtc()) {
  return metas
    .filter((m) => isPublished(m, today))
    .sort((a, b) => (a.publishedAt === b.publishedAt ? a.title.localeCompare(b.title) : a.publishedAt < b.publishedAt ? 1 : -1))
}

/* The article marked `featured: true` (newest if several); otherwise the newest article. */
export function pickFeatured(published) {
  return published.find((a) => a.featured) ?? published[0] ?? null
}

/* Explicit `related` slugs first, then same-category articles, then newest — never the article itself. */
export function relatedFor(article, published, limit = 3) {
  const others = published.filter((a) => a.slug !== article.slug && (a.locale ?? BLOG_DEFAULT_LOCALE) === (article.locale ?? BLOG_DEFAULT_LOCALE)) // never an article in another language
  const picked = []
  const add = (a) => { if (a && !picked.includes(a) && picked.length < limit) picked.push(a) }
  for (const slug of article.related ?? []) add(others.find((a) => a.slug === slug))
  others.filter((a) => a.category === article.category).forEach(add)
  others.forEach(add)
  return picked
}

/* Planned (coming-soon) topics that have not been published yet. A topic is considered
   published as soon as a published article uses its intended slug. */
export function remainingPlanned(planned, published) {
  const taken = new Set(published.map((a) => a.slug))
  return planned.filter((t) => !taken.has(t.slug))
}

/* The URL path of an article: English /blog/<slug>; other languages /<locale>/blog/<slug> (each language has its own slug). */
export const articlePath = (slug, locale = BLOG_DEFAULT_LOCALE) => (locale === BLOG_DEFAULT_LOCALE ? `/blog/${slug}` : `/${locale}/blog/${slug}`)
