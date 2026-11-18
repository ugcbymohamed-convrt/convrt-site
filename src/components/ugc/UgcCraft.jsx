import { TALENT, PRODUCTION_LANGUAGES, REVISIONS, SPRINT, SPRINT_PLUS } from '../../seo/businessKnowledge.js'
import { OFFER_PATHS } from '../../config.js'
import { Section, Head, Reveal, Tick, TextLink } from './shared.jsx'

/* SECTION 6 (merged): creators and casting, scripts and hooks, and quality control, with the testing note.
   Wording that the process and deliverables sections already carry (the eight steps, "samples before production" as a step) is not
   repeated here beyond one line; this section adds what those do not: how creators are chosen, how versions differ, and the checkpoints.
   Facts come from businessKnowledge.js. */

const HOOKS = [
  ['Verbal hook', 'the first line the creator says'],
  ['Visual hook', 'what viewers see first'],
  ['On-screen text', 'the first words they read'],
]

function Bullets({ items }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-muted">
          <Tick />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

const cardCls = 'h-full rounded-3xl border border-hairline bg-surface-1/60 p-6 backdrop-blur-md'
const kicker = 'text-xs font-semibold uppercase tracking-[0.16em] text-lime'
const title = 'mt-2 font-display text-xl font-semibold leading-snug tracking-snug text-ink'

export default function UgcCraft() {
  const langs = `${PRODUCTION_LANGUAGES.core.slice(0, -1).join(', ')} and ${PRODUCTION_LANGUAGES.core.at(-1)}`
  return (
    <Section id="creative-craft" label="ugc-craft-heading" glow>
      <Reveal>
        <Head
          id="ugc-craft-heading"
          eyebrow="Creative craft"
          title="Human-led creative, checked at every stage."
          intro="UGC works when the right person says the right thing in the first few seconds."
        />
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 lg:grid-cols-3 lg:gap-5">
        <Reveal className="h-full">
          <div className={cardCls}>
            <p className={kicker}>Creators and casting</p>
            <h3 className={title}>The right creator for your product and audience.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              {TALENT.model} We recommend the creator who fits your brand best, chosen for on-camera delivery and product fit, not follower counts.
            </p>
            <Bullets
              items={[
                'You see relevant work samples before production and can take part in selection when you want to.',
                'You can request the same creator for future projects, subject to availability.',
                `We produce in ${langs}, including Gulf and Moroccan Arabic dialects. ${PRODUCTION_LANGUAGES.other}`,
              ]}
            />
          </div>
        </Reveal>

        <Reveal delay={90} className="h-full">
          <div className={cardCls}>
            <p className={kicker}>Scripts, hooks and versions</p>
            <h3 className={title}>Scripts and hooks, built to be tested.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              Each concept gets a complete script written around one approved angle, then a second version that changes the hook or call
              to action, so you can see what actually moves performance instead of guessing.
            </p>
            <dl className="mt-4 space-y-2">
              {HOOKS.map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-hairline bg-canvas/40 px-4 py-2.5 text-[15px]">
                  <dt className="inline font-semibold text-ink">{t}: </dt>
                  <dd className="inline text-ink-muted">{d}.</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={180} className="h-full">
          <div className={cardCls}>
            <p className={kicker}>Quality checkpoints</p>
            <h3 className={title}>Human creative direction and quality control.</h3>
            <Bullets
              items={[
                'You approve concepts and scripts before anything is filmed.',
                'Every project goes through our internal creative quality review.',
                `${REVISIONS.roundsPerConcept} rounds of revisions per creative concept.`,
                'If we fail to deliver the agreed scope, we cover the corrective production or reshoot.',
              ]}
            />
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-4 md:mt-5">
        <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6">
          <h3 className="font-display text-lg font-semibold tracking-snug text-ink">How many creatives should you test?</h3>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            There is no universal number: it depends on your budget, audience, niche and conversion volume. We size a batch for learning,
            with {SPRINT.concepts} or {SPRINT_PLUS.concepts} concepts, include testing recommendations, and use what you learn to decide what to
            make next. We never guarantee specific results. Want ideas now? <TextLink href={OFFER_PATHS.hooks}>Get 10 free ad hooks</TextLink>.
          </p>
        </div>
      </Reveal>
    </Section>
  )
}
