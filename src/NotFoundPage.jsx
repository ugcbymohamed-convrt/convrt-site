import { forward } from './lib/rtl.js'
import { useDocumentHead } from './lib/useDocumentHead.js'
import { PATHS } from './routes.js'
import { tr, hrefFor } from './i18n/tr.js'
import { currentLocale } from './i18n/locale.js'
import { LOCALES } from './i18n/locales.js'

/* Rendered for any URL that is not a real page. The host answers these URLs with HTTP 404
   (dist/404.html, see vite-plugin-static-routes.js); this is the branded page people see.
   No canonical / og:url (there is no canonical URL for a missing page) and noindex, follow. */

const LINKS = [
  { label: 'Case Studies', href: PATHS.caseStudies, hint: 'Results for Graspo and Elyon Dubai' },
  { label: 'Pricing', href: PATHS.pricing, hint: 'Paid and organic social packages' },
  { label: 'Blog', href: PATHS.blog, hint: 'Video ads, UGC and creative strategy' },
  { label: 'Free Ad Hooks', href: PATHS.hooks, hint: '10 hooks for SaaS or e-commerce, by email' },
]

// Other languages offer only pages that exist in that language (an untranslated page is never linked from here).
const LINKS_LOCAL = [
  { label: 'Pricing', href: PATHS.pricing, hint: 'Paid and organic social packages' },
  { label: 'UGC Video Agency', href: PATHS.ugcVideoAgency, hint: 'Creator-led UGC ads for paid social' },
  { label: 'Creator Showcase', href: PATHS.showcase, hint: 'Video examples from independent creators' },
  { label: 'Contact', href: PATHS.contact, hint: 'Talk to the studio' },
]

export default function NotFoundPage() {
  const locale = currentLocale()
  const links = locale === 'en' ? LINKS : LINKS_LOCAL
  useDocumentHead({
    title: tr('Page not found | CONVRT'),
    description: tr('This page could not be found.'),
    robots: 'noindex, follow',
    ...(locale === 'en' ? {} : { lang: LOCALES[locale]?.htmlLang, dir: LOCALES[locale]?.dir }),
  })

  return (
    <section aria-labelledby="not-found-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-lime/10 blur-[140px]"
      />
      <div className="relative mx-auto max-w-3xl px-5 py-20 text-center md:px-8 md:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{tr('Error 404')}</span>
        </div>

        <h1
          id="not-found-heading"
          className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-display text-ink md:text-6xl"
        >{tr('This page')}{' '}<span className="text-lime">{tr('doesn’t exist.')}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">{tr('The link may be old or mistyped. Here is where most people want to go.')}</p>

        <div className="mt-8 flex justify-center">
          <a
            href={hrefFor(PATHS.home)}
            className="cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
          >{tr('Back to the homepage')}<span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">{forward()}</span>
          </a>
        </div>

        <ul className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={hrefFor(l.href)}
                className="group flex h-full flex-col rounded-2xl border border-hairline bg-surface-1/70 p-4 transition-colors duration-200 hover:border-lime/40 hover:bg-surface-2/60 motion-reduce:transition-none
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                <span className="text-[15px] font-semibold tracking-snug text-ink transition-colors group-hover:text-lime">{tr(l.label)} {forward()}</span>
                <span className="mt-1 text-[13px] leading-snug text-ink-muted">{tr(l.hint)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
