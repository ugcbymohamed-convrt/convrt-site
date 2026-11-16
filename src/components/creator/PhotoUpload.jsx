import { useRef, useState } from 'react'
import { ImageIcon, UploadIcon, SpinnerIcon, AlertIcon } from './icons.jsx'

/* Optional profile photo row (JPG or PNG; resized in the browser before upload). Preview, replace, remove. */
export default function PhotoUpload({ photo, previewUrl, busy, error, disabled, onFile, onRemove }) {
  const input = useRef(null)
  const [drag, setDrag] = useState(false)
  const has = Boolean(photo)
  return (
    <div>
      <div
        className={`flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors motion-reduce:transition-none ${drag ? 'border-lime bg-lime/5' : error ? 'border-coral/60' : 'border-hairline-strong'}`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!disabled && e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]) }}
      >
        <input ref={input} type="file" accept="image/jpeg,image/png" className="sr-only" tabIndex={-1} aria-label="Choose profile photo" data-testid="photo-input"
          onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); e.target.value = '' }} />
        {has && previewUrl ? (
          <img src={previewUrl} alt="Your profile photo" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <ImageIcon className="h-7 w-7 shrink-0 text-lime" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-medium text-ink">Profile photo</p>
          <p className="text-sm text-ink-muted">{busy ? 'Uploading…' : has ? 'Added. It will only be used if you are approved.' : 'Optional — JPG or PNG'}</p>
        </div>
        {busy ? (
          <SpinnerIcon className="h-5 w-5 text-lime" />
        ) : has ? (
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="h-9 rounded-full bg-surface-2 px-3 text-xs font-medium text-ink hover:bg-surface-3 disabled:opacity-50">Replace</button>
            <button type="button" disabled={disabled} onClick={onRemove} className="h-9 rounded-full bg-surface-2 px-3 text-xs font-medium text-ink hover:bg-surface-3 disabled:opacity-50">Remove</button>
          </div>
        ) : (
          <button type="button" disabled={disabled} onClick={() => input.current?.click()} aria-label="Upload profile photo" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-50">
            <UploadIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-coral"><AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}
    </div>
  )
}
