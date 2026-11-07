// Swap this for your real booking link (e.g. https://cal.com/convrt/discovery).
// The Nav, Hero, and Final CTA buttons all read from this constant.
export const BOOKING_URL = 'https://calendly.com/mohamed-convrt/30min'

export const CONTACT_EMAIL = 'mohamed@convrt.studio'

// Homepage offer destinations. Each path is registered to its page in App.jsx.
export const OFFER_PATHS = {
  roadmap: '/creative-growth-roadmap',
  hooks: '/free-hooks',
  riskFree: '/risk-free-trial',
}

// ── Creative Growth Roadmap application (/creative-growth-roadmap) ──────────
export const SITE_URL = 'https://www.convrt.studio'

// Calendly event shown to qualified visitors. Currently the site-wide event; point
// this at a dedicated roadmap event later without touching any other page.
export const ROADMAP_BOOKING_URL = BOOKING_URL

// Launch gate for the roadmap page. Keep `false` (page is served with
// <meta name="robots" content="noindex">) until testing is finished, including a
// real test booking. Then flip to `true`.
export const ROADMAP_INDEXABLE = false

// URL of CONVRT's privacy policy. No policy page exists on the site yet, so
// this is empty and the application form shows its data-use notice without a
// link. Set it (e.g. '/privacy') once the policy is published.
export const PRIVACY_POLICY_URL = ''

// ── Free Hooks lead magnet (/free-hooks) ────────────────────────────────────
// Launch gate, same idea as ROADMAP_INDEXABLE: the page is served with
// <meta name="robots" content="noindex"> until MailerLite is connected and a
// real end-to-end signup has been tested. Then flip to `true`.
export const FREE_HOOKS_INDEXABLE = false

// ── Risk-Free Trial application (/risk-free-trial) ──────────────────────────
// Launch gate, same idea as the flags above: the page is served with
// <meta name="robots" content="noindex"> until MailerLite is configured
// (docs/risk-free-application-setup.md) and a real test application has been
// received. Then flip to `true`.
export const RISK_FREE_INDEXABLE = false
