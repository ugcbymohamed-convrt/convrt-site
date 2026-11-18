import { SHARED_SPRINT_BENEFITS, FORMATS, SPRINT, SPRINT_PLUS, AD_VERSIONS, packageEquation } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { Section, Head, Reveal, Tick } from './shared.jsx'

/* SECTION 4: what's in a UGC batch. Labels come from the shared package benefits; the one-line descriptions are page copy.
   Deliverable terminology (owner-confirmed): a package delivers FINISHED AD VERSIONS (concepts × versions per concept):
   10 for the Sprint, 20 for Sprint Plus. The versions are included in the total, never extra videos on top.
   To avoid repeating the process section, items that are process steps (research, creators, filming) are one short line each. */

const DESCRIPTIONS = {
  research: 'Your product, audience and category, studied before anything is written.',
  approval: 'Distinct angles, each with its own hooks and a complete script, approved by you before filming.',
  creators: 'A creator recommended for your brand and audience.',
  production: 'Filmed natively for each format, then edited, captioned and finished.',
  extras: 'Included in full production, according to the agreed creative requirements.',
  reframing: 'Delivered alongside the vertical video. Horizontal 16:9 is a separate video.',
  variations: 'Two versions of every concept, such as a different hook or call to action.',
  testing: 'Guidance on what to test next.',
  language: 'One core language included: English, Spanish, French or Arabic. Others on request.',
}

function ConceptDiagram({ pkg }) {
  const concepts = Array.from({ length: pkg.concepts }, (_, i) => i)
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">
        {pkg.name}: <span className="font-normal text-ink-muted">{packageEquation(pkg)}</span>
      </p>
      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${pkg.concepts <= 5 ? pkg.concepts : 5}, minmax(0, 1fr))` }}>
        {concepts.map((i) => {
          const color = ConceptAccents[i % ConceptAccents.length]
          return (
            <li key={i} className="rounded-xl border bg-canvas/40 p-2 text-center" style={{ borderColor: `${color}55` }}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color }}>C{i + 1}</p>
              <div className="mt-1.5 flex flex-col gap-1">
                {Array.from({ length: pkg.variationsPerConcept }, (_, v) => (
                  <span key={v} className="rounded-md bg-white/[0.06] py-0.5 text-xs text-ink-muted">V{v + 1}</span>
                ))}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function UgcBatch() {
  return (
    <Section id="whats-included" label="ugc-batch-heading">
      <Reveal>
        <Head
          id="ugc-batch-heading"
          eyebrow="Deliverables"
          title="What's in a UGC batch."
          intro="Every package is a structured creative batch built for testing, not a collection of unrelated videos."
        />
      </Reveal>

      <Reveal className="mt-8 md:mt-10">
        <div className="rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md md:p-8">
          <ul className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {SHARED_SPRINT_BENEFITS.map((b) => (
              <li key={b.id} className="flex gap-2.5">
                <Tick />
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  <span className="font-semibold text-ink">{b.label}.</span> {DESCRIPTIONS[b.id]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal className="mt-5 md:mt-6">
        <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ConceptDiagram pkg={SPRINT} />
            <ConceptDiagram pkg={SPRINT_PLUS} />
          </div>
          <div className="mt-5 space-y-2 border-t border-hairline pt-4 text-[15px] leading-relaxed text-ink-muted">
            <p>
              <span className="font-semibold text-ink">A concept</span> is a distinct advertising angle. Each concept comes in two{' '}
              {AD_VERSIONS.perConcept}, such as a different hook or call to action. The totals are finished ad versions: the two versions of
              each concept are included in them, not extra videos on top.
            </p>
            <p>Standard videos run up to {FORMATS.standardMaxSeconds} seconds. {FORMATS.longForm}</p>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
