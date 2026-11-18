import { SHARED_SPRINT_BENEFITS, SHARED_SPRINT_LANGUAGE_NOTE, FORMATS, SPRINT, SPRINT_PLUS } from '../../seo/businessKnowledge.js'
import { ConceptAccents } from '../pricing/shared.jsx'
import { Section, Head, Reveal } from './shared.jsx'

/* SECTION 4: what's in a UGC batch. Titles come from the shared package benefits; the descriptions are page copy.
   The package totals (10 and 20) are the TOTAL number of finished ad variations, concepts × variations per concept,
   exactly as src/seo/businessKnowledge.js defines them. Variations are counted within the total, never on top of it. */

const DESCRIPTIONS = {
  research: 'We study your product, audience and the ads already running in your category before writing anything.',
  approval: 'Distinct advertising angles, each with its own hooks and a complete script, approved by you before filming.',
  creators: 'We recommend the right creator and share relevant work samples before production.',
  production: 'Creators film natively for each format. We edit, caption and finish.',
  extras: 'Included in full production, according to the agreed creative requirements.',
  reframing: 'Delivered alongside the vertical video. Horizontal 16:9 is a separate video.',
  variations: 'Alternative versions of each concept, such as a different hook or call to action.',
  testing: 'Guidance on what to test next.',
  language: 'One core language included: English, Spanish, French or Arabic. Other languages on request.',
}

function ConceptDiagram({ pkg }) {
  const concepts = Array.from({ length: pkg.concepts }, (_, i) => i)
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">
        {pkg.name}: <span className="text-ink-muted">{pkg.concepts} concepts × {pkg.variationsPerConcept} variations = {pkg.variations} ad variations in total</span>
      </p>
      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${pkg.concepts <= 5 ? pkg.concepts : 5}, minmax(0, 1fr))` }}>
        {concepts.map((i) => {
          const color = ConceptAccents[i % ConceptAccents.length]
          return (
            <li key={i} className="rounded-xl border bg-canvas/40 p-2 text-center" style={{ borderColor: `${color}55` }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color }}>C{i + 1}</p>
              <div className="mt-1.5 flex flex-col gap-1">
                {Array.from({ length: pkg.variationsPerConcept }, (_, v) => (
                  <span key={v} className="rounded-md bg-white/[0.06] py-0.5 text-[10px] text-ink-muted">V{v + 1}</span>
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

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
        {SHARED_SPRINT_BENEFITS.map((b, i) => (
          <li key={b.id} className="list-none">
            <Reveal delay={(i % 3) * 70} className="h-full">
              <div className="h-full rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md">
                <span className="font-display text-sm font-bold tabular-nums text-lime">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-snug text-ink">{b.label}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{DESCRIPTIONS[b.id]}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal className="mt-10 md:mt-12">
        <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ConceptDiagram pkg={SPRINT} />
            <ConceptDiagram pkg={SPRINT_PLUS} />
          </div>
          <div className="mt-6 space-y-2 border-t border-hairline pt-5 text-[14px] leading-relaxed text-ink-muted">
            <p>
              <span className="font-semibold text-ink">A concept</span> is a distinct advertising angle.{' '}
              <span className="font-semibold text-ink">A variation</span> is another version of that concept, such as a different hook or
              call to action. The totals are finished ad variations and already include the variations; they are not extra videos on top.
            </p>
            <p>
              Standard videos run up to {FORMATS.standardMaxSeconds} seconds. {FORMATS.longForm} {SHARED_SPRINT_LANGUAGE_NOTE}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
