import { OFFER_PATHS } from '../../config.js'
import { PrimaryCta } from './shared.jsx'

/* Two conversion blocks used on the blog index (and the roadmap block again inside articles).
   No forms here: both are plain links to the existing lead pages. */

/* Free-hooks promo: compact, styled like the pink "10 FREE Ad Hooks" card on the homepage. */
export function HooksPromo({ comingSoon = true }) {
  return (
    <section aria-labelledby="blog-hooks-heading" className="mx-auto max-w-7xl px-5 md:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-[#F472B6]/35 bg-[#EC4899]/[0.08] p-6 sm:p-8
                   md:flex md:items-center md:justify-between md:gap-10"
      >
        <div className="flex items-start gap-4 md:max-w-2xl md:gap-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F472B6]/35 bg-[#EC4899]/15 text-[#F472B6]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h2 id="blog-hooks-heading" className="font-display text-2xl font-bold leading-tight tracking-display text-ink md:text-[1.75rem]">
              Don’t Leave <span className="text-[#F472B6]">Empty-Handed.</span>
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted md:text-base">
              {comingSoon
                ? 'While we’re preparing our first insights, grab 10 free advertising hooks you can adapt for your next video.'
                : 'Grab 10 free advertising hooks you can adapt for your next video.'}
            </p>
          </div>
        </div>
        <div className="mt-6 md:mt-0 md:shrink-0">
          <PrimaryCta
            href={OFFER_PATHS.hooks}
            event="blog_hooks_click"
            params={{ location: 'blog_index' }}
            className="w-full md:w-auto"
          >
            Get 10 Free Ad Hooks
          </PrimaryCta>
        </div>
      </div>
    </section>
  )
}

/* Closing CTA → Free Creative Growth Roadmap. `location` is passed to analytics. */
export function RoadmapPromo({ id = 'blog-roadmap-heading', location = 'blog_index', headline, copy, className = '', as: Tag = 'h2' }) {
  return (
    <section aria-labelledby={id} className={className}>
      <div className="relative overflow-hidden rounded-[28px] border border-lime/25 bg-surface-1 px-5 py-12 text-center sm:px-10 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[820px] max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(213,255,64,0.10) 0%, transparent 60%)' }}
        />
        <div className="relative mx-auto max-w-2xl">
          <Tag
            id={id}
            className="font-display text-[1.9rem] font-bold leading-[1.1] tracking-display text-ink sm:text-4xl md:text-[2.6rem]"
          >
            {headline ?? (
              <>
                Need Fresh <span className="text-lime">Ad Ideas Now?</span>
              </>
            )}
          </Tag>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            {copy ?? 'Get five personalized video ad concepts worth testing for your brand.'}
          </p>
          <div className="mt-8 flex flex-col items-stretch sm:items-center">
            <PrimaryCta href={OFFER_PATHS.roadmap} event="blog_roadmap_click" params={{ location }}>
              Get My Free Creative Roadmap
            </PrimaryCta>
          </div>
        </div>
      </div>
    </section>
  )
}
