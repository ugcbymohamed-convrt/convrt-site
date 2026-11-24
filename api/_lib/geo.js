/* Where a request came from, as far as this site needs to know: Spain, France, a French-speaking country or none of them. Vercel sets the x-vercel-ip-country header on every request at its edge (a client cannot set it);
   it is the same value @vercel/functions' geolocation() reads. Only booleans leave this function (about the requester, to the requester): no IP address, no country code, nothing is stored or logged.
   A country is added here only together with a live language whose visitors we suggest it to (src/lib/languageSuggestion.js). */
const country = (headers = {}) => String(headers['x-vercel-ip-country'] ?? '').trim().toUpperCase()
export const isSpain = (headers = {}) => country(headers) === 'ES'
export const isFrance = (headers = {}) => country(headers) === 'FR'
/* Countries where French is an official or main everyday language (owner, 2026-11-24: suggest French to visitors from France, Canada, Switzerland and any other French-speaking country): Europe (FR, BE, CH, LU, MC),
   Canada, French overseas territories, French-speaking Africa, Madagascar, Haiti and Vanuatu. The Maghreb (MA, DZ, TN) is left out on purpose: Arabic is the main language there. The visitor is only ever
   OFFERED French (a dismissible card, never a redirect). */
export const FRENCH_SPEAKING = new Set(['FR', 'BE', 'CH', 'LU', 'MC', 'CA', 'GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF', 'NC', 'PF', 'WF', 'SN', 'CI', 'CM', 'CD', 'CG', 'GA', 'TG', 'BJ', 'BF', 'ML', 'NE', 'TD', 'GN', 'CF', 'BI', 'DJ', 'KM', 'MG', 'HT', 'VU'])
export const isFrenchSpeaking = (headers = {}) => FRENCH_SPEAKING.has(country(headers))
/* The edge gave a country at all (false locally, or when Vercel cannot place the request): the client then falls back to the browser's language list, never to a guess about the network. */
export const countryKnown = (headers = {}) => /^[A-Z]{2}$/.test(country(headers))
