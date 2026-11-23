import { createRoot } from 'react-dom/client'
import LanguageSuggestion from './LanguageSuggestion.jsx'

/* Mounts the suggestion in its OWN root (like the cookie banner), so the prerendered markup and hydration are never affected. */
export function mountLanguageSuggestion(doc, href) {
  const host = doc.createElement('div')
  host.id = 'language-suggestion-root'
  doc.body.appendChild(host)
  const root = createRoot(host)
  root.render(<LanguageSuggestion href={href} onClose={() => { root.unmount(); host.remove() }} />)
}
