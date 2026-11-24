import { useRef, useState } from 'react'
import { REVIEWS } from '../../content/reviews.js'
import { currentLocale } from '../../i18n/locale.js'
import { ES_REVIEWS, ES_REVIEWS_COPY } from '../../i18n/es/reviews.js'

/* THE ENGLISH HOMEPAGE'S CLIENT REVIEWS: an editorial feature, deliberately the opposite of the cinematic stage above it (typography only: no cards, no glow, no stage).

   ONE featured review at a time in large serif type, with an oversized opening mark at the left, a thin lime rule beside the quote and a vertical client list at the right (a slim lime bar marks
   the active client). Selecting a client swaps the quote with a short fade and a small vertical movement (about 300 ms; none for prefers-reduced-motion). Nothing rotates by itself.

   FAITHFUL: the line shown is a verbatim excerpt of the client's own words (src/content/reviews.js, enforced by a test) and the COMPLETE original stays behind "Read full review". There are no star ratings
   (no rating source is on record), no counts, platforms, links or verification badges. "Repeat client" appears because each review itself documents a repeat order.
   ALL THREE reviews are in the page HTML at all times (the inactive ones are invisible and inert, stacked in the same grid cell, so the section never changes height when you switch).
   The heading is visually hidden (the reference design carries only the eyebrow); it keeps the section's place in the page outline. */

const SERIF = 'font-editorial'

function Excerpt({ review }) {
  const i = review.excerpt.indexOf(review.highlight)
  if (i === -1) return review.excerpt
  return <>{review.excerpt.slice(0, i)}<span className="text-lime">{review.highlight}</span>{review.excerpt.slice(i + review.highlight.length)}</>
}

/* the quote size follows its length so every excerpt sets in a similar number of lines */
const quoteSize = (text) => (text.length > 85
  ? 'text-[1.7rem] min-[420px]:text-[1.95rem] md:text-[2.6rem] lg:text-[2.55rem] xl:text-[3.2rem] 2xl:text-[3.9rem]'
  : 'text-[1.95rem] min-[420px]:text-[2.2rem] md:text-[3rem] lg:text-[3rem] xl:text-[3.6rem] 2xl:text-[4.5rem]')

const ORDER = ['adscale', 'elyon', 'talk360']
/* The Spanish homepage shows the owner-approved Spanish renderings (src/i18n/es/reviews.js) in this same component: same layout, same order, same behaviour. Nothing English is shown beneath them. */
const localized = (r, es) => (es && ES_REVIEWS[r.id] ? { ...r, ...ES_REVIEWS[r.id] } : r)
const LIST_EN = ORDER.map((id) => REVIEWS.find((r) => r.id === id)).filter(Boolean)

/* the oversized opening mark: two filled drops, drawn as a vector so it looks the same on every device (no font dependency) */
const Mark = ({ className = '' }) => (
  <svg viewBox="0 0 128 92" className={className} fill="currentColor" aria-hidden="true" focusable="false">
    {[0, 67].map((dx) => (
      <g key={dx} transform={`translate(${dx} 0)`}>
        <circle cx="32" cy="62" r="29" />
        <path d="M4 60C4 28 22 8 56 0l5 11C45 17 36 27 34 42Z" />
      </g>
    ))}
  </svg>
)

