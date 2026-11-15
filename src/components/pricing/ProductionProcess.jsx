import { PRODUCTION_PROCESS } from '../../seo/businessKnowledge.js'
import { SectionHeader } from './shared.jsx'

/* The managed production process for the paid packages: eight short steps (real CONVRT process, from the
   business knowledge base), laid out 4 x 2 on desktop, 2 x 4 on tablets and a single column on phones. */
export default function ProductionProcess() {
  return (
    <section aria-labelledby="process-heading" className="relative overflow-hidden py-14 md:py-20">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          id="process-heading"
          eyebrow="Managed production"
          title="From research to test-ready creative."
          intro="One accountable team runs the whole process, so you are not coordinating creators, editors and scripts yourself."
        />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-y-10">
          {PRODUCTION_PROCESS.map((step, i) => (
            <li key={step.title} className="relative border-t border-hairline-strong pt-4">
              <span className="font-display font-bold text-lime text-sm tracking-[0.08em]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-display font-semibold text-ink text-base leading-snug">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
