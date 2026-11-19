import { useEffect, useState } from 'react'
import { attachHls } from '../../lib/hls.js'
import { hlsUrl } from '../../content/portfolio.js'

/* Shared video plumbing for the approved creator videos (hero stage and portfolio). Nothing here renders until an approved video
   exists, and no <video> element, stream or download is created until a component decides one is needed. */

/* Attach an approved item's source to a <video> element. Cloudflare Stream ids play through HLS (hls.js is loaded on demand and
   not at all on Safari/iOS); other items are plain mp4 files. Cleans up on unmount or when the item changes. */
export function useAttachSource(ref, item) {
  useEffect(() => {
    const v = ref.current
    if (!v) return undefined
    if (item.source.cloudflareId) {
      const hls = attachHls(v, hlsUrl(item))
      return () => hls.destroy()
    }
    v.src = item.source.mp4
    return () => { v.removeAttribute('src'); v.load() }
  }, [ref, item])
}

/* Visitor preferences that decide whether anything may start by itself: reduced motion and data saver. */
export function useAutoplayAllowed() {
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const saver = navigator.connection?.saveData === true
    const update = () => setAllowed(!mq?.matches && !saver)
    update()
    mq?.addEventListener?.('change', update)
    return () => mq?.removeEventListener?.('change', update)
  }, [])
  return allowed
}

/* True once the browser is idle after load, so video work never competes with the first paint (LCP is the poster image). */
export function useIdleAfterLoad(timeout = 1500) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let cancelled = false
    const go = () => { if (!cancelled) setIdle(true) }
    const ric = window.requestIdleCallback
    const id = ric ? ric(go, { timeout }) : window.setTimeout(go, 600)
    return () => { cancelled = true; if (ric) window.cancelIdleCallback?.(id); else window.clearTimeout(id) }
  }, [timeout])
  return idle
}

export const PlayGlyph = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 12 12" className={`ml-0.5 ${className}`} fill="currentColor" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" /></svg>
)
export const PauseGlyph = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></svg>
)
export const SoundGlyph = ({ muted, className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
    <path d="M4 7v6h3l5 4V3L7 7H4z" fill="currentColor" />
    {muted
      ? <path d="M14.5 7.5l4 4M18.5 7.5l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      : <path d="M14 8c.8.6 1.3 1.3 1.3 2s-.5 1.4-1.3 2M16.6 5.6c1.7 1.2 2.6 2.7 2.6 4.4s-.9 3.2-2.6 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
  </svg>
)
