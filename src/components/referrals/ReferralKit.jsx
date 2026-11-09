import { trackEvent } from '../../lib/analytics.js'
import { scrollToApply } from '../../lib/roadmapForm.js'
import { KIT_EMAIL_PARAGRAPHS, KIT_EMAIL_SUBJECT, KIT_ITEMS, KIT_SHORT_MESSAGE } from '../../lib/partnerKit.js'
import { Check, Reveal, SectionHeader } from '../roadmap/shared.jsx'
import { Arrow, ScrollCta } from './shared.jsx'

/* ─────────────────────────────────────────────
   WE MAKE REFERRING EASY — the partner kit, previewed.

   The kit is real (message text in src/lib/partnerKit.js and docs/partner-kit.md) and is sent
   BY EMAIL, BY HAND, after a partner is approved. The page therefore says exactly that:
   nothing to download before applying, nothing automatic, and no promise of a referral link,
   dashboard or portal (none exist).
───────────────────────────────────────────── */

export default function ReferralKit() {
  return (
    <section id="kit" aria-labelledby="kit-heading" className="relative scroll-mt-20 py-16 md:scroll-mt-24 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeader id="kit-heading" eyebrow="Refer in seconds" title="We Make Referring Easy.">
            Approved partners receive a simple referral kit by email, so making an introduction takes a minute, not an
            afternoon.
          </SectionHeader>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* What's in the kit */}
          <Reveal className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime">The kit includes</p>
            <ol className="mt-5 space-y-4">
              {KIT_ITEMS.map((item, i) => (
                <li key={item} className="flex items-start gap-3.5 text-[15px] leading-snug text-ink">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-lime/10 text-xs font-bold tabular-nums text-lime" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline-strong text-ink-muted">
                <Check className="h-3 w-3" />
              </span>
              <span>
                There’s nothing to download before you apply. After your application is approved, we send the kit by
                email.
              </span>
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
                Become a Referral Partner <Arrow />
              </ScrollCta>
            </div>
          </Reveal>

          {/* Preview */}
          <Reveal delay={100} className="lg:col-span-7">
            <div className="space-y-4" aria-label="Preview of the referral kit messages">
              <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-surface-1 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-2 px-4 py-2.5">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
                    <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Preview · email introduction</span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-sm text-ink-muted">
                    <span className="font-semibold text-ink">Subject:</span> {KIT_EMAIL_SUBJECT}
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
                    {KIT_EMAIL_PARAGRAPHS.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-hairline-strong bg-surface-1">
                <div className="border-b border-hairline bg-surface-2 px-4 py-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Preview · LinkedIn / WhatsApp</span>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="rounded-2xl rounded-tl-md border border-lime/25 bg-lime/[0.06] p-4 text-sm leading-relaxed text-ink-muted">
                    {KIT_SHORT_MESSAGE}
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
