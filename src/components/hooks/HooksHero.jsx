import HookCardsVisual from './HookCardsVisual.jsx'
import { SelectorButton } from './shared.jsx'

/* HERO — the offer, one CTA (scrolls to the industry selector) and an
   animated stack of real hook cards. No performance claims. */

export default function HooksHero({ onCta }) {
  return (
    <section aria-labelledby="hooks-h1" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/10 blur-[160px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8 md:pt-12 md:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="min-w-0 lg:col-span-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-3.5 py-1.5 backdrop-blur">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted sm:text-xs sm:tracking-[0.18em]">
                Free Hooks Library
              </span>
            </div>

            <h1 className="mt-6 font-display font-bold text-ink tracking-display-xl leading-[1.03] text-[2.4rem] min-[400px]:text-[2.9rem] sm:text-[3.4rem] md:text-[4rem] lg:text-[3.2rem] xl:text-[4rem]">
              <span className="block">10 Ad Hooks</span>
              <span className="block">Worth Testing.</span>
              <span className="block text-lime">Free.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Stop staring at a blank script. Get 10 ready-to-adapt advertising hooks designed to capture attention,
              spark curiosity, and give your next video ads a stronger start.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-4 sm:items-start">
              <SelectorButton onClick={onCta} className="w-full sm:w-auto">
                Get My 10 Free Hooks
              </SelectorButton>
              <p className="text-sm leading-relaxed text-ink-subtle">
                Choose SaaS or e-commerce. Delivered to your inbox.
              </p>
            </div>
          </div>

          {/* Visual */}
          <div className="min-w-0 lg:col-span-5">
            <HookCardsVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
