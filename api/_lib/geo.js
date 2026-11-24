/* Where a request came from, as far as this site needs to know: Spain, an Arabic-speaking country, or neither. Vercel sets the x-vercel-ip-country header on every request at its edge (a client cannot set it);
   it is the same value @vercel/functions' geolocation() reads. Only booleans leave this function: no IP address, no country code of anyone else, nothing is stored or logged. */
const country = (headers = {}) => String(headers['x-vercel-ip-country'] ?? '').trim().toUpperCase()
export const isSpain = (headers = {}) => country(headers) === 'ES'

/* The 22 member states of the Arab League (Saudi Arabia, the UAE and the other Gulf states, the Levant, Iraq, Egypt, Sudan, the Maghreb and the rest): the countries where a visitor is offered the Arabic site. */
export const ARAB_COUNTRIES = ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE', 'IQ', 'JO', 'LB', 'SY', 'PS', 'EG', 'SD', 'LY', 'TN', 'DZ', 'MA', 'MR', 'SO', 'DJ', 'KM']
export const isArabCountry = (headers = {}) => ARAB_COUNTRIES.includes(country(headers))
