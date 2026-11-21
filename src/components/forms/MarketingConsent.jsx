import { marketingConsentText, CURRENT_MARKETING_CONSENT_VERSION } from '../../content/marketingConsent.js'

/* ─────────────────────────────────────────────
   Optional marketing-email checkbox, shared by every form that collects an email address
   (free hooks, free video application, referral registration).

   • UNCHECKED by default and never required: it is deliberately NOT part of a form's
     `values` / validation, so leaving it empty can never block or alter a submission.
   • Its wording comes from src/content/marketingConsent.js and is versioned: the server
     records which version was shown. Change the wording only by adding a new version there.
   • Visually and semantically separate from any required "I agree to the processing" box.
───────────────────────────────────────────── */

export default function MarketingConsent({ checked, onChange, disabled, className = 'mt-4' }) {
  return (
    <label
      className={`${className} flex cursor-pointer items-start gap-3 text-sm leading-snug text-ink-muted has-[:focus-visible]:[&>span:first-of-type]:ring-2 has-[:focus-visible]:[&>span:first-of-type]:ring-lime/70`}
      data-consent-version={CURRENT_MARKETING_CONSENT_VERSION}
    >
      <input
        type="checkbox"
        name="marketingConsent"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-subtle text-transparent transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:text-canvas motion-reduce:transition-none"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{marketingConsentText()}</span>
    </label>
  )
}
