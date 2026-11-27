import { useEffect, useRef } from 'react'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { PATHS } from './routes.js'
import { TRUST_PAGES_PUBLISHED, LEGAL_TRANSLATIONS_APPROVED } from './config.js'
import { TRUST_CONTENT } from './content/trustPages.js'
import { legalContext } from './content/legal/context.js'
import LEGAL_ES from './content/legal/es.js'
import LEGAL_FR from './content/legal/fr.js'
import LEGAL_AR from './content/legal/ar.js'
import { parsePath } from './i18n/paths.js'
import { tr, hrefFor } from './i18n/tr.js'
import { TRUST_NAMES } from './i18n/trustLinks.js'
import { frTypography } from './i18n/fr/typography.js'

/* About (English), Privacy Policy, Terms and Conditions and Legal Notice: one reading template, one URL per language (PATHS.about / privacy / terms / legalNotice). The English words are in
   src/content/trustPages.js. The Spanish, French and Arabic legal documents are their own translations of the English ones (src/content/legal/es|fr|ar.js, same sections, same clauses, same
   links); they are not run through the sentence dictionary. About (every language) is src/AboutPage.jsx + src/components/about/AboutLayout.jsx and Contact is src/components/contact/ContactPage.jsx.
   Head and JSON-LD come from the SEO manifest like every other page. While TRUST_PAGES_PUBLISHED is false (src/config.js) the pages are drafts: noindex, no footer or form links, and a banner says
   so; any "[OWNER TO CONFIRM: ...]" or "[LEGAL REVIEW: ...]" marker in the text is highlighted so nothing is overlooked. While LEGAL_TRANSLATIONS_APPROVED is false the translated legal documents
   carry a visible "translation under review" notice. A legal document has no entrance animation: it is for reading. */

const KEY_BY_PATH = { [PATHS.about]: 'about', [PATHS.privacy]: 'privacy', [PATHS.terms]: 'terms', [PATHS.legalNotice]: 'legalNotice' }
const LEGAL_BUILDERS = { es: LEGAL_ES, fr: LEGAL_FR, ar: LEGAL_AR }
const TOKEN = /(\[\[[^\]|]+\|[^\]]+\]\]|\[(?:OWNER TO CONFIRM|LEGAL REVIEW)[^\]]*\])/g
/* Arabic: a run of Latin text (a name, an e-mail, a URL, a storage key) is isolated so its punctuation and neighbouring Arabic words never reorder it. */
const LATIN_WORD = "_?[\\p{Script=Latin}\\p{N}][\\p{Script=Latin}\\p{N}@._:/#+&'’<>-]*"
const LATIN_RUN = new RegExp(`(${LATIN_WORD}(?:,?[ \\u00a0]${LATIN_WORD})*)`, 'gu') // a no-break space joins words into one run too ("Elyon Dubai" stays one isolate: two would swap places in right-to-left text)
const HAS_LETTER = /[\p{Script=Latin}@]/u

/* The notice shown on a translated legal document until the owner approves it (LEGAL_TRANSLATIONS_APPROVED). Not part of the legal text. */
const REVIEW_NOTICE = {
  es: 'Traducción en revisión. Esta versión todavía no ha sido aprobada para su publicación: no está indexada ni enlazada desde el resto del sitio.',
  fr: 'Traduction en cours de relecture. Cette version n’a pas encore été approuvée pour publication : elle n’est ni indexée ni liée depuis le reste du site.',
  ar: 'الترجمة قيد المراجعة. لم تُعتمد هذه النسخة للنشر بعد، ولذلك لا تظهر في محركات البحث ولا يُشار إليها من بقية الموقع.',
}

const linkClass = 'font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime'

function Latin({ text, rtl }) {
  if (!rtl) return text
  /* A Latin run keeps its own direction, but the punctuation that ends a sentence belongs to the Arabic sentence: it stays OUTSIDE the isolate (the word, then the full stop), otherwise it renders on the wrong side. */
  return text.split(LATIN_RUN).map((part, i) => {
    if (!(i % 2 === 1 && HAS_LETTER.test(part))) return part
    const m = part.match(/^(.*?)([.,:;]+)$/s)
    return m && HAS_LETTER.test(m[1]) ? <span key={i}><bdi dir="ltr">{m[1]}</bdi>{m[2]}</span> : <bdi key={i} dir="ltr">{part}</bdi>
  })
}

