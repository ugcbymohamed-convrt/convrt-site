/* THE ARABIC BLOG (/ar/blog). Arabic articles are NOT the English ones translated on the fly: an article exists in Arabic only when someone has written and approved an Arabic version.
   Add one object per approved Arabic article to AR_ARTICLES (newest first). Nothing is listed, dated or credited until it is here: the index shows its "coming soon" state while the list is empty.

   An entry carries everything an article page and its SEO need:
     slug          Arabic-page slug (ASCII, lower case, hyphens) → /ar/blog/<slug>
     title         Arabic headline (the H1)
     description   Arabic meta description, about 150 characters
     category      one of AR_BLOG_CATEGORIES.slug (only categories that have at least one article are shown as filters)
     author        { name, role? }: a real, confirmed person only
     datePublished, dateModified   ISO dates (YYYY-MM-DD)
     cover         { src, alt, width, height }: a real image
     body          the article text (Markdown file under src/content/blog-ar/<slug>.md once the article route exists)
     enSlug        optional: the slug of its genuine English equivalent (hreflang is emitted only when this is set)
   Article routes, canonicals, Article/Breadcrumb JSON-LD and the sitemap entry are generated for entries of this list; the article template is the English one (docs/blog-publishing.md).
   The English articles in src/content/blog are never shown here. */
export const AR_ARTICLES = []

/* Category filters of the Arabic blog. Only categories with at least one published article are displayed. */
export const AR_BLOG_CATEGORIES = [
  { slug: 'ugc-ads', label: 'إعلانات UGC' },
  { slug: 'creative-strategy', label: 'استراتيجية إبداعية' },
  { slug: 'video-production', label: 'صناعة الفيديو' },
  { slug: 'social-media', label: 'السوشيال ميديا' },
  { slug: 'saas-video', label: 'فيديوهات SaaS' },
]
