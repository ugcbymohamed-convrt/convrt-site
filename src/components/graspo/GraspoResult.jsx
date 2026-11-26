import { useTr } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'
import { statNode } from './GraspoMetrics.jsx'

const ACCENT = '#d5ff40'

/* ARABIC LAYOUT (owner, 2026-11-25: "this section could use a better layout"). The English block is one narrow column of text; in Arabic the same words are laid out as: the headline, the four figures the
   paragraph already states (10.7M organic views · 75 unique leads · 26 high priority · 10 advanced), then the story on one side and the "no paid amplification" statement as a highlighted card on the other.
   Same sentences, same figures (taken from the same strings the funnel uses): nothing is added. */
const AR_FIGURES = [
  { v: '10.7M', label: 'Total Views', accent: true },
  { v: '75', label: 'Unique inbound leads' },
  { v: '26', label: 'High-priority opportunities' },
  { v: '10', label: 'Advanced / quotation-stage' },
]
const RESULT_P1 = 'Over six months, Graspo went from limited visibility in Arabic-speaking markets to 10.7M organic views and a recognizable presence in Saudi Arabia, Iraq, Morocco, Egypt and across the wider MENA region. More importantly, that attention landed with the right people: 75 unique inbound leads, 26 qualified as high priority, and 10 that reached an advanced, quotation-ready stage, publishers, print agencies and buyers who found Graspo through the content itself.'
const RESULT_P2 = 'None of this required paid amplification. It required a content system: strategy, Arabic-first production, and inbound handling working as one operation instead of three disconnected efforts.'

function GraspoResultAr() {
  const tr = useTr()
  return (
    <section className="relative pt-16 pb-6 md:pt-24 md:pb-8">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-8 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
            <span className="text-xs font-medium text-ink-muted">{tr('The Bigger Result')}</span>
          </div>
          <h2 className="font-display font-bold text-ink leading-[1.2] text-3xl md:text-[42px]">
            {tr('Social media stopped being a publishing channel and became a')}{' '}
            <span style={{ color: ACCENT }}>{tr('market-entry engine.')}</span>
          </h2>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 md:mt-12 lg:grid-cols-4 lg:gap-5">
          {AR_FIGURES.map((f) => (
            <li key={f.label} className="relative overflow-hidden rounded-3xl border border-hairline bg-surface-1/50 px-6 py-6 text-center backdrop-blur-md">
              <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-[0.12] blur-2xl" style={{ background: ACCENT }} />
              <p className="relative font-display font-bold leading-none tabular-nums text-[clamp(1.9rem,4vw,2.6rem)]" style={{ color: f.accent ? ACCENT : '#ffffff' }}>{statNode('ar', f.v)}</p>
              <p className="relative mt-3 text-[13px] font-semibold leading-snug text-ink">{tr(f.label)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 lg:grid-cols-12 lg:gap-6">
          <div className="rounded-3xl border border-hairline bg-surface-1/40 px-7 py-7 md:px-9 md:py-8 lg:col-span-7">
            <p className="text-[15px] leading-[1.9] text-ink-muted md:text-base">{tr(RESULT_P1)}</p>
          </div>
          <div className="flex items-center rounded-3xl border px-7 py-7 md:px-9 md:py-8 lg:col-span-5" style={{ borderColor: 'rgba(213,255,64,0.35)', background: 'linear-gradient(160deg, rgba(213,255,64,0.10), rgba(213,255,64,0.02))' }}>
            <p className="text-[15px] leading-[1.9] text-ink md:text-base">{tr(RESULT_P2)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function GraspoResult() {
  if (currentLocale() === 'ar') return <GraspoResultAr />
  return <GraspoResultEn />
}

function GraspoResultEn() {
  const tr = useTr()
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 mb-8 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">{tr('The Bigger Result')}</span>
        </div>

        <h2 className="font-display font-bold text-ink tracking-display leading-[1.08] text-3xl md:text-[42px]">
          {tr('Social media stopped being a publishing channel and became a')}{' '}
          <span style={{ color: ACCENT }}>{tr('market-entry engine.')}</span>
        </h2>

        <p className="mt-7 text-[15px] md:text-base text-ink-muted leading-relaxed">
          {tr('Over six months, Graspo went from limited visibility in Arabic-speaking markets to 10.7M organic views and a recognizable presence in Saudi Arabia, Iraq, Morocco, Egypt and across the wider MENA region. More importantly, that attention landed with the right people: 75 unique inbound leads, 26 qualified as high priority, and 10 that reached an advanced, quotation-ready stage, publishers, print agencies and buyers who found Graspo through the content itself.')}
        </p>
        <p className="mt-5 text-[15px] md:text-base text-ink-muted leading-relaxed">
          {tr('None of this required paid amplification. It required a content system: strategy, Arabic-first production, and inbound handling working as one operation instead of three disconnected efforts.')}
        </p>
      </div>
    </section>
  )
}
