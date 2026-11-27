/* Small visual parts shared by the premium About page in every language (src/components/about/AboutLayout.jsx, used by src/AboutPage.jsx and src/components/about/EnglishAbout.jsx). */

export const Badge = ({ children }) => (
  <div className="inline-flex items-center gap-2.5">
    <span className="h-px w-8 bg-lime" aria-hidden="true" />
    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{children}</span>
    <span className="h-px w-8 bg-lime" aria-hidden="true" />
  </div>
)

export function Glow({ className }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute rounded-full ${className}`} />
}
