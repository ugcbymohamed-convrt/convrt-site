/* Where a request came from, as far as this site needs to know: Spain or not. Vercel sets the x-vercel-ip-country header on every request at its edge (a client cannot set it);
   it is the same value @vercel/functions' geolocation() reads. Only the boolean leaves this function: no IP address, no country code of anyone else, nothing is stored or logged. */
export const isSpain = (headers = {}) => String(headers['x-vercel-ip-country'] ?? '').trim().toUpperCase() === 'ES'
