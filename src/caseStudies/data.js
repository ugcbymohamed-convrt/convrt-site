/* THE FIGURES AND LABELS OF THE TWO CASE STUDIES, in ONE place (English source text; Spanish is looked up in src/i18n/es/dict-casestudies.js).

   The components in src/components/graspo/ and src/components/elyon/ render these arrays and translate each text at render time (tr), and `localizeStat` /
   `pct` / the money helpers change only the NOTATION of a number for the reader, never its value. Tests (tests/es-case-studies.test.mjs) read the same
   arrays, so a figure here cannot silently disagree with the Spanish page.

   Sources (do not change a figure without the source):
   • Graspo: Meta Business Suite (views, reach, platform split, top content, countries, demographics), 1 Jan – 19 Jun 2026; Graspo's inbound tracker (leads).
   • Elyon Dubai: client-shared Meta Ads Manager results and WhatsApp messages (client-reported; the two snapshots are different moments and are never added together),
     internal production tracker (creatives, locations). Revenue and spend are in USD and are never converted. */

/* ── Graspo ─────────────────────────────────────────────────────────────────────────── */
export const GRASPO_PERIOD = { from: 'Jan 1', to: 'Jun 19 2026' }

export const GRASPO_METRICS = [
  { value: '10.7M', label: 'Total Views', sub: 'Facebook + Instagram' },
  { value: '3.4M', label: 'Accounts Reached', sub: 'Organic distribution' },
  { value: '65K', label: 'Content Interactions', sub: 'Likes, comments, shares, saves' },
  { value: '75', label: 'Unique Inbound Leads', sub: 'Meta, email & WhatsApp' },
  { value: '26', label: 'High-Priority Opportunities', sub: 'Qualified for follow-up' },
]

export const GRASPO_IG_VIEWS = 6_275_727
export const GRASPO_FB_VIEWS = 4_385_948
export const GRASPO_IG_SHORT = '6.27M'
export const GRASPO_FB_SHORT = '4.39M'

export const GRASPO_TOP_CONTENT = [
  { views: 7_500_000, short: '7.5M', note: 'A common printing mistake, called out' },
  { views: 1_900_000, short: '1.9M', note: 'Meet the machine, in one take' },
  { views: 1_200_000, short: '1.2M', note: 'The part that matters most' },
  { views: 84_200, short: '84.2K', note: 'Setting the standard, on the floor' },
  { views: 31_300, short: '31.3K', note: 'The mistake that can\'t be undone' },
]

export const GRASPO_VIDEOS = [
  { id: '15dd5505109f6821ccdcb13fc3cdc1fd', views: '295K' },
  { id: '3616606e3ca6d1a85c8a57d7cc2f656f', views: '1.2M' },
  { id: 'c1379ace38f2fa19ef2a45de1bb5d4b1', views: '7.5M' },
]

export const GRASPO_IG_COUNTRIES = [
  { name: 'Saudi Arabia', pct: 17 },
  { name: 'Iraq', pct: 14.2 },
  { name: 'Morocco', pct: 8.3 },
  { name: 'Algeria', pct: 7.7 },
  { name: 'Egypt', pct: 7.6 },
  { name: 'United Arab Emirates', pct: 5.8 },
]

export const GRASPO_FB_COUNTRIES = [
  { name: 'Egypt', pct: 22.8 },
  { name: 'Algeria', pct: 10.1 },
  { name: 'Iraq', pct: 8.4 },
  { name: 'Syria', pct: 7.1 },
  { name: 'Morocco', pct: 6.8 },
  { name: 'Yemen', pct: 4.3 },
]

export const GRASPO_DEMOGRAPHICS = {
  instagram: { genderSplit: '83% men · 17% women', peakAge: '25–34' },
  facebook: { genderSplit: '96% men · 4% women', peakAge: '35–44' },
}

export const GRASPO_FUNNEL = [
  { value: '10.7M', label: 'Total views', desc: 'Facebook + Instagram, Jan–Jun 2026', pct: 100 },
  { value: '3.4M', label: 'Accounts reached', desc: 'Unique people who saw the content', pct: 74 },
  { value: '75', label: 'Unique inbound leads', desc: 'Real inquiries across Meta, email & WhatsApp', pct: 46 },
  { value: '26', label: 'High-priority opportunities', desc: 'Qualified for active follow-up', pct: 30 },
  { value: '10', label: 'Advanced / quotation-stage', desc: 'Offer sent or being prepared, samples shipped, or moved to WhatsApp/sales', pct: 18 },
]

export const GRASPO_LEAD_CATEGORIES = [
  { label: 'Book & catalog printing', count: 37, color: '#a3e600' },
  { label: 'B2B cooperation / agency / samples', count: 14, color: '#c2f227' },
  { label: 'Shipping / MOQ questions', count: 10, color: '#d5ff40' },
  { label: 'General printing / pricing', count: 9, color: '#e2ff70' },
  { label: 'Premium / other print', count: 5, color: '#eeffa3' },
]

export const GRASPO_LEADS_BY_MONTH = [
  { label: 'Feb', count: 10 },
  { label: 'Mar', count: 20 },
  { label: 'Apr', count: 6 },
  { label: 'May', count: 30, peak: true },
  { label: 'Jun', count: 9 },
]

/* ── Elyon Dubai ────────────────────────────────────────────────────────────────────── */
export const ELYON_METRICS = [
  { value: '160+', label: 'Creatives Produced', sub: 'Full library, and counting' },
  { value: '4', label: 'Production Locations', sub: 'Prague, Almería, Granada, Marbella' },
  { value: '5.28x', label: 'Peak ROAS', sub: 'Single standout creative' },
  { value: '3.63x', label: 'Average ROAS', sub: 'Early four-creative test' },
]

export const ELYON_LOCATIONS = ['Prague', 'Almería', 'Granada', 'Marbella']

/* Snapshot 1 (early test) and snapshot 2 (one standout creative, weeks later) are DIFFERENT moments: never added together or described as one window.
   Amounts are USD as reported by the client; `usd` is the number, `en` the English display string. */
export const ELYON_EARLY_TEST = {
  spend: { en: '$229.89', usd: 229.89 },
  purchaseValue: { en: '$835', usd: 835 },
  averageRoas: '3.63x',
  topCreative: '5.10x',
  secondCreative: '3.17x',
}
export const ELYON_STANDOUT = {
  revenue: { en: '$3,421.25', usd: 3421.25 },
  purchases: '9',
  roas: '5.28x',
}

export const ELYON_SCALE_STAGES = [
  { step: '01', tag: 'Initial Batch', value: '30', label: 'Interview-style deliverables' },
  { step: '02', tag: 'Expansion', value: '22', label: 'Spanish-language interviews' },
  { step: '03', tag: 'Ongoing Library', value: '160+', label: 'Creatives to date' },
]

export const ELYON_VIDEOS = [
  { id: 'fa02007b36fae2b3bb68c97cdd00e9fc', label: 'Creator-Led Ad' },
  { id: '0905b814e2ba3950197b5bfe1cefae38', label: 'Street Interview' },
  { id: '9e6cb8438c9b0c1ab8b55953718eddde', label: 'Performance Concept' },
]
