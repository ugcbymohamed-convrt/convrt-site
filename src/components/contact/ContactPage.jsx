import { useEffect, useRef } from 'react'
import { captureAttribution, trackEvent } from '../../lib/analytics.js'
import { useDocumentHead } from '../../lib/useDocumentHead.js'
import { pageHead } from '../../seo/siteSeo.js'
import { PATHS } from '../../routes.js'
import { CONTACT_EMAIL, COMPANY_LINKEDIN_URL, FOUNDER_LINKEDIN_URL, INSTAGRAM_URL, REFERRALS_PATH } from '../../config.js'
import { CREATOR_FORM } from '../../content/trustPages.js'
import { CONTACT_COPY } from '../../content/contactCopy.js'
import { currentLocale } from '../../i18n/locale.js'
import { hrefFor } from '../../i18n/tr.js'
import { forward } from '../../lib/rtl.js'
import { Reveal } from '../roadmap/shared.jsx'
import FAQ from '../FAQ.jsx'
import UgcFinalCTA, { UGC_CTA } from '../ugc/UgcFinalCTA.jsx'
import ContactForm from './ContactForm.jsx'

/* ─────────────────────────────────────────────
   CONTACT PAGE (/contact, /es/contact, /fr/contact, /ar/contact): ONE reusable component, the words come from src/content/contactCopy.js.

   Hero → general inquiry form → "Prefer email?" → compact cards for the other routes → the existing FAQ accordion → the existing Free Creative Growth Roadmap CTA.

   This page collects inquiries. It does NOT give a visitor access to the owner's calendar: there is no booking link, widget or scheduling prompt on it (the owner decides whether to
   reply, ask for more information, prepare a proposal or privately invite someone to a call). The operator details are in the Legal Notice, linked from the footer.
───────────────────────────────────────────── */

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const ICONS = {
  linkedin: <Icon><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5V16M8 8v.01M11.5 16v-3.2a2.3 2.3 0 014.6 0V16M11.5 10.5V16" /></Icon>,
  instagram: <Icon><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" /></Icon>,
  creators: <Icon><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.4-3 2.6-4.8 5.5-4.8s5.1 1.8 5.5 4.8M16.5 5.6a3 3 0 010 5.8M17.5 14.4c1.8.5 3 2 3.3 4.1" /></Icon>,
  referrals: <Icon><path d="M4.5 10.5h15v9h-15v-9ZM3.5 7h17v3.5h-17V7ZM12 7v12.5" /><path d="M12 7c-2 0-4-.8-4-2.3 0-1.1 1-1.7 2-1.3 1.2.5 2 2 2 3.6Zm0 0c2 0 4-.8 4-2.3 0-1.1-1-1.7-2-1.3-1.2.5-2 2-2 3.6Z" /></Icon>,
}

function ConnectCard({ id, href, external, label, hint, delay }) {
  return (
    <Reveal delay={delay}>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        onClick={() => trackEvent('contact_link_click', { link: id })}
        className="group flex h-full min-h-[84px] items-center gap-4 rounded-2xl border border-hairline-strong bg-surface-1/70 px-5 py-4 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-lime/50 hover:bg-surface-2/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime/25 bg-lime/10 text-lime transition-colors group-hover:bg-lime/15">{ICONS[id]}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-ink">{label}</span>
          {hint && <span className="mt-0.5 block truncate text-[13px] text-ink-subtle"><bdi dir="ltr">{hint}</bdi></span>}
        </span>
        <span className="shrink-0 text-ink-subtle transition-[color,transform] duration-300 group-hover:text-lime group-hover:translate-x-0.5" aria-hidden="true">{forward()}</span>
      </a>
    </Reveal>
  )
}

