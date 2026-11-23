import { editorial } from '../i18n/editorial.js'
import { currentLocale } from '../i18n/locale.js'

/* A client's review. English (and any language without a translation) shows the client's own words, as before. A language with translations (French) shows a LABELLED translation first
   and keeps the verbatim original underneath, marked lang="en": the translation is never presented as the client's own French review. `typographic` wraps the text in curly quotes (UGC page). */
export default function ClientQuote({ text, className = '', outerClass = 'flex flex-1 flex-col gap-3', innerClass = className, typographic = false, wrapper: Wrapper = 'blockquote' }) {
  const locale = currentLocale()
  const ed = editorial(locale)
  const translated = ed?.quoteTranslations?.[text]
  const q = (t) => (typographic ? <>&ldquo;{t}&rdquo;</> : t)
  if (!translated) return <Wrapper lang={locale === 'en' ? undefined : 'en'} className={className}>{q(text)}</Wrapper>
  return (
    <div className={outerClass}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-lime">{ed.quoteLabels.translation}</p>
      <Wrapper className={innerClass}>{q(translated)}</Wrapper>
      <p className="border-t border-hairline pt-3 text-[12.5px] leading-relaxed text-ink-muted">
        <span className="font-semibold text-ink-subtle">{ed.quoteLabels.original} : </span>
        <q lang="en">{text}</q>
      </p>
    </div>
  )
}
