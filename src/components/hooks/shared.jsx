/* Shared bits for the /free-hooks page. Reveal / Check come from the roadmap
   page's shared module so both lead pages stay visually identical. */

export { Reveal, Check } from '../roadmap/shared.jsx'

export const primaryBtnClass =
  'cta-gradient group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-canvas ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ' +
  'disabled:cursor-not-allowed disabled:opacity-70'
