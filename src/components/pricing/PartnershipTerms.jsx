import { CARD_NOTES, COMMITMENT, ORGANIC_COMMITMENT, PARTNERSHIP_TERMS } from '../../seo/businessKnowledge.js'
import { currentLocale } from '../../i18n/locale.js'
import { tr, hrefFor } from '../../i18n/tr.js'

/* One concise, centered note under each card group. The full policies (turnaround, custom terms, VAT, organic renewal) live
   in the information panels and the FAQ, and in src/seo/businessKnowledge.js. */
function Note({ children }) {
  return <p className="mx-auto mt-5 max-w-3xl text-center text-[13.5px] leading-relaxed text-ink-muted">{children}</p>
}

/* Other languages (Spanish, Review 2): the same facts split into a short commitment line, a quieter second line, and a separate "learn more" row of links.
   The commitment line follows the selected package group AND billing option, so a one-off project is never shown with a monthly minimum, and the Organic
   six-month commitment is never described with the Paid month-to-month terms (what follows Organic's initial period is not confirmed: "set out in the applicable agreement").
   Every figure comes from the business data. */
const PAID_MONTHLY = `Initial ${COMMITMENT.initialMonths}-month commitment. Then month-to-month with ${COMMITMENT.cancellationNoticeDays} days’ notice.`
const PAID_ONE_OFF = PARTNERSHIP_TERMS.oneOff
const ORGANIC_INITIAL = `Initial ${ORGANIC_COMMITMENT.initialMonths}-month commitment. Terms after that are set out in the applicable agreement.`

function LocalizedNote({ primary, secondary }) {
  return (
    <div className="mx-auto mt-6 max-w-2xl text-center">
      <p className="text-[14px] font-medium leading-relaxed text-ink-muted">{tr(primary)}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-subtle">{tr(secondary)}</p>
    </div>
  )
}

function LearnMore({ links }) {
  return (
    <nav aria-label={tr('Want to know more?')} className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px]">
      <span className="text-ink-subtle">{tr('Want to know more?')}</span>
      {links.map((l) => (
        <a key={l.href} href={hrefFor(l.href)} className="group inline-flex items-center gap-1 font-medium text-ink-muted transition-colors hover:text-lime">
          {tr(l.label)}
          <svg viewBox="0 0 12 12" className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" aria-hidden="true">
            <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
    </nav>
  )
}

export const PaidTerms = ({ billing = 'monthly' }) => {
  if (currentLocale() !== 'en' && currentLocale() !== 'ar') { // Arabic keeps the English structure (translated), like English
    const oneOff = billing === 'oneOff'
    return (
      <>
        <LocalizedNote
          primary={oneOff ? PAID_ONE_OFF : PAID_MONTHLY}
          secondary={oneOff ? 'Prices exclude VAT. A monthly plan is also available.' : 'Prices exclude VAT. One-off projects are also available.'}
        />
        <LearnMore links={[{ href: '/ugc-video-agency', label: 'How our UGC works' }, { href: '/spokesperson-video-production', label: 'Videos with a spokesperson' }]} />
      </>
    )
  }
  return (
    <>
      <Note>{tr(CARD_NOTES.paid)}</Note>
      {currentLocale() === 'ar' ? (
        /* Arabic (owner, 2026-11-26): each phrase is itself the link: «تحتاج صانع محتوى UGC؟» · «تحتاج مقدم؟ شاهد كيف ننتج فيديوهات Spokesperson» */
        <p className="mx-auto mt-2 max-w-3xl text-center text-[13px] leading-relaxed text-ink-subtle">
          <a href={hrefFor('/ugc-video-agency')} className="text-ink-muted underline underline-offset-2 transition-colors hover:text-lime">{tr('New to UGC?')}</a>
          {' · '}
          <a href={hrefFor('/spokesperson-video-production')} className="text-ink-muted underline underline-offset-2 transition-colors hover:text-lime">{tr('Need a presenter?')} {tr('See spokesperson video production')}</a>
        </p>
      ) : (
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
      )}
    </>
  )
}

export const OrganicTerms = () => {
  if (currentLocale() !== 'en' && currentLocale() !== 'ar') {
    return (
      <>
        <LocalizedNote primary={ORGANIC_INITIAL} secondary="Prices exclude VAT." />
        <LearnMore links={[{ href: '/social-media-video-production', label: 'How organic content works' }]} />
      </>
    )
  }
  return (
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
}
