/* WHERE CLOUDFLARE STREAM VIDEOS ARE PLAYED FROM.

   Every video and Stream thumbnail on the site is read from CONVRT's own Stream customer hostname (the `playback.hls` host Cloudflare returns for each video in the dashboard/API)
   instead of the shared videodelivery.net alias. Same videos, same CDN, same CORS (access-control-allow-origin: *), but videodelivery.net is a shared domain that some networks and
   DNS resolvers do not resolve (reproduced 2026-11-27 on a Spanish ISP resolver: videodelivery.net failed to resolve while the customer hostname worked), which left every video
   on its poster. One constant, so a video can never be wired to the other host by accident. */

export const STREAM_HOST = 'https://customer-0hz43gyj10hvd956.cloudflarestream.com'

export const streamHls = (id) => `${STREAM_HOST}/${id}/manifest/video.m3u8`
export const streamThumbnail = (id, { time = 0, height = 720 } = {}) => `${STREAM_HOST}/${id}/thumbnails/thumbnail.jpg?time=${time}s&height=${height}`
export const streamIframe = (id) => `${STREAM_HOST}/${id}/iframe`
/* A plain MP4 (HTTP range requests, a 302 to the file): for a short clip played in a <video src> without HLS (the /scale showcase). Downloads must be enabled once per video on Stream. */
export const streamMp4 = (id) => `${STREAM_HOST}/${id}/downloads/default.mp4`
