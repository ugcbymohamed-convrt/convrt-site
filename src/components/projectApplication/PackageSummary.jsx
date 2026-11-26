import { useState } from 'react'
import { currentLocale } from '../../i18n/locale.js'
import { tr, hrefFor } from '../../i18n/tr.js'
import { paCopy } from '../../i18n/projectApplicationCopy.js'
import { formatMoney, SPRINT, SPRINT_PLUS, ORGANIC, creatorsLine } from '../../seo/businessKnowledge.js'
import { formatMoneyEs } from '../../i18n/es/money.js'
import { formatMoneyFr } from '../../i18n/fr/money.js'
import { formatMoneyAr } from '../../i18n/ar/money.js'
import { PACKAGE_IDS, selectionFor } from '../../lib/projectApplication.js'

/* THE SELECTED-PACKAGE CARD (and the package chooser it opens).

   Everything numeric on it comes from `selection`, which src/lib/projectApplication.js builds from the existing pricing configuration (never from the URL's text): the price and
   currency of the language, the deliverables of the package and its commitment. Sentences that already exist on the pricing page ("10 business days turnaround") are read through
   tr() from the same templates, so the two pages cannot drift; the rest is the copy module. */

const FORMAT = { en: (s) => formatMoney({ amount: s.amount, currency: s.currency }), es: (s) => formatMoneyEs(s), fr: (s) => formatMoneyFr(s), ar: (s) => formatMoneyAr(s) }
export const priceLabel = (locale, sel) => (sel.custom ? null : FORMAT[locale](sel))

const DATA = { sprint: SPRINT, 'sprint-plus': SPRINT_PLUS }

/* The deliverable lines of a package, in the pricing page's own words (translated by the existing dictionaries). */
function deliverables(sel) {
  if (sel.custom) return []
  if (sel.category === 'paid') {
    const d = DATA[sel.packageId]
    return [
      tr(`${sel.concepts} distinct creative concepts`),
      tr(`${sel.variationsPerConcept} versions per concept, changing the hook or CTA`),
      tr(creatorsLine(d)),
      tr(`${sel.turnaroundBusinessDays} business days turnaround`),
      tr(`${sel.revisionRoundsPerConcept} revision rounds per creative concept`),
      tr(`${sel.usageMonths} months of worldwide usage rights`),
    ]
  }
  return [tr(sel.cadence), tr(ORGANIC.includedInBoth[0]), tr(ORGANIC.includedInBoth[1]), tr(`${ORGANIC.platforms.slice(0, -1).join(', ')} & ${ORGANIC.platforms.at(-1)} distribution`)]
}

function CommitmentLine({ sel, c }) {
  if (sel.custom) return <>{c.summary.customNote}</>
  if (sel.category === 'organic') return <>{c.summary.organicCommitment(sel.commitmentMonths)}</>
  return <>{sel.billing === 'monthly' ? c.summary.commitment(sel.commitmentMonths, sel.cancellationNoticeDays) : c.summary.oneTimeTerms}</>
}

