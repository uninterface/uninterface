import type { UiRegionLayoutProps } from './regions'
import type { UiRegionName } from './region-boundaries'

/** Fit measured minima without violating the declared adjacent-pair ratios.
 * Geometry stays in the view; this function owns allocation arithmetic only.
 */
export function fitVerticalResize(
  props: UiRegionLayoutProps,
  names: readonly UiRegionName[],
  shares: readonly (number | 'content')[],
  available: number,
  measured: Readonly<Record<string, number>>,
) {
  const numeric = shares.map((share) => (typeof share === 'number' ? share : 0))
  const total = numeric.reduce((sum, share) => sum + share, 0)
  const minimum = names.map((name, i) => (numeric[i] ? measured[name] || 0 : 0))
  // Ratios propagate a minimum to neighbours. With at most three regions,
  // every non-repeating path has at most two edges. Valid declarations have
  // no amplifying cycles (their initial division already satisfies them).
  for (let pass = 0; pass < names.length; pass++) {
    for (const boundary of props.resizeBoundaries ?? []) {
      const a = names.indexOf(boundary.between[0])
      const b = names.indexOf(boundary.between[1])
      if (a < 0 || b !== a + 1 || !numeric[a] || !numeric[b]) continue
      const low = (boundary.min ?? 10) / 100
      const high = (boundary.max ?? 90) / 100
      minimum[a] = Math.max(minimum[a], (minimum[b] * low) / (1 - low))
      minimum[b] = Math.max(minimum[b], (minimum[a] * (1 - high)) / high)
    }
  }
  const needed = minimum.reduce((sum, value) => sum + value, 0)
  const extent = Math.max(available, needed)
  if (!total || extent <= 0) return undefined
  const fits = minimum.every(
    (value, i) => (numeric[i] * available) / total + 0.01 >= value,
  )
  // Keep proportional sizes for unconstrained regions; freeze only regions
  // that would fall below their minima and redistribute among the rest.
  // The result is max(minimum[i], scale * numeric[i]). Both vectors satisfy
  // the pair-ratio inequalities, and their componentwise maximum does too.
  let sizes = fits
    ? numeric.map((share) => (share * available) / total)
    : numeric.map(() => 0)
  if (!fits) {
    let pending = numeric.flatMap((share, i) => (share > 0 ? [i] : []))
    while (pending.length) {
      const remaining = extent - sizes.reduce((sum, size) => sum + size, 0)
      const weight = pending.reduce((sum, i) => sum + numeric[i], 0)
      const clamped = pending.filter(
        (i) => (numeric[i] * remaining) / weight < minimum[i],
      )
      if (!clamped.length) {
        for (const i of pending) sizes[i] = (numeric[i] * remaining) / weight
        break
      }
      for (const i of clamped) sizes[i] = minimum[i]
      pending = pending.filter((i) => !clamped.includes(i))
    }
  }
  // A disconnected opaque numeric region has no measured floor. It still
  // cannot collapse to zero when measured neighbours exhaust the host.
  if (sizes.some((size, i) => numeric[i] > 0 && size <= 0)) {
    const expanded = Math.max(
      extent,
      ...minimum.map((value, i) =>
        numeric[i] ? (value * total) / numeric[i] : 0,
      ),
    )
    sizes = numeric.map((share) => (share * expanded) / total)
  }
  const allocated = sizes.reduce((sum, value) => sum + value, 0)
  return {
    shares: shares.map((share, i) =>
      typeof share === 'number' ? (sizes[i] * total) / allocated : share,
    ),
    minimumShares: minimum.map((value) => (value * total) / allocated),
    sizes: Object.fromEntries(
      names
        .filter((_, i) => numeric[i])
        .map((name) => [name, sizes[names.indexOf(name)]]),
    ),
    overflow: allocated > available + 0.5,
  }
}
