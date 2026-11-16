import { useEffect, useState } from 'react'
import {
  SPRINT, SPRINT_PLUS, USAGE_RIGHTS, SHARED_SPRINT_BENEFITS, SHARED_SPRINT_LANGUAGE_NOTE, SHARED_SPRINT_NOTE, PRODUCTION_STAGES,
  ORGANIC_STAGES, ORGANIC, ORGANIC_COMMITMENT, FORMATS, RAW_FOOTAGE, REVISIONS, formatMoney,
} from '../../seo/businessKnowledge.js'
import { SectionHeader, Check } from './shared.jsx'

/* SECTION 3: "The details." One section, four panels, ALL CLOSED on load (one open at a time; switching goal closes them).
   Every panel's content is always in the DOM (collapsed = grid-rows 0fr + `visibility`), so the prerendered HTML carries all of
   it; the open state is presentation only. Paid Social and Organic Social variants are both in the DOM; `hidden` picks the visible
   one. Long-form policies (reshoots, shipping and SaaS access, copyright, expiry details, organic renewal) live in the FAQ. */

const Icon = ({ children, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const Tile = ({ children }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline-strong bg-surface-2 text-lime">
    <Icon className="h-[18px] w-[18px]">{children}</Icon>
  </span>
)

const BENEFIT_ICONS = {
  research: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
  approval: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 14l2 2 4-4" /></>,
  creators: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-4 3.5-6 7-6s6.2 2 7 6" /></>,
  production: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10.5l4-2.5v8l-4-2.5" /></>,
  extras: <><path d="M4 7h16M4 12h10M4 17h13" /></>,
  reframing: <><rect x="3" y="5" width="11" height="11" rx="1.5" /><rect x="10" y="9" width="11" height="11" rx="1.5" /></>,
  variations: <><rect x="4" y="4" width="10" height="13" rx="2" /><path d="M8 20h9a3 3 0 003-3V9" /></>,
  testing: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  language: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17" /></>,
}
const USE_ICONS = [
  <><path d="M3 11v3a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z" /><path d="M15 9a4 4 0 010 6M18 6.5a8 8 0 010 11" /></>,
  <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8.5h18M8 21h8" /></>,
]

const Note = ({ children, className = '' }) => <p className={`text-[13px] leading-relaxed text-ink-muted ${className}`}>{children}</p>

/* ── Panel 1: what's included ─────────────────────────────────────────────────────────── */
function IncludedPaid() {
  return (
    <>
      {/* Nine items in a 3 x 3 grid on desktop (2 columns on tablet, 1 on phones). */}
      <ul className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {SHARED_SPRINT_BENEFITS.map((b) => (
          <li key={b.id} className="flex items-start gap-3">
            <Tile>{BENEFIT_ICONS[b.id]}</Tile>
            <span className="min-w-0 pt-[7px]">
              <span className="block text-[13.5px] leading-snug text-ink">{b.label}</span>
              {b.detail && <span className="mt-0.5 block text-[12px] leading-snug text-ink-subtle">{b.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
      <Note className="mt-4">{SHARED_SPRINT_LANGUAGE_NOTE} {SHARED_SPRINT_NOTE}</Note>
    </>
  )
}
function IncludedOrganic() {
  return (
    <>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5 lg:grid-cols-4">
        {ORGANIC.panelInclusions.map((t) => (
          <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink"><Check />{t}</li>
        ))}
      </ul>
      <Note className="mt-4">{ORGANIC.panelNote}</Note>
    </>
  )
}

/* ── Panel 2: usage rights ────────────────────────────────────────────────────────────── */
function UsagePaid() {
  const u = USAGE_RIGHTS.panel
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
        <div>
          <p className="font-display text-[17px] font-semibold leading-snug text-ink">{u.headline}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-subtle">{u.fromDelivery}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {u.shortUses.map((t, i) => (
            <li key={t} className="flex items-center gap-2 rounded-full border border-hairline-strong bg-surface-2 py-1 pl-1.5 pr-3.5 text-[13px] font-medium text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime/10 text-lime"><Icon className="h-3.5 w-3.5">{USE_ICONS[i]}</Icon></span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-hairline">
        <table className="w-full text-left text-[13px] md:text-sm">
          <caption className="sr-only">Usage rights extension prices per package, for the entire creative batch, excluding VAT</caption>
          <thead className="bg-surface-2 text-ink">
            <tr>
              <th scope="col" className="px-3 py-2.5 font-semibold md:px-4">Extend your {USAGE_RIGHTS.includedMonths} months</th>
              <th scope="col" className="px-3 py-2.5 font-semibold md:px-4">Sprint</th>
              <th scope="col" className="px-3 py-2.5 font-semibold md:px-4">Sprint Plus</th>
            </tr>
          </thead>
          <tbody className="text-ink-muted">
            {SPRINT.usageExtensions.map((e, i) => (
              <tr key={e.months} className="border-t border-hairline">
                <th scope="row" className="px-3 py-2 font-medium text-ink md:px-4">
                  Additional {e.months} months
                  <span className="block text-[11.5px] font-normal text-ink-subtle">{USAGE_RIGHTS.includedMonths + e.months} months in total</span>
                </th>
                <td className="px-3 py-2 font-display font-bold tabular-nums text-ink md:px-4">{formatMoney(e.price)}</td>
                <td className="px-3 py-2 font-display font-bold tabular-nums text-ink md:px-4">{formatMoney(SPRINT_PLUS.usageExtensions[i].price)}</td>
              </tr>
            ))}
            <tr className="border-t border-hairline">
              <th scope="row" className="px-3 py-2 font-medium text-ink md:px-4">Perpetual usage</th>
              <td className="px-3 py-2 md:px-4" colSpan={2}>Custom quote, subject to agreement with the featured creators</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-y-1.5">
        <Note>{u.batchNote}</Note>
        <Note>{u.expirySummary}</Note>
        <Note>{u.creatorNote}</Note>
      </div>
    </>
  )
}
function UsageOrganic() {
  return <Note>{USAGE_RIGHTS.panel.organic}</Note>
}

/* ── Panel 3: how we work ─────────────────────────────────────────────────────────────── */
const PAID_STAGE_ICONS = {
  strategy: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
  preparation: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 14l2 2 4-4" /></>,
  production: <><rect x="3" y="6" width="14" height="12" rx="2" /><path d="M17 10.5l4-2.5v8l-4-2.5" /></>,
  delivery: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
}
const ORG_STAGE_ICONS = {
  strategy: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /></>,
  production: PAID_STAGE_ICONS.production,
  publishing: <><path d="M21 4L10 14M21 4l-6.5 17-3.5-7-7-3.5z" /></>,
  optimization: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
}
function Stages({ stages, icons }) {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((st, i) => (
        <li key={st.id} className="flex items-start gap-3 rounded-2xl border border-hairline bg-black/20 p-3.5">
          <Tile>{icons[st.id]}</Tile>
          <div>
            <p className="font-display text-[14px] font-semibold leading-snug text-ink">
              <span className="mr-1.5 text-lime">{String(i + 1).padStart(2, '0')}</span>{st.title}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-muted">{st.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ── Panel 4: production & extras ─────────────────────────────────────────────────────── */
function Rows({ rows }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
      {rows.map(([t, d, sub]) => (
        <div key={t} className="border-t border-hairline pt-2.5">
          <dt className="font-display text-[14px] font-semibold text-ink">{t}</dt>
          <dd className="mt-0.5 text-[13.5px] leading-snug text-ink-muted">
            {d}
            {sub && <span className="block text-[12.5px] text-ink-subtle">{sub}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
function DetailsPaid() {
  return (
    <Rows
      rows={[
        ['Turnaround', `${SPRINT.turnaroundBusinessDays} business days — Sprint. ${SPRINT_PLUS.turnaroundBusinessDays} business days — Sprint Plus.`, 'Starts after concept and script approval.'],
        ['Revisions', `${REVISIONS.roundsPerConcept} rounds per creative concept.`],
        ['Video length', `Up to ${FORMATS.standardMaxSeconds} seconds. Custom 1–3 minute videos available.`],
        ['Formats', 'Vertical, square and 4:5.'],
        ['Horizontal production', '16:9 counts as a separate video.'],
        ['Raw footage', `${formatMoney(RAW_FOOTAGE.price)} per ${RAW_FOOTAGE.per}. ${RAW_FOOTAGE.shortNote}`],
      ]}
    />
  )
}
function DetailsOrganic() {
  return (
    <Rows
      rows={[
        ['Post volume', `${ORGANIC.light.name}: ${ORGANIC.light.cadence}. ${ORGANIC.growth.name}: ${ORGANIC.growth.cadence}.`],
        ['Platforms', `${ORGANIC.platforms.slice(0, -1).join(', ')} & ${ORGANIC.platforms.at(-1)}.`],
        ['Initial commitment', `${ORGANIC_COMMITMENT.initialMonths} months. ${ORGANIC_COMMITMENT.afterInitial}`],
        ['Community management', 'Social media engagement and brand relationship management, per the applicable agreement.'],
        ['Not included', 'Customer support and paid advertising management.'],
        ['Operational terms', 'Turnaround, revisions and reporting are set out in the applicable agreement. Sprint terms do not automatically apply.'],
      ]}
    />
  )
}

/* ── the accordion ────────────────────────────────────────────────────────────────────── */
const PANELS = [
  {
    id: 'included',
    title: "What's included",
    summary: { paid: 'Full creative production.', organic: 'Content, publishing and engagement.' },
    icon: <><path d="M5 12.5l4.5 4.5L19 7" /></>,
    paid: <IncludedPaid />, organic: <IncludedOrganic />,
  },
  {
    id: 'usage',
    title: 'Usage rights',
    summary: { paid: '6 months worldwide. Flexible extensions.', organic: 'Terms set out in your agreement.' },
    icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8.5h18M8 21h8" /></>,
    paid: <UsagePaid />, organic: <UsageOrganic />,
  },
  {
    id: 'how',
    title: 'How we work',
    summary: { paid: 'From strategy to delivery.', organic: 'From strategy to delivery.' },
    icon: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="12" r="2" /><circle cx="6" cy="18" r="2" /><path d="M8 6h4a4 4 0 014 4M8 18h4a4 4 0 004-4" /></>,
    paid: <Stages stages={PRODUCTION_STAGES} icons={PAID_STAGE_ICONS} />, organic: <Stages stages={ORGANIC_STAGES} icons={ORG_STAGE_ICONS} />,
  },
  {
    id: 'details',
    title: 'Production & extras',
    summary: { paid: 'Revisions, formats and add-ons.', organic: 'Post volume, platforms and scope.' },
    icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    paid: <DetailsPaid />, organic: <DetailsOrganic />,
  },
]

function Panel({ panel, open, onToggle, service }) {
  const btnId = `info-q-${panel.id}`
  const bodyId = `info-a-${panel.id}`
  return (
    <div className={`rounded-2xl border transition-colors duration-300 ${open ? 'border-lime/30 bg-surface-1/80' : 'border-hairline bg-surface-1/50 hover:border-hairline-strong'}`}>
      <h3>
        <button
          id={btnId}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 md:px-5 md:py-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-lime">
            <Icon>{panel.icon}</Icon>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] font-semibold leading-snug text-ink md:text-[17px]">{panel.title}</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">
              <span hidden={service !== 'paid'}>{panel.summary.paid}</span>
              <span hidden={service !== 'organic'}>{panel.summary.organic}</span>
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center motion-reduce:transition-none"
            style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4"><path d="M8 2v12M2 8h12" stroke={open ? '#d5ff40' : 'rgba(255,255,255,0.5)'} strokeWidth="1.75" strokeLinecap="round" /></svg>
          </span>
        </button>
      </h3>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={btnId}
        className="grid motion-reduce:transition-none"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          visibility: open ? 'visible' : 'hidden',
          transition: `grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s linear ${open ? '0s' : '0.4s'}`,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-5 pt-1 md:px-5">
            <div hidden={service !== 'paid'}>{panel.paid}</div>
            <div hidden={service !== 'organic'}>{panel.organic}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InfoPanels({ service }) {
  // Every panel starts closed (server and client alike). Switching the goal returns the section to that clean state.
  const [openId, setOpenId] = useState(null)
  useEffect(() => { setOpenId(null) }, [service])

  return (
    <section id="package-info" aria-labelledby="info-heading" className="relative overflow-hidden py-9 md:py-12">
      <div className="relative mx-auto max-w-4xl px-5 md:px-8">
        <SectionHeader id="info-heading" title="The details." intro="Everything you need to know before getting started." />
        <div className="space-y-3">
          {PANELS.map((p) => (
            <Panel key={p.id} panel={p} service={service} open={openId === p.id} onToggle={() => setOpenId((cur) => (cur === p.id ? null : p.id))} />
          ))}
        </div>
      </div>
    </section>
  )
}
