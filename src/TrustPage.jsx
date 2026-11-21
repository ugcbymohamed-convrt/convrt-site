import { useEffect, useRef } from 'react'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { TRUST_PAGES_PUBLISHED } from './config.js'
import { TRUST_CONTENT } from './content/trustPages.js'

/* About, Contact, Privacy Policy and Terms: one template, four URLs (PATHS.about / contact / privacy / terms). The words are in src/content/trustPages.js.
   Head and JSON-LD come from the SEO manifest like every other page. While TRUST_PAGES_PUBLISHED is false (src/config.js) the pages are drafts: noindex, no
   footer or form links, and a banner says so; any "[OWNER TO CONFIRM: ...]" or "[LEGAL REVIEW: ...]" marker in the text is highlighted so nothing is overlooked. */

const KEY_BY_PATH = { [PATHS.about]: 'about', [PATHS.contact]: 'contact', [PATHS.privacy]: 'privacy', [PATHS.terms]: 'terms' }
const LABEL = { about: 'About', contact: 'Contact', privacy: 'Privacy Policy', terms: 'Terms of Service' }
const TOKEN = /(\[\[[^\]|]+\|[^\]]+\]\]|\[(?:OWNER TO CONFIRM|LEGAL REVIEW)[^\]]*\])/g

const linkClass = 'font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime'

function Inline({ text }) {
  return text.split(TOKEN).map((part, i) => {
    const link = part.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]$/)
    if (link) {
      const external = /^https?:/.test(link[2])
      return (
        <a key={i} href={link[2]} className={linkClass} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {link[1]}
        </a>
      )
    }
    if (part.startsWith('[OWNER TO CONFIRM') || part.startsWith('[LEGAL REVIEW')) {
      return <mark key={i} className="rounded bg-amber/20 px-1 text-amber">{part}</mark>
    }
    return part
  })
}

export default function TrustPage() {
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/'
  const key = KEY_BY_PATH[path] ?? 'about'
  const page = TRUST_CONTENT[key]
  useDocumentHead(pageHead(PATHS[key]))

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent(`${key}_page_view`)
  }, [key])

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href="/" className="transition-colors hover:text-ink">Home</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">{LABEL[key]}</li>
        </ol>
      </nav>
      <article aria-labelledby="trust-heading" className="relative overflow-x-clip">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[320px] w-[820px] -translate-x-1/2 rounded-full bg-lime/[0.05] blur-[140px]" />
        <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-6 md:px-8 md:pb-28 md:pt-10">
          {!TRUST_PAGES_PUBLISHED && (
            <p role="note" className="mb-6 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-[14px] leading-relaxed text-ink">
              <strong className="font-semibold text-amber">Draft for owner review.</strong> This page is not published: it is hidden from search engines and is not linked from the site.
            </p>
          )}
          <h1 id="trust-heading" className="font-display text-[2.2rem] font-bold leading-[1.05] tracking-display-xl text-ink sm:text-5xl">{page.h1}</h1>
          <p className="mt-5 text-base leading-relaxed text-ink-muted md:text-lg"><Inline text={page.intro} /></p>
          <div className="mt-10 space-y-10">
            {page.sections.map((s) => (
              <section key={s.heading} aria-labelledby={`trust-${s.heading.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
                <h2 id={`trust-${s.heading.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`} className="font-display text-xl font-bold tracking-display text-ink md:text-2xl">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-muted md:text-base">
                  {s.body.map((b, i) =>
                    typeof b === 'string' ? (
                      <p key={i}><Inline text={b} /></p>
                    ) : (
                      <ul key={i} className="list-disc space-y-2 pl-5 marker:text-lime">
                        {b.list.map((li) => <li key={li}><Inline text={li} /></li>)}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}
