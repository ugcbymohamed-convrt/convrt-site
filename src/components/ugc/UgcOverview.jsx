import { Section, Head, Reveal, Card, TextLink } from './shared.jsx'
import { hrefFor } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { frUgcOverview } from '../../i18n/fr/ugcOverview.js'

/* French-only "L'essentiel" block (what we produce, for whom, what you receive, prices and usage rights), shown on /fr/ugc-video-agency only: English and Spanish render nothing here.
   Copy and the rules it follows: src/i18n/fr/ugcOverview.js. */
export default function UgcOverview() {
  if (currentLocale() !== 'fr') return null
  const o = frUgcOverview()
  return (
    <Section id="overview" label="ugc-overview-heading">
      <Reveal>
        <Head id="ugc-overview-heading" eyebrow={o.eyebrow} title={o.title} intro={o.intro} />
      </Reveal>
      <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-5">
        {o.cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 80} className="h-full">
            <Card className="flex h-full flex-col p-6 md:p-7">
              <h3 className="font-display text-xl font-bold tracking-display text-ink">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{c.text}</p>
              {c.link && <p className="mt-4 text-[15px]"><TextLink href={hrefFor(c.link.href)}>{c.link.label} <span aria-hidden="true">→</span></TextLink></p>}
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
