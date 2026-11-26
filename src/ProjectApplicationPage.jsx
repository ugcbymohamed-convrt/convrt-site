import { useEffect, useRef, useState } from 'react'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { pageHead } from './seo/siteSeo.js'
import { captureAttribution, trackEvent } from './lib/analytics.js'
import { scrollToElement } from './lib/scroll.js'
import { currentLocale } from './i18n/locale.js'
import { hrefFor } from './i18n/tr.js'
import { paCopy } from './i18n/projectApplicationCopy.js'
import { PROJECT_APPLICATION_PATH, selectionFor, selectionFromSearch, sourceFromSearch } from './lib/projectApplication.js'
import PackageSummary, { PackageList } from './components/projectApplication/PackageSummary.jsx'
import ApplicationForm from './components/projectApplication/ApplicationForm.jsx'
import { Check } from './components/roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   /project-application — the purchase-intent funnel.

   A visitor who picked a package on /pricing lands here with ?package=<id>&billing=<monthly|one-time>; the package is already selected (summary card), so they never choose it twice.
   Exploring visitors keep the Free Creative Growth Roadmap; this page is the second journey: Pricing → selected package → application → the owner reviews and decides the next step.
   There is NO calendar, booking link, payment or automatic invitation anywhere on it (docs/project-application.md).

   SEO: a conversion utility, not a landing page: noindex (meta robots + X-Robots-Tag, never blocked in robots.txt), self-canonical to the clean URL (query strings never create a duplicate),
   not in the sitemap. The prerendered HTML shows the package chooser; the selected package is read from the URL after load (identifiers only, never a price or a personal detail).

   Analytics (identifiers only, consent-gated like every event): package_cta_click (on /pricing), project_application_view, project_application_start, project_application_submit.
───────────────────────────────────────────── */

export default function ProjectApplicationPage() {
  useDocumentHead(pageHead(PROJECT_APPLICATION_PATH))
  const locale = currentLocale()
  const c = paCopy(locale)
  const [selection, setSelection] = useState(null)
  const [source, setSource] = useState('direct')
  const [done, setDone] = useState(false)
  const viewed = useRef(false)
  const doneRef = useRef(null)

  useEffect(() => {
    captureAttribution()
    const search = window.location.search
    const sel = selectionFromSearch(locale, search)
    const from = sourceFromSearch(search)
    setSelection(sel)
    setSource(from)
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('project_application_view', params(locale, sel, from))
  }, [locale])

  const choose = (packageId, billing) => {
    const sel = selectionFor(locale, packageId, billing, { defaultBilling: true })
    if (!sel) return
    setSelection(sel)
    // Keep the URL in step with the selection (shareable, survives a language switch); identifiers only.
    try {
      const q = new URLSearchParams({ package: sel.packageId })
      if (sel.billing) q.set('billing', sel.billing)
      if (source !== 'direct') q.set('from', source)
      window.history.replaceState(null, '', `${window.location.pathname}?${q.toString()}`)
    } catch { /* the URL is a courtesy */ }
  }

  useEffect(() => {
    if (!done) return
    doneRef.current?.focus({ preventScroll: true })
    scrollToElement(document.getElementById('apply'), { duration: 0 })
  }, [done])

  return (
    <section id="apply" className="relative scroll-mt-20 overflow-hidden py-12 md:scroll-mt-24 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-lime/[0.05] blur-[150px]" />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-px w-8 bg-lime" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">{c.eyebrow}</span>
            <span className="h-px w-8 bg-lime" aria-hidden="true" />
          </div>
          <h1 className="mt-5 font-display text-[2.2rem] font-bold leading-[1.15] tracking-display text-ink sm:text-5xl">{c.headline}</h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">{c.description}</p>
        </header>

        <div className="mt-10 md:mt-14">
          {!selection ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-hairline-strong bg-surface-1 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold tracking-snug text-ink">{c.summary.choose.title}</h2>
              <p className="mt-1 mb-5 text-sm text-ink-muted">{c.summary.choose.hint}</p>
              <PackageList selection={null} onSelect={choose} />
              <p className="mt-5 text-sm"><a href={hrefFor('/pricing#packages')} className="text-ink-subtle underline underline-offset-4 hover:text-lime">{c.summary.backToPricing}</a></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <PackageSummary selection={selection} onSelect={choose} locked={done} />
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] sm:p-8">
                  {done ? (
                    <div className="px-1 py-4 text-center sm:py-8" role="status">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-lime"><Check className="h-6 w-6" /></div>
                      <h2 ref={doneRef} tabIndex={-1} className="mt-6 font-display text-3xl font-bold tracking-display text-ink outline-none">{c.done.headline}</h2>
                      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-muted">{c.done.body}</p>
                      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                        <a href={hrefFor('/')} className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-lime/50 hover:text-lime">{c.done.home}</a>
                        <a href={hrefFor('/pricing')} className="inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-lime">{c.done.pricing}</a>
                      </div>
                    </div>
                  ) : (
                    <ApplicationForm key={`${selection.category}-${selection.custom}`} selection={selection} eventParams={params(locale, selection, source)} sourcePage={source} onSubmitted={() => setDone(true)} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* Non-personal event parameters shared by the funnel events. */
function params(locale, sel, source) {
  return { package_id: sel?.packageId ?? 'none', billing: sel ? sel.billing ?? 'custom' : 'none', locale, currency: sel?.currency ?? 'none', source_page: source, service_category: sel ? (sel.custom ? `custom_${sel.category}` : sel.category) : 'none' }
}
