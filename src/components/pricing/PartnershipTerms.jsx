import { CARD_NOTES } from '../../seo/businessKnowledge.js'
import { tr, hrefFor } from '../../i18n/tr.js'

/* One concise, centered note under each card group. The full policies (turnaround, custom terms, VAT, organic renewal) live
   in the information panels and the FAQ, and in src/seo/businessKnowledge.js. */
function Note({ children }) {
  return <p className="mx-auto mt-5 max-w-3xl text-center text-[13.5px] leading-relaxed text-ink-muted">{children}</p>
}
export const PaidTerms = () => (
  <>
    <Note>{tr(CARD_NOTES.paid)}</Note>
    <p className="mx-auto mt-2 max-w-3xl text-center text-[13px] leading-relaxed text-ink-subtle">
      {tr('New to UGC?')}{' '}
      <a href={hrefFor('/ugc-video-agency')} className="text-ink-muted underline underline-offset-2 transition-colors hover:text-lime">
        {tr('See how our UGC production works')}
      </a>
      {' · '}
      {tr('Need a presenter?')}{' '}
      <a href={hrefFor('/spokesperson-video-production')} className="text-ink-muted underline underline-offset-2 transition-colors hover:text-lime">
        {tr('See spokesperson video production')}
      </a>
    </p>
  </>
)
export const OrganicTerms = () => (
  <>
    <Note>{tr(CARD_NOTES.organic)}</Note>
    <p className="mx-auto mt-2 max-w-3xl text-center text-[13px] leading-relaxed text-ink-subtle">
      {tr('Curious how it works?')}{' '}
      <a href={hrefFor('/social-media-video-production')} className="text-ink-muted underline underline-offset-2 transition-colors hover:text-lime">
        {tr('See organic social video production')}
      </a>
    </p>
  </>
)
