/** Presentation of allocation boundaries, independent of their content. */
export interface UiLayoutFraming {
  readonly separators?: 'none' | 'visible'
  readonly regions?: Readonly<
    Record<string, { readonly elevation?: 'flat' | 'raised' }>
  >
}

export function isLayoutFraming(value: unknown): value is UiLayoutFraming {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const framing = value as UiLayoutFraming
  if (
    Object.keys(framing).some((key) => !['separators', 'regions'].includes(key))
  )
    return false
  if (
    framing.separators !== undefined &&
    !['none', 'visible'].includes(framing.separators)
  )
    return false
  if (framing.regions === undefined) return true
  if (
    !framing.regions ||
    typeof framing.regions !== 'object' ||
    Array.isArray(framing.regions)
  )
    return false
  return Object.entries(framing.regions).every(
    ([name, treatment]) =>
      Boolean(name.trim()) &&
      treatment &&
      typeof treatment === 'object' &&
      !Array.isArray(treatment) &&
      Object.keys(treatment).every((key) => key === 'elevation') &&
      (treatment.elevation === undefined ||
        ['flat', 'raised'].includes(treatment.elevation)),
  )
}

export function resolveLayoutFraming(
  value: UiLayoutFraming = {},
): UiLayoutFraming {
  if (!isLayoutFraming(value))
    throw new Error('uiLayoutFraming: unsupported framing request.')
  return Object.freeze({
    separators: value.separators ?? 'none',
    regions: Object.freeze(
      Object.fromEntries(
        Object.entries(value.regions ?? {})
          .filter(([, treatment]) => treatment.elevation === 'raised')
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name]) => [
            name,
            Object.freeze({ elevation: 'raised' as const }),
          ]),
      ),
    ),
  })
}
