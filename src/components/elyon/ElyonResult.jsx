import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'

export default function ElyonResult() {
  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-5 md:px-8 text-center">
        <Eyebrow label="The Takeaway" accent={ACCENT} className="mb-8" />

        <h2 className="font-display font-bold text-ink tracking-display leading-[1.08] text-3xl md:text-[42px]">
          A premium brand doesn't need
          <br />
          "UGC-looking UGC."
        </h2>

        <p className="mt-7 text-[15px] md:text-base text-ink-muted leading-relaxed">
          It needs native creative that protects the brand while still performing like paid social.
          For Elyon, that became a repeatable system of street interviews, creator-led ads and
          performance concepts across multiple locations.
        </p>
        <p className="mt-5 text-[15px] md:text-base text-ink-muted leading-relaxed">
          Even during an early learning phase, individual creatives reached as high as 5.28x ROAS.
          The bigger win was building a system capable of producing and iterating more of them.
        </p>
      </div>
    </section>
  )
}
