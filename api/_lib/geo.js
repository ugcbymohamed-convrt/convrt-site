/* Where a request came from, as far as this site needs to know: Spain, France or neither. Vercel sets the x-vercel-ip-country header on every request at its edge (a client cannot set it);
   it is the same value @vercel/functions' geolocation() reads. Only booleans leave this function (about the requester, to the requester): no IP address, no country code, nothing is stored or logged.
   A country is added here only together with a live language whose visitors we suggest it to (src/lib/languageSuggestion.js). */
const country = (headers = {}) => String(headers['x-vercel-ip-country'] ?? '').trim().toUpperCase()
export const isSpain = (headers = {}) => country(headers) === 'ES'
export const isFrance = (headers = {}) => country(headers) === 'FR'
/* The edge gave a country at all (false locally, or when Vercel cannot place the request): the client then falls back to the browser's language list, never to a guess about the network. */
export const countryKnown = (headers = {}) => /^[A-Z]{2}$/.test(country(headers))
