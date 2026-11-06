import { SAMPLE_HOOKS, industryByKey } from '../../lib/hooksLibrary.js'
import { Reveal, SectionHeader, SelectorButton } from './shared.jsx'

/* ─────────────────────────────────────────────
   SECTION 3 — what's inside. Three benefits, each with a real excerpt from
   the library (hook 01 of the selected industry; SaaS until one is chosen).
   Excerpts come from src/lib/hooksLibrary.js, which quotes the approved PDFs.
───────────────────────────────────────────── */

export default function HooksInside({ industry, onCta }) {
  const key = industry || 'saas'
  const hook = SAMPLE_HOOKS[key][0]
  const label = industryByKey(key).short

  const items = [
    {
      n: '01',
      tag: 'Say it',
      title: '10 adaptable verbal hooks',
      body: 'Opening lines with [placeholders] you can reshape around your product and audience.',
      example: `“${hook.verbal}”`,
    },
    {
      n: '02',
      tag: 'Show it',
      title: 'Visual hook ideas to capture attention',
      body: 'A simple on-camera action for each opening, so the first frame earns the next second.',
      example: hook.visual,
    },
    {
      n: '03',
      tag: 'Write it',
      title: 'On-screen text suggestions to strengthen the opening',
      body: 'Short text overlays that reinforce the spoken line before the viewer scrolls on.',
      example: `“${hook.text}”`,
    },
  ]

  return (
    <section aria-labelledby="inside-heading" className="relative overflow-hidden py-16 md:py-24">
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="inside-heading" eyebrow="The library" title="What’s Inside">
            Two versions, SaaS and e-commerce, with 10 hooks each. Every hook has a verbal, a visual and a text part.
          </SectionHeader>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {items.map((it, i) => (
            <Reveal key={it.n} delay={i * 90}>
              <article className="flex h-full flex-col rounded-3xl border border-hairline-strong bg-surface-1 p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{it.n} · {it.tag}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold leading-snug tracking-display text-ink">{it.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{it.body}</p>
                <div className="mt-auto pt-6">
                  <div className="rounded-2xl border border-hairline bg-canvas/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                      From hook {hook.n} · {label}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-snug text-ink">{it.example}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="font-display text-2xl font-bold tracking-display text-ink md:text-3xl">Ready to pick yours?</p>
          <div className="mt-6 flex justify-center">
            <SelectorButton onClick={onCta} className="w-full sm:w-auto">
              Choose My Industry
            </SelectorButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
