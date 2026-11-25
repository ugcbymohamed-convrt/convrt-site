import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import rtlFlip from './scripts/postcss-rtl-flip.js'

/* rtlFlip runs last: it mirrors the generated left/right CSS under [dir="rtl"] for the Arabic site (scripts/postcss-rtl-flip.js). It adds rules only; no existing rule changes. */
export default {
  plugins: [tailwindcss(), autoprefixer(), rtlFlip()],
}
