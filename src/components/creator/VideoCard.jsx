import { useRef, useState } from 'react'
import { CloudUploadIcon, CheckIcon, PlayIcon, RefreshIcon, XIcon, AlertIcon, SpinnerIcon } from './icons.jsx'
import { VIDEO_MAX_SECONDS, humanBytes, VIDEO_MAX_BYTES } from '../../lib/creator/constants.js'

/* One of the three portfolio upload cards. Vertical (9:16-ish) card on tablet/desktop, a compact row on phones.
   Click, keyboard (Enter/Space) or drag-and-drop to choose a file. Shows progress, processing, a thumbnail once
   ready, replace/remove, and a clear error with a retry. The file itself goes straight to Cloudflare (see page). */

const fmt = (s) => (s == null ? '' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`)

export default function VideoCard({ slot, video, error, disabled, onFile, onRemove, onPlay }) {
  const input = useRef(null)
  const [drag, setDrag] = useState(false)
  const status = video?.status || 'empty'
  const busy = status === 'uploading' || status === 'processing' || status === 'checking'
  const pick = () => { if (!disabled && !busy) input.current?.click() }
  const accept = (file) => { if (file) onFile(file) }

  const frame = `relative flex min-h-[116px] flex-row items-center gap-4 overflow-hidden rounded-3xl border p-4 text-left transition-colors sm:aspect-[9/13] sm:min-h-0 sm:flex-col sm:justify-center sm:gap-0 sm:p-0 sm:text-center motion-reduce:transition-none
    ${drag ? 'border-lime bg-lime/5' : error || status === 'error' ? 'border-coral/60 bg-surface-1' : status === 'ready' ? 'border-lime/40 bg-surface-1' : 'border-hairline-strong bg-surface-1'}`

  return (
    <div className="min-w-0">
      <div
        className={frame}
        onDragOver={(e) => { e.preventDefault(); if (!disabled && !busy) setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled && !busy) accept(e.dataTransfer.files?.[0]) }}
      >
        <input
          ref={input}
          type="file"
          accept="video/mp4,video/quicktime,.mp4,.mov"
          className="sr-only"
          tabIndex={-1}
          aria-label={`Choose file for video ${slot}`}
          data-testid={`video-input-${slot}`}
          onChange={(e) => { accept(e.target.files?.[0]); e.target.value = '' }}
        />

        {status === 'empty' && (
          <button
            type="button"
            onClick={pick}
            disabled={disabled}
            className="flex h-full w-full items-center gap-4 rounded-3xl p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime sm:flex-col sm:justify-center sm:gap-0"
            aria-describedby={error ? `video-${slot}-error` : undefined}
          >
            <CloudUploadIcon className="h-9 w-9 shrink-0 text-lime sm:h-10 sm:w-10" />
            <span className="sm:mt-4">
              <span className="block text-[17px] font-medium text-ink">Video {slot}</span>
              <span className="mt-1 block text-sm text-ink-muted">Upload MP4 or MOV</span>
              <span className="mt-1 hidden text-xs text-ink-subtle sm:block">or drag and drop</span>
            </span>
          </button>
        )}

        {(status === 'uploading' || status === 'processing' || status === 'checking') && (
          <div className="flex w-full flex-1 items-center gap-4 sm:flex-col sm:justify-center sm:px-5" role="status" aria-live="polite">
            <SpinnerIcon className="h-8 w-8 shrink-0 text-lime" />
            <div className="w-full min-w-0 sm:mt-4">
              <p className="truncate text-sm font-medium text-ink">Video {slot}</p>
              <p className="mt-0.5 truncate text-xs text-ink-muted">{video.filename}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(video.progress ?? 0)}>
                <span className="block h-full rounded-full bg-lime transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${Math.max(4, Math.round(video.progress ?? 0))}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {status === 'uploading' ? `Uploading… ${Math.round(video.progress ?? 0)}%` : status === 'processing' ? 'Processing your video…' : 'Checking your video…'}
              </p>
              {status === 'uploading' && (
                <button type="button" onClick={onRemove} className="mt-2 text-xs font-medium text-ink-muted underline underline-offset-2 hover:text-ink">Cancel</button>
              )}
            </div>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="relative aspect-[9/16] h-24 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:absolute sm:inset-0 sm:h-auto sm:aspect-auto sm:rounded-none">
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={`Thumbnail of video ${slot}`} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-subtle"><PlayIcon className="h-6 w-6" /></div>
              )}
              <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-canvas/90 via-canvas/10 to-canvas/30 sm:block" />
            </div>
            <div className="relative flex min-w-0 flex-1 flex-col justify-between gap-3 sm:absolute sm:inset-0 sm:flex-none sm:p-4">
              <div className="flex items-center gap-2 sm:justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 text-xs font-semibold text-canvas"><CheckIcon className="h-3.5 w-3.5" />Uploaded</span>
                <span className="hidden text-xs font-medium text-ink sm:inline">{fmt(video.duration)}</span>
              </div>
              <div className="min-w-0 sm:text-left">
                <p className="text-[15px] font-medium text-ink">Video {slot}</p>
                <p className="truncate text-xs text-ink-muted">{video.filename}{video.duration != null ? ` · ${fmt(video.duration)}` : ''}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {video.playbackAvailable !== false && (
                    <button type="button" onClick={onPlay} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-2/90 px-3 text-xs font-medium text-ink hover:bg-surface-3"><PlayIcon className="h-3 w-3" />Play</button>
                  )}
                  <button type="button" onClick={pick} disabled={disabled} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-2/90 px-3 text-xs font-medium text-ink hover:bg-surface-3 disabled:opacity-50"><RefreshIcon className="h-3.5 w-3.5" />Replace</button>
                  <button type="button" onClick={onRemove} disabled={disabled} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-2/90 px-3 text-xs font-medium text-ink hover:bg-surface-3 disabled:opacity-50"><XIcon className="h-3.5 w-3.5" />Remove</button>
                </div>
              </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="flex w-full items-center gap-4 sm:flex-col sm:justify-center sm:px-5 sm:text-center" role="alert">
            <AlertIcon className="h-8 w-8 shrink-0 text-coral" />
            <div className="min-w-0 sm:mt-3">
              <p className="text-[15px] font-medium text-ink">Video {slot}</p>
              <p className="mt-1 text-sm leading-snug text-coral">{video.error}</p>
              <button type="button" onClick={pick} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-surface-2 px-4 text-xs font-medium text-ink hover:bg-surface-3"><RefreshIcon className="h-3.5 w-3.5" />Try again</button>
            </div>
          </div>
        )}
      </div>
      {error && status !== 'error' && (
        <p id={`video-${slot}-error`} className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-coral"><AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>
      )}
    </div>
  )
}

export const VIDEO_RULES = `MP4 or MOV, up to ${humanBytes(VIDEO_MAX_BYTES)} and ${VIDEO_MAX_SECONDS / 60} minutes each. No need to compress.`
