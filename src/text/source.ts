/** Plain text supplied directly or synchronously when presentation reads it. */
export type UiTextSource = string | (() => string)

export function resolveUiText(source: UiTextSource): string
export function resolveUiText(
  source: UiTextSource | undefined,
): string | undefined
export function resolveUiText(
  source: UiTextSource | undefined,
): string | undefined {
  if (source === undefined) return undefined
  const text = typeof source === 'function' ? source() : source
  if (typeof text !== 'string')
    throw new TypeError('A UiTextSource must resolve to a string.')
  return text
}

export function requireUiText(source: UiTextSource, message: string): string {
  const text = resolveUiText(source)
  if (typeof text !== 'string' || !text.trim()) throw new Error(message)
  return text
}
