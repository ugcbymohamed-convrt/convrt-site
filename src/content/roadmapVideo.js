/* The Free Creative Growth Roadmap page video (src/components/roadmap/RoadmapVideo.jsx).

   Hosted on Cloudflare Stream like the homepage hero, /scale and the UGC page. Source file:
   ROADMAP-PAGE.mp4 (1920×1080, 16:9, 1 min 46 s), uploaded 2026-11-19. To swap the video, upload the
   new file to Stream, change ROADMAP_VIDEO_ID and re-export the two poster images from a frame of it
   (public/roadmap/roadmap-video-poster.webp 1280×720 and …-640.webp 640×360). Nothing else changes. */

import { streamHls } from '../lib/streamHost.js'

export const ROADMAP_VIDEO_ID = 'a37d5452f9c95a459c96f1a90a3a711d'
export const ROADMAP_VIDEO_HLS = streamHls(ROADMAP_VIDEO_ID)

// Same-origin poster (a still from the video at 25.6 s, chosen for a warm, friendly expression): shows with the page, no third-party request.
export const ROADMAP_VIDEO_POSTER = '/roadmap/roadmap-video-poster.webp'
export const ROADMAP_VIDEO_POSTER_SMALL = '/roadmap/roadmap-video-poster-640.webp'
export const ROADMAP_VIDEO_POSTER_SIZE = { width: 1280, height: 720 }
