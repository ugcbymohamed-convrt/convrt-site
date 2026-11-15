import { ORGANIC, TAX } from '../../seo/businessKnowledge.js'
import { SectionHeader, Card, CardTitle, CardLabel, Check, Cross, Small } from './shared.jsx'

/* What the organic social service covers, from the business knowledge base. Package prices and post counts live in
   the package cards above; this section adds only the CONFIRMED scope and exclusions (no invented reporting
   schedules, response times or video counts). */
export default function OrganicScope() {
  return (
    <section aria-labelledby="organic-scope-heading" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <SectionHeader
          id="organic-scope-heading"
          eyebrow="Organic social service"
          title="What organic social covers."
          intro={`Both packages include ${ORGANIC.includedInBoth.join(' and ').toLowerCase()}.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 md:gap-5">
          <Card>
            <CardLabel>Included</CardLabel>
            <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {ORGANIC.scope.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted"><Check /><span>{item}</span></li>
              ))}
            </ul>
          </Card>
          <div className="flex flex-col gap-4 md:gap-5">
            <Card>
              <CardLabel>Community management</CardLabel>
              <CardTitle>Included in both packages</CardTitle>
              <Small className="mt-3">{ORGANIC.communityManagement}</Small>
            </Card>
            <Card>
              <CardLabel>Platforms</CardLabel>
              <CardTitle>{ORGANIC.platforms.slice(0, -1).join(', ')} and {ORGANIC.platforms.at(-1)}</CardTitle>
            </Card>
            <Card>
              <CardLabel>Not part of the service</CardLabel>
              <ul className="mt-1 space-y-2">
                {ORGANIC.excluded.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted"><Cross /><span>{item}</span></li>
                ))}
              </ul>
              <Small className="mt-3">{TAX.statement}</Small>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