export default function ContactPage() {
  const locale = currentLocale()
  const copy = CONTACT_COPY[locale] ?? CONTACT_COPY.en
  const rtl = locale === 'ar'
  useDocumentHead(pageHead(PATHS.contact))
  const successRef = useRef(null)

  const viewed = useRef(false)
  useEffect(() => {
    captureAttribution()
    if (viewed.current) return // StrictMode double-invokes effects in dev
    viewed.current = true
    trackEvent('contact_page_view')
  }, [])

  const cards = [
    { id: 'linkedin', href: COMPANY_LINKEDIN_URL, external: true, label: copy.cards.linkedin, hint: 'CONVRT Studio' },
    { id: 'instagram', href: INSTAGRAM_URL, external: true, label: copy.cards.instagram, hint: '@convrtcreativestudio' },
    { id: 'creators', href: CREATOR_FORM, external: true, label: copy.cards.creators },
    { id: 'referrals', href: hrefFor(REFERRALS_PATH), external: false, label: copy.cards.referrals },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="contact-h1" className="relative overflow-x-clip">
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[1100px] -translate-x-1/2 rounded-full bg-lime/[0.09] blur-[170px]" />
        <div aria-hidden="true" className="pointer-events-none absolute top-40 -left-40 h-[360px] w-[460px] rounded-full bg-lime/[0.045] blur-[140px]" />
        <div aria-hidden="true" className="pointer-events-none absolute top-24 -right-40 h-[320px] w-[420px] rounded-full bg-violet/[0.06] blur-[140px]" />
        <div className="relative mx-auto max-w-4xl px-5 pb-10 pt-14 text-center md:px-8 md:pb-14 md:pt-20">
          <Reveal early>
            <div className="inline-flex items-center gap-2.5">
              <span className="h-px w-8 bg-lime" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{copy.badge}</span>
              <span className="h-px w-8 bg-lime" aria-hidden="true" />
            </div>
            <h1
              id="contact-h1"
              className={`mt-7 font-display font-bold text-ink ${rtl ? 'leading-[1.3]' : 'leading-[1.04] tracking-display-xl'}`}
              style={{ fontSize: rtl ? 'clamp(2.3rem, 6.4vw, 4.6rem)' : 'clamp(2.7rem, 7.2vw, 5.4rem)' }}
            >
              <span className="block">{copy.h1.lead}</span>
              <span className="block"><span className="whitespace-nowrap"><span className="text-lime">{copy.h1.accent}</span>{copy.h1.tail}</span></span>
            </h1>
            <p className={`mx-auto mt-7 max-w-2xl text-balance text-base text-ink-muted md:text-lg ${rtl ? 'leading-[1.9]' : 'leading-relaxed'}`}>{copy.intro}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Form ── */}
      <section aria-label={copy.formLabel} className="relative pb-10 md:pb-14">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal early>
            <ContactForm copy={copy} locale={locale} successRef={successRef} />
          </Reveal>
        </div>
      </section>

      {/* ── Prefer email? ── */}
      <section aria-labelledby="contact-email-heading" className="pb-10 md:pb-14">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <div className="flex flex-col items-start gap-4 rounded-3xl border border-hairline-strong bg-surface-1/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime/25 bg-lime/10 text-lime">
                  <Icon><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></Icon>
                </span>
                <h2 id="contact-email-heading" className="font-display text-xl font-bold tracking-snug text-ink md:text-2xl">{copy.emailHeading}</h2>
              </div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                dir="ltr"
                onClick={() => trackEvent('contact_email_click')}
                className="break-all text-lg font-semibold text-lime underline decoration-lime/40 underline-offset-[6px] transition-colors hover:text-lime-light hover:decoration-lime md:text-xl"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Other ways to connect ── */}
      <section aria-labelledby="contact-connect-heading" className="pb-6 md:pb-10">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <h2 id="contact-connect-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">{copy.connectHeading}</h2>
          </Reveal>
          <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {cards.map((c, i) => <ConnectCard key={c.id} {...c} delay={i * 70} />)}
          </div>
          <Reveal delay={300}>
            <p className="mt-5 text-sm text-ink-muted">
              <a href={FOUNDER_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('contact_link_click', { link: 'founder_linkedin' })} className="underline decoration-lime/50 underline-offset-4 transition-colors hover:text-ink hover:decoration-lime">
                {rtl ? <bdi dir="ltr">{copy.founderLinkedin}</bdi> : copy.founderLinkedin}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ (the site's FAQ accordion) ── */}
      <FAQ heading={copy.faq} showSubline={false} showNudge={false} />

      {/* ── Free Creative Growth Roadmap CTA (the site's branded closing section) ── */}
      <UgcFinalCTA config={{ ...UGC_CTA, emailSubject: 'Contact', track: { cta: 'contact_roadmap_cta_click', pricing: 'contact_pricing_link_click', email: 'contact_founder_email_click' } }} />
    </>
  )
}
