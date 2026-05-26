/* ── Premium section divider — sharp gradient line ── */
export default function SectionDivider() {
  return (
    <div className="relative w-full px-5 md:px-8" aria-hidden="true">
      <div
        className="mx-auto"
        style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.12) 15%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 85%, transparent 100%)',
        }}
      />
    </div>
  )
}
