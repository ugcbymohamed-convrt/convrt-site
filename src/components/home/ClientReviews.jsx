import { useRef, useEffect, useState } from 'react'
import { REVIEWS } from '../../content/reviews.js'

/* THE ENGLISH HOMEPAGE'S CLIENT REVIEWS (design review, Nov 2026). Same three reviews, same clients, same wording as before (src/content/reviews.js), presented as short, prominent quotes.

   • The line shown first is a verbatim excerpt (a contiguous part of the client's own text, enforced by a test); the COMPLETE original sits behind a native "Read full review" disclosure
     (<details>, keyboard and screen-reader friendly, and the full text is in the page HTML).
   • "Repeat Client" appears only where the review itself documents a repeat order. There are no star ratings (no rating source is on record) and no review counts, platforms, links or
     verification badges; the page never implies an external review site.
   • Lime guides the eye (the opening mark, the highlighted phrase, the hover edge); surfaces stay near-black. Motion is a one-time fade-up and a hover lift, both off for prefers-reduced-motion. */

function Reveal({ show, delay = 0, className = '', children }) {
  return (
    <div
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
      style={{ transitionDelay: show ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

const Quote = ({ className = '' }) => (
  <svg viewBox="0 0 48 36" className={className} fill="currentColor" aria-hidden="true">
    <path d="M0 36V21.6C0 9.2 6.4 2.3 18.2 0l2.5 5.4C14.2 7.2 11 11 10.6 16.2H20V36H0zm27.6 0V21.6C27.6 9.2 34 2.3 45.8 0l2.2 5.4c-6.5 1.8-9.7 5.6-10.1 10.8H48V36H27.6z" />
  </svg>
)

function Excerpt({ review }) {
  const i = review.excerpt.indexOf(review.highlight)
  if (i === -1) return review.excerpt
  return <>{review.excerpt.slice(0, i)}<span className="text-lime">{review.highlight}</span>{review.excerpt.slice(i + review.highlight.length)}</>
}

function ReviewCard({ review }) {
  return (
    <article className="rv-card relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-7 md:p-8" aria-label={`Review from ${review.brand}`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-lime/[0.06] blur-[70px]" />
      <div className="relative flex h-11 items-center justify-between gap-4">
        <Quote className="h-9 w-12 text-lime/90 md:h-10 md:w-[54px]" />
        <img
          src={review.logo}
          alt={`${review.brand} logo`}
          loading="lazy"
          decoding="async"
          draggable="false"
          className="object-contain object-right"
          style={review.logoRounded ? { height: '44px', width: '44px', borderRadius: '12px' } : { height: '38px', width: 'auto', maxWidth: '132px', filter: review.logoFilter, opacity: 0.95 }}
        />
      </div>

      <figure className="relative mt-5 flex flex-1 flex-col">
        <blockquote className="font-display text-[1.4rem] font-semibold leading-[1.28] tracking-display text-ink md:text-[1.55rem]">
          <p>“<Excerpt review={review} />”</p>
        </blockquote>

        <figcaption className="mt-8 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-ink">{review.brand}</span>
            <span className="block text-[12.5px] text-ink-muted">{review.category}</span>
          </span>
          {review.repeat && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-lime">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime" />
              Repeat Client
            </span>
          )}
        </figcaption>
      </figure>

      <details className="relative mt-5">
        <summary className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime">
          <span className="rv-plus inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[13px] leading-none transition-transform duration-300 motion-reduce:transition-none" aria-hidden="true">+</span>
          Read full review
        </summary>
        <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-muted">{review.full}</p>
      </details>
    </article>
  )
}

export default function ClientReviews() {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return undefined }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect() } }, { threshold: 0.08 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="testimonials" ref={ref} aria-labelledby="reviews-heading" className="relative overflow-hidden py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[760px] -translate-x-1/2 rounded-full bg-lime/[0.05] blur-[160px]" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 flex flex-col items-center gap-5 text-center md:mb-14">
          <Reveal show={show}>
            <div className="inline-flex items-center gap-2.5">
              <span className="h-px w-8 bg-lime" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">Client Reviews</span>
              <span className="h-px w-8 bg-lime" aria-hidden="true" />
            </div>
          </Reveal>
          <Reveal show={show} delay={100}>
            <h2 id="reviews-heading" className="max-w-4xl text-balance font-display text-[2rem] font-bold leading-[1.06] tracking-display text-ink md:text-5xl lg:text-[3.4rem]">
              Great work. <span className="text-lime">Strong relationships.</span> Repeat collaborations.
            </h2>
          </Reveal>
          <Reveal show={show} delay={200}>
            <p className="max-w-xl text-base leading-relaxed text-ink-muted">What clients who ordered again say, in their own words.</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.id} show={show} delay={280 + i * 90} className="h-full">
              <ReviewCard review={review} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
