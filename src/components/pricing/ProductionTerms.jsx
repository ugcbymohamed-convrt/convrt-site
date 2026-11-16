import { SPRINT, SPRINT_PLUS, REVISIONS, FORMATS, RAW_FOOTAGE, formatMoney } from '../../seo/businessKnowledge.js'
import { SectionHeader } from './shared.jsx'

/* "The important details." Icon rows in two columns (content-height rows, no equal-height cards). The longer reshoot,
   copyright and logistics explanations are in the FAQ (src/seo/pricingFaq.js), not repeated here. */
const rows = () => [
  {
    id: 'turnaround', title: 'Turnaround',
    text: `${SPRINT.turnaroundBusinessDays} business days for Sprint and ${SPRINT_PLUS.turnaroundBusinessDays} business days for Sprint Plus, starting after concept and script approval.`,
    icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  },
  {
    id: 'revisions', title: 'Revisions',
    text: `${REVISIONS.roundsPerConcept === 2 ? 'Two' : REVISIONS.roundsPerConcept} rounds per creative concept.`,
    icon: <><path d="M20 12a8 8 0 11-2.6-5.9" /><path d="M20 4v5h-5" /></>,
  },
  {
    id: 'length', title: 'Video length',
    text: `Up to ${FORMATS.standardMaxSeconds} seconds. Long-form creatives of 1–3 minutes are available at custom pricing.`,
    icon: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10.5l4-2.5v8l-4-2.5" /></>,
  },
  {
    id: 'formats', title: 'Video formats',
    text: 'Vertical production, with square 1:1 and portrait 4:5 reframing included.',
    icon: <><rect x="8" y="3" width="8" height="18" rx="2" /></>,
  },
  {
    id: 'horizontal', title: 'Horizontal production',
    text: '16:9 production counts as a separate video because we film for the intended orientation.',
    icon: <><rect x="3" y="8" width="18" height="9" rx="2" /></>,
  },
  {
    id: 'raw', title: 'Raw footage',
    text: `Optional add-on at ${formatMoney(RAW_FOOTAGE.price)} per ${RAW_FOOTAGE.per}. ${RAW_FOOTAGE.summary}`,
    icon: <><path d="M4 7h16v12H4z" /><path d="M4 7l3-3h10l3 3M9 12l2 2 4-4" /></>,
  },
]

export default function ProductionTerms() {
  return (
    <section id="production-terms" aria-labelledby="terms-heading" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <SectionHeader id="terms-heading" title="The important details." />
        <ul className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
          {rows().map((r) => (
            <li key={r.id} className="flex items-start gap-4 border-t border-hairline pt-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline-strong bg-surface-2 text-lime">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {r.icon}
                </svg>
              </span>
              <div>
                <h3 className="font-display text-base font-semibold leading-snug text-ink">{r.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-[13px] text-ink-subtle">
          Reshoots, product shipping and demo-account requirements are covered in the{' '}
          <a href="#pricing-faq" className="text-lime underline underline-offset-2 hover:text-lime-light">FAQs below</a>.
        </p>
      </div>
    </section>
  )
}
