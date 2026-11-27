import { tr, hrefFor } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { PATHS } from '../../routes.js'
import { forward } from '../../lib/rtl.js'

/* A short, quiet row of contextual links at the end of a service page: the creator examples and the pricing that belong to the service.

   Why it exists (Phase 5, internal-link parity): on the English SaaS, Spokesperson and Organic Social pages the Creator Showcase is linked from the example gallery; the Spanish, French and Arabic pages
   have no gallery on those three services (owner decisions, docs/video-library.md), so they linked to no creator examples at all. This row gives them the same destinations with descriptive anchor text.
   English pages already carry these links, so the row is shown for translated pages only (no duplicate links on English). Destinations come from PATHS, never typed here. */
export default function RelatedLinks() {
  if (currentLocale() === 'en') return null
  const links = [
    { href: hrefFor(PATHS.showcase), label: tr('Creator Showcase examples') },
    { href: hrefFor(`${PATHS.pricing}#packages`), label: tr('Pricing and packages') },
  ]
  return (
    <nav aria-label={tr('Related pages')} className="mx-auto max-w-3xl px-5 pb-10 text-center md:px-8">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-muted">{tr('Related pages')}</p>
      <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[15px]">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="font-medium text-ink underline decoration-lime/60 underline-offset-4 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
              {l.label} <span aria-hidden="true">{forward()}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
