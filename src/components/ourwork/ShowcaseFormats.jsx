import { PATHS } from '../../routes.js'
import { CATEGORIES, categoryOf, typeOf } from '../../content/portfolio.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section, TextLink } from '../ugc/shared.jsx'
import { tr, hrefFor } from '../../i18n/tr.js'

/* "What you'll find here": crawlable, factual context under the library (SEO/GEO Batch 2, audit C-11). It sits BELOW the gallery so the library experience is unchanged.

   It describes formats and industries only as far as the approved videos really cover them: a format appears only while at least one approved video of that `type` exists, and an
   industry only while at least one approved video is filed under it, so the text can never promise something the library does not show. No creator names, brands, languages, places,
   dates or outcomes are stated. The videos are independent creators' examples (no standing disclaimer paragraph any more: owner decision 2026-11-24); nothing here calls them CONVRT productions. The links go to
   the service pages, which explain how CONVRT produces each format, and to the two published case studies, which ARE documented CONVRT projects. The anchors do not name the clients: the homepage client videos stay off this page (tests/creator-showcase.test.mjs). */

const FORMATS = [
  { type: 'ugc', title: 'UGC-style videos', text: 'Creator-led, natural-style videos of the kind brands run as paid social ads.', label: 'UGC video production', href: PATHS.ugcVideoAgency },
  { type: 'spokesperson', title: 'Spokesperson videos', text: 'Presenter-led videos that deliver a scripted message to camera.', label: 'Spokesperson video production', href: PATHS.spokespersonVideoProduction },
  { type: 'saas', title: 'Software and app examples', text: 'Creator videos for software and app brands. SaaS explainers and demos are scoped per project.', label: 'SaaS video production', href: PATHS.saasVideoProduction },
  { type: 'organic', title: 'Organic social examples', text: 'Short-form videos made for a brand’s own social accounts.', label: 'Organic social video production', href: PATHS.socialMediaVideoProduction },
]

const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} ${tr('and')} ${items.at(-1)}` : items[0] ?? '')

export default function ShowcaseFormats({ items }) {
  const formats = FORMATS.filter((f) => items.some((i) => typeOf(i) === f.type))
  const industries = CATEGORIES.filter((c) => !c.byType && items.some((i) => categoryOf(i) === c.id)).map((c) => tr(c.label))
  if (!items.length || (!formats.length && !industries.length)) return null
  return (
    <Section id="showcase-guide" label="showcase-guide-heading" className="!py-8 md:!py-10">
      <div className="mx-auto max-w-4xl">
        <h2 id="showcase-guide-heading" className="font-display text-2xl font-bold leading-tight tracking-display text-ink md:text-3xl">{tr('What you’ll find in the Creator Showcase')}</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
          {/* A reader comparing agencies uses this page to compare styles before briefing a project. */}
          {tr('The library brings together examples from independent creators in different formats, so you can compare styles and creative approaches before you brief a project.')}
          {industries.length > 0 && <> {tr('Use the tabs above to browse by industry:')} {list(industries)}.</>}
        </p>
        {formats.length > 0 && (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {formats.map((f) => (
              <li key={f.type} className="list-none rounded-3xl border border-hairline bg-surface-1/60 p-5 backdrop-blur-md">
                <h3 className="font-display text-[1.05rem] font-semibold leading-snug tracking-snug text-ink">{tr(f.title)}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{tr(f.text)}</p>
                <p className="mt-3 text-[14.5px]">
                  <TextLink href={hrefFor(f.href)} onClick={() => trackEvent('showcase_service_link_click', { service: f.type })}>{tr(f.label)} <span aria-hidden="true">→</span></TextLink>
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 max-w-3xl text-[14px] leading-relaxed text-ink-muted">
          {tr('For documented CONVRT projects, read our')}{' '}
          <TextLink href={PATHS.caseStudyGraspo} onClick={() => trackEvent('showcase_service_link_click', { service: 'case-study-organic' })}>{tr('organic social media case study')}</TextLink> {tr('and our')}{' '}
          <TextLink href={PATHS.caseStudyElyon} onClick={() => trackEvent('showcase_service_link_click', { service: 'case-study-ugc' })}>{tr('paid social UGC case study')}</TextLink>.
        </p>
      </div>
    </Section>
  )
}
