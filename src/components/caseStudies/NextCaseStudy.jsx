import { getAdjacentCaseStudy } from '../../caseStudies/registry.js'
import { useCaseStudySwitcher } from './CaseStudyContext.jsx'

/* Closing cross-link — surfaces the other project by name and result,
   so the reader doesn't have to scroll back up to the switcher to
   keep exploring. Switches instantly via the existing client-side system. */
export default function NextCaseStudy({ currentId }) {
  const { switchTo } = useCaseStudySwitcher()
  const next = getAdjacentCaseStudy(currentId)
  if (!next || next.id === currentId) return null

  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
          Next Case Study
        </span>

        <button
          type="button"
          onClick={() => switchTo(next.id)}
          className="group mt-4 block w-full rounded-[28px] border border-hairline px-8 py-9 text-center transition-colors duration-300 hover:border-hairline-strong md:px-12 md:py-11"
        >
          <span
            className="font-display font-bold leading-tight text-ink transition-colors duration-300 text-2xl md:text-[32px]"
          >
            {next.label}
          </span>
          <span className="mt-3 block text-[14px] text-ink-muted md:text-[15px]">
            {next.blurb}
          </span>
          <span
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300"
            style={{ color: next.accent }}
          >
            View case study
            <svg
              viewBox="0 0 12 12"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
            >
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  )
}
