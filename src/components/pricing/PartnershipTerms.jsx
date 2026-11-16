import { CARD_NOTES } from '../../seo/businessKnowledge.js'

/* One concise, centered note under each card group. The full policies (turnaround, custom terms, VAT, organic renewal) live
   in the information panels and the FAQ, and in src/seo/businessKnowledge.js. */
function Note({ children }) {
  return <p className="mx-auto mt-5 max-w-3xl text-center text-[13.5px] leading-relaxed text-ink-muted">{children}</p>
}
export const PaidTerms = () => <Note>{CARD_NOTES.paid}</Note>
export const OrganicTerms = () => <Note>{CARD_NOTES.organic}</Note>
