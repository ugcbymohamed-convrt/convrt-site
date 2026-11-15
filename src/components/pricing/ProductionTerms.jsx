import {
  SPRINT, SPRINT_PLUS, TURNAROUND, REVISIONS, RESHOOTS, FORMATS, RAW_FOOTAGE, PRODUCT_REQUIREMENTS, formatMoney,
} from '../../seo/businessKnowledge.js'
import { SectionHeader, Card, CardTitle, CardLabel, Small, Check } from './shared.jsx'

/* Turnaround, revisions, reshoots, formats, raw footage and what CONVRT needs from the client, in plain English.
   Wording is owned by businessKnowledge.js; nothing is described as unlimited or automatically free. */
export default function ProductionTerms() {
  return (
    <section id="production-terms" aria-labelledby="terms-heading" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader
          id="terms-heading"
          eyebrow="Clear terms"
          title="Turnaround, revisions and formats, in plain English."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <Card>
            <CardLabel>Turnaround</CardLabel>
            <CardTitle>
              {SPRINT.turnaroundBusinessDays} business days <span className="text-ink-subtle font-medium">/</span>{' '}
              {SPRINT_PLUS.turnaroundBusinessDays} business days
            </CardTitle>
            <Small className="mt-1 text-ink-subtle">{SPRINT.name} / {SPRINT_PLUS.name}</Small>
            <Small className="mt-3">
              Production turnaround begins {TURNAROUND.startsAt}. {TURNAROUND.note}
            </Small>
          </Card>

          <Card>
            <CardLabel>Revisions</CardLabel>
            <CardTitle>{REVISIONS.roundsPerConcept} rounds per creative concept</CardTitle>
            <Small className="mt-3">{REVISIONS.note}</Small>
          </Card>

          <Card>
            <CardLabel>Reshoots</CardLabel>
            <CardTitle>Transparent, not automatic</CardTitle>
            <Small className="mt-3">{RESHOOTS.weCover}</Small>
            <Small className="mt-3">{RESHOOTS.clientPays}</Small>
          </Card>

          <Card>
            <CardLabel>Formats and length</CardLabel>
            <CardTitle>Filmed natively for each format</CardTitle>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-start gap-2.5 text-[13px] text-ink-muted"><Check /><span>Standard performance videos are up to {FORMATS.standardMaxSeconds} seconds.</span></li>
              {FORMATS.included.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-ink-muted"><Check /><span>{f} included.</span></li>
              ))}
              <li className="flex items-start gap-2.5 text-[13px] text-ink-muted"><Check /><span>{FORMATS.separateDeliverable}</span></li>
              <li className="flex items-start gap-2.5 text-[13px] text-ink-muted"><Check /><span>{FORMATS.longForm}</span></li>
            </ul>
            <Small className="mt-3">{FORMATS.nativeApproach}</Small>
          </Card>

          <Card>
            <CardLabel>Full production</CardLabel>
            <CardTitle>What production covers</CardTitle>
            <ul className="mt-3 flex flex-wrap gap-2">
              {FORMATS.fullProductionIncludes.map((item) => (
                <li key={item} className="rounded-full border border-hairline-strong px-3 py-1 text-[12px] text-ink-muted">{item}</li>
              ))}
            </ul>
            <Small className="mt-3">Delivered {FORMATS.scopeQualifier}.</Small>
          </Card>

          <Card>
            <CardLabel>Raw footage add-on</CardLabel>
            <CardTitle>{formatMoney(RAW_FOOTAGE.price)} per {RAW_FOOTAGE.per}</CardTitle>
            <Small className="mt-3">{RAW_FOOTAGE.note}</Small>
          </Card>
        </div>

        <Card className="mt-4 md:mt-5">
          <CardLabel>What we need from you</CardLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <Small>{PRODUCT_REQUIREMENTS.physical}</Small>
            <Small>{PRODUCT_REQUIREMENTS.saas}</Small>
          </div>
        </Card>
      </div>
    </section>
  )
}
