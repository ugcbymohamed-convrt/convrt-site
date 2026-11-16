import { SPRINT } from '../../seo/businessKnowledge.js'
import { SectionHeader, ConceptAccents } from './shared.jsx'

/* "Different concepts. Not just different hooks." One compact section: two short definitions and a branching diagram
   of the STANDARD Sprint (5 concepts x 2 variations = 10). The angle names are illustrative. All text is real HTML;
   the lines are lightweight SVG that draw in on scroll where the browser supports scroll-driven animation, and are
   simply static otherwise or under prefers-reduced-motion (see .branch-draw in index.css). */
const ILLUSTRATIVE_ANGLES = ['Problem-led', 'Social proof', 'Product in use', 'Objection handling', 'Offer-led']

/* Branch from the concept chip to its two variation chips. Vertical (md+) and horizontal (mobile) versions. */
function Branch({ accent, index, horizontal }) {
  const d = horizontal
    ? ['M0 30 C 22 30, 22 14, 44 14', 'M0 30 C 22 30, 22 46, 44 46']
    : ['M50 0 C 50 22, 22 16, 22 44', 'M50 0 C 50 22, 78 16, 78 44']
  return (
    <svg
      viewBox={horizontal ? '0 0 44 60' : '0 0 100 44'}
      preserveAspectRatio="none"
      className={horizontal ? 'h-[84px] w-9 shrink-0 md:hidden' : 'hidden h-11 w-full md:block'}
      fill="none"
      aria-hidden="true"
    >
      {d.map((path, i) => (
        <path
          key={i}
          d={path}
          pathLength="1"
          stroke={accent}
          strokeWidth="1.8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="branch-draw"
          style={{ '--d': `${index * 70 + i * 40}ms` }}
        />
      ))}
    </svg>
  )
}

export default function ConceptExplainer() {
  return (
    <section aria-labelledby="concepts-heading" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <SectionHeader
          id="concepts-heading"
          title={<>Different concepts. <span className="text-lime">Not just different hooks.</span></>}
          intro="Five distinct advertising ideas, each with two variations to test."
        />

        <dl className="mx-auto mb-8 grid max-w-3xl gap-3 text-[14px] leading-relaxed md:grid-cols-2 md:gap-8">
          <div>
            <dt className="inline font-semibold text-ink">A creative concept</dt>{' '}
            <dd className="inline text-ink-muted">is a distinct advertising idea or angle.</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-ink">An ad variation</dt>{' '}
            <dd className="inline text-ink-muted">changes the hook or CTA within a concept.</dd>
          </div>
        </dl>

        <ol className="grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-4" aria-label="Creative Testing Sprint structure (illustrative)">
          {ILLUSTRATIVE_ANGLES.map((angle, i) => {
            const accent = ConceptAccents[i]
            return (
              <li key={angle} className="flex flex-row items-center gap-2 md:flex-col md:items-stretch md:gap-0">
                <div
                  className="flex-1 rounded-2xl border bg-black/25 px-4 py-3 md:flex-none"
                  style={{ borderColor: `${accent}66` }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>Concept {i + 1}</p>
                  <p className="mt-0.5 font-display text-sm font-semibold leading-snug text-ink">{angle}</p>
                </div>
                <Branch accent={accent} index={i} horizontal />
                <Branch accent={accent} index={i} />
                <div className="flex shrink-0 flex-col gap-2 md:flex-row md:gap-2">
                  {['A', 'B'].map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-[11px] font-semibold text-canvas md:flex-1"
                      style={{ background: accent }}
                    >
                      Variation {v}
                    </span>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>

        <p className="mt-6 text-center font-display text-base font-bold tracking-snug text-ink md:text-lg">
          {SPRINT.concepts} concepts <span className="text-lime">&rarr;</span> {SPRINT.variations} ad variations
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[12.5px] leading-relaxed text-ink-subtle">
          Shown for the standard Creative Testing Sprint; the angles are illustrative, and your concepts are developed from your
          own brand, product and audience research. Sprint Plus distributes its variations across its concepts according to the
          creative testing strategy.
        </p>
      </div>
    </section>
  )
}
