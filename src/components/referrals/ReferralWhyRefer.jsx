import { Reveal, SectionHeader } from '../roadmap/shared.jsx'

/* ─────────────────────────────────────────────
   WHY REFER CONVRT — lowers the reputational risk of recommending us.

   Reassurance without bragging: what CONVRT actually makes, as short labels (the same services
   described on the homepage) plus two REAL portfolio frames from the homepage showcase,
   lazy-loaded with explicit dimensions (no layout shift) and linking to the real case
   studies page. No testimonials, results or statistics are shown: none have been confirmed
   for use on this page, so they are intentionally omitted.
───────────────────────────────────────────── */

const CAPABILITIES = [
  {
    title: 'Human-led UGC & spokesperson videos',
    icon: <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-7 8c.6-3.4 3.4-5.5 7-5.5s6.4 2.1 7 5.5" />,
  },
  {
    title: 'Multilingual video production',
    icon: <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5ZM12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z" />,
  },
  {
    title: 'SaaS explainers & product demos',
    icon: <path d="M4 5.5h16v10H4v-10ZM9 19h6M12 15.5V19M10.5 8.8v3.4l3-1.7-3-1.7Z" />,
  },
  {
    title: 'Performance-focused creative strategy',
    icon: <path d="M4 19V5M4 19h16M8 15l3.5-4 3 2.5L19 8" />,
  },
  {
    title: 'Video for paid ads & social',
    icon: <path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5ZM10.5 9.5v5l4-2.5-4-2.5Z" />,
  },
]

const FRAMES = [
  { src: '/showcase/adscale-creator-poster.webp', w: 540, h: 978, alt: 'Frame from a creator-led video ad produced by CONVRT' },
  { src: '/showcase/adscale-agentic-poster.webp', w: 540, h: 960, alt: 'Frame from a SaaS product video produced by CONVRT' },
]

export default function ReferralWhyRefer() {
  return (
    <section id="why-refer" aria-labelledby="why-heading" className="relative scroll-mt-20 py-16 md:scroll-mt-24 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="why-heading" eyebrow="Why refer CONVRT" title="A Creative Partner You’ll Feel Good Recommending.">
            Your reputation matters. Your referrals get a professional experience.
          </SectionHeader>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {CAPABILITIES.map((c, i) => (
              <li key={c.title} className={i === CAPABILITIES.length - 1 ? 'sm:col-span-2' : ''}>
                <Reveal delay={i * 60} className="h-full">
                  <div className="ref-card flex h-full items-center gap-4 rounded-2xl border border-hairline bg-surface-1 p-5 hover:border-lime/40">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime/40 bg-lime/10 text-lime">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {c.icon}
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold leading-snug tracking-snug text-ink">{c.title}</h3>
                                          </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={120} className="lg:col-span-5">
            <div className="rounded-2xl border border-hairline bg-surface-1 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">From our work</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {FRAMES.map((f) => (
                  <img
                    key={f.src}
                    src={f.src}
                    width={f.w}
                    height={f.h}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[9/16] w-full rounded-xl border border-hairline object-cover"
                  />
                ))}
              </div>
              <a
                href="/case-studies"
                className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-lime focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                See more of CONVRT’s work <span aria-hidden="true">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
