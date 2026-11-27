// Swap this for your real booking link (e.g. https://cal.com/convrt/discovery).
// The Nav, Hero, and Final CTA buttons all read from this constant.
// The Calendly event is the "20-minute strategy call" (its public page title); the "30min" in the URL is a legacy slug, not the duration. Site copy says 20-minute.
export const BOOKING_URL = 'https://calendly.com/mohamed-convrt/30min'

export const CONTACT_EMAIL = 'mohamed@convrt.studio'

// Public profiles. The COMPANY page and the founder's PERSONAL profile are different accounts and are never interchangeable: the footer, the Contact
// page, the About page and the Organization structured data use the company page; only the About page, the Contact page and the founder's Person
// structured data use the founder's profile.
export const COMPANY_LINKEDIN_URL = 'https://www.linkedin.com/company/123164137/'
export const FOUNDER_LINKEDIN_URL = 'https://www.linkedin.com/in/mohameddoukkaliazizi/'
export const INSTAGRAM_URL = 'https://www.instagram.com/convrtcreativestudio/'

// Homepage offer destinations. Each path is registered to its page in App.jsx.
/* The Creator Showcase video library (examples from independent creators; the visible name is "Creator Showcase"), a standalone page at /creator-showcase. It was /our-work
   until Nov 2026: vercel.json redirects the old URL permanently (308) so existing links keep working, and nothing in the app links to /our-work any more.
   "Explore UGC Videos" (UGC page), "Explore Videos" (homepage, UGC and Spokesperson heroes), the navigation and the footer all read this one constant.
   The videos themselves come from src/content/portfolio.js. */
export const CREATOR_SHOWCASE_PATH = '/creator-showcase'

/* The project application: the purchase-intent funnel for visitors who picked a production package on /pricing (docs/project-application.md). A conversion utility, never indexed. */
export const PROJECT_APPLICATION_PATH = '/project-application'

export const OFFER_PATHS = {
  roadmap: '/creative-growth-roadmap',
  hooks: '/free-hooks',
  riskFree: '/risk-free-trial',
}

// ── Creative Growth Roadmap application (/creative-growth-roadmap) ──────────
export const SITE_URL = 'https://www.convrt.studio'

// Default social-sharing image (Open Graph / X / LinkedIn / WhatsApp / Facebook): 1200x630 PNG in public/og/. Every page that has its own head uses it
// unless it supplies a better one (blog articles with a cover). Replace the FILE (same name) to change it everywhere.
export const OG_IMAGE = {
  url: `${SITE_URL}/og/convrt-og.png`,
  width: 1200,
  height: 630,
  alt: 'CONVRT: performance creatives engineered to convert. UGC ads, SaaS and app videos, spokesperson videos and organic social.',
}

// Calendly event shown to qualified visitors. Currently the site-wide event; point
// this at a dedicated roadmap event later without touching any other page.
export const ROADMAP_BOOKING_URL = BOOKING_URL

// Launch gate for the roadmap page. Keep `false` (page is served with
// <meta name="robots" content="noindex">) until testing is finished, including a
// real test booking. Then flip to `true`.
export const ROADMAP_INDEXABLE = false

// ── Trust and legal pages (About, Contact, Privacy Policy, Terms) ───────────
// DRAFTS. The pages exist at these URLs but are `noindex`, out of the sitemap, show a "draft" banner and are NOT linked from the footer or the forms
// until the owner has reviewed the text (and had Privacy/Terms checked by a legal adviser). Flip TRUST_PAGES_PUBLISHED to `true` to publish: the banner
// goes, About + Contact become indexable (Privacy/Terms stay `noindex, follow`), the footer links appear, and every form's data-use notice links to the
// privacy policy through PRIVACY_POLICY_URL below. tests/trust-pages.test.mjs refuses `true` while any "[OWNER TO CONFIRM" marker is left in the text.
export const ABOUT_PATH = '/about'
export const CONTACT_PATH = '/contact'
export const PRIVACY_PATH = '/privacy'
export const TERMS_PATH = '/terms'
export const LEGAL_NOTICE_PATH = '/legal-notice'
export const TRUST_PAGES_PUBLISHED = true

// The operator's tax ID (NIF) and postal address are legally required in a Spanish commercial website's legal information (LSSI art. 10) but are
// private until the owner approves showing them. While this is false the pages show a visible review marker where they belong; once true they are
// printed from src/content/operator.js. tests/trust-pages.test.mjs refuses TRUST_PAGES_PUBLISHED = true while this is false.
export const LEGAL_NOTICE_DETAILS_APPROVED = true

// The Spanish, French and Arabic Privacy Policy, Terms and Conditions and Legal Notice (src/content/legal/es|fr|ar.js, translated from the English documents) are PUBLISHED: the owner approved them on
// 27 Nov 2026 (they are not lawyer-certified translations). Setting this back to `false` holds them again: noindex, a visible "translation under review" notice, out of the sitemap and hreflang,
// and the footer/forms link the English documents (labelled "in English"). tests/legal-translations.test.mjs simulates both states.
export const LEGAL_TRANSLATIONS_APPROVED = true

// URL of CONVRT's privacy policy. Empty while the policy is a draft, so the application forms show their data-use notice without a link; it becomes
// '/privacy' when TRUST_PAGES_PUBLISHED is flipped.
export const PRIVACY_POLICY_URL = TRUST_PAGES_PUBLISHED ? PRIVACY_PATH : ''

// ── CONVRT Insights blog (/blog) ────────────────────────────────────────────
export const BLOG_PATH = '/blog'

// Launch gate for the blog INDEX, same idea as the flags below. While the blog only
// shows coming-soon topics the index is served `noindex, follow`. Flip to `true` after
// the first real article is published and reviewed, AND delete the `/blog` X-Robots-Tag
// rule in vercel.json (tests/blog.test.mjs fails if the two disagree).
// Published article pages are indexable regardless of this flag.
export const BLOG_INDEXABLE = false

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

// ── Referral Partner Program (/referrals) ───────────────────────────────────
export const REFERRALS_PATH = '/referrals'

// Launch gate, same idea as the flags above: the page is served with
// <meta name="robots" content="noindex"> until MailerLite is configured
// (docs/referral-program-setup.md), the program terms have had their legal review and a
// real test application has been received. Then flip to `true`.
export const REFERRALS_INDEXABLE = false
