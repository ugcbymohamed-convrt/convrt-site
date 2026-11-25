import { trackEvent } from '../../lib/analytics.js'
import { scrollToApply } from '../../lib/roadmapForm.js'
import { KIT_EMAIL_PARAGRAPHS, KIT_EMAIL_PREVIEW_PARAGRAPHS, KIT_EMAIL_SUBJECT, KIT_ITEMS, KIT_SHORT_MESSAGE } from '../../lib/partnerKit.js'
import { Check, Reveal, SectionHeader } from '../roadmap/shared.jsx'
import { Arrow, ScrollCta } from './shared.jsx'
import { useTr, translate } from '../../i18n/tr.js'
import { currentLocale } from '../../i18n/locale.js'

/* ─────────────────────────────────────────────
   WE MAKE REFERRING EASY — the partner kit, previewed.

   The kit is real (message text in src/lib/partnerKit.js and docs/partner-kit.md) and is sent
   BY EMAIL, BY HAND, after a partner is approved. The page therefore says only that, and
   previews just the opening of the email. No promise of a referral link, dashboard or portal.
───────────────────────────────────────────── */

/* The kit messages are sent in English (docs/partner-kit.md), so on a translated page the preview shows them as they are and says so with lang="en" (the labels around them are translated). */
/* Arabic (owner-reviewed translation of the kit messages) shows them translated. */
const En = ({ children }) => (currentLocale() === 'en' ? children : currentLocale() === 'ar' ? translate('ar', children) : <span lang="en" dir="ltr">{children}</span>)

export default function ReferralKit() {
  const tr = useTr()
  const MSG = currentLocale() === 'en' || currentLocale() === 'ar' ? {} : { lang: 'en', dir: 'ltr' }
  return (
    <section id="kit" aria-labelledby="kit-heading" className="relative scroll-mt-20 py-16 md:scroll-mt-24 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="kit-heading" eyebrow={tr('Refer in seconds')} title={tr('We Make Referring Easy.')}>
            {tr('Approved partners get a ready-to-send referral kit.')}
          </SectionHeader>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* What's in the kit */}
          <Reveal className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">{tr('The kit includes')}</p>
            <ol className="mt-5 space-y-4">
              {KIT_ITEMS.map((item, i) => (
                <li key={item} className="flex items-start gap-3.5 text-[15px] leading-snug text-ink">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-xs font-bold tabular-nums text-lime" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{tr(item)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline-strong text-ink-muted">
                <Check className="h-3 w-3" />
              </span>
              <span>{tr('Sent by email after approval. Nothing to download first.')}</span>
            </p>
            <div className="mt-8">
              <ScrollCta
                href="#apply"
                variant="primary"
                className="w-full sm:w-auto"
                onGo={() => {
                  trackEvent('referral_cta_click', { location: 'kit' })
                  scrollToApply()
                }}
              >
                {tr('Become a Referral Partner')} <Arrow />
              </ScrollCta>
            </div>
          </Reveal>

          {/* Preview */}
          <Reveal delay={100} className="lg:col-span-7">
            <div className="space-y-4" aria-label={tr('Preview of the referral kit messages')}>
              <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-surface-1 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-2 px-4 py-2.5">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{tr('Preview · email introduction')}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-sm text-ink-muted">
                    <span className="font-semibold text-ink">{tr('Subject:')}</span> <En>{KIT_EMAIL_SUBJECT}</En>
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
                    {KIT_EMAIL_PARAGRAPHS.slice(0, KIT_EMAIL_PREVIEW_PARAGRAPHS).map((p) => (
                      <p key={p} {...MSG}>{currentLocale() === 'ar' ? tr(p) : p}</p>
                    ))}
                    <p aria-hidden="true">…</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-surface-1">
                <div className="border-b border-hairline bg-surface-2 px-4 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{tr('Preview · LinkedIn / WhatsApp')}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="rounded-2xl rounded-tl-md border border-lime/25 bg-lime/[0.06] p-4 text-sm leading-relaxed text-ink-muted">
                    <En>{KIT_SHORT_MESSAGE}</En>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
