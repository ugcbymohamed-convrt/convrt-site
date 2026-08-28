import { useInView } from '../caseStudies/shared/useInView.js'
import Eyebrow from '../caseStudies/shared/Eyebrow.jsx'
import { ACCENT } from './theme.js'

const BASE = '/case-studies/elyon/proof'

const WIDE_QUOTE = { src: `${BASE}/proof-weekly-cadence.webp`, w: 700, h: 144, caption: 'On scaling up production' }

const QUOTES = [
  { src: `${BASE}/proof-nine-sales.webp`, w: 700, h: 145, caption: 'On the standout result' },
  { src: `${BASE}/proof-roas-528.webp`, w: 700, h: 110, caption: 'Same creative, confirmed ROAS' },
  { src: `${BASE}/proof-voiceover-request.webp`, w: 700, h: 154, caption: 'Asking for more, after one video performed' },
]

export default function ElyonProof() {
  const [ref, visible] = useInView(0.05)

  return (
    <section className="relative py-14 md:py-20">
      <div ref={ref} className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl mx-auto mb-11 md:mb-12 text-center">
          <Eyebrow label="Client Proof" accent={ACCENT} className="mb-6" />
          <h2 className="font-display font-bold text-ink tracking-display leading-[1.05] text-3xl md:text-[44px]">
            The results showed up in the ad account.
            <br />
            Then in our WhatsApp.
          </h2>
          <p className="mt-6 text-[15px] md:text-base text-ink-muted leading-relaxed">
            Real messages from Elyon, cropped for privacy, unedited in substance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Featured screenshot — "Your videos are working," with the early-test breakdown */}
          <div
            className="lg:col-span-5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div className="mx-auto max-w-sm lg:max-w-none">
              <ProofCard
                src={`${BASE}/proof-early-test.webp`}
                w={700}
                h={553}
                caption="The early test, sent unprompted"
                featured
              />
            </div>
          </div>

          {/* Smaller extracted quote cards — varied weight, not a uniform screenshot dump */}
          <div className="lg:col-span-7 flex flex-col gap-4 md:gap-5">
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(18px)',
                transition: 'opacity 0.6s 90ms cubic-bezier(0.22,1,0.36,1), transform 0.6s 90ms cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <ProofCard src={WIDE_QUOTE.src} w={WIDE_QUOTE.w} h={WIDE_QUOTE.h} caption={WIDE_QUOTE.caption} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              {QUOTES.map((q, i) => (
                <div
                  key={q.src}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(18px)',
                    transition: `opacity 0.6s ${160 + i * 70}ms cubic-bezier(0.22,1,0.36,1), transform 0.6s ${160 + i * 70}ms cubic-bezier(0.22,1,0.36,1)`,
                  }}
                >
                  <ProofCard src={q.src} w={q.w} h={q.h} caption={q.caption} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProofCard({ src, w, h, caption, featured = false }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden ${featured ? '' : 'h-full flex flex-col'}`}
      style={{ borderColor: 'rgba(201,166,104,0.16)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: 'rgba(201,166,104,0.12)' }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: '#25D366' }} />
        <span className="text-[11px] font-semibold text-ink-muted">Elyon Dubai &middot; WhatsApp</span>
      </div>
      <img
        src={src}
        alt={caption}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        className="w-full h-auto"
        style={{ aspectRatio: `${w} / ${h}`, objectFit: 'cover' }}
      />
      <p className="px-4 py-2.5 text-[12px] text-ink-subtle">{caption}</p>
    </div>
  )
}
