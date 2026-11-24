import type { UiSelectOption } from '../backend'

export type UiMultiSelectValue = string[]

export function multiSelectKeys(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.some((key) => typeof key !== 'string') ||
    new Set(value).size !== value.length
  )
    throw new Error(
      'UiMultiSelect requires a duplicate-free string array raw value.',
    )
  return value
}

/** Validate additions and preserve locked members without silently pruning retained keys. */
export function reconcileMultiSelection(
  current: readonly string[],
  requested: readonly string[],
  candidates: readonly UiSelectOption[],
): string[] {
  multiSelectKeys(requested)
  const eligible = new Map(candidates.map((option) => [option.value, option]))
  if (
    requested.some(
      (key) =>
        !current.includes(key) &&
        (!eligible.has(key) || eligible.get(key)!.disabled),
    )
  )
    return [...current]
  const wanted = new Set(requested)
  const retained = current.filter(
    (key) => wanted.has(key) || eligible.get(key)?.disabled,
  )
  return [...retained, ...requested.filter((key) => !current.includes(key))]
}
