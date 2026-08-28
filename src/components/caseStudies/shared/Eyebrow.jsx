/* Small pulsing-dot pill label used above section headings across
   the case-study system (e.g. "The Challenge", "Performance Snapshot"). */
export default function Eyebrow({ label, accent = '#d5ff40', className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/60 px-4 py-1.5 backdrop-blur ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: accent }} />
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </span>
    </div>
  )
}
