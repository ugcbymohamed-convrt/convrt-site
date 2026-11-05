import { Reveal, SectionHeader, Check } from './shared.jsx'

/* ─────────────────────────────────────────────
   Sections 2–5: What you get · Why CONVRT · How it works · Who it's for.
   Proof uses only assets that already exist on the site (client logos,
   homepage stats, Elyon creatives + case-study ROAS, Talk360 quote).
───────────────────────────────────────────── */

/* ===== 2. WHAT YOU GET ===== */

const DELIVERABLES = [
  {
    icon: IconConcepts,
    title: 'Five Tailored Ad Concepts',
    body: 'Creative ideas developed around your product, positioning, audience, and business objectives.',
  },
  {
    icon: IconHook,
    title: 'Hooks & Creative Angles',
    body: 'Suggested opening hooks and messaging directions designed to capture attention and communicate value.',
  },
  {
    icon: IconFormat,
    title: 'Recommended Video Formats',
    body: 'Suggestions for UGC, spokesperson, creator-led, product demo, or animated formats where relevant to your business.',
  },
  {
    icon: IconPriority,
    title: 'Creative Testing Priorities',
    body: 'A practical recommendation for which concepts to explore first and the reasoning behind them.',
  },
]

export function RoadmapIncluded() {
  return (
    <section aria-labelledby="included-heading" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="included-heading" eyebrow="What's Included" title="Five Concepts. A Clearer Creative Direction.">
            A focused creative roadmap designed to help you identify what to test next and why.
          </SectionHeader>
        </Reveal>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 lg:gap-5">
          {DELIVERABLES.map((item, i) => {
            const Icon = item.icon
            return (
              <li key={item.title} className="flex">
                <Reveal delay={i * 80} className="flex w-full">
                  <article className="flex w-full flex-col rounded-3xl border border-hairline bg-surface-1 p-6 transition-[border-color,background-color] duration-200 hover:border-lime/30 hover:bg-surface-2/50 motion-reduce:transition-none md:p-7">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime/25 bg-lime/10 text-lime">
                        <Icon />
                      </div>
                      <span className="text-xs font-semibold tabular-nums tracking-[0.16em] text-ink-subtle" aria-hidden="true">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-xl font-semibold tracking-snug text-ink">{item.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{item.body}</p>
                  </article>
                </Reveal>
              </li>
            )
          })}
        </ul>

        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-ink-subtle">
            <span className="font-medium text-ink-muted">To be clear:</span> the roadmap is creative direction, not finished
            work. It doesn’t include written scripts or produced videos. Production is a separate service.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ===== 3. WHY CONVRT ===== */

const STATS = [
  { value: '750+', label: 'Creatives produced' },
  { value: '30M+', label: 'Views generated' },
  { value: '50%+', label: 'of clients return for more' },
]

// Real Elyon Dubai creatives — same Cloudflare Stream IDs and labels used by the
// Elyon case study. Static thumbnails only; no video loads on this page.
const CREATIVES = [
  { id: 'fa02007b36fae2b3bb68c97cdd00e9fc', label: 'Creator-Led Ad' },
  { id: '0905b814e2ba3950197b5bfe1cefae38', label: 'Street Interview' },
  { id: '9e6cb8438c9b0c1ab8b55953718eddde', label: 'Performance Concept' },
]

const LOGOS = [
  { src: '/clients/tiktok.png', alt: 'TikTok', h: 24 },
  { src: '/clients/indrive.svg', alt: 'inDrive', h: 28 },
  { src: '/clients/ria.png', alt: 'Ria', h: 32 },
  { src: '/clients/expertoption.png', alt: 'Expert Option', h: 26 },
  { src: '/clients/fixd.png', alt: 'FIXD', h: 26 },
  { src: '/clients/adscale.png', alt: 'Adscale', h: 26 },
  { src: '/clients/toluna.png', alt: 'Toluna', h: 24 },
  { src: '/clients/elyon.png', alt: 'Elyon', h: 34 },
]

export function RoadmapProof() {
  return (
    <section aria-labelledby="why-heading" className="relative overflow-hidden py-16 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-lime/[0.04] blur-[150px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="why-heading" eyebrow="Built by people who create ads" title="Creative Strategy Backed by Production Experience.">
            At CONVRT, we don’t just brainstorm creative ideas. We develop and produce performance-focused video
            content for brands that want to communicate more clearly, capture attention, and grow.
          </SectionHeader>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 md:mt-16 lg:grid-cols-12 lg:gap-12">
          {/* Numbers + quote */}
          <Reveal className="lg:col-span-6">
            <dl className="grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-hairline bg-surface-1 px-3 py-4 text-center sm:px-4 sm:py-5">
                  <dd className="font-display text-2xl font-bold tabular-nums tracking-display text-lime sm:text-3xl">{s.value}</dd>
                  <dt className="mt-1 text-[11px] leading-snug text-ink-muted sm:text-xs">{s.label}</dt>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-lime/20 bg-lime/[0.05] px-5 py-4">
              <p className="font-display text-3xl font-bold tracking-display text-lime">5.28x</p>
              <p className="text-sm leading-snug text-ink-muted">
                <span className="font-semibold text-ink">Up to 5.28x ROAS</span> on creator-led paid social for Elyon Dubai.{' '}
                <a href="/case-studies/elyon" className="whitespace-nowrap font-semibold text-lime underline-offset-4 hover:underline focus-visible:underline">
                  Read the case study →
                </a>
              </p>
            </div>

            <figure className="mt-4 rounded-3xl border border-hairline bg-surface-1 p-6 md:p-7">
              <blockquote className="text-[15px] leading-[1.75] text-ink-muted">
                “The videos are amazing again. Every time we work together the quality just keeps getting better. Fast
                delivery, great communication, and the content performs exactly the way we need it to. This is our third
                order and it won’t be the last.”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-hairline pt-4">
                <img
                  src="/clients/talk360.jpg"
                  alt=""
                  width="36"
                  height="36"
                  loading="lazy"
                  className="h-9 w-9 rounded-[10px] object-cover"
                />
                <span className="text-sm">
                  <span className="block font-semibold text-ink">Talk360</span>
                  <span className="block text-xs text-ink-subtle">Mobile App · International</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>

          {/* Real creatives */}
          <Reveal delay={100} className="lg:col-span-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Creatives we produced for Elyon Dubai
            </p>
            <ul className="grid grid-cols-3 gap-3 md:gap-4">
              {CREATIVES.map((c) => (
                <li key={c.id}>
                  <a
                    href="/case-studies/elyon"
                    className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
                  >
                    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-hairline bg-surface-2">
                      <img
                        src={`https://videodelivery.net/${c.id}/thumbnails/thumbnail.jpg?time=0s&height=520`}
                        alt={`Elyon Dubai ${c.label.toLowerCase()} — thumbnail`}
                        width="293"
                        height="520"
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] font-semibold leading-tight text-white sm:text-xs">
                        {c.label}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-subtle">
              Actual ads from our work.{' '}
              <a href="/case-studies" className="font-medium text-ink-muted underline-offset-4 hover:text-lime hover:underline">
                See more case studies
              </a>
            </p>
          </Reveal>
        </div>

        {/* Client logos — static, uniform white silhouettes */}
        <Reveal>
          <div className="mt-14 border-t border-hairline pt-10 md:mt-16">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              Brands we’ve created for
            </p>
            <ul className="mx-auto mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-x-9 gap-y-6 md:gap-x-12">
              {LOGOS.map((l) => (
                <li key={l.alt}>
                  <img
                    src={l.src}
                    alt={l.alt}
                    height={l.h}
                    loading="lazy"
                    decoding="async"
                    style={{ height: l.h, filter: 'brightness(0) invert(1)' }}
                    className="w-auto max-w-[120px] object-contain opacity-60"
                  />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ===== 4. HOW IT WORKS ===== */

const STEPS = [
  {
    n: '01',
    title: 'Apply',
    body: 'Answer four quick questions about your business and creative challenges.',
  },
  {
    n: '02',
    title: 'Book Your Session',
    body: 'If your brand is a good fit, choose a time straight away. We then research relevant angles and develop five advertising concepts tailored to your business.',
  },
  {
    n: '03',
    title: 'Get Your Roadmap',
    body: 'Meet with CONVRT for a personalized strategy session where we walk you through the ideas and recommended next steps.',
  },
]

export function RoadmapProcess() {
  return (
    <section aria-labelledby="process-heading" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="process-heading" eyebrow="The Process" title="Three Steps to Your Next Creative Direction." />
        </Reveal>

        <ol className="relative mt-12 grid grid-cols-1 gap-0 md:mt-16 md:grid-cols-3 md:gap-6">
          {/* Desktop connector */}
          <div
            aria-hidden="true"
            className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-gradient-to-r from-lime/50 via-lime/20 to-lime/50 md:block"
          />
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex gap-5 pb-10 last:pb-0 md:block md:pb-0 md:text-center">
              {/* Mobile connector */}
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-6 top-12 w-px -translate-x-1/2 bg-gradient-to-b from-lime/40 to-hairline md:hidden" />
              )}
              <Reveal delay={i * 100} className="flex w-full gap-5 md:block">
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-canvas font-display text-sm font-bold tabular-nums text-lime md:mx-auto"
                >
                  {s.n}
                </span>
                <div className="min-w-0 md:mt-6">
                  <h3 className="font-display text-xl font-semibold tracking-snug text-ink">
                    <span className="sr-only">Step {s.n}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted md:mx-auto md:max-w-xs">{s.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal>
          <p className="mt-12 text-center text-base text-ink-muted md:mt-16">
            No pressure. No obligation to hire us. Just practical creative direction for your brand.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ===== 5. WHO IT'S FOR ===== */

const AUDIENCES = [
  {
    icon: IconSaas,
    title: 'SaaS & Software Companies',
    lead: 'For companies looking to:',
    points: [
      'Communicate product value more clearly.',
      'Create engaging explainers and product demos.',
      'Develop new acquisition angles.',
      'Improve the effectiveness of video advertising.',
    ],
  },
  {
    icon: IconCart,
    title: 'E-commerce & DTC Brands',
    lead: 'For brands looking to:',
    points: [
      'Discover new UGC concepts.',
      'Test fresh advertising hooks.',
      'Improve creative variety.',
      'Develop more compelling product storytelling.',
    ],
  },
]

export function RoadmapAudience() {
  return (
    <section aria-labelledby="audience-heading" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="audience-heading" eyebrow="Is this for you?" title="Built for Brands Ready to Improve Their Creative." />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2 md:gap-5">
          {AUDIENCES.map((a, i) => {
            const Icon = a.icon
            return (
              <Reveal key={a.title} delay={i * 100} className="flex">
                <article className="flex w-full flex-col rounded-3xl border border-hairline bg-surface-1 p-6 md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime/25 bg-lime/10 text-lime">
                    <Icon />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-snug text-ink md:text-2xl">{a.title}</h3>
                  <p className="mt-2 text-sm text-ink-subtle">{a.lead}</p>
                  <ul className="mt-4 space-y-3">
                    {a.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[15px] leading-snug text-ink-muted">
                        <Check className="mt-0.5 text-lime" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal>
          <p className="mx-auto mt-8 max-w-2xl rounded-2xl border border-hairline bg-surface-1/60 px-5 py-4 text-center text-sm leading-relaxed text-ink-muted">
            We prioritize established brands with clear products, marketing objectives, and a genuine interest in
            testing or producing new advertising creatives.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Icons (26px grid, 1.6 stroke — matches the site's icon set) ---------- */

function IconConcepts() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3.5" y="9" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 6h13.5a1 1 0 011 1v11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 3.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".6" />
      <path d="M7.5 14.5h6M7.5 18h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function IconHook() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M13 3.5v10.5a4.5 4.5 0 11-4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.8 5.7L13 3.5l3.2 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 14.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3z" fill="currentColor" />
    </svg>
  )
}
function IconFormat() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="10" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.4 10L2.6 5.9a1.2 1.2 0 01.9-1.4l17.3-3.5a1.2 1.2 0 011.4.9l.7 3.4L3.4 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11 14.2l5 2.8-5 2.8v-5.6z" fill="currentColor" />
    </svg>
  )
}
function IconPriority() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M5 21V5M5 6h12l-2.2 3.5L17 13H5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 18.5h11M12.5 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".6" />
    </svg>
  )
}
function IconSaas() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 22.5h8M13 18.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 13l2.5-2.5L13 13l3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconCart() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M3 4.5h3l2.2 11.2a1.5 1.5 0 001.5 1.2h8.7a1.5 1.5 0 001.5-1.1L21.5 9H7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10.5" cy="21" r="1.4" fill="currentColor" />
      <circle cx="18" cy="21" r="1.4" fill="currentColor" />
    </svg>
  )
}
