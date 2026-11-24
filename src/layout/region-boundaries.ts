import { requireUiText, type UiTextSource } from '../text/source'
import type { UiLayoutFraming } from '../presentation/layout-framing'
import type { UiRegionLayoutProps } from './regions'
import { regionNames } from './regions'

export type UiRegionName = (typeof regionNames)[number]
export interface UiRegionResizeBoundary {
  /** Ordered adjacent regions. The first region's percentage of their combined allocation is adjusted. */
  readonly between: readonly [UiRegionName, UiRegionName]
  readonly label: UiTextSource
  /** Percentage limits within this pair; defaults 10 and 90. No collapsing. */
  readonly min?: number
  readonly max?: number
}
export function resolveResizeBoundaries(
  props: UiRegionLayoutProps,
  names: readonly UiRegionName[],
  division: readonly (number | 'content')[],
  minimum: readonly number[] = [],
) {
  const boundaries = props.resizeBoundaries ?? []
  if (!Array.isArray(boundaries as unknown))
    throw new Error('UiRegionLayout: resizeBoundaries must be an array.')
  const seen = new Set<string>()
  const active = boundaries.flatMap((boundary) => {
    if (
      !boundary ||
      !Array.isArray(boundary.between) ||
      boundary.between.length !== 2
    )
      throw new Error(
        'UiRegionLayout: resize boundaries require two ordered regions.',
      )
    const [first, second] = boundary.between
    if (
      !regionNames.includes(first) ||
      !regionNames.includes(second) ||
      regionNames.indexOf(first) >= regionNames.indexOf(second)
    )
      throw new Error(
        'UiRegionLayout: resize boundaries require two ordered known regions.',
      )
    const key = `${first}:${second}`
    if (seen.has(key))
      throw new Error('UiRegionLayout: duplicate resize boundary.')
    seen.add(key)
    const min = boundary.min ?? 10
    const max = boundary.max ?? 90
    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      min <= 0 ||
      max >= 100 ||
      min >= max
    )
      throw new Error(
        'UiRegionLayout: resize limits require 0 < min < max < 100.',
      )
    const label = requireUiText(
      boundary.label,
      'UiRegionLayout: a resize boundary requires a meaningful label.',
    )
    const index = names.indexOf(first)
    const next = names.indexOf(second)
    if (index < 0 || next < 0) return []
    if (next !== index + 1)
      throw new Error('UiRegionLayout: only adjacent regions can be resized.')
    const a = division[index]
    const b = division[next]
    if (typeof a !== 'number' || typeof b !== 'number')
      throw new Error(
        'UiRegionLayout: resizable regions require numeric division shares.',
      )
    const value = (100 * a) / (a + b)
    if (value < min - 1e-8 || value > max + 1e-8)
      throw new Error(
        'UiRegionLayout: initial split must respect resize limits.',
      )
    return [{ key, first, second, label, min, max, value }]
  })
  return active.map((boundary) => {
    const total =
      (division[names.indexOf(boundary.first)] as number) +
      (division[names.indexOf(boundary.second)] as number)
    // Each share is affine in the moving pair's first fraction x: slope*x + offset.
    const share = (name: UiRegionName): readonly [number, number] =>
      name === boundary.first
        ? [total, 0]
        : name === boundary.second
          ? [-total, total]
          : [0, division[names.indexOf(name)] as number]
    let low = Math.max(
      boundary.min / 100,
      (minimum[names.indexOf(boundary.first)] ?? 0) / total,
    )
    let high = Math.min(
      boundary.max / 100,
      1 - (minimum[names.indexOf(boundary.second)] ?? 0) / total,
    )
    const constrain = (slope: number, offset: number) => {
      // Require slope*x + offset >= 0.
      if (slope > 0) low = Math.max(low, -offset / slope)
      else if (slope < 0) high = Math.min(high, -offset / slope)
    }
    for (const other of active) {
      if (other.key === boundary.key) continue
      const [as, ac] = share(other.first)
      const [bs, bc] = share(other.second)
      const min = other.min / 100
      const max = other.max / 100
      constrain((1 - min) * as - min * bs, (1 - min) * ac - min * bc)
      constrain(max * bs - (1 - max) * as, max * bc - (1 - max) * ac)
    }
    // A valid current allocation is always feasible; absorb floating-point endpoint noise.
    return {
      ...boundary,
      min: Math.min(boundary.value, low * 100),
      max: Math.max(boundary.value, high * 100),
    }
  })
}

/** Apply a request against current constraints, preserving all nonparticipating shares. */
export function resizeRegionBoundary(
  props: UiRegionLayoutProps,
  names: readonly UiRegionName[],
  division: readonly (number | 'content')[],
  key: string,
  value: number,
  minimum: readonly number[] = [],
): (number | 'content')[] {
  const shares = [...division]
  if (!Number.isFinite(value)) return shares
  const boundary = resolveResizeBoundaries(props, names, shares, minimum).find(
    (entry) => entry.key === key,
  )
  if (!boundary) return shares
  const first = names.indexOf(boundary.first)
  const second = names.indexOf(boundary.second)
  const total = (shares[first] as number) + (shares[second] as number)
  const fraction = Math.min(boundary.max, Math.max(boundary.min, value)) / 100
  shares[first] = total * fraction
  shares[second] = total - (shares[first] as number)
  return shares
}

/** Raised treatment belongs only to shared edges facing a lower neighbouring surface. */
export function resolveRegionFraming(
  names: readonly UiRegionName[],
  presentation: UiLayoutFraming,
  layers: Record<UiRegionName, number>,
) {
  const isRaised = (name: UiRegionName) =>
    presentation.regions?.[name]?.elevation === 'raised'
  const regions = Object.fromEntries(
    names.map((name, index) => {
      const raised = isRaised(name)
      const raisedEdges: ('before' | 'after')[] = []
      for (const [edge, neighbour] of [
        ['before', names[index - 1]],
        ['after', names[index + 1]],
      ] as const) {
        if (
          raised &&
          neighbour &&
          layers[name] >= layers[neighbour] &&
          (!isRaised(neighbour) || layers[name] > layers[neighbour])
        )
          raisedEdges.push(edge)
      }
      return [name, { raised, raisedEdges }]
    }),
  )
  return {
    separators: presentation.separators === 'visible',
    regions,
    boundaries: names.slice(0, -1).map((first, index) => {
      const second = names[index + 1]!
      return {
        first,
        second,
        role: first === 'start' ? ('start' as const) : ('end' as const),
        separator: presentation.separators === 'visible',
        raised: regions[first]!.raisedEdges.includes('after')
          ? first
          : regions[second]!.raisedEdges.includes('before')
            ? second
            : undefined,
      }
    }),
  }
}