export function Inline({ text, rtl = false }) {
  return text.split(TOKEN).map((part, i) => {
    const link = part.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]$/)
    if (link) {
      const external = /^(https?:|mailto:)/.test(link[2])
      return (
        <a key={i} href={hrefFor(link[2])} className={linkClass} {...(/^https?:/.test(link[2]) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {external && rtl && /^mailto:/.test(link[2]) ? <bdi dir="ltr">{link[1]}</bdi> : <Latin text={link[1]} rtl={rtl} />}
        </a>
      )
    }
    if (part.startsWith('[OWNER TO CONFIRM') || part.startsWith('[LEGAL REVIEW')) {
      return <mark key={i} className="rounded bg-amber/20 px-1 text-amber">{part}</mark>
    }
    return <Latin key={i} text={part} rtl={rtl} />
  })
}

/* The page's words in the page's language. English is the source text; Spanish, French and Arabic legal documents come from their own modules (same structure, proven by the tests). */
function pageFor(key, locale) {
  if (locale === 'en') return TRUST_CONTENT[key]
  const doc = LEGAL_BUILDERS[locale]?.(legalContext())?.[key]
  if (!doc) return TRUST_CONTENT[key]
  if (locale !== 'fr') return doc
  // French typography (no-break space before : ; ? ! » and after «) is applied at render time, so the source can be written with ordinary spaces.
  const t = frTypography
  return { ...doc, h1: t(doc.h1), intro: t(doc.intro), sections: doc.sections.map((s) => ({ heading: t(s.heading), body: s.body.map((b) => (typeof b === 'string' ? t(b) : { list: b.list.map(t) })) })) }
}

export default function TrustPage() {
  const { locale, basePath: path } = parsePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  const key = KEY_BY_PATH[path] ?? 'about'
  const page = pageFor(key, locale)
  const rtl = locale === 'ar'
  const legal = key !== 'about'
  const names = TRUST_NAMES[locale] ?? TRUST_NAMES.en
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
      <nav aria-label={tr('Breadcrumb')} className="mx-auto max-w-7xl px-5 pt-2 md:px-8">
        <ol className="flex items-center gap-2 text-[13px] text-ink-subtle">
          <li><a href={hrefFor('/')} className="transition-colors hover:text-ink">{tr('Home')}</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-muted">{names[key]}</li>
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
          {legal && locale !== 'en' && !LEGAL_TRANSLATIONS_APPROVED && (
            <p role="note" className="mb-6 rounded-2xl border border-amber/40 bg-amber/10 px-4 py-3 text-[14px] leading-relaxed text-ink">{REVIEW_NOTICE[locale]}</p>
          )}
          <h1 id="trust-heading" className={`font-display font-bold text-ink ${rtl ? 'text-[2rem] leading-[1.25] sm:text-[2.6rem]' : 'text-[2.2rem] leading-[1.05] tracking-display-xl sm:text-5xl'}`}>{page.h1}</h1>
          <p className={`mt-5 text-base text-ink-muted md:text-lg ${rtl ? 'leading-[1.9]' : 'leading-relaxed'}`}><Inline text={page.intro} rtl={rtl} /></p>
          <div className="mt-10 space-y-10">
            {page.sections.map((s, si) => (
              <section key={si} aria-labelledby={`trust-s${si}`}>
                <h2 id={`trust-s${si}`} className={`font-display text-xl font-bold text-ink md:text-2xl ${rtl ? 'leading-[1.4]' : 'tracking-display'}`}>{s.heading}</h2>
                <div className={`mt-3 space-y-3 text-[15px] text-ink-muted md:text-base ${rtl ? 'leading-[1.95]' : 'leading-relaxed'}`}>
                  {s.body.map((b, i) =>
                    typeof b === 'string' ? (
                      <p key={i}><Inline text={b} rtl={rtl} /></p>
                    ) : (
                      <ul key={i} className="list-disc space-y-2 pl-5 marker:text-lime">
                        {b.list.map((li, k) => <li key={k}><Inline text={li} rtl={rtl} /></li>)}
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
