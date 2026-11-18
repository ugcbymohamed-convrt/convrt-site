import { CARD_NOTES } from '../../seo/businessKnowledge.js'

/* One concise, centered note under each card group. The full policies (turnaround, custom terms, VAT, organic renewal) live
   in the information panels and the FAQ, and in src/seo/businessKnowledge.js. */
function Note({ children }) {
  return <p className="mx-auto mt-5 max-w-3xl text-center text-[13.5px] leading-relaxed text-ink-muted">{children}</p>
}
export const PaidTerms = () => (
  <>
    <Note>{CARD_NOTES.paid}</Note>
    <p className="mx-auto mt-2 max-w-3xl text-center text-[13px] leading-relaxed text-ink-subtle">
      New to UGC?{' '}
      <a href="/ugc-video-agency" className="text-ink-muted underline underline-offset-2 transition-colors hover:text-lime">
        See how our UGC production works
      </a>
    </p>
  </>
)
export const OrganicTerms = () => <Note>{CARD_NOTES.organic}</Note>
