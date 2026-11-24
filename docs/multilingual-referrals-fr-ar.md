# Referral Partner Program in Spanish, French and Arabic (Nov 2026)

The English `/referrals` page is the factual and contractual source. Its program has TWO tiers: Standard Referral Partner ($150 cash or production credit per eligible new client) and Agency & Strategic Partner (10 % of the first qualifying project payment, capped at $500 per referred client). The translations keep both tiers and every term word for word; no amount, condition, payment schedule or exclusion was added, changed or converted (rewards stay in US dollars, as in English).

## Routes and state
| Page | State | Why |
|---|---|---|
| `/referrals` (EN) | unchanged, `noindex` | launch gate `REFERRALS_INDEXABLE = false` (MailerLite, legal review, a real test application) |
| `/es/referrals` | built, `noindex`, no hreflang, not in the sitemap | follows the English gate (`localizedHead`: indexable only while the English page is) |
| `/fr/referrals`, `/ar/referrals` | built, `noindex`, no hreflang, not in the sitemap, not in the selector | French and Arabic are `status: 'review'` on this branch |

Registry: `src/i18n/registry.js` (`TRANSLATED_PATHS`), flags: `src/i18n/cta.js` (`LOCALIZED_FLOWS.<locale>.referrals`), titles/descriptions: `src/i18n/{es,fr,ar}/seo.js`. Canonicals are self-referencing. When the English gate flips, the three pages become indexable by themselves (Spanish at once; French and Arabic when their locale moves from `review` to `live`).

## Dictionaries
`src/i18n/{es,fr,ar}/dict-referrals.js` (referral page) and `src/i18n/{fr,ar}/dict-shell.js` (menu, footer). The French and Arabic dictionaries on this branch hold ONLY those strings. The full French and Arabic translations live on `french-localization` and `arabic-localization` (not merged). To release: merge those branches, keep their `index.js`, add `referrals` to it, and set `fr` / `ar` to `live`.

## What is NOT translated, on purpose
* The partner-kit messages (subject, email, LinkedIn/WhatsApp text) are sent by hand in English (`docs/partner-kit.md`); the preview shows them as sent, marked `lang="en"`, and the label says "(en inglés / en anglais / بالإنجليزية)".
* The privacy policy, terms and legal notice exist only in English; links say so.
* The marketing-consent checkbox is shown in English only (its wording is versioned in `src/content/marketingConsent.js` and not approved in other languages), like the Spanish roadmap and free-video forms.

## Form
Same API (`/api/referral-apply`), same field values (partner type and program values stay the English options the server matches; only the labels are translated), same honeypot, validation and analytics. Messages and labels go through the dictionaries.

## Owner decisions still open
* Hero headline: the brief suggested "Gana un 10 %". The English page deliberately avoids a 10 %-only headline (Standard partners earn $150), so the translations say "Recomienda CONVRT. Gana una recompensa." / "Recommandez CONVRT. Gagnez une récompense." / "رشّح CONVRT واكسب مكافأة".
* The primary button says "Hacerme socio recomendador" / "Devenir partenaire" / "انضم كشريك إحالة" (it applies to the program; a brand can only be recommended after approval).
* Reward amounts in dollars for Spanish and French readers (EUR is used for CONVRT's own packages): a business decision, not converted.
