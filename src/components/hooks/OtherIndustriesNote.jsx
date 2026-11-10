import { OFFER_PATHS } from '../../config.js'
import { trackEvent } from '../../lib/analytics.js'

/* Sits directly under the signup card. Tells visitors outside SaaS and
   e-commerce that CONVRT works with them too, and routes them to the existing
   Roadmap page. No form here: the card above (and its MailerLite flow) is untouched. */

export default function OtherIndustriesNote() {
  return (
    <div className="mt-6 border-t border-hairline pt-6 text-center sm:px-2">
      <p className="text-[15px] font-semibold tracking-snug text-ink">Not in SaaS or E-commerce?</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
        We create performance-driven videos for other industries, too. See if you qualify for{' '}
        <span className="font-semibold text-lime">5 FREE</span> video ad concepts tailored to your brand.
      </p>
      <a
        href={OFFER_PATHS.roadmap}
        onClick={() => trackEvent('hooks_other_industries_click', { location: 'hooks_page' })}
        className="group mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink
                   transition-colors hover:border-lime/50 hover:text-lime motion-reduce:transition-none
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
      >
        Get My 5 FREE Ad Concepts
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">→</span>
      </a>
    </div>
  )
}
