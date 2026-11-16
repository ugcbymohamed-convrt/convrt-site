import { SPRINT } from '../../seo/businessKnowledge.js'
import { SectionHeader, ConceptAccents } from './shared.jsx'

/* "5 concepts. 10 opportunities to test." Explains the Creative Testing Sprint structure only (5 x 2 = 10).
   The angle names are ILLUSTRATIVE: real concepts come from each client's research. Sprint Plus is not drawn here
   because its concept count is unconfirmed (see businessKnowledge.js). Real HTML text, not an image, so it is
   readable in the prerendered page. */
const ILLUSTRATIVE_ANGLES = ['Problem-led', 'Social proof', 'Product in use', 'Objection handling', 'Offer-led']

export default function ConceptExplainer() {
  return (
    <section aria-labelledby="concepts-heading" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeader
          id="concepts-heading"
          eyebrow="How a sprint is built"
          title={`${SPRINT.concepts} creative concepts. ${SPRINT.variations} opportunities to test.`}
          intro="Changing the opening sentence, caption, or background does not create a genuinely new test. CONVRT develops distinct creative directions built around different customer problems, promises, formats, creators, and conversion angles. You receive a structured creative batch, not a collection of unrelated videos."
        />
        <p className="-mt-6 mb-8 text-center text-[13px] leading-relaxed text-ink-subtle md:-mt-8 md:mb-10">
          Built for apps, SaaS companies, digital services, e-commerce brands and teams actively running paid-social campaigns.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
          <div className="rounded-[22px] border border-hairline bg-surface-1/60 p-5 md:p-6">
            <h3 className="font-display font-semibold text-ink tracking-snug text-base md:text-lg">Creative concept</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              A distinct advertising angle or idea, such as a different customer problem, promise or way of showing the
              product.
            </p>
          </div>
          <div className="rounded-[22px] border border-hairline bg-surface-1/60 p-5 md:p-6">
            <h3 className="font-display font-semibold text-ink tracking-snug text-base md:text-lg">Variation</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              An alternative version of one concept, with a different hook or call to action, according to the creative
              testing plan.
            </p>
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4" aria-label="Illustrative sprint structure">
          {ILLUSTRATIVE_ANGLES.map((angle, i) => {
            const accent = ConceptAccents[i]
            return (
              <li
                key={angle}
                className="rounded-2xl border bg-black/25 p-4 flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-4"
                style={{ borderColor: `${accent}55` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
                    Concept {i + 1}
                  </p>
                  <p className="mt-1 font-display font-semibold text-ink text-sm leading-snug">{angle}</p>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0">
                  {['A', 'B'].map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[11px] font-semibold text-canvas md:w-full"
                      style={{ background: accent, opacity: 0.9 }}
                    >
                      Variation {v}
                    </span>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>

        <p className="mt-5 text-center text-[13px] text-ink-muted leading-relaxed max-w-2xl mx-auto">
          <span className="font-semibold text-ink">
            {SPRINT.concepts} concepts <span className="text-lime">&rarr;</span> {SPRINT.variations} testable ad variations.
          </span>{' '}
          The angles above are illustrative only. Your concepts are developed from your brand, product and audience
          research, and are not guaranteed to match these examples.
        </p>
      </div>
    </section>
  )
}