export default function ClientReviews() {
  const es = currentLocale() === 'es'
  const LIST = es ? LIST_EN.map((r) => localized(r, true)) : LIST_EN
  const [activeId, setActiveId] = useState(LIST[0].id)
  const tabRefs = useRef({})

  const select = (id, focus = false) => {
    setActiveId(id)
    if (focus) tabRefs.current[id]?.focus()
  }
  const onKeyDown = (e, i) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (step === undefined && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? LIST.length - 1 : (i + step + LIST.length) % LIST.length
    select(LIST[next].id, true)
  }

  return (
    <section id="testimonials" aria-labelledby="reviews-heading" className="relative overflow-hidden py-16 md:py-24">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <h2 id="reviews-heading" className="sr-only">{es ? ES_REVIEWS_COPY.heading : 'Great work. Strong relationships. Repeat collaborations.'}</h2>
        <div className="inline-flex items-center gap-3">
          <span className="h-px w-12 bg-lime md:w-24" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-lime md:text-base">{es ? ES_REVIEWS_COPY.eyebrow : 'Client Reviews'}</span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-12 lg:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)_minmax(290px,0.36fr)] lg:gap-x-12">
          {/* oversized opening mark */}
          <Mark className="-mb-4 h-[4.2rem] w-auto text-ink md:h-[6.5rem] lg:mb-0 lg:h-auto lg:w-full lg:max-w-[13rem]" />

          {/* the featured review: all three stacked in one cell */}
          <div className="grid lg:border-l lg:border-lime lg:pl-10 xl:pl-12">
            {LIST.map((r) => {
              const on = r.id === activeId
              return (
                <figure
                  key={r.id}
                  role="tabpanel"
                  id={`review-panel-${r.id}`}
                  aria-labelledby={`review-tab-${r.id}`}
                  inert={on ? undefined : ''}
                  className={`[grid-area:1/1] flex flex-col transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${on ? 'translate-y-0 opacity-100' : 'invisible translate-y-3 opacity-0'}`}
                >
                  <blockquote className={`${SERIF} ${quoteSize(r.excerpt)} font-normal leading-[1.1] tracking-[-0.01em] text-ink [text-wrap:balance]`}>
                    <p>{es ? '«' : '“'}<Excerpt review={r} />{es ? '»' : '”'}</p>
                  </blockquote>
                  <figcaption className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-10">
                    <img
                      src={r.logo}
                      alt={es ? ES_REVIEWS_COPY.logoAlt(r.brand) : `${r.brand} logo`}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      className="object-contain object-left"
                      style={r.logoRounded ? { height: '44px', width: '44px', borderRadius: '12px' } : { height: '40px', width: 'auto', maxWidth: '180px', filter: r.logoFilter }}
                    />
                    <span aria-hidden="true" className="hidden h-10 w-px bg-white/25 sm:block" />
                    <span className="text-[12px] font-medium uppercase leading-relaxed tracking-[0.2em] text-ink-muted md:text-[13px]">
                      <span className="block sm:inline">{r.category}</span>
                      {r.repeat && <span className="sm:before:mx-2 sm:before:content-['·'] block text-lime sm:inline">{es ? ES_REVIEWS_COPY.repeat : 'Repeat client'}</span>}
                    </span>
                  </figcaption>
                  <details className="group mt-5">
                    <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime [&::-webkit-details-marker]:hidden">
                      <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[13px] leading-none transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">+</span>
                      {es ? ES_REVIEWS_COPY.readFull : 'Read full review'}
                    </summary>
                    <p className="mt-2 max-w-2xl text-[15px] leading-[1.7] text-ink-muted">{r.full}</p>
                  </details>
                </figure>
              )
            })}
          </div>

          {/* the client list */}
          <div role="tablist" aria-label={es ? ES_REVIEWS_COPY.chooseLabel : 'Choose a client review'} className="grid grid-cols-3 gap-2 lg:block lg:self-start lg:pt-3">
            {LIST.map((r, i) => {
              const on = r.id === activeId
              return (
                <button
                  key={r.id}
                  ref={(el) => { tabRefs.current[r.id] = el }}
                  type="button"
                  role="tab"
                  id={`review-tab-${r.id}`}
                  aria-selected={on}
                  aria-controls={`review-panel-${r.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(r.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`group relative block w-full py-3 pl-3 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime motion-reduce:transition-none lg:py-7 lg:pl-8 ${i > 0 ? 'lg:border-t lg:border-white/25' : ''}`}
                >
                  <span aria-hidden="true" className={`absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[3px] rounded-full bg-lime transition-opacity duration-300 motion-reduce:transition-none lg:top-1/2 lg:h-12 lg:-translate-y-1/2 ${on ? 'opacity-100' : 'opacity-0'}`} />
                  <span className={`block text-[12px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 motion-reduce:transition-none lg:text-[1.35rem] lg:tracking-[0.12em] ${on ? 'text-ink' : 'text-ink-muted group-hover:text-ink'}`}>{r.brand}</span>
                  <span className={`mt-1.5 hidden text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 sm:block lg:whitespace-nowrap lg:text-[11px] lg:tracking-[0.12em] motion-reduce:transition-none ${on ? 'text-ink-muted' : 'text-ink-subtle'}`}>{r.category}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div aria-hidden="true" className="mt-14 h-px w-full bg-lime md:mt-20" />
      </div>
    </section>
  )
}
