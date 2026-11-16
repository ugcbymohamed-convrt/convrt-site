/* Inline icons for the creator pages (24px grid, 1.7 stroke, currentColor), so no icon package is added. */
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const Svg = ({ className = 'h-5 w-5', children }) => <svg {...base} className={className}>{children}</svg>

export const VideoIcon = (p) => <Svg {...p}><rect x="2.5" y="6" width="13" height="12" rx="3" /><path d="M15.5 10.5l5-2.8v8.6l-5-2.8" /></Svg>
export const UsersIcon = (p) => <Svg {...p}><circle cx="8.5" cy="8" r="3" /><path d="M3 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="16.5" cy="9" r="2.4" /><path d="M16.5 14c2.5 0 4.5 1.6 4.5 4.2" /></Svg>
export const ShieldCheckIcon = (p) => <Svg {...p}><path d="M12 3l7.5 2.7v5.6c0 4.6-3.1 8-7.5 9.7-4.4-1.7-7.5-5.1-7.5-9.7V5.7L12 3z" /><path d="M8.6 12.2l2.4 2.4 4.4-4.6" /></Svg>
export const CloudUploadIcon = (p) => <Svg {...p}><path d="M7 18a4.5 4.5 0 01-.6-8.96A6 6 0 0117.7 7.7 4.6 4.6 0 0117 18" /><path d="M12 21v-8M8.8 15.7L12 12.5l3.2 3.2" /></Svg>
export const ImageIcon = (p) => <Svg {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" /><circle cx="9" cy="9.2" r="1.6" /><path d="M20.5 15.5l-5-5-9.5 9.5" /></Svg>
export const UploadIcon = (p) => <Svg {...p}><path d="M12 15V4M8 8l4-4 4 4" /><path d="M4.5 14.5v3a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5v-3" /></Svg>
export const CheckIcon = (p) => <Svg {...p}><path d="M5 12.8l4.2 4.2L19 7.2" /></Svg>
export const PlayIcon = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={p.className || 'h-5 w-5'}><path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" /></svg>
export const XIcon = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
export const RefreshIcon = (p) => <Svg {...p}><path d="M20 11a8 8 0 10-2.3 5.7" /><path d="M20 5v6h-6" /></Svg>
export const ChevronIcon = ({ open, className = 'h-4 w-4' }) => <Svg className={`${className} transition-transform ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></Svg>
export const AlertIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16v.01" /></Svg>
export const DownloadIcon = (p) => <Svg {...p}><path d="M12 4v11M8 11l4 4 4-4" /><path d="M4.5 18.5h15" /></Svg>
export const SpinnerIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`${className} animate-spin motion-reduce:animate-none`}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity=".25" />
    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
)
