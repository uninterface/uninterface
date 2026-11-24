export type UiCheckboxValue = boolean | 'indeterminate'
export type UiRadioGroupValue = string | undefined
export type UiCheckboxGroupValue = string[]

export function checkboxValue(
  value: unknown,
  tristate: boolean,
): UiCheckboxValue {
  if (typeof value === 'boolean' || (tristate && value === 'indeterminate'))
    return value
  throw new Error(
    'UiCheckbox requires a boolean raw value, or indeterminate in tristate mode.',
  )
}
export function choiceKeys(value: unknown, multiple: boolean): string[] {
  if (!multiple) {
    if (value === undefined) return []
    if (typeof value === 'string') return [value]
    throw new Error(
      'Single-choice editors require a string or undefined raw value.',
    )
  }
  if (
    !Array.isArray(value) ||
    value.some((key) => typeof key !== 'string') ||
    new Set(value).size !== value.length
  )
    throw new Error(
      'UiCheckboxGroup requires a duplicate-free string array raw value.',
    )
  return value
}
