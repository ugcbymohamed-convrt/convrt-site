/* CREATOR-AWARE ORDER for the translated video libraries (Creator Showcase, UGC galleries): the same creator is not shown twice in a row, nor twice inside one visible row, whenever the pool allows.

   Deterministic and stable (no randomness: the same input always gives the same order; it never reshuffles between visits). Every video is kept (nothing is dropped, only reordered).
   Applied AFTER category filtering, so a filtered view is spread too, and BEFORE "Show more" slices the list, so every page of results is spread.

   Method: for each position take, among the creators NOT in the last `window - 1` placed (a visible row is `window` cards wide), the one with the most videos still to place (so a prolific creator such as the
   founder is spread early instead of stranded at the end), and that creator's first video in source order. When every remaining creator is in the window (a pool with too few creators) the window shrinks until one
   qualifies, so repetition is as far apart as the pool allows and never back to back unless one creator is all that is left. English is untouched:
   it keeps its hand-set DISPLAY_ORDER (portfolio.js); callers only use this for other languages.
   `creatorOf` is the verified opaque creator id (`creatorId`), never a guess from titles. */
export function spreadCreators(items, { window = 4, creatorOf = (i) => i.creatorId } = {}) {
  const left = items.slice()
  const out = []
  // Could the `n` videos still to place (counts per creator in `rem`) be ordered with no creator back to back, given the creator just placed was `last`? (the standard feasibility test)
  const feasible = (rem, n, last) => { for (const [c, r] of rem) { if (r > Math.ceil(n / 2)) return false; if (n % 2 === 1 && r === (n + 1) / 2 && c === last) return false } return true }
  while (left.length) {
    const remaining = new Map(); left.forEach((i) => remaining.set(creatorOf(i), (remaining.get(creatorOf(i)) ?? 0) + 1))
    // candidate creators, most videos left first (ties: source order of their first video)
    const order = [...remaining.keys()].sort((x, y) => remaining.get(y) - remaining.get(x) || left.findIndex((i) => creatorOf(i) === x) - left.findIndex((i) => creatorOf(i) === y))
    let pick = null
    // the widest window that still leaves an arrangement possible; the window shrinks (down to 2 = only "not back to back") when the pool is too small for a wide one
    for (let w = window; w >= 2 && pick === null; w--) {
      const recent = new Set(out.slice(-(w - 1)).map(creatorOf))
      pick = order.find((c) => {
        if (recent.has(c)) return false
        const rem = new Map(remaining); rem.set(c, rem.get(c) - 1)
        return feasible(rem, left.length - 1, c)
      }) ?? null
    }
    if (pick === null) pick = order.find((c) => c !== creatorOf(out.at(-1) ?? {})) ?? order[0] // one creator left (or an unavoidable repeat): nothing better exists
    const k = left.findIndex((i) => creatorOf(i) === pick)
    out.push(...left.splice(k, 1))
  }
  return out
}
