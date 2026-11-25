import { editorial } from '../i18n/editorial.js'
import { currentLocale } from '../i18n/locale.js'

/* A client's review. English (and any language without a translation) shows the client's own words. A language with translations (French) shows the polished translation alone: no
   « translation » label and no English original under it (owner decision, 2026-11-24); the English original stays in the source data. `typographic` wraps the text in curly quotes (UGC page). */
export default function ClientQuote({ text, className = '', innerClass = className, typographic = false, wrapper: Wrapper = 'blockquote' }) {
  const locale = currentLocale()
  const ed = editorial(locale)
  const translated = ed?.quoteTranslations?.[text]
  const q = (t) => (typographic ? <>&ldquo;{t}&rdquo;</> : t)
  if (!translated) return <Wrapper lang={locale === 'en' ? undefined : 'en'} className={className}>{q(text)}</Wrapper>
  return <Wrapper className={innerClass}>{q(translated)}</Wrapper>
}
