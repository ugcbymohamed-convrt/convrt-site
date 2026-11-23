/* PostCSS plugin: right-to-left mirrors for physical-direction CSS (Arabic site, docs/multilingual-arabic.md).

   The site's components are written with physical utilities (ml-4, pr-6, left-0, text-left, rounded-l-xl ...). Rewriting every class would change the English HTML. Instead, AFTER Tailwind has
   generated the CSS, this plugin appends, next to every rule that sets a left/right property, a copy scoped to `[dir="rtl"]` with the two sides swapped. English (dir="ltr") pages never match
   those selectors, so their rendering is unchanged; Arabic pages (<html dir="rtl">) get a mirrored layout from the same markup.

   What is flipped (gradient fades included: `linear-gradient(to right …)` becomes `to left` under [dir=rtl]): any property whose NAME contains left/right (margin-left, padding-right, border-left-width, border-top-left-radius, left, right, scroll-margin-left ...) by swapping the side in the
   name and keeping the value; and the VALUE of text-align, float, clear, transform-origin, object-position and background-position (left ↔ right).
   What is deliberately NOT flipped:
   • `left: 50%` / `right: 50%` — the centring idiom (`left-1/2 -translate-x-1/2`) is symmetric and must keep working in both directions;
   • anything inside @keyframes (a motion path is not a layout side); review those by hand (see docs/multilingual-arabic.md);
   • left-to-right islands: every mirrored selector ends in :not([dir="ltr"] *):not([dir="ltr"]), so an element marked dir="ltr" (English quotes, code) and its descendants keep their designed layout;
   • rules that are already scoped to [dir="rtl"] / :dir(rtl), so hand-written overrides and Tailwind's own rtl: variants win and are never mirrored twice.
   The copy is inserted straight after the original rule, so responsive variants keep their cascade order (md:ml-0 still overrides ml-4 in RTL). */

const SIDE = { left: 'right', right: 'left' }
const swapName = (prop) => prop.replace(/(^|-)(left|right)(?=-|$)/g, (_, pre, side) => `${pre}${SIDE[side]}`)
const NAME_HAS_SIDE = /(^|-)(left|right)(-|$)/
const swapWords = (value) => value.replace(/\b(left|right)\b/g, (w) => SIDE[w])
const VALUE_FLIPPED = new Set(['text-align', 'float', 'clear', 'transform-origin', 'object-position', 'background-position'])

function inKeyframes(node) {
  for (let p = node.parent; p; p = p.parent) if (p.type === 'atrule' && /keyframes$/i.test(p.name)) return true
  return false
}

/* A left-to-right ISLAND (an element with dir="ltr" inside the page, e.g. an English client quote) keeps its original, un-mirrored layout: the mirrored copy must not match the island or anything inside it.
   The exclusion is added to the LAST compound selector, before any pseudo-element (::before, ::placeholder, ::-webkit-scrollbar ...), which cannot be followed by more selectors. */
const ISLAND = ':not([dir="ltr"] *):not([dir="ltr"])'
function outsideLtrIslands(selector, extra = '') {
  const m = selector.match(/(?<!\\)(?:::|:(?:before|after|first-line|first-letter)\b)/) // not an ESCAPED colon (Tailwind's `sm\:before\:mx-2` is a class NAME)
  return m ? `${selector.slice(0, m.index)}${ISLAND}${extra}${selector.slice(m.index)}` : `${selector}${ISLAND}${extra}`
}

/* The ORIGINAL side must stop applying in right-to-left (a mirrored margin-left would otherwise leave the left margin in place as well, doubling every gap and border). It is reset to its initial value
   in a rule of LOWER specificity than the mirrored values, so that an element carrying both an `ml-*` and an `mr-*` utility ends with each mirrored value, whatever the order of the two rules. */
const RESET = (prop) => {
  if (/^(margin|padding)-(left|right)$/.test(prop)) return '0'
  if (/^border-(left|right)-width$/.test(prop)) return '0'
  if (/^border-(top|bottom)-(left|right)-radius$/.test(prop)) return '0'
  if (prop === 'left' || prop === 'right') return 'auto'
  return null
}
const TIER2 = ':not([dir="ltr"])'

const plugin = () => ({
  postcssPlugin: 'convrt-rtl-flip',
  OnceExit(root, { Rule }) {
    const targets = []
    root.walkRules((rule) => {
      if (inKeyframes(rule)) return
      if (rule.selectors.some((s) => /\[dir=["']?rtl["']?\]|:dir\(rtl\)/.test(s))) return
      if (rule.__rtlDone) return
      targets.push(rule)
    })
    for (const rule of targets) {
      const flipped = []
      const resets = []
      rule.each((d) => {
        if (d.type !== 'decl') return
        const prop = d.prop.toLowerCase()
        if (NAME_HAS_SIDE.test(prop)) {
          if ((prop === 'left' || prop === 'right') && d.value.trim() === '50%') return // centring idiom
          flipped.push({ prop: swapName(prop), value: d.value, important: d.important })
          if (RESET(prop) !== null) resets.push({ prop, value: RESET(prop), important: d.important })
        } else if (VALUE_FLIPPED.has(prop) && /\b(left|right)\b/.test(d.value)) {
          flipped.push({ prop, value: swapWords(d.value), important: d.important })
        } else if ((prop === 'background-image' || prop === 'background') && /linear-gradient\(\s*(to\s+)?(left|right)\b/.test(d.value)) {
          // Tailwind's bg-gradient-to-r / -l and hand-written "to right" fades: a horizontal gradient runs the other way in right-to-left layouts. Only the keyword after "linear-gradient(" changes.
          flipped.push({ prop, value: d.value.replace(/linear-gradient\(\s*to\s+(left|right)\b/g, (_, side) => `linear-gradient(to ${SIDE[side]}`), important: d.important })
        }
      })
      if (!flipped.length) continue
      const lower = rule.selectors.map((sel) => `[dir="rtl"] ${outsideLtrIslands(sel)}`) // resets: below the mirrored values
      const mirror = rule.selectors.map((sel) => `[dir="rtl"] ${outsideLtrIslands(sel, TIER2)}`)
      const next = rule.next()
      if (next?.type === 'rule' && (next.selectors.join(',') === mirror.join(',') || next.selectors.join(',') === lower.join(','))) continue // already mirrored (running the plugin twice must not stack copies)
      const setRule = new Rule({ selectors: mirror })
      setRule.__rtlDone = true
      for (const f of flipped) setRule.append({ prop: f.prop, value: f.value, important: f.important })
      const keep = resets.filter((r) => !flipped.some((f) => f.prop === r.prop && f.important === r.important)) // a side that is also SET by this rule needs no reset
      if (keep.length) {
        const resetRule = new Rule({ selectors: lower })
        resetRule.__rtlDone = true
        for (const r of keep) resetRule.append({ prop: r.prop, value: r.value, important: r.important })
        rule.after(resetRule)
        resetRule.after(setRule)
      } else rule.after(setRule)
    }
  },
})
plugin.postcss = true
export default plugin
