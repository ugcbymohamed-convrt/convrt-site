import { Section, Head, Reveal } from './shared.jsx'

/* SECTION 2: what a UGC agency does, and the human-created differentiator.
   Owner-confirmed: CONVRT's UGC videos are 100% human-created, featuring real human creators. The statement is about the UGC
   service and its finished videos only; the page does not claim anything about the rest of the business. */

const icons = {
  person: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /></>,
  camera: <><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="M16 11l5-3v8l-5-3z" /></>,
  shield: <><path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6z" /><path d="M9 12l2.2 2.2L15.5 10" /></>,
}

const ROWS = [
  { icon: 'person', title: 'Real human creators', text: 'Every UGC video we produce is 100% human-created, featuring real human creators.' },
  { icon: 'camera', title: 'Human on-camera performances', text: 'Authentic, creator-led delivery, chosen for how well the creator fits your product and audience.' },
  { icon: 'shield', title: 'Human creative direction and quality control', text: 'Our team develops the concepts and scripts and reviews every project. We never present paid creators as genuine customers.' },
]

export default function UgcDefinition() {
  return (
    <Section id="what-is-ugc" label="ugc-what-heading" glow>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-7">
          <Head id="ugc-what-heading" align="left" eyebrow="What you're buying" title="A UGC agency, not a pile of videos." />
          <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-ink-muted md:text-lg">
            <p>
              UGC ads are paid ads in a creator-led style: a real person on camera, speaking naturally to your audience. As a
              UGC agency, we commission and manage that content end to end: research, concepts, scripts, creator selection,
              filming, editing and creative variations, so you aren&rsquo;t briefing freelancers one by one.
            </p>
            <p>We make the ads and you keep control of distribution and spend, because we don&rsquo;t buy media or manage ad accounts.</p>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-5">
          <div className="rounded-3xl border border-hairline-strong bg-surface-1 p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">Human-created, from brief to edit</p>
            <ul className="mt-5 space-y-5">
              {ROWS.map((r) => (
                <li key={r.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet/40 bg-violet/15 text-[#c4b5fd]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {icons[r.icon]}
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold leading-snug tracking-snug text-ink">{r.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{r.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
