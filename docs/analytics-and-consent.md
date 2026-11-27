# Analytics, consent and conversion tracking (GTM + GA4)

**Status:** built, inactive until you set one environment variable. Nothing here has been connected to a Google account; no ID is in the code.

## How it works

- `src/lib/consent.js` loads **Google Tag Manager** only when **both** are true: `VITE_GTM_ID` is set at build time **and** the visitor has accepted analytics or marketing cookies.
- Google **Consent Mode v2** defaults are pushed first and are all `denied`; a saved choice is applied before GTM is requested.
- The cookie banner (`src/components/ConsentManager.jsx`) has **Accept all**, **Reject all** and **Preferences** (Analytics and Marketing switches, both off by default). The footer's **Cookie settings** link re-opens it so a choice can be changed or withdrawn. Withdrawing stops events immediately, sends a `denied` update and removes Google's cookies (`_ga`, `_ga_*`, `_gid`, `_gcl_*`).
- With `VITE_GTM_ID` empty (today) there is no banner, no script, no storage: the site behaves exactly as before.
- Every existing `trackEvent(...)` call is reused unchanged. Each event now also carries `page_path` and `landing_page` (the path where the session's tracking started; path only, no query string) and identical events within 750 ms are dropped.

## What you need to do (about 20 minutes)

1. **Create a GTM container**: tagmanager.google.com → Create account → container name `convrt.studio`, target platform **Web**. Copy the ID (`GTM-XXXXXXX`).
2. **Create a GA4 property** (analytics.google.com → Admin → Create → Property), add a **Web data stream** for `https://www.convrt.studio`. Copy the **Measurement ID** (`G-XXXXXXXXXX`). Do not paste it into the code or into Vercel; it goes into GTM in step 3.
3. **In GTM, add the Google tag**: Tags → New → *Google tag* → Tag ID = your `G-…` → Trigger **Initialization - All Pages**. Open *Advanced settings → Consent settings* and keep the default (the tag respects Consent Mode). Then Admin → Container settings → tick **Enable consent overview** and check the tag shows built-in consent checks.
4. **Add one trigger and one GA4 event tag per conversion** (table below): Triggers → New → *Custom Event* → *Event name* = the name below. Tags → New → *Google Analytics: GA4 Event* → configuration = your Google tag, event name = the same name, trigger = that trigger. Add `page_path` and `landing_page` as event parameters (Data Layer Variables `page_path`, `landing_page`).
5. **Publish** the GTM container (Submit → Publish).
6. **In GA4** mark the conversion events as **Key events** (Admin → Events → toggle) and register `landing_page` and `page_path` as **custom dimensions** (Admin → Custom definitions → event scope).
7. **In Vercel** (Project → Settings → Environment Variables) add `VITE_GTM_ID` = `GTM-XXXXXXX`. Choose **Preview** first to test on the preview link, **Production** when you approve. Redeploy (it is a build-time variable).
8. **Test**: open the preview, click **Accept all**, then use GTM's *Preview* mode (or Tag Assistant) and GA4 *DebugView*; submit a test Roadmap application and book a test Calendly slot. Reject all and confirm nothing fires.

If anything looks wrong, remove `VITE_GTM_ID` and redeploy: the site returns to the no-tracking state.

## Events (GTM Custom Event names)

| Business question | Event name | Where it fires |
|---|---|---|
| Roadmap form started | `roadmap_form_started` | first interaction with the Roadmap form |
| Roadmap application submitted | `roadmap_application_submitted` | form completed |
| Roadmap outcome (qualified enquiry) | `roadmap_qualified`, `roadmap_not_ready`, `roadmap_different_business` | after the qualification rules run; **`roadmap_qualified` is the "qualified lead"** |
| Calendar shown / booking made | `roadmap_calendar_viewed`, `roadmap_booking_confirmed` | Calendly embed on /creative-growth-roadmap (`confirmed` only on Calendly's own scheduled message) |
| ~~Calendly booking on /scale~~ | ~~`booking_flow_opened`, `booking_completed`~~ | removed 27 Nov 2026 (no public booking modal; /scale CTAs open the Roadmap and keep `primary_cta_click`, `page: scale`) |
| Calendar requested / Calendly opened in a new tab | `calendar_load_click`, `calendar_newtab_click` (`page` = roadmap; `scale` before 27 Nov 2026) | the booking calendar gate (see docs/booking-embed-and-cookies.md) |
| Free video application | `risk_free_application_submitted`, `risk_free_application_success` | /risk-free-trial (success = saved) |
| Free hooks signup | `hooks_signup_submitted`, `hooks_signup_success` | /free-hooks (success = saved) |
| Referral application | `referral_application_submit`, `referral_application_success` | /referrals |
| Important CTA clicks | `hero_creative_roadmap_click`, `roadmap_apply_click`, `primary_cta_click`, `ugc_page_cta_click`, `saas_page_cta_click`, `spokesperson_page_cta_click`, `organic_page_cta_click`, `*_pricing_link_click`, `referral_cta_click`, `risk_free_apply_click`, `case_study_click` | nav, hero, service pages, /scale |
| VSL engagement | `vsl_play`, `vsl_progress` (`percent`), `vsl_complete` | /scale and /creative-growth-roadmap videos |
| Page-level views | `ugc_page_view`, `saas_page_view`, `spokesperson_page_view`, `organic_page_view`, `our_work_page_view`, `roadmap_page_view`, `hooks_page_view`, `risk_free_page_view`, `referral_page_view`, `landing_page_view` (/scale) | each page |

Events carry no answers or personal data (the Roadmap answers stay in the browser).

## Which landing pages produce qualified enquiries

Every event includes `landing_page`. In GA4: Explore → Free form → Rows: `landing_page` (custom dimension) → Values: Event count for `roadmap_qualified` / `roadmap_booking_confirmed` / the success events. GA4's own *Landing page* dimension in the Reports → Engagement → Landing page report gives the same view natively for conversions marked as key events.

## Known limits

- The first page of a visit is not counted until the visitor accepts (events before consent are dropped by design). GA4 still records the session from the moment GTM loads after acceptance.
- `landing_page` is the page where tracking started: if someone accepts on page 3, that is page 3.
- Visitors who reject are not measured at all (no cookieless pings in this "basic" consent mode).
- Server-side events and Meta/TikTok pixels are not set up. If you add a pixel later inside GTM, tie it to the Marketing consent signals (`ad_storage`, `ad_user_data`, `ad_personalization`).
- Draft privacy text describing this is in `src/content/trustPages.js`; it needs your review.

## GTM configuration recipe (exact names)

Do these in tagmanager.google.com (container `GTM-W7N2RPCQ`), then publish. One variable set, three triggers, one tag.

| Step | Where in GTM | Create | Exact value |
|---|---|---|---|
| 1 | Variables -> User-defined -> New -> *Data Layer Variable* | `DLV page_path` | Data Layer Variable Name: `page_path` |
| 2 | same | `DLV landing_page` | `landing_page` |
| 3 | same | `DLV location` | `location` |
| 4 | same | `DLV percent` | `percent` |
| 5 | same | `DLV page` | `page` (value `roadmap` or `scale`) |
| 6 | same | `DLV industry` | `industry` |
| 7 | Triggers -> New -> *Custom Event* | **CONVRT conversions** | Event name (check *Use regex matching*): `^(roadmap_(form_started\|application_submitted\|qualified\|not_ready\|different_business\|calendar_viewed\|booking_confirmed)\|risk_free_(form_started\|application_submitted\|application_success)\|hooks_(form_started\|signup_submitted\|signup_success)\|referral_(form_start\|application_submit\|application_success)\|booking_(flow_opened\|completed)\|calendar_(load_click\|newtab_click))$` |
| 8 | Triggers -> New -> *Custom Event* | **CONVRT CTA clicks** | regex: `^(hero_creative_roadmap_click\|roadmap_apply_click\|risk_free_apply_click\|referral_cta_click\|primary_cta_click\|case_study_click\|ugc_case_study_click\|hero_see_our_work_click\|(saas\|spokesperson\|organic)_(page_cta\|pricing_link\|email)_click\|(ugc\|saas\|spokesperson\|organic)_see_all_videos_click)$` |
| 9 | Triggers -> New -> *Custom Event* | **CONVRT video** | regex: `^vsl_(play\|progress\|complete)$` |
| 10 | Tags -> New -> *Google Analytics: GA4 Event* | **GA4 - CONVRT events** | Measurement ID `G-7R9WTV2XQF` (or select your Google tag). **Event Name: `{{Event}}`** |
| 11 | same tag -> Event Parameters | add rows | `page_path` = `{{DLV page_path}}`; `landing_page` = `{{DLV landing_page}}`; `location` = `{{DLV location}}`; `percent` = `{{DLV percent}}`; `page` = `{{DLV page}}`; `industry` = `{{DLV industry}}` |
| 12 | same tag -> Triggering | add all three | CONVRT conversions + CONVRT CTA clicks + CONVRT video |
| 13 | same tag -> Advanced settings -> Consent settings | leave default | Built-in consent checks apply (Google tags respect Consent Mode) |
| 14 | Preview (Tag Assistant) on the Vercel Preview URL | test | Accept analytics, then trigger each event; the tag must fire once per event |
| 15 | Submit -> Publish | | |

Do **not** forward the `*_page_view`, `*_gallery_*` or FAQ events unless you want them (GA4's own `page_view` already carries the page). In the regexes above, `\|` is just the pipe character: type a normal `|`.