export default function PackageSummary({ selection, onSelect, locked = false }) {
  const locale = currentLocale()
  const c = paCopy(locale)
  const [open, setOpen] = useState(false)
  const price = priceLabel(locale, selection)
  const kind = selection.custom ? c.summary.custom : selection.category === 'organic' ? c.summary.organicProduction : selection.billing === 'monthly' ? c.summary.monthlyProduction : c.summary.oneTimeProduction
  const unit = selection.billing === 'monthly' ? tr('/month') : selection.billing === 'one-time' ? tr('/project') : ''
  const canSwitchBilling = !selection.custom && selection.category === 'paid'
  const list = deliverables(selection)

  return (
    <section aria-label={c.aria.summary} className="relative overflow-hidden rounded-[28px] border border-lime/30 bg-surface-1 p-6 shadow-[0_30px_80px_-40px_rgba(213,255,64,0.35)] sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-lime/[0.10] blur-[90px]" />
      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime">{c.summary.eyebrow}</p>
        <h2 className="mt-3 font-display text-[1.65rem] font-bold leading-tight tracking-display text-ink sm:text-[1.9rem]">{c.names[selection.packageId]}</h2>
        <p className="mt-1.5 text-sm font-semibold text-ink-muted">{kind}</p>

        <div className="mt-5 flex items-baseline gap-2" data-testid="selected-price">
          {price ? (
            <>
              <span dir="ltr" className="font-display text-[2.6rem] font-bold leading-none tracking-display text-ink tabular-nums">{price}</span>
              {unit && <span className="text-base font-medium text-ink-subtle">{unit}</span>}
            </>
          ) : (
            <span className="font-display text-[2rem] font-bold leading-none tracking-display text-ink">{c.summary.noPrice}</span>
          )}
        </div>
        {!selection.custom && selection.category === 'paid' && <p className="mt-3 inline-flex rounded-full bg-lime px-3 py-1 text-[12.5px] font-bold text-canvas">{c.summary.concepts(selection.concepts, selection.variations)}</p>}

        {list.length > 0 && (
          <ul className="mt-5 space-y-2" aria-label={c.summary.includesLabel}>
            {list.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px] leading-snug text-ink-muted">
                <svg viewBox="0 0 16 16" className="mt-[3px] h-4 w-4 shrink-0 text-lime" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 rounded-2xl border border-hairline bg-canvas/60 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-subtle">{c.summary.commitmentLabel}</p>
          <p className="mt-1 text-[13.5px] leading-snug text-ink-muted"><CommitmentLine sel={selection} c={c} /></p>
        </div>
        {c.summary.exVat && !selection.custom && <p className="mt-3 text-xs text-ink-subtle">{c.summary.exVat}</p>}

        {!locked && (
          <div className="mt-6 border-t border-hairline pt-5">
            {canSwitchBilling && (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-[12.5px] font-semibold text-ink-muted">{c.summary.billing}</span>
                <div role="radiogroup" aria-label={c.summary.billing} className="inline-grid grid-cols-2 rounded-full border border-hairline bg-canvas/60 p-0.5">
                  {['monthly', 'one-time'].map((b) => {
                    const active = selection.billing === b
                    return (
                      <button
                        key={b} type="button" role="radio" aria-checked={active}
                        onClick={() => onSelect(selection.packageId, b)}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 ${active ? 'bg-lime text-canvas' : 'text-ink-muted hover:text-ink'}`}
                      >
                        {b === 'monthly' ? c.summary.monthly : c.summary.oneTime}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
              <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="font-semibold text-ink-muted underline underline-offset-4 transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
                {open ? c.summary.closeChange : c.summary.change}
              </button>
              <a href={hrefFor('/pricing#packages')} className="text-ink-subtle underline underline-offset-4 transition-colors hover:text-lime">{c.summary.backToPricing}</a>
            </div>
            {open && <PackageList selection={selection} onSelect={(id, b) => { setOpen(false); onSelect(id, b) }} compact />}
          </div>
        )}
      </div>
    </section>
  )
}

/* The package list: every package the application supports, grouped by service. `compact` = inside the summary card. Choosing one keeps the visitor on the page. */
export function PackageList({ selection, onSelect, compact = false }) {
  const locale = currentLocale()
  const c = paCopy(locale)
  const groups = [['paid', c.summary.choose.paid], ['organic', c.summary.choose.organic]]
  return (
    <div className={compact ? 'mt-4 space-y-4' : 'space-y-6'}>
      {groups.map(([category, title]) => (
        <div key={category}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-subtle">{title}</p>
          <ul className="mt-2 grid grid-cols-1 gap-2">
            {PACKAGE_IDS.map((id) => {
              const sel = selectionFor(locale, id, undefined, { defaultBilling: true })
              if (!sel || sel.category !== category) return null
              const active = selection?.packageId === id
              const p = priceLabel(locale, sel)
              return (
                <li key={id}>
                  <button
                    type="button" aria-pressed={active}
                    onClick={() => onSelect(id, sel.billing === 'monthly' || sel.billing === 'one-time' ? sel.billing : undefined)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start text-[14.5px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime ${active ? 'border-lime bg-lime/10 text-ink' : 'border-hairline-strong text-ink-muted hover:border-ink-subtle/60 hover:text-ink'}`}
                  >
                    <span className="font-semibold">{c.names[id]}</span>
                    <span dir="ltr" className="shrink-0 text-[13px] text-ink-subtle tabular-nums">{p ? `${p}${sel.billing === 'monthly' ? tr('/month') : ''}` : c.summary.noPrice}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
