import { useEffect, useRef } from 'react'
import { attachHls } from '../../lib/hls.js'
import { XIcon } from './icons.jsx'

/* Plays a private (signed-URL) HLS video in an overlay. Esc / backdrop / close button dismiss it. */
export default function PlayerModal({ src, title, onClose }) {
  const video = useRef(null)
  const closeBtn = useRef(null)
  useEffect(() => {
    const h = attachHls(video.current, src, { autoStartLoad: true })
    closeBtn.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { h.destroy(); document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [src, onClose])
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 p-4 backdrop-blur" onClick={onClose}>
      <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close video" className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-ink hover:bg-surface-3"><XIcon /></button>
        <video ref={video} controls playsInline className="max-h-[80vh] w-full rounded-2xl bg-black" />
      </div>
    </div>
  )
}
