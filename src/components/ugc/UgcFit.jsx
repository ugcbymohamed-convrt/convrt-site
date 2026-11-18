import { CONTACT_EMAIL } from '../../config.js'
import { trackEvent } from '../../lib/analytics.js'
import { Section, Reveal, Eyebrow, TextLink } from './shared.jsx'

/* SECTION 9: who we're best suited to. A short, positive statement: no negative list, and no limit on industry, country or language. */

const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('UGC video production')}`

export default function UgcFit() {
  return (
    <Section id="best-suited" label="ugc-fit-heading" className="!py-10 md:!py-14">
      <Reveal>
        <div className="mx-auto max-w-3xl rounded-3xl border border-lime/25 bg-surface-1/70 p-8 text-center backdrop-blur-md md:p-12">
          <Eyebrow>Fit</Eyebrow>
          <h2 id="ugc-fit-heading" className="mt-5 font-display text-[1.7rem] font-bold leading-[1.08] tracking-display text-ink sm:text-4xl">
            Built for brands that want to test, not guess.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
            CONVRT works best with brands that run paid social and want to try several creative angles rather than rely on a single video.
            We work with brands across industries, including but not limited to SaaS, e-commerce, apps, technology and consumer products,
            and we produce for international and multilingual audiences. When your project doesn&rsquo;t fit a standard package, we&rsquo;ll tailor one.
          </p>
          <p className="mt-6 text-sm">
            <TextLink href={MAILTO} onClick={() => trackEvent('ugc_email_click', { location: 'fit' })}>Tell us about your project</TextLink>
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
