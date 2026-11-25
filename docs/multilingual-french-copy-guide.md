# French copy guide (fr-FR) — CONVRT

The French site must read as if a professional French copywriter wrote it for a French business audience. It is **not** a sentence-by-sentence translation of the English site and it
is **not** derived from the Spanish site. The English source supplies the meaning, the evidence and the commercial accuracy; the French is then written naturally.

## Voice
Confident, clear, modern, commercial, professional, concise. Creative but not theatrical. Always **« vous »** (professional). First person plural **« nous »** for CONVRT.
Short sentences. Short card titles and button labels (about the same length as the English, never three-line labels).

## Never
- Generic AI-sounding promises: « Révolutionnez votre marque », « Des solutions innovantes adaptées à vos besoins », « maximiser votre potentiel » (and variants).
- Unverifiable superlatives, « meilleure agence UGC », « leader », « n° 1 ».
- Guaranteed results (ROAS, conversions, sales, revenue). Keep the English hedges (« nous ne pouvons pas garantir… »).
- Any French office, address, team, legal establishment or local production claim. CONVRT works with brands in France from outside France.
- Invented numbers, timelines, inclusions, revisions, reviews, ratings. Copy every figure (counts, months, days, rounds) exactly; only the notation changes.
- Literal English structures (« Obtenez vos 5 concepts »), and needless Anglicisms.

## Terminology (use consistently)
| English | French |
|---|---|
| UGC, UGC ad(s) | UGC, publicité(s) UGC, vidéo(s) UGC |
| creator(s) | créateur(s) (plural inclusive; « créateur ou créatrice » only when the sentence is about one person) |
| spokesperson (video) | porte-parole ; « vidéo avec porte-parole » |
| presenter | présentateur / présentatrice, or porte-parole |
| hook(s) | hook(s) (established marketing term; « accroche » is fine once for clarity) |
| creative concept | concept créatif ; concept |
| finished ad version(s) | version(s) publicitaire(s) finalisée(s) ; « versions » |
| variation(s) | version(s) / variante(s) |
| creative(s) (the ad itself) | création(s) publicitaire(s), vidéo(s) publicitaire(s) ; avoid the bare jargon « créatifs » unless the English is clearly a noun for the ads and nothing else fits |
| creative testing / testing | test créatif / tester |
| paid social / organic social | social payant (publicité sur les réseaux sociaux) / social organique (contenus organiques pour les réseaux sociaux) |
| production, filming, editing | production, tournage, montage |
| scripts, casting | scripts, sélection des créateurs |
| usage rights | droits d’utilisation |
| raw footage | rushes bruts |
| revisions / rounds of revisions | modifications / cycles de modifications |
| turnaround | délai de production ; business days = jours ouvrés |
| free | offert(e)(s) in headings and offers ; gratuit(e) in running text |
| On us. | Offerts. / On vous l’offre. (pick what fits the line) |
| Free Creative Growth Roadmap | feuille de route créative offerte |
| Get 5 Free Ad Concepts | Recevoir 5 concepts publicitaires offerts (short form for buttons: « 5 concepts offerts ») |
| 1 FREE Video | 1 vidéo OFFERTE |
| VAT / excl. VAT | TVA / hors TVA ; « HT » for “excl. tax” next to a price. State no French VAT rate or registration. |
| brand / client | marque / client |
| case study | étude de cas |
| Creator Showcase | Creator Showcase (kept; explain as « les exemples de nos créateurs ») |
| paid advertising | publicité payante |
| strategy call | session / appel stratégique |

**Keep in English (product and proper names):** Creative Testing Sprint, Sprint, Sprint Plus, Organic Light, Organic Growth, Meta, TikTok, Instagram, Facebook, YouTube, LinkedIn, Snapchat,
Pinterest, Calendly, CONVRT, SaaS, UGC, B-roll, Spark Ads, partnership ads, ROAS (spell out « retour sur investissement publicitaire (ROAS) » on first use in a sentence).
Client names and client quotes are never translated.

## Typography (the build rewrites spacing for you, but write clean text)
- Typographic apostrophe **’** (never `'`), and « guillemets » for quotations.
- Write a normal space before **: ; ? ! »** and after **«**; a script converts them to non-breaking spaces. Do not use ` ` yourself.
- « n° 1 », « 1ᵉʳ » are not needed. Decimal comma and thin-space thousands are handled by tokens (see below).
- Capitalise only the first word of a heading and proper nouns. Months and days are lower case.

## Prices and figures (CRITICAL)
The English keys contain dollar amounts (for example `$3,500`, `$937.50`, `$250`). The French dictionary NEVER contains a currency amount typed by hand. Use these tokens exactly, in the
French sentence, where the English has the dollar amount (the Spanish dictionary in `src/i18n/es/dict-pricing.js` and `dict-services.js` shows each token in context; use it ONLY to see
which token belongs to which dollar amount, never as a translation source):

`{{price:sprint.monthly}}` `{{price:sprint.oneOff}}` `{{price:sprint.ext3}}` `{{price:sprint.ext6}}` `{{price:sprint.ext12}}`
`{{price:sprintPlus.monthly}}` `{{price:sprintPlus.oneOff}}` `{{price:sprintPlus.ext3}}` `{{price:sprintPlus.ext6}}` `{{price:sprintPlus.ext12}}`
`{{price:rawFootage}}` `{{price:organicLight.monthly}}` `{{price:organicGrowth.monthly}}` and `{{perVariation:sprint.monthly}}` `{{perVariation:sprintPlus.monthly}}` (and `.oneOff` forms) for a per-version price.

The tokens render as « 2 750 € » (the euro sign included). So write `{{price:sprint.monthly}} par mois`, NOT `{{price:sprint.monthly}} €`. Where the English says "$X a month / /month" write « par mois ».
Where the English says prices are "in US dollars", the French says they are **in euros** and **hors TVA** (« Les prix sont indiqués en euros, hors TVA. »).
Every other figure in a sentence (5 concepts, 15 versions, 10 business days, 6 months, 30 days, 2 rounds…) is copied exactly.

## Business rules to preserve in the wording (they are in the English text; do not soften or extend them)
- Sprint / Sprint Plus monthly: 3-month initial minimum commitment, then month-to-month with 30 days’ notice. Organic monthly: 6-month initial commitment. One-off packages have no recurring commitment.
- Turnaround starts once concepts and scripts are approved, not when payment is made.
- Usage rights: 6 months from delivery, worldwide, paid ads + organic social + website. Not a transfer of copyright. Raw footage is an add-on, never a replacement for edited videos.
- Creator-account permissions (Spark Ads / partnership ads) are separate and not automatic. No perpetual rights price.
- UGC videos are 100 % human-created. CONVRT makes the ads; it does not buy media or manage ad accounts.
- The free offers are applications subject to a fit check / approval; never an automatic entitlement. The Roadmap is five tailored ad **concepts**, not five produced videos.

## Output format
A JS module: `export default { "<exact English key>": "<French>", … }`. Keys are copied byte-for-byte from the supplied key file. One entry per key, no extras, no comments inside the object
other than short section comments. Use double-quoted JS strings, escaping `"` if needed. Keep `\n` where the English key has `\n` (headline line breaks).
